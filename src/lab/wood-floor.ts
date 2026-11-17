import * as T from 'three';

export function woodFloor(scene: T.Scene, width: number, depth: number, x: number, z: number) {
  const sides = new T.MeshStandardMaterial({ color: 0x5a4b3f, roughness: .9 });
  const surface = new T.MeshStandardMaterial({ color: 0x6b5e52, roughness: .88 });
  const floor = new T.Mesh(new T.BoxGeometry(width, .22, depth), [sides, sides, surface, sides, sides, sides]);
  floor.position.set(x, -.11, z);
  scene.add(floor);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ink = canvas.getContext('2d');
  if (!ink) return;
  const rows = 15;
  const rowHeight = canvas.height / rows;
  const plankLength = 272;
  const oak = ['#6b5e52', '#6e6154', '#695d51', '#726456', '#675b4e', '#6d6155'];
  let seed = 346;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const seam = '#3f342933';
  for (let row = 0; row < rows; row++) {
    const top = row * rowHeight;
    const offset = (row * 97) % plankLength;
    for (let x = -offset; x < canvas.width; x += plankLength) {
      ink.fillStyle = oak[Math.floor(random() * oak.length)];
      ink.fillRect(x, top, plankLength, rowHeight + 1);
      ink.fillStyle = seam;
      ink.fillRect(x, top, 1, rowHeight);
    }
    ink.fillStyle = seam;
    ink.fillRect(0, top, canvas.width, 1);
  }

  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.anisotropy = 4;
  surface.color.setHex(0xffffff);
  surface.map = texture;
}
