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
  return composer
}

/**
 * Scene background that comes out of the post chain as exactly the page's paper colour (--color-paper), so the canvas
 * meets the sections below without a seam: the grading pass's saturation and exposure are undone in advance (its split
 * toning is neutral this bright, and the colour sits under the bloom threshold).
 */
export function paperBackground(paper = '#fafaf8') {
  const c = new THREE.Color(paper) // linear
  const l = c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722
  return new THREE.Color(
    (l + (c.r - l) / GRADE.saturation) / GRADE.exposure,
    (l + (c.g - l) / GRADE.saturation) / GRADE.exposure,
    (l + (c.b - l) / GRADE.saturation) / GRADE.exposure,
  )
}
