import * as T from 'three';
import { box } from './set';

/** Shared paper and frame dimensions for the bedroom's printed keepsakes. */
export function framedPoster(width: number, paint: (ink: CanvasRenderingContext2D) => void) {
  const model = new T.Group();
  box(model, [width, .87, .06], [0, 0, 0], 0x19212d);
  const paper = document.createElement('canvas');
  paper.width = 512;
  paper.height = 560;
  const ink = paper.getContext('2d');
  if (ink) {
    ink.fillStyle = '#e8e2d3';
    ink.fillRect(0, 0, 512, 560);
    paint(ink);
  }
  const map = new T.CanvasTexture(paper);
  map.colorSpace = T.SRGBColorSpace;
  const print = new T.Mesh(new T.PlaneGeometry(width - .09, .78), new T.MeshStandardMaterial({
    map, roughness: .95,
  }));
  print.position.z = .041;
  model.add(print);
  return model;
}
