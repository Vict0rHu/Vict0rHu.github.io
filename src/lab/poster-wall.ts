import * as T from 'three';
import { framedPoster } from './framed-poster';
import { projectPoster } from './project-posters';
import { unrPoster } from './unr-poster';
import { posterPosition, wallPosters } from './poster-wall-content';

export const posterWallLayer = 1;

function placeholder(heading: readonly [string, string]) {
  return framedPoster(.8, ink => {
    ink.textAlign = 'center';
    ink.fillStyle = '#53606a';
    for (const [i, title] of heading.entries()) {
      ink.font = `bold ${i ? 30 : 38}px sans-serif`;
      ink.fillText(title, 256, 57 + i * 38, 440);
    }
    ink.fillStyle = '#b5b3a7';
    ink.fillRect(36, 113, 440, 5);
    ink.strokeStyle = '#a0a89f';
    ink.lineWidth = 4;
    ink.setLineDash([12, 10]);
    ink.strokeRect(83, 166, 346, 254);
    ink.setLineDash([]);
    ink.strokeStyle = '#899b98';
    ink.strokeRect(179, 216, 154, 139);
    ink.beginPath();
    ink.moveTo(179, 326);
    ink.lineTo(223, 283);
    ink.lineTo(262, 317);
    ink.lineTo(296, 286);
    ink.lineTo(333, 321);
    ink.stroke();
    ink.beginPath();
    ink.arc(288, 251, 12, 0, Math.PI * 2);
    ink.stroke();
    ink.fillStyle = '#53606a';
    ink.font = 'bold 25px sans-serif';
    ink.fillText('COMING LATER', 256, 508);
  });
}

export function posterWall() {
  const model = new T.Group();
  const cards = wallPosters.map((entry, index) => {
    const print = entry.art === 'placeholder' ? placeholder(entry.heading) :
      entry.art === 'unr' ? unrPoster() : projectPoster(entry.art, .8);
    const { x, y, z } = posterPosition(index);
    print.position.set(x, y, z);
    print.userData.posterIndex = index;
    model.add(print);
    const shade = new T.Mesh(new T.PlaneGeometry(.8, .87), new T.MeshBasicMaterial({
      color: 0x182330, transparent: true, opacity: 0, depthWrite: false,
    }));
    shade.position.z = .05;
    print.add(shade);
    const border = new T.Shape();
    border.moveTo(-.43, -.465);
    border.lineTo(.43, -.465);
    border.lineTo(.43, .465);
    border.lineTo(-.43, .465);
    border.closePath();
    const hole = new T.Path();
    hole.moveTo(-.408, -.443);
    hole.lineTo(-.408, .443);
    hole.lineTo(.408, .443);
    hole.lineTo(.408, -.443);
    hole.closePath();
    border.holes.push(hole);
    const outline = new T.Mesh(new T.ShapeGeometry(border), new T.MeshBasicMaterial({
      color: 0xf0d69c, transparent: true, opacity: 0, depthWrite: false,
    }));
    outline.position.z = .055;
    print.add(outline);
    return { print, shade, outline };
  });
  let selected: number | undefined;
  return {
    model,
    select(index?: number) { selected = index; },
    update(seconds: number, reduceMotion: boolean) {
      const blend = reduceMotion ? 1 : 1 - Math.exp(-seconds * 12);
      cards.forEach(({ print, shade, outline }, i) => {
        const focused = selected === i;
        shade.material.opacity = T.MathUtils.lerp(shade.material.opacity, selected === undefined || focused ? 0 : .16, blend);
        outline.material.opacity = T.MathUtils.lerp(outline.material.opacity, Number(focused), blend);
        print.position.z = T.MathUtils.lerp(print.position.z, -4.515 + (focused ? .045 : 0), blend);
      });
    },
    pick(ray: T.Raycaster) {
      const hit = ray.intersectObjects(cards.map(card => card.print), true)[0];
      let object: T.Object3D | null = hit?.object ?? null;
      while (object && object.parent !== model) object = object.parent;
      return object?.userData.posterIndex as number | undefined;
    },
  };
}
