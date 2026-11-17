import * as T from 'three';
import { box } from './set';

export function victorAvatar({ shirt = 0x7287a3, hair = 0x252435, skin = 0xb58a78 } = {}) {
  const awake = new T.Group();
  const dressed = new T.Group();
  awake.add(dressed);
  box(dressed, [.48, .54, .28], [0, .91, 0], shirt);
  const head = new T.Group();
  dressed.add(head);
  box(head, [.31, .31, .28], [0, 1.34, 0], skin);
  box(head, [.33, .105, .31], [0, 1.5, -.01], hair);
  const eyes = new T.Group();
  const openEyes = new T.Group();
  const closedEyes = new T.Group();
  closedEyes.visible = false;
  for (const x of [-.074, .074]) {
    box(openEyes, [.075, .057, .015], [x, 1.374, .144], 0xfff8ef);
    box(openEyes, [.034, .042, .012], [x, 1.372, .155], 0x222635);
    box(closedEyes, [.067, .012, .015], [x, 1.369, .147], 0x222635);
  }
  eyes.add(openEyes, closedEyes);
  awake.add(eyes);
  const legs = [-.13, .13].map(x => {
    const leg = new T.Group();
    leg.position.set(x, .67, 0);
    box(leg, [.19, .64, .23], [0, -.32, 0], 0x303650);
    dressed.add(leg);
    return leg;
  });
  const arms = [-.29, .29].map(x => {
    const arm = new T.Group();
    arm.position.set(x, 1.12, 0);
    box(arm, [.14, .34, .17], [0, -.15, 0], shirt);
    box(arm, [.125, .14, .15], [0, -.36, 0], skin);
    dressed.add(arm);
    return arm;
  });
  return { root: awake, dressed, head, eyes, openEyes, closedEyes, legs, arms };
}
