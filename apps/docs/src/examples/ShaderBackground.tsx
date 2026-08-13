import { useEffect, useRef } from "react";
import {
  FRAGMENT_SHADER,
  REDUCED_MOTION_TIME,
  SHADER_PALETTE,
  VERTEX_SHADER
} from "./shader";

export interface ShaderPalette {
  page: string;
  accent: string;
  secondary: string;
}

/** #abc or #aabbcc to three 0-1 floats. Anything else falls back. */
function toRgb(value: string, fallback: string): [number, number, number] {
  const hex = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
    ? value.trim()
    : fallback;
  const body = hex.slice(1);
  const full =
    body.length === 3
      ? body
          .split("")
          .map((c) => c + c)
          .join("")
      : body;
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255
  ];
}

/**
 * The animated page background.
 *
 * Raw WebGL rather than three.js. A fullscreen background is two triangles and
 * a fragment shader; three.js is a scene graph, and it would add roughly 170 KB
 * gzipped to the page standing between someone and the product. The look lives
 * entirely in ./shader.ts, so changing it later is one file.
 *
 * The colours come from the theme. With no `palette` prop it reads
 * --gryt-bg, --gryt-accent and --gryt-secondary off its own element, so a
 * screen inside a themed provider gets a background that matches it. Pass the
 * prop when the theme changes without remounting — reading a custom property
 * is a one-off at setup, not something the draw loop watches.
 *
 * It degrades rather than breaks:
 * - No WebGL, or a shader that fails to compile, leaves the canvas absent and
 *   the CSS gradient underneath shows instead. Nobody sees a black rectangle.
 * - A custom property that is missing, or is some notation this cannot parse,
 *   falls back to the Gryt value rather than to black.
 * - prefers-reduced-motion renders a single frame and stops.
 * - A hidden tab stops drawing, because a login page left open in a background
 *   tab has no business spinning the GPU.
 */
export function ShaderBackground({ palette }: { palette?: ShaderPalette }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paletteRef = useRef<ShaderPalette | undefined>(palette);
  const refreshRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    paletteRef.current = palette;
    refreshRef.current?.();
  }, [palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      // The frame is never read back, and letting the driver discard it after
      // compositing is cheaper.
      preserveDrawingBuffer: false,
      powerPreference: "low-power"
    });

    if (gl === null) {
      canvas.remove();
      return;
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (shader === null) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        // Worth surfacing: a shader that fails to compile is otherwise a
        // completely silent blank background.
        console.warn(
          "gryt: background shader failed to compile",
          gl.getShaderInfoLog(shader)
        );
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();

    if (vertex === null || fragment === null || program === null) {
      canvas.remove();
      return;
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(
        "gryt: background shader failed to link",
        gl.getProgramInfoLog(program)
      );
      canvas.remove();
      return;
    }

    gl.useProgram(program);

    // One triangle large enough to cover the viewport. Cheaper than two, and
    // avoids the seam a quad can show along its diagonal.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "resolution");
    const timeLocation = gl.getUniformLocation(program, "time");
    const colourLocations = SHADER_PALETTE.map((entry) =>
      gl.getUniformLocation(program, entry.uniform)
    );

    const readColours = (): Array<[number, number, number]> => {
      const provided = paletteRef.current;
      const styles = provided ? null : getComputedStyle(canvas);
      return SHADER_PALETTE.map((entry, index) => {
        const value = provided
          ? [provided.page, provided.accent, provided.secondary][index]
          : (styles?.getPropertyValue(entry.property) ?? "");
        return toRgb(value, entry.fallback);
      });
    };

    let colours = readColours();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const resize = () => {
      // Capped at 2: beyond that the buffer grows quadratically for detail
      // nobody can see in a blurred gradient, and it is the difference between
      // smooth and stuttering on a 3x phone.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
    };

    let frame = 0;
    let start = 0;

    const draw = (seconds: number) => {
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, seconds);
      colourLocations.forEach((location, index) => {
        const [r, g, b] = colours[index];
        gl.uniform3f(location, r, g, b);
      });
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (timestamp: number) => {
      frame = requestAnimationFrame(loop);
      if (start === 0) start = timestamp;
      draw((timestamp - start) / 1000);
    };

    const stop = () => {
      if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const startOrDrawOnce = () => {
      stop();
      if (prefersReducedMotion.matches) {
        // A composed still, not a blank canvas — the design without the motion.
        draw(REDUCED_MOTION_TIME);
        return;
      }
      start = 0;
      frame = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else startOrDrawOnce();
    };

    // A theme change repaints even when the loop is stopped, which is the
    // reduced-motion case: the still has to be the still of the new palette.
    refreshRef.current = () => {
      colours = readColours();
      if (frame === 0) draw(REDUCED_MOTION_TIME);
    };

    startOrDrawOnce();

    const observer = new ResizeObserver(() => {
      if (frame === 0) draw(REDUCED_MOTION_TIME);
    });
    observer.observe(canvas);

    prefersReducedMotion.addEventListener("change", startOrDrawOnce);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      refreshRef.current = null;
      observer.disconnect();
      prefersReducedMotion.removeEventListener("change", startOrDrawOnce);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
      // The context itself is left to be collected with the canvas.
      //
      // This used to call loseContext here, to free the GPU immediately rather
      // than wait for collection. It had the opposite effect of the one
      // intended: getContext on a canvas whose context was released hands the
      // same, still-lost context back, so StrictMode's second mount in
      // development got a dead context, every shader "failed to compile", and
      // the canvas removed itself. The background has been the CSS fallback in
      // development ever since — visible in the console, invisible on the page,
      // because the fallback is in the same colours by design.
    };
  }, []);

  return (
    <div className="gryt-auth-backdrop" aria-hidden="true">
      <canvas ref={canvasRef} className="gryt-auth-shader" />
    </div>
  );
}
