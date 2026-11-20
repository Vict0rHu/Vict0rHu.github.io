import * as T from 'three';
import { memoryTree } from './unr-models';
import { unrHeightAt, unrMemories, unrLandmarkTrees, onSolarPaving, onUnrEntryPath, type UnrMoment } from './unr-content';
export { memoryClearing } from './unr-entry-paths';

export function memoryLandscape(group: T.Group, id: UnrMoment) {
  const moment = unrMemories.find(item => item.id === id)!;
  const ground = (x: number, z: number) => unrHeightAt(moment.x + x, moment.z + z) - group.position.y;
  const points: { x: number; z: number; phase: number }[] = [];
  const random = (seed: number) => {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  };
  for (let i = 0; i < 150; i++) {
    const x = (random(i + 1) * 2 - 1) * 10.5, z = (random(i + 91) * 2 - 1) * 11;
    if (onUnrEntryPath(moment.x + x, moment.z + z, .4)) continue;
    if (Math.abs(x) < 3.5 && z > -4 && z < 3.5) continue;
    if (id === 'solar' && (onSolarPaving(x,z) || z < -7 && Math.abs(x)<8.4)) continue;
    if (id === 'graduation' && (Math.abs(x)<4.8 && z>-3.5 && z<4.0 || z < -4.8 && x>-9.5 && x<7.5)) continue;
    points.push({ x, z, phase: i * 1.2 });
  }
  const grass = new T.InstancedMesh(new T.ConeGeometry(.055, .24, 3), new T.MeshStandardMaterial({ color: id === 'balloons' ? 0x7d8d56 : 0x7d9970, roughness: 1 }), points.length * 3);
  const stone = new T.InstancedMesh(new T.IcosahedronGeometry(.13, 0), new T.MeshStandardMaterial({ color: 0xa49f91, roughness: 1 }), Math.ceil(points.length / 4));
  const transform = new T.Object3D();
  let stoneIndex = 0;
  points.forEach(({ x, z, phase }, i) => {
    for (let blade = 0; blade < 3; blade++) {
      transform.position.set(x + blade * .08, ground(x, z) + .12, z + Math.sin(blade) * .08);
      transform.rotation.set(0, phase + blade, Math.sin(phase) * .16);
      transform.scale.set(1, .7 + blade * .3, 1);
      transform.updateMatrix();
      grass.setMatrixAt(i * 3 + blade, transform.matrix);
    }
    if (i % 4 === 0 && !(id === 'solar' && onSolarPaving(x + .28, z))) {
      transform.position.set(x + .28, ground(x + .28, z) + .06, z);
      transform.rotation.set(.1, phase, .2);
      transform.scale.set(1.4, .45, 1);
      transform.updateMatrix();
      stone.setMatrixAt(stoneIndex++, transform.matrix);
    }
  });
  stone.count = stoneIndex;
  group.add(grass, stone);
  if (id === 'balloons') for (const [x, z, height] of [[-7.4, -6.6, 3.1], [7.3, -6.8, 3.4], [-8.2, 6.1, 2.8], [8.3, 6.8, 3.0]]) {
    if (onUnrEntryPath(moment.x + x, moment.z + z, height * .32)) continue;
    const tree = new T.Group();
    tree.position.set(x, ground(x, z), z);
    group.add(tree);
    memoryTree(tree, 0, 0, height, id === 'balloons');
  }
  if (id === 'graduation') {
    const leaves = new T.InstancedMesh(new T.PlaneGeometry(.09, .17), new T.MeshStandardMaterial({ color: 0xad9368, roughness: 1, side: T.DoubleSide }), 65);
    for (let i = 0; i < 65; i++) {
      const tree = unrLandmarkTrees[i % unrLandmarkTrees.length];
      const x = tree.x + (random(i+170)*2-1)*1.7;
      const z = tree.z + (random(i+310)*2-1)*1.7;
      transform.position.set(x, .018, z);
      transform.rotation.set(-Math.PI / 2, 0, i * 1.7);
      transform.scale.setScalar(1);
      transform.updateMatrix();
      leaves.setMatrixAt(i, transform.matrix);
    }
    group.add(leaves);
  }
}
