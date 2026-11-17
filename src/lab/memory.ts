import * as T from 'three';
import { box } from './set';
import { aoiLabSize, equipAoiLab } from './aoi-lab';
import { contactLabSize, equipContactLab } from './contact-lab';
import { egocentricLabSize, equipEgocentricLab } from './egocentric-lab';

function memoryRoom({ sky, floor, wall, accent }: { sky: number; floor: number; wall: number; accent: number },
  { width, depth, showGrid = true }: { width: number; depth: number; showGrid?: boolean } = { width: 10, depth: 7.6 }) {
  const scene = new T.Scene();
  scene.background = new T.Color(sky);
  scene.add(new T.HemisphereLight(0xf8f6ff, 0xc7bbd7, 2));
  const key = new T.DirectionalLight(0xfff3e0, 1.45);
  key.position.set(4, 8, 5);
  scene.add(key);

  box(scene, [width, .24, depth], [0, -.12, 0], floor);
  box(scene, [width - .28, .18, depth - .28], [0, -.33, 0], accent);
  box(scene, [width - .16, 3.5, .16], [.08, 1.75, .08 - depth / 2], wall);
  box(scene, [.16, 3.5, depth], [.08 - width / 2, 1.75, 0], wall);
  box(scene, [width - .21, .12, .05], [.105, .06, .185 - depth / 2], accent);
  box(scene, [.05, .12, depth - .16], [.185 - width / 2, .06, .08], accent);
  if (showGrid) {
    const grid = new T.GridHelper(width, Math.round(width * 1.6), accent, accent);
    grid.scale.z = depth / width;
    grid.position.y = .003;
    grid.material.transparent = true;
    grid.material.opacity = .27;
    scene.add(grid);
  }

  const shapes = [new T.OctahedronGeometry(.31), new T.TorusGeometry(.33, .042, 6, 24), new T.IcosahedronGeometry(.15)];
  const colors = [accent, 0xb7aadf, 0xefb9bb, 0xa2cfc5];
  const materials = colors.map(color => new T.MeshBasicMaterial({ color, toneMapped: false }));
  const floaters = Array.from({ length: 24 }, (_, i) => {
    const mesh = new T.Mesh(shapes[i % shapes.length], materials[i % materials.length]);
    mesh.scale.setScalar(.78 + (i % 5) * .30);
    scene.add(mesh);
    return {
      mesh,
      angle: i * Math.PI / 12,
      spread: 1 + (i % 3) * .18,
      height: -.6 + (i % 5) * .84,
    };
  });
  let time = 0;
  function updateBackdrop(seconds: number) {
    time += seconds;
    for (const { mesh, angle, spread, height } of floaters) {
      const orbit = angle + time * .08 / spread;
      mesh.position.set(Math.cos(orbit) * (width / 2 + 2.4) * spread, height + Math.sin(time * 1.1 + angle * 3) * .39,
        Math.sin(orbit) * (depth / 2 + 1.9) * spread);
      mesh.rotation.set(.3 + angle * .6 + time * .16, angle + time * .24, angle * .4);
    }
  }
  updateBackdrop(0);
  return { scene, updateBackdrop };
}

export function contactLab() {
  const { scene, updateBackdrop } = memoryRoom({ sky: 0xddeef0, floor: 0xc6d8d5, wall: 0xe1ece3, accent: 0x83adad },
    { ...contactLabSize, showGrid: false });
  return { scene, updateBackdrop, ...equipContactLab(scene) };
}

export function opticalBench() {
  const { scene, updateBackdrop } = memoryRoom({ sky: 0xe8edf8, floor: 0xb9c8ce, wall: 0xe8edeb, accent: 0x90aab5 },
    { ...aoiLabSize, showGrid: false });
  return { scene, updateBackdrop, ...equipAoiLab(scene) };
}

export function teleopBench() {
  const { scene, updateBackdrop } = memoryRoom({ sky: 0xe7e9fa, floor: 0xcdd5ec, wall: 0xe0e4f4, accent: 0xa3aedb },
    { ...egocentricLabSize, showGrid: false });
  return { scene, updateBackdrop, ...equipEgocentricLab(scene) };
}
