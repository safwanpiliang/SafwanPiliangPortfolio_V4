import * as THREE from 'three'
import { heightAt } from './nature'
import { cardNormal, styledMat } from './style'

// Falling leaves for autumn: one mesh of instanced leaf cards. Each leaf starts somewhere inside a tree crown and drops
// to the ground, tumbling, swaying and drifting with the wind, then fades and starts again from the top. All motion is
// in the vertex shader; leaves only show once the autumn wave (uAutumn) has passed and stop when summer returns.

const FALL = {
  size: [0.3, 0.5], // leaf card size range (m): big enough to read from the camera ~20 m away
  speed: [0.07, 0.13], // fall cycles per second
  sway: [0.25, 0.6], // side-to-side swing (m)
  drift: 4.5, // how far the wind carries a leaf over its whole fall (m)
  wind: [0.82, 0.57], // same direction as the grass wind
  crown: { radius: 2.6, height: [4.4, 6.6] }, // where leaves start, in tree space (scaled by the tree)
  // share of leaves that start in the air over the hill instead (blown in from trees out of frame), and that area
  airborne: 0.4,
  air: { x: [-11, 9], z: [-3, 9], height: [5, 9] },
  colors: [0xc8361c, 0xd9541a, 0xe8781f, 0xf0a23a, 0xb3301f],
}

/** A single pointed leaf on a black card (alpha map). */
function leafShape() {
  const cv = document.createElement('canvas'),
    n = (cv.width = cv.height = 64),
    ctx = cv.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, n, n)
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.moveTo(6, 32)
  ctx.quadraticCurveTo(26, 6, 58, 32)
  ctx.quadraticCurveTo(26, 58, 6, 32)
  ctx.fill()
  return new THREE.CanvasTexture(cv)
}

export function createFallingLeaves(opts: {
  trees: { x: number; z: number; s?: number }[]
  count: number
  time: { value: number }
  rand: () => number
}) {
  const { count, rand } = opts
  const base = new THREE.PlaneGeometry(1, 0.7)
  const geo = new THREE.InstancedBufferGeometry()
  geo.index = base.index
  geo.setAttribute('position', base.attributes.position)
  geo.setAttribute('normal', base.attributes.normal)
  geo.setAttribute('uv', base.attributes.uv)
  geo.instanceCount = count

  const origin = new Float32Array(count * 3),
    motion = new Float32Array(count * 4)
  const shape = new Float32Array(count * 2),
    color = new Float32Array(count * 3),
    c = new THREE.Color()
  for (let i = 0; i < count; i++) {
    let x: number, z: number, top: number
    if (rand() < FALL.airborne) {
      const A = FALL.air
      x = A.x[0] + rand() * (A.x[1] - A.x[0])
      z = A.z[0] + rand() * (A.z[1] - A.z[0])
      top = heightAt(x, z) + A.height[0] + rand() * (A.height[1] - A.height[0])
    } else {
      const t = opts.trees[i % opts.trees.length],
        s = t.s ?? 1
      const a = rand() * Math.PI * 2,
        r = Math.sqrt(rand()) * FALL.crown.radius * s
      x = t.x + Math.cos(a) * r
      z = t.z + Math.sin(a) * r
      top =
        heightAt(t.x, t.z) +
        (FALL.crown.height[0] + rand() * (FALL.crown.height[1] - FALL.crown.height[0])) * s
    }
    origin.set([x, top, z], i * 3)
    // phase, speed, sway, ground height at the landing spot (drift carries it downwind)
    const gx = x + FALL.wind[0] * FALL.drift,
      gz = z + FALL.wind[1] * FALL.drift
    motion.set(
      [
        rand(),
        FALL.speed[0] + rand() * (FALL.speed[1] - FALL.speed[0]),
        FALL.sway[0] + rand() * (FALL.sway[1] - FALL.sway[0]),
        heightAt(gx, gz),
      ],
      i * 4,
    )
    shape.set([FALL.size[0] + rand() * (FALL.size[1] - FALL.size[0]), rand()], i * 2)
    c.set(FALL.colors[Math.floor(rand() * FALL.colors.length)]).toArray(color, i * 3)
  }
  geo.setAttribute('aOrigin', new THREE.InstancedBufferAttribute(origin, 3))
  geo.setAttribute('aMotion', new THREE.InstancedBufferAttribute(motion, 4))
  geo.setAttribute('aShape', new THREE.InstancedBufferAttribute(shape, 2))
  geo.setAttribute('aColor', new THREE.InstancedBufferAttribute(color, 3))

  const mat = styledMat(
    { color: 0xffffff, alphaMap: leafShape(), alphaTest: 0.5, side: THREE.DoubleSide },
    (s) => {
      s.uniforms.uTime = opts.time
      s.vertexShader =
        /* glsl */ `
      attribute vec3 aOrigin, aColor;
      attribute vec4 aMotion;
      attribute vec2 aShape;
      uniform float uTime, uAutumn;
      varying vec3 vLeafColor;
      mat3 rotXZ(float a, float b) {
        float ca = cos(a), sa = sin(a), cb = cos(b), sb = sin(b);
        return mat3(cb, 0.0, -sb, 0.0, 1.0, 0.0, sb, 0.0, cb) * mat3(1.0, 0.0, 0.0, 0.0, ca, sa, 0.0, -sa, ca);
      }
    ` +
        s.vertexShader
          .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3(0.0, 1.0, 0.0);') // lit like the grass under it
          .replace(
            '#include <begin_vertex>',
            /* glsl */ `
      vec3 transformed;
      {
        float seed = aShape.y;
        float life = fract(uTime * aMotion.y + aMotion.x);
        vec3 p = aOrigin;
        p.y = mix(aOrigin.y, aMotion.w + 0.05, life);
        p.xz += vec2(${FALL.wind[0].toFixed(2)}, ${FALL.wind[1].toFixed(2)}) * ${FALL.drift.toFixed(1)} * life;
        p.xz += vec2(sin(uTime * 1.3 + seed * 6.28), cos(uTime * 1.1 + seed * 4.0)) * aMotion.z;
        float spin = uTime * (1.4 + seed * 2.2) + seed * 10.0;
        // shows once the autumn wave has passed; fades in at the top and out on the ground
        float vis = smoothstep(0.35, 1.0, uAutumn) * smoothstep(0.0, 0.06, life) * (1.0 - smoothstep(0.88, 1.0, life));
        transformed = p + rotXZ(spin, spin * 0.6) * (position * aShape.x * vis);
        vLeafColor = aColor;
      }`,
          )
      s.fragmentShader =
        'varying vec3 vLeafColor;\n' +
        s.fragmentShader.replace(
          '#include <color_fragment>',
          '#include <color_fragment>\n diffuseColor.rgb = vLeafColor;',
        )
      cardNormal(s)
    },
  )
  mat.customProgramCacheKey = () => 'style-falling-leaf'
  const mesh = new THREE.Mesh(geo, mat)
  mesh.frustumCulled = false // positions come from the shader
  return mesh
}
