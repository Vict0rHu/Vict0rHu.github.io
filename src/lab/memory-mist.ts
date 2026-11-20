import * as T from 'three';

/** Sparse wisps supplement the distance haze; no dark painted sector borders. */
export function memoryMist(parent: T.Scene, radius: number, originZ: number) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 96;
  const ink = canvas.getContext('2d');
  if (ink) {
    const wash = ink.createRadialGradient(48, 48, 0, 48, 48, 46);
    wash.addColorStop(0, 'rgba(255,255,255,.30)');
    wash.addColorStop(.5, 'rgba(255,255,255,.10)');
    wash.addColorStop(1, 'rgba(255,255,255,0)');
    ink.fillStyle = wash;
    ink.fillRect(0, 0, 96, 96);
  }
  const map = new T.CanvasTexture(canvas);
  const material = new T.SpriteMaterial({ map, color: 0xc8c8cd, opacity: .16, transparent: true, depthWrite: false });
  const wisps: { sprite: T.Sprite; x: number; z: number; phase: number }[] = [];
  for (const angle of [-Math.PI / 6, Math.PI / 6]) {
    for (let r = 3; r < radius + 3; r += 2.4) {
      const sprite = new T.Sprite(material);
      const x = Math.sin(angle) * r, z = originZ - Math.cos(angle) * r;
      sprite.position.set(x, .6, z);
      sprite.scale.set(5.5, 3.5, 1);
      parent.add(sprite);
      wisps.push({ sprite, x, z, phase: r });
    }
  }
  return (age: number, sky: T.Color, reduced: boolean) => {
    material.color.copy(sky);
    for (const { sprite, x, z, phase } of wisps) {
      sprite.position.set(x + (reduced ? 0 : Math.sin(age * .15 + phase) * .22), .6 + (reduced ? 0 : Math.sin(age * .24 + phase) * .15), z);
    }
  };
}
