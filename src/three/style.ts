import * as THREE from 'three'

// Render style ported from the Arumbae Neira demo (src/world/style.js, technique from Bruno Simon's folio-2025):
// shadowed sides = base colour × shadow colour (not black), screen-space two-colour fog. Only the "day" preset is used here.
export const DAY = {
  // Neutral daylight from behind the hill, a little left of centre and fairly high: grass tips and both trees' crowns glow
  // against it (backlight / leaf translucency) the same way on each side, and the character gets a rim of light
  sunDir: [-0.25, 0.62, -0.75] as const,
  light: '#fff8ec', // near-white sun: neither golden nor cold
  lightIntensity: 1.18,
  shadow: '#a7b1d6', // soft blue-grey shade, light enough that sun-away faces stay readable
  shade: [0.0, 0.6] as const,
  // Fog tints match the page's paper background behind the canvas, so distant ground melts into it
  fogA: '#f8f8f5',
  fogB: '#f4f5f3',
  fogDensity: 0.011,
  foliageTint: '#f4f8e4',
}

// Shadow fade with camera distance (m): [start, end] and the mid value it fades to
const SHADOW_FADE = { range: [30, 90], lit: 0.8 }

const color = (hex: string) => ({ value: new THREE.Color(hex) })
/** Uniforms shared by every styled shader. */
export const styleUniforms = {
  uLightColor: { value: new THREE.Color(DAY.light).multiplyScalar(DAY.lightIntensity) },
  uShadowColor: color(DAY.shadow),
  uShade: { value: new THREE.Vector2(...DAY.shade) },
  uFogA: color(DAY.fogA),
  uFogB: color(DAY.fogB),
  uFogRes: { value: new THREE.Vector2(1, 1) }, // drawing buffer size in px, set on resize
  uSunDir: { value: new THREE.Vector3(...DAY.sunDir).normalize() },
  uFoliageTint: color(DAY.foliageTint),
  uAutumn: { value: 0 }, // season blend: 0 = summer, 1 = autumn (tinted materials only); eased by the scene
}

/**
 * Summer green → autumn colour. Each green maps to orange, gold or (sometimes) red, picked from its own hue jitter,
 * so neighbouring blades and clumps differ; brightness follows the original so light and shade are kept.
 */
const AUTUMN_GLSL = /* glsl */ `
  vec3 autumnize(vec3 c) {
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    float k = fract(c.r * 53.1 + c.g * 71.7 + c.b * 37.3);   // spreads the small summer hue jitter over the whole range
    vec3 a = mix(vec3(0.88, 0.36, 0.10), vec3(0.96, 0.68, 0.19), smoothstep(0.15, 0.85, k));   // orange → gold
    a = mix(a, vec3(0.74, 0.2, 0.09), step(0.72, k) * 0.8);             // some red
    return a * (0.4 + l * 1.25);
  }
`

/** Fog colour at this pixel: uFogA at the lower centre of the screen, uFogB towards the edges. */
export const FOG_GLSL = /* glsl */ `
  uniform vec3 uFogA, uFogB;
  uniform vec2 uFogRes;
  vec3 fogColorAt() {
    vec2 p = gl_FragCoord.xy / uFogRes - vec2(0.5, 0.45);
    p.x *= 0.6 * uFogRes.x / uFogRes.y;
    return mix(uFogA, uFogB, smoothstep(0.0, 0.7, length(p)));
  }
`

type Shader = THREE.WebGLProgramParametersWithUniforms

/**
 * Lambert material with the lighting replaced. Requires a single white DirectionalLight at intensity PI,
 * so reflectedLight.directDiffuse.g = dot(normal, light) × shadow (0..1).
 * userData.tint = true multiplies the colour by uFoliageTint and follows the season (ground, grass, leaves).
 */
export function styledMat(
  params: THREE.MeshLambertMaterialParameters = {},
  extend?: (s: Shader) => void,
) {
  const mat = new THREE.MeshLambertMaterial(params)
  const tint = Boolean(params.userData?.tint)
  mat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, styleUniforms)
    s.fragmentShader =
      'uniform vec3 uLightColor, uShadowColor, uFoliageTint;\nuniform vec2 uShade;\nuniform float uAutumn;\n' +
      AUTUMN_GLSL +
      FOG_GLSL +
      s.fragmentShader
        .replace(
          '#include <lights_lambert_fragment>',
          '#include <lights_lambert_fragment>\n\tmaterial.diffuseColor = vec3(1.0);',
        )
        .replace(
          '#include <envmap_fragment>',
          /* glsl */ `
        float lit = smoothstep(uShade.x, uShade.y, clamp(reflectedLight.directDiffuse.g, 0.0, 1.0));
        #ifdef USE_FOG
          lit = mix(lit, ${SHADOW_FADE.lit.toFixed(2)}, smoothstep(${SHADOW_FADE.range[0].toFixed(1)}, ${SHADOW_FADE.range[1].toFixed(1)}, vFogDepth));
        #endif
        vec3 base = diffuseColor.rgb${tint ? ' * uFoliageTint;\n        base = mix(base, autumnize(base), uAutumn)' : ''};
        outgoingLight = mix(base * uShadowColor, base * uLightColor, lit) + totalEmissiveRadiance;`,
        )
        .replace(
          '#include <fog_fragment>',
          /* glsl */ `
        #ifdef USE_FOG
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColorAt(), 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth));
        #endif`,
        )
    extend?.(s)
  }
  mat.customProgramCacheKey = () => `style${tint ? '-tint' : ''}`
  return mat
}

/** Card normal is not flipped for the back face (grass, flowers). */
export const cardNormal = (s: Shader) => {
  s.fragmentShader = s.fragmentShader.replace(
    '#include <normal_fragment_maps>',
    'normal = normalize(vNormal);',
  )
}
