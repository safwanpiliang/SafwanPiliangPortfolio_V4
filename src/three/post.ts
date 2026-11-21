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
  bloom: { strength: 0.6, radius: 0.5, threshold: 0.96 },
  exposure: 1.03,
  saturation: 1.16,
  tint: [1.04, 1.0, 0.94], // highlights lean warm; shadows lean cool (split toning in the shader)
}

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
          c.rgb *= mix(vec3(0.9, 1.0, 1.14), uTint, smoothstep(0.0, 0.55, l0));   // split toning: cool shadows, warm lights
          c.rgb = mix(vec3(dot(c.rgb, vec3(0.2126, 0.7152, 0.0722))), c.rgb, uSaturation);
          gl_FragColor = c;
        }`,
    }),
  )
  composer.addPass(new OutputPass())
  composer.addPass(new FXAAPass())
  return composer
}

/**
 * Page paper colour with a faint warm sun glow behind the hill, drawn as the scene background:
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
  g.addColorStop(0, '#fff0d4')
  g.addColorStop(1, 'rgba(250, 250, 248, 0)')
  ctx.fillStyle = g
  ctx.fillRect(-w, -h, w * 2, h * 2)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
