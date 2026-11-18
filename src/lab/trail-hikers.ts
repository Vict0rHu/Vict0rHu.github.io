import * as T from 'three';
import { box } from './set';
import { overlookPath, shoreTrail, trailHeight } from './trail-landscape';
import { backpackModel, victorAvatar } from './victor-avatar';

function mainPath(points: number[], offset: number) {
  return new T.CatmullRomCurve3(points.map(x => new T.Vector3(x, 0, overlookPath(x) + offset)));
}

export function trailHikers(scene: T.Scene) {
  const hikers = [
    { route: mainPath([-18,-14,-10,-6,-2,2,6], -.52), stops: [.07,.58,.93], shirt: 0xae6849, speed: .94, initial: .31, view: Math.PI },
    { route: shoreTrail, stops: [.15,.57,.90], shirt: 0x5e7f86, speed: 1.08, initial: .36, view: Math.PI },
    { route: mainPath([7,10,13,16,19,21], -.52), stops: [.06,.56,.94], shirt: 0x8c7c9c, speed: .86, initial: .24, view: Math.PI },
  ].map((options, index) => {
    const person = victorAvatar({ shirt: options.shirt, hair: [0x302a35, 0x493b32, 0x393733][index] });
    const pack = backpackModel();
    pack.position.set(0, .89, -.24);
    pack.rotation.y = Math.PI;
    pack.scale.setScalar(.83);
    person.dressed.add(pack);

    const glance = new T.Group();
    glance.position.y = 1.34;
    person.dressed.add(glance);
    glance.add(person.head, person.eyes);
    person.head.position.y = person.eyes.position.y = -1.34;
    const knees = person.legs.map(hip => {
      hip.children[0].visible = false;
      box(hip, [.18,.31,.22], [0,-.145,0], 0x364050);
      const knee = new T.Group();
      knee.position.y = -.29;
      hip.add(knee);
      box(knee, [.155,.255,.185], [0,-.125,0], 0x364050);
      box(knee, [.174,.096,.255], [0,-.274,.041], 0x3b302a);
      return knee;
    });

    const walking = options.route.getTangentAt(options.initial);
    person.root.rotation.y = Math.atan2(walking.x, walking.z);
    person.root.name = 'Hiker';
    scene.add(person.root);
    const start = options.route.getPointAt(options.initial);
    person.root.position.set(start.x, trailHeight(start.x, start.z) + .014, start.z);
    return { ...options, person, glance, knees, length: options.route.getLength(),
      progress: options.initial, goal: 1, heading: 1, pace: 0, wait: 0, phase: 1.8 * index, elapsed: index * 2.2 };
  });

  const point = new T.Vector3();
  const tangent = new T.Vector3();

  function walk(seconds: number) {
    for (const hiker of hikers) {
      const { person, route, glance } = hiker;
      if (!person.root.visible) continue;
      hiker.elapsed += seconds;
      let targetYaw = hiker.view;
      if (hiker.wait > 0) {
        hiker.wait -= seconds;
        if (hiker.wait <= 0) {
          if (hiker.goal === 0 || hiker.goal === hiker.stops.length - 1) hiker.heading *= -1;
          hiker.goal += hiker.heading;
        }
      } else {
        const stop = hiker.stops[hiker.goal];
        const remaining = Math.abs(stop - hiker.progress) * hiker.length;
        const targetPace = Math.min(hiker.speed, .25 + remaining * 1.5);
        const moved = Math.min(T.MathUtils.damp(hiker.pace, targetPace, 4.2, seconds) * seconds, remaining);
        hiker.progress += moved / hiker.length * hiker.heading;
        hiker.pace = seconds > 0 ? moved / seconds : 0;
        hiker.phase += moved * 8.7;
        route.getPointAt(hiker.progress, point);
        route.getTangentAt(hiker.progress, tangent);
        person.root.position.set(point.x, trailHeight(point.x, point.z) + .014, point.z);
        targetYaw = Math.atan2(tangent.x * hiker.heading, tangent.z * hiker.heading);
        if (remaining <= moved + .001) {
          hiker.progress = stop;
          hiker.pace = 0;
          hiker.wait = 4.7 + Math.random() * 3.0;
        }
      }
      const rotation = person.root.rotation;
      const difference = targetYaw - rotation.y;
      rotation.y += Math.atan2(Math.sin(difference), Math.cos(difference)) * (1 - Math.exp(-5.5 * seconds));
      glance.rotation.y = Math.sin(hiker.elapsed * .66) * (hiker.wait > 0 ? .46 : .12);
      glance.rotation.x = Math.sin(hiker.elapsed * .91) * .065;
      const effort = Math.min(hiker.pace / hiker.speed, 1);
      const stride = Math.sin(hiker.phase) * effort;
      person.dressed.position.y = .018 * (1 + Math.cos(hiker.phase * 2)) * effort;
      person.dressed.rotation.z = -.023 * stride;
      for (const [i, hip] of person.legs.entries()) {
        const swing = i === 0 ? stride : -stride;
        hip.rotation.x = -.28 * swing;
        hiker.knees[i].rotation.x = Math.max(0, swing) * .58;
        person.arms[i].rotation.x = -.20 + swing * .23;
      }
    }
  }

  return {
    setDaytime(daytime: boolean) {
      for (const { person } of hikers) person.root.visible = daytime;
    },
    walk,
  };
}
