/**
 * The background shader for the sign-in screen.
 *
 * Copied from the Keycloak login theme in Gryt-chat/auth, where the whole look
 * of the page background is this one string. Nothing outside reads it apart
 * from ShaderBackground.tsx.
 *
 * The three colours are uniforms rather than literals. They used to be baked in
 * as vec3s with a comment asking whoever changed the tokens to remember to
 * change these too, which is the kind of arrangement that holds right up until
 * somebody themes the library — and then the page is Gryt purple whatever
 * palette the app is actually using. ShaderBackground reads them off the CSS
 * custom properties, so the background follows the theme it is sitting in.
 */

/** A fullscreen triangle. No transforms; the fragment shader does the work. */
export const VERTEX_SHADER = /* glsl */ `
attribute vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform vec2 resolution;
uniform float time;

// The palette, as linear 0-1 floats. GLSL has no idea what a hex triplet is.
uniform vec3 pageColour;
uniform vec3 accentColour;
uniform vec3 secondaryColour;

// Hash-based value noise. Cheap, and good enough at this scale — nobody is
// inspecting the gradient of a login background.
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// Five octaves. Past that the extra detail is smaller than a pixel once the
// result is this soft, so it costs GPU time and shows nothing.
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  // Divide by height on both axes so the pattern does not stretch when the
  // window is wide.
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution) / resolution.y;

  // Domain warp: feed noise back into itself so the flow curls instead of
  // sliding, which is what stops it reading as a scrolling texture.
  float f = fbm(uv * 1.7 + vec2(time * 0.035, time * 0.022));
  f = fbm(uv * 1.9 + vec2(f * 1.1, -time * 0.028));

  vec3 colour = pageColour;
  colour = mix(colour, accentColour, smoothstep(0.35, 0.95, f) * 0.55);
  colour = mix(colour, secondaryColour, smoothstep(0.55, 1.05, f) * 0.18);

  // A little noise, because eight-bit output banding is very visible across a
  // gradient this smooth and this dark.
  colour += (hash(gl_FragCoord.xy) - 0.5) * 0.015;

  gl_FragColor = vec4(colour, 1.0);
}
`;

/** Seconds into the animation to freeze at when motion is not wanted. */
export const REDUCED_MOTION_TIME = 8.0;

/** Which custom property each uniform reads, and what to use if it is missing. */
export const SHADER_PALETTE = [
  { uniform: "pageColour", property: "--gryt-bg", fallback: "#111318" },
  { uniform: "accentColour", property: "--gryt-accent", fallback: "#968ff8" },
  {
    uniform: "secondaryColour",
    property: "--gryt-secondary",
    fallback: "#7dd3fc"
  }
] as const;
