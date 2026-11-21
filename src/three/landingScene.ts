import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createNature, heightAt, rng } from './nature'
import { createComposer, paperBackground } from './post'
import { createFallingLeaves } from './leaves'
import { createProps } from './props'
import { DAY, SEASON, styledMat, styleUniforms } from './style'

// Landing scene: Arumbae Neira grass and render style on one hill, with the Chibi character sitting on top.
// Static camera; only wind and the character's sitting idle move.

const MODEL = '/models/chibi-sitting.glb'
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

/** Character material with softer shadows than the rest (Arumbae softMat): shadow colour pulled towards white, wider falloff. */
function softMat(params: THREE.MeshLambertMaterialParameters) {
  const mat = styledMat(params, (s) => {
    const lit = 'float lit = smoothstep(uShade.x, uShade.y,',
      shade = 'outgoingLight = mix(base * uShadowColor,'
    if (!s.fragmentShader.includes(lit) || !s.fragmentShader.includes(shade))
      throw new Error('softMat: styledMat shading code changed.')
    s.fragmentShader = s.fragmentShader
      .replace(lit, 'float lit = smoothstep(uShade.x - 0.25, uShade.y + 0.40,')
      .replace(shade, 'outgoingLight = mix(base * mix(uShadowColor, vec3(1.0), 0.60),')
  })
  mat.customProgramCacheKey = () => 'style-soft-character'
  return mat
}

export type Season = 'summer' | 'autumn'
export type LandingScene = {
  dispose: () => void
  setActive: (on: boolean) => void
  /** Sweep the season over the trees, bushes, grass and ground as a wave from the character (instant for reduced motion). */
  setSeason: (season: Season) => void
}

/**
 * Mounts the scene into `canvas`. `lite` = phones: fewer blades, smaller shadow map, pixel ratio 1.
 * `still` = reduced motion: renders once, no wind or animation. Resolves once the first frame is drawn.
 */
export async function createLandingScene(
  canvas: HTMLCanvasElement,
  { lite = false, still = false } = {},
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
  scene.add(createNature({ blades: lite ? 30000 : 90000, flowers: lite ? 250 : 600, seat, time }))
  scene.add(await createProps({ ...PROPS, time }, rng(20261122)))
  // autumn falling leaves (motion only, so none for reduced motion)
  if (!still)
    scene.add(
      createFallingLeaves({
        trees: PROPS.trees,
        count: lite ? 40 : 90,
        time,
        rand: rng(20261123),
      }),
    )

  // Character: plain white Chibi with its own colours, sitting idle on the hill top, facing the camera
  const gltf = await new GLTFLoader().loadAsync(MODEL)
  const model = gltf.scene
  model.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = mesh.receiveShadow = true
    mesh.frustumCulled = false // skinned bounds don't follow the animation
    const src = mesh.material as THREE.MeshStandardMaterial
    mesh.material = softMat({ map: src.map, color: src.color })
  })
  const bind = new THREE.Box3().setFromObject(model) // bind pose (standing) bounds
  model.scale.multiplyScalar(CHARACTER_HEIGHT / (bind.max.y - bind.min.y))
  const mixer = new THREE.AnimationMixer(model)
  mixer.clipAction(gltf.animations[0]).play()
  mixer.update(0)
  model.updateMatrixWorld(true)
  const posed = new THREE.Box3().setFromObject(model, true) // sitting pose bounds: rest the lowest point on the ground
  model.position.set(seat.x, seat.y - posed.min.y, seat.z)
  scene.add(model)

  // Slightly high viewpoint looking a little down on the hill; the aim sits above the character to leave room for the copy
  const aim = seat.clone().add(new THREE.Vector3(0, 3.6, 0))
  const composer = createComposer(renderer, scene, camera)
  function resize() {
    const w = canvas.clientWidth,
      h = canvas.clientHeight
    renderer.setSize(w, h, false)
    composer.setPixelRatio(renderer.getPixelRatio())
    composer.setSize(w, h)
    camera.aspect = w / h
    // narrow screens pull back so the hill still fills the width
    const dist = 26 * Math.max(1, 1.2 / camera.aspect)
    camera.position.set(0, seat.y + 5.0, seat.z + dist)
    camera.lookAt(aim)
    camera.updateProjectionMatrix()
    renderer.getDrawingBufferSize(styleUniforms.uFogRes.value)
  }
  resize()
  const ro = new ResizeObserver(() => {
    resize()
    if (still) composer.render()
  })
  ro.observe(canvas)

  const timer = new THREE.Timer()
  let active = true
  let seasonTarget = 0 // uAutumn moves towards this at a steady rate; the wave shape lives in the shader
  renderer.setAnimationLoop(
    still
      ? null
      : () => {
          if (!active) return
          timer.update()
          const dt = Math.min(timer.getDelta(), 0.1)
          time.value += dt
          mixer.update(dt)
          const autumn = styleUniforms.uAutumn
          const step = dt / SEASON.duration
          autumn.value += THREE.MathUtils.clamp(seasonTarget - autumn.value, -step, step)
          composer.render()
        },
  )
  // Shaders compile in parallel; objects whose program isn't ready are skipped, so a single (still) frame could miss the grass
  await renderer.compileAsync(scene, camera)
  composer.render()

  return {
    setSeason(season) {
      seasonTarget = season === 'autumn' ? 1 : 0
      if (still) {
        styleUniforms.uAutumn.value = seasonTarget
        composer.render()
      }
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
          m.dispose()
        }
      })
      composer.dispose()
      renderer.dispose()
    },
  }
}
