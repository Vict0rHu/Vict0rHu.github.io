import * as T from 'three';
import { box } from './set';

const knockDuration = 540;

export function entryClock(scene: T.Scene, x: number, z: number) {
  const face = document.createElement('canvas');
  face.width = 384;
  face.height = 144;
  const ink = face.getContext('2d');
  const texture = new T.CanvasTexture(face);
  texture.colorSpace = T.SRGBColorSpace;
  const mount = new T.Group();
  mount.position.set(x, .97, z);
  scene.add(mount);
  box(mount, [1.5, .64, .12], [0, 0, 0], 0x212735);
  const screen = new T.Mesh(new T.PlaneGeometry(1.42, .55), new T.MeshBasicMaterial({ map: texture, toneMapped: false }));
  screen.position.z = .065;
  mount.add(screen);

  const symbols = ['#', '%', '±'].map((symbol) => {
    const card = document.createElement('canvas');
    card.width = card.height = 64;
    const ink = card.getContext('2d');
    if (ink) {
      ink.font = 'bold 43px monospace';
      ink.fillStyle = '#92ffe7';
      ink.textAlign = 'center';
      ink.textBaseline = 'middle';
      ink.fillText(symbol, 32, 32);
    }
    const map = new T.CanvasTexture(card);
    map.colorSpace = T.SRGBColorSpace;
    const sprite = new T.Sprite(new T.SpriteMaterial({ map, transparent: true, depthWrite: false, toneMapped: false }));
    sprite.visible = false;
    scene.add(sprite);
    return sprite;
  });

  let impact: { start: number; complete?: () => void } | undefined;

  return {
    mount,
    setTime(time: string, date: string, weekday: string) {
      if (!ink) return;
      ink.fillStyle = '#14242d';
      ink.fillRect(0, 0, face.width, face.height);
      ink.strokeStyle = '#2f5a5a';
      ink.strokeRect(8, 8, 368, 128);
      ink.fillStyle = '#94efda';
      ink.font = 'bold 65px monospace';
      ink.fillText(time, 20, 77);
      ink.fillStyle = '#86b6b9';
      ink.font = '28px monospace';
      ink.fillText(`${date}  ${weekday.toUpperCase()}`, 22, 118);
      texture.needsUpdate = true;
    },
    knock(complete?: () => void) {
      if (impact) return false;
      impact = { start: performance.now(), complete };
      return true;
    },
    update(time: number, reduceMotion: boolean) {
      if (!impact) return;
      const phase = T.MathUtils.clamp((time - impact.start) / knockDuration, 0, 1);
      if (phase === 1) {
        const complete = impact.complete;
        impact = undefined;
        mount.position.x = x;
        mount.rotation.z = 0;
        screen.material.color.setScalar(1);
        symbols.forEach(symbol => { symbol.visible = false; });
        complete?.();
        return;
      }
      const shake = reduceMotion ? 0 : Math.sin(phase * Math.PI * 8) * (1 - phase) ** 2;
      mount.position.x = x + shake * .10;
      mount.rotation.z = shake * .12;
      const flash = phase < .13 || (phase > .25 && phase < .39);
      screen.material.color.setScalar(reduceMotion ? .72 : flash ? 1.55 : phase < .46 ? .40 : 1);
      symbols.forEach((symbol, i) => {
        const drift = T.MathUtils.clamp((phase - i * .07) / (.95 - i * .07), 0, 1);
        symbol.visible = !reduceMotion && drift > 0 && drift < 1;
        symbol.position.set(x + (i - 1) * (.27 + drift * .30), 1.31 + drift * .79, z + .16);
        symbol.scale.setScalar(.28 + drift * .18);
        symbol.material.opacity = Math.sin(drift * Math.PI);
      });
    },
  };
}
