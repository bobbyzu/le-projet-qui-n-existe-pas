import assert from 'node:assert/strict';
import { test } from 'node:test';
import { distance } from './mandelbox.mjs';
import { clearance, controlFor, createNavigation, start } from './navigation.mjs';

const idle = { move: 0, turn: 0, look: 0 };
const forward = { ...idle, move: 1 };
const back = { ...idle, move: -1 };
const right = { ...idle, turn: 1 };

test('dégagement du départ et du segment exploré', t => {
  const neighborhood = [];
  for (const x of [-0.025, 0, 0.025]) {
    for (const y of [-0.025, 0, 0.025]) {
      for (const z of [-0.025, 0, 0.025]) {
        neighborhood.push(distance(start.position.map((value, i) => value + [x, y, z][i])));
      }
    }
  }
  const segment = Array.from({ length: 561 }, (_, i) => distance([1.125, 1.125, -1.4 + i * 0.005]));
  const nearMin = Math.min(...neighborhood);
  const segmentMin = Math.min(...segment);
  t.diagnostic(`DE min départ : ${nearMin.toFixed(6)} ; segment : ${segmentMin.toFixed(6)}`);
  assert(nearMin >= 0.045);
  assert(segmentMin >= 0.065);
});

test('aller, orientation, retour et réinitialisation', t => {
  const nav = createNavigation();
  for (let i = 0; i < 900; i++) nav.step(1 / 60, forward);
  const endZ = nav.state.position[2];
  t.diagnostic(`z après 15 s : ${endZ.toFixed(6)}`);
  assert(endZ > 1.3 && endZ < 1.5);
  nav.stop();
  nav.step(0.05, right);
  assert(nav.state.yaw > 0);
  nav.step(0.05, { ...idle, turn: -1 });
  for (let i = 0; i < 900; i++) nav.step(1 / 60, back);
  assert(Math.abs(nav.state.position[2] - start.position[2]) < 0.025);
  nav.reset();
  assert.deepEqual(nav.state, { ...start, speed: 0, paused: false, message: '' });
});

test('Stop, Pause, reprise et Retour départ', () => {
  const nav = createNavigation();
  nav.step(0.05, forward);
  const movingSpeed = nav.state.speed;
  nav.pause();
  const paused = { ...nav.state };
  nav.step(10, right);
  nav.stop();
  assert.deepEqual(nav.state, paused);
  nav.pause();
  assert.equal(nav.state.speed, movingSpeed);
  nav.stop();
  const position = nav.state.position;
  nav.step(0.05, right);
  assert.equal(nav.state.position, position);
  assert(nav.state.yaw > 0);
  nav.pause();
  nav.pause();
  assert.equal(nav.state.speed, 0);
  nav.pause();
  nav.reset();
  assert.deepEqual(nav.state, { ...start, speed: 0, paused: false, message: '' });
});

test('sous-pas, pas temporel borné et réduction du mouvement', () => {
  const nav = createNavigation();
  const bounded = createNavigation();
  nav.step(100, forward);
  bounded.step(0.05, forward);
  assert.deepEqual(nav.state, bounded.state);
  const reduced = createNavigation();
  for (let i = 0; i < 90; i++) {
    nav.step(0.05, { ...forward, turn: 1 });
    reduced.step(0.05, { ...forward, turn: 1 }, true);
  }
  assert(distance(nav.state.position) >= clearance);
  assert(distance(reduced.state.position) >= clearance);
  assert(Math.abs(reduced.state.yaw) < Math.abs(nav.state.yaw));
  const wall = createNavigation(([x, y, z]) => z < -1.31 || z > -1.30 ? 1 : 0);
  for (let i = 0; i < 100; i++) wall.step(0.05, forward);
  assert(wall.state.position[2] < -1.31);
  assert.equal(wall.state.speed, 0);
  assert.match(wall.state.message, /paroi/i);
});

test('DE non fini et position invalide déclenchent la récupération', () => {
  let broken = false;
  const nav = createNavigation(p => broken ? NaN : distance(p));
  nav.step(0.05, forward);
  const safe = nav.state.position;
  broken = true;
  nav.state.position = [Infinity, 0, 0];
  nav.step(0.05, forward);
  assert.equal(nav.state.position, safe);
  assert.equal(nav.state.speed, 0);
  assert.match(nav.state.message, /restaurée/);
  nav.reset();
  assert.equal(nav.state.position, start.position);
});

test('touches physiques et flèches', () => {
  assert.equal(controlFor('KeyW'), controlFor('ArrowUp'));
  assert.equal(controlFor('KeyS'), controlFor('ArrowDown'));
  assert.equal(controlFor('KeyA'), controlFor('ArrowLeft'));
  assert.equal(controlFor('KeyD'), controlFor('ArrowRight'));
  assert.equal(controlFor('Unmapped'), undefined);
});

test('approche oblique d’une paroi du preset et recul', t => {
  const nav = createNavigation();
  for (let i = 0; i < 450; i++) nav.step(1 / 60, forward);
  nav.stop();
  for (let i = 0; i < 14; i++) nav.step(0.05, { ...idle, turn: -1, look: -1 });
  for (let i = 0; i < 180 && !nav.state.message; i++) nav.step(1 / 60, forward);
  const atWall = distance(nav.state.position);
  assert.match(nav.state.message, /paroi/i);
  assert.equal(nav.state.speed, 0);
  assert(atWall >= clearance && atWall < 0.019);
  for (let i = 0; i < 60; i++) nav.step(1 / 60, back);
  assert(distance(nav.state.position) > atWall);
  assert.equal(nav.state.message, '');
  t.diagnostic(`DE à l’arrêt devant la paroi : ${atWall.toFixed(6)}`);
});
