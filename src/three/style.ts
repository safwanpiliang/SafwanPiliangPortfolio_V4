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
  uAutumn: { value: 0 }, // season wave progress: 0 = all summer, 1 = all autumn (tinted materials only); driven by the scene
  uSeasonOrigin: { value: new THREE.Vector3() }, // where the season wave starts (the character), set by the scene
  // Scroll transition: the landing (group a) dissolves away and the showcase (group b) dissolves in; 0 = solid, 1 = gone
  uDissolveA: { value: 0 },
  uDissolveB: { value: 1 },
}

/** Which dissolve uniform a styled material follows: 'a' = landing, 'b' = section 2 showcase. */
export type DissolveGroup = 'a' | 'b'
// Patchy world-space dissolve with a bright rim right at the edge (bloom picks it up), so it reads as matter breaking
// into the particles that take over
export const DISSOLVE_GLSL = /* glsl */ `
  float dsHash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float dsNoise(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(dsHash(i), dsHash(i + vec3(1, 0, 0)), f.x), mix(dsHash(i + vec3(0, 1, 0)), dsHash(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(dsHash(i + vec3(0, 0, 1)), dsHash(i + vec3(1, 0, 1)), f.x), mix(dsHash(i + vec3(0, 1, 1)), dsHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
  // returns the rim strength (0..1); discards dissolved fragments
  float dissolveAt(vec3 w, float amount) {
    if (amount <= 0.0) return 0.0;
    float n = dsNoise(w * 1.3) * 0.65 + dsNoise(w * 4.1) * 0.35;
    float th = amount * 1.12 - 0.06;
    if (n < th) discard;
    return 1.0 - smoothstep(0.0, 0.05, n - th);
  }
`

/**
 * Summer green → autumn colour. The pick comes from the red/green ratio, which shading doesn't change (it scales all
 * channels together): picking from the raw colour banded blades into stripes along their root→tip gradient.
 * Ground and grass: yellow-greens turn gold, deep greens orange. Leaves (userData.leaf) go redder: crimson → orange-red.
 * Both map smoothly, so a crown stays one family with gentle variation.
 * Brightness follows the original so light, shade, backlight and translucency still read.
 */
// reach = how far the wave travels from the character (m: past the trees and the visible slope, so the sweep stays on screen); band = width of the soft front;
// glow = brightening right at the front, so the change reads as a passing wave
export const SEASON = { reach: 22, band: 4, glow: 0.55, duration: 3 }
const AUTUMN_GLSL = /* glsl */ `
  vec3 autumnize(vec3 c) {
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    float k = smoothstep(0.55, 1.15, c.r / max(c.g, 0.001));
    vec3 a = mix(vec3(0.93, 0.38, 0.08), vec3(0.97, 0.64, 0.13), k);   // deep green → orange, yellow-green → gold
    return a * (0.4 + l * 1.25);
  }
  vec3 autumnizeLeaf(vec3 c) {
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    float k = smoothstep(0.45, 0.95, c.r / max(c.g, 0.001));
    vec3 a = mix(vec3(0.8, 0.17, 0.09), vec3(0.94, 0.4, 0.11), k);   // deep green → crimson, lighter green → orange-red
    return a * (0.45 + l * 1.35);
  }
  // Season wave: the change spreads out from uSeasonOrigin as uAutumn goes 0 → 1, with a ragged front (per-patch noise).
  // Returns 0 (summer) … 1 (autumn) at this fragment.
  uniform vec3 uSeasonOrigin;
  varying vec3 vSeasonW;
  float seasonAt() {
    float d = length(vSeasonW.xz - uSeasonOrigin.xz);
    float n = fract(sin(dot(floor(vSeasonW.xz * 1.5), vec2(12.9898, 78.233))) * 43758.5453);
    float front = uAutumn * (${SEASON.reach.toFixed(1)} + ${SEASON.band.toFixed(1)} + 1.5) - 1.5;   // −1.5 at 0 so nothing turns early
    return clamp((front - d + n * 1.5) / ${SEASON.band.toFixed(1)}, 0.0, 1.0);
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
 * userData.tint = true multiplies the colour by uFoliageTint and follows the season (ground, grass, leaves);
 * userData.leaf = true picks the redder leaf palette for autumn.
 */
export function styledMat(
  params: THREE.MeshLambertMaterialParameters = {},
  extend?: (s: Shader) => void,
) {
  const mat = new THREE.MeshLambertMaterial(params)
  const tint = Boolean(params.userData?.tint),
    leaf = Boolean(params.userData?.leaf),
    group: DissolveGroup = params.userData?.group ?? 'a'
  mat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, styleUniforms)
    s.vertexShader =
      'varying vec3 vSeasonW;\n' +
      s.vertexShader.replace(
        '#include <project_vertex>',
        /* glsl */ `#include <project_vertex>
      #ifdef USE_INSTANCING
        vSeasonW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
      #else
        vSeasonW = (modelMatrix * vec4(transformed, 1.0)).xyz;
      #endif`,
      )
    s.fragmentShader =
      'uniform vec3 uLightColor, uShadowColor, uFoliageTint;\nuniform vec2 uShade;\nuniform float uAutumn, uDissolveA, uDissolveB;\nvarying vec3 vSeasonW;\nfloat dsRim = 0.0;\n' +
      DISSOLVE_GLSL +
      (tint ? AUTUMN_GLSL.replace('varying vec3 vSeasonW;', '') : '') +
      FOG_GLSL +
      s.fragmentShader
        .replace(
          '#include <clipping_planes_fragment>',
          `#include <clipping_planes_fragment>\n\tdsRim = dissolveAt(vSeasonW, uDissolve${group.toUpperCase()});`,
        )
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
        vec3 base = diffuseColor.rgb${
          tint
            ? ` * uFoliageTint;
        float sa = seasonAt();
        base = mix(base, ${leaf ? 'autumnizeLeaf' : 'autumnize'}(base), sa) * (1.0 + sa * (1.0 - sa) * 4.0 * ${SEASON.glow.toFixed(2)})`
            : ''
        };
        outgoingLight = mix(base * uShadowColor, base * uLightColor, lit) + totalEmissiveRadiance;
        outgoingLight = mix(outgoingLight, vec3(1.6, 1.45, 1.25), dsRim);`,
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
  mat.customProgramCacheKey = () => `style${tint ? '-tint' : ''}${leaf ? '-leaf' : ''}-${group}`
  return mat
}

/** Card normal is not flipped for the back face (grass, flowers). */
export const cardNormal = (s: Shader) => {
  s.fragmentShader = s.fragmentShader.replace(
    '#include <normal_fragment_maps>',
    'normal = normalize(vNormal);',
  )
}
