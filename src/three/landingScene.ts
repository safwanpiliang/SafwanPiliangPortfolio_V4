import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { createNature, heightAt, rng } from './nature'
import { createComposer, paperBackground } from './post'
import { createFallingLeaves } from './leaves'
import { createProps } from './props'
import {
  createMorphPoints,
  createRing,
  RING,
  sampleMesh,
  type PointSet,
  type RingCard,
} from './showcase'
import { DAY, SEASON, styledMat, styleUniforms, type DissolveGroup } from './style'

// Landing scene: Arumbae Neira grass and render style on one hill, with the Chibi character sitting on top.
// Scrolling turns the camera around the character while the hill breaks into particles that re-form as section 2:
// the same character standing, with a ring of project cards around it.

const MODEL = '/models/chibi-sitting.glb'
const STAND = '/models/chibi-standup.glb' // Mixamo stand-up-from-the-ground on the same skeleton (animation only)
const IDLE = '/models/chibi-warrior-idle.glb' // Mixamo Warrior Idle, looped once standing (animation only)
const IDLE_FADE = 0.6 // s, blend from the end of the stand-up into the idle
// Standing (bind pose) height in metres. Bigger than the Arumbae player (1.75) so it reads over the grass, as in the reference.
const CHARACTER_HEIGHT = 4.2
const SEAT = new THREE.Vector3(0, 0, 0.4)
// Trees near the left and right edges (a nutmeg on the left, a leafy tree on the right) (off to the side so they don't cover the copy); a bush and rocks in front of the hill
const PROPS = {
  trees: [
    { kind: 'nutmeg' as const, x: -9.4, z: 6.5, ry: 4.7, s: 1.1 },
    { kind: 'leafy' as const, x: 8.6, z: 7.5, ry: 2.1, s: 1.3 },
  ],
  bushes: [
    { x: -4.4, z: 3.0, s: 1.8 },
    { x: 4.6, z: 4.4, s: 1.4 },
  ],
  rocks: [
    { model: 'batu-1' as const, x: -2.6, z: 4.9, ry: 1.2, s: 2.6 },
    { model: 'batu-2' as const, x: 3.7, z: 3.4, ry: 0.3, s: 3.4 },
    { model: 'batu-1' as const, x: 4.9, z: 2.9, ry: 2.4, s: 1.8 },
  ],
}

// Scroll transition. Camera: turns `turn` around the character and moves in close (`end`); the horizontal field of view
// at the end is fixed so the ring fills the width on any screen. Phases are ranges of scroll progress (0..1).
const SHOWCASE = {
  turn: Math.PI,
  start: { height: 5.0, aim: 3.6 }, // camera height and aim height above the seat
  // close-up on the character as the particles form it (still sitting on the ground), reached at progress `at`; the
  // camera then pulls back to `end` while the cards fly in and the ring turns
  close: { dist: 6.5, height: 2.6, aim: 1.6, fov: 34, at: 0.45, overlap: 0.3 },
  end: { dist: 9.5, height: 3.4, aim: 3.7, hfov: 84 }, // aim near the head: the ring sits under the copy, the feet and their shadow stay in frame
  dissolveA: [0.03, 0.24], // landing breaks up
  show: [0.03, 0.14, 0.36, 0.48], // particles fade in, then out
  morph: [0.12, 0.4], // particles travel from the landing onto the character
  dissolveB: [0.34, 0.46], // the character forms
  // the cards run in like a train along the ring, left to right: over this range the ring turns `spin` and slows to a
  // stop, and each card appears (growing in over `grow` rad) once it has come round past the point behind the camera
  cards: [0.42, 1],
  spin: Math.PI * 2,
  grow: 0.6,
  points: { count: 16000, lite: 6500, size: 0.075 },
}
// sRGB palettes for landing particles: summer / autumn (they follow the season toggle)
const PAL = {
  hill: [
    ['#7da347', '#93b450', '#6a9440'],
    ['#e3a33a', '#d98a2e', '#c9702a', '#e8b54a'],
  ],
  leaf: [
    ['#4f7d36', '#5f8f3c', '#46702f'],
    ['#c8361c', '#d9541a', '#b3301f', '#e0702a'],
  ],
  character: '#f2f1ee',
}

/** Character material with softer shadows than the rest (Arumbae softMat): shadow colour pulled towards white, wider falloff. */
function softMat(params: THREE.MeshLambertMaterialParameters, group: DissolveGroup) {
  const mat = styledMat({ ...params, userData: { group } }, (s) => {
    const lit = 'float lit = smoothstep(uShade.x, uShade.y,',
      shade = 'outgoingLight = mix(base * uShadowColor,'
    if (!s.fragmentShader.includes(lit) || !s.fragmentShader.includes(shade))
      throw new Error('softMat: styledMat shading code changed.')
    s.fragmentShader = s.fragmentShader
      .replace(lit, 'float lit = smoothstep(uShade.x - 0.25, uShade.y + 0.40,')
      .replace(shade, 'outgoingLight = mix(base * mix(uShadowColor, vec3(1.0), 0.60),')
  })
  mat.customProgramCacheKey = () => `style-soft-character-${group}`
  return mat
}

export type Season = 'summer' | 'autumn'
export type { RingCard }
export type LandingScene = {
  dispose: () => void
  setActive: (on: boolean) => void
  /**
   * Scroll transition to section 2, 0 → 1: the camera turns around the character while the landing breaks into
   * particles that re-form as the standing character and the ring of project cards.
   */
  setProgress: (p: number) => void
  /** Sweep the season over the trees, bushes, grass and ground as a wave from the character (instant for reduced motion). */
  setSeason: (season: Season) => void
  /** Card under the pointer (normalised device coords), highlighted; undefined off the cards or before the ring is formed. */
  pick: (x: number, y: number) => RingCard | undefined
  /** Reduced motion: a still image of the finished showcase (the canvas keeps showing the landing). */
  snapshot: () => string
}

/**
 * Mounts the scene into `canvas`. `lite` = phones: fewer blades and particles, smaller shadow map, pixel ratio 1.
 * `still` = reduced motion: renders once, no wind or animation. Resolves once the first frame is drawn.
 */
export async function createLandingScene(
  canvas: HTMLCanvasElement,
  { lite = false, still = false, cards = [] as RingCard[] } = {},
): Promise<LandingScene> {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // the composer renders off screen; FXAA smooths the edges
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(devicePixelRatio, lite ? 1 : 1.5))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.NoToneMapping // colours out as authored, like Arumbae

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0xffffff, DAY.fogDensity) // colour comes from fogColorAt()
  scene.background = paperBackground()
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 200)

  const sun = new THREE.DirectionalLight(0xffffff, Math.PI) // styledMat expects one white light at PI
  sun.position.set(...DAY.sunDir).multiplyScalar(30)
  sun.castShadow = true
  sun.shadow.mapSize.setScalar(lite ? 1024 : 2048)
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 80 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.06
  scene.add(sun, sun.target)

  const time = { value: 0 }
  const seat = SEAT.clone().setY(heightAt(SEAT.x, SEAT.z))
  styleUniforms.uSeasonOrigin.value.copy(seat) // the season wave spreads out from the character
  styleUniforms.uDissolveA.value = 0
  styleUniforms.uDissolveB.value = 1
  const landing = new THREE.Group(),
    showcase = new THREE.Group()
  scene.add(landing, showcase)
  landing.add(createNature({ blades: lite ? 30000 : 90000, flowers: lite ? 250 : 600, seat, time }))
  const props = await createProps({ ...PROPS, time }, rng(20261122))
  landing.add(props)
  // autumn falling leaves (motion only, so none for reduced motion)
  if (!still)
    landing.add(
      createFallingLeaves({
        trees: PROPS.trees,
        count: lite ? 28 : 60,
        time,
        rand: rng(20261123),
      }),
    )

  // Character: plain white Chibi with its own colours, sitting idle on the hill top, facing the camera
  const loader = new GLTFLoader()
  const [gltf, standUp, idle] = await Promise.all([
    loader.loadAsync(MODEL),
    loader.loadAsync(STAND),
    loader.loadAsync(IDLE),
  ])
  /** Copy of the Chibi playing `clip`, scaled to CHARACTER_HEIGHT with its lowest point on the seat. */
  function character(clip: THREE.AnimationClip, group: DissolveGroup) {
    const model = group === 'a' ? gltf.scene : SkeletonUtils.clone(gltf.scene)
    const meshes: THREE.SkinnedMesh[] = []
    model.traverse((o) => {
      const mesh = o as THREE.SkinnedMesh
      if (!mesh.isMesh) return
      mesh.castShadow = mesh.receiveShadow = true
      mesh.frustumCulled = false // skinned bounds don't follow the animation
      const src = mesh.material as THREE.MeshStandardMaterial
      mesh.material = softMat({ map: src.map, color: src.color }, group)
      meshes.push(mesh)
    })
    model.position.set(0, 0, 0) // a clone copies the sitting placement
    model.scale.setScalar(1)
    const bind = new THREE.Box3().setFromObject(model) // bind pose (standing) bounds
    model.scale.setScalar(CHARACTER_HEIGHT / (bind.max.y - bind.min.y))
    const mixer = new THREE.AnimationMixer(model)
    mixer.clipAction(clip).play()
    mixer.update(0)
    model.updateMatrixWorld(true)
    const posed = new THREE.Box3().setFromObject(model, true) // posed bounds: rest the lowest point on the ground
    model.position.set(seat.x, seat.y - posed.min.y, seat.z)
    model.updateMatrixWorld(true)
    return { model, mixer, meshes }
  }
  const sitting = character(gltf.animations[0], 'a')
  landing.add(sitting.model)
  const standing = character(standUp.animations[0], 'b') // forms sitting on the ground, then stands up once and stays
  standing.model.rotation.y = SHOWCASE.turn // faces the camera once it has come round
  const standAction = standing.mixer.existingAction(standUp.animations[0])!
  standAction.setLoop(THREE.LoopOnce, 1).clampWhenFinished = true
  standAction.paused = true // held on its first frame until the showcase has formed
  // once up, it blends into a looping idle so it doesn't freeze
  const idleAction = standing.mixer.clipAction(idle.animations[0])
  standing.mixer.addEventListener('finished', (e) => {
    if (e.action !== standAction || still) return
    idleAction.reset().play()
    standAction.crossFadeTo(idleAction, IDLE_FADE, false)
  })
  if (still) {
    standAction.time = standUp.animations[0].duration // reduced motion: shown already standing
    standing.mixer.update(0)
  }
  standing.model.updateMatrixWorld(true)
  showcase.add(standing.model)
  // Soft contact shadow under the standing character (the showcase has no ground to catch the sun's shadow)
  const blob = (() => {
    const cv = document.createElement('canvas')
    cv.width = cv.height = 128
    const ctx = cv.getContext('2d')!
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.45, 'rgba(255,255,255,0.55)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        color: 0x2a2d3a,
        map: new THREE.CanvasTexture(cv), // white with a soft alpha falloff, tinted by color
        transparent: true,
        depthWrite: false,
        fog: false,
      }),
    )
    mesh.rotation.x = -Math.PI / 2
    mesh.scale.set(3.4, 2.2, 1) // wider than deep, like the feet apart
    mesh.position.set(seat.x, seat.y + 0.02, seat.z)
    mesh.renderOrder = -1
    return mesh
  })()
  showcase.add(blob)

  const ring = createRing(cards)
  ring.group.position
    .set(Math.sin(SHOWCASE.turn), 0, Math.cos(SHOWCASE.turn))
    .multiplyScalar(RING.offset)
    .add(seat)
  ring.group.updateMatrixWorld(true)
  showcase.add(ring.group)

  // Particles: sample the landing surfaces (a) and the showcase (b)
  const rand = rng(20261124)
  const N = lite ? SHOWCASE.points.lite : SHOWCASE.points.count
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]
  const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) // sRGB 0..1
  const a: PointSet = { pos: [], col: [], alt: [] }
  const addA = (pos: number[], summer: () => string, autumn: () => string) => {
    a.pos.push(...pos)
    for (let i = 0; i < pos.length / 3; i++) {
      a.col.push(...hex(summer()))
      a.alt!.push(...hex(autumn()))
    }
  }
  const sitPts: number[] = []
  for (const m of sitting.meshes)
    sampleMesh(m, Math.round((N * 0.16) / sitting.meshes.length), rand, sitPts)
  addA(
    sitPts,
    () => PAL.character,
    () => PAL.character,
  )
  const propMeshes: THREE.Mesh[] = []
  props.traverse((o) => (o as THREE.Mesh).isMesh && propMeshes.push(o as THREE.Mesh))
  for (const m of propMeshes) {
    const mat = m.material as THREE.MeshLambertMaterial
    const pts: number[] = []
    const leaf = Boolean(mat.userData?.leaf)
    sampleMesh(m, Math.round((N * (leaf ? 0.3 : 0.08)) / propMeshes.length), rand, pts)
    if (leaf)
      addA(
        pts,
        () => pick(PAL.leaf[0]),
        () => pick(PAL.leaf[1]),
      )
    else {
      const c = '#' + (mat.map ? '8f8b84' : mat.color.getHexString(THREE.SRGBColorSpace)) // rocks: plain stone grey
      addA(
        pts,
        () => c,
        () => c,
      )
    }
  }
  const hill: number[] = []
  while (hill.length / 3 + a.pos.length / 3 < N * 1.02) {
    const r = Math.sqrt(rand()) * 12,
      t = rand() * Math.PI * 2
    const x = seat.x + Math.sin(t) * r,
      z = seat.z + Math.cos(t) * r
    hill.push(x, heightAt(x, z) + 0.12, z)
  }
  addA(
    hill,
    () => pick(PAL.hill[0]),
    () => pick(PAL.hill[1]),
  )

  // the particles all gather on the character; the cards fly in afterwards
  const b: PointSet = { pos: [], col: [] }
  for (const m of standing.meshes)
    sampleMesh(m, Math.round(N / standing.meshes.length), rand, b.pos)
  for (let i = 0; i < b.pos.length / 3; i++) b.col.push(...hex(PAL.character))
  const morph = createMorphPoints(a, b, ring.group.position, rand)
  scene.add(morph.points)

  // Camera: slightly high viewpoint looking a little down on the hill (aim above the character leaves room for the
  // copy); the transition brings it round and in close, at the character's eye level
  const aim = new THREE.Vector3(),
    offset = new THREE.Vector3()
  const ss = THREE.MathUtils.smoothstep
  let progress = 0
  let ringRot = 0,
    introSpin = 0
  function apply() {
    const S = SHOWCASE
    const startDist = 26 * Math.max(1, 1.2 / camera.aspect) // narrow screens pull back so the hill still fills the width
    // One continuous move: the turn runs over the whole transition, and the pull-back starts before the approach has
    // finished (the two overlap by S.close.overlap), so the camera sweeps past the close-up without stopping
    const turn = THREE.MathUtils.smootherstep(progress, 0, 1),
      t1 = THREE.MathUtils.smootherstep(progress, 0, S.close.at + S.close.overlap / 2),
      t2 = THREE.MathUtils.smootherstep(progress, S.close.at - S.close.overlap / 2, 1)
    const endFov = THREE.MathUtils.radToDeg(
      2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(S.end.hfov / 2)) / camera.aspect),
    )
    // landing → close-up → end
    const via = (a: number, b: number, c: number) =>
      THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, t1), c, t2)
    camera.fov = via(26, S.close.fov, THREE.MathUtils.clamp(endFov, 30, 72))
    camera.updateProjectionMatrix()
    offset
      .set(
        0,
        via(S.start.height, S.close.height, S.end.height),
        via(startDist, S.close.dist, S.end.dist),
      )
      .applyAxisAngle(THREE.Object3D.DEFAULT_UP, turn * S.turn)
    camera.position.copy(seat).add(offset)
    camera.lookAt(aim.copy(seat).setY(seat.y + via(S.start.aim, S.close.aim, S.end.aim)))

    introSpin = S.spin * (1 - ss(progress, S.cards[0], S.cards[1])) ** 3
    ring.group.rotation.y = ringRot + introSpin
    const c = ring.group.position,
      gate = Math.atan2(camera.position.x - c.x, camera.position.z - c.z) // behind the camera, seen from the ring centre
    ring.meshes.forEach((m) => {
      const final = (m.userData.angle as number) + ringRot
      // how far the ring still turns after this card passes the gate (the ring turns towards smaller angles)
      const atGate = THREE.MathUtils.euclideanModulo(gate - final, Math.PI * 2)
      // once the ring has stopped every card is full size (one resting behind the camera comes round later)
      const grow = introSpin > 0 ? THREE.MathUtils.clamp((atGate - introSpin) / S.grow, 0, 1) : 1
      m.userData.flown = grow > 0
      m.visible = grow > 0 && (m.material as THREE.ShaderMaterial).userData.ready === true
      m.scale.setScalar(grow)
    })

    const dA = ss(progress, S.dissolveA[0], S.dissolveA[1]),
      dB = 1 - ss(progress, S.dissolveB[0], S.dissolveB[1]),
      show = ss(progress, S.show[0], S.show[1]) * (1 - ss(progress, S.show[2], S.show[3]))
    styleUniforms.uDissolveA.value = dA
    styleUniforms.uDissolveB.value = dB
    landing.visible = dA < 0.999
    showcase.visible = dB < 0.999
    morph.uniforms.uShow.value = show
    morph.uniforms.uMorph.value = ss(progress, S.morph[0], S.morph[1])
    morph.points.visible = show > 0.001
    ;(blob.material as THREE.MeshBasicMaterial).opacity = 0.45 * (1 - dB)
    // particle size in px per metre at distance 1
    morph.uniforms.uPx.value =
      (S.points.size * renderer.getDrawingBufferSize(tmpSize).y) /
      (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
  }
  const tmpSize = new THREE.Vector2()
  morph.uniforms.uMaxPx.value = 7 * renderer.getPixelRatio()
  const composer = createComposer(renderer, scene, camera)
  function resize() {
    const w = canvas.clientWidth,
      h = canvas.clientHeight
    renderer.setSize(w, h, false)
    composer.setPixelRatio(renderer.getPixelRatio())
    composer.setSize(w, h)
    camera.aspect = w / h
    apply()
    renderer.getDrawingBufferSize(styleUniforms.uFogRes.value)
  }
  resize()
  const ro = new ResizeObserver(() => {
    resize()
    if (still) composer.render()
  })
  ro.observe(canvas)

  const raycaster = new THREE.Raycaster(),
    ndc = new THREE.Vector2()
  let hovered: THREE.Mesh | undefined
  const formed = () => progress > 0.98 // cards in place

  const timer = new THREE.Timer()
  let active = true
  // starts in autumn (matches the toggle default in Landing.tsx); uAutumn moves towards the target at a steady rate
  let seasonTarget = (styleUniforms.uAutumn.value = 1)
  renderer.setAnimationLoop(
    still
      ? null
      : () => {
          if (!active) return
          timer.update()
          const dt = Math.min(timer.getDelta(), 0.1)
          time.value += dt
          morph.uniforms.uTime.value = time.value
          if (landing.visible) sitting.mixer.update(dt)
          const autumn = styleUniforms.uAutumn
          const step = dt / SEASON.duration
          autumn.value += THREE.MathUtils.clamp(seasonTarget - autumn.value, -step, step)
          // the character stands up once the showcase has formed; going back to the landing re-arms it
          if (styleUniforms.uDissolveB.value < 0.05 && standAction.paused && standAction.time === 0)
            standAction.paused = false
          else if (!showcase.visible && standAction.time > 0) {
            idleAction.stop()
            standAction.reset().setEffectiveWeight(1).paused = true
            standing.mixer.update(0)
          }
          if (showcase.visible) standing.mixer.update(dt)
          // the ring idles round once it has formed, and holds still under the pointer
          if (progress > 0.99 && !hovered) ringRot += dt * RING.spin
          ring.group.rotation.y = ringRot + introSpin
          for (const m of ring.meshes) {
            const mat = m.material as THREE.ShaderMaterial
            m.visible = m.userData.flown && mat.userData.ready === true // a cover that loads late still shows up
            const u = mat.uniforms.uHover
            u.value += ((m === hovered ? 1 : 0) - u.value) * Math.min(1, dt * 10)
          }
          composer.render()
        },
  )
  // Shaders compile in parallel; objects whose program isn't ready are skipped, so a single (still) frame could miss the
  // grass. Compile with everything visible so the showcase and particles are ready too.
  landing.visible = showcase.visible = morph.points.visible = true
  await renderer.compileAsync(scene, camera)
  apply()
  composer.render()

  return {
    setProgress(p) {
      progress = THREE.MathUtils.clamp(p, 0, 1)
      apply()
      if (!formed()) hovered = undefined
    },
    setSeason(season) {
      seasonTarget = season === 'autumn' ? 1 : 0
      if (still) {
        styleUniforms.uAutumn.value = seasonTarget
        composer.render()
      }
    },
    pick(x, y) {
      if (!formed()) return (hovered = undefined)
      raycaster.setFromCamera(ndc.set(x, y), camera)
      hovered = raycaster.intersectObjects(ring.meshes, false)[0]?.object as THREE.Mesh | undefined
      return hovered?.userData.card
    },
    snapshot() {
      const keep = progress
      progress = 1
      apply()
      composer.render()
      const url = canvas.toDataURL('image/webp', 0.9)
      progress = keep
      apply()
      composer.render()
      return url
    },
    setActive(on) {
      active = on
      timer.update() // drop the time spent paused
    },
    dispose() {
      renderer.setAnimationLoop(null)
      ro.disconnect()
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh
        mesh.geometry?.dispose()
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : mesh.material
            ? [mesh.material]
            : []
        for (const m of mats) {
          for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose()
          if ('uniforms' in m)
            for (const u of Object.values((m as THREE.ShaderMaterial).uniforms))
              if (u.value instanceof THREE.Texture) u.value.dispose()
          m.dispose()
        }
      })
      composer.dispose()
      renderer.dispose()
    },
  }
}
