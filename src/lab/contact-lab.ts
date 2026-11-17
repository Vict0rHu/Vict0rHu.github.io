import * as T from 'three';
import { walkingRoute, type WalkableSpace } from './navigation';
import { pandaArm } from './project-models';
import { box, cylinder } from './set';
import { victorAvatar } from './victor-avatar';

export const contactLabSize = { width: 14, depth: 10.4 };

const recordingLength = 9.2;
const resetLength = 2.2;
const armBenchX = -.90;
const armBenchWidth = 5.70;
const controlBenchWidth = 4.15;
const controlBenchX = armBenchX + (armBenchWidth + controlBenchWidth) / 2;
const wallFace = -contactLabSize.depth / 2 + .16;
const benchDepth = 2.62;
const benchZ = wallFace + benchDepth / 2;
const boardWidth = 2.79;
const boardX = armBenchX - (armBenchWidth + boardWidth) / 2;
const operatorSpot = new T.Vector3(controlBenchX, 0, -2.14);
const assistantSpot = new T.Vector3(1.10, 0, .54);
const fixtureSpot = new T.Vector3(armBenchX + .59, 0, -2.19);
const staging = new T.Vector3(armBenchX - .72, 1.206, -2.91);
const seatedPieceY = 1.199;
const gripToPieceCenter = .30;
const hoverY = 1.99;
type Phase = 'recording' | 'toFixture' | 'resetting' | 'returning';

function displayCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  return { canvas, texture, ink: canvas.getContext('2d') };
}

function plane(parent: T.Object3D, width: number, height: number, x: number, y: number, z: number, map: T.Texture) {
  const face = new T.Mesh(new T.PlaneGeometry(width, height), new T.MeshBasicMaterial({ map, toneMapped: false }));
  face.position.set(x, y, z);
  parent.add(face);
}

export function equipContactLab(scene: T.Scene) {
  const space: WalkableSpace = {
    bounds: { left: -6.65, right: 6.65, back: -4.84, front: 4.85 },
    obstacles: [],
  };
  const steel = 0x4b626e;
  function station(x: number, z: number, width: number, depth: number) {
    box(scene, [width, .14, depth], [x, .89, z], 0xc4d3d1);
    for (const side of [-1, 1]) {
      for (const end of [-1, 1]) {
        box(scene, [.16, .82, .16], [x + side * (width / 2 - .18), .41, z + end * (depth / 2 - .16)], steel);
      }
    }
    space.obstacles.push({ left: x - width / 2, right: x + width / 2, back: z - depth / 2, front: z + depth / 2 });
  }

  station(armBenchX, benchZ, armBenchWidth, benchDepth);
  station(controlBenchX, benchZ, controlBenchWidth, benchDepth);
  box(scene, [armBenchWidth, 2.31, .09], [armBenchX, 2.12, wallFace + .052], 0x306762);
  box(scene, [armBenchWidth, .06, .16], [armBenchX, 3.31, wallFace + .09], 0xa7e1d4, .31);
  box(scene, [3.52, .039, 2.3], [armBenchX, .983, benchZ], 0xe5ebe9);
  box(scene, [1.36, .009, .82], [armBenchX, 1.008, -3.11], 0xf2f4f1);
  box(scene, [.39, .037, .49], [staging.x, 1.024, staging.z], 0x729b96);

  const panda = pandaArm();
  // The arm's base sits .4 units behind its model origin after rotation.
  panda.model.position.set(armBenchX, 1.001, benchZ + .4);
  panda.model.rotation.y = -Math.PI / 2;
  scene.add(panda.model);
  const restGripper = panda.gripper.position.clone();
  // Front-camera reference: the rig looks back at the Panda with both operators behind it.
  const globalCamera = new T.PerspectiveCamera(62, 16 / 9, .035, 22);
  const tripodX = armBenchX - .12;
  const tripodZ = -1.91;
  globalCamera.position.set(tripodX, 1.90, tripodZ - .215);
  globalCamera.lookAt(armBenchX - .13, 1.49, -3.12);
  const globalMount = new T.Group();
  globalMount.position.set(tripodX, 1.90, tripodZ);
  scene.add(globalMount);
  box(globalMount, [.23, .17, .25], [0, 0, 0], 0x263640).rotation.x = -.26;
  cylinder(globalMount, .063, .076, 0, -.005, -.149, 0x76bfca).rotation.x = Math.PI / 2;
  cylinder(scene, .046, 1.66, tripodX, .91, tripodZ, steel);
  for (const yaw of [0, 2.1, 4.2]) {
    const leg = new T.Group();
    leg.position.set(tripodX, .24, tripodZ);
    leg.rotation.y = yaw;
    scene.add(leg);
    box(leg, [.05, .05, .54], [0, -.09, .21], steel).rotation.x = .47;
  }
  space.obstacles.push({ left: tripodX - .29, right: tripodX + .29, back: tripodZ - .28, front: tripodZ + .32 });

  const wristCamera = new T.PerspectiveCamera(64, 16 / 9, .027, 12);
  wristCamera.position.set(.05, -.052, .245);
  wristCamera.rotation.x = -1.3;
  panda.gripper.add(wristCamera);
  const wristHousing = box(panda.gripper, [.18, .106, .148], [.05, .018, .19], 0xd0dce2);
  box(wristHousing, [.077, .022, .056], [0, -.063, .015], 0x253650);

  const puckX = controlBenchX + .29;
  const puck = cylinder(scene, .143, .115, puckX, 1.04, -2.58, 0x25333e);
  cylinder(scene, .153, .043, puckX, .982, -2.58, 0x586473);
  box(scene, [.38, .03, .24], [controlBenchX - .24, .982, -2.65], 0x516c76);

  const mount = box(scene, [.216, .044, .22], [0, 1.032, 0], 0x293942);
  const piece = new T.Group();
  scene.add(piece);
  box(piece, [.154, .054, .155], [0, -.117, 0], 0x1b2933);
  cylinder(piece, .054, .23, 0, .012, 0, 0x283945);
  box(piece, [.12, .037, .11], [0, .13, 0], 0x455b65);

  const monitor = new T.Group();
  monitor.position.set(controlBenchX, 2.30, wallFace + .16);
  scene.add(monitor);
  box(monitor, [1.25, .67, .10], [0, 0, -.102], steel);
  box(monitor, [3.62, 2.03, .11], [0, 0, 0], 0x233240);
  box(monitor, [3.47, 1.89, .012], [0, 0, .057], 0x15242b);
  const feeds = [
    { camera: globalCamera, target: new T.WebGLRenderTarget(320, 180) },
    { camera: wristCamera, target: new T.WebGLRenderTarget(320, 180) },
  ];
  for (const [i, { target }] of feeds.entries()) plane(monitor, 1.58, .89, i ? .83 : -.83, .362, .067, target.texture);
  const titles = displayCanvas(592, 34);
  if (titles.ink) {
    const ctx = titles.ink;
    ctx.fillStyle = '#1e313b';
    ctx.fillRect(0, 0, 592, 34);
    ctx.fillStyle = '#b8dcd7';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('GLOBAL · FRONT', 13, 24);
    ctx.fillText('WRIST CAMERA', 314, 24);
  }
  plane(monitor, 3.24, .186, 0, .87, .068, titles.texture);

  const forcefield = displayCanvas(592, 127);
  plane(monitor, 3.24, .695, 0, -.536, .068, forcefield.texture);

  const stats = displayCanvas(640, 372);
  if (stats.ink) {
    const ctx = stats.ink;
    ctx.fillStyle = '#f7f7ee';
    ctx.fillRect(0, 0, 640, 372);
    ctx.fillStyle = '#263f43';
    ctx.font = 'bold 39px sans-serif';
    ctx.fillText('SUCCESS TALLY', 31, 54);
    ctx.font = '22px sans-serif';
    ctx.fillText('Illustrative comparison · 10 trials each', 32, 94);
    for (const [i, [name, count, shade]] of [['TacFF', 8, '#32796b'], ['Vision', 6, '#476991'], ['TacRGB', 4, '#92614c']].entries()) {
      const y = 153 + i * 73;
      ctx.fillStyle = '#263f43';
      ctx.font = 'bold 27px monospace';
      ctx.fillText(String(name), 32, y);
      ctx.fillStyle = String(shade);
      for (let mark = 0; mark < Number(count); mark++) ctx.fillRect(177 + mark * 37, y - 23, 23, 27);
      ctx.fillText(`${count}/10`, 512, y);
    }
  }
  box(scene, [boardWidth, 1.65, .13], [boardX, 2.30, wallFace + .065], 0x7e989a);
  plane(scene, 2.66, 1.546, boardX, 2.30, wallFace + .137, stats.texture);

  const operator = victorAvatar();
  const assistant = victorAvatar({ shirt: 0x4f9185, hair: 0x47352f, skin: 0x9a705d });
  scene.add(operator.root, assistant.root);
  const anchor = { point: new T.Vector3(), target: operator.root.position, radius: 1.43 };
  const anchors = { contactVictor: anchor };
  const step = new T.Vector3();
  const placement = new T.Vector3();
  const approachFrom = new T.Vector3();
  const gripperTarget = new T.Vector3();
  const samplePosition = new T.Vector3();
  let path: T.Vector3[] = [];
  let phase: Phase = 'recording';
  let elapsed = 0;
  let round = 1;
  let seed = 0x1817;
  let resetLayout: ReturnType<typeof newLayout> | undefined;
  let grip = 0;
  let forceFrame = '';
  let feedReady = false;
  let feedTimer = 0;

  function newLayout() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const offsetX = ((seed >>> 9) % 91 - 45) * .01;
    const offsetZ = ((seed >>> 18) % 41 - 20) * .01;
    return { oldMount: mount.position.clone(), oldPiece: piece.position.clone(),
      oldMountYaw: mount.rotation.y, oldPieceYaw: piece.rotation.y,
      target: new T.Vector3(armBenchX + offsetX, 1.032, -3.08 + offsetZ), yaw: (seed % 27 - 13) * .025 };
  }

  function arrangeFixture(layout: ReturnType<typeof newLayout>, progress: number) {
    const { oldMount, oldPiece, oldMountYaw, oldPieceYaw, target, yaw } = layout;
    const slide = T.MathUtils.smoothstep(progress, .20, .78);
    mount.position.copy(oldMount).lerp(target, slide);
    mount.rotation.y = T.MathUtils.lerp(oldMountYaw, yaw, slide);
    samplePosition.copy(target).y = seatedPieceY;
    piece.position.copy(oldPiece).lerp(samplePosition, slide).y += Math.sin(slide * Math.PI) * .26;
    piece.rotation.y = T.MathUtils.lerp(oldPieceYaw, yaw, slide);
  }

  function recordPose() {
    const approach = T.MathUtils.smoothstep(elapsed, 0, 1.25);
    const transit = T.MathUtils.smoothstep(elapsed, 4.16, 5.92);
    const pickupDip = T.MathUtils.smoothstep(elapsed, 1.25, 2.42) - T.MathUtils.smoothstep(elapsed, 3.03, 4.09);
    const releaseDip = T.MathUtils.smoothstep(elapsed, 5.95, 7.02) - T.MathUtils.smoothstep(elapsed, 7.48, recordingLength);
    grip = T.MathUtils.smoothstep(elapsed, 2.42, 2.96) - T.MathUtils.smoothstep(elapsed, 7.05, 7.48);
    placement.copy(mount.position).lerp(staging, transit);
    placement.y = hoverY + (seatedPieceY + gripToPieceCenter - hoverY) * pickupDip +
      (staging.y + gripToPieceCenter - hoverY) * releaseDip;
    placement.lerp(approachFrom, 1 - approach);
    panda.model.worldToLocal(gripperTarget.copy(placement)).sub(restGripper);
    panda.setReach(gripperTarget.x, gripperTarget.y, gripperTarget.z);
    panda.setGrip(grip);
    if (elapsed >= 2.96 && elapsed < 7.48) {
      panda.gripper.localToWorld(samplePosition.set(0, -gripToPieceCenter, 0));
      piece.position.copy(samplePosition);
    } else if (elapsed >= 7.48) piece.position.copy(staging);
    puck.rotation.set((placement.x - mount.position.x) * .25, 0, (placement.y - 1.73) * .38);
    operator.arms[0].rotation.set(-1.22 + (placement.y - 1.7) * .62, 0, placement.x * .15);
    operator.arms[1].rotation.set(-.18, 0, 0);
  }

  function drawForcefield() {
    const ctx = forcefield.ink;
    if (!ctx) return;
    const isRecording = phase === 'recording';
    const response = isRecording ? Math.round(grip * 7) : 0;
    const sample = isRecording ? Math.floor(elapsed * 5) : 0;
    const key = `${phase}:${round}:${response}:${sample}`;
    if (key === forceFrame) return;
    forceFrame = key;
    ctx.fillStyle = '#13262d';
    ctx.fillRect(0, 0, 592, 127);
    ctx.fillStyle = '#c3e9dc';
    ctx.font = 'bold 19px monospace';
    ctx.fillText('TACTILE FORCEFIELD', 14, 27);
    ctx.fillStyle = isRecording ? '#efaa9b' : '#d5cabc';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(isRecording ? `REC  ·  TAKE ${String(round).padStart(2, '0')}` : 'RESETTING FIXTURE', 383, 26);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 19; col++) {
        const x = 16 + col * 30;
        const y = 47 + row * 21;
        if (!response) {
          ctx.fillStyle = '#3d6060';
          ctx.fillRect(x, y, 2, 2);
          continue;
        }
        const strength = Math.max(.16, 1 - Math.hypot((col - 9) * .082, (row - 1.5) * .19));
        const angle = Math.atan2((row - 1.5) * 2.3, col - 9) + Math.sin(sample * .5) * .32;
        const length = 2 + response * strength * 1.6;
        const ex = x + Math.cos(angle) * length;
        const ey = y + Math.sin(angle) * length;
        ctx.strokeStyle = strength > .64 ? '#80e8d1' : '#477e8d';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.lineTo(ex - Math.cos(angle + .64) * 3.1, ey - Math.sin(angle + .64) * 3.1);
        ctx.stroke();
      }
    }
    forcefield.texture.needsUpdate = true;
  }

  function begin(next: Phase, target?: T.Vector3) {
    if (next === 'recording') approachFrom.copy(placement);
    phase = next;
    elapsed = 0;
    path = target ? walkingRoute(space, assistant.root.position, target) : [];
  }

  function walkAssistant(seconds: number) {
    const next = path[0];
    if (!next) return false;
    step.subVectors(next, assistant.root.position);
    const distance = step.length();
    assistant.root.rotation.y = Math.atan2(step.x, step.z);
    if (distance <= seconds * 1.72) {
      assistant.root.position.copy(next);
      path.shift();
    } else assistant.root.position.addScaledVector(step, seconds * 1.72 / distance);
    const stride = Math.sin(elapsed * 10.5) * .44;
    assistant.legs.forEach((leg, i) => { leg.rotation.x = i ? stride : -stride; });
    assistant.arms.forEach((arm, i) => { arm.rotation.x = (i ? -1 : 1) * stride * .62; });
    return true;
  }

  function resetCollection() {
    round = 1;
    seed = 0x1817;
    grip = 0;
    operator.root.position.copy(operatorSpot);
    operator.root.rotation.y = Math.PI;
    assistant.root.position.copy(assistantSpot);
    assistant.root.rotation.y = -2.68;
    for (const joint of [...assistant.legs, ...assistant.arms]) joint.rotation.x = 0;
    anchor.point.copy(operator.root.position).y = 1.76;
    arrangeFixture(newLayout(), 1);
    panda.model.localToWorld(placement.copy(restGripper)).y = hoverY;
    begin('recording');
    recordPose();
    drawForcefield();
    feedReady = false;
  }

  function updateCollection(seconds: number, reducedMotion: boolean, visitor: T.Vector3, talking: boolean) {
    if (talking) {
      operator.root.rotation.y = Math.atan2(visitor.x - operator.root.position.x, visitor.z - operator.root.position.z);
      operator.arms[0].rotation.set(-.25, 0, 0);
      return;
    }
    operator.root.rotation.y = Math.PI;
    if (reducedMotion) return;
    elapsed += seconds;
    if (phase === 'recording') {
      recordPose();
      if (elapsed >= recordingLength) begin('toFixture', fixtureSpot);
    } else if (phase === 'toFixture' || phase === 'returning') {
      if (!walkAssistant(seconds)) {
        for (const joint of [...assistant.legs, ...assistant.arms]) joint.rotation.x = 0;
        if (phase === 'toFixture') {
          resetLayout = newLayout();
          assistant.root.rotation.y = -2.21;
          begin('resetting');
        } else {
          assistant.root.rotation.y = -2.68;
          round++;
          begin('recording');
        }
      }
    } else {
      const progress = Math.min(elapsed / resetLength, 1);
      const reach = -1.10 * Math.sin(Math.PI * progress);
      assistant.arms.forEach((arm, i) => { arm.rotation.x = reach + i * .16; });
      if (resetLayout) arrangeFixture(resetLayout, progress);
      if (elapsed >= resetLength) begin('returning', assistantSpot);
    }
    drawForcefield();
  }

  function renderFeeds(renderer: T.WebGLRenderer, delta: number, animate: boolean) {
    feedTimer -= delta;
    if (feedReady && (!animate || feedTimer > 0)) return;
    feedReady = true;
    feedTimer = 1 / 12;
    const saved = renderer.getRenderTarget();
    monitor.visible = false;
    try {
      for (const { target, camera } of feeds) {
        renderer.setRenderTarget(target);
        renderer.render(scene, camera);
      }
    } finally {
      renderer.setRenderTarget(saved);
      monitor.visible = true;
    }
  }

  resetCollection();
  return { ...space, anchors, resetCollection, updateCollection, renderFeeds };
}
