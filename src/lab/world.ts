import * as T from 'three';
import { canWalk, walkingRoute } from './navigation';
import { bedroom } from './bedroom';
import { box, cylinder } from './set';
import { bedPrompts, memoryScenes } from './content';
import type { Destination, ObjectId, RoomState, MemoryScene } from './content';

type Markers = Map<ObjectId, HTMLButtonElement>;
type Anchor = { point: T.Vector3; target: T.Vector3; radius?: number };
const moveVectors = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] } as const;
export type Direction = keyof typeof moveVectors;
const keyboardDirections: Partial<Record<string, Direction>> = {
  w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down',
  a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right',
};
const bedroomYaw = -.4;
const defaultYaw = .26;
const defaultPitch = .78;
const defaultReach = 1.46;
const inspectionExitMargin = .22;
const travelDelay = 1500;
const bedJumpDuration = .58;
type BedMode = 'hide' | 'nap';

export function createWorld(canvas: HTMLCanvasElement, thoughtBubble: HTMLElement, portalGuide: HTMLElement, fastRoutine: boolean, inspect: (id: Exclude<ObjectId, 'bed'>) => void, leaveInspection: () => void, showTravel: () => void, caughtInMind: () => void, unavailable: () => void) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const camera = new T.OrthographicCamera();
  const room = bedroom(fastRoutine);
  let displayedThought = '';
  type MemoryStage = ReturnType<typeof import('./memory').contactLab> |
    ReturnType<typeof import('./memory').opticalBench> | ReturnType<typeof import('./memory').teleopBench>;
  const memories: Partial<Record<MemoryScene, MemoryStage>> = {};
  let mind: ReturnType<typeof import('./mind').thoughtWorld> | undefined;
  let trail: ReturnType<typeof import('./trail').coloradoTrail> | undefined;
  let location: 'room' | Destination = 'room';
  let trailVisitor = false;
  let sceneTime = '14:00';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let markers: Markers = new Map();
  let active = false;
  let paused = false;
  let frame = 0;
  let previous = 0;
  let path: T.Vector3[] = [];
  let escortPath: T.Vector3[] = [];
  let bedMode: BedMode | undefined;
  let bedJump: { start: T.Vector3; end: T.Vector3; elapsed: number } | undefined;
  let bedHeight = 0;
  const inputs = new Map<string, Direction>();
  const target = new T.Vector3();
  const offset = new T.Vector3();
  const axis = new T.Vector3(0, 1, 0);
  let yaw = bedroomYaw;
  let pitch = defaultPitch;
  let narrow = false;
  let previousView = { yaw, pitch };
  let pointer: { id: number; x: number; y: number; yaw: number; pitch: number; dragged: boolean } | undefined;
  let nearby: ObjectId | undefined;
  let inspected: ObjectId | undefined;
  let travelStarted: number | undefined;
  let travelUsed = false;
  const saved = new T.Vector3();
  const mindReturn = new T.Vector3();
  let mindView = { yaw, pitch };
  const dir = new T.Vector3();
  const ray = new T.Raycaster();
  const floor = new T.Plane(new T.Vector3(0,1,0));
  const projected = new T.Vector3();
  const robot = new T.Group();
  const facing = new T.Group();
  const robotReplyPoint = new T.Vector3();
  let robotReply: { text: string; until: number; scene: 'room' | Destination } | undefined;
  robot.add(facing);
  cylinder(facing, .25, .17, 0, .15, 0, 0x516579);
  box(facing, [.48,.4,.4], [0,.42,0], 0xe2c8a2);
  box(facing, [.37,.19,.028], [0,.46,.207], 0x1b3543, .24);
  for (const x of [-.09,.09]) box(facing, [.045,.067,.013], [x,.47,.224], 0x6ef4dc, 1.2);
  box(facing, [.036,.16,.036], [0,.68,0], 0x7b8da1);
  cylinder(facing, .044,.052, 0,.78,0,0x62e1bd);
  room.scene.add(robot);
  robot.position.copy(room.spawn);

  const memoryStage = () => memories[location as MemoryScene];
  const contactStage = () => {
    const current = memories.memory;
    return current && 'updateCollection' in current ? current : undefined;
  };
  const aoiStage = () => {
    const current = memories.aoi;
    return current && 'updateLab' in current ? current : undefined;
  };
  const teleopStage = () => {
    const current = memories.teleop;
    return current && 'updateRig' in current ? current : undefined;
  };
  const stage = () => location === 'mind' && mind ? mind : location === 'trail' && trail ? trail : memoryStage() ?? room;
  const travelArea = () => location === 'room' ? room.travel : location === 'trail' ? trail?.travel : undefined;
  function resetTravel() {
    travelStarted = undefined;
    travelArea()?.setProgress(0);
  }
  function updateTravel(time: number) {
    const circle = travelArea();
    if (!circle) return;
    if (robot.position.distanceToSquared(circle.position) > circle.radius ** 2) {
      travelUsed = false;
      if (travelStarted !== undefined) resetTravel();
      return;
    }
    if (travelUsed) return;
    travelStarted ??= time;
    const progress = Math.min(1, (time - travelStarted) / travelDelay);
    circle.setProgress(progress);
    if (progress === 1) {
      travelUsed = true;
      showTravel();
    }
  }

  function anchorFor(id: ObjectId) {
    if (location === 'room') {
      if (id === 'victor' && !room.canInspectVictor()) return;
      if (id === 'terminal' && !room.canInspectTerminal()) return;
      if (id === 'backpack' && !room.canInspectBackpack()) return;
      if (id === 'dream' && !room.asleep) return;
      if (id === 'bed' && !bedMode && room.bedReached && !room.asleep) return;
    }
    if (id === 'sasquatch' && !trail?.canInspectSasquatch()) return;
    if (id === 'teleopPower' && !teleopStage()?.canPullPower()) return;
    return (stage().anchors as Partial<Record<ObjectId, Anchor>>)[id];
  }
  const withinReach = (anchor: Anchor, margin = 0) =>
    anchor.target.distanceTo(robot.position) <= (anchor.radius ?? defaultReach) + margin;
  function activateMarker(id: ObjectId) {
    if (paused || bedJump || escortPath.length) return;
    if (bedMode) {
      if (id === 'bed') leaveBed();
      return;
    }
    const anchor = anchorFor(id);
    if (!anchor || !withinReach(anchor)) return;
    if (id === 'bathroomDoor') room.bathroomDoor.toggle();
    else if (id === 'aoiInspection') aoiStage()?.runInspection(reducedMotion.matches);
    else if (id === 'teleopPower') teleopStage()?.pullPower();
    else if (id === 'bed') {
      bedMode = room.asleep ? 'nap' : 'hide';
      jumpAtBed(room.bedActions[bedMode]);
      canvas.focus({ preventScroll: true });
    } else inspect(id);
  }
  const clearMotion = () => { inputs.clear(); path = []; pointer = undefined; };
  function navigate(end: T.Vector3) {
    clearMotion();
    path = walkingRoute(stage(), robot.position, end);
  }

  function jumpAtBed(end: T.Vector3) {
    clearMotion();
    bedJump = { start: robot.position.clone().setY(bedHeight), end, elapsed: 0 };
    leaveInspection();
  }

  function leaveBed() {
    if (!bedMode || bedJump) return false;
    bedMode = undefined;
    jumpAtBed(room.bedActions.exit);
    canvas.focus({ preventScroll: true });
    return true;
  }

  function stepBedJump(seconds: number) {
    if (!bedJump) return;
    bedJump.elapsed += seconds;
    const progress = reducedMotion.matches ? 1 : Math.min(1, bedJump.elapsed / bedJumpDuration);
    const { start, end } = bedJump;
    robot.position.lerpVectors(start, end, progress).y = 0;
    bedHeight = T.MathUtils.lerp(start.y, end.y, progress) + Math.sin(Math.PI * progress) * .76;
    facing.rotation.y = Math.atan2(end.x - start.x, end.z - start.z);
    if (progress < 1) return;
    bedHeight = end.y;
    bedJump = undefined;
  }

  function resize() {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    narrow = aspect < .9;
    const halfHeight = narrow ? Math.min(8.6, 5.06 / aspect) : Math.max(5.75, 8.48 / aspect);
    camera.left = -halfHeight * aspect;
    camera.right = -camera.left;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.near = .1;
    camera.far = 100;
    camera.updateProjectionMatrix();
  }

  function draw(time: number) {
    frame = active && !document.hidden ? requestAnimationFrame(draw) : 0;
    if (!frame) return;
    const elapsed = (time - (previous || time)) / 1000;
    const step = Math.min(elapsed, .04) * 3;
    previous = time;
    room.clock.update(time, reducedMotion.matches);
    if (!paused && bedJump) stepBedJump(Math.min(elapsed, .08));
    else if (!paused && !bedMode) {
      dir.set(0,0,0);
      for (const move of new Set(inputs.values())) {
        const [x,z] = moveVectors[move];
        dir.x += x;
        dir.z += z;
      }
      dir.applyAxisAngle(axis, yaw);
      const route = escortPath.length ? escortPath : path;
      const next = route[0];
      if (next && dir.lengthSq() === 0) {
        dir.subVectors(next, robot.position);
        if (dir.length() <= step + .008) {
          robot.position.copy(next);
          route.shift();
          dir.set(0,0,0);
        }
      }
      if (dir.lengthSq() > 0) {
        facing.rotation.y = Math.atan2(dir.x, dir.z);
        dir.normalize().multiplyScalar(step);
        const { x, z } = robot.position;
        if (canWalk(stage(), x + dir.x, z)) robot.position.x += dir.x;
        if (canWalk(stage(), robot.position.x, z + dir.z)) robot.position.z += dir.z;
      }
    }
    if (location === 'mind' && !paused && mind?.guard.update(elapsed, robot.position)) caughtInMind();
    const visitor = location === 'room' && !paused ? robot.position : undefined;
    const { escort } = room.updateVictor(Math.min(elapsed, .15), visitor, reducedMotion.matches, escortPath.length > 0);
    if (location === 'room' && bedMode && !bedJump && (bedMode === 'hide' ? room.bedReached : !room.asleep)) {
      room.reactToBedGuest(bedMode === 'nap');
      leaveBed();
    }
    if (escort) {
      clearMotion();
      escortPath = room.bathroomExitRoute(robot.position);
      leaveInspection();
    }
    const openAnchor = inspected && anchorFor(inspected);
    if (!paused && inspected && (!openAnchor || !withinReach(openAnchor, inspectionExitMargin))) leaveInspection();
    if (!paused) updateTravel(time);

    const follow = location === 'mind' ? .88 : narrow ? .84 : location === 'room' ? .27 : location === 'aoi' || location === 'teleop' ? .64 : .48;
    const lead = location === 'trail' ? 5.15 : location === 'memory' ? 1.55 : location === 'room' && !narrow ? .8 : location === 'room' ? 1.65 : .85;
    target.set(robot.position.x * follow, location === 'trail' ? .94 : .62, robot.position.z * follow - lead);
    offset.setFromSphericalCoords(18, pitch, yaw);
    camera.position.copy(target).add(offset);
    camera.lookAt(target);
    if (location === 'room') room.orientWalls(camera.position, robot.position);
    const trailThought = location === 'trail' ? trail?.update(Math.min(elapsed, .15), robot.position, reducedMotion.matches) : undefined;
    if (location === 'mind' && !paused && !reducedMotion.matches) mind?.update(Math.min(elapsed, .15));
    if (!paused && !reducedMotion.matches) memoryStage()?.updateBackdrop(Math.min(elapsed, .15));
    if (!paused && location === 'aoi') aoiStage()?.updateLab(Math.min(elapsed, .06), reducedMotion.matches, robot.position, inspected === 'aoiVictor');
    const teleop = location === 'teleop' ? teleopStage() : undefined;
    const contact = location === 'memory' ? contactStage() : undefined;
    if (teleop && !paused) teleop.updateRig(Math.min(elapsed, .06), reducedMotion.matches, robot.position, inspected === 'teleopVictor');
    if (contact && !paused) contact.updateCollection(Math.min(elapsed, .06), reducedMotion.matches, robot.position, inspected === 'contactVictor');
    const resting = !!bedMode && !bedJump;
    room.setBlanketLump(resting && bedMode === 'hide');
    facing.visible = !(resting && bedMode === 'hide');
    facing.rotation.x = resting && bedMode === 'nap' ? -Math.PI / 2 : 0;
    if (resting && bedMode === 'nap') facing.rotation.y = 0;
    facing.position.y = location === 'mind' ? (mind?.hoverHeight(robot.position, reducedMotion.matches) ?? 0) : bedHeight;
    teleop?.renderFeed(renderer, elapsed, !paused && !reducedMotion.matches);
    contact?.renderFeeds(renderer, elapsed, !paused && !reducedMotion.matches);
    renderer.render(stage().scene, camera);
    placeMarkers();
    placePortalGuide();
    if (robotReply && (time >= robotReply.until || robotReply.scene !== location)) robotReply = undefined;
    if (robotReply) {
      robotReplyPoint.copy(robot.position).y += facing.position.y + .83;
      placeThought(robotReply.text, robotReplyPoint);
    } else if (location === 'room') placeThought(room.thought, room.anchors.victor.point);
    else if (location === 'mind' && mind) {
      const { text, point } = mind.guard.thought;
      placeThought(text, point);
    }
    else if (teleop) placeThought(teleop.thought(), teleop.anchors.teleopVictor.point);
    else placeThought(trailThought?.text ?? '', trailThought?.point);
  }

  function placePortalGuide() {
    portalGuide.hidden = true;
    if (location !== 'trail' || !trail) return;
    projected.copy(trail.travel.position).project(camera);
    const halfWidth = canvas.clientWidth / 2;
    const halfHeight = canvas.clientHeight / 2;
    const x = projected.x * halfWidth;
    const y = -projected.y * halfHeight;
    // Keep the guide hidden while any part of the floor circle is in view.
    const { radius } = trail.travel;
    const screenRadiusX = radius / camera.right;
    const screenRadiusY = radius * Math.cos(pitch) / camera.top;
    if (Math.abs(projected.x) <= 1 + screenRadiusX && Math.abs(projected.y) <= 1 + screenRadiusY) return;

    const horizontal = Math.max(1, halfWidth - 28);
    const vertical = Math.max(1, halfHeight - Math.min(145, halfHeight * .45));
    const scale = 1 / Math.max(Math.abs(x) / horizontal, Math.abs(y) / vertical);
    portalGuide.style.left = `${halfWidth + x * scale}px`;
    portalGuide.style.top = `${halfHeight + y * scale}px`;
    portalGuide.style.setProperty('--portal-angle', `${Math.atan2(y, x)}rad`);
    portalGuide.hidden = false;
  }

  function placeThought(thought: string, point?: T.Vector3) {
    if (thought !== displayedThought) {
      thoughtBubble.hidden = !thought;
      thoughtBubble.textContent = thought;
      displayedThought = thought;
    }
    if (!thought || !point) return;
    const { clientWidth, clientHeight } = canvas;
    projected.copy(point).project(camera);
    thoughtBubble.style.visibility = Math.abs(projected.x) < 1.1 && Math.abs(projected.y) < 1.1 ? 'visible' : 'hidden';
    const half = thoughtBubble.offsetWidth / 2 + 8;
    thoughtBubble.style.left = `${T.MathUtils.clamp((projected.x + 1) * clientWidth / 2, half, clientWidth - half)}px`;
    thoughtBubble.style.top = `${T.MathUtils.clamp((1 - projected.y) * clientHeight / 2 - 40, 126, clientHeight - 120)}px`;
  }

  function placeMarkers() {
    const { clientWidth, clientHeight } = canvas;
    const top = Math.min(170, clientHeight * .38);
    const bottom = Math.max(top, clientHeight - 130);
    const visibleMarkers: { id: ObjectId; button: HTMLButtonElement; anchor: Anchor; distance: number }[] = [];
    for (const [id, button] of markers) {
      const anchor = anchorFor(id);
      const visible = !bedJump && !escortPath.length && !!anchor && (bedMode ? id === 'bed' : withinReach(anchor));
      if (id === 'bed' && visible) {
        const label = button.querySelector('.hotspot-label')!;
        const text = bedMode ? bedPrompts.exit : room.asleep ? bedPrompts.nap : bedPrompts.hide;
        if (label.textContent !== text) label.textContent = text;
      }
      if (id === 'bathroomDoor' && visible) {
        const pressed = String(room.bathroomDoor.open);
        if (button.getAttribute('aria-pressed') !== pressed) button.setAttribute('aria-pressed', pressed);
      }
      button.classList.toggle('is-near', visible);
      button.tabIndex = visible ? 0 : -1;
      if (button.inert === visible) button.inert = !visible;
      if (visible) visibleMarkers.push({ id, button, anchor, distance: anchor.target.distanceToSquared(robot.position) });
    }
    visibleMarkers.sort((a, b) => a.distance - b.distance);
    nearby = visibleMarkers[0]?.id;
    for (const [id, button] of markers) button.classList.toggle('is-closest', id === nearby);

    const placed: { x: number; y: number; width: number; height: number }[] = [];
    for (const { button, anchor } of visibleMarkers) {
      projected.copy(anchor.point).project(camera);
      const width = button.offsetWidth;
      const height = button.offsetHeight;
      const half = width / 2 + 6;
      const x = T.MathUtils.clamp((projected.x + 1) * clientWidth / 2, half, clientWidth - half);
      const y = T.MathUtils.clamp((1 - projected.y) * clientHeight / 2, top, bottom);
      // The closest object keeps its position. Shift adjoining labels into a free row.
      const candidates = [y, ...placed.flatMap(other => [other.y - other.height - 7, other.y + height + 7])];
      const row = candidates.sort((a, b) => Math.abs(a - y) - Math.abs(b - y)).find(candidate =>
        candidate >= top && candidate <= bottom && placed.every(other =>
          Math.abs(x - other.x) >= (width + other.width) / 2 + 5 ||
          candidate <= other.y - other.height - 6 ||
          candidate - height >= other.y + 6
        )
      ) ?? y;
      placed.push({ x, y: row, width, height });
      button.style.left = `${x}px`;
      button.style.top = `${row}px`;
    }
  }

  function move(direction: Direction, token: string) {
    if (!active || paused || bedMode || bedJump || escortPath.length) return;
    path = [];
    inputs.set(token, direction);
  }

  function refresh() {
    if (active && !document.hidden) {
      resize();
      if (!frame) frame = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(frame);
      frame = previous = 0;
      clearMotion();
      resetTravel();
    }
  }

  new ResizeObserver(resize).observe(canvas);
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('blur', () => {
    clearMotion();
    resetTravel();
  });
  canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); unavailable(); });
  canvas.addEventListener('pointerdown', (event) => {
    if (paused || bedJump || escortPath.length || pointer || !event.isPrimary || event.button !== 0) return;
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(event.pointerId);
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw, pitch, dragged: false };
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (!pointer.dragged && Math.hypot(dx, dy) < 7) return;
    pointer.dragged = true;
    yaw = T.MathUtils.clamp(pointer.yaw - dx * .008, -.82, 1.03);
    pitch = T.MathUtils.clamp(pointer.pitch - dy * .006, .45, 1.14);
  });
  canvas.addEventListener('pointerup', (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dragged = pointer.dragged;
    pointer = undefined;
    if (paused || bedMode || bedJump || dragged) return;
    const bounds = canvas.getBoundingClientRect();
    ray.setFromCamera(new T.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, 1 - (event.clientY - bounds.top) / bounds.height * 2), camera);
    if (location === 'room' && markers.has('entryClock') && ray.intersectObject(room.clock.mount, true).length) {
      activateMarker('entryClock');
      return;
    }
    const goal = ray.ray.intersectPlane(floor, new T.Vector3());
    if (goal) navigate(goal);
  });
  for (const eventName of ['pointercancel', 'lostpointercapture'] as const) {
    canvas.addEventListener(eventName, event => { if (pointer?.id === event.pointerId) pointer = undefined; });
  }
  window.addEventListener('keydown', (event) => {
    const element = event.target;
    if (!active || paused || bedJump || escortPath.length || event.altKey || event.metaKey || event.ctrlKey ||
      (element instanceof HTMLElement && element.closest('select, input, textarea, [contenteditable=true]'))) return;
    const key = event.key.toLowerCase();
    const direction = keyboardDirections[key];
    if (direction) {
      event.preventDefault();
      move(direction, key);
    }
    if (key === 'enter' || key === ' ') {
      if (event.defaultPrevented || (element instanceof HTMLElement && element.closest('button, a[href]'))) return;
      if (inspected || !nearby) return;
      event.preventDefault();
      if (!event.repeat) activateMarker(nearby);
    } else if (key === 'e' && !event.repeat && nearby) activateMarker(nearby);
  });
  window.addEventListener('keyup', event => inputs.delete(event.key.toLowerCase()));

  return {
    setActive(value: boolean) { active = value; refresh(); },
    setPaused(value: boolean) {
      paused = value;
      if (value) {
        clearMotion();
        resetTravel();
      }
    },
    setInspection(id?: ObjectId) {
      inspected = id;
      if (id) robotReply = undefined;
    },
    sayAsRobot(text: string) { robotReply = { text, until: performance.now() + 2200, scene: location }; },
    setMarkers(value: Markers) { markers = value; nearby = undefined; },
    setStatus(value: RoomState, presentOnTrail: boolean, lights: boolean) {
      room.setStatus(value, lights);
      trailVisitor = presentOnTrail;
      trail?.setVisitor(trailVisitor);
    },
    setLight(time: string) {
      sceneTime = time;
      room.setLight(time);
      trail?.setTime(time);
    },
    setClock: room.clock.setTime,
    knockClock: room.clock.knock,
    reactToThoughtVisit: room.reactToThoughtVisit,
    setDirection: move,
    releaseDirection(token: string) { inputs.delete(token); },
    activateMarker,
    leaveBed,
    async load(next: Destination) {
      if (next === 'mind' && !mind) mind = (await import('./mind')).thoughtWorld();
      if (next in memoryScenes && !memories[next as MemoryScene]) {
        const { contactLab, opticalBench, teleopBench } = await import('./memory');
        const factories = { memory: contactLab, aoi: opticalBench, teleop: teleopBench };
        const key = next as MemoryScene;
        memories[key] = factories[key]();
      }
      if (next === 'trail' && !trail) {
        trail = (await import('./trail')).coloradoTrail();
        trail.setVisitor(trailVisitor);
        trail.setTime(sceneTime);
      }
    },
    show(next: Destination, dreaming = false) {
      const destination = next === 'mind' ? mind : next === 'trail' ? trail : memories[next];
      if (!destination || location === next) return;
      if (location === 'room') {
        saved.copy(robot.position);
        previousView = { yaw, pitch };
      } else if (location === 'mind') {
        mindReturn.copy(robot.position);
        mindView = { yaw, pitch };
      }
      resetTravel();
      travelUsed = false;
      location = next;
      yaw = next === 'trail' ? .08 : defaultYaw;
      pitch = next === 'trail' ? 1.12 : next === 'mind' ? .94 : defaultPitch;
      destination.scene.add(robot);
      if (next === 'trail' && trail) robot.position.copy(trail.spawn);
      else if (next === 'mind' && mind) {
        robot.position.copy(mind.spawn);
        mind.setDreaming(dreaming);
        mind.guard.reset();
      }
      else {
        robot.position.set(.65, 0, next === 'aoi' ? 2.55 : 1.72);
        if (next === 'aoi') aoiStage()?.resetLab();
        if (next === 'teleop') teleopStage()?.resetRig();
        if (next === 'memory') contactStage()?.resetCollection();
      }
      clearMotion();
    },
    returnToMind() {
      if (!mind || location === 'mind') return;
      location = 'mind';
      mind.scene.add(robot);
      robot.position.copy(mindReturn);
      ({ yaw, pitch } = mindView);
      clearMotion();
    },
    showRoom() {
      if (location === 'room') return;
      resetTravel();
      location = 'room';
      room.scene.add(robot);
      robot.position.copy(saved);
      travelUsed = saved.distanceToSquared(room.travel.position) <= room.travel.radius ** 2;
      ({ yaw, pitch } = previousView);
      clearMotion();
    },
  };
}
