import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { distance } from './mandelbox.mjs';

// Optional audit tool. Use the path of an existing Playwright installation.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_BIN || '/usr/bin/chromium',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
try {
  const origin = 'http://127.0.0.1:8768';
  const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
  const errors = [];
  const requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  await page.addInitScript(() => {
    const original = WebGLRenderingContext.prototype.uniform3fv;
    const locations = new WeakMap();
    const getLocation = WebGLRenderingContext.prototype.getUniformLocation;
    WebGLRenderingContext.prototype.getUniformLocation = function (program, name) {
      const location = getLocation.call(this, program, name);
      if (location && (name === 'uPosition' || name === 'uForward')) locations.set(location, name);
      return location;
    };
    WebGLRenderingContext.prototype.uniform3fv = function (location, value) {
      if (locations.get(location) === 'uPosition') {
        window.lastPose = Array.from(value);
        window.poseUpdates = (window.poseUpdates || 0) + 1;
      }
      if (locations.get(location) === 'uForward') window.lastDirection = Array.from(value);
      return original.call(this, location, value);
    };
  });
  await page.goto(origin);
  await page.waitForFunction(() => window.lastPose);
  assert.deepEqual(await page.evaluate(() => window.lastPose), [1.125, 1.125, -1.4]);

  const points = [[1.125, 1.125, -1.4], [1.125, 1.125, 0], [1.125, 1.125, 1.4],
    [1, 1, 1], [0, 0, 0], [2.25, 0, 0], [1.14, 1.1, 0.605]];
  const { distances, gpu } = await page.evaluate(async points => {
    const { distanceGLSL } = await import('/mandelbox.mjs');
    const { link, setupTriangle, setPreset } = await import('/render.mjs');
    const gl = document.createElement('canvas').getContext('webgl');
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    const program = link(gl, `
      precision highp float;
      uniform vec3 point;
      ${distanceGLSL}
      void main() {
        float q = floor(clamp(distanceToBox(point), 0.0, 2.0) * 1048576.0 + 0.5);
        vec3 packedDistance = vec3(floor(q / 65536.0), floor(mod(q, 65536.0) / 256.0), mod(q, 256.0));
        gl_FragColor = vec4(packedDistance / 255.0, 1.0);
      }`);
    setupTriangle(gl, program);
    setPreset(gl, program);
    gl.disable(gl.DITHER);
    gl.viewport(0, 0, 1, 1);
    const point = gl.getUniformLocation(program, 'point');
    const pixel = new Uint8Array(4);
    const distances = points.map(value => {
      gl.uniform3fv(point, value);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      return (pixel[0] * 65536 + pixel[1] * 256 + pixel[2]) / 1048576;
    });
    return { distances, gpu: debug && gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) };
  }, points);
  const maxError = Math.max(...points.map((point, i) => Math.abs(distance(point) - distances[i])));
  assert(maxError < 0.0005, `Écart JavaScript/GLSL : ${maxError}`);

  const view = page.locator('canvas');
  const fixed = page.getByRole('checkbox');
  await fixed.check();
  await page.waitForFunction(() => document.querySelector('#metrics').textContent.includes('400 × 250'));
  if (process.env.NEF_CAPTURE_DIR) await page.screenshot({ path: process.env.NEF_CAPTURE_DIR + '/nef-depart.png' });
  // Le rendu logiciel exécute le trajet dans un petit tampon. Les captures
  // sont prises au format de la fenêtre, à l'arrêt.
  await view.evaluate(canvas => Object.assign(canvas.style, { width: '160px', height: '100px' }));
  await view.focus();

  await page.keyboard.down('ArrowUp');
  await page.waitForFunction(() => window.lastPose[2] > -1.15);
  await page.keyboard.press('KeyP');
  const paused = await page.evaluate(() => window.lastPose);
  assert(await fixed.isDisabled());
  assert(await page.getByRole('button', { name: 'Stop' }).isDisabled());
  const pausedDirection = await page.evaluate(() => window.lastDirection);
  await page.keyboard.press('ArrowRight');
  assert.deepEqual(await page.evaluate(() => window.lastPose), paused);
  assert.deepEqual(await page.evaluate(() => window.lastDirection), pausedDirection);
  await page.keyboard.up('ArrowUp');
  await page.keyboard.press('KeyP');
  await page.waitForFunction(z => window.lastPose[2] > z, paused[2]);
  await page.keyboard.press('KeyX');
  await page.keyboard.press('KeyP');
  await page.keyboard.press('KeyP');

  await page.keyboard.down('ArrowUp');
  await page.waitForFunction(() => window.lastPose[2] >= 1.35, null, { timeout: 120000 });
  const movingMetrics = await page.locator('#metrics').textContent();
  console.log('Lecture FPS pendant le trajet :', movingMetrics);
  assert.match(movingMetrics, /\d+\.\d+ i\/s · résolution 50 %/);
  await page.keyboard.up('ArrowUp');
  await page.keyboard.press('KeyX');
  if (process.env.NEF_CAPTURE_DIR) {
    await view.evaluate(canvas => { canvas.style.cssText = ''; window.dispatchEvent(new Event('resize')); });
    await page.waitForFunction(() => document.querySelector('#metrics').textContent.includes('400 × 250'));
    await page.screenshot({ path: process.env.NEF_CAPTURE_DIR + '/nef-passage.png' });
    await view.evaluate(canvas => Object.assign(canvas.style, { width: '160px', height: '100px' }));
  }
  await page.keyboard.down('ArrowDown');
  await page.waitForFunction(() => window.lastPose[2] <= -1.35, null, { timeout: 120000 });
  await page.keyboard.up('ArrowDown');
  await page.keyboard.press('KeyX');

  // Même code physique, deux caractères imprimés selon la disposition.
  for (const key of ['w', 'z']) {
    await view.focus();
    await page.keyboard.press('KeyR');
    await page.waitForFunction(() => window.lastPose[2] === -1.4);
    await view.dispatchEvent('keydown', { code: 'KeyW', key });
    await page.waitForFunction(() => window.lastPose[2] > -1.37 && /^\d/.test(document.querySelector('#metrics').textContent));
    await page.locator('#pause').focus();
    await page.waitForFunction(() => !/^\d/.test(document.querySelector('#metrics').textContent));
  }
  await view.focus();
  await page.keyboard.press('KeyX');
  const beforeTurn = await page.evaluate(() => window.lastPose);
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => window.lastDirection[0] > 0.98);
  await page.keyboard.up('ArrowRight');
  assert.deepEqual(await page.evaluate(() => window.lastPose), beforeTurn);
  const beforeLoss = await page.evaluate(() => window.poseUpdates);
  const lossSupported = await view.evaluate(canvas => {
    const loss = canvas.getContext('webgl').getExtension('WEBGL_lose_context');
    if (!loss) return false;
    window.restoreNefContext = () => loss.restoreContext();
    loss.loseContext();
    return true;
  });
  assert(lossSupported, 'WEBGL_lose_context indisponible');
  await page.getByRole('status').filter({ hasText: 'Contexte WebGL perdu' }).waitFor();
  await page.getByRole('button', { name: 'Retour départ' }).click();
  await page.evaluate(() => window.restoreNefContext());
  await page.getByRole('status').filter({ hasText: 'Prêt à explorer' }).waitFor();
  await page.waitForFunction(count => window.poseUpdates > count && window.lastPose[2] === -1.4, beforeLoss);

  assert.deepEqual(errors, []);
  assert(requests.every(url => new URL(url).origin === origin));
  console.log(browser.version(), gpu);
  console.log('Écart JavaScript/GLSL maximal :', maxError);
  console.log('Aller-retour, commandes, focus et perte/restauration WebGL : OK');
} finally {
  await browser.close();
}
