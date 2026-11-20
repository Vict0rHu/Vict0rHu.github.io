import * as T from 'three';
import { box } from './set';
import { awardDisplays, awardPosition } from './awards-content';

export function awardsDisplay() {
  const model = new T.Group();
  model.name = 'awards-display';
  const x = -3.32, z = -4.09;
  box(model, [2.25, .77, .76], [x, .385, z], 0x665064);
  box(model, [2.31, .075, .8], [x, .81, z], 0x916f68);
  for (const dx of [-.55, .55]) {
    box(model, [1.04, .6, .05], [x + dx, .39, z + .404], 0x775e63);
    box(model, [.25, .045, .07], [x + dx, .51, z + .44], 0xba9b7b);
  }
  const trophies = awardDisplays.map((entry, index) => {
    const trophy = new T.Group();
    const p = awardPosition(index);
    trophy.position.set(p.x, .85, p.z);
    trophy.userData.awardIndex = index;
    model.add(trophy);
    box(trophy, [.43, .085, .34], [0, .045, 0], 0x25313d);
    const gold = new T.MeshStandardMaterial({ color: 0xd8b36b, metalness: .55, roughness: .32 });
    const metal = (geometry: T.BufferGeometry, y: number) => {
      const mesh = new T.Mesh(geometry, gold);
      mesh.position.y = y;
      trophy.add(mesh);
      return mesh;
    };
    if (entry.shape === 'cup') {
      metal(new T.CylinderGeometry(.055, .07, .19, 16), .18);
      metal(new T.CylinderGeometry(.18, .07, .27, 20, 1, true), .38);
      const rim = metal(new T.TorusGeometry(.18, .018, 8, 24), .515);
      rim.rotation.x = Math.PI / 2;
      for (const side of [-1, 1]) {
        const handle = metal(new T.TorusGeometry(.105, .018, 7, 20), .37);
        handle.position.x = side * .17;
        handle.scale.x = .75;
      }
    } else if (entry.shape === 'plaque') {
      box(trophy, [.37, .48, .08], [0, .33, 0], 0xb38e63);
      box(trophy, [.31, .40, .017], [0, .33, .051], 0xe1d8b8);
      const seal = metal(new T.CylinderGeometry(.075, .075, .018, 16), .405);
      seal.rotation.x = Math.PI / 2;
      seal.position.z = .073;
      for (const y of [.20, .25, .30]) box(trophy, [.19, .012, .012], [0, y, .068], 0x69746d);
    } else {
      box(trophy, [.40, .47, .075], [0, .325, 0], 0x455c67);
      for (const side of [-1, 1]) {
        box(trophy, [.055, .22, .018], [side * .10, .40, .05], side < 0 ? 0x9f7864 : 0x658b91);
        const medal = metal(new T.CylinderGeometry(.085, .085, .025, 20), .255);
        medal.rotation.x = Math.PI / 2;
        medal.position.set(side * .10, .255, .072);
      }
    }
    box(trophy, [.27, .045, .014], [0, .049, .18], 0xbba273);
    const outline = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(.58, .67, .46)), new T.LineBasicMaterial({ color: 0xf5dfb2, transparent: true, opacity: 0 }));
    outline.position.y = .32;
    trophy.add(outline);
    const hit = new T.Mesh(new T.BoxGeometry(.58, .67, .46), new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    hit.position.y = .32;
    trophy.add(hit);
    return { trophy, outline, gold, hit };
  });
  const fill = new T.PointLight(0xffe3b8, 0, 5, 2);
  fill.position.set(-3.3, 2.2, -2.6);
  model.add(fill);
  let selected: number | undefined;
  return {
    model,
    select(index?: number) { selected = index; fill.intensity = index === undefined ? 0 : 3; },
    update(seconds: number, reduced: boolean) {
      const blend = reduced ? 1 : 1 - Math.exp(-seconds * 12);
      trophies.forEach(({ trophy, outline, gold }, i) => {
        const focused = selected === i;
        outline.material.opacity = T.MathUtils.lerp(outline.material.opacity, Number(focused), blend);
        gold.emissive.setHex(0x92713e);
        gold.emissiveIntensity = T.MathUtils.lerp(gold.emissiveIntensity, focused ? .2 : .025, blend);
        trophy.position.y = T.MathUtils.lerp(trophy.position.y, .85 + (focused ? .025 : 0), blend);
      });
    },
    pick(ray: T.Raycaster) {
      let object: T.Object3D | null = ray.intersectObjects(trophies.map(t => t.hit), false)[0]?.object ?? null;
      while (object && object.parent !== model) object = object.parent;
      return object?.userData.awardIndex as number | undefined;
    },
  };
}
