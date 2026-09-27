/**
 * ==============================================================================
 *  Made by Cuttleshift
 * 
 *         /\
 *        /  \
 *       /____\
 *      |\    /|
 *      | \  / |
 *      |  \/  |
 *       \    /
 *        \  /
 *         \/
 * 
 *  Interactive WebGL & Shader Canvas Studio
 * ==============================================================================
 */

import React, { useEffect, useRef } from "react";

export interface ReflectGridGlowProps {
  className?: string;
  glowHeight?: number;
  coreIntensity?: number;
  gridScale?: number;
  gridOpacity?: number;
  columnWidth?: number;
  blockActivity?: number;
  glowColor?: [number, number, number] | string;
  coreColor?: [number, number, number] | string;
}

function hexToRgbVec(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255;
    const g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255;
    const b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255;
    return [r, g, b];
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0;
  return [r, g, b];
}

function parseColorProp(
  c?: [number, number, number] | string,
  fallback: [number, number, number] = [0.52, 0.28, 0.95]
): [number, number, number] {
  if (!c) return fallback;
  if (typeof c === "string") return hexToRgbVec(c);
  return c;
}

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;

  // Uniform Shader Controls
  uniform vec3 u_glowColor;
  uniform vec3 u_coreColor;
  uniform float u_glowHeight;
  uniform float u_coreIntensity;
  uniform float u_gridScale;
  uniform float u_gridOpacity;
  uniform float u_columnWidth;
  uniform float u_blockActivity;

  // Pseudo-random hash for procedural block generation
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // Signed Distance Field for Rounded Rect (Container border curve at bottom)
  float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
    r.xy = (p.x > 0.0) ? r.xy : r.zw;
    r.x  = (p.y > 0.0) ? r.x  : r.y;
    vec2 q = abs(p) - b + r.x;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
  }

  void main() {
    // Normalized coordinates [0, 1]
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Deep background base color
    vec3 color = vec3(0.03, 0.02, 0.07);

    // --- LAYER 1: CENTRAL GUIDELINE COLUMN BAND ---
    float distToCenter = abs(st.x - 0.5);
    float inCentralColumn = smoothstep(u_columnWidth * 0.5 + 0.005, u_columnWidth * 0.5 - 0.005, distToCenter);
    
    // Subtle central band background lift
    color += vec3(0.025, 0.015, 0.05) * inCentralColumn;

    // --- LAYER 2: COORDINATE GRID MATRIX ---
    // Grid UV coordinates based on aspect ratio
    vec2 gridUv = st * vec2(u_gridScale, u_gridScale * (u_resolution.y / u_resolution.x));
    vec2 gridFrac = fract(gridUv);
    
    // Crisp grid line rendering
    float lineX = smoothstep(0.04, 0.0, abs(gridFrac.x - 0.5));
    float lineY = smoothstep(0.04, 0.0, abs(gridFrac.y - 0.5));
    float gridLines = max(lineX, lineY);

    // Apply grid line opacity ONLY inside the central guide column band
    float currentGridOpacity = u_gridOpacity * inCentralColumn;
    color += u_glowColor * gridLines * currentGridOpacity;

    // --- LAYER 3: FLOATING / ILLUMINATED DIGITAL NOTE BLOCKS ---
    vec2 cellId = floor(gridUv);
    float cellCenterDist = abs((cellId.x + 0.5) / u_gridScale - 0.5);
    
    // Only trigger blocks inside or near central column
    if (cellCenterDist < u_columnWidth * 0.55 && u_blockActivity > 0.01) {
      // Time-decaying random pulses for blocks
      float timeShift = u_time * 0.8 * u_blockActivity;
      float cellHash = hash(cellId + floor(timeShift * 0.5));
      
      // Filter to spawn sparse blocks (e.g., L-shaped / tetris note block patterns)
      if (cellHash > 0.82) {
        float pulse = sin(timeShift * 3.0 + cellHash * 6.28) * 0.5 + 0.5;
        float blockInner = smoothstep(0.48, 0.38, abs(gridFrac.x - 0.5)) * 
                           smoothstep(0.48, 0.38, abs(gridFrac.y - 0.5));
        
        vec3 blockColor = mix(u_glowColor, u_coreColor, 0.4);
        color += blockColor * blockInner * pulse * 0.22 * inCentralColumn;
      }
    }

    // --- LAYER 4: RADIANT ANIMATED BOTTOM HORIZON GLOW & ROUNDED BORDER ---
    // Distance from bottom edge
    float yPos = st.y;
    
    // Dynamic horizontal wave undulation along the horizon line
    float horizonWave = sin(st.x * 10.0 + u_time * 2.2) * 0.035 
                      + cos(st.x * 18.0 - u_time * 2.8) * 0.015 
                      + sin(u_time * 1.8) * 0.02;
    float animatedGlowHeight = max(0.08, u_glowHeight + horizonWave);

    // Breathing pulse for the central white-hot core
    float coreBreathing = 1.0 + 0.22 * sin(u_time * 2.5);

    // Horizontal traveling light energy pulse along the horizon
    float lightPulse = smoothstep(0.35, 0.0, abs(fract(st.x - u_time * 0.18) - 0.5)) * 0.3;

    // Smooth exponential ambient upward glow with dynamic wave height
    float ambientGlow = exp(-yPos / animatedGlowHeight) * 0.85;
    
    // Secondary soft volumetric bloom spreading higher up
    float volumetricBloom = exp(-yPos / (animatedGlowHeight * 2.2)) * 0.35;
    
    // White-hot core flare right at the bottom edge with breathing intensity
    float whiteHotCore = exp(-yPos / (animatedGlowHeight * 0.25)) * u_coreIntensity * coreBreathing;

    // Interactive mouse interaction (glow lifts slightly toward cursor X)
    float mouseDistX = abs(st.x - u_mouse.x / u_resolution.x);
    float mouseLift = exp(-mouseDistX * 4.0) * (1.0 - yPos) * 0.15;
    
    // Dynamic horizontal shimmer along the horizon line with traveling energy
    float shimmer = sin(st.x * 14.0 + u_time * 2.5) * 0.06 + 1.0 + lightPulse;

    // Combine neon light layers
    vec3 horizonLight = u_glowColor * (ambientGlow + volumetricBloom + mouseLift) * shimmer;
    horizonLight += u_coreColor * whiteHotCore;

    // --- LAYER 5: CONTAINER ROUNDED CORNER MASKING ---
    // Replicate the smooth rounded bottom corner edge
    vec2 containerUv = (st - 0.5) * 2.0;
    float borderDist = sdRoundedBox(containerUv - vec2(0.0, -0.05), vec2(0.96, 0.92), vec4(0.0, 0.0, 0.08, 0.08));
    float containerMask = smoothstep(0.01, -0.01, borderDist);

    // Apply container boundary clip
    color = mix(vec3(0.01, 0.01, 0.03), color + horizonLight, containerMask);

    // Outer ambient glow just outside the rounded bottom corner
    float outerGlow = smoothstep(0.08, 0.0, abs(borderDist)) * smoothstep(0.5, 0.0, st.y);
    color += u_glowColor * outerGlow * 0.4;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function ReflectGridGlow({
  className = "",
  glowHeight = 0.32,
  coreIntensity = 1.4,
  gridScale = 22.0,
  gridOpacity = 0.18,
  columnWidth = 0.30,
  blockActivity = 1.0,
  glowColor = [0.52, 0.28, 0.95],
  coreColor = [0.92, 0.88, 1.0],
}: ReflectGridGlowProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const parsedGlowColor = parseColorProp(glowColor, [0.52, 0.28, 0.95]);
  const parsedCoreColor = parseColorProp(coreColor, [0.92, 0.88, 1.0]);

  const propsRef = useRef({
    glowHeight,
    coreIntensity,
    gridScale,
    gridOpacity,
    columnWidth,
    blockActivity,
    parsedGlowColor,
    parsedCoreColor,
  });

  useEffect(() => {
    propsRef.current = {
      glowHeight,
      coreIntensity,
      gridScale,
      gridOpacity,
      columnWidth,
      blockActivity,
      parsedGlowColor,
      parsedCoreColor,
    };
  }, [
    glowHeight,
    coreIntensity,
    gridScale,
    gridOpacity,
    columnWidth,
    blockActivity,
    parsedGlowColor,
    parsedCoreColor,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    const webgl = gl as WebGLRenderingContext;

    function createShader(type: number, source: string) {
      const shader = webgl.createShader(type);
      if (!shader) return null;
      webgl.shaderSource(shader, source);
      webgl.compileShader(shader);
      if (!webgl.getShaderParameter(shader, webgl.COMPILE_STATUS)) {
        console.error(webgl.getShaderInfoLog(shader));
        webgl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(webgl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(webgl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vs || !fs) return;

    const program = webgl.createProgram();
    if (!program) return;
    webgl.attachShader(program, vs);
    webgl.attachShader(program, fs);
    webgl.linkProgram(program);

    if (!webgl.getProgramParameter(program, webgl.LINK_STATUS)) {
      return;
    }

    webgl.useProgram(program);

    const positionBuffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer);
    webgl.bufferData(
      webgl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      webgl.STATIC_DRAW
    );

    const posLocation = webgl.getAttribLocation(program, "a_position");
    webgl.enableVertexAttribArray(posLocation);
    webgl.vertexAttribPointer(posLocation, 2, webgl.FLOAT, false, 0, 0);

    const uResolutionLoc = webgl.getUniformLocation(program, "u_resolution");
    const uTimeLoc = webgl.getUniformLocation(program, "u_time");
    const uMouseLoc = webgl.getUniformLocation(program, "u_mouse");
    const uGlowColorLoc = webgl.getUniformLocation(program, "u_glowColor");
    const uCoreColorLoc = webgl.getUniformLocation(program, "u_coreColor");
    const uGlowHeightLoc = webgl.getUniformLocation(program, "u_glowHeight");
    const uCoreIntensityLoc = webgl.getUniformLocation(program, "u_coreIntensity");
    const uGridScaleLoc = webgl.getUniformLocation(program, "u_gridScale");
    const uGridOpacityLoc = webgl.getUniformLocation(program, "u_gridOpacity");
    const uColumnWidthLoc = webgl.getUniformLocation(program, "u_columnWidth");
    const uBlockActivityLoc = webgl.getUniformLocation(program, "u_blockActivity");

    const resize = () => {
      const container = containerRef.current || canvas.parentElement;
      const width = container ? container.clientWidth : window.innerWidth;
      const height = container ? container.clientHeight : window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const targetW = Math.max(1, Math.floor(width * dpr));
      const targetH = Math.max(1, Math.floor(height * dpr));

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        webgl.viewport(0, 0, targetW, targetH);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mouseRef.current.x = (e.clientX - rect.left) * dpr;
      mouseRef.current.y = (rect.bottom - e.clientY) * dpr;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const resizeObserver = new ResizeObserver(() => resize());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    resize();

    let animId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      const currentTime = (now - startTime) * 0.001;

      resize();

      webgl.useProgram(program);
      webgl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      webgl.uniform1f(uTimeLoc, currentTime);
      webgl.uniform2f(uMouseLoc, mouseRef.current.x, mouseRef.current.y);

      const p = propsRef.current;
      webgl.uniform3fv(uGlowColorLoc, p.parsedGlowColor);
      webgl.uniform3fv(uCoreColorLoc, p.parsedCoreColor);
      webgl.uniform1f(uGlowHeightLoc, p.glowHeight);
      webgl.uniform1f(uCoreIntensityLoc, p.coreIntensity);
      webgl.uniform1f(uGridScaleLoc, p.gridScale);
      webgl.uniform1f(uGridOpacityLoc, p.gridOpacity);
      webgl.uniform1f(uColumnWidthLoc, p.columnWidth);
      webgl.uniform1f(uBlockActivityLoc, p.blockActivity);

      webgl.drawArrays(webgl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      if (program) webgl.deleteProgram(program);
      if (vs) webgl.deleteShader(vs);
      if (fs) webgl.deleteShader(fs);
      if (positionBuffer) webgl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden bg-[#080612] ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
