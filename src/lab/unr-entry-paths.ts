import * as T from 'three';
import { unrEntryHalfWidth, unrEntryLength, unrHeightAt, unrMemories, unrOrigin } from './unr-content';

/** One continuous road surface keeps the junction free of gaps and alpha overlaps. */
export function memoryClearing(scene: T.Scene) {
  const width = 25, depth = 15.3;
  const back = unrOrigin.z - 13;
  const mask = document.createElement('canvas');
  mask.width = 1536;
  mask.height = Math.round(mask.width * depth / width);
  const scale = mask.width / width;
  const ink = mask.getContext('2d');
  if (ink) {
    ink.strokeStyle = ink.fillStyle = '#ffffff';
    ink.lineWidth = unrEntryHalfWidth * 2 * scale;
    ink.lineCap = ink.lineJoin = 'round';
    for (const moment of unrMemories) {
      ink.beginPath();
      ink.moveTo(width / 2 * scale, (unrOrigin.z - back) * scale);
      for (let i = 0; i <= 36; i++) {
        const distance = i / 36 * unrEntryLength;
        const angle = moment.angle + Math.sin(i / 36 * 3.3) * .035;
        const x = Math.sin(angle) * distance;
        const z = unrOrigin.z - Math.cos(angle) * distance;
        ink.lineTo((x + width / 2) * scale, (z - back) * scale);
      }
      ink.stroke();
    }
    ink.beginPath();
    ink.arc(width / 2 * scale, (unrOrigin.z - back) * scale, unrEntryHalfWidth * scale, 0, Math.PI * 2);
    ink.fill();
  }
  // Blur the combined silhouette once, so the three roads have identical opacity.
  const paper = document.createElement('canvas');
  paper.width = mask.width;
  paper.height = mask.height;
  const soft = paper.getContext('2d');
  if (soft) {
    soft.filter = `blur(${.16 * scale}px)`;
    soft.drawImage(mask, 0, 0);
  }
  const map = new T.CanvasTexture(paper);
  map.colorSpace = T.SRGBColorSpace;
  const geometry = new T.PlaneGeometry(width, depth, 96, 64);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i) + back + depth / 2;
    position.setXYZ(i, x, unrHeightAt(x, z) + .022, z);
  }
  geometry.computeVertexNormals();
  const road = new T.Mesh(geometry, new T.MeshBasicMaterial({
    color: 0xd3bd88, map, transparent: true, opacity: .55, depthWrite: false, side: T.DoubleSide,
  }));
  road.name = 'joined-memory-paths';
  const paths = new T.Group();
  paths.name = 'mist-clearing-paths';
  paths.add(road);
  scene.add(paths);
  return { paths };
}
