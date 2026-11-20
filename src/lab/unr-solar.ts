import * as T from 'three';
import { box, cylinder } from './set';
import { victorAvatar } from './victor-avatar';
import { memoryTree } from './unr-models';
import { campusCrowd } from './unr-crowd';
import { campusBuilding, roundCampusPlaza } from './unr-campus';
import { onSolarPaving, onUnrEntryPath, unrSolarTrees, unrSolarWalks } from './unr-content';

function wire(parent: T.Object3D, points: T.Vector3[], color: number) {
  const curve = new T.CatmullRomCurve3(points);
  const mesh = new T.Mesh(new T.TubeGeometry(curve, 18, .018, 5, false), new T.MeshStandardMaterial({ color, roughness: .85 }));
  parent.add(mesh);
}

export function outdoorSolarClass(group: T.Group) {
  roundCampusPlaza(group);
  const campus = campusBuilding(group, 'quad');
  const panel = new T.Group();
  panel.position.set(-.72, 1.10, -.40);
  panel.name = 'solar-panel-facing-visitor';
  panel.rotation.x = .42;
  group.add(panel);
  box(panel, [2.35, .085, 1.68], [0, 0, 0], 0xc5ced1);
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 6; col++) {
      box(panel, [.35, .024, .36], [-.97 + col * .388, .058, -.60 + row * .397], 0x254b73, .09);
      box(panel, [.012, .006, .32], [-.97 + col * .388, .074, -.60 + row * .397], 0x7aa1bd, .16);
    }
  for (const x of [-.95, .95]) for (const z of [-.62, .62]) {
    const top = new T.Vector3(x, -.06, z).applyAxisAngle(new T.Vector3(1, 0, 0), panel.rotation.x).add(panel.position);
    box(group, [.09, top.y, .09], [top.x, top.y / 2, top.z], 0x8f9696);
  }
  const storage = new T.Group();
  storage.name = 'solar-storage-test-equipment';
  storage.position.set(1.65, 0, -.72);
  group.add(storage);
  box(storage, [1.22, 1.42, .64], [0, .74, 0], 0xd9d8ce);
  box(storage, [1.09, 1.23, .041], [0, .74, .35], 0x4c6870);
  for (const y of [.39, .74, 1.09]) {
    box(storage, [.93, .26, .12], [0, y, .38], 0x37414b);
    for (const x of [-.35, .35])
      box(storage, [.075, .045, .035], [x, y + .09, .46], x < 0 ? 0xc1775d : 0x638fa0);
  }
  box(storage, [.62, .25, .08], [0, 1.67, .02], 0xeee4cd);
  const charge = box(storage, [.42, .14, .025], [0, 1.68, .066], 0x589783, .32);
  cylinder(storage, .043, .06, .43, 1.68, .03, 0x83c2a2);
  wire(group, [new T.Vector3(.30, .83, -.2), new T.Vector3(.73, .33, -.05), new T.Vector3(1.15, .52, -.4)], 0xb96b54);
  const victor = victorAvatar();
  victor.root.name = 'victor-measuring-storage';
  victor.root.position.set(1.65, 0, .40);
  victor.root.rotation.y = Math.PI;
  victor.arms[0].rotation.x = -1.1;
  victor.arms[1].rotation.x = -1.28;
  group.add(victor.root);
  const meter = new T.Group();
  meter.position.set(0, -.40, .07);
  meter.rotation.x = .28;
  victor.arms[0].add(meter);
  box(meter, [.21, .31, .09], [0, 0, 0], 0xd9b34c);
  box(meter, [.16, .095, .017], [0, .082, .054], 0xa8c5aa, .12);
  cylinder(meter, .047, .018, 0, -.055, .054, 0x364447).rotation.x = Math.PI / 2;
  const probe = box(victor.arms[1], [.028, .19, .028], [0, -.43, .12], 0xb44a43);
  probe.name = 'multimeter-probe';
  box(probe, [.012, .12, .012], [0, -.13, 0], 0xc5ced3);
  group.updateWorldMatrix(true, true);
  const lead = new T.Line(new T.BufferGeometry().setFromPoints(Array.from({ length: 15 }, () => new T.Vector3())), new T.LineBasicMaterial({ color: 0xb65349 }));
  group.add(lead);
  const sample = new T.Vector3();
  const meterPoint = new T.Vector3(), probePoint = new T.Vector3();
  const leadCurve = new T.CatmullRomCurve3([meterPoint, new T.Vector3(1.65, .75, .06), probePoint]);
  const referenceLead = new T.Line(new T.BufferGeometry().setFromPoints(Array.from({ length: 15 }, () => new T.Vector3())), new T.LineBasicMaterial({ color: 0x33414c }));
  group.add(referenceLead);
  const referenceCurve = new T.CatmullRomCurve3([meterPoint, new T.Vector3(2.15, .68, .02), new T.Vector3(2.0, .83, -.24)]);
  const students = [
    { x: -2.92, z: .04, shirt: 0xa77963 }, { x: -.05, z: 1.65, shirt: 0x799779 }, { x: 3.10, z: 1.25, shirt: 0x8b83a0 },
  ].map(({ x, z, shirt }, i) => {
    const person = victorAvatar({ shirt, hair: i % 2 ? 0x594034 : 0x292d34 });
    person.root.position.set(x, 0, z);
    person.root.rotation.y = Math.atan2(-.6 - x, -.3 - z);
    person.arms[0].rotation.x = -.5;
    person.arms[1].rotation.x = -.4;
    group.add(person.root);
    return person;
  });
  const noteTaker = students[2];
  noteTaker.root.name = 'classmate-taking-notes';
  noteTaker.root.rotation.y = -1.8;
  noteTaker.arms[0].rotation.x = -1.1;
  noteTaker.arms[1].rotation.x = -1.2;
  const notebook = new T.Group();
  notebook.name = 'field-notebook';
  notebook.position.set(0, .96, .39);
  notebook.rotation.x = .17;
  noteTaker.root.add(notebook);
  box(notebook, [.44, .035, .48], [0, 0, 0], 0x3e596c);
  box(notebook, [.39, .014, .43], [.012, .026, 0], 0xf0e7ce);
  for (let row = 0; row < 5; row++)
    box(notebook, [.26, .006, .009], [.03, .037, -.13 + row * .057], 0x99a8a9);
  const pen = box(noteTaker.arms[1], [.018, .17, .018], [0, -.39, .09], 0x304c70);
  pen.rotation.z = -.3;
  const crowd = campusCrowd(group, unrSolarWalks);
  for (const { x, z, height } of unrSolarTrees) {
    if (onSolarPaving(x, z, 1.35) || onUnrEntryPath(group.position.x + x, group.position.z + z, height * .32)) continue;
    memoryTree(group, x, z, height);
  }
  return {
    speaker: victor.root,
    obstacles: campus.obstacles,
    update(age: number, reduced: boolean) {
      const measuring = reduced ? 0 : Math.sin(age * 1.15) * .035;
      victor.arms[1].rotation.x = -1.28 + measuring;
      victor.head.rotation.y = reduced ? 0 : Math.sin(age * .49) * .13;
      for (const [i, student] of students.entries()) {
        if (student === noteTaker) {
          student.head.rotation.x = .2;
          student.head.rotation.y = reduced ? -.07 : -.07 + Math.sin(age * .45) * .10;
          student.arms[1].rotation.x = -1.2 + (reduced ? 0 : Math.sin(age * 9) * .035);
          student.arms[1].rotation.z = reduced ? .05 : .05 + Math.sin(age * 6.3) * .035;
          continue;
        }
        student.head.rotation.y = reduced ? 0 : Math.sin(age * .63 + i) * .23;
        student.arms[1].rotation.x = -.45 + (reduced ? 0 : Math.max(0, Math.sin(age * .7 + i)) * -.38);
      }
      charge.material.emissiveIntensity = .25 + (reduced ? 0 : .12 * Math.sin(age * .9));
      group.updateWorldMatrix(true, true);
      meter.getWorldPosition(meterPoint);
      probe.getWorldPosition(probePoint);
      group.worldToLocal(meterPoint);
      group.worldToLocal(probePoint);
      for (const [line, curve] of [[lead, leadCurve], [referenceLead, referenceCurve]] as const) {
        const position = line.geometry.attributes.position;
        for (let i = 0; i < position.count; i++) {
          curve.getPoint(i / (position.count - 1), sample);
          position.setXYZ(i, sample.x, sample.y, sample.z);
        }
        position.needsUpdate = true;
        line.geometry.computeBoundingSphere();
      }
      crowd(age, reduced);
    },
  };
}
