import { createNavigation, controlFor } from './navigation.mjs';
import { createRenderer } from './render.mjs';

const byId = id => document.getElementById(id);
const canvas = byId('view');
const stop = byId('stop');
const pause = byId('pause');
const reset = byId('reset');
const fixed = byId('fixed');
const metrics = byId('metrics');
const status = byId('status');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const nav = createNavigation();
const keys = new Set();
let renderer, fault = '', frameId, lastFrame;
let scale = 0.6, lastMeasure, frames = 0, fps, size, renderedScale;
let running = false;

function updateUI() {
  const { paused, message } = nav.state;
  stop.disabled = paused;
  fixed.disabled = paused;
  pause.disabled = Boolean(fault);
  pause.textContent = paused ? 'Reprendre' : 'Pause';
  pause.setAttribute('aria-pressed', String(paused));
  const text = fault || (paused ? 'En pause.' : message || (nav.state.speed ? 'En déplacement.' : 'Prêt à explorer.'));
  if (status.textContent !== text) status.textContent = text;
}

function updateMetrics() {
  metrics.textContent = size
    ? `${fps === undefined ? '—' : fps.toFixed(1)} i/s · résolution ${Math.round(renderedScale * 100)} % · ${size.join(' × ')} px`
    : '— i/s · résolution —';
}

function requestFrame() {
  if (renderer && frameId === undefined && !document.hidden) frameId = requestAnimationFrame(frame);
}

function clearMeasurement() {
  lastMeasure = undefined;
  frames = 0;
  fps = undefined;
}

function frame(now) {
  frameId = undefined;
  const actions = new Set([...keys].map(controlFor));
  const axis = (positive, negative) => Number(actions.has(positive)) - Number(actions.has(negative));
  const input = { move: axis('forward', 'back'), turn: axis('right', 'left'), look: axis('up', 'down') };
  nav.step(lastFrame === undefined ? 0 : (now - lastFrame) / 1000, input, reduced.matches);
  lastFrame = now;
  renderedScale = fixed.checked ? 0.5 : scale;
  size = renderer(nav.state, renderedScale);

  const moving = !nav.state.paused && (keys.size > 0 || nav.state.speed !== 0);
  if (moving) {
    if (!running) {
      clearMeasurement();
      lastMeasure = now;
    } else {
      frames++;
      if (now - lastMeasure >= 750) {
        fps = frames * 1000 / (now - lastMeasure);
        frames = 0;
        lastMeasure = now;
        if (!fixed.checked) {
          if (fps < 24) scale = Math.max(0.25, scale - 0.05);
          if (fps > 48) scale = Math.min(1, scale + 0.025);
        }
      }
    }
    requestFrame();
  } else {
    lastFrame = undefined;
    clearMeasurement();
  }
  running = moving;
  updateUI();
  updateMetrics();
}

function initializeRenderer() {
  try {
    renderer = createRenderer(canvas);
    fault = '';
    requestFrame();
  } catch (error) {
    renderer = undefined;
    fault = `Rendu indisponible. ${error.message}`;
    console.error(error);
  }
  updateUI();
}

stop.addEventListener('click', () => {
  nav.stop();
  for (const code of keys) {
    if (['forward', 'back'].includes(controlFor(code))) keys.delete(code);
  }
  updateUI();
  requestFrame();
});
pause.addEventListener('click', () => {
  nav.pause();
  keys.clear();
  lastFrame = undefined;
  updateUI();
  requestFrame();
});
reset.addEventListener('click', () => {
  nav.reset();
  keys.clear();
  lastFrame = undefined;
  if (!renderer && !canvas.getContext('webgl')?.isContextLost()) initializeRenderer();
  updateUI();
  requestFrame();
});
fixed.addEventListener('change', () => {
  clearMeasurement();
  running = false;
  requestFrame();
});
const shortcuts = new Map([['KeyX', stop], ['KeyP', pause], ['KeyR', reset]]);
canvas.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const button = shortcuts.get(event.code);
  if (button) {
    event.preventDefault();
    if (!event.repeat) button.click();
    return;
  }
  if (!controlFor(event.code)) return;
  event.preventDefault();
  if (!renderer || nav.state.paused) return;
  if (!event.repeat) keys.add(event.code);
  requestFrame();
});
window.addEventListener('keyup', event => keys.delete(event.code));
canvas.addEventListener('blur', () => keys.clear());
function suspendInput() {
  keys.clear();
  nav.stop();
  lastFrame = undefined;
  running = false;
  if (frameId !== undefined) cancelAnimationFrame(frameId);
  frameId = undefined;
  clearMeasurement();
  updateMetrics();
  requestFrame();
}
window.addEventListener('blur', suspendInput);
document.addEventListener('visibilitychange', suspendInput);
window.addEventListener('resize', requestFrame);
canvas.addEventListener('webglcontextlost', event => {
  event.preventDefault();
  renderer = undefined;
  if (nav.state.paused) nav.pause();
  fault = 'Contexte WebGL perdu. En attente de restauration.';
  size = undefined;
  suspendInput();
  updateUI();
});
canvas.addEventListener('webglcontextrestored', initializeRenderer);
initializeRenderer();
