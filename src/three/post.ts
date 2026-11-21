import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { FXAAPass } from 'three/addons/postprocessing/FXAAPass.js'

// Post-processing ported from the Arumbae Neira demo (src/main.js): bloom → warm grading → sRGB output → FXAA.
// No MSAA: Safari draws a blank screen for multisampled half-float targets, so anti-aliasing comes from FXAA.
export const GRADE = {
  // threshold sits just above the paper background (linear luminance ≈ 0.955) so only truly bright surfaces glow:
  // the sunlit white character, backlit grass tips and leaves
  bloom: { strength: 0.22, radius: 0.25, threshold: 0.98 }, // small and tight: a glint, not a haze over the image
  exposure: 1.03,
  saturation: 1.1,
  tint: [1.0, 1.0, 1.0], // neutral highlights; shadows lean only slightly cool (split toning in the shader)
}

// reach > 1 so the front clears the top of the frame at uBurn = 1; char = width of the scorched rim (in burn field units);
// glow / glowFalloff = brightness and tightness of the fiery edge
export const BURN = { reach: 1.25, char: 0.05, glow: 1.6, glowFalloff: 70 }

export function createComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
) {
  const composer = new EffectComposer(
    renderer,
    new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }),
  )
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(
    new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      GRADE.bloom.strength,
      GRADE.bloom.radius,
      GRADE.bloom.threshold,
    ),
  )
  composer.addPass(
    new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uSaturation: { value: GRADE.saturation },
        uExposure: { value: GRADE.exposure },
        uTint: { value: new THREE.Vector3(...GRADE.tint) },
      },
      vertexShader:
        'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse; uniform float uSaturation, uExposure; uniform vec3 uTint; varying vec2 vUv;
        void main() {
          vec4 c = texture2D(tDiffuse, vUv);
          c.rgb *= uExposure;
          float l0 = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
          c.rgb *= mix(vec3(0.97, 1.0, 1.04), uTint, smoothstep(0.0, 0.55, l0));   // split toning: cool shadows, warm lights
          c.rgb = mix(vec3(dot(c.rgb, vec3(0.2126, 0.7152, 0.0722))), c.rgb, uSaturation);
          gl_FragColor = c;
        }`,
    }),
  )
  composer.addPass(new OutputPass())
  composer.addPass(new FXAAPass())
  const burn = createBurnPass()
  composer.addPass(burn)
  return { composer, burn: burn.uniforms.uBurn as { value: number } }
}

/**
 * Burning paper: the last pass eats the frame away from the bottom up along a noise front, with a charred rim and a
 * glowing orange edge. Burnt pixels become transparent (premultiplied alpha), so the page section behind the canvas
 * shows through. uBurn: 0 = untouched, 1 = fully burnt.
 */
function createBurnPass() {
  return new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uBurn: { value: 0 } },
    vertexShader:
      'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse; uniform float uBurn; varying vec2 vUv;
      float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p) {
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y);
      }
      float fbm(vec2 p) { return vn(p) * 0.5 + vn(p * 2.1 + 7.0) * 0.3 + vn(p * 4.7 + 3.0) * 0.2; }
      void main() {
        vec4 c = texture2D(tDiffuse, vUv);
        if (uBurn <= 0.0) { gl_FragColor = c; return; }
        // burn order: bottom first, broken up by noise so the front is ragged
        float field = vUv.y * 0.55 + fbm(vUv * vec2(6.0, 4.0)) * 0.45;
        float d = field - (uBurn * ${BURN.reach.toFixed(2)} - 0.1);       // < 0 burnt, small > 0 the edge
        float alpha = smoothstep(-0.004, 0.004, d);
        float charred = 1.0 - smoothstep(0.0, ${BURN.char.toFixed(3)}, d);   // scorched rim just ahead of the fire
        float glow = exp(-max(d, 0.0) * ${BURN.glowFalloff.toFixed(1)}) * alpha;
        vec3 col = mix(c.rgb, vec3(0.16, 0.08, 0.04), charred * 0.85);
        col += vec3(1.0, 0.46, 0.12) * glow * ${BURN.glow.toFixed(2)};
        gl_FragColor = vec4(col * alpha, alpha);                       // premultiplied: the page shows through
      }`,
  })
}

/**
 * Page paper colour with a faint bright glow behind the hill, drawn as the scene background:
 * bloom needs an opaque canvas, so the CSS background can't show through any more.
 */
export function paperBackground() {
  const cv = document.createElement('canvas'),
    w = 512,
    h = 512,
    ctx = cv.getContext('2d')!
  cv.width = w
  cv.height = h
  ctx.fillStyle = '#fafaf8'
  ctx.fillRect(0, 0, w, h)
  ctx.translate(w / 2, h * 0.72)
  ctx.scale(1, 0.75)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.42)
  g.addColorStop(0, '#ffffff') // faint brightening behind the hill, no colour cast
  g.addColorStop(1, 'rgba(250, 250, 248, 0)')
  ctx.fillStyle = g
  ctx.fillRect(-w, -h, w * 2, h * 2)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
