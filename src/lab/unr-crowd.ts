import * as T from 'three';
import { victorAvatar } from './victor-avatar';
type Stop = {
  x: number;
  z: number;
  pause?: number;
  lookX?: number;
  lookZ?: number;
};
type Route = {
  points: Stop[];
  speed?: number;
  phase?: number;
  shirt?: number;
  curved?: boolean;
};
/** Independent walks fade at both ends; pauses give curious passersby a reason to stop. */
export function campusCrowd(parent: T.Group, routes: Route[]) {
  const walkers = routes.map(({ points, speed = .85, phase = 0, shirt = 0x7c8f9c, curved = false }, index) => {
    const person = victorAvatar({ shirt, hair: index % 3 ? 0x383039 : 0x74513a });
    const bag = new T.Group();
    person.dressed.add(bag);
    const backpack = new T.Mesh(new T.BoxGeometry(.27, .34, .13), new T.MeshStandardMaterial({ color: 0x4c5d62, roughness: 1 }));
    backpack.position.set(0, .94, -.20);
    bag.add(backpack);
    parent.add(person.root);
    const materials = new Set<T.MeshStandardMaterial>();
    person.root.traverse(object => {
      if (object instanceof T.Mesh) {
        const material = object.material as T.MeshStandardMaterial;
        material.transparent = true;
        materials.add(material);
      }
    });
    let total = 0;
    const legs = points.slice(1).map((end, i) => {
      const start = points[i];
      const from = new T.Vector3(start.x, 0, start.z), to = new T.Vector3(end.x, 0, end.z);
      let curve: T.Curve<T.Vector3> = new T.LineCurve3(from, to);
      if (curved) {
        const before = points[Math.max(0, i - 1)], after = points[Math.min(points.length - 1, i + 2)];
        const reach = from.distanceTo(to) * .24;
        const outgoing = new T.Vector3(end.x - before.x, 0, end.z - before.z).normalize().multiplyScalar(reach);
        const incoming = new T.Vector3(after.x - start.x, 0, after.z - start.z).normalize().multiplyScalar(reach);
        curve = new T.CubicBezierCurve3(from, from.clone().add(outgoing), to.clone().sub(incoming), to);
      }
      const walkTime = curve.getLength() / speed;
      const begin = total;
      total += walkTime + (end.pause ?? 0);
      return { start, end, begin, walkTime, curve, finish: total };
    });
    return { person, materials, legs, total, phase, initialized: false };
  });
  const point = new T.Vector3(), tangent = new T.Vector3();
  return (age: number, reduced: boolean) => {
    for (const [index, walker] of walkers.entries()) {
      const { person, materials, legs, total, phase } = walker;
      const time = reduced ? total * ((index * .137 + .2) % .8) : (age + phase) % total;
      const leg = legs.find(part => time <= part.finish) ?? legs[legs.length - 1];
      const progress = Math.min(1, (time - leg.begin) / leg.walkTime);
      const moving = progress < 1;
      leg.curve.getPointAt(progress, point);
      person.root.position.copy(point);
      leg.curve.getTangentAt(progress, tangent);
      const dx = moving ? tangent.x : (leg.end.lookX ?? 0) - leg.end.x;
      const dz = moving ? tangent.z : (leg.end.lookZ ?? 0) - leg.end.z;
      const heading = Math.atan2(dx, dz);
      if (!walker.initialized || reduced)
        person.root.rotation.y = heading;
      else
        person.root.rotation.y += Math.atan2(Math.sin(heading - person.root.rotation.y), Math.cos(heading - person.root.rotation.y)) * .14;
      walker.initialized = true;
      const swing = !reduced && moving ? Math.sin(age * 7.4 + index * 1.8) * .25 : 0;
      person.legs[0].rotation.x = swing;
      person.legs[1].rotation.x = -swing;
      person.arms[0].rotation.x = -swing * .6;
      person.arms[1].rotation.x = swing * .6;
      person.head.rotation.y = !reduced && !moving ? Math.sin(age * .6 + index) * .16 : 0;
      const opacity = reduced ? 1 : T.MathUtils.smoothstep(Math.min(time, total - time), 0, 1.1);
      person.root.visible = opacity > .005;
      for (const material of materials) {
        material.opacity = opacity;
        material.depthWrite = true;
      }
    }
  };
}
