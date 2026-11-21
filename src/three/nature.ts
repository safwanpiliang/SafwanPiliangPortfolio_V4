import * as THREE from 'three'
import { cardNormal, styledMat } from './style'

// Hill, grass and flowers for the landing scene. The grass shader, ground palette and flowers are ported from the
// Arumbae Neira demo (src/world/terrain.js and src/world/props.js); the island is replaced by a single hill.

export const SIZE = 90 // side of the ground square (m); also the extent of the grass/height maps
const HILL = { height: 3.6, radius: 11 }

// Seeded RNG so the scene is identical on every load
export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hash = (ix: number, iz: number) => {
  const s = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453
  return s - Math.floor(s)
}
function vnoise(x: number, z: number) {
  const ix = Math.floor(x),
    iz = Math.floor(z),
    fx = x - ix,
    fz = z - iz
  const ux = fx * fx * (3 - 2 * fx),
    uz = fz * fz * (3 - 2 * fz)
  const a = hash(ix, iz),
    b = hash(ix + 1, iz),
    c = hash(ix, iz + 1),
    d = hash(ix + 1, iz + 1)
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz
}
const fbm = (x: number, z: number) =>
  vnoise(x, z) * 0.6 + vnoise(x * 2.1 + 7, z * 2.1 + 3) * 0.3 + vnoise(x * 4.3, z * 4.3) * 0.1
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Ground height: one rounded hill with soft noise on its flanks. */
// Ground footprint: an ellipse around the hill, stretched towards the camera (+Z) so the near slope still fills the
// bottom of the frame. Outside it the ground curves down out of sight, so no flat land shows beside or behind the hill.
const FOOT = { cz: 8, ax: 13, az: 15, drop: 30 }
export function heightAt(x: number, z: number) {
  const r2 = (x * x + z * z) / (HILL.radius * HILL.radius)
  const e = Math.hypot(x / FOOT.ax, (z - FOOT.cz) / FOOT.az),
    out = Math.max(0, e - 1)
  return (
    HILL.height * Math.exp(-r2) -
    FOOT.drop * out * out +
    (fbm(x * 0.12 + 4, z * 0.12 + 9) - 0.5) * 0.5 * Math.min(1, r2)
  )
}

// Ground palette from the Arumbae day look
const [GA, GB, DRY, LIGHT, DARK] = [0xa2c84c, 0x84b448, 0xd0c866, 0xd8d65a, 0x4d8a3c].map(
  (h) => new THREE.Color(h),
)
function groundColor(x: number, z: number, c: THREE.Color) {
  const n = fbm(x * 0.08 + 3, z * 0.08 + 9)
  c.copy(GA).lerp(GB, n)
  const m = fbm(x * 0.02 + 80, z * 0.02 + 15) // wide spots: light yellowish on high noise, dark green on low
  c.lerp(LIGHT, smooth(0.47, 0.68, m) * 0.85).lerp(DARK, smooth(0.5, 0.3, m) * 0.85)
  return c.lerp(DRY, smooth(0.5, 0.8, fbm(x * 0.03 + 40, z * 0.03)) * 0.45)
}

/** Grass density 0..1: patchy everywhere, cleared where the character sits. */
function grassDensity(x: number, z: number, seat: THREE.Vector3) {
  return (
    smooth(1.1, 2.1, Math.hypot(x - seat.x, z - seat.z)) *
    Math.min(1, fbm(x * 0.06 + 20, z * 0.06) * 1.8)
  )
}

/** rgb = ground colour (sRGB), a = grass density; covers SIZE × SIZE. */
function createGrassMap(seat: THREE.Vector3, res = 256) {
  const data = new Uint8Array(res * res * 4),
    c = new THREE.Color(),
    rgb = { r: 0, g: 0, b: 0 }
  for (let j = 0; j < res; j++)
    for (let i = 0; i < res; i++) {
      const x = ((i + 0.5) / res - 0.5) * SIZE,
        z = ((j + 0.5) / res - 0.5) * SIZE,
        k = (j * res + i) * 4
      groundColor(x, z, c).getRGB(rgb, THREE.SRGBColorSpace)
      data[k] = Math.round(rgb.r * 255)
      data[k + 1] = Math.round(rgb.g * 255)
      data[k + 2] = Math.round(rgb.b * 255)
      data[k + 3] = Math.round(grassDensity(x, z, seat) * 255)
    }
  const tex = new THREE.DataTexture(data, res, res, THREE.RGBAFormat, THREE.UnsignedByteType)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = tex.minFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

function createHeightTexture(res = 256) {
  const data = new Uint16Array(res * res)
  for (let j = 0; j < res; j++)
    for (let i = 0; i < res; i++)
      data[j * res + i] = THREE.DataUtils.toHalfFloat(
        heightAt((i / (res - 1) - 0.5) * SIZE, (j / (res - 1) - 0.5) * SIZE),
      )
  const tex = new THREE.DataTexture(data, res, res, THREE.RedFormat, THREE.HalfFloatType)
  tex.magFilter = tex.minFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

function createGround() {
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, 160, 160).rotateX(-Math.PI / 2)
  const pos = geo.attributes.position,
    col = new Float32Array(pos.count * 3),
    c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      z = pos.getZ(i)
    pos.setY(i, heightAt(x, z))
    groundColor(x, z, c).toArray(col, i * 3)
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  geo.computeVertexNormals()
  const mesh = new THREE.Mesh(geo, styledMat({ vertexColors: true, userData: { tint: true } }))
  mesh.receiveShadow = true
  return mesh
}

// Grass look (Arumbae config.grass): width = blade base (m), height = [min, max] (m), bend = curve, face = how much blades turn to camera
const G = {
  width: 0.13,
  height: [0.5, 1.15],
  bend: 0.22,
  face: 0.6,
  wind: { strength: 0.2, speed: 1.1, freq: 0.5, lean: 0.04, dir: [0.82, 0.57], gust: 1.6 },
  shade: { root: 0.55, tip: 1.15, tipTint: [1.12, 1.08, 0.8] },
  backlight: { strength: 1.3, power: 2.5, tip: 0.6 }, // a bit stronger and wider than Arumbae: the sun sits behind the hill here
}

/**
 * One grass layer: all blades in a few meshes, blade shape/height/colour/density computed in the vertex shader.
 * The window of blades is centred on the hill top (static camera, so no sliding window).
 */
function createGrass(
  blades: number,
  radius: number,
  seat: THREE.Vector3,
  time: { value: number },
  rand: () => number,
) {
  const group = new THREE.Group()
  const SIDE = [-1, 1, -1, 1, 0],
    ALONG = [0, 0, 0.5, 0.5, 1] // 5 points: 2 at the base, 2 in the middle, 1 at the tip
  // Split into meshes of ≤ 65,535 points with 16-bit indices: one huge mesh renders broken in Safari
  const chunks = Math.ceil(blades / 13000),
    perChunk = Math.ceil(blades / chunks),
    geos: THREE.BufferGeometry[] = []
  for (let c = 0; c < chunks; c++) {
    const n = Math.min(perChunk, blades - c * perChunk)
    const pos = new Float32Array(n * 15),
      blade = new Float32Array(n * 15),
      idx = new Uint16Array(n * 9),
      nor = new Int8Array(n * 15)
    for (let b = 0, r = 0; b < n; b++) {
      const x = (rand() * 2 - 1) * radius,
        z = (rand() * 2 - 1) * radius,
        seed = rand(),
        o = b * 5
      for (let k = 0; k < 5; k++, r += 3) {
        pos[r] = x
        pos[r + 2] = z
        blade[r] = SIDE[k]
        blade[r + 1] = ALONG[k]
        blade[r + 2] = seed
        nor[r + 1] = 127
      }
      idx.set([o, o + 1, o + 2, o + 1, o + 3, o + 2, o + 2, o + 3, o + 4], b * 9)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aBlade', new THREE.BufferAttribute(blade, 3)) // x = side, y = along blade (0..1), z = random per blade
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3, true))
    geo.setIndex(new THREE.BufferAttribute(idx, 1))
    geos.push(geo)
  }
  const U = {
    uTime: time,
    uSeat: { value: seat },
    uGroundMap: { value: createGrassMap(seat) },
    uHeightMap: { value: createHeightTexture() },
    uBlade: { value: new THREE.Vector4(G.width, G.height[0], G.height[1], G.bend) },
    uPatch: { value: new THREE.Vector4(radius, SIZE, G.face, 0) },
    uWindG: { value: new THREE.Vector4(G.wind.strength, G.wind.speed, G.wind.freq, G.wind.lean) },
    uWindDir: { value: new THREE.Vector2(G.wind.dir[0], G.wind.dir[1]).normalize() },
  }
  const vertexHead = /* glsl */ `
    precision highp sampler2D;
    attribute vec3 aBlade;
    uniform float uTime;
    uniform vec3 uSeat;
    uniform sampler2D uGroundMap, uHeightMap;
    uniform vec4 uBlade, uPatch, uWindG;
    uniform vec2 uWindDir;
    varying float vT, vRnd;
    varying vec3 vGround, vGW, vBN;
    float h11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
    float vn(vec2 p) {
      vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      float a = h11(i.x + i.y * 57.0), b = h11(i.x + 1.0 + i.y * 57.0), c = h11(i.x + i.y * 57.0 + 57.0), d = h11(i.x + 1.0 + i.y * 57.0 + 57.0);
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
  `
  const vertexBody = /* glsl */ `
    vec3 transformed;
    {
      float R = uPatch.x;
      vec2 wxz = position.xz;
      vec2 muv = wxz / uPatch.y + 0.5;
      vec4 gm = texture2D(uGroundMap, muv);
      float hy = texture2D(uHeightMap, muv).r;
      float rnd = aBlade.z, r2 = h11(rnd * 127.1 + 1.7), r3 = h11(rnd * 311.7 + 5.3);
      float t = aBlade.y, tt = t * t;
      float fade = 1.0 - smoothstep(0.5 + 0.3 * r2, 1.0, length(wxz) / R);       // edge of the patch: shorter, irregular
      float dens = smoothstep(r2 * 0.7, r2 * 0.7 + 0.3, gm.a);
      float nearS = mix(0.25, 1.0, smoothstep(1.6, 5.0, length(wxz - uSeat.xz)));  // shorter next to the character
      float slow = 0.5 + 0.25 * sin(wxz.x * 0.31 + 1.3) * sin(wxz.y * 0.27) + 0.25 * sin(wxz.x * 0.11 + wxz.y * 0.17);
      float H = mix(uBlade.y, uBlade.z, clamp(r3 * 0.6 + slow * 0.4, 0.0, 1.0)) * fade * dens * nearS;
      vec2 toCam = cameraPosition.xz - wxz;
      float dC = length(toCam);
      toCam /= max(dC, 0.001);
      vec2 rr = vec2(cos(rnd * 18.8495559), sin(rnd * 18.8495559));              // random direction, turned towards the camera
      vec2 faceDir = vec2(-toCam.y, toCam.x);
      rr *= sign(dot(rr, faceDir) + 0.0001);
      rr = normalize(mix(rr, faceDir, uPatch.z));
      float ls = r2 > 0.5 ? 1.0 : -1.0;
      vec2 fw = vec2(rr.y, -rr.x) * ls;
      float w = uBlade.x * (0.7 + 0.8 * r3) * (1.0 + smoothstep(10.0, 45.0, dC) * 1.1) * clamp(H / uBlade.y, 0.35, 1.0);
      vec2 wd = uWindDir, wp = vec2(-wd.y, wd.x);
      float gust = sin(dot(wxz, wd) * uWindG.z + uTime * uWindG.y) + 0.45 * sin(dot(wxz, wp) * uWindG.z * 1.7 + uTime * uWindG.y * 0.73);
      gust += (vn(wxz * 0.09 - wd * uTime * uWindG.y * 0.45) - 0.35) * ${G.wind.gust.toFixed(2)};
      float flutter = 0.15 * sin(uTime * 3.1 + rnd * 40.0);
      vec2 off = wd * (gust * uWindG.x + uWindG.w) * H * tt + wp * flutter * uWindG.x * H * tt;
      off += fw * uBlade.w * H * tt;                                              // blade curve
      vec3 p = vec3(wxz.x, hy - 0.06, wxz.y);
      p.xz += rr * (aBlade.x * w * 0.5 * (1.0 - tt)) + off;
      p.y += t * H * (1.0 - 0.12 * tt);
      p.y -= step(H, 0.03) * 500.0;                                               // no grass here: push far below ground
      transformed = p;
      vT = t; vRnd = rnd; vGround = gm.rgb; vGW = p; vBN = vec3(fw.x, 0.3, fw.y);
    }
  `
  const fragmentHead = /* glsl */ `
    uniform vec3 uSunDir;
    varying float vT, vRnd;
    varying vec3 vGround, vGW, vBN;
  `
  const mat = styledMat(
    { color: 0xffffff, side: THREE.DoubleSide, userData: { tint: true } },
    (s) => {
      Object.assign(s.uniforms, U)
      s.vertexShader =
        vertexHead +
        s.vertexShader
          .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3(0.0, 1.0, 0.0);')
          .replace('#include <begin_vertex>', vertexBody)
      s.fragmentShader =
        fragmentHead +
        s.fragmentShader
          .replace(
            '#include <color_fragment>',
            `#include <color_fragment>
        diffuseColor.rgb = vGround * mix(${G.shade.root.toFixed(2)}, ${G.shade.tip.toFixed(2)}, vT) * (0.9 + 0.2 * vRnd) * mix(vec3(1.0), vec3(${G.shade.tipTint.map((x) => x.toFixed(2))}), vT * vT);`,
          )
          .replace(
            'base * uLightColor, lit) + totalEmissiveRadiance;',
            `base * uLightColor, lit) + totalEmissiveRadiance;
        { // backlight: blade tips glow when the camera looks towards the sun
          vec3 gV = normalize(cameraPosition - vGW);
          float bk = pow(max(dot(gV, -uSunDir), 0.0), ${G.backlight.power.toFixed(1)}) * (1.0 - abs(dot(normalize(vBN), uSunDir))) * mix(1.0, vT, ${G.backlight.tip.toFixed(2)}) * ${G.backlight.strength.toFixed(2)} * lit;
          outgoingLight += base * uLightColor * bk * 1.6;
        }`,
          )
      cardNormal(s)
    },
  )
  mat.customProgramCacheKey = () => 'style-tint-grass'
  for (const geo of geos) {
    const grass = new THREE.Mesh(geo, mat)
    grass.frustumCulled = false
    grass.receiveShadow = true
    group.add(grass)
  }
  return group
}

function flowerTexture(rand: () => number) {
  const cv = document.createElement('canvas'),
    n = (cv.width = cv.height = 64),
    ctx = cv.getContext('2d')!,
    r = 15
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, n, n)
  const dab = (x: number, y: number, rx: number, ry: number, rot: number, color: string) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, rot, 0, 6.283)
    ctx.fill()
  }
  for (let k = 0; k < 6; k++) {
    const a = k * 1.047 + rand() * 0.25
    dab(32 + Math.cos(a) * r, 32 + Math.sin(a) * r, r * (0.85 + rand() * 0.2), r * 0.52, a, '#ff0')
  }
  dab(32, 32, 6.5, 6.5, 0, '#fff')
  return new THREE.CanvasTexture(cv)
}

/** Small flower cards lying almost flat on the grass, swaying in the wind (Arumbae flowers). */
function createFlowers(
  count: number,
  radius: number,
  seat: THREE.Vector3,
  time: { value: number },
  rand: () => number,
) {
  const FL = {
    size: 0.24,
    sway: 0.03,
    center: new THREE.Color(0xffc83a),
    tilt: [0.17, 0.44],
    lift: 0.85,
  }
  const colors: [number, number][] = [
    [0xffffff, 1],
    [0xffffff, 1],
    [0xffc2d8, 1],
    [0xcdb2ff, 0.95],
    [0xffe066, 0.65],
  ]
  const c = FL.center
  const mat = styledMat(
    { color: 0xffffff, alphaMap: flowerTexture(rand), alphaTest: 0.5, side: THREE.DoubleSide },
    (s) => {
      s.uniforms.uTime = time
      s.vertexShader =
        'uniform float uTime;\n' +
        s.vertexShader.replace(
          '#include <begin_vertex>',
          /* glsl */ `#include <begin_vertex>
      vec4 wp = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
      float wk = max(position.y + 1.0, 0.0) * ${FL.sway.toFixed(3)};
      transformed.x += (sin(uTime * 1.6 + wp.x * 0.35 + wp.z * 0.27) + 0.5 * sin(uTime * 2.7 + wp.x * 0.9)) * wk;
      transformed.z += cos(uTime * 1.3 + wp.z * 0.4) * wk * 0.6;`,
        )
      cardNormal(s)
      s.fragmentShader = s.fragmentShader.replace(
        '#include <color_fragment>',
        /* glsl */ `#include <color_fragment>
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(${c.r.toFixed(3)}, ${c.g.toFixed(3)}, ${c.b.toFixed(3)}), texture2D(alphaMap, vAlphaMapUv).b);`,
      )
    },
  )
  mat.customProgramCacheKey = () => 'style-flower'
  const geo = new THREE.PlaneGeometry(FL.size, FL.size).rotateX(-Math.PI / 2)
  const mesh = new THREE.InstancedMesh(geo, mat, count),
    d = new THREE.Object3D(),
    tint = new THREE.Color()
  let made = 0
  for (let tries = 0; made < count && tries < count * 20; tries++) {
    const x = (rand() * 2 - 1) * radius,
      z = (rand() * 2 - 1) * radius
    if (Math.hypot(x, z) > radius || Math.hypot(x - seat.x, z - seat.z) < 2.1) continue
    // looser on most of the hill, denser in a few meadows
    if (rand() > (fbm(x * 0.045 + 70, z * 0.045 + 30) > 0.56 ? 1 : 0.25)) continue
    d.position.set(x, heightAt(x, z) + 0.04 + rand() * FL.lift, z)
    const a = FL.tilt[0] + rand() * (FL.tilt[1] - FL.tilt[0]),
      b = rand() * 6.283
    d.rotation.set(a * Math.cos(b), rand() * 6.283, a * Math.sin(b))
    const [hex, k] = colors[Math.floor(rand() * colors.length)]
    d.scale.setScalar((0.75 + rand() * 0.55) * k)
    d.updateMatrix()
    mesh.setColorAt(made, tint.set(hex))
    mesh.setMatrixAt(made++, d.matrix)
  }
  mesh.count = made
  mesh.receiveShadow = true
  return mesh
}

export function createNature(opts: {
  blades: number
  flowers: number
  seat: THREE.Vector3
  time: { value: number }
}) {
  const rand = rng(20261121),
    group = new THREE.Group()
  group.add(createGround())
  group.add(createGrass(opts.blades, 26, opts.seat, opts.time, rand))
  group.add(createFlowers(opts.flowers, 20, opts.seat, opts.time, rand))
  return group
}
