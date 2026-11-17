import { MathUtils, Vector3 } from 'three';

type Rectangle = { left: number; right: number; back: number; front: number };
export type WalkableSpace = { bounds: Rectangle; obstacles: Rectangle[] };

export function canWalk({ bounds, obstacles }: WalkableSpace, x: number, z: number) {
  return x >= bounds.left && x <= bounds.right && z >= bounds.back && z <= bounds.front && !obstacles.some(obstacle =>
    x > obstacle.left - .16 && x < obstacle.right + .16 && z > obstacle.back - .16 && z < obstacle.front + .16);
}

export function walkingRoute(space: WalkableSpace, start: Vector3, end: Vector3): Vector3[] {
  const valid = (x: number, z: number) => canWalk(space, x, z);
  if (!valid(end.x, end.z)) return [];
  // A small set of furniture corners gives click-to-walk a route around the bed and desks.
  const nodes = [start.clone(), end];
  for (const o of space.obstacles) {
    for (const x of [o.left - .22, o.right + .22]) {
      for (const z of [o.back - .22, o.front + .22]) if (valid(x,z)) nodes.push(new Vector3(x,0,z));
    }
  }
  const distance = nodes.map(() => Infinity);
  const parents = nodes.map(() => -1);
  const visited = new Set<number>();
  distance[0] = 0;
  while (!visited.has(1)) {
    const current = nodes.reduce((best, _, i) => !visited.has(i) && distance[i] < (distance[best] ?? Infinity) ? i : best, -1);
    if (current < 0) return [];
    visited.add(current);
    for (const [index, point] of nodes.entries()) {
      if (visited.has(index)) continue;
      const start = nodes[current];
      const length = start.distanceTo(point);
      const cost = distance[current] + length;
      if (cost >= distance[index]) continue;
      const steps = Math.ceil(length / .08);
      let blocked = false;
      for (let step = 1; step < steps; step++) {
        const t = step / steps;
        if (!valid(MathUtils.lerp(start.x, point.x, t), MathUtils.lerp(start.z, point.z, t))) { blocked = true; break; }
      }
      if (!blocked) { distance[index] = cost; parents[index] = current; }
    }
  }
  const path: Vector3[] = [];
  for (let index = 1; index > 0; index = parents[index]) path.unshift(nodes[index]);
  return path;
}
