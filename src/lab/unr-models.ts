import * as T from 'three';
import { box, cylinder } from './set';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Shared basket and rigging keep a sky full of balloons to two draw calls each.
const balloonHardware = (() => {
  const parts: [T.BufferGeometry, number][] = [
    [new T.BoxGeometry(.29, .22, .25).translate(0, .13, 0), 0x9c7352],
    [new T.CylinderGeometry(.12, .12, .09, 12).translate(0, .64, 0), 0x93714c],
  ];
  for (const x of [-.105, .105]) for (const z of [-.085, .085])
    parts.push([new T.CylinderGeometry(.012, .012, .43, 5).translate(x, .39, z), 0x705a49]);
  const pieces = parts.map(([part, color]) => {
    const geometry = part.toNonIndexed();
    const tint = new T.Color(color);
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    for (let i = 0; i < colors.length; i += 3) tint.toArray(colors, i);
    geometry.setAttribute('color', new T.BufferAttribute(colors, 3));
    part.dispose();
    return geometry;
  });
  const geometry = mergeGeometries(pieces)!;
  pieces.forEach(piece => piece.dispose());
  return geometry;
})();
const balloonHardwareMaterial = new T.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
balloonHardwareMaterial.userData.memoryHazeScale = .48;
export function nevadaN() {
  const model = new T.Group();
  box(model, [2.54, .30, .83], [0, .15, 0], 0xd4d7d6);
  box(model, [1.96, 2.00, .22], [0, 1.30, 0], 0x172c49);
  const letter = (color: number, stroke: number, z: number) => {
    for (const x of [-.47, .47]) {
      box(model, [stroke, 1.16, .025], [x, 1.32, z], color);
      for (const y of [.74, 1.90])
        box(model, [.40, stroke * .58, .025], [x, y, z], color);
    }
    box(model, [stroke, 1.49, .025], [0, 1.32, z], color).rotation.z = .68;
  };
  letter(0xf1f1e9, .27, .129);
  letter(0x1c3556, .15, .148);
  return model;
}
export function memoryTree(parent: T.Object3D, x: number, z: number, height: number, gold = false) {
  cylinder(parent, .085, height * .72, x, height * .36, z, 0x867360).name = 'memory-tree-trunk';
  const crown = new T.Mesh(new T.IcosahedronGeometry(1, 1), new T.MeshStandardMaterial({ color: gold ? 0xc3a862 : 0x719678, roughness: 1 }));
  crown.scale.set(height * .30, height * .34, height * .27);
  crown.position.set(x, height * .78, z);
  parent.add(crown);
}
export function balloonModel(color: number, stripe: number) {
  const model = new T.Group();
  const envelope = new T.SphereGeometry(.68, 12, 10).toNonIndexed();
  const positions = envelope.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const taper = y < 0 ? .67 + (y + .68) * .48 : 1;
    positions.setXYZ(i, positions.getX(i) * taper, y * 1.17 + 1.32, positions.getZ(i) * taper);
  }
  // Vertex colors keep each balloon to one draw call on mobile GPUs.
  const colors = new Float32Array(positions.count * 3);
  const palette = [new T.Color(color), new T.Color(stripe)];
  const uv = envelope.attributes.uv;
  for (let index = 0; index < positions.count; index += 3) {
    const average = (uv.getX(index) + uv.getX(index + 1) + uv.getX(index + 2)) / 3;
    const sector = Math.min(11, Math.floor(average * 12));
    const tint = palette[sector % 3 === 0 ? 1 : 0];
    for (let corner = 0; corner < 3; corner++)
      tint.toArray(colors, (index + corner) * 3);
  }
  envelope.setAttribute('color', new T.BufferAttribute(colors, 3));
  envelope.computeVertexNormals();
  const fabric = new T.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  fabric.userData.memoryHazeScale = .48;
  model.add(new T.Mesh(envelope, fabric), new T.Mesh(balloonHardware, balloonHardwareMaterial));
  return model;
}
