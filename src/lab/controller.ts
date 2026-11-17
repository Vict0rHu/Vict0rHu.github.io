import { memoryDialogueClosing, memoryVictorDetails, denverNow, formatTime, memoryPortals, memoryScenes, mindObjects, objects, posterMemories, posterProjects, roomSchedule, terminalLines, trailObjects } from './content';
import type { Destination, MemoryEntry, MemoryScene, MindPortal, ObjectId, RoomState, TravelDestination } from './content';
import type { createWorld, Direction } from './world';

const byId = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(`lab-${id}`) as T;
const title = document.getElementById('scene-title')!;
const worldElement = byId('world');
const canvas = byId<HTMLCanvasElement>('canvas');
const markerContainer = byId('markers');
const template = byId<HTMLTemplateElement>('objects');
const panel = byId('panel');
const panelTitle = byId('panel-title');
const description = byId('panel-description');
const poster = byId('poster');
const terminal = byId('terminal');
const action = byId<HTMLButtonElement>('action');
const actionLabel = byId('action-label');
const memoryLinks = panel.querySelectorAll<HTMLElement>('[data-memory-project]');
const sceneVeil = byId('scene-veil');
const sceneExit = byId<HTMLButtonElement>('scene-exit');
const home = byId('home');
const previewTime = byId<HTMLInputElement>('preview-time');
const previewDay = byId<HTMLSelectElement>('preview-day');
const dpad = byId('dpad');
const travelDialog = byId<HTMLDialogElement>('travel');
const memoryObjects = new Set<ObjectId>(Object.values(memoryScenes).flatMap(scene => [...scene.objects]));
const roomObjects = (Object.keys(objects) as ObjectId[]).filter(id => !memoryObjects.has(id) && !(id in memoryPortals) && !trailObjects.includes(id));
const params = new URLSearchParams(location.search);
const testMode = import.meta.env.DEV || params.get('playtest') === '1';
const buttons = new Map<ObjectId, HTMLButtonElement>();
let world: ReturnType<typeof createWorld> | undefined;
let roomState: RoomState = 'awake';
let roomLights = false;
let onTrail = false;
let destination: Destination | undefined;
let displayedTime = '';
let clockTime = '';
let clockDate = '';
let clockDay = '';
let memoryEntry: MemoryEntry | undefined;
let selected: ObjectId | undefined;
let transitioning = false;
let ejecting = false;
let dialogueTopic = 0;
let logCount = 3;

function syncButtons() {
  const sceneMemory = destination && memoryScenes[destination as MemoryScene];
  const active: ObjectId[] = sceneMemory ? [...sceneMemory.objects] :
    destination === 'mind' ? [...mindObjects] :
    destination === 'trail' ? trailObjects.filter(id => id !== 'trailVictor' || onTrail) :
    [...roomObjects];
  for (const [id, button] of buttons) {
    button.hidden = !active.includes(id);
    button.inert = true;
    button.tabIndex = -1;
    button.classList.remove('is-near', 'is-closest');
  }
  markerContainer.append(...buttons.values());
  world?.setMarkers(new Map(active.map(id => [id, buttons.get(id)!])));
}

function failedWorld() {
  world?.setActive(false);
  if (travelDialog.open) travelDialog.close();
  close(false);
  worldElement.hidden = true;
  byId('move').hidden = true;
  byId('preview').hidden = true;
  sceneExit.hidden = true;
  home.hidden = false;
  byId('unavailable').hidden = false;
}

async function enable3d() {
  try {
    const { createWorld } = await import('./world');
    world = createWorld(canvas, byId('thought'), byId('portal-guide'), testMode && params.get('routine') === 'fast', inspect, closeAfterWalking, openTravel, ejectFromMind, failedWorld);
    world.setStatus(roomState, onTrail, roomLights);
    world.setLight(displayedTime);
    world.setClock(clockTime, clockDate, clockDay);
    syncButtons();
    worldElement.hidden = false;
    byId('move').hidden = false;
    byId('preview').hidden = !testMode;
    world.setActive(true);
  } catch (error) {
    console.warn('Unable to initialize the Lab view.', error);
    failedWorld();
  }
}

function updateClock() {
  const live = denverNow(new Date());
  const mode = testMode ? previewDay.value : 'live';
  if (mode === 'live') previewTime.value = String(live.minutes);
  const minutes = mode === 'live' ? live.minutes : previewTime.valueAsNumber;
  const time = formatTime(minutes);
  if (time !== displayedTime) {
    displayedTime = time;
    byId('time').textContent = time;
    byId('preview-value').textContent = time;
    previewTime.setAttribute('aria-valuetext', time);
    world?.setLight(time);
  }
  const realTime = formatTime(live.minutes);
  if (clockDate !== live.date || clockTime !== realTime) {
    clockDate = live.date;
    clockDay = live.weekday;
    clockTime = realTime;
    world?.setClock(clockTime, clockDate, clockDay);
  }
  const { state, onTrail: weekendVisit, lights } = roomSchedule(minutes, mode === 'live' ? live.weekend : mode === 'weekend');
  if (state === roomState && weekendVisit === onTrail && lights === roomLights) return;
  roomState = state;
  onTrail = weekendVisit;
  roomLights = lights;
  world?.setStatus(state, onTrail, roomLights);
  if (!transitioning && (
    (selected === 'dream' && state !== 'asleep') ||
    (selected === 'victor' && state !== 'awake' && state !== 'lounge') ||
    (selected === 'trailVictor' && !onTrail)
  )) close(panel.contains(document.activeElement));
  syncButtons();
}

function terminalOutput() {
  const first = Math.max(0, logCount - 7);
  const lines = [];
  for (let i = first; i < logCount; i++) {
    const step = i % terminalLines.length;
    lines.push(step ? terminalLines[step] : terminalLines[0]);
  }
  terminal.textContent = `${lines.join('\n')}\n▌`;
}

function isMindPortal(id: ObjectId): id is MindPortal {
  return id in memoryPortals;
}

function inspect(id: Exclude<ObjectId, 'bed'>) {
  if (selected === id || transitioning || ejecting || travelDialog.open) return;
  if (isMindPortal(id)) {
    if (destination === 'mind') void enter(memoryPortals[id]);
    return;
  }
  selected = id;
  world?.setInspection(id);
  const item = objects[id];
  if (id in memoryVictorDetails) dialogueTopic = 0;
  panelTitle.textContent = item.label;
  description.textContent = item.detail;
  poster.hidden = !(id in posterProjects);
  for (const entry of poster.querySelectorAll<HTMLElement>('[data-poster]')) {
    entry.hidden = entry.dataset.poster !== id;
    if (!entry.hidden) {
      const image = entry.querySelector('img')!;
      if (!image.getAttribute('src')) image.src = image.dataset.src!;
    }
  }
  byId('awards').hidden = id !== 'awards';
  terminal.hidden = id !== 'terminal';
  if (!terminal.hidden) terminalOutput();
  for (const link of memoryLinks) link.hidden = true;
  action.disabled = false;
  action.hidden = !('action' in item);
  actionLabel.textContent = 'action' in item ? item.action : '';
  panel.hidden = false;
  panelTitle.focus({ preventScroll: true });
}

function close(refocus = true) {
  panel.hidden = true;
  selected = undefined;
  world?.setInspection();
  world?.setPaused(transitioning || ejecting || travelDialog.open);
  if (refocus) canvas.focus({ preventScroll: true });
}

function closeAfterWalking() {
  if (selected) close(panel.contains(document.activeElement));
}

function openTravel() {
  if (transitioning || travelDialog.open || (destination && destination !== 'trail')) return;
  close(false);
  const current: TravelDestination = destination === 'trail' ? 'trail' : 'room';
  for (const button of travelDialog.querySelectorAll<HTMLButtonElement>('[data-destination]')) {
    const here = button.dataset.destination === current;
    button.disabled = here;
    if (here) button.setAttribute('aria-current', 'location');
    else button.removeAttribute('aria-current');
    button.querySelector('.destination-state')!.textContent = here ? 'You are here' : '→';
  }
  travelDialog.returnValue = '';
  travelDialog.showModal();
  world?.setPaused(true);
  byId('travel-title').focus({ preventScroll: true });
}

function showScene(next?: Destination) {
  const isMemory = !!next && next in memoryScenes;
  const sceneTitle = next === 'trail' ? 'Colorado foothills' : next === 'mind' ? 'Inside Victor’s mind' :
    next ? memoryScenes[next].title : 'Victor’s room';
  const sceneLabel = next === 'trail' ? 'Elk overlook' : next === 'mind' ? (memoryEntry === 'dream' ? 'Victor’s dream' : 'Victor’s thoughts') :
    next ? 'Reconstructed memory' : 'Victor’s Robotics Lab';
  title.textContent = sceneTitle;
  byId('scene-label').textContent = sceneLabel;
  canvas.setAttribute('aria-label', `3D ${sceneTitle}`);
  document.getElementById('lab')!.dataset.scene = isMemory ? 'memory' : next ?? 'room';
  sceneExit.hidden = next !== 'mind' && !isMemory;
  sceneExit.setAttribute('aria-label', isMemory && enteredThroughVictor() ? 'Return to Victor’s mind' : 'Return to Victor’s room');
  home.hidden = !!next;
  syncButtons();
  canvas.focus({ preventScroll: true });
}

function enteredThroughVictor() {
  return memoryEntry === 'victor' || memoryEntry === 'dream';
}

async function fadeScene(swap: () => void, { hold = 0, memory = false } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (hold) await new Promise(resolve => window.setTimeout(resolve, hold));
    swap();
    return;
  }
  sceneVeil.classList.toggle('is-memory', memory);
  sceneVeil.hidden = false;
  const duration = 360;
  const cover = sceneVeil.animate([{ opacity: 0 }, { opacity: 1 }], {
    delay: hold, duration, fill: 'forwards', easing: 'ease-in',
  });
  try {
    await cover.finished;
    swap();
    const reveal = sceneVeil.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 420, easing: 'ease-out',
    });
    cover.cancel();
    await reveal.finished;
  } finally {
    cover.cancel();
    sceneVeil.hidden = true;
  }
}

async function enter(next: Destination, entry?: MemoryEntry) {
  if (transitioning || ejecting) return;
  transitioning = true;
  world?.setPaused(true);
  action.disabled = true;
  actionLabel.textContent = 'Opening…';
  try {
    await world?.load(next);
  } catch {
    transitioning = false;
    failedWorld();
    return;
  }
  if (worldElement.hidden) {
    transitioning = false;
    return;
  }
  close(false);
  const show = () => {
    if (worldElement.hidden) return;
    destination = next;
    if (entry) memoryEntry = entry;
    world?.show(next, entry === 'dream');
    showScene(next);
  };
  try {
    if (next === 'mind' || next in memoryScenes) await fadeScene(show, { memory: next !== 'mind' });
    else show();
  } finally {
    transitioning = false;
    world?.setPaused(false);
  }
}

function returnToRoom() {
  const entry = memoryEntry;
  destination = undefined;
  memoryEntry = undefined;
  close(false);
  world?.showRoom();
  if (entry === 'victor' && (roomState === 'awake' || roomState === 'lounge')) world?.reactToThoughtVisit();
  showScene();
}

async function ejectFromMind() {
  if (destination !== 'mind' || ejecting) return;
  ejecting = true;
  close();
  markerContainer.inert = dpad.inert = sceneExit.disabled = true;
  try {
    await fadeScene(() => { if (!worldElement.hidden) returnToRoom(); }, { hold: 1400 });
  } finally {
    markerContainer.inert = dpad.inert = sceneExit.disabled = ejecting = false;
    world?.setPaused(false);
  }
}

async function leaveScene() {
  if (!destination || destination === 'trail' || transitioning || ejecting) return;
  if (!(destination in memoryScenes)) {
    returnToRoom();
    return;
  }
  transitioning = true;
  close(false);
  try {
    await fadeScene(() => {
      if (worldElement.hidden) return;
      if (enteredThroughVictor()) {
        destination = 'mind';
        world?.returnToMind();
        showScene('mind');
      } else returnToRoom();
    }, { memory: true });
  } finally {
    transitioning = false;
    world?.setPaused(false);
  }
}

for (const original of template.content.querySelectorAll<HTMLButtonElement>('button')) {
  const button = original.cloneNode(true) as HTMLButtonElement;
  const id = button.dataset.object as ObjectId;
  button.addEventListener('click', () => {
    if (selected === id || transitioning || travelDialog.open) return;
    world?.activateMarker(id);
  });
  buttons.set(id, button);
}
for (const button of dpad.querySelectorAll<HTMLButtonElement>('[data-move]')) {
  const direction = button.dataset.move as Direction;
  button.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    world?.setDirection(direction, `pointer-${event.pointerId}`);
  });
  for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
    button.addEventListener(eventName, event => world?.releaseDirection(`pointer-${event.pointerId}`));
  }
  button.addEventListener('keydown', event => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    world?.setDirection(direction, `button-${direction}-${event.key}`);
  });
  button.addEventListener('keyup', event => world?.releaseDirection(`button-${direction}-${event.key}`));
  button.addEventListener('blur', () => {
    world?.releaseDirection(`button-${direction}- `);
    world?.releaseDirection(`button-${direction}-Enter`);
  });
}
byId('close').addEventListener('click', () => { if (!transitioning) close(); });
window.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || ejecting || travelDialog.open) return;
  if (event.key === 'Escape') {
    if (event.repeat || transitioning) return;
    if (world?.leaveBed()) return;
    if (selected) close();
    else if (destination && destination !== 'trail') leaveScene();
    return;
  }
  if (!selected || (event.key !== 'Enter' && event.key !== ' ')) return;
  const control = event.target instanceof HTMLElement && event.target.closest('a[href], button, input, select, textarea, [contenteditable]');
  if (event.repeat && control === action && event.key === 'Enter') event.preventDefault();
  if (control && (!panel.contains(control) || event.key === 'Enter')) return;
  event.preventDefault();
  if (event.repeat || transitioning) return;
  if (event.key === 'Enter' && !action.hidden && !action.disabled) action.click();
  else close();
});
action.addEventListener('click', () => {
  if (!selected) return;
  if (selected in memoryVictorDetails) {
    const topics = memoryVictorDetails[selected as keyof typeof memoryVictorDetails];
    if (dialogueTopic < topics.length) {
      description.textContent = topics[dialogueTopic++];
      actionLabel.textContent = 'Continue';
    } else if (dialogueTopic === topics.length) {
      dialogueTopic++;
      description.textContent = memoryDialogueClosing.victor;
      actionLabel.textContent = memoryDialogueClosing.robot;
      for (const link of memoryLinks) link.hidden = link.dataset.memoryProject !== destination;
    } else {
      close();
      world?.sayAsRobot(memoryDialogueClosing.robot);
    }
  } else if (selected === 'victor' || selected === 'dream') void enter('mind', selected);
  else if (selected in posterMemories) void enter(posterMemories[selected as keyof typeof posterMemories]);
});
travelDialog.addEventListener('close', () => {
  const choice = travelDialog.returnValue;
  if (choice === 'trail' && !destination) void enter('trail');
  else if (choice === 'room' && destination === 'trail') returnToRoom();
  else {
    world?.setPaused(false);
    if (!worldElement.hidden) canvas.focus({ preventScroll: true });
  }
});
sceneExit.addEventListener('click', leaveScene);
previewTime.addEventListener('input', () => {
  if (previewDay.value === 'live') previewDay.value = denverNow(new Date()).weekend ? 'weekend' : 'weekday';
  updateClock();
});
previewDay.addEventListener('change', updateClock);
byId('clock').hidden = false;
updateClock();
void enable3d();
window.setInterval(updateClock, 1000);
window.setInterval(() => {
  if (document.hidden) return;
  logCount++;
  if (selected === 'terminal') terminalOutput();
}, 1800);
