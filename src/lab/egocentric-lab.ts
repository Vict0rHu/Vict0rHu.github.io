import * as T from 'three';
import { teleopPowerThoughts } from './content';
import { walkingRoute, type WalkableSpace } from './navigation';
import { pandaArm, vrHeadset } from './project-models';
import { box, cylinder } from './set';
import { victorAvatar } from './victor-avatar';

export const egocentricLabSize = { width: 12.8, depth: 9.2 };
const taskDuration = 7.3;
const operatorSpot = new T.Vector3(2.24, 0, .54);
const debugSpot = new T.Vector3(4.84, 0, .99);
const operatorYaw = -.61;
type PowerPhase = 'operating' | 'confused' | 'walkingToPower' | 'checking' | 'returning';

export function equipEgocentricLab(scene: T.Scene) {
  const space: WalkableSpace = {
    bounds: { left: -6.06, right: 6.06, back: -4.25, front: 4.25 },
    obstacles: [],
  };
  const steel = 0x546679;
  const top = 0xb0c4d5;
  function bench(x: number, z: number, width: number, depth: number) {
    box(scene, [width, .14, depth], [x, .89, z], top);
    for (const side of [-1, 1]) {
      for (const end of [-1, 1]) {
        box(scene, [.13, .83, .13], [x + side * (width / 2 - .16), .415, z + end * (depth / 2 - .14)], steel);
      }
    }
    box(scene, [width - .26, .12, .1], [x, .74, z - depth / 2 + .2], steel);
    space.obstacles.push({ left: x - width / 2, right: x + width / 2, back: z - depth / 2, front: z + depth / 2 });
  }

  bench(-1.65, -2.62, 6.60, 2.12);
  bench(3.64, -2.58, 2.85, 1.47);
  box(scene, [4.57, .012, 2.42], [2.13, .007, .68], 0x9aaec6);
  box(scene, [4.62, .025, 1.60], [-1.91, .975, -2.62], 0x456278);
  box(scene, [3.25, .07, .09], [-2.66, 1.27, -4.35], 0x9aaebd);
  box(scene, [2.64, .057, .30], [-2.89, 3.18, -4.19], 0xe5eeff, .56);

  const arm = pandaArm();
  arm.model.position.set(-2.34, .99, -2.55);
  scene.add(arm.model);
  const homePositions = [new T.Vector2(-.43, -.22), new T.Vector2(.43, .15)];
  for (const [index, point] of homePositions.entries()) {
    const x = arm.model.position.x + .87 + point.x;
    const z = arm.model.position.z + point.y;
    box(scene, [.51, .037, .48], [x, 1.005, z], index ? 0x2e736b : 0x385273);
    box(scene, [.29, .012, .28], [x, 1.029, z], index ? 0x6ac1ab : 0x8ab2de);
  }
  const sample = cylinder(scene, .061, .25, 0, 1.159, 0, 0xeab36b);

  // The inset camera is the virtual sensor mounted in the pan–tilt head.
  cylinder(scene, .25, .08, 1.26, 1.0, -1.98, 0x34475d);
  cylinder(scene, .075, .69, 1.26, 1.38, -1.98, steel);
  const pan = new T.Group();
  pan.position.set(1.26, 1.74, -1.98);
  scene.add(pan);
  box(pan, [.42, .13, .26], [0, 0, 0], 0x33455c);
  const tilt = new T.Group();
  tilt.position.y = .16;
  pan.add(tilt);
  box(tilt, [.49, .27, .34], [0, 0, 0], 0x374d67);
  cylinder(tilt, .122, .10, 0, 0, .183, 0x23334f).rotation.x = Math.PI / 2;
  cylinder(tilt, .092, .018, 0, 0, .24, 0x91cceb).rotation.x = Math.PI / 2;
  const eye = new T.PerspectiveCamera(64, 16 / 9, .035, 32);
  eye.position.z = .25;
  eye.rotation.y = Math.PI;
  tilt.add(eye);

  const feed = new T.WebGLRenderTarget(384, 216);
  const feedMaterial = new T.MeshBasicMaterial({ map: feed.texture, toneMapped: false });
  const monitor = new T.Group();
  monitor.position.set(3.62, 2.03, -2.67);
  monitor.rotation.y = -.19;
  scene.add(monitor);
  box(monitor, [2.63, 1.51, .09], [0, 0, 0], 0x24344c);
  box(monitor, [.12, .46, .16], [0, -.84, -.08], steel);
  box(monitor, [.64, .07, .45], [0, -1.035, 0], steel);
  box(monitor, [.35, .03, .01], [-.99, -.713, .053], 0x5d7b9e);
  const screen = new T.Mesh(new T.PlaneGeometry(2.49, 1.40), feedMaterial);
  screen.position.set(0, .015, .052);
  monitor.add(screen);
  const noSignalCanvas = document.createElement('canvas');
  noSignalCanvas.width = 384;
  noSignalCanvas.height = 216;
  const ink = noSignalCanvas.getContext('2d');
  if (ink) {
    ink.fillStyle = '#141d2a';
    ink.fillRect(0, 0, 384, 216);
    ink.fillStyle = '#b6c7dc';
    ink.font = 'bold 26px monospace';
    ink.textAlign = 'center';
    ink.fillText('NO SIGNAL', 192, 117);
  }
  const noSignal = new T.CanvasTexture(noSignalCanvas);
  noSignal.colorSpace = T.SRGBColorSpace;
  const powerLed = box(monitor, [.086, .031, .013], [1.16, -.713, .053], 0x71e5be, .75);
  box(scene, [.83, .035, .32], [3.49, .978, -2.01], 0x324764);

  const cabinetX = 4.56;
  box(scene, [.79, .96, .66], [cabinetX, .48, .12], 0x7890a7);
  box(scene, [.67, .28, .055], [cabinetX, .77, .475], 0x2f4159);
  box(scene, [.23, .115, .019], [cabinetX, .775, .507], 0x172539);
  space.obstacles.push({ left: 4.16, right: 4.96, back: -.21, front: .49 });
  const cableEnd = new T.Group();
  cableEnd.position.set(cabinetX, .54, .64);
  scene.add(cableEnd);
  const cable = new T.CatmullRomCurve3([
    new T.Vector3(4.55, .98, -2.07), new T.Vector3(4.70, .07, -1.55),
    new T.Vector3(4.81, .023, -.89), new T.Vector3(5.18, .026, .67),
    new T.Vector3(4.9, .03, .78), cableEnd.position.clone(),
  ]);
  const cableMaterial = new T.MeshStandardMaterial({ color: 0x2d3a4e, roughness: .84 });
  scene.add(new T.Mesh(new T.TubeGeometry(cable, 36, .034, 6, false), cableMaterial));
  const looseEnd = new T.CatmullRomCurve3([
    new T.Vector3(), new T.Vector3(0, .106, .07), new T.Vector3(0, .225, -.035),
  ]);
  cableEnd.add(new T.Mesh(new T.TubeGeometry(looseEnd, 12, .028, 6, false), cableMaterial));
  box(cableEnd, [.14, .096, .135], [0, .235, -.085], 0x29374c);
  for (const x of [-.032, .032]) box(cableEnd, [.018, .021, .064], [x, .235, -.155], 0xbecdde);

  const { root, head, eyes, arms, legs } = victorAvatar();
  scene.add(root);
  const headPivot = new T.Group();
  headPivot.position.y = 1.34;
  root.add(headPivot);
  headPivot.add(head, eyes);
  head.position.y = eyes.position.y = -1.34;
  const visor = vrHeadset();
  visor.scale.setScalar(.214);
  headPivot.add(visor);
  for (const [index, hand] of arms.entries()) {
    const controller = new T.Group();
    controller.position.set(0, -.385, .077);
    controller.rotation.x = -.19;
    hand.add(controller);
    box(controller, [.075, .142, .068], [0, -.03, 0], 0xdedfeb);
    cylinder(controller, .061, .047, 0, .052, 0, 0xdedfeb);
    cylinder(controller, .019, .016, index ? -.023 : .023, .082, .009, 0x3b4762);
  }

  const anchorVictor = { point: new T.Vector3(), target: root.position, radius: 1.45 };
  const anchors = {
    teleopVictor: anchorVictor,
    teleopPower: { point: new T.Vector3(cabinetX, 1.13, .62), target: debugSpot, radius: 1.04 },
  };
  const travel = new T.Vector3();
  const command = new T.Vector3();
  let powerPhase: PowerPhase = 'operating';
  let phaseTime = 0;
  let taskTime = 0;
  let feedDelay = 0;
  let feedReady = false;
  let path: T.Vector3[] = [];

  function setPower(live: boolean) {
    feedMaterial.map = live ? feed.texture : noSignal;
    feedReady = false;
    powerLed.material.color.setHex(live ? 0x71e5be : 0x465466);
    powerLed.material.emissiveIntensity = live ? .75 : 0;
    cableEnd.rotation.x = live ? 0 : .98;
  }

  function placeSample(time: number) {
    const cycle = Math.floor(time / taskDuration);
    const elapsed = time % taskDuration;
    const from = homePositions[cycle % 2];
    const to = homePositions[1 - cycle % 2];
    const carry = T.MathUtils.smoothstep(elapsed, 2.46, 4.06);
    const dip = Math.max(
      T.MathUtils.smoothstep(elapsed, .22, 1.25) - T.MathUtils.smoothstep(elapsed, 1.70, 2.46),
      T.MathUtils.smoothstep(elapsed, 4.06, 4.88) - T.MathUtils.smoothstep(elapsed, 5.36, 6.16),
    );
    const squeeze = T.MathUtils.smoothstep(elapsed, 1.25, 1.70) - T.MathUtils.smoothstep(elapsed, 4.92, 5.36);
    command.set(T.MathUtils.lerp(from.x, to.x, carry), -.07 - .51 * dip, T.MathUtils.lerp(from.y, to.y, carry));
    arm.setReach(command.x, command.y, command.z);
    arm.setGrip(squeeze);
    if (elapsed >= 1.70 && elapsed < 5.36) {
      sample.position.copy(arm.gripper.position).add(arm.model.position);
      sample.position.y -= .281;
    } else {
      const pad = elapsed < 1.70 ? from : to;
      sample.position.set(arm.model.position.x + .87 + pad.x, 1.158, arm.model.position.z + pad.y);
    }
  }

  function aimFromHead(yaw: number, pitch: number) {
    headPivot.rotation.set(pitch, yaw, 0, 'YXZ');
    pan.rotation.y = -1.76 + headPivot.rotation.y;
    tilt.rotation.x = .30 + headPivot.rotation.x;
  }

  function updateAnchor() {
    anchorVictor.point.copy(root.position).y = 1.76;
  }

  function resetRig() {
    powerPhase = 'operating';
    phaseTime = taskTime = 0;
    path = [];
    root.position.copy(operatorSpot);
    root.rotation.y = operatorYaw;
    visor.position.set(0, .035, .151);
    for (const joint of [...arms, ...legs]) joint.rotation.set(0, 0, 0);
    placeSample(0);
    aimFromHead(0, 0);
    setPower(true);
    updateAnchor();
  }

  function pullPower() {
    if (powerPhase !== 'operating') return;
    setPower(false);
    powerPhase = 'confused';
    phaseTime = 0;
  }

  function updateRig(seconds: number, reducedMotion: boolean, visitor: T.Vector3, talking: boolean) {
    const idle = powerPhase === 'operating';
    if (!talking) phaseTime += seconds;
    visor.position.y = idle ? .035 : .224;
    visor.position.z = idle ? .151 : .071;

    if (talking) {
      root.rotation.y = Math.atan2(visitor.x - root.position.x, visitor.z - root.position.z);
      headPivot.rotation.set(0, 0, 0);
    } else if (idle) {
      root.rotation.y = operatorYaw;
      if (!reducedMotion) taskTime += seconds;
      placeSample(taskTime);
      aimFromHead(.33 * Math.sin(taskTime * 1.02), .13 * Math.sin(taskTime * 1.37 + .2));
    } else if (powerPhase === 'confused') {
      headPivot.rotation.set(-.12, reducedMotion ? .36 : .42 * Math.sin(phaseTime * 5.5), 0);
      if (phaseTime >= 1.55) {
        powerPhase = 'walkingToPower';
        path = walkingRoute(space, root.position, debugSpot);
        if (reducedMotion) root.position.copy(debugSpot);
      }
    } else if (powerPhase === 'checking') {
      root.rotation.y = Math.PI;
      headPivot.rotation.set(.25, 0, 0);
      if (phaseTime >= 1.5) {
        setPower(true);
        powerPhase = 'returning';
        path = walkingRoute(space, root.position, operatorSpot);
        if (reducedMotion) root.position.copy(operatorSpot);
      }
    } else {
      const arrivingAtPlug = powerPhase === 'walkingToPower';
      headPivot.rotation.set(0, 0, 0);
      const next = path[0];
      if (next && !reducedMotion) {
        travel.subVectors(next, root.position);
        const distance = travel.length();
        if (distance > .002) root.rotation.y = Math.atan2(travel.x, travel.z);
        if (distance <= seconds * 1.78) {
          root.position.copy(next);
          path.shift();
        } else root.position.addScaledVector(travel, seconds * 1.78 / distance);
      } else {
        powerPhase = arrivingAtPlug ? 'checking' : 'operating';
        phaseTime = 0;
        path = [];
      }
    }

    const walking = !talking && !reducedMotion && (powerPhase === 'walkingToPower' || powerPhase === 'returning');
    const stride = walking ? Math.sin(phaseTime * 10.2) * .44 : 0;
    legs.forEach((leg, i) => { leg.rotation.x = (i ? -1 : 1) * stride; });
    for (const [i, hand] of arms.entries()) {
      if (talking) hand.rotation.set(i ? -.12 : -.43, 0, 0);
      else if (walking) hand.rotation.set((i ? 1 : -1) * stride * .62, 0, 0);
      else if (idle) hand.rotation.set(-1.05 - command.y * .82 + command.z * .42, 0, (i ? .11 : -.11) + command.x * .58);
      else if (powerPhase === 'checking' && i === 1) hand.rotation.set(-.40 - Math.sin(Math.min(phaseTime / 1.5, 1) * Math.PI) * .55, 0, 0);
      else hand.rotation.set(0, 0, 0);
    }
    updateAnchor();
  }

  function renderFeed(renderer: T.WebGLRenderer, elapsed: number, animate: boolean) {
    if (feedMaterial.map !== feed.texture) return;
    feedDelay -= elapsed;
    if (feedReady && (!animate || feedDelay > 0)) return;
    feedReady = true;
    feedDelay = 1 / 15;
    const previous = renderer.getRenderTarget();
    screen.visible = false;
    try {
      renderer.setRenderTarget(feed);
      renderer.render(scene, eye);
    } finally {
      renderer.setRenderTarget(previous);
      screen.visible = true;
    }
  }

  resetRig();
  return {
    ...space, anchors, resetRig, pullPower, updateRig, renderFeed,
    canPullPower: () => powerPhase === 'operating',
    thought() {
      return powerPhase === 'confused' || powerPhase === 'checking' ? teleopPowerThoughts[powerPhase] : '';
    },
  };
}
