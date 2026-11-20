import * as T from 'three';
import { unrHeightAt } from './unr-content';

/** The movement bounds are hidden inside a landscape, never a visible platform. */
export function unrGround(scene: T.Scene) {
  const extent = 95, steps = 160;
  const coordinate = (value: number) => {
    const unit = Math.abs(value) / extent;
    return Math.sign(value) * (unit <= .8 ? unit * 37.5 : 30 + (unit - .8) * 325);
  };
  const geometry = new T.PlaneGeometry(extent * 2, extent * 2, steps, steps);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;
  const colors: number[] = [];
  for (let index = 0; index < positions.count; index++) {
    const x = coordinate(positions.getX(index)), z = coordinate(positions.getZ(index));
    positions.setXYZ(index, x, unrHeightAt(x, z), z);
    const grain = 1 + .025 * Math.sin(x * .71 + Math.cos(z * .43)) + .012 * Math.cos(x * 2.1 + z * 1.7);
    colors.push(grain, grain, grain);
  }
  geometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const material = new T.MeshStandardMaterial({ color: 0x93999d, vertexColors: true, roughness: 1 });
  const ground = new T.Mesh(geometry, material);
  ground.name = 'continuous-memory-ground';
  scene.add(ground);
  return { root: ground, setColor(color: T.Color) { material.color.copy(color); } };
}
