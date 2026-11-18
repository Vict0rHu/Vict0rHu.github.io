import * as T from 'three';

export function box(parent: T.Object3D, size: [number, number, number], position: [number, number, number], color: number, glow = 0) {
  const material = new T.MeshStandardMaterial({ color, roughness: 0.82, emissive: color, emissiveIntensity: glow });
  const mesh = new T.Mesh(new T.BoxGeometry(...size), material);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

export function cylinder(parent: T.Object3D, radius: number, height: number, x: number, y: number, z: number, color: number) {
  const mesh = new T.Mesh(new T.CylinderGeometry(radius, radius, height, 20), new T.MeshStandardMaterial({ color, roughness: 0.62 }));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

export function travelCircle(scene: T.Scene, x: number, z: number, elevation = 0) {
  const radius = .88;
  const pad = cylinder(scene, radius, .035, x, elevation + .024, z, 0x273e48);
  const ring = new T.Mesh(new T.RingGeometry(radius - .08, radius, 48), new T.MeshBasicMaterial({ color: 0x81d9c4 }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, elevation + .052, z);
  scene.add(ring);
  const fill = new T.Mesh(new T.CircleGeometry(radius - .11, 48), new T.MeshBasicMaterial({
    color: 0x85ddc9, transparent: true, opacity: .68, depthWrite: false,
  }));
  fill.rotation.x = -Math.PI / 2;
  fill.position.set(x, elevation + .054, z);
  fill.visible = false;
  scene.add(fill);
  return {
    position: new T.Vector3(x, 0, z),
    radius,
    setProgress(progress: number) {
      fill.visible = progress > 0;
      fill.scale.setScalar(Math.sqrt(progress));
      pad.material.emissive.setHex(progress > 0 ? 0x123330 : 0x000000);
    },
  };
}
