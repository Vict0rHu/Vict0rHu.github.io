import * as T from 'three';
import { victorThoughts, type RoomState } from './content';
import { walkingRoute, type WalkableSpace } from './navigation';

type GearStop = 'hangBag' | 'takeBag' | 'setupLaptop' | 'packLaptop';
type Laptop = 'packed' | 'carried' | 'closed' | 'running';
type Stop = 'work' | 'posters' | 'awards' | 'bathroom' | 'wash' | 'bed' | 'away' | 'shower' | 'lounge' | 'entrySwitch' | 'bedSwitch' | GearStop;
type LoungeActivity = 'phone' | 'tv' | 'dozing';
type Thought = keyof typeof victorThoughts;
type Place = { position: T.Vector3; facing: number };
const breaks = ['posters', 'bathroom', 'awards'] as const;
const doorTime = .38;
const switchTime = .8;
const gearTimes = { hangBag: 1.05, takeBag: 1.05, setupLaptop: 1.45, packLaptop: 1.25 } as const;
const scheduledStop = { awake: 'work', asleep: 'bed', away: 'away', shower: 'shower', lounge: 'lounge' } as const;

export function victorRoutine(
  space: WalkableSpace,
  model: T.Group,
  legs: T.Group[],
  door: T.Group,
  places: Record<Stop, Place>,
  isInBathroom: (point: T.Vector3) => boolean,
  isInShower: (point: T.Vector3) => boolean,
  fast: boolean,
) {
  let status: RoomState | undefined;
  let afterWash: RoomState | undefined;
  let stop: Stop = 'work';
  let path: T.Vector3[] = [];
  let arrived = true;
  let remaining = 0;
  let breakIndex = 0;
  let thought = '';
  let thoughtRemaining = 0;
  let nextThought = 0;
  let walkPhase = 0;
  let doorProgress = 0;
  let returning = false;
  const doorstep = places.away.position.clone();
  doorstep.x = space.bounds.right - .08;
  let intruding = false;
  let inShower = false;
  let startledFor = 0;
  let lightsOn = false;
  let wantsLights = false;
  let bagOnHook = true;
  let laptop: Laptop = 'running';
  let loungeActivity: LoungeActivity = 'phone';
  let episodes = 0;
  let rushing = false;
  const direction = new T.Vector3();
  const atSwitch = () => arrived && (stop === 'entrySwitch' || stop === 'bedSwitch');
  const gearStop = () => arrived && stop in gearTimes ? stop as GearStop : undefined;

  function say(kind: Thought, duration = 4) {
    const lines = victorThoughts[kind];
    const choices = lines.filter(line => line !== thought);
    const pool = choices.length ? choices : lines;
    thought = pool[Math.floor(Math.random() * pool.length)];
    thoughtRemaining = duration;
    nextThought = 10 + Math.random() * 7;
  }

  function arrive() {
    arrived = true;
    model.rotation.y = places[stop].facing;
    if (stop === 'away') returning = false;
    const gear = gearStop();
    remaining = gear ? gearTimes[gear] : atSwitch() ? switchTime : stop === 'work' ? (fast ? 6 : 60) :
      stop === 'bathroom' ? (fast ? 18 : 24) : stop === 'wash' ? (fast ? 4 : 20) : 8;
    if (stop === 'lounge') {
      episodes = 0;
      loungeActivity = 'phone';
      remaining = fast ? 2.8 : 9;
      say('loungePhone');
    } else if (stop === 'work' && rushing) {
      rushing = false;
    } else if (stop === 'work' || stop === 'posters' || stop === 'awards' || stop === 'bathroom' || stop === 'wash' || stop === 'shower') {
      say(stop, stop === 'wash' ? Math.min(remaining, 5) : 4);
    }
    else {
      thoughtRemaining = 0;
      nextThought = 0;
    }
  }

  function continueSchedule(next: RoomState, phrase?: Thought) {
    if (next === 'away') {
      if (laptop === 'running' || laptop === 'closed') go('packLaptop', phrase);
      else if (bagOnHook) go('takeBag', phrase);
      else {
        laptop = 'packed';
        go('away', phrase);
      }
    } else if (lightsOn !== wantsLights) go(wantsLights ? 'entrySwitch' : 'bedSwitch', phrase);
    else if (!bagOnHook) go('hangBag', phrase);
    else if (laptop === 'carried' || laptop === 'closed' || (next === 'awake' && laptop === 'packed')) go('setupLaptop', phrase);
    else go(scheduledStop[next], phrase);
  }

  function go(next: Stop, phrase?: Thought) {
    stop = next;
    const outside = model.position.x > space.bounds.right;
    const start = outside ? doorstep : model.position;
    path = walkingRoute(space, start, next === 'away' ? doorstep : places[next].position);
    if (outside) path.unshift(doorstep);
    if (next === 'away') path.push(places.away.position);
    arrived = false;
    intruding = false;
    inShower = false;
    if (phrase) say(phrase);
    else thoughtRemaining = 0;
    if (!path.length || model.position.distanceToSquared(places[next].position) < .001) arrive();
  }

  function setStatus(next: RoomState, lights: boolean) {
    wantsLights = lights;
    if ((stop === 'bathroom' && arrived) || stop === 'wash') {
      afterWash = next;
      if (next === 'shower' && stop === 'bathroom') go('wash');
      return;
    }
    if (status === next && lightsOn === wantsLights) return;
    const previous = status;
    rushing = previous === 'lounge' && next === 'awake' && arrived && stop === 'lounge';
    status = next;
    if (!previous) {
      lightsOn = wantsLights;
      bagOnHook = next !== 'away';
      laptop = bagOnHook ? 'running' : 'packed';
      stop = scheduledStop[next];
      model.position.copy(places[stop].position);
      arrive();
      return;
    }
    if (previous === 'away' && arrived) {
      model.position.copy(places.away.position);
      returning = true;
    }
    startledFor = 0;
    const phrase = rushing ? 'backToWork' : next === 'away' ? 'away' : next === 'asleep' ? 'bed' :
      next === 'shower' || previous === 'shower' || next === 'lounge' ? undefined : previous === 'away' ? 'home' : 'wake';
    if (next === 'away') lightsOn = false;
    continueSchedule(next, phrase);
  }

  function step(seconds: number, visitor: T.Vector3 | undefined, reduceMotion: boolean, waitingForBathroomDoor: boolean) {
    if (!status) return;
    thoughtRemaining = Math.max(0, thoughtRemaining - seconds);
    if (startledFor > 0) {
      startledFor = Math.max(0, startledFor - seconds);
      return;
    }
    const nearThreshold = model.position.x > 6.36 && Math.abs(model.position.z - places.away.position.z) < .9;
    const targetDoor = !arrived && nearThreshold && (returning || stop === 'away') ? 1 : 0;
    doorProgress += T.MathUtils.clamp(targetDoor - doorProgress, -seconds / doorTime, seconds / doorTime);
    door.rotation.y = -doorProgress * Math.PI / 2;

    if (!arrived && path.length) {
      const target = path[0];
      direction.subVectors(target, model.position);
      const distance = direction.length();
      if (distance > .001) model.rotation.y = Math.atan2(direction.x, direction.z);
      // Arrivals wait for the door to swing open before moving away from it.
      const atDoor = model.position.x > doorstep.x - .16;
      const waitingForFrontDoor = (returning || stop === 'away') && nearThreshold && atDoor && doorProgress < .82;
      const distanceThisFrame = waitingForFrontDoor || waitingForBathroomDoor ? 0 :
        seconds * (rushing ? 3.55 : 2.22);
      if (distance <= distanceThisFrame) {
        model.position.copy(target);
        path.shift();
        if (!path.length) arrive();
      } else model.position.addScaledVector(direction, distanceThisFrame / distance);
      if (!nearThreshold) returning = false;
      walkPhase += distanceThisFrame * (rushing ? 7.2 : 6);
    }
    const swing = arrived || reduceMotion ? 0 : Math.sin(walkPhase) * (rushing ? .62 : .45);
    legs[0].rotation.x = swing;
    legs[1].rotation.x = -swing;

    if (atSwitch()) {
      remaining -= seconds;
      if (remaining <= switchTime / 2) lightsOn = wantsLights;
      if (remaining <= 0) continueSchedule(status);
      return;
    }
    const gear = gearStop();
    if (gear) {
      remaining -= seconds;
      const progress = 1 - remaining / gearTimes[gear];
      if (gear === 'hangBag') {
        if (progress >= .58) bagOnHook = true;
        if (progress >= .84 && status === 'awake' && laptop === 'packed') laptop = 'carried';
      } else if (gear === 'takeBag') {
        if (progress >= .58) {
          bagOnHook = false;
          laptop = 'packed';
        }
      } else if (gear === 'setupLaptop') {
        if (progress >= .86) laptop = 'running';
        else if (progress >= .3 && laptop !== 'running') laptop = 'closed';
      } else if (progress >= .76) laptop = 'carried';
      else if (progress >= .19) laptop = 'closed';
      if (remaining <= 0) continueSchedule(status);
      return;
    }
    if (arrived && stop === 'shower') {
      const inside = !!visitor && isInBathroom(visitor);
      const crossingShower = inside && isInShower(visitor);
      if (inside && !intruding) say('showerWarning', 5);
      intruding = inside;
      if (crossingShower && !inShower) {
        inShower = true;
        say('showerEscort', 5);
        return true;
      }
      inShower = crossingShower;
      return;
    }
    if (arrived && stop === 'lounge') {
      remaining -= seconds;
      if (remaining > 0) return;
      if (loungeActivity === 'phone') {
        loungeActivity = 'tv';
        remaining = fast ? 2.8 : 8;
        say('loungeTV');
      } else if (loungeActivity === 'tv' && ++episodes % 2 === 0) {
        loungeActivity = 'dozing';
        remaining = fast ? 3.6 : 6.5;
        thoughtRemaining = 0;
      } else {
        say(loungeActivity === 'dozing' ? 'loungeWake' : 'loungePhone');
        loungeActivity = 'phone';
        remaining = fast ? 2.8 : 9;
      }
      return;
    }
    if (!arrived || status !== 'awake') return;
    if (stop === 'bathroom') {
      const inside = !!visitor && isInBathroom(visitor);
      if (inside && !intruding) say('interrupted', 5);
      intruding = inside;
    }
    if (stop === 'work') {
      nextThought -= seconds;
      if (nextThought <= 0) say('work');
    }
    remaining -= seconds;
    if (remaining > 0) return;
    if (stop === 'work') go(breaks[breakIndex++ % breaks.length]);
    else if (stop === 'bathroom') go('wash');
    else if (stop === 'wash' && afterWash && (afterWash !== status || lightsOn !== wantsLights)) {
      const next = afterWash;
      afterWash = undefined;
      // Leave the completed wash stop before applying the deferred schedule.
      stop = 'work';
      setStatus(next, wantsLights);
    } else {
      afterWash = undefined;
      go('work');
    }
  }

  const arrivedInPrivate = () => arrived && (stop === 'bathroom' || stop === 'wash' || stop === 'shower');

  return {
    setStatus,
    step,
    reactToThoughtVisit() {
      if ((status === 'awake' || status === 'lounge') && !arrivedInPrivate()) say('lostThought', 6);
    },
    reactToBedGuest(waking: boolean) {
      startledFor = waking ? .65 : 2.7;
      legs.forEach(leg => { leg.rotation.x = 0; });
      say(waking ? 'wakeSurprise' : 'bedSurprise', waking ? 4 : startledFor);
    },
    get thought() { return thoughtRemaining > 0 ? thought : ''; },
    get nextWaypoint() { return arrived ? undefined : path[0]; },
    get atToilet() { return arrived && stop === 'bathroom'; },
    get washing() { return arrived && stop === 'wash'; },
    get showering() { return arrived && stop === 'shower'; },
    get loungeActivity() { return arrived && stop === 'lounge' ? loungeActivity : undefined; },
    get visible() { return !arrived || (stop !== 'bed' && stop !== 'away'); },
    get bedReached() { return arrived && stop === 'bed'; },
    get asleep() { return arrived && stop === 'bed' && startledFor <= 0; },
    get startled() { return startledFor > 0; },
    get lightsOn() { return lightsOn; },
    get switchReach() { return atSwitch() ? Math.sin(Math.PI * Math.max(0, remaining) / switchTime) : 0; },
    get bagOnHook() { return bagOnHook; },
    get laptop() { return laptop; },
    get gear() {
      const kind = gearStop();
      return kind ? { kind, progress: 1 - remaining / gearTimes[kind] } : undefined;
    },
  };
}
