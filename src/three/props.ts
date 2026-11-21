import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { heightAt } from './nature'
import { styledMat } from './style'

// Trees, bushes and rocks for the landing hill, ported from the Arumbae Neira demo (src/world/props.js, assets.js).
// landing-kit.glb = tree_leafy copied out of the demo's banda-kit.glb (vertex colours + UVs for the baked bark).
// Rocks: batu-1.glb / batu-2.glb from NUSAVERSE (one textured low-poly rock each, repeated in the file; only the mesh is used).

type Shader = THREE.WebGLProgramParametersWithUniforms
type Clump = [x: number, y: number, z: number, radius: number, squash?: number]

// Foliage look (Arumbae config.foliage). grad = vAlign range from shadow to lit colour; highlight/hlTint = sun-side sheen;
// shadow = how dark cast shadows get on leaves; floor = darkest lit value.
const F = {
  planes: 230,
  planeSize: 0.78,
  alphaTest: 0.35,
  sway: 0.012,
  flutter: 0.14,
  jitter: [0.025, 0.08, 0.07],
  grad: [-0.6, 1.0],
  highlight: [0.35, 1.1],
  hlTint: [1.3, 1.22, 0.8],
  shadow: 0.6,
  floor: 0.32,
  tipClump: [0.8, 0.85],
}
const TREE = {
  palettes: [
    [0xbcd140, 4],
    [0x92b840, 4],
    [0x6f9f4c, 3],
    [0xeab634, 3],
  ] as [number, number][],
  clumps: [
    [-2.0, 5.5, -0.1, 1.36, 0.85],
    [2.6, 4.9, 1.1, 1.24, 0.85],
    [0.9, 5.7, 1.3, 1.18, 0.85],
    [0.5, 6.4, -0.5, 1.42, 0.85],
    [-0.4, 4.6, 0.3, 1.0, 0.85],
  ] as Clump[],
  // branch tips of the tree_leafy trunk (banda-kit-tips.json): a small clump goes on any tip not already covered
  tips: [
    [2.579, 4.765, 1.138],
    [0.606, 5.781, -0.418],
    [0.835, 5.514, 1.268],
    [-2.09, 5.444, -0.205],
    [-0.277, 4.33, 0.304],
    [-0.035, 4.895, -0.441],
  ],
}
const BUSH = {
  palettes: [
    [0xb8cf44, 3],
    [0x8db444, 4],
    [0x6a9a50, 3],
    [0xe6bc3a, 1],
  ] as [number, number][],
  clumps: [
    [0, 0.45, 0, 0.8, 0.8],
    [0.55, 0.35, 0.2, 0.55, 0.8],
    [-0.45, 0.3, -0.3, 0.5, 0.8],
  ] as Clump[],
}
const BARK_BOOST = 2.2 // the baked bark texture is darkish

/** Sway in the vertex shader: the higher above `base`, the further it moves. */
function windMat(
  time: { value: number },
  amp: number,
  base: number,
  params: THREE.MeshLambertMaterialParameters,
  more?: (s: Shader) => void,
) {
  return styledMat(params, (s) => {
    s.uniforms.uTime = time
    s.vertexShader =
      'uniform float uTime;\n' +
      s.vertexShader.replace(
        '#include <begin_vertex>',
        /* glsl */ `#include <begin_vertex>
      vec4 wp = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
      float wk = max(position.y - ${base.toFixed(2)}, 0.0) * ${amp.toFixed(3)};
      transformed.x += (sin(uTime * 1.6 + wp.x * 0.35 + wp.z * 0.27) + 0.5 * sin(uTime * 2.7 + wp.x * 0.9)) * wk;
      transformed.z += cos(uTime * 1.3 + wp.z * 0.4) * wk * 0.6;`,
      )
    more?.(s)
  })
}

/** Brush texture: `count` strokes stacked with 'lighten' (leaf shapes). */
function leafTexture(rand: () => number) {
  const n = 256,
    cv = document.createElement('canvas'),
    ctx = cv.getContext('2d')!
  cv.width = cv.height = n
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, n, n)
  ctx.globalCompositeOperation = 'lighten'
  // fluffytree-threejs style (leoawen, MIT): 62 pointed blades radiating from the card centre
  for (let i = 0; i < 62; i++) {
    const a = rand() * 6.283,
      d = Math.sqrt(rand()) * n * 0.36,
      len = n * (0.14 + rand() * 0.07),
      w = len * 0.34
    ctx.save()
    ctx.translate(n / 2 + Math.cos(a) * d, n / 2 + Math.sin(a) * d)
    ctx.rotate(a + (rand() - 0.5) * 0.9)
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.moveTo(-len / 2, 0)
    ctx.quadraticCurveTo(-len * 0.1, -w, len / 2, 0)
    ctx.quadraticCurveTo(-len * 0.1, w, -len / 2, 0)
    ctx.fill()
    ctx.restore()
  }
  return new THREE.CanvasTexture(cv)
}

/** One clump = dozens of small cards scattered in a ball (folio-2025 foliage). */
function foliageGeo(rand: () => number) {
  const planes: THREE.BufferGeometry[] = [],
    p = new THREE.Vector3(),
    dir = new THREE.Vector3(),
    v = new THREE.Vector3()
  const q = new THREE.Quaternion(),
    Z = new THREE.Vector3(0, 0, 1)
  for (let i = 0; i < F.planes; i++) {
    const g = new THREE.PlaneGeometry(F.planeSize, F.planeSize)
    p.setFromSphericalCoords(1 - rand() ** 3, Math.acos(1 - 2 * rand()), rand() * 6.283)
    dir.copy(p).normalize()
    q.setFromUnitVectors(
      Z,
      v
        .set(rand() - 0.5, rand() - 0.5, rand() - 0.5)
        .multiplyScalar(0.8)
        .add(dir)
        .normalize(),
    )
    g.rotateZ(rand() * 6.283)
      .applyQuaternion(q)
      .translate(p.x, p.y, p.z)
    planes.push(g)
  }
  return mergeGeometries(planes)
}

/** Trunk only: drop the green leaf triangles that come with the kit model; branches stay. */
function trunkOnly(geo: THREE.BufferGeometry) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone(),
    c = g.attributes.color,
    keep: number[] = []
  for (let i = 0; i < c.count; i += 3) {
    let leaf = false
    for (let k = i; k < i + 3; k++)
      if (c.getY(k) > c.getX(k) * 1.05 && c.getY(k) > c.getZ(k) * 1.05) leaf = true
    if (!leaf) keep.push(i, i + 1, i + 2)
  }
  g.setIndex(keep)
  return g
}

async function loadKit() {
  const gltf = await new GLTFLoader().loadAsync('/models/landing-kit.glb')
  const kit: Record<string, THREE.BufferGeometry> = {}
  gltf.scene.updateMatrixWorld(true)
  gltf.scene.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    const src = mesh.geometry,
      c = src.attributes.color
    // colours come in as normalized 16-bit or float vec4: copy to a plain float vec3
    const col = new Float32Array(c.count * 3)
    for (let i = 0; i < c.count; i++) {
      col[i * 3] = c.getX(i)
      col[i * 3 + 1] = c.getY(i)
      col[i * 3 + 2] = c.getZ(i)
    }
    const g = new THREE.BufferGeometry()
    g.setIndex(src.index)
    g.setAttribute('position', src.attributes.position.clone())
    g.setAttribute('normal', src.attributes.normal.clone())
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    if (src.attributes.uv) g.setAttribute('uv', src.attributes.uv.clone())
    g.applyMatrix4(mesh.matrixWorld)
    kit[mesh.name] = g
  })
  const bark = await new THREE.TextureLoader().loadAsync('/models/bark-pohon-1.jpg')
  bark.flipY = false // glTF UVs: v from the top
  bark.colorSpace = THREE.SRGBColorSpace
  return { kit, bark }
}

export type PropPlacement = { x: number; z: number; ry?: number; s?: number }

/** Trees (trunk + foliage), bushes and rocks at fixed spots on the hill. */
export async function createProps(
  opts: {
    trees: PropPlacement[]
    bushes: PropPlacement[]
    rocks: (PropPlacement & { model: 'batu-1' | 'batu-2' })[]
    time: { value: number }
  },
  rand: () => number,
) {
  const { kit, bark } = await loadKit()
  const group = new THREE.Group()
  const matrix = ({ x, z, ry = 0, s = 1 }: PropPlacement, sink = 0) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(x, heightAt(x, z) - sink, z),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry),
      new THREE.Vector3().setScalar(s),
    )

  // ---- foliage: leaf cards lit as one ball per crown (fluffytree volume gradient) ----
  const leafGeo = foliageGeo(rand)
  const leafMat = windMat(
    opts.time,
    F.sway,
    -1,
    {
      color: 0xffffff,
      alphaMap: leafTexture(rand),
      alphaTest: F.alphaTest,
      side: THREE.DoubleSide,
      userData: { tint: true },
    },
    (s) => {
      s.vertexShader = s.vertexShader
        .replace(
          '#include <uv_vertex>',
          /* glsl */ `#include <uv_vertex>
      { // leaves flutter: texture UVs turn slightly with the wind (vertices stay put)
        float a = ${F.flutter.toFixed(2)} * sin(uTime * 1.9 + instanceMatrix[3].x * 0.7 + instanceMatrix[3].z * 0.5 + position.y * 3.0);
        vec2 q = vAlphaMapUv - 0.5;
        vAlphaMapUv = vec2(q.x * cos(a) - q.y * sin(a), q.x * sin(a) + q.y * cos(a)) + 0.5;
      }`,
        )
        .replace(
          '#include <project_vertex>',
          'vAlign = dot(normalize(wp.xyz - aTree), uSunDir);\n#include <project_vertex>',
        )
      s.vertexShader =
        'attribute vec3 aTree;\nuniform vec3 uSunDir;\nvarying float vAlign;\n' + s.vertexShader
      const lit0 =
        'float lit = smoothstep(uShade.x, uShade.y, clamp(reflectedLight.directDiffuse.g, 0.0, 1.0));'
      if (!s.fragmentShader.includes(lit0))
        throw new Error('leafMat: styledMat "lit" line changed.')
      s.fragmentShader =
        'varying float vAlign;\n' +
        s.fragmentShader
          .replace(
            '#include <color_fragment>',
            `#include <color_fragment>
      diffuseColor.rgb *= mix(vec3(1.0), vec3(${F.hlTint.map((x) => x.toFixed(2))}), smoothstep(${F.highlight[0].toFixed(2)}, ${F.highlight[1].toFixed(2)}, vAlign));`,
          )
          .replace('#include <normal_fragment_maps>', 'normal = directionalLights[0].direction;')
          .replace(
            lit0,
            `float lit = mix(${F.floor.toFixed(2)}, 1.0, smoothstep(${F.grad[0].toFixed(2)}, ${F.grad[1].toFixed(2)}, vAlign)) * mix(${(1 - F.shadow).toFixed(2)}, 1.0, clamp(reflectedLight.directDiffuse.g, 0.0, 1.0));`,
          )
    },
  )
  leafMat.customProgramCacheKey = () => 'style-leaf'

  const pick = (palettes: [number, number][]) => {
    let r = rand() * palettes.reduce((n, p) => n + p[1], 0)
    return palettes.find((p) => (r -= p[1]) < 0)![0]
  }
  /** One InstancedMesh for every clump of every crown; aTree = crown centre each clump is lit around. */
  function addFoliage(
    matrices: THREE.Matrix4[],
    clumps: Clump[],
    palettes: [number, number][],
    perClump: boolean,
  ) {
    const geo = leafGeo.clone(),
      count = matrices.length * clumps.length,
      aTree = new Float32Array(count * 3)
    const ctr = new THREE.Vector3(),
      p = new THREE.Vector3(),
      d = new THREE.Object3D(),
      m = new THREE.Matrix4(),
      c = new THREE.Color()
    for (const [x, y, z] of clumps) ctr.add(p.set(x, y, z))
    ctr.multiplyScalar(1 / clumps.length)
    const mesh = new THREE.InstancedMesh(geo, leafMat, count)
    let i = 0
    for (const tm of matrices) {
      const color = pick(palettes)
      p.copy(ctr).applyMatrix4(tm)
      for (const [x, y, z, r, squash] of clumps) {
        ;(perClump ? new THREE.Vector3(x, y, z).applyMatrix4(tm) : p).toArray(aTree, i * 3)
        d.position.set(x, y, z)
        d.rotation.set(squash ? 0 : rand() * 6.283, rand() * 6.283, squash ? 0 : rand() * 6.283)
        d.scale.set(r, r * (squash ?? 1), r)
        d.updateMatrix()
        mesh.setMatrixAt(i, m.multiplyMatrices(tm, d.matrix))
        mesh.setColorAt(
          i++,
          c
            .set(color)
            .offsetHSL(
              (rand() - 0.5) * F.jitter[0],
              (rand() - 0.5) * F.jitter[1],
              (rand() - 0.5) * F.jitter[2],
            ),
        )
      }
    }
    geo.setAttribute('aTree', new THREE.InstancedBufferAttribute(aTree, 3))
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  }

  // ---- trees: kit trunk with baked bark + a crown of clumps on the branch tips ----
  const treeMats = opts.trees.map((t) => matrix(t, 0.1))
  const trunkGeo = trunkOnly(kit.tree_leafy)
  const barkMat = styledMat({ vertexColors: true, map: bark }, (s) => {
    s.fragmentShader = s.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>\n diffuseColor.rgb *= ${BARK_BOOST.toFixed(2)};`,
    )
  })
  barkMat.customProgramCacheKey = () => 'style-bark'
  const trunks = new THREE.InstancedMesh(trunkGeo, barkMat, treeMats.length)
  treeMats.forEach((m, i) => trunks.setMatrixAt(i, m))
  trunks.castShadow = trunks.receiveShadow = true
  group.add(trunks)
  const crown = [...TREE.clumps]
  for (const [x, y, z] of TREE.tips)
    if (!crown.some(([cx, cy, cz, r]) => Math.hypot(x - cx, y - cy, z - cz) < r * 0.9))
      crown.push([x, y + 0.12, z, F.tipClump[0] * (0.85 + rand() * 0.3), F.tipClump[1]])
  addFoliage(treeMats, crown, TREE.palettes, true)

  // ---- bushes: foliage only ----
  addFoliage(
    opts.bushes.map((b) => matrix(b)),
    BUSH.clumps,
    BUSH.palettes,
    false,
  )

  // ---- rocks: NUSAVERSE low-poly rocks with their own texture, sunk a quarter into the ground ----
  const rockModels = new Map<string, { geo: THREE.BufferGeometry; mat: THREE.Material }>()
  for (const name of new Set(opts.rocks.map((r) => r.model))) {
    const gltf = await new GLTFLoader().loadAsync(`/models/${name}.glb`)
    let src: THREE.Mesh | undefined
    gltf.scene.traverse((o) => (src ??= (o as THREE.Mesh).isMesh ? (o as THREE.Mesh) : undefined))
    if (!src) throw new Error(`${name}.glb has no mesh`)
    const geo = src.geometry.clone()
    geo.computeBoundingBox()
    rockModels.set(name, {
      geo,
      mat: styledMat({ map: (src.material as THREE.MeshStandardMaterial).map }),
    })
  }
  for (const r of opts.rocks) {
    const { geo, mat } = rockModels.get(r.model)!
    const box = geo.boundingBox!,
      s = r.s ?? 1
    const mesh = new THREE.Mesh(geo, mat)
    mesh.applyMatrix4(matrix(r, (box.min.y + (box.max.y - box.min.y) * 0.25) * s))
    mesh.castShadow = mesh.receiveShadow = true
    group.add(mesh)
  }
  return group
}
