import * as T from 'three';
import { posterPosition, wallPosters } from './poster-wall-content';
import { posterWallLayer } from './poster-wall';
import { awardPosition, awardsLayer } from './awards-content';

export type CollectionKind = 'posters' | 'awards';
const positions = wallPosters.map((_, i) => posterPosition(i));
const presets = {
  posters: {
    position: posterPosition, layer: posterWallLayer, halfHeight: 2.05,
    left: Math.min(...positions.map(p => p.x)) - .46, right: Math.max(...positions.map(p => p.x)) + .46,
    bottom: Math.min(...positions.map(p => p.y)) - .49, top: Math.max(...positions.map(p => p.y)) + .49,
    offset: new T.Vector3(0, 0, 18),
  },
  awards: {
    position: awardPosition, layer: awardsLayer, halfHeight: 1.65,
    left: -4.58, right: -2.06, bottom: .55, top: 3.05,
    offset: new T.Vector3(.8, 4.6, 17.4),
  },
};
function fit(value: number, min: number, max: number, span: number) {
  return max - min <= span ? (min + max) / 2 : T.MathUtils.clamp(value, min + span / 2, max - span / 2);
}

/** Shared camera transitions keep all room collections in the same movement mode. */
export function collectionView() {
  let kind: CollectionKind = 'posters';
  let index: number | undefined;
  let blend = 0;
  const focus = new T.Vector3(.05, 1.91, -4.5), aim = focus.clone();
  return {
    get engaged() { return index !== undefined || blend > 0; },
    get kind() { return kind; },
    get selection() { return index; },
    select(nextKind: CollectionKind, next?: number, instant = false) {
      kind = nextKind;
      index = next;
      if (instant) blend = Number(index !== undefined);
    },
    apply(camera: T.OrthographicCamera, target: T.Vector3, offset: T.Vector3, seconds: number, width: number, height: number, reduceMotion: boolean) {
      const smoothing = reduceMotion ? 1 : 1 - Math.exp(-seconds * 8);
      blend = T.MathUtils.lerp(blend, Number(index !== undefined), smoothing);
      if (Math.abs(blend - Number(index !== undefined)) < .001) blend = Number(index !== undefined);
      const preset = presets[kind];
      camera.layers.set(blend > .985 ? preset.layer : 0);
      if (blend > 0 && width > 0 && height > 0) {
        const { halfHeight } = preset;
        const position = preset.position(index ?? 0);
        const top = 76, bottom = 154;
        const viewWidth = halfHeight * 2 * width / height * .92;
        const viewHeight = halfHeight * 2 * Math.max(.25, (height - top - bottom) / height);
        aim.set(fit(position.x, preset.left, preset.right, viewWidth),
          fit(position.y, preset.bottom, preset.top, viewHeight) - (bottom - top) * halfHeight / height, position.z);
        focus.lerp(aim, reduceMotion || blend === 1 && seconds === 0 ? 1 : smoothing);
        target.lerp(focus, blend);
        offset.lerp(preset.offset, blend);
        const zoom = T.MathUtils.lerp(1, camera.top / halfHeight, blend);
        if (camera.zoom !== zoom) { camera.zoom = zoom; camera.updateProjectionMatrix(); }
      } else if (camera.zoom !== 1) {
        camera.zoom = 1;
        camera.updateProjectionMatrix();
      }
    },
  };
}
