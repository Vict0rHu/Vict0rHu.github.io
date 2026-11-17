import * as T from 'three';
import { box, cylinder } from './set';

// Stylized SO-101 follower. The separate pivots follow the real arm's joint layout.
export function deskArm(parent: T.Object3D) {
  const arm = new T.Group();
  arm.position.set(.64, 1.04, .04);
  arm.rotation.y = -.27;
  parent.add(arm);
  const shell = 0xe4a565;
  const motor = 0x333a47;
  const horn = 0xbbc4cb;
  cylinder(arm, .24, .09, 0, .045, 0, motor);
  for (const x of [-.17, .17]) {
    for (const z of [-.12, .12]) cylinder(arm, .023, .013, x, .099, z, horn);
  }

  function pivot(parent: T.Group, y: number) {
    const joint = new T.Group();
    joint.position.y = y;
    parent.add(joint);
    return joint;
  }

  function servo(parent: T.Group, width: number, color = motor) {
    box(parent, [width, .19, .21], [0, 0, 0], color);
    cylinder(parent, .071, .025, 0, .004, .119, horn).rotation.x = Math.PI / 2;
    cylinder(parent, .022, .026, 0, .004, .134, motor).rotation.x = Math.PI / 2;
  }

  function link(parent: T.Group, length: number, width: number) {
    for (const z of [-.103, .103]) box(parent, [width, length, .045], [0, length / 2, z], shell);
    box(parent, [width * .77, .06, .19], [0, length * .63, 0], motor);
  }

  const pan = pivot(arm, .14);
  cylinder(pan, .172, .112, 0, 0, 0, horn);
  box(pan, [.25, .15, .25], [0, .093, 0], motor);
  const shoulder = pivot(pan, .22);
  shoulder.rotation.z = .31;
  servo(shoulder, .28);
  link(shoulder, .44, .16);
  const elbow = pivot(shoulder, .46);
  elbow.rotation.z = .98;
  servo(elbow, .245);
  link(elbow, .39, .14);
  const wrist = pivot(elbow, .40);
  wrist.rotation.z = .73;
  servo(wrist, .197);
  const roll = pivot(wrist, .13);
  roll.rotation.y = .38;
  cylinder(roll, .079, .09, 0, .035, 0, horn);
  box(roll, [.18, .099, .15], [0, .115, 0], motor);
  for (const side of [-1, 1]) {
    const jaw = box(roll, [.051, .16, .077], [side * .09, .211, 0], shell);
    jaw.rotation.z = side * -.17;
    box(jaw, [.045, .055, .081], [0, .067, 0], motor);
  }
}
