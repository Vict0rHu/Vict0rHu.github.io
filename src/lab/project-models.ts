import * as T from 'three';
import { box, cylinder } from './set';

export function pandaArm() {
  const model = new T.Group();
  const metal = 0x293548;
  const white = new T.MeshStandardMaterial({ color: 0xf1f3f5, roughness: .56 });
  cylinder(model, .32, .14, -.4, .07, 0, metal);
  const points = [[0, .2], [-.15, .78], [.23, 1.45], [.85, 1.59], [1.22, 1.36], [1.27, 1.03]]
    .map(([x, y]) => new T.Vector3(x - .4, y, 0));
  const jointPositions = points.map(point => point.clone());
  const up = new T.Vector3(0, 1, 0);
  const direction = new T.Vector3();
  const links: { link: T.Mesh; length: number }[] = [];
  const joints: T.Group[] = [];
  for (let i = 1; i < points.length; i++) {
    direction.subVectors(points[i], points[i - 1]);
    const radius = i < 3 ? .14 : .106;
    const link = new T.Mesh(new T.CapsuleGeometry(radius, direction.length() - radius, 4, 12), white);
    link.position.copy(points[i]).lerp(points[i - 1], .5);
    link.quaternion.setFromUnitVectors(up, direction.normalize());
    model.add(link);
    links.push({ link, length: points[i].distanceTo(points[i - 1]) });
    if (i < points.length - 1) {
      const joint = new T.Group();
      joint.position.copy(points[i]);
      model.add(joint);
      cylinder(joint, radius * .93, .29, 0, 0, 0, metal).rotation.x = Math.PI / 2;
      cylinder(joint, radius * .59, .018, 0, 0, .151, 0x94a6ba).rotation.x = Math.PI / 2;
      joints.push(joint);
    }
  }
  const gripper = new T.Group();
  gripper.position.copy(points[points.length - 1]);
  model.add(gripper);
  box(gripper, [.34, .14, .25], [0, -.04, 0], metal);
  const jaws = [-1, 1].map(side => {
    const jaw = new T.Group();
    gripper.add(jaw);
    box(jaw, [.058, .28, .13], [0, -.21, 0], 0x394962);
    const sensor = box(jaw, [.024, .109, .11], [-side * .026, -.288, 0], 0x57ddc1, .18);
    return { jaw, sensor, side };
  });

  function setGrip(closed: number) {
    for (const { jaw, sensor, side } of jaws) {
      jaw.position.x = side * T.MathUtils.lerp(.186, .093, closed);
      sensor.material.emissiveIntensity = .18 + closed * 1.1;
    }
  }
  function setReach(x: number, y: number, z: number) {
    const response = [0, 0, .17, .48, .81, 1];
    jointPositions.forEach((point, i) => {
      const weight = response[i];
      point.set(points[i].x + x * weight, points[i].y + y * weight, points[i].z + z * weight);
    });
    links.forEach(({ link, length }, i) => {
      direction.subVectors(jointPositions[i + 1], jointPositions[i]);
      link.position.copy(jointPositions[i]).lerp(jointPositions[i + 1], .5);
      link.scale.y = direction.length() / length;
      link.quaternion.setFromUnitVectors(up, direction.normalize());
    });
    joints.forEach((joint, i) => joint.position.copy(jointPositions[i + 1]));
    gripper.position.copy(jointPositions[jointPositions.length - 1]);
  }
  setGrip(0);
  return { model, setGrip, setReach, gripper };
}

export function vrHeadset() {
  const model = new T.Group();
  const shell = new T.Mesh(new T.SphereGeometry(1, 28, 16), new T.MeshStandardMaterial({ color: 0xf2f1f8, roughness: .6 }));
  shell.scale.set(.98, .43, .37);
  model.add(shell);
  const cushion = new T.Mesh(new T.SphereGeometry(1, 24, 14), new T.MeshStandardMaterial({ color: 0x2c2941, roughness: .88 }));
  cushion.scale.set(.89, .36, .27);
  cushion.position.z = -.23;
  model.add(cushion);
  const strap = new T.Mesh(new T.TorusGeometry(.72, .074, 8, 36), new T.MeshStandardMaterial({ color: 0xbab5cb, roughness: .88 }));
  strap.rotation.x = Math.PI / 2;
  strap.scale.y = .75;
  strap.position.set(0, .06, -.52);
  model.add(strap);
  for (const x of [-.37, 0, .37]) {
    const sensor = new T.Mesh(new T.CapsuleGeometry(.066, .105, 4, 12), new T.MeshStandardMaterial({ color: 0x292b43 }));
    sensor.position.set(x, -.02, x === 0 ? .372 : .343);
    sensor.rotation.z = x * .43;
    model.add(sensor);
    cylinder(model, .03, .022, x + .011, .014, sensor.position.z + .064, 0x8a9dcb).rotation.x = Math.PI / 2;
  }
  return model;
}
