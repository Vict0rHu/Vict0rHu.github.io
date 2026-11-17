import * as T from 'three';
import { walkingRoute } from './navigation';
import type { WalkableSpace } from './navigation';
import { box, cylinder } from './set';
import { mindGuardThoughts } from './content';

const sightRange = 1.85;
const halfAngle = Math.PI / 6;
const catchDistance = .48;
const lookDuration = 1.7;
const chaseLimit = 15;
const chaseSpeed = 1.95;
const patrolStops = [[7.4, -3.5], [2.8, -3.62], [-3.35, -2.85], [-6.75, .76], [-3.16, 4.32], [3.05, 4.05], [6.35, 1.1]];
type GuardState = keyof typeof mindGuardThoughts;

export function createMindGuard(scene: T.Scene, space: WalkableSpace) {
  const guard = new T.Group();
  const body = new T.Group();
  body.position.y = .26;
  cylinder(body, .36, .22, 0, .16, 0, 0x543e78);
  const shell = new T.Mesh(new T.OctahedronGeometry(.55),
    new T.MeshStandardMaterial({ color: 0x825caa, flatShading: true }));
  shell.scale.set(1.1, .8, .88);
  shell.position.y = .54;
  body.add(shell);
  box(body, [.46, .2, .13], [0, .55, .42], 0x362244);
  const eye = box(body, [.29, .065, .025], [0, .55, .495], 0xffa5b7, .82);
  for (const x of [-.4, .4]) box(body, [.16, .17, .35], [x, .34, 0], 0xd5a6df);
  guard.add(body);

  const cone = new T.Mesh(new T.CircleGeometry(sightRange, 40, Math.PI / 2 - halfAngle, halfAngle * 2),
    new T.MeshBasicMaterial({ color: 0xffa3ad, transparent: true, opacity: .42, side: T.DoubleSide, depthWrite: false, toneMapped: false }));
  cone.rotation.x = Math.PI / 2;
  cone.position.y = .06;
  guard.add(cone);
  scene.add(guard);

  const tracks = new T.Group();
  for (const [x, z] of [[-.11, -.15], [.11, .16]]) {
    const print = box(tracks, [.13, .022, .21], [x, .07, z], 0x496a63);
    print.rotation.y = x;
  }
  tracks.visible = false;
  scene.add(tracks);

  const thoughtPoint = new T.Vector3();
  const step = new T.Vector3();
  const lastPrint = new T.Vector3();
  const velocity = new T.Vector3();
  const lastVisitor = new T.Vector3();
  const prints: { point: T.Vector3; yaw: number; time: number }[] = [];
  let path: T.Vector3[] = [];
  let stop = 0;
  let wait = 0;
  let scanYaw = 0;
  let state: GuardState = 'patrol';
  let repath = 0;
  let age = 0;
  let chaseTime = 0;
  let cooling = 0;
  let nextPrintCheck = 0;

  function beginLook(yaw: number) {
    scanYaw = yaw;
    wait = lookDuration;
  }

  function sees(visitor: T.Vector3) {
    const x = visitor.x - guard.position.x;
    const z = visitor.z - guard.position.z;
    const distance = Math.hypot(x, z);
    return distance <= sightRange &&
      x * Math.sin(guard.rotation.y) + z * Math.cos(guard.rotation.y) >= distance * Math.cos(halfAngle);
  }

  function move(seconds: number, speed: number) {
    const next = path[0];
    if (!next) return;
    step.subVectors(next, guard.position);
    const distance = step.length();
    if (distance > .002) guard.rotation.y = Math.atan2(step.x, step.z);
    const stride = seconds * speed;
    if (distance <= stride) {
      guard.position.copy(next);
      path.shift();
    } else guard.position.addScaledVector(step, stride / distance);
  }

  function setState(next: GuardState) {
    state = next;
    tracks.visible = next === 'investigate';
    cone.visible = next !== 'cooling' && next !== 'caught';
    cone.material.color.setHex(next === 'chase' ? 0xec3155 : 0xea6885);
    eye.material.emissive.setHex(next === 'chase' || next === 'caught' ? 0xff405a : next === 'cooling' ? 0xffba56 : 0xffa5b7);
  }

  function recordTrail(seconds: number, visitor: T.Vector3) {
    if (age === seconds) {
      lastVisitor.copy(visitor);
      lastPrint.copy(visitor);
    }
    if (seconds > 0) velocity.subVectors(visitor, lastVisitor).divideScalar(seconds).clampLength(0, 3);
    lastVisitor.copy(visitor);
    if (visitor.distanceToSquared(lastPrint) >= .72 ** 2) {
      prints.unshift({ point: visitor.clone(), yaw: Math.atan2(velocity.x, velocity.z), time: age });
      lastPrint.copy(visitor);
    }
    while (prints.length && age - prints[prints.length - 1].time > 5) prints.pop();
  }

  function investigateTrail() {
    if (age < nextPrintCheck) return;
    nextPrintCheck = age + 3.6;
    const print = prints.find(({ point, time }) =>
      age - time > .65 && guard.position.distanceToSquared(point) < 2.9 ** 2 && guard.position.distanceToSquared(point) > .55 ** 2);
    if (!print) return;
    const route = walkingRoute(space, guard.position, print.point);
    if (!route.length) return;
    path = route;
    wait = 0;
    tracks.position.copy(print.point);
    tracks.rotation.y = print.yaw;
    setState('investigate');
  }

  function reset() {
    const [x, z] = patrolStops[0];
    guard.position.set(x, 0, z);
    const [nextX, nextZ] = patrolStops[1];
    guard.rotation.y = Math.atan2(nextX - x, nextZ - z);
    stop = 0;
    path = [];
    age = 0;
    nextPrintCheck = 2;
    prints.length = 0;
    setState('patrol');
    beginLook(guard.rotation.y);
  }

  reset();
  return {
    reset,
    get thought() {
      thoughtPoint.copy(guard.position).y = 1.05;
      return { text: mindGuardThoughts[state], point: thoughtPoint };
    },
    update(elapsed: number, visitor: T.Vector3) {
      if (state === 'caught') return;
      const seconds = Math.min(elapsed, .04);
      age += seconds;
      recordTrail(seconds, visitor);
      if (state === 'cooling') {
        cooling -= elapsed;
        if (cooling > 0) return;
        setState('patrol');
        beginLook(guard.rotation.y);
      } else if (state !== 'chase' && sees(visitor)) {
        setState('chase');
        repath = chaseTime = 0;
      }

      if (state === 'chase') {
        chaseTime += elapsed;
        if (chaseTime >= chaseLimit) {
          setState('cooling');
          cooling = 4;
          path = [];
          prints.length = 0;
          nextPrintCheck = age + cooling + 2;
          return;
        }
        repath -= seconds;
        if (repath <= 0) {
          path = walkingRoute(space, guard.position, visitor.clone());
          repath = .18;
        }
        move(seconds, chaseSpeed);
        if (guard.position.distanceToSquared(visitor) <= catchDistance ** 2) {
          setState('caught');
          return true;
        }
        return;
      }
      if (state === 'patrol') investigateTrail();
      if (state === 'investigate') {
        move(seconds, 1.42);
        if (!path.length) {
          beginLook(tracks.rotation.y);
          setState('patrol');
        }
        return;
      }
      if (wait > 0) {
        wait -= seconds;
        guard.rotation.y = scanYaw + Math.sin((1 - wait / lookDuration) * Math.PI * 2) * .6;
      } else if (path.length === 0) {
        stop = (stop + 1) % patrolStops.length;
        const [x, z] = patrolStops[stop];
        path = walkingRoute(space, guard.position, new T.Vector3(x, 0, z));
        if (path.length === 0) beginLook(guard.rotation.y);
      } else {
        move(seconds, 1.12);
        if (path.length === 0) beginLook(guard.rotation.y);
      }
    },
  };
}
