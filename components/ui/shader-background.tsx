'use client'

import { useRef, useEffect } from 'react'

const vertexShaderSource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`

const fragmentShaderSource = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.4;

    // Dark base: deep navy/indigo
    vec3 base = vec3(0.043, 0.067, 0.125);

    // Plasma lines
    float lines = 0.0;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float speed = 0.3 + fi * 0.07;
      float freq  = 3.0 + fi * 1.2;
      float amp   = 0.06 + fi * 0.012;
      float phase = fi * 1.3;

      float y = 0.2 + fi * 0.15 + amp * sin(uv.x * freq + t * speed + phase);
      float dist = abs(uv.y - y);
      float glow = 0.003 / (dist + 0.003);
      lines += glow * (0.6 + 0.4 * sin(t + fi));
    }

    // Green accent glow (top center — matches brand green #00C853)
    vec2 gc = vec2(0.5, 1.1);
    float gd = length(uv - gc);
    vec3 greenGlow = vec3(0.0, 0.784, 0.325) * (0.18 / (gd * gd + 0.08));

    // Blue accent glow (bottom right)
    vec2 bc = vec2(1.1, -0.1);
    float bd = length(uv - bc);
    vec3 blueGlow = vec3(0.161, 0.475, 1.0) * (0.10 / (bd * bd + 0.06));

    // Line color: soft cyan-green tint
    vec3 lineColor = vec3(0.0, 0.9, 0.5) * lines * 0.55;

    vec3 color = base + greenGlow + blueGlow + lineColor;

    // Vignette
    float vignette = 1.0 - smoothstep(0.5, 1.4, length(uv - 0.5) * 1.6);
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`

function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram | null {
  const vs = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fs = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)
  if (!vs || !fs) return null

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Shader link error:', gl.getProgramInfoLog(program))
    return null
  }
  return program
}

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    const program = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource)
    if (!program) return

    // Full-screen quad
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, 'a_position')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const resLoc = gl.getUniformLocation(program, 'u_resolution')

    let animId: number
    let start: number | null = null

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const render = (ts: number) => {
      if (!start) start = ts
      const t = (ts - start) / 1000

      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(positionLoc)
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

      gl.uniform1f(timeLoc, t)
      gl.uniform2f(resLoc, canvas.width, canvas.height)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  )
}
