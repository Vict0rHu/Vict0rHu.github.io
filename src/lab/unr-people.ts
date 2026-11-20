import * as T from 'three';
import { victorAvatar } from './victor-avatar';
import { box } from './set';
type Guest = {
  x: number;
  z: number;
  yaw: number;
  shirt: number;
};
export function recliningGuest(parent: T.Group, guest: Guest, ground: (x: number, z: number) => number) {
  const surface = new T.Group();
  surface.name = 'grass-balloon-spectator';
  surface.position.set(guest.x, ground(guest.x, guest.z) + .08, guest.z);
  const dx = (ground(guest.x + .15, guest.z) - ground(guest.x - .15, guest.z)) / .3;
  const dz = (ground(guest.x, guest.z + .15) - ground(guest.x, guest.z - .15)) / .3;
  surface.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(-dx, 1, -dz).normalize());
  const pose = new T.Group();
  pose.rotation.y = guest.yaw;
  surface.add(pose);
  parent.add(surface);
  const person = victorAvatar({ shirt: guest.shirt });
  person.root.rotation.x = -Math.PI / 2;
  person.root.position.z = .8;
  person.arms[0].rotation.x = -2.9;
  person.arms[1].rotation.x = -2.8;
  person.arms[0].rotation.z = -.38;
  person.arms[1].rotation.z = .38;
  person.legs[1].rotation.x = .12;
  pose.add(person.root);
}
export function seatedStudent(parent: T.Group, guest: Guest) {
  const seat = new T.Group();
  seat.name = 'student-under-tree';
  seat.position.set(guest.x, .012, guest.z);
  seat.rotation.y = guest.yaw;
  parent.add(seat);
  const person = victorAvatar({ shirt: guest.shirt });
  person.root.position.y = -.50;
  person.legs[0].rotation.set(-1.45, 0, -.13);
  person.legs[1].rotation.set(-1.45, 0, .16);
  person.arms[0].rotation.x = -.85;
  person.arms[1].rotation.x = -.95;
  person.head.rotation.x = .12;
  seat.add(person.root);
  box(seat, [.28, .035, .22], [0, .33, .34], 0xdbd4b9);
}
