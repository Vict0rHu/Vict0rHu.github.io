import * as T from 'three';
import { box, cylinder } from './set';
import { victorAvatar } from './victor-avatar';
import { memoryTree, nevadaN } from './unr-models';
import { campusCrowd } from './unr-crowd';
import type { WalkableSpace } from './navigation';
import { campusBuilding, campusPaving, pavedArea } from './unr-campus';
import { recliningGuest, seatedStudent } from './unr-people';
import { unrGrassSpectators, unrLandmarkTrees, unrSeatedStudents, unrLandmarkWalks, onUnrEntryPath } from './unr-content';
import { balloonFlights } from './unr-balloons';
export { outdoorSolarClass } from './unr-solar';
function wire(parent: T.Object3D, points: T.Vector3[], color: number, radius = .018) {
  const curve = new T.CatmullRomCurve3(points);
  const mesh = new T.Mesh(new T.TubeGeometry(curve, 18, radius, 5, false), new T.MeshStandardMaterial({ color, roughness: .85 }));
  parent.add(mesh);
  return mesh;
}
export function balloonMorning(group: T.Group, ground: (x: number, z: number) => number = () => 0) {
  const mat = new T.Group();
  mat.position.set(0, .055, 1.0);
  group.add(mat);
  box(mat, [4.8, .035, 2.35], [0, 0, 0], 0xd5bb9e);
  for (let row = 0; row < 6; row++)
    for (let col = 0; col < 12; col++) {
      if ((row + col) % 2)
        box(mat, [.40, .006, .39], [-2.20 + col * .4, .023, -.98 + row * .39], 0x5f7d92);
    }
  const friends = [0x7287a3, 0xab765f, 0x6c8b76].map((shirt, i) => {
    const person = victorAvatar({ shirt, hair: i === 1 ? 0x593d31 : 0x292936 });
    const reclining = new T.Group();
    reclining.position.set(-1.45 + i * 1.40, .08, 1.68);
    group.add(reclining);
    reclining.add(person.root);
    person.root.rotation.x = -Math.PI / 2;
    person.arms[0].rotation.x = -2.9;
    person.arms[1].rotation.x = -2.8;
    person.arms[0].rotation.z = -.42;
    person.arms[1].rotation.z = .42;
    person.legs[1].rotation.x = .10;
    box(group, [.63, .10, .34], [-1.45 + i * 1.40, .12, .30], 0xd7c3a6);
    return person;
  });
  const picnic = new T.Group();
  picnic.position.set(2.35, .12, 1.48);
  group.add(picnic);
  box(picnic, [.49, .36, .36], [0, .18, 0], 0xa57b53);
  box(picnic, [.39, .025, .25], [0, .38, 0], 0xd8b47f);
  for (const x of [-2.15, 1.9])
    cylinder(group, .075, .18, x, .15, 1.95, 0xe1d4ba);
  const balloons = balloonFlights(group);
  for (const [x, z] of [[-3.7, -2.3], [3.6, -2.4]]) {
    if (onUnrEntryPath(group.position.x + x, group.position.z + z, .65)) continue;
    const tree = new T.Group();
    tree.position.set(x, ground(x, z), z);
    group.add(tree);
    memoryTree(tree, 0, 0, 1.8, true);
  }
  const grassMaterial = new T.MeshStandardMaterial({ color: 0x779257, roughness: 1 });
  const grassGeometry = new T.ConeGeometry(.065, .24, 3);
  for (let i = 0; i < 30; i++) {
    const x = Math.sin(i * 13.4) * 4.6;
    const z = Math.cos(i * 7.7) * 3.8;
    if (onUnrEntryPath(group.position.x + x, group.position.z + z, .2)) continue;
    if (Math.abs(x) < 2.6 && z > -.1 && z < 2.5)
      continue;
    const tuft = new T.Mesh(grassGeometry, grassMaterial);
    tuft.position.set(x, .15 + ground(x, z), z);
    tuft.rotation.z = Math.sin(i) * .15;
    group.add(tuft);
  }
  for (const guest of unrGrassSpectators)
    recliningGuest(group, guest, ground);
  const sunMaterial = new T.MeshBasicMaterial({ color: 0xffdf9f, toneMapped: false });
  sunMaterial.userData.memoryHazeScale = .12;
  const sun = new T.Mesh(new T.SphereGeometry(.45, 24, 16), sunMaterial);
  sun.name = 'distant-morning-sun';
  sun.position.set(-6.8, 1.25, -10.5);
  group.add(sun);
  for (let i = 0; i < 2; i++) {
    const ridge = new T.Mesh(new T.SphereGeometry(1, 24, 12), new T.MeshStandardMaterial({ color: [0xb4a476, 0xa7a37a, 0xc4ad83][i], roughness: 1 }));
    ridge.position.set(-2.7 + i * 1.9, -.65, -3.5 - i * 1.5);
    ridge.scale.set(3.0 - i, .8, 1.15);
    group.add(ridge);
  }
  const dawn = new T.PointLight(0xffb65d, 30, 23, 1.4);
  dawn.position.set(-7, 3, -8);
  group.add(dawn);
  // Long, soft silhouettes on the picnic plateau make the low sun readable.
  for (const [x, z, width, length] of [[-1.4, 1.0, .65, 2.2], [0, 1, .65, 2.2], [1.4, 1, .65, 2.2], [-2.3, 1.8, .35, 1.6]]) {
    const shadow = new T.Mesh(new T.CircleGeometry(1, 24), new T.MeshBasicMaterial({ color: 0x5a564d, transparent: true, opacity: .19, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.rotation.z = -.7;
    shadow.scale.set(width, length, 1);
    shadow.position.set(x + .38, .024, z + .6);
    group.add(shadow);
  }
  return {
    speaker: friends[0].root,
    obstacles: [] satisfies WalkableSpace['obstacles'],
    update(age: number, reduced: boolean) {
      balloons(age, reduced);
    },
  };
}
export function graduationPhoto(group: T.Group) {
  const campus = campusBuilding(group, 'landmark');
  pavedArea(group, [[-4.6, -3.3], [3.8, -3.3], [4.5, -2.2], [4.5, 2.5], [3.5, 3.7], [-3.9, 3.7], [-4.6, 2.6]], campusPaving(), .024, 'nevada-landmark-plaza');
  const landmark = nevadaN();
  landmark.position.set(0, .04, -.65);
  landmark.scale.setScalar(1.20);
  group.add(landmark);
  const victor = victorAvatar({ shirt: 0x1d2b44 });
  victor.root.position.set(1.72, .04, -.2);
  victor.root.rotation.y = .08;
  const gown = new T.Mesh(new T.CylinderGeometry(.27, .38, .98, 16), new T.MeshStandardMaterial({ color: 0x182c49, roughness: .95 }));
  gown.position.set(0, .65, .015);
  victor.dressed.add(gown);
  for (const x of [-.20, -.10, 0, .10, .20]) {
    const pleat = box(victor.dressed, [.026, .68, .022], [x, .53, .32 - Math.abs(x) * .36], 0x293d58);
    pleat.rotation.z = x * .15;
  }
  for (const side of [-1, 1]) {
    const stole = box(victor.dressed, [.12, .52, .035], [side * .13, .95, .20], 0xe7e5d9);
    stole.rotation.z = -side * .28;
    box(victor.arms[side < 0 ? 0 : 1], [.23, .40, .25], [0, -.19, 0], 0x20344e);
  }
  const cap = new T.Group();
  cap.position.set(0, 1.59, 0);
  victor.head.add(cap);
  cylinder(cap, .18, .14, 0, 0, 0, 0x16283f);
  const mortarboard = box(cap, [.49, .045, .49], [0, .085, 0], 0x16283f);
  mortarboard.rotation.y = .28;
  cylinder(cap, .025, .027, 0, .12, 0, 0xcab27e);
  wire(cap, [new T.Vector3(0, .13, 0), new T.Vector3(.22, .11, .1), new T.Vector3(.24, -.17, .1)], 0xd0b777, .009);
  cylinder(cap, .024, .10, .24, -.20, .1, 0xd0b777);
  victor.arms[0].rotation.z = -.42;
  victor.arms[1].rotation.z = .51;
  group.add(victor.root);
  for (const { x, z, height } of unrLandmarkTrees)
    memoryTree(group, x, z, height);
  for (const student of unrSeatedStudents)
    seatedStudent(group, student);
  const photographer = victorAvatar({ shirt: 0xb37e61 });
  photographer.root.name = 'graduation-photographer';
  photographer.root.position.set(1.28, 0, 2.15);
  photographer.root.rotation.y = Math.PI;
  for (const arm of photographer.arms)
    arm.rotation.x = -1.65;
  box(photographer.root, [.30, .18, .13], [0, 1.30, .34], 0x323a4b);
  cylinder(photographer.root, .065, .08, 0, 1.30, .44, 0x738a93).rotation.x = Math.PI / 2;
  group.add(photographer.root);
  const crowd = campusCrowd(group, unrLandmarkWalks);
  return { speaker: victor.root, photoTarget: photographer.root, obstacles: campus.obstacles, update(age: number, reduced: boolean) {
      victor.head.rotation.z = reduced ? -.03 : Math.sin(age * .65) * .045;
      victor.arms[1].rotation.x = reduced ? -.14 : -.14 + Math.sin(age * .8) * .07;
      crowd(age, reduced);
    } };
}
