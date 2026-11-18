import * as T from 'three';
import { box, cylinder } from './set';

type PlantPart = {
  position: [number, number, number];
  scale: [number, number, number];
  color: number;
  turn?: number;
};

export function officeLandscape(scene: T.Scene, entryX: number) {
  const garden = new T.Group();
  scene.add(garden);
  const grade = -.26;
  box(garden, [26.12, .34, 22.7], [-1.95, grade - .17, 1.25], 0x526650);

  const concrete = 0xaaa397;
  const pathTop = grade + .055;
  box(garden, [24.6, .055, 1.22], [-1.55, pathTop - .028, 7.76], concrete);
  box(garden, [1.22, .055, 15.83], [-11.78, pathTop - .028, -.765], concrete);
  box(garden, [2.16, .055, 1.56], [entryX, pathTop - .028, -9.04], concrete);
  for (const x of [-12.49, -9.08, -5.67, -2.26, 1.15, 4.56, 7.97]) {
    box(garden, [.026, .006, 1.18], [x, pathTop + .001, 7.76], 0x8a847a);
  }
  for (const z of [-7.15, -3.75, -.35, 3.05, 6.45]) {
    box(garden, [1.18, .006, .026], [-11.78, pathTop + .001, z], 0x8a847a);
  }

  const trunks: PlantPart[] = [];
  const foliage: PlantPart[] = [];
  const evergreens: PlantPart[] = [];
  const trees = [
    { x: -13.12, z: -5.80, size: .92, pine: true },
    { x: -13.48, z: -.72, size: .94, pine: false },
    { x: -13.40, z: 4.90, size: .80, pine: true },
    { x: -9.20, z: 10.42, size: .98, pine: false },
    { x: -4.35, z: 10.16, size: .85, pine: true },
    { x: .63, z: 10.63, size: 1.00, pine: false },
    { x: 6.03, z: 10.77, size: 1.10, pine: false },
    { x: 9.58, z: 10.00, size: .81, pine: true },
  ];
  const leafColors = [0x537247, 0x678351, 0x758d54, 0x466744];
  const shrubColors = [0x51715a, 0x6f7954, 0x3e6253];
  trees.forEach(({ x, z, size, pine }, i) => {
    const bed = cylinder(garden, 1.06, .045, x, grade + .024, z, 0x66584d);
    bed.scale.set(1.24, 1, .86);
    trunks.push({ position: [x, grade + size * .57, z], scale: [.115 * size, size * 1.16, .115 * size], color: 0x77604c });
    if (pine) {
      for (let tier = 0; tier < 3; tier++) {
        const width = size * (.79 - tier * .18);
        evergreens.push({ position: [x, grade + size * (1 + tier * .40), z],
          scale: [width, size * .97, width], color: [0x305b4f, 0x406e59, 0x578069][tier], turn: i + tier * .32 });
      }
    } else {
      const crown = [
        [0, 1.59, 0, .73, .79],
        [-.46, 1.39, .04, .52, .56],
        [.42, 1.56, -.12, .49, .61],
        [.02, 1.42, .43, .49, .43],
      ];
      crown.forEach(([dx, dy, dz, width, height], lobe) => {
        foliage.push({ position: [x + dx * size, grade + dy * size, z + dz * size],
          scale: [width * size, height * size, width * size], color: leafColors[(i + lobe) % leafColors.length], turn: i + lobe });
      });
    }
    for (const [j, dx] of [-.79, .73, .98].entries()) {
      const height = [.30, .38, .22][j];
      foliage.push({ position: [x + dx, grade + height * .52, z + [.25, .36, -.17][j]],
        scale: [height * 1.35, height, height * 1.10], color: shrubColors[(i + j) % shrubColors.length], turn: i + j });
    }
  });

  function plantBatch(geometry: T.BufferGeometry, parts: PlantPart[]) {
    const plants = new T.InstancedMesh(geometry, new T.MeshStandardMaterial({ roughness: 1, flatShading: true }), parts.length);
    const transform = new T.Object3D();
    const color = new T.Color();
    parts.forEach(({ position, scale, turn = 0, color: hex }, i) => {
      transform.position.set(...position);
      transform.scale.set(...scale);
      transform.rotation.y = turn;
      transform.updateMatrix();
      plants.setMatrixAt(i, transform.matrix);
      plants.setColorAt(i, color.setHex(hex));
    });
    garden.add(plants);
  }
  plantBatch(new T.CylinderGeometry(.66, 1, 1, 7), trunks);
  plantBatch(new T.IcosahedronGeometry(1, 1), foliage);
  plantBatch(new T.ConeGeometry(1, 1, 7), evergreens);

  const pathLights = [[-12.79, 3.33], [-1.70, 9.08], [7.64, 9.15]].map(([x, z]) => {
    cylinder(garden, .072, .50, x, grade + .25, z, 0x3f494a);
    const lens = box(garden, [.115, .045, .115], [x, grade + .475, z], 0xffdcaa);
    box(garden, [.17, .045, .17], [x, grade + .52, z], 0x3f494a);
    const light = new T.PointLight(0xffd6a4, 0, 1.85);
    light.position.set(x, grade + .54, z);
    garden.add(light);
    return { lens, light };
  });

  return (daylight: number) => {
    const power = 1 - daylight;
    for (const { lens, light } of pathLights) {
      lens.material.emissiveIntensity = power * .62;
      light.intensity = power * .59;
      light.visible = power > .02;
    }
  };
}
