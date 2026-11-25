import { distanceGLSL, preset } from './mandelbox.mjs';
import { direction } from './navigation.mjs';

const vertex = 'attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }';
const fragment = `
precision highp float;
uniform vec2 uResolution;
uniform vec3 uPosition, uForward, uRight, uUp;
${distanceGLSL}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
  vec3 ray = normalize(uForward * 1.65 + uRight * uv.x + uUp * uv.y);
  vec3 background = vec3(0.06, 0.08, 0.095);
  float t = 0.0;
  for (int i = 0; i < 112; ++i) {
    vec3 p = uPosition + t * ray;
    float d = distanceToBox(p);
    if (!(d >= 0.0) || d > 100.0 || t > 6.0) break;
    float epsilon = max(0.00045, 0.0004 * t);
    if (d < epsilon) {
      vec2 e = vec2(epsilon, 0.0);
      vec3 gradient = vec3(
        distanceToBox(p + e.xyy) - distanceToBox(p - e.xyy),
        distanceToBox(p + e.yxy) - distanceToBox(p - e.yxy),
        distanceToBox(p + e.yyx) - distanceToBox(p - e.yyx));
      vec3 normal = gradient / max(length(gradient), 0.000001);
      float diffuse = max(dot(normal, normalize(-ray + vec3(0.15, 0.4, 0.0))), 0.0);
      float fill = 1.0 / (1.0 + 0.55 * t * t);
      vec3 stone = mix(vec3(0.38, 0.48, 0.54), vec3(0.91, 0.69, 0.47),
                       smoothstep(0.4, 1.4, abs(p.y)));
      vec3 color = stone * (0.23 + 0.77 * diffuse) * fill;
      gl_FragColor = vec4(mix(background, sqrt(color), exp(-0.18 * t * t)), 1.0);
      return;
    }
    t += 0.72 * d;
  }
  gl_FragColor = vec4(background, 1.0);
}`;

export function link(gl, fragmentSource) {
  const program = gl.createProgram();
  try {
    for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragmentSource]]) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (compiled) gl.attachShader(program, shader);
      const log = compiled ? '' : gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      if (!compiled) throw new Error(log || 'Compilation du shader impossible.');
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Liaison du programme impossible.');
    }
    gl.useProgram(program);
    return program;
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  }
}

export function setupTriangle(gl, program) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const attribute = gl.getAttribLocation(program, 'a');
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
}

export function setPreset(gl, program) {
  const uniform = name => gl.getUniformLocation(program, name);
  gl.uniform1f(uniform('uScale'), preset.scale);
  gl.uniform1f(uniform('uFold'), preset.fold);
  gl.uniform1f(uniform('uMinRadiusSquared'), preset.minRadiusSquared);
  gl.uniform1f(uniform('uFixedRadiusSquared'), preset.fixedRadiusSquared);
  gl.uniform1i(uniform('uIterations'), preset.iterations);
}

export function createRenderer(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) throw new Error('WebGL1 indisponible.');
  const program = link(gl, fragment);
  setupTriangle(gl, program);
  setPreset(gl, program);
  const uniform = name => gl.getUniformLocation(program, name);
  const resolution = uniform('uResolution');
  const position = uniform('uPosition');
  const forward = uniform('uForward');
  const right = uniform('uRight');
  const up = uniform('uUp');

  return (pose, scale) => {
    const targetWidth = Math.max(1, Math.floor(canvas.clientWidth * devicePixelRatio * scale));
    const targetHeight = Math.max(1, Math.floor(canvas.clientHeight * devicePixelRatio * scale));
    if (canvas.width !== targetWidth) canvas.width = targetWidth;
    if (canvas.height !== targetHeight) canvas.height = targetHeight;
    const actualWidth = gl.drawingBufferWidth;
    const actualHeight = gl.drawingBufferHeight;
    gl.viewport(0, 0, actualWidth, actualHeight);
    gl.uniform2f(resolution, actualWidth, actualHeight);
    gl.uniform3fv(position, pose.position);
    gl.uniform3fv(forward, direction(pose.yaw, pose.pitch));
    gl.uniform3f(right, Math.cos(pose.yaw), 0, -Math.sin(pose.yaw));
    gl.uniform3fv(up, direction(pose.yaw, pose.pitch + Math.PI / 2));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return [actualWidth, actualHeight];
  };
}
