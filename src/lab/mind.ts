import * as T from 'three';
import type { MindPortal } from './content';
import { aoiMachine, inspectionDuration } from './aoi-machine';
import { pandaArm, vrHeadset } from './project-models';
import { box, cylinder } from './set';
import { createMindGuard } from './mind-guard';
import { createMindSpace } from './mind-space';

export function thoughtWorld() {
  const scene = new T.Scene();
  const sky = new T.Color(0xe8eafa);
  const fog = new T.Fog(sky, 15, 43);
  scene.background = sky;
  scene.fog = fog;
  scene.add(new T.HemisphereLight(0xfff6fb, 0x9e94c8, 1.85));
  const rim = new T.DirectionalLight(0xffe8cf, 1.7);
  rim.position.set(4, 8, 6);
  scene.add(rim);

  const bounds = { left: -12.5, right: 12.5, back: -9, front: 9 };
  const aoi = aoiMachine();
  const panda = pandaArm();
  const headset = vrHeadset();
  headset.position.y = .69;
  const portals = [
    { id: 'mindAoi', x: -7.05, z: -1.6, y: .46, color: 0xc65d42, model: aoi.model, yaw: .38, height: 2.0, baseRadius: 1.16 },
    { id: 'mindPanda', x: 1.8, z: -6.4, y: .78, color: 0x147a6d, model: panda.model, yaw: .10, height: 1.75, baseRadius: 1.07 },
    { id: 'mindTeleop', x: 7.1, z: 3.45, y: .34, color: 0x7648c4, model: headset, yaw: -.46, height: 1.2, baseRadius: 1.07 },
  ] as const;
  const anchors = {} as Record<MindPortal, { point: T.Vector3; target: T.Vector3; radius: number }>;
  const obstacles = [];
  aoi.model.scale.setScalar(.91);
  for (const { id, x, z, y, color, model, yaw, height, baseRadius } of portals) {
    const halfWidth = baseRadius - .16;
    obstacles.push({ left: x - halfWidth, right: x + halfWidth, back: z - halfWidth, front: z + halfWidth });
    const base = new T.Mesh(new T.CylinderGeometry(baseRadius, baseRadius * .53, .44, 8),
      new T.MeshStandardMaterial({ color: 0x756b99, flatShading: true }));
    base.position.set(x, y - .22, z);
    scene.add(base);
    cylinder(scene, baseRadius - .04, .106, x, y + .02, z, color);
    const exhibit = new T.Group();
    exhibit.position.set(x, y + .075, z);
    exhibit.rotation.y = yaw;
    exhibit.add(model);
    scene.add(exhibit);
    anchors[id] = { point: new T.Vector3(x, y + height + .18, z), target: new T.Vector3(x, 0, z), radius: baseRadius + 1.05 };
  }

  const clutter: { group: T.Group; y: number; phase: number }[] = [];
  const objects = [
    [-4.35, 2.5, .30, 0xb96b35, 'books'], [4.5, -.35, .55, 0x3e9185, 'board'],
    [-3.67, -5.17, .39, 0xb568af, 'gear'], [7.35, -5.65, .24, 0x4c6db5, 'books'],
    [-9.25, 5.58, .46, 0x795da4, 'board'], [-2.65, 6.55, .48, 0xc16956, 'gear'],
  ] as const;
  for (const [x, z, y, color, kind] of objects) {
    const group = new T.Group();
    group.position.set(x, y, z);
    group.rotation.y = z * .26;
    scene.add(group);
    clutter.push({ group, y, phase: x * 1.1 });
    obstacles.push({ left: x - .65, right: x + .65, back: z - .48, front: z + .48 });
    if (kind === 'books') {
      for (let i = 0; i < 3; i++) {
        const book = new T.Group();
        book.position.y = i * .23;
        book.rotation.y = i * .22 - .18;
        group.add(book);
        box(book, [1.03, .16, .68], [0, 0, 0], 0xffe9c5);
        for (const y of [-.09, .09]) box(book, [1.09, .038, .72], [0, y, 0], i === 1 ? 0xef7ba7 : color);
      }
    } else if (kind === 'board') {
      box(group, [1.22, .13, .84], [0, 0, 0], color);
      box(group, [.43, .115, .42], [0, .09, 0], 0x324169);
      for (const x of [-.47, .47]) for (const z of [-.27, .27]) cylinder(group, .054, .036, x, .08, z, 0xffe5af);
      for (const z of [-.16, .16]) box(group, [.86, .018, .027], [0, .078, z], 0xffe5af);
    } else {
      cylinder(group, .45, .17, 0, .09, 0, color);
      cylinder(group, .2, .13, 0, .22, 0, 0xf9e5ff);
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        box(group, [.24, .18, .19], [Math.cos(angle) * .46, .095, Math.sin(angle) * .46], color).rotation.y = -angle;
      }
    }
  }

  const boundary = new T.BufferGeometry().setFromPoints([
    new T.Vector3(bounds.left, 0, bounds.back), new T.Vector3(bounds.right, 0, bounds.back),
    new T.Vector3(bounds.right, 0, bounds.front), new T.Vector3(bounds.left, 0, bounds.front),
    new T.Vector3(bounds.left, 0, bounds.back),
  ]);
  const edge = new T.Line(boundary, new T.LineDashedMaterial({
    color: 0x7778b4, dashSize: .12, gapSize: .55, opacity: .32, transparent: true,
  }));
  edge.computeLineDistances();
  scene.add(edge);

  const flyThroughSpace = createMindSpace(scene);
  let age = 0;

  function animate(seconds: number) {
    age += seconds;
    const inspection = age % (inspectionDuration + 3.4) - 1.7;
    aoi.pose(Math.max(0, inspection));
    const grip = T.MathUtils.smoothstep(Math.cos(age * 1.95 - 1.2), -.33, .72);
    panda.setGrip(grip);
    headset.position.y = .69 + Math.sin(age * 1.5) * .11;
    headset.rotation.set(Math.sin(age * 1.12) * .12, Math.sin(age * .82) * .44, Math.sin(age * 1.34) * .08);
    for (const item of clutter) item.group.position.y = item.y + Math.sin(age * 1.72 + item.phase) * .13;
    flyThroughSpace(seconds);
  }

  animate(0);
  const guard = createMindGuard(scene, { bounds, obstacles });
  return {
    scene, anchors, spawn: new T.Vector3(0, 0, 1.65),
    bounds, obstacles, guard,
    setDreaming(dreaming: boolean) {
      sky.setHex(dreaming ? 0xb6badb : 0xe8eafa);
      fog.color.copy(sky);
    },
    hoverHeight(position: T.Vector3, reducedMotion: boolean) {
      return .43 + .19 * Math.cos(position.x * .66) + .16 * Math.cos(position.z * .81) +
        (reducedMotion ? 0 : Math.sin(age * 3.4) * .09);
    },
    update: animate,
  };
}
