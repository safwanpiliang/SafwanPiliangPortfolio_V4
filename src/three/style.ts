import * as THREE from 'three'

// Render style ported from the Arumbae Neira demo (src/world/style.js, technique from Bruno Simon's folio-2025):
// shadowed sides = base colour × shadow colour (not black), screen-space two-colour fog. Only the "day" preset is used here.
export const DAY = {
  sunDir: [-0.5, 0.78, 0.38] as const,
  light: '#fff2d2',
  lightIntensity: 1.12,
  shadow: '#6f82cc',
  shade: [0.0, 0.55] as const,
  // Fog tints match the CSS sky gradient behind the canvas, so distant grass melts into the sky
  fogA: '#cfe9ff',
  fogB: '#a9d6fb',
  fogDensity: 0.014,
  foliageTint: '#f4f8d8',
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
}

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
 * userData.tint = true multiplies the colour by uFoliageTint (ground, grass).
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
      'uniform vec3 uLightColor, uShadowColor, uFoliageTint;\nuniform vec2 uShade;\n' +
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
        vec3 base = diffuseColor.rgb${tint ? ' * uFoliageTint' : ''};
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
