import * as THREE from 'three'
import { DISSOLVE_GLSL, styleUniforms } from './style'

// Section 2 showcase: project covers on a ring of cards around the standing character, and the particle cloud that
// carries the landing over into it (landing surfaces → particles → character + cards).

export const RING = {
  // The ring is centred near the camera (offset from the character towards it), so the cards wrap around the viewer and
  // stay big on screen, with the character standing in front of them
  radius: 14,
  offset: 6.5, // ring centre: this far from the character towards the camera's end position
  count: 11, // as many big cards as fit round the circle (the first projects in Selected Work order)
  size: [7.45, 5.6], // card width, height (m): 4:3 like the covers in Selected Work
  height: 2.9, // card centre above the character's feet
  corner: 0.065, // corner radius in card-height units (Selected Work: 20 px on a ~300 px tall image)
  spin: 0.04, // idle turn of the ring (rad/s) once the transition is over
}

export type RingCard = { cover: string; href?: string; title: string }

/** Ring of cover cards facing the centre. They dissolve in with uDissolveB, like the showcase character. */
export function createRing(cards: RingCard[]) {
  const group = new THREE.Group()
  const loader = new THREE.TextureLoader()
  const [w, h] = RING.size
  const geo = new THREE.PlaneGeometry(w, h)
  const shown = cards.slice(0, RING.count)
  const meshes = shown.map((card, i) => {
    const map = loader.load(card.cover)
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 4
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: map },
        uImageAspect: { value: 1.25 }, // updated once the image is in
        uHover: { value: 0 },
        uDissolveB: styleUniforms.uDissolveB,
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv; varying vec3 vWorld;
        void main() {
          vUv = uv;
          vec4 w = modelMatrix * vec4(position, 1.0);
          vWorld = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D map; uniform float uImageAspect, uHover, uDissolveB;
        varying vec2 vUv; varying vec3 vWorld;
        ${DISSOLVE_GLSL}
        void main() {
          float rim = dissolveAt(vWorld, uDissolveB);
          // rounded corners
          vec2 p = (vUv - 0.5) * vec2(${(w / h).toFixed(4)}, 1.0);
          vec2 q = abs(p) - vec2(${(w / h / 2).toFixed(4)}, 0.5) + ${RING.corner.toFixed(3)};
          float d = length(max(q, 0.0)) - ${RING.corner.toFixed(3)};
          float a = 1.0 - smoothstep(-0.004, 0.002, d);
          if (a <= 0.0) discard;
          // object-fit: cover
          float ca = ${(w / h).toFixed(4)};
          vec2 uv = vUv - 0.5;
          if (uImageAspect > ca) uv.x *= ca / uImageAspect; else uv.y *= uImageAspect / ca;
          vec3 c = texture2D(map, uv * (1.0 - uHover * 0.06) + 0.5).rgb * 0.97;   // under the bloom threshold
          c = mix(c, vec3(1.6, 1.45, 1.25), rim);
          gl_FragColor = vec4(c * a, a);
          #include <colorspace_fragment>
        }`,
      transparent: true,
      premultipliedAlpha: true,
    })
    const img = new Image()
    img.onload = () => (mat.uniforms.uImageAspect.value = img.naturalWidth / img.naturalHeight)
    img.src = card.cover
    const mesh = new THREE.Mesh(geo, mat)
    const a = (i / shown.length) * Math.PI * 2
    mesh.position.set(Math.sin(a) * RING.radius, RING.height, Math.cos(a) * RING.radius)
    mesh.lookAt(0, RING.height, 0)
    mesh.userData = { card, angle: a }
    group.add(mesh)
    return mesh
  })
  return { group, meshes }
}

const tmp = new THREE.Vector3(),
  ta = new THREE.Vector3(),
  tb = new THREE.Vector3(),
  tc = new THREE.Vector3(),
  inst = new THREE.Matrix4()

/** Random points on a mesh's triangles in world space (skinning and instancing applied). */
export function sampleMesh(mesh: THREE.Mesh, n: number, rand: () => number, out: number[]) {
  const geo = mesh.geometry,
    index = geo.index,
    tris = (index ? index.count : geo.attributes.position.count) / 3
  const im = mesh as THREE.InstancedMesh
  mesh.updateMatrixWorld(true)
  for (let k = 0; k < n; k++) {
    const t = Math.floor(rand() * tris) * 3
    const vi = (j: number) => (index ? index.getX(t + j) : t + j)
    mesh.getVertexPosition(vi(0), ta)
    mesh.getVertexPosition(vi(1), tb)
    mesh.getVertexPosition(vi(2), tc)
    let u = rand(),
      v = rand()
    if (u + v > 1) [u, v] = [1 - u, 1 - v]
    tmp
      .copy(ta)
      .multiplyScalar(1 - u - v)
      .addScaledVector(tb, u)
      .addScaledVector(tc, v)
    if (im.isInstancedMesh) {
      im.getMatrixAt(Math.floor(rand() * im.count), inst)
      tmp.applyMatrix4(inst)
    }
    tmp.applyMatrix4(mesh.matrixWorld)
    out.push(tmp.x, tmp.y, tmp.z)
  }
}

/** Small RGB grid of an image, to colour the particles that become a card. */
export function imagePixels(src: string, cols = 12, rows = 16): Promise<Uint8ClampedArray> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const cv = document.createElement('canvas')
      cv.width = cols
      cv.height = rows
      const ctx = cv.getContext('2d')!
      // same centre crop as the card
      const ca = RING.size[0] / RING.size[1],
        ia = img.naturalWidth / img.naturalHeight
      const sw = ia > ca ? img.naturalHeight * ca : img.naturalWidth,
        sh = ia > ca ? img.naturalHeight : img.naturalWidth / ca
      ctx.drawImage(
        img,
        (img.naturalWidth - sw) / 2,
        (img.naturalHeight - sh) / 2,
        sw,
        sh,
        0,
        0,
        cols,
        rows,
      )
      resolve(ctx.getImageData(0, 0, cols, rows).data)
    }
    img.onerror = () => resolve(new Uint8ClampedArray(cols * rows * 4).fill(200))
    img.src = src
  })
}

export type PointSet = {
  pos: number[] // xyz per point
  col: number[] // rgb per point (sRGB 0..1); for landing foliage this is the summer colour
  alt?: number[] // landing only: autumn colour per point (followed with uAutumn)
  ring?: number[] // showcase only: 1 when the point belongs to a card (turns with the ring)
}

/**
 * The particle cloud of the transition. Each particle starts on a landing surface (a) and ends on the showcase (b);
 * both lists are sorted by angle around the centre so the stream sweeps around rather than crossing over.
 * uShow fades the cloud in and out; uMorph (0 → 1) carries it from a to b with a swirl in between.
 */
export function createMorphPoints(
  a: PointSet,
  b: PointSet,
  center: THREE.Vector3,
  rand: () => number,
) {
  const n = Math.min(a.pos.length, b.pos.length) / 3
  const order = (pos: number[], count: number) =>
    Array.from({ length: count }, (_, i) => i).sort(
      (i, j) =>
        Math.atan2(pos[i * 3] - center.x, pos[i * 3 + 2] - center.z) -
        Math.atan2(pos[j * 3] - center.x, pos[j * 3 + 2] - center.z),
    )
  const oa = order(a.pos, a.pos.length / 3).slice(0, n),
    ob = order(b.pos, b.pos.length / 3)
  // keep an even spread when one list is longer: take every k-th of the sorted b
  const pickB = (i: number) => ob[Math.floor((i * ob.length) / n)]
  const P = new Float32Array(n * 3),
    B = new Float32Array(n * 3),
    CA = new Float32Array(n * 3),
    CA2 = new Float32Array(n * 3),
    CB = new Float32Array(n * 3),
    R = new Float32Array(n * 4)
  const c = new THREE.Color()
  const lin = (arr: number[], i: number, out: Float32Array, o: number) =>
    c.setRGB(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2], THREE.SRGBColorSpace).toArray(out, o)
  for (let k = 0; k < n; k++) {
    const i = oa[k],
      j = pickB(k)
    P.set(a.pos.slice(i * 3, i * 3 + 3), k * 3)
    B.set([b.pos[j * 3] - center.x, b.pos[j * 3 + 1], b.pos[j * 3 + 2] - center.z], k * 3)
    lin(a.col, i, CA, k * 3)
    lin(a.alt ?? a.col, i, CA2, k * 3)
    lin(b.col, j, CB, k * 3)
    R.set([rand(), 0.6 + rand() * 0.8, rand(), b.ring?.[j] ?? 0], k * 4)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3))
  geo.setAttribute('aB', new THREE.BufferAttribute(B, 3))
  geo.setAttribute('aColA', new THREE.BufferAttribute(CA, 3))
  geo.setAttribute('aColA2', new THREE.BufferAttribute(CA2, 3))
  geo.setAttribute('aColB', new THREE.BufferAttribute(CB, 3))
  geo.setAttribute('aRnd', new THREE.BufferAttribute(R, 4))
  const uniforms = {
    uMorph: { value: 0 },
    uShow: { value: 0 },
    uRingRot: { value: 0 },
    uCenter: { value: center.clone() },
    uPx: { value: 1 }, // point size scale: drawing buffer height, set on resize
    uMaxPx: { value: 8 }, // largest point (px), scaled with the pixel ratio by the scene
    uTime: { value: 0 },
    uAutumn: styleUniforms.uAutumn,
  }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      attribute vec3 aB, aColA, aColA2, aColB;
      attribute vec4 aRnd;   // delay, size, phase, on a card
      uniform float uMorph, uShow, uRingRot, uPx, uMaxPx, uTime, uAutumn;
      uniform vec3 uCenter;
      varying vec3 vCol; varying float vAlpha;
      void main() {
        float ca = cos(uRingRot * aRnd.w), sa = sin(uRingRot * aRnd.w);
        vec3 b = vec3(ca * aB.x + sa * aB.z, aB.y, -sa * aB.x + ca * aB.z) + vec3(uCenter.x, 0.0, uCenter.z);
        float t = clamp((uMorph - aRnd.x * 0.4) / 0.6, 0.0, 1.0);
        float e = t * t * (3.0 - 2.0 * t);
        vec3 p = mix(position, b, e);
        float lift = sin(3.14159 * e);
        float ph = aRnd.z * 6.2832;
        p += vec3(sin(uTime * 0.9 + ph + p.y * 0.5), 0.9 + cos(uTime * 0.7 + ph * 1.3 + p.x * 0.4) * 0.6, cos(uTime * 0.8 + ph * 0.7 + p.z * 0.5)) * lift * 1.8;
        vCol = mix(mix(aColA, aColA2, uAutumn), aColB, e);
        // each particle fades on its own a little earlier/later than the rest
        vAlpha = smoothstep(aRnd.z * 0.3, aRnd.z * 0.3 + 0.7, uShow);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min(aRnd.y * uPx * (1.0 + lift * 0.6) / -mv.z, uMaxPx);   // no big blobs right by the lens
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vCol; varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = (1.0 - smoothstep(0.3, 0.5, d)) * vAlpha;
        if (a <= 0.01) discard;
        gl_FragColor = vec4(vCol * a, a);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    premultipliedAlpha: true,
  })
  const points = new THREE.Points(geo, mat)
  points.frustumCulled = false
  return { points, uniforms }
}
