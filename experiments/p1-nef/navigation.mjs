import { distance } from './mandelbox.mjs';

export const start = Object.freeze({ position: Object.freeze([1.125, 1.125, -1.4]), yaw: 0, pitch: 0 });
export const clearance = 0.018;
export const extent = 2.45;
const maxSubstep = 0.005;
const controls = new Map([
  ['KeyW', 'forward'], ['ArrowUp', 'forward'], ['KeyS', 'back'], ['ArrowDown', 'back'],
  ['KeyA', 'left'], ['ArrowLeft', 'left'], ['KeyD', 'right'], ['ArrowRight', 'right'],
  ['KeyQ', 'up'], ['KeyE', 'down'],
]);
export const controlFor = code => controls.get(code);

export function direction(yaw, pitch) {
  return [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)];
}

function clearanceAt(position, estimate) {
  return position.every(value => Number.isFinite(value) && Math.abs(value) <= extent)
    ? estimate(position)
    : NaN;
}

export function createNavigation(estimate = distance) {
  const state = {};
  let lastSafe, savedSpeed;
  function reset() {
    Object.assign(state, start, { speed: 0, paused: false, message: '' });
    lastSafe = start.position;
    savedSpeed = 0;
  }
  function stop() {
    if (state.paused) return;
    state.speed = 0;
  }
  function pause() {
    if (state.paused) {
      state.speed = savedSpeed;
    } else {
      savedSpeed = state.speed;
      state.speed = 0;
    }
    state.paused = !state.paused;
  }
  function recover() {
    state.position = lastSafe;
    stop();
    state.message = 'Position invalide. Dernière position sûre restaurée. Utilisez Retour départ si nécessaire.';
  }
  function step(seconds, input, reduced = false) {
    if (state.paused || !Number.isFinite(seconds) || seconds <= 0) return;
    const dt = Math.min(seconds, 0.05);
    const available = clearanceAt(state.position, estimate);
    if (!Number.isFinite(available) || available < clearance) {
      recover();
      return;
    }
    const turnRate = reduced ? 0.55 : 1.05;
    state.yaw = (state.yaw + input.turn * turnRate * dt) % (2 * Math.PI);
    state.pitch = Math.max(-1.25, Math.min(1.25, state.pitch + input.look * turnRate * dt));
    const limit = Math.max(0.035, Math.min(reduced ? 0.12 : 0.28, available * 2.5));
    const target = input.move * limit;
    const acceleration = (reduced ? 0.28 : 0.55) * dt;
    state.speed += Math.max(-acceleration, Math.min(acceleration, target - state.speed));
    const travel = Math.max(-limit, Math.min(limit, state.speed)) * dt;
    if (!travel) return;
    const steps = Math.ceil(Math.abs(travel) / maxSubstep);
    const forward = direction(state.yaw, state.pitch);
    for (let i = 0; i < steps; i++) {
      const candidate = state.position.map((value, axis) => value + forward[axis] * travel / steps);
      const remaining = clearanceAt(candidate, estimate);
      if (!Number.isFinite(remaining) || remaining < clearance) {
        stop();
        state.message = Number.isFinite(remaining)
          ? 'Paroi proche. Orientez-vous, reculez ou utilisez Retour départ.'
          : 'Limite de navigation. Utilisez Retour départ si nécessaire.';
        return;
      }
      state.position = lastSafe = candidate;
    }
    state.message = '';
  }
  reset();
  return { state, reset, stop, pause, step };
}
