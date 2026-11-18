import { Vector3 } from 'three';
import type { victorAvatar } from './victor-avatar';

type Avatar = ReturnType<typeof victorAvatar>;

export function avatarWalker(person: Avatar) {
  const direction = new Vector3();
  let phase = 0;

  function turn(heading: number, seconds: number) {
    const difference = heading - person.root.rotation.y;
    person.root.rotation.y += Math.atan2(Math.sin(difference), Math.cos(difference)) * (1 - Math.exp(-15 * seconds));
  }

  function stride(distance: number, seconds: number, reduceMotion: boolean) {
    phase += distance * 7;
    const swing = reduceMotion || !seconds ? 0 : Math.sin(phase) * Math.min(distance / seconds, 1.3) * .33;
    person.legs[0].rotation.x = swing;
    person.legs[1].rotation.x = -swing;
    person.arms[0].rotation.x = -swing * .68;
    person.arms[1].rotation.x = swing * .68;
  }

  function walk(path: Vector3[], seconds: number, speed: number, reduceMotion: boolean, blocked = false) {
    const next = path[0];
    if (!next) return true;
    direction.subVectors(next, person.root.position);
    const distance = direction.length();
    let moved = 0;
    if (distance > .001) {
      const heading = Math.atan2(direction.x, direction.z);
      turn(heading, seconds);
      if (!blocked && Math.cos(heading - person.root.rotation.y) > .82) {
        moved = Math.min(distance, speed * seconds);
        person.root.position.addScaledVector(direction, moved / distance);
      }
    }
    stride(moved, seconds, reduceMotion);
    if (distance - moved > .001) return false;
    person.root.position.copy(next);
    path.shift();
    return !path.length;
  }

  return { turn, stride, walk };
}
