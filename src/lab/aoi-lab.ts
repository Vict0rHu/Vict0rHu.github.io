import * as T from 'three';
import { aoiMachine, inspectionDuration } from './aoi-machine';
import { enclosedPrinter } from './enclosed-printer';
import { walkingRoute, type WalkableSpace } from './navigation';
import { box, cylinder } from './set';
import { victorAvatar } from './victor-avatar';

export const aoiLabSize = { width: 14, depth: 10.2 };

function boardFace(parent: T.Object3D, size: [number, number], x: number, y: number, z: number,
  draw: (ink: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = Math.round(canvas.width * size[1] / size[0]);
  const ink = canvas.getContext('2d');
  if (ink) draw(ink);
  const map = new T.CanvasTexture(canvas);
  map.colorSpace = T.SRGBColorSpace;
  const face = new T.Mesh(new T.PlaneGeometry(...size), new T.MeshBasicMaterial({ map, toneMapped: false }));
  face.position.set(x, y, z);
  parent.add(face);
}

export function equipAoiLab(scene: T.Scene) {
  const space: WalkableSpace = {
    bounds: { left: -6.65, right: 6.65, back: -4.73, front: 4.75 },
    obstacles: [],
  };
  const steel = 0x596978;
  const worktop = 0xd3dce1;
  box(scene, [13.5, .1, .09], [0, 1.19, -4.89], 0x95a8b0);
  for (const x of [-5.5, -2.45, 2.32, 5.5]) {
    box(scene, [.29, .16, .05], [x, 1.22, -4.827], 0xe5ecee);
    for (const side of [-1, 1]) box(scene, [.035, .061, .012], [x + side * .064, 1.22, -4.798], steel);
  }
  box(scene, [4.58, .014, 3.72], [0, .007, -2.78], 0x728d98);
  for (const x of [-2.26, 2.26]) box(scene, [.037, .007, 3.63], [x, .018, -2.78], 0xc7c6a0);
  box(scene, [4.53, .007, .035], [0, .018, -.94], 0xc7c6a0);
  box(scene, [2.94, .012, 1.14], [-4.63, .008, 1.34], 0x779295);

  function bench(x: number, z: number, width: number, depth: number) {
    const model = new T.Group();
    model.position.set(x, 0, z);
    scene.add(model);
    box(model, [width, .13, depth], [0, .915, 0], worktop);
    box(model, [width - .26, .14, .09], [0, .779, depth / 2 - .16], steel);
    box(model, [width - .28, .11, .08], [0, .22, .16 - depth / 2], steel);
    for (const side of [-1, 1]) {
      for (const front of [-1, 1]) {
        box(model, [.14, .85, .14], [side * (width / 2 - .17), .425, front * (depth / 2 - .16)], steel);
      }
    }
    space.obstacles.push({ left: x - width / 2, right: x + width / 2, back: z - depth / 2, front: z + depth / 2 });
    return model;
  }

  function drawerCabinet(bench: T.Group, x: number, width: number) {
    box(bench, [width, .72, .91], [x, .43, -.12], 0x869da7);
    for (const y of [.235, .44, .645]) {
      box(bench, [width - .075, .171, .033], [x, y, .345], 0xb1c5ca);
      box(bench, [.24, .024, .043], [x, y + .039, .375], steel);
    }
  }

  const imaging = bench(0, -3.07, 3.95, 1.98);
  const machine = aoiMachine();
  machine.model.position.set(0, .98, -.14);
  machine.model.scale.setScalar(1.23);
  imaging.add(machine.model);
  for (const x of [-1.43, 1.43]) {
    box(imaging, [.41, .047, 1.19], [x, 1.005, -.29], 0x90a7b0);
  }
  box(imaging, [.56, .16, .43], [-1.42, 1.11, -.03], 0x536b79);
  box(imaging, [.49, .045, .38], [-1.42, 1.214, -.03], 0x9fb9c1);
  box(imaging, [.35, .09, .24], [1.42, 1.029, .81], steel);
  const startButton = cylinder(imaging, .073, .055, 1.42, 1.095, .81, 0x59c897);
  startButton.material.emissive.setHex(0x3ad388);
  startButton.material.emissiveIntensity = .25;

  const printing = bench(-4.5, -3.25, 2.72, 1.53);
  drawerCabinet(printing, -.65, .94);
  const printer = enclosedPrinter();
  printer.model.position.set(-.16, .98, -.055);
  printer.model.scale.setScalar(1.20);
  printing.add(printer.model);
  for (const [i, color] of [0x86b5a5, 0xc79587].entries()) {
    cylinder(printing, .21, .115, .74, 1.04 + i * .115, .24, color);
    cylinder(printing, .071, .038, .74, 1.103 + i * .115, .24, 0x615f6c);
  }

  const electronics = bench(-4.63, .13, 2.66, 1.54);
  drawerCabinet(electronics, .67, .96);
  box(electronics, [2.51, .78, .071], [0, 1.64, -.66], 0x79979d);
  for (const x of [-.98, -.68, -.38, -.08, .22, .52, .82]) {
    for (const y of [1.43, 1.65, 1.87]) box(electronics, [.023, .023, .016], [x, y, -.614], 0x4f646d);
  }
  for (const [x, y, color] of [[-.86, 1.68, 0xd0a368], [-.62, 1.75, 0x5e697a], [-.4, 1.65, 0x8bada0]]) {
    box(electronics, [.04, .32, .06], [x, y, -.57], 0xbec7cb);
    box(electronics, [.09, .15, .08], [x, y - .122, -.53], color);
  }
  box(electronics, [2.48, .097, .53], [0, 2.07, -.43], 0xa8bac3);
  box(electronics, [1.6, .028, .07], [0, 2.013, -.21], 0xe5f2fc, .65);
  for (const [i, color] of [0x91abbb, 0xbbafa2, 0x8eafad].entries()) {
    box(electronics, [.39, .27, .38], [.05 + i * .44, 2.247, -.445], color);
    box(electronics, [.18, .054, .025], [.05 + i * .44, 2.268, -.244], 0xdce5e4);
  }
  box(electronics, [1.44, .018, .84], [0, .99, .03], 0x588d89);
  box(electronics, [.49, .052, .34], [-.27, 1.02, .12], 0x3c7f6a);
  box(electronics, [.17, .05, .15], [-.27, 1.07, .12], 0x323b56);
  for (const x of [-.45, -.38, -.18, -.11]) {
    box(electronics, [.055, .025, .055], [x, 1.06, .045], 0xc9b381);
  }
  box(electronics, [.49, .29, .44], [.69, 1.125, -.21], 0x313d50);
  box(electronics, [.28, .10, .016], [.64, 1.15, .016], 0x75e1b0, .48);
  box(electronics, [.41, .05, .17], [.59, 1.016, .28], 0x696c78);
  cylinder(electronics, .045, .31, .58, 1.09, .29, 0x2e3545).rotation.z = Math.PI / 2;
  cylinder(electronics, .020, .18, .36, 1.09, .29, 0xb7bac8).rotation.z = Math.PI / 2;
  cylinder(electronics, .115, .055, -.9, 1.02, -.22, 0xa8b3c0);
  cylinder(electronics, .048, .063, -.9, 1.029, -.22, 0xceaa76);

  const cad = bench(4.44, -2.9, 2.93, 1.69);
  drawerCabinet(cad, .91, .72);
  box(cad, [.36, .05, .32], [.10, 1.005, -.28], 0x414658);
  box(cad, [.095, .27, .09], [.10, 1.155, -.28], 0x414658);
  box(cad, [1.64, .95, .09], [.10, 1.67, -.31], 0x283347);
  boardFace(cad, [1.52, .81], .10, 1.68, -.257, ink => {
    ink.fillStyle = '#25364d';
    ink.fillRect(0, 0, 512, 273);
    ink.fillStyle = '#3d526a';
    ink.fillRect(0, 0, 512, 33);
    ink.fillRect(0, 33, 89, 240);
    ink.fillStyle = '#d1e4f7';
    ink.font = 'bold 15px monospace';
    ink.fillText('Optics mount  /  rev 12', 14, 22);
    ink.font = '12px monospace';
    for (const [i, part] of ['Sketch', 'Extrude', 'Cutout', 'Fillet'].entries()) {
      ink.fillText(part, 12, 65 + i * 29);
    }
    ink.strokeStyle = '#7dcfce';
    ink.lineWidth = 3;
    ink.strokeRect(154, 113, 256, 69);
    ink.strokeRect(184, 78, 256, 69);
    for (const [x, y] of [[154, 113], [410, 113], [154, 182], [410, 182]]) {
      ink.beginPath();
      ink.moveTo(x, y);
      ink.lineTo(x + 30, y - 35);
      ink.stroke();
    }
  });
  box(cad, [.87, .037, .28], [.04, 1.005, .36], 0x353e50);
  box(cad, [.15, .062, .22], [.70, 1.025, .39], 0x323c50);
  box(cad, [.32, .012, .44], [-.9, .992, .22], 0xe6d9c2).rotation.y = -.15;

  box(scene, [2.77, 1.41, .085], [3.65, 2.65, -4.84], 0x9a9ba6);
  boardFace(scene, [2.64, 1.29], 3.65, 2.65, -4.79, ink => {
    ink.fillStyle = '#f4f1e8';
    ink.fillRect(0, 0, 512, 250);
    ink.fillStyle = '#35405b';
    ink.font = 'bold 31px sans-serif';
    ink.fillText('AOI test plan', 25, 47);
    ink.font = '23px sans-serif';
    ink.fillText('1. Check tray alignment', 25, 91);
    ink.fillText('2. Capture 4 positions', 25, 128);
    ink.fillText('3. Compare stress maps', 25, 165);
    ink.fillStyle = '#9271a2';
    ink.fillText('R  →  B  →  G', 25, 213);
    ink.strokeStyle = '#4a8578';
    ink.lineWidth = 4;
    ink.strokeRect(371, 78, 96, 96);
    for (const [x, y] of [[398, 105], [440, 105], [398, 145], [440, 145]]) {
      ink.beginPath();
      ink.arc(x, y, 7, 0, Math.PI * 2);
      ink.stroke();
    }
  });
  box(scene, [1.30, .45, .125], [-.44, 3.08, -4.83], 0x233045);
  boardFace(scene, [1.14, .31], -.44, 3.08, -4.765, ink => {
    ink.fillStyle = '#152832';
    ink.fillRect(0, 0, 512, 139);
    ink.fillStyle = '#a6f1d5';
    ink.font = 'bold 95px monospace';
    ink.fillText('3:47', 23, 101);
    ink.font = 'bold 54px monospace';
    ink.fillText('AM', 319, 99);
  });

  const { root, arms, legs } = victorAvatar();
  scene.add(root);
  const stations = [
    { point: new T.Vector3(1.22, 0, -1.78), yaw: Math.atan2(.2, -.48), wait: .9 },
    { point: new T.Vector3(4.25, 0, -1.66), yaw: Math.PI, wait: 5.1 },
    { point: new T.Vector3(3.14, 0, -4.30), yaw: Math.PI, wait: 3.8 },
    { point: new T.Vector3(-4.55, 0, -2.16), yaw: Math.PI, wait: 4.2 },
    { point: new T.Vector3(-4.6, 0, 1.25), yaw: Math.PI, wait: 5.1 },
  ];
  const victor = { point: new T.Vector3(), target: root.position, radius: 1.4 };
  const anchors = {
    aoiInspection: { point: new T.Vector3(0, 3.72, -2.63), target: new T.Vector3(0, 0, -1.48), radius: 1.48 },
    aoiVictor: victor,
  };
  const toward = new T.Vector3();
  let station = 0;
  let waiting = 0;
  let time = 0;
  let inspection = inspectionDuration;
  let watchingInspection = false;
  let route: T.Vector3[] = [];

  function resetLab() {
    station = 0;
    waiting = stations[0].wait;
    route = [];
    time = 0;
    watchingInspection = false;
    root.position.copy(stations[0].point);
    root.rotation.y = stations[0].yaw;
    victor.point.copy(root.position).y = 1.75;
    for (const joint of [...legs, ...arms]) joint.rotation.x = 0;
    inspection = inspectionDuration;
    machine.pose(0);
  }

  function runInspection(reducedMotion: boolean) {
    if (inspection < inspectionDuration) return;
    inspection = reducedMotion ? inspectionDuration : 0;
    machine.pose(inspection);
  }

  function readyToLeave(seconds: number) {
    if (station === 0 && watchingInspection && inspection < inspectionDuration) return false;
    waiting -= seconds;
    if (waiting > 0) return false;
    if (station !== 0 || watchingInspection) return true;
    runInspection(false);
    watchingInspection = true;
    waiting = .95;
    return false;
  }

  function updateLab(seconds: number, reducedMotion: boolean, visitor: T.Vector3, talking: boolean) {
    if (!reducedMotion) {
      if (inspection < inspectionDuration) {
        inspection = Math.min(inspection + seconds, inspectionDuration);
        machine.pose(inspection);
      }
      time += seconds;
      printer.head.position.x = -.08 + Math.sin(time * 3.1) * .23;
    }
    if (talking) root.rotation.y = Math.atan2(visitor.x - root.position.x, visitor.z - root.position.z);
    else if (!reducedMotion) {
      const next = route[0];
      if (next) {
        toward.subVectors(next, root.position);
        const length = toward.length();
        root.rotation.y = Math.atan2(toward.x, toward.z);
        if (length <= seconds * 1.65) {
          root.position.copy(next);
          route.shift();
          if (!route.length) waiting = stations[station].wait;
        } else root.position.addScaledVector(toward, seconds * 1.65 / length);
      } else {
        root.rotation.y = stations[station].yaw;
        if (readyToLeave(seconds)) {
          watchingInspection = false;
          station = (station + 1) % stations.length;
          route = walkingRoute(space, root.position, stations[station].point);
        }
      }
    }
    const walking = !talking && route.length > 0;
    const atMachine = station === 0 && !walking;
    const pressingStart = atMachine && !watchingInspection && !reducedMotion
      ? Math.sin(Math.PI * T.MathUtils.clamp(waiting / stations[0].wait, 0, 1)) : 0;
    startButton.material.emissiveIntensity = inspection < inspectionDuration ? .95 : .25;
    const stride = walking ? Math.sin(time * 10) * .47 : 0;
    const reach = station === 2 ? -.54 : -.33;
    legs.forEach((leg, i) => { leg.rotation.x = (i ? 1 : -1) * stride; });
    arms.forEach((arm, i) => {
      arm.rotation.x = talking ? (i === 0 ? -.34 : 0) : walking ? (i ? -1 : 1) * stride * .63 :
        atMachine ? (i === 0 ? -1.27 * pressingStart : 0) : reach + Math.sin(time * (4 + i) + i * 2) * .13;
    });
    victor.point.copy(root.position).y = 1.75;
  }

  resetLab();
  return { ...space, anchors, resetLab, runInspection, updateLab };
}
