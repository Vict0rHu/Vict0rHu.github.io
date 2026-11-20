import * as T from 'three';
import { box } from './set';
import type { WalkableSpace } from './navigation';
import { unrSolarPaths } from './unr-content';
type CampusStyle = 'landmark' | 'quad';
function masonryTexture(paving: boolean) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ink = canvas.getContext('2d');
  if (!ink)
    return;
  ink.fillStyle = paving ? '#9e988e' : '#9b7864';
  ink.fillRect(0, 0, 128, 128);
  const colors = paving ? ['#bbb2a5', '#b1a79f', '#b4aba4', '#c0b4a7'] : ['#a86f57', '#a9725d', '#b17c63', '#a57660'];
  for (let row = 0; row < 12; row++)
    for (let col = -1; col < 9; col++) {
      ink.fillStyle = colors[(row * 3 + col + 12) % colors.length];
      ink.fillRect(col * 16 + (row % 2) * 8 + .7, row * 11 + .7, 14.8, 9.5);
    }
  const map = new T.CanvasTexture(canvas);
  map.colorSpace = T.SRGBColorSpace;
  map.wrapS = map.wrapT = T.RepeatWrapping;
  return map;
}
export function campusPaving() {
  return new T.MeshStandardMaterial({ color: 0xffffff, map: masonryTexture(true) ?? null, roughness: 1, side: T.DoubleSide });
}
/** Flat paving with world-scaled UVs, so a courtyard never reads as a raised table. */
export function pavedArea(parent: T.Group, points: [
  number,
  number
][], material: T.MeshStandardMaterial, elevation = .022, name = 'campus-paving') {
  const shape = new T.Shape();
  points.forEach(([x, z], i) => i ? shape.lineTo(x, -z) : shape.moveTo(x, -z));
  shape.closePath();
  const geometry = new T.ShapeGeometry(shape);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++)
    uv.setXY(i, position.getX(i) / 1.6, position.getZ(i) / 1.6);
  const mesh = new T.Mesh(geometry, material);
  mesh.position.y = elevation;
  mesh.name = name;
  parent.add(mesh);
  return mesh;
}
export function roundCampusPlaza(parent: T.Group) {
  const paving = campusPaving();
  const radius = 5.3, centerZ = .3;
  const disc = Array.from({ length: 72 }, (_, i) => {
    const angle = i * Math.PI / 36;
    return [Math.cos(angle) * radius, centerZ + Math.sin(angle) * radius] as [
      number,
      number
    ];
  });
  pavedArea(parent, disc, paving, .028, 'solar-circular-plaza');
  for (const [x, z] of unrSolarPaths) {
    const end = new T.Vector2(x, z - centerZ), direction = end.clone().normalize();
    const side = new T.Vector2(-direction.y, direction.x).multiplyScalar(.72);
    const start = direction.clone().multiplyScalar(radius - .35);
    pavedArea(parent, [
      [start.x + side.x, centerZ + start.y + side.y],
      [end.x + side.x, centerZ + end.y + side.y],
      [end.x - side.x, centerZ + end.y - side.y],
      [start.x - side.x, centerZ + start.y - side.y],
    ], paving, .019, 'quad-walkway');
  }
  const curb = new T.Mesh(new T.RingGeometry(radius, radius + .10, 72), new T.MeshStandardMaterial({ color: 0xd6d0bd, roughness: 1, side: T.DoubleSide }));
  curb.rotation.x = -Math.PI / 2;
  curb.position.set(0, .025, centerZ);
  parent.add(curb);
}
/** Original low-poly massing based on the user's two UNR campus references. */
export function campusBuilding(parent: T.Group, style: CampusStyle) {
  const root = new T.Group();
  root.name = style === 'landmark' ? 'unr-brick-tower' : 'unr-quad-building';
  parent.add(root);
  const brick = new T.MeshStandardMaterial({ color: 0xffffff, map: masonryTexture(false) ?? null, roughness: 1 });
  const cream = 0xd5cfb9, glass = 0x6c888b;
  const obstacles: WalkableSpace['obstacles'] = [];
  function mass(x: number, z: number, width: number, height: number, depth: number) {
    const geometry = new T.BoxGeometry(width,height,depth);
    const position = geometry.attributes.position, normal = geometry.attributes.normal, uv = geometry.attributes.uv;
    for (let i=0;i<position.count;i++) {
      const horizontal = Math.abs(normal.getX(i)) > .5 ? position.getZ(i) : position.getX(i);
      const vertical = Math.abs(normal.getY(i)) > .5 ? position.getZ(i) : position.getY(i);
      uv.setXY(i,horizontal/1.6,vertical/1.3);
    }
    const wall = new T.Mesh(geometry, brick);
    wall.position.set(x, height / 2, z);
    root.add(wall);
    box(root, [width + .12, .14, depth + .12], [x, height + .03, z], cream);
    box(root, [width + .03, .35, depth + .03], [x, .175, z], 0xbdb9a7);
    obstacles.push({ left: x - width / 2, right: x + width / 2, back: z - depth / 2, front: z + depth / 2 });
  }
  function windowGrid(x: number, y: number, z: number, width: number, height: number, columns: number, rows: number) {
    box(root, [width + .13, height + .13, .045], [x, y, z], cream);
    box(root, [width, height, .028], [x, y, z + .04], glass);
    for (let col = 1; col < columns; col++)
      box(root, [.035, height, .024], [x - width / 2 + col * width / columns, y, z + .067], cream);
    for (let row = 1; row < rows; row++)
      box(root, [width, .035, .024], [x, y - height / 2 + row * height / rows, z + .068], cream);
  }
  if (style === 'landmark') {
    mass(1.15, -6.65, 11.6, 4.6, 2.3);
    mass(-2.65, -6.50, 2.8, 5.8, 2.6);
    mass(5.0, -6.5, 2.1, 5.0, 2.6);
    mass(-6.8, -6.35, 5.1, 3.1, 2.3);
    windowGrid(1.15, 2.55, -5.46, 2.65, 3.65, 3, 5);
    windowGrid(-2.65, 4.1, -5.16, 1.55, 1.7, 2, 3);
    windowGrid(-2.65, 1.65, -5.16, 1.30, 1.75, 2, 3);
    for (const x of [3.3, 5.0])
      for (const y of [1.35, 3.1])
        windowGrid(x, y, -5.15, .82, 1.18, 2, 2);
    for (const x of [-8.5, -6.9, -5.3]) {
      const arch = new T.Shape();
      arch.moveTo(-.48, 0);
      arch.lineTo(.48, 0);
      arch.lineTo(.48, 1.25);
      arch.absarc(0, 1.25, .48, 0, Math.PI, false);
      arch.closePath();
      const entrance = new T.Mesh(new T.ShapeGeometry(arch), new T.MeshStandardMaterial({ color: 0x4b5350, roughness: 1, side: T.DoubleSide }));
      entrance.position.set(x, .36, -5.16);
      root.add(entrance);
    }
    box(root, [1.8, .15, .9], [1.15, .14, -5.0], 0xd0cebf);
  }
  else {
    mass(0, -11.35, 15.5, 3.9, 2.7);
    mass(-5.8, -10.0, 4.4, 4.3, 3.2);
    mass(5.8, -10.0, 4.4, 4.1, 3.2);
    const curvedFacade = new T.CylinderGeometry(2.6,2.6,3.7,32);
    const uv = curvedFacade.attributes.uv;
    for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*Math.PI*5.2/1.6,uv.getY(i)*3.7/1.3);
    const rotunda = new T.Mesh(curvedFacade, brick);
    rotunda.position.set(0, 1.85, -10);
    root.add(rotunda);
    const roof = new T.Mesh(new T.CylinderGeometry(2.69, 2.69, .16, 32), new T.MeshStandardMaterial({ color: cream, roughness: 1 }));
    roof.position.set(0, 3.76, -10);
    root.add(roof);
    obstacles.push({ left: -2.6, right: 2.6, back: -12.6, front: -7.4 });
    for (let index = 0; index < 7; index++) {
      const angle = -.95 + index * 1.9 / 6;
      for (const y of [1.1, 2.65]) {
        const window = new T.Mesh(new T.BoxGeometry(.42, .87, .045), new T.MeshStandardMaterial({ color: glass, roughness: .8 }));
        window.position.set(Math.sin(angle) * 2.625, y, -10 + Math.cos(angle) * 2.625);
        window.rotation.y = angle;
        root.add(window);
      }
    }
    for (const x of [-6.8, -5.4, 5.0, 6.5])
      for (const y of [1.2, 2.9])
        windowGrid(x, y, -8.36, .83, 1.05, 2, 2);
    box(root, [1.2, 1.8, .055], [0, .9, -7.36], 0x516c70);
    box(root, [1.55, .13, .95], [0, 2.0, -7.05], cream);
  }
  return { root, obstacles };
}
