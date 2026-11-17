import * as T from 'three';
import { box, cylinder } from './set';

export function enclosedPrinter() {
  const model = new T.Group();
  const frame = 0x343b4a;
  const shell = 0x858f9d;
  box(model, [1.12, .15, .99], [0, .075, 0], frame);
  box(model, [1.12, .10, .99], [0, 1.01, 0], shell);
  box(model, [1.05, .87, .08], [0, .55, -.455], frame);
  for (const x of [-.524, .524]) {
    for (const z of [-.445, .445]) box(model, [.075, .81, .1], [x, .555, z], shell);
    for (const y of [.186, .924]) box(model, [.075, .074, .79], [x, y, 0], shell);
    const sideWindow = box(model, [.018, .665, .79], [x, .555, 0], 0x8faec5);
    sideWindow.material.setValues({ transparent: true, opacity: .18, depthWrite: false, roughness: .32 });
  }
  box(model, [.16, .85, .055], [.431, .55, .484], shell);
  box(model, [.045, .85, .055], [-.49, .55, .484], frame);
  box(model, [.85, .096, .052], [-.044, .93, .485], frame);
  box(model, [.83, .055, .048], [-.044, .185, .485], frame);
  const window = box(model, [.826, .69, .018], [-.055, .553, .504], 0x7fa6c3);
  window.material.setValues({ transparent: true, opacity: .21, depthWrite: false, roughness: .27 });
  box(model, [.034, .17, .048], [-.408, .58, .535], 0xa6b3bd);
  box(model, [.127, .185, .027], [.426, .82, .525], 0x1e293b);
  box(model, [.09, .13, .011], [.426, .835, .544], 0x7df0cd, .42);
  box(model, [.53, .038, .53], [-.064, .335, 0], 0x3e4956);
  box(model, [.24, .054, .24], [-.064, .382, 0], 0xeba57a);
  box(model, [.11, .08, .24], [-.129, .441, 0], 0xeba57a);
  box(model, [.84, .044, .052], [-.044, .735, .08], 0xacb7c9);
  const head = new T.Group();
  head.position.set(-.08, .68, .08);
  model.add(head);
  box(head, [.20, .15, .16], [0, 0, 0], frame);
  cylinder(head, .028, .063, 0, -.087, 0, 0xe2b86d);
  box(model, [.68, .026, .035], [-.044, .91, .29], 0xd6e9ff, .49);
  return { model, head };
}
