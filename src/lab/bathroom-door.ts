import { MathUtils, type Group, type Vector3 } from 'three';

export function bathroomDoor(door: Group, left: number, right: number, threshold: number) {
  let requestedOpen = false;
  let crossingVictor = false;
  let escorting = false;
  let progress = 0;
  const openEnough = .88;
  const obstacle = { left, right, back: threshold - .055, front: threshold + .055 };

  function nearDoorway(point: Vector3, depth: number) {
    return point.x >= left - .14 && point.x <= right + .14 && Math.abs(point.z - threshold) < depth;
  }

  return {
    obstacle,
    get blocked() { return progress < openEnough; },
    get open() { return requestedOpen || crossingVictor || escorting; },
    toggle() { requestedOpen = !this.open; },
    update(seconds: number, victor: Vector3, next: Vector3 | undefined, robot: Vector3 | undefined,
      escort: boolean, reduceMotion: boolean) {
      const crosses = next && next.z !== victor.z && (next.z - threshold) * (victor.z - threshold) <= 0 &&
        nearDoorway(victor, .72);
      if (crosses) {
        const x = MathUtils.lerp(victor.x, next.x, (threshold - victor.z) / (next.z - victor.z));
        if (x > left && x < right) crossingVictor = true;
      } else if (crossingVictor && !nearDoorway(victor, .34)) {
        crossingVictor = false;
        requestedOpen = false;
      }
      if (escorting && !escort) requestedOpen = false;
      escorting = escort;
      const waitForRobot = progress >= openEnough && !!robot && nearDoorway(robot, .34);
      const target = this.open || waitForRobot ? 1 : 0;
      progress = reduceMotion ? target : progress + MathUtils.clamp(target - progress, -seconds * 2.6, seconds * 2.6);
      door.rotation.y = -(1 - progress) * Math.PI / 2;
      return crossingVictor && this.blocked;
    },
  };
}
