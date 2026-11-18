import * as T from 'three';
import { box, cylinder, travelCircle } from './set';
import { officeGreetings, officeSecurityThoughts, officeShifts } from './content';
import { canWalk, walkingRoute, type WalkableSpace } from './navigation';
import { backpackModel, victorAvatar } from './victor-avatar';
import { avatarWalker } from './avatar-walk';
import { officeLandscape } from './office-landscape';

type Avatar = ReturnType<typeof victorAvatar>;
type Commute = 'arriving' | 'leaving';
type OfficeWorker = {
  person: Avatar;
  walker: ReturnType<typeof avatarWalker>;
  post: T.Vector3;
  shift: { start: number; end: number };
  seat?: { approach: T.Vector3; pose: (seated: boolean) => void };
};

export function officeScene() {
  const scene = new T.Scene();
  const ambient = new T.HemisphereLight(0xf3f6ff, 0xb4aab4);
  const sunlight = new T.DirectionalLight(0xf6f8ff);
  sunlight.position.set(-8, 10, 8);
  const interiorLight = new T.DirectionalLight(0xfff8ef);
  interiorLight.position.set(3, 6, -5);
  scene.add(ambient, sunlight, interiorLight);
  const bounds = { left: -10.4, right: 10.4, back: -6.8, front: 6.8 };
  const obstacles: WalkableSpace['obstacles'] = [];
  const space = { bounds, obstacles };
  const entryX = 3.22;
  const backWall = -6.99;
  const exitThreshold = new T.Vector3(entryX, 0, bounds.back + .01);
  const outside = new T.Vector3(entryX, 0, backWall - 1.28);
  const travel = travelCircle(scene, entryX, backWall + 1.42);
  const spawn = travel.position.clone();
  const walnut = 0x9d6542;
  const oak = 0xb37d52;
  const fabric = 0x846457;
  const glassHeight = 3.28;

  box(scene, [21.25, .26, 14.05], [0, -.13, 0], 0x5d4138);
  for (let row = 0; row < 7; row++) {
    for (let column = 0; column < 11; column++) {
      const color = [0x3c3740, 0x433b43, 0x453d44, 0x3e383e][(row * 7 + column * 11) % 4];
      box(scene, [1.925, .017, 1.99], [-9.65 + column * 1.93, -.007, -6 + row * 2], color);
    }
  }
  box(scene, [4.5, .016, 3.64], [8.08, .004, 2.38], 0x695347);
  box(scene, [3.65, .017, 2.32], [entryX, .002, backWall + 1.18], 0x685249);

  function obstacle(x: number, z: number, width: number, depth: number) {
    obstacles.push({ left: x - width / 2, right: x + width / 2, back: z - depth / 2, front: z + depth / 2 });
  }

  function divider(x: number, z: number, width: number, depth: number) {
    box(scene, [width, 1.53, depth], [x, .765, z], fabric);
    box(scene, [width + .01, .056, depth + .02], [x, 1.54, z], oak);
    obstacle(x, z, width, depth);
  }

  const exteriorGlass = new T.MeshBasicMaterial({ color: 0xcce5df, transparent: true, opacity: .105, depthWrite: false, side: T.DoubleSide });
  const interiorGlass = exteriorGlass.clone();
  interiorGlass.color.setHex(0xe9e4df);
  interiorGlass.opacity = .115;
  function glazing(x: number, z: number, length: number, turn = 0, interior = false) {
    const frame = new T.Group();
    frame.position.set(x, 0, z);
    frame.rotation.y = turn;
    scene.add(frame);
    const sections = Math.ceil(length / 2.65);
    const panel = new T.Mesh(new T.PlaneGeometry(length, glassHeight), interior ? interiorGlass : exteriorGlass);
    panel.position.y = glassHeight / 2;
    frame.add(panel);
    const frameColor = interior ? walnut : 0x7d6456;
    for (const y of [.04, glassHeight]) box(frame, [length, .07, .09], [0, y, 0], frameColor);
    for (let i = 0; i <= sections; i++) {
      box(frame, [.068, glassHeight, .075], [length * (i / sections - .5), glassHeight / 2, 0], frameColor);
    }
    if (interior) obstacle(x, z, turn ? .075 : length, turn ? length : .075);
  }
  function glassDoorway(x: number, z: number, width: number, turn = 0) {
    const frame = new T.Group();
    frame.position.set(x, 0, z);
    frame.rotation.y = turn;
    scene.add(frame);
    box(frame, [width, .10, .10], [0, 2.34, 0], walnut);
    box(frame, [width, .07, .09], [0, glassHeight, 0], walnut);
    const transom = new T.Mesh(new T.PlaneGeometry(width, glassHeight - 2.39), interiorGlass);
    transom.position.y = (glassHeight + 2.39) / 2;
    frame.add(transom);
  }
  glazing(-10.56, 0, 14, Math.PI / 2);
  glazing(0, 6.98, 21.12);

  const doorwayWidth = 1.78;
  const doorwayLeft = entryX - doorwayWidth / 2;
  const doorwayRight = entryX + doorwayWidth / 2;
  for (const [start, end] of [[-10.6, doorwayLeft], [doorwayRight, 10.6]]) {
    box(scene, [end - start, glassHeight, .13], [(start + end) / 2, glassHeight / 2, backWall], 0xd6bca6);
    box(scene, [end - start, .15, .08], [(start + end) / 2, .077, backWall + .11], walnut);
  }
  box(scene, [doorwayWidth, glassHeight - 2.48, .13], [entryX, (glassHeight + 2.48) / 2, backWall], 0xd6bca6);
  for (const side of [-1, 1]) box(scene, [.12, 2.50, .20], [entryX + side * doorwayWidth / 2, 1.25, backWall], walnut);
  box(scene, [doorwayWidth, .12, .20], [entryX, 2.48, backWall], walnut);
  box(scene, [2.16, .20, 1.65], [entryX, -.10, backWall - .825], 0x575964);

  const entryDoor = new T.Group();
  entryDoor.position.set(doorwayLeft + .065, 0, backWall);
  scene.add(entryDoor);
  box(entryDoor, [1.62, 1.35, .105], [.81, .675, 0], walnut);
  box(entryDoor, [1.62, .26, .105], [.81, 2.29, 0], walnut);
  for (const x of [.244, 1.376]) box(entryDoor, [.488, .81, .105], [x, 1.755, 0], walnut);
  const doorWindow = new T.Mesh(new T.PlaneGeometry(.65, .81), exteriorGlass);
  doorWindow.position.set(.81, 1.755, .016);
  entryDoor.add(doorWindow);
  for (const y of [1.34, 2.16]) box(entryDoor, [.68, .045, .127], [.81, y, 0], 0x624737);
  for (const x of [.48, 1.14]) box(entryDoor, [.045, .85, .127], [x, 1.75, 0], 0x624737);
  for (const x of [.28, 1.34]) box(entryDoor, [.14, .13, .082], [x, 1.02, .082], 0x514a49);
  box(entryDoor, [1.20, .09, .065], [.81, 1.02, .123], 0xc7c1b7);

  box(scene, [.15, glassHeight, 14], [10.54, glassHeight / 2, 0], 0xd1b49c);
  box(scene, [.08, .15, 14], [10.42, .077, 0], walnut);

  glazing(-7.07, 2.25, 6.92, 0, true);
  glazing(-3.61, 2.72, .94, Math.PI / 2, true);
  glassDoorway(-3.61, 4.02, 1.66, Math.PI / 2);
  glazing(-3.61, 5.915, 2.13, Math.PI / 2, true);

  function desk(x: number, z: number, width: number, depth: number) {
    box(scene, [width, .10, depth], [x, .83, z], oak);
    for (const side of [-1, 1]) {
      box(scene, [.105, .79, depth * .8], [x + side * (width / 2 - .17), .40, z], 0x5f493f);
    }
    obstacle(x, z, width, depth);
  }

  function plant(x: number, z: number) {
    cylinder(scene, .27, .39, x, .20, z, 0xab6e53);
    cylinder(scene, .05, 1, x, .68, z, 0x6b6551);
    for (const [i, angle] of [-.8, .4, 1.65, 2.9, 4.25].entries()) {
      const leaf = box(scene, [.14, .13, .50], [x + Math.sin(angle) * .19, .78 + i * .09, z + Math.cos(angle) * .19],
        i % 2 ? 0x668257 : 0x536c4c);
      leaf.rotation.set(.4 + i * .05, angle, 0, 'YXZ');
    }
    obstacle(x, z, .53, .53);
  }
  plant(-10.02, 2.78);
  plant(9.88, -.89);
  plant(9.95, 5.69);

  const coffeeStop = new T.Vector3(8.48, 0, 1.32);
  desk(9.64, 2.15, 1.26, 3.28);
  box(scene, [.51, .46, .54], [9.62, 1.10, 1.28], 0x514039);
  box(scene, [.46, .18, .51], [9.48, 1.04, 1.28], 0x312d31);
  box(scene, [.055, .16, .34], [9.36, 1.34, 1.28], 0xc4a78a);
  cylinder(scene, .11, .035, 9.42, 1.25, 1.42, 0x87baa3);
  for (const [i, z] of [1.88, 2.12, 2.36].entries()) {
    cylinder(scene, .083, .13, 9.35, .945, z, [0xe2b16a, 0xe9dfc9, 0xbc7962][i]);
    box(scene, [.055, .065, .049], [9.26, .969, z], 0xe7d5b8);
  }
  box(scene, [.61, .065, .70], [9.64, .908, 3.01], 0x7c4d39);
  for (let i = 0; i < 6; i++) {
    cylinder(scene, .073, .059, 9.48 + (i % 2) * .21, .97, 2.80 + Math.floor(i / 2) * .20,
      i % 2 ? 0xcc8e55 : 0xe4b57f);
  }
  box(scene, [2.55, .42, .78], [4.40, .31, 5.98], 0x9c5c4a);
  box(scene, [2.55, .59, .18], [4.40, .56, 6.31], 0x8e5145);
  for (const x of [3.17, 5.63]) box(scene, [.15, .48, .79], [x, .49, 5.98], 0x8e5145);
  obstacle(4.40, 6.0, 2.62, .94);
  cylinder(scene, .57, .08, 4.40, .46, 4.78, oak);
  cylinder(scene, .11, .42, 4.40, .24, 4.78, walnut);
  box(scene, [.45, .037, .31], [4.48, .514, 4.80], 0xc1a083).rotation.y = .18;
  obstacle(4.40, 4.78, 1.12, 1.12);
  const barStop = new T.Vector3(7.62, 0, 5.53);
  box(scene, [3.42, .11, .72], [7.68, 1.08, 6.45], oak);
  box(scene, [3.38, .13, .15], [7.68, 1.00, 6.71], walnut);
  for (const x of [6.14, 9.21]) box(scene, [.12, 1.03, .49], [x, .515, 6.49], 0x67473a);
  obstacle(7.68, 6.45, 3.42, .72);
  box(scene, [.51, .036, .34], [7.62, 1.153, 6.29], 0x494650);
  const laptopLid = box(scene, [.51, .34, .038], [7.62, 1.321, 6.46], 0x42404a);
  laptopLid.rotation.x = -.16;
  const laptopFace = box(scene, [.46, .28, .012], [7.62, 1.323, 6.437], 0x47778b, .3);
  laptopFace.rotation.x = laptopLid.rotation.x;
  const laptopPower = screenPower(laptopFace, 0x47778b, new T.Vector3(0, -.11, -.23), .7);
  laptopPower(false);

  const lightLandscape = officeLandscape(scene, entryX);

  const labFixture = box(scene, [1.52, .077, .24], [-7.3, 3.24, 4.7], 0xffe7ce);
  const meetingFixture = box(scene, [1.52, .077, .24], [7.6, 3.24, -3.8], 0xf5f3ef);
  const loungeFixture = box(scene, [1.52, .077, .24], [8.5, 3.24, 2.3], 0xffe7ce);
  const labFill = new T.PointLight(0xffd7ab, 0, 6.4, 1.75);
  labFill.position.set(-7.6, 2.93, 4.7);
  const benchFill = new T.PointLight(0xffc38a, 0, 3.5, 1.85);
  benchFill.position.set(-6.05, 2.0, 4.34);
  const loungeFill = new T.PointLight(0xffdfbd, 0, 6.2, 1.75);
  loungeFill.position.set(8.5, 2.93, 2.48);
  scene.add(labFill, benchFill, loungeFill);

  function screenPower(surface: T.Mesh<T.BoxGeometry, T.MeshStandardMaterial>, color: number, spill: T.Vector3,
    strength: number, details?: T.Group) {
    const glow = new T.PointLight(color, strength, strength > 3 ? 3.8 : 1.8, 1.8);
    glow.position.copy(surface.position).add(spill);
    scene.add(glow);
    let powered: boolean | undefined;
    return (on: boolean) => {
      if (powered === on) return;
      powered = on;
      surface.material.color.setHex(on ? color : 0x24222b);
      surface.material.emissiveIntensity = on ? .72 : 0;
      glow.visible = on;
      if (details) details.visible = on;
    };
  }

  function monitor(x: number, z: number, width: number, color: number) {
    box(scene, [.32, .05, .25], [x, .91, z], 0x29323c);
    box(scene, [.085, .29, .06], [x, 1.06, z], 0x303b43);
    box(scene, [width, .54, .075], [x, 1.37, z], 0x26313a);
    const screen = box(scene, [width - .07, .46, .012], [x, 1.37, z + .044], color, .22);
    const details = new T.Group();
    scene.add(details);
    for (let line = 0; line < 4; line++) {
      box(details, [width * (.49 - line * .069), .021, .009], [x - .10, 1.50 - line * .09, z + .055], 0x99d9d9, .42);
    }
    return screenPower(screen, color, new T.Vector3(0, -.14, .35), 1.75, details);
  }

  const cornerDesk = { x: -7.45, z: 4.43 };
  desk(cornerDesk.x, cornerDesk.z, 4.70, 1.18);
  const victorScreens = [
    monitor(-8.88, 4.22, 1.04, 0x294b66),
    monitor(-7.75, 4.22, 1.04, 0x27675f),
  ];
  box(scene, [.65, .035, .25], [-8.28, .904, 4.81], 0x37474b);
  const arm = new T.Group();
  arm.position.set(-5.94, .89, 4.52);
  scene.add(arm);
  cylinder(arm, .28, .13, 0, .065, 0, 0x3f4855);
  const shoulder = new T.Group();
  shoulder.position.y = .22;
  arm.add(shoulder);
  cylinder(shoulder, .172, .29, 0, 0, 0, 0x56636e).rotation.x = Math.PI / 2;
  box(shoulder, [.22, .61, .23], [0, .31, 0], 0xe4e6e7);
  const elbow = new T.Group();
  elbow.position.y = .61;
  shoulder.add(elbow);
  cylinder(elbow, .153, .265, 0, 0, 0, 0x556674).rotation.x = Math.PI / 2;
  box(elbow, [.20, .53, .21], [0, .24, 0], 0xe9eaec);
  const wrist = new T.Group();
  wrist.position.y = .54;
  elbow.add(wrist);
  box(wrist, [.23, .20, .21], [0, .06, 0], 0x444c59);
  for (const side of [-1, 1]) box(wrist, [.052, .21, .09], [side * .092, .20, 0], 0x333d49);
  box(scene, [.57, .03, .40], [-6.63, .899, 4.74], 0x49666a);
  box(scene, [.16, .19, .16], [-6.66, 1.01, 4.76], 0xe2b16c);

  const victor = victorAvatar();
  const victorWalker = avatarWalker(victor);
  const keyboard = new T.Vector3(-8.3, 0, 5.48);
  const testBench = new T.Vector3(-6.1, 0, 5.48);
  const bag = backpackModel();
  bag.position.set(0, .91, -.242);
  bag.rotation.y = Math.PI;
  bag.visible = false;
  victor.dressed.add(bag);
  scene.add(victor.root);
  const victorAnchor = { point: new T.Vector3(), target: new T.Vector3(), radius: 1.30 };

  const cubicleEdges = [-10.40, -6.34, -2.28, 1.78];
  const staff = [-6.52, -2.02].flatMap((back, row) => {
    const depth = 2.90;
    divider(-4.31, back, 12.18, .09);
    for (const edge of cubicleEdges) divider(edge, back + depth / 2, .11, depth);
    return cubicleEdges.slice(0, -1).map((left, column) => {
      const x = left + 2.03;
      const screenZ = back + .54;
      divider(left + .93, back + depth, 1.86, .11);
      desk(x - .03, screenZ, 3.16, .70);
      desk(x + 1.20, screenZ + .76, .76, .82);
      const setMonitor = monitor(x - .26, screenZ - .10, .76, [0x3b7779, 0x36678c, 0x5e577d][column]);
      box(scene, [.53, .025, .16], [x - .26, .894, screenZ + .24], 0x544841);
      box(scene, [.41, .025, .29], [x + 1.20, .894, screenZ + .80], 0xb7a287);
      const person = victorAvatar({ shirt: [0x995962, 0x5b817c, 0x996f48, 0x566e95, 0x6f648e, 0x6f8562][row * 3 + column] });
      const cup = cylinder(person.arms[1], .059, .109, 0, -.385, .10, 0xeedec9);
      cup.visible = false;
      scene.add(person.root);
      const phase = row * 3 + column;
      return { person, cup, setMonitor, post: new T.Vector3(x - .26, 0, back + 1.20), walker: avatarWalker(person),
        shift: officeShifts.desks[phase], phase };
    });
  });

  glazing(4.66, -4.30, 5.40, Math.PI / 2, true);
  glazing(4.98, -1.60, .64, 0, true);
  glassDoorway(6.1, -1.60, 1.6);
  glazing(8.72, -1.60, 3.64, 0, true);
  desk(7.83, -4.23, 3.32, 1.45);
  box(scene, [3.5, 1.42, .10], [7.88, 1.70, -6.86], 0x293843);
  const meetingScreen = box(scene, [3.33, 1.26, .015], [7.88, 1.70, -6.796], 0x436980, .29);
  const slides = new T.Group();
  scene.add(slides);
  const meetingPower = screenPower(meetingScreen, 0x436980, new T.Vector3(0, -.24, .62), 4.4, slides);
  for (const [i, y] of [2.08, 1.76, 1.44].entries()) {
    box(slides, [1.42 - .24 * i, .075, .018], [7.22 - .12 * i, y, -6.783], 0x99d8e9, .25);
  }
  for (const [i, height] of [.25, .40, .55].entries()) {
    box(slides, [.16, height, .025], [8.70 + i * .30, 1.34 + height / 2, -6.779], 0x95d3ac, .25);
  }
  const meeting = [6.66, 7.78, 8.90].map((x, i) => {
    const person = victorAvatar({ shirt: [0x996246, 0x567d93, 0x7d688d][i] });
    box(scene, [.51, .09, .52], [x, .44, -2.90], 0x445767);
    box(scene, [.49, .39, .10], [x, .68, -2.63], 0x536775);
    cylinder(scene, .072, .40, x, .22, -2.90, 0x4d5963);
    obstacle(x, -2.90, .51, .65);
    const seatedLegs = new T.Group();
    person.dressed.add(seatedLegs);
    for (const leg of person.legs) {
      box(seatedLegs, [.17, .17, .34], [leg.position.x, .68, .125], 0x303650);
      box(seatedLegs, [.17, .36, .18], [leg.position.x, .45, .25], 0x303650);
    }
    scene.add(person.root);
    const seat = {
      approach: new T.Vector3(x + .54, 0, -2.93),
      pose(seated: boolean) {
        person.dressed.position.y = person.eyes.position.y = seated ? -.26 : 0;
        seatedLegs.visible = seated;
        for (const leg of person.legs) leg.visible = !seated;
      },
    };
    return { person, walker: avatarWalker(person), post: new T.Vector3(x, 0, -2.93), shift: officeShifts.meeting[i], seat, phase: i };
  });

  const victorWorker = { person: victor, walker: victorWalker, post: keyboard, shift: officeShifts.victor };
  const coworkers: OfficeWorker[] = [...staff, ...meeting];

  const alarm = box(scene, [.34, .26, .17], [entryX, 2.85, backWall + .13], 0x772c34);
  const beacon = new T.PointLight(0xf94e48, 0, 6, 1.5);
  beacon.position.set(entryX, 2.84, backWall + .32);
  scene.add(beacon);
  const guard = new T.Group();
  scene.add(guard);
  cylinder(guard, .26, .24, 0, .15, 0, 0x393c4a);
  box(guard, [.62, .43, .57], [0, .43, 0], 0x455465);
  box(guard, [.50, .13, .035], [0, .48, .30], 0xd95855, .65);
  cylinder(guard, .11, .10, 0, .70, 0, 0xf4635e);
  const guardStart = new T.Vector3(7.52, 0, 2.73);
  const guardPoint = new T.Vector3();
  const patrol = [guardStart, new T.Vector3(2.9, 0, 3.5), new T.Vector3(-2.7, 0, 2.95), new T.Vector3(6.15, 0, 2.0)];
  const motion = new T.Vector3();
  const sky = new T.Color();
  const night = new T.Color(0x28222d);
  const day = new T.Color(0xc3c9d1);
  const daylightWhite = new T.Color(0xf3f6ff);
  const eveningAmber = new T.Color(0xffceaa);
  const nightBlue = new T.Color(0xa8b7d8);
  let weekend = false;
  let elapsed = 0;
  let pursuit = false;
  let caught = false;
  let searchTime = 0;
  let toCheckpoint = 1;
  let route: T.Vector3[] = [];
  let updateRouteIn = 0;
  let workTime = 0;
  let clockMinutes = 0;
  const workers = [victorWorker, ...coworkers];
  type Trip = { kind: Commute; startsAt: number; path?: T.Vector3[]; packing?: number; greeted: boolean };
  const commutes = new Map<OfficeWorker, Trip>();
  let nextCommuteAt = 0;
  let greeting: { worker: OfficeWorker; text: string; endsAt: number } | undefined;
  const greetingPoint = new T.Vector3();

  function onShift({ shift }: OfficeWorker, minutes = clockMinutes, closed = weekend) {
    return !closed && minutes >= shift.start && minutes < shift.end;
  }

  const working = () => onShift(victorWorker) && !commutes.has(victorWorker);
  const atPost = (worker: OfficeWorker) => worker.person.root.visible && !commutes.has(worker);
  const stillAtPost = (worker: OfficeWorker) => {
    const trip = commutes.get(worker);
    return worker.person.root.visible && (!trip || (trip.kind === 'leaving' && !trip.path));
  };

  function clearGreeting() {
    if (greeting) greeting.worker.person.arms[1].rotation.z = 0;
    greeting = undefined;
  }

  function settle(worker: OfficeWorker, present: boolean) {
    commutes.delete(worker);
    const { person } = worker;
    person.root.visible = present;
    if (present) {
      person.root.position.copy(worker.post);
      person.root.rotation.y = Math.PI;
    } else if (greeting?.worker === worker) clearGreeting();
    worker.seat?.pose(present);
    if (worker === victorWorker) {
      bag.visible = false;
      workTime = 0;
    }
  }

  function setSchedule(minutes: number, isWeekend: boolean, watched = false) {
    const previousMinutes = clockMinutes;
    const previousWeekend = weekend;
    if (weekend !== isWeekend) resetPatrol();
    weekend = isWeekend;
    clockMinutes = minutes;
    guard.visible = weekend;
    const forward = watched && !previousWeekend && !weekend && minutes > previousMinutes;
    // Nearby clock changes replay crossed shifts, while larger jumps establish the new time directly.
    const animate = forward && minutes - previousMinutes <= 10;
    if (!animate) {
      nextCommuteAt = elapsed;
      clearGreeting();
      clearCoffeeTrip();
      coffeeIn = 12;
    }

    const changes = workers
      .map(worker => ({ worker, present: onShift(worker), wasPresent: onShift(worker, previousMinutes, previousWeekend) }))
      .sort((a, b) => (a.present ? a.worker.shift.start : a.worker.shift.end) -
        (b.present ? b.worker.shift.start : b.worker.shift.end));
    for (const { worker, present, wasPresent } of changes) {
      const crossingVictorClockOut = forward && worker === victorWorker && wasPresent &&
        previousMinutes >= worker.shift.end - 60 && minutes >= worker.shift.end && minutes < worker.shift.end + 5;
      if (present !== wasPresent && (animate || crossingVictorClockOut)) {
        const startsAt = Math.max(elapsed, nextCommuteAt);
        commutes.set(worker, { kind: present ? 'arriving' : 'leaving', startsAt, greeted: false });
        nextCommuteAt = startsAt + 2.0;
      } else if (!animate) settle(worker, present);
    }
    updateLighting();
  }

  function updateLighting() {
    const daylight = T.MathUtils.smoothstep(clockMinutes, 360, 540) * (1 - T.MathUtils.smoothstep(clockMinutes, 1020, 1170));
    const occupied = !weekend && (clockMinutes >= officeShifts.victor.start && clockMinutes < 18 * 60 ||
      coworkers.some(({ person }) => person.root.visible));
    const lateShift = victor.root.visible && !occupied;
    const victorScreensOn = victor.root.visible && commutes.get(victorWorker)?.kind !== 'arriving';
    for (const setMonitor of victorScreens) setMonitor(victorScreensOn);
    for (const employee of staff) employee.setMonitor(stillAtPost(employee));
    meetingPower(meeting.some(stillAtPost));
    sky.copy(night).lerp(day, daylight);
    lightLandscape(daylight);
    ambient.color.copy(nightBlue).lerp(daylightWhite, daylight);
    ambient.intensity = .49 + daylight * .95 + (occupied ? .37 : 0);
    sunlight.color.copy(nightBlue).lerp(daylightWhite, daylight)
      .lerp(eveningAmber, daylight * (1 - daylight) * 1.6);
    sunlight.intensity = .19 + daylight * 1.14;
    interiorLight.intensity = occupied ? .60 : 0;
    labFixture.material.emissiveIntensity = lateShift ? .62 : occupied ? .35 : 0;
    meetingFixture.material.emissiveIntensity = occupied ? .35 : 0;
    loungeFixture.material.emissiveIntensity = lateShift ? .65 : occupied ? .35 : 0;
    labFill.intensity = lateShift ? 28 : 0;
    benchFill.intensity = lateShift ? 12 : 0;
    loungeFill.intensity = lateShift ? 27 : 0;
  }

  function resetPatrol() {
    guard.position.copy(guardStart);
    guard.rotation.y = -Math.PI / 2;
    route = [];
    toCheckpoint = 1;
    updateRouteIn = 0;
    searchTime = 0;
    pursuit = caught = false;
  }

  type Employee = typeof staff[number];
  let coffeeTrip: { employee: Employee; route: T.Vector3[]; pause: number; destination: 'counter' | 'bar' | 'desk'; visitBar: boolean } | undefined;
  let coffeeIn = 12;
  let nextEmployee = staff.length - 1;
  let barIsNext = true;

  function clearCoffeeTrip() {
    if (coffeeTrip) coffeeTrip.employee.cup.visible = false;
    laptopPower(false);
    coffeeTrip = undefined;
    coffeeIn = 33;
  }

  function updateCoffee(seconds: number, reduceMotion: boolean) {
    if (reduceMotion) {
      clearCoffeeTrip();
      return;
    }
    if (!coffeeTrip) {
      coffeeIn -= seconds;
      if (coffeeIn > 0) return;
      const index = staff.findIndex((_, offset) => atPost(staff[(nextEmployee + offset) % staff.length]));
      if (index < 0) {
        coffeeIn = 15;
        return;
      }
      const employeeIndex = (nextEmployee + index) % staff.length;
      const employee = staff[employeeIndex];
      nextEmployee = (employeeIndex + 1) % staff.length;
      const route = walkingRoute(space, employee.post, coffeeStop);
      if (route.length) {
        coffeeTrip = { employee, route, pause: 2.3, destination: 'counter', visitBar: barIsNext };
        barIsNext = !barIsNext;
      } else coffeeIn = 10;
      return;
    }
    const { employee, route } = coffeeTrip;
    const { person } = employee;
    const next = route[0];
    if (next) {
      motion.subVectors(next, person.root.position);
      const distance = motion.length();
      const step = 1.65 * seconds;
      if (distance > .004) person.root.rotation.y = Math.atan2(motion.x, motion.z);
      if (distance <= step) {
        person.root.position.copy(next);
        route.shift();
      } else person.root.position.addScaledVector(motion, step / distance);
      const gait = Math.sin(elapsed * 9.6) * .30;
      person.legs[0].rotation.x = gait;
      person.legs[1].rotation.x = -gait;
      person.arms[0].rotation.x = -gait * .62;
      person.arms[1].rotation.x = employee.cup.visible ? -1.04 : gait * .62;
      return;
    }
    if (coffeeTrip.destination === 'desk') {
      clearCoffeeTrip();
      return;
    }
    const atBar = coffeeTrip.destination === 'bar';
    person.root.rotation.y = atBar ? 0 : Math.PI / 2;
    person.legs.forEach(leg => { leg.rotation.x = 0; });
    coffeeTrip.pause -= seconds;
    laptopPower(atBar);
    person.arms[0].rotation.x = atBar ? -1.0 + Math.sin(elapsed * 7) * .09 : -.12;
    person.arms[1].rotation.x = atBar ? -1.12 - Math.max(0, Math.sin(elapsed * 2.1)) * .52 : coffeeTrip.pause < 1.28 ? -1.46 : -.78;
    employee.cup.visible = atBar || coffeeTrip.pause < 1.45;
    if (coffeeTrip.pause > 0) return;
    const toBar = !atBar && coffeeTrip.visitBar;
    const onward = walkingRoute(space, person.root.position, toBar ? barStop : employee.post);
    laptopPower(false);
    if (onward.length) {
      coffeeTrip.route = onward;
      coffeeTrip.destination = toBar ? 'bar' : 'desk';
      coffeeTrip.pause = 8;
    } else clearCoffeeTrip();
  }

  function updatePeople(seconds: number, reduceMotion: boolean) {
    if (seconds > 0) updateCoffee(seconds, reduceMotion);
    for (const employee of staff) {
      const { person, post, phase } = employee;
      if (!stillAtPost(employee) || coffeeTrip?.employee === employee) continue;
      person.root.position.copy(post);
      person.root.rotation.y = Math.PI;
      person.legs.forEach(leg => { leg.rotation.x = 0; });
      person.arms[0].rotation.x = -.74 + (reduceMotion ? 0 : Math.sin(elapsed * 8 + phase) * .075);
      person.arms[1].rotation.x = -.75 + (reduceMotion ? 0 : Math.cos(elapsed * 9 + phase) * .065);
    }
    for (const worker of meeting) {
      if (!stillAtPost(worker)) continue;
      const { person, phase } = worker;
      person.arms[0].rotation.x = -.40;
      person.arms[1].rotation.x = -.50 + (reduceMotion ? 0 : Math.sin(elapsed * 1.5 + phase) * .13);
    }
  }

  const nearDoor = (point: T.Vector3) => Math.abs(point.x - entryX) < .78 && point.z < backWall + .78;
  const blockedByDoor = (point: T.Vector3) => Math.abs(point.x - entryX) < .42 &&
    Math.abs(point.z - backWall) < .44 && entryDoor.rotation.y < .95;

  function beginCommute(worker: OfficeWorker, trip: Trip) {
    const { kind } = trip;
    const { person, post, seat } = worker;
    if (coffeeTrip?.employee === worker) clearCoffeeTrip();

    const inside = seat?.approach ?? post;
    if (kind === 'arriving') {
      const path = walkingRoute(space, exitThreshold, inside);
      if (!path.length) return;
      person.root.position.copy(outside);
      person.root.rotation.y = 0;
      person.root.visible = true;
      if (worker === victorWorker) bag.visible = true;
      trip.path = [exitThreshold, ...path, ...(seat ? [post] : [])];
    } else if (worker === victorWorker) {
      // Victor puts on his backpack at his desk before following the shared exit route.
      trip.path = [keyboard];
      trip.packing = .85;
    } else {
      const path = walkingRoute(space, seat ? inside : person.root.position, exitThreshold);
      if (!path.length) return;
      trip.path = [...(seat ? [inside] : []), ...path, outside];
    }
    seat?.pose(false);
    updateLighting();
  }

  function advanceCommute(worker: OfficeWorker, trip: Trip, seconds: number, reduceMotion: boolean) {
    if (elapsed < trip.startsAt) return;
    if (!trip.path) {
      beginCommute(worker, trip);
      if (!trip.path) {
        settle(worker, trip.kind === 'arriving');
        updateLighting();
        return;
      }
    }
    const { person, walker } = worker;
    const atDestination = walker.walk(trip.path, seconds, worker === victorWorker ? 2.04 : 1.76,
      reduceMotion, blockedByDoor(person.root.position));
    if (!atDestination) return;
    if (trip.packing !== undefined) {
      const packingTime = .85;
      walker.turn(Math.PI, seconds);
      trip.packing -= seconds;
      person.arms[0].rotation.x = person.arms[1].rotation.x = reduceMotion ? 0 :
        -1.16 * Math.sin(Math.PI * T.MathUtils.clamp(trip.packing / packingTime, 0, 1));
      if (trip.packing > 0) return;
      const routeToDoor = walkingRoute(space, keyboard, exitThreshold);
      if (routeToDoor.length) {
        trip.packing = undefined;
        bag.visible = true;
        trip.path = [...routeToDoor, outside];
        return;
      }
    }
    settle(worker, trip.kind === 'arriving');
    updateLighting();
  }

  function updateGreetings(visitor: T.Vector3 | undefined, reduceMotion: boolean) {
    if (!visitor || (greeting && elapsed >= greeting.endsAt)) clearGreeting();
    if (!visitor) return;
    if (!greeting) {
      for (const [worker, trip] of commutes) {
        if (trip.greeted || !trip.path?.length || trip.packing !== undefined) continue;
        const point = worker.person.root.position;
        if (point.z < bounds.back || point.distanceToSquared(visitor) > 1.75 ** 2) continue;
        const clearAisle = [.25, .5, .75].every(t => canWalk(space,
          T.MathUtils.lerp(point.x, visitor.x, t), T.MathUtils.lerp(point.z, visitor.z, t)));
        if (!clearAisle) continue;
        trip.greeted = true;
        const lines = officeGreetings[trip.kind];
        const text = worker === victorWorker ? officeGreetings.victor[trip.kind] :
          lines[coworkers.indexOf(worker) % lines.length];
        greeting = { worker, text, endsAt: elapsed + 2.4 };
        break;
      }
    }
    if (!greeting || reduceMotion) return;
    const time = 2.4 - (greeting.endsAt - elapsed);
    const envelope = T.MathUtils.smoothstep(time, 0, .22) * (1 - T.MathUtils.smoothstep(time, .95, 1.4));
    greeting.worker.person.arms[1].rotation.z = envelope * (2.0 + Math.sin(time * 19) * .26);
  }

  function updateVictor(seconds: number, reduceMotion: boolean) {
    if (working()) {
      workTime = (workTime + seconds) % 13;
      const approach = T.MathUtils.smoothstep(workTime, 4, 6) * (1 - T.MathUtils.smoothstep(workTime, 9, 11));
      const nextX = reduceMotion ? keyboard.x : T.MathUtils.lerp(keyboard.x, testBench.x, approach);
      const distance = Math.abs(nextX - victor.root.position.x);
      victor.root.position.x = nextX;
      const outbound = !reduceMotion && workTime >= 3.7 && workTime < 6;
      const inbound = !reduceMotion && workTime >= 8.7 && workTime < 11;
      victorWalker.turn(outbound ? Math.PI / 2 : inbound ? -Math.PI / 2 : Math.PI, seconds);
      victorWalker.stride(distance, seconds, reduceMotion);
      if (!outbound && !inbound) {
        victor.arms[0].rotation.x = -.55 + (reduceMotion ? 0 : Math.sin(elapsed * 9) * .17);
        victor.arms[1].rotation.x = -.62 + (reduceMotion ? 0 : Math.cos(elapsed * 8) * .19);
      }
    }
    victorAnchor.target.copy(victor.root.position);
    victorAnchor.point.copy(victorAnchor.target).y = 1.69;
  }

  function update(seconds: number, visitor: T.Vector3, paused: boolean, reduceMotion: boolean) {
    elapsed += seconds;
    const atDoor = (!paused && nearDoor(visitor)) || [...commutes.keys()].some(worker =>
      worker.person.root.visible && nearDoor(worker.person.root.position));
    const doorAngle = atDoor ? Math.PI * .43 : 0;
    entryDoor.rotation.y = reduceMotion ? doorAngle : T.MathUtils.damp(entryDoor.rotation.y, doorAngle, 11, seconds);
    for (const [worker, trip] of commutes) advanceCommute(worker, trip, seconds, reduceMotion);
    updatePeople(paused ? 0 : seconds, reduceMotion);
    updateVictor(seconds, reduceMotion);
    updateGreetings(paused ? undefined : visitor, reduceMotion);
    const cycle = reduceMotion || !working() ? 0 : Math.sin(elapsed * 1.6) *
      (workTime >= 6 && workTime < 9 ? 1 : .65);
    arm.rotation.y = .24 + cycle * .44;
    shoulder.rotation.z = .54 + cycle * .19;
    elbow.rotation.z = 1.16 - cycle * .28;
    wrist.rotation.z = .89 + cycle * .13;

    const pulse = !weekend ? 0 : reduceMotion ? .70 : .38 + (.5 + .5 * Math.sin(elapsed * 5.5)) ** 2 * 1.7;
    beacon.intensity = pulse * 9;
    alarm.material.emissiveIntensity = pulse;
    if (!weekend || paused || caught) return false;

    searchTime += seconds;
    if (searchTime >= 5.5 || guard.position.distanceToSquared(visitor) < 4.8 ** 2) pursuit = true;
    updateRouteIn -= seconds;
    if (updateRouteIn <= 0) {
      if (!pursuit && guard.position.distanceToSquared(patrol[toCheckpoint]) < .16 ** 2) {
        toCheckpoint = (toCheckpoint + 1) % patrol.length;
      }
      route = walkingRoute(space, guard.position, pursuit ? visitor.clone() : patrol[toCheckpoint]);
      updateRouteIn = .22;
    }
    const next = route[0];
    if (next) {
      motion.subVectors(next, guard.position);
      const distance = motion.length();
      const step = (pursuit ? 4.65 : 2.4) * seconds;
      if (distance > .005) guard.rotation.y = Math.atan2(motion.x, motion.z);
      if (distance <= step) {
        guard.position.copy(next);
        route.shift();
      } else guard.position.addScaledVector(motion, step / distance);
    }
    caught = pursuit && guard.position.distanceToSquared(visitor) < .55 ** 2;
    return caught;
  }

  scene.background = sky;
  resetPatrol();
  setSchedule(0, false);
  return {
    scene, bounds, obstacles, travel, spawn, update, resetPatrol, setSchedule,
    anchors: { officeVictor: victorAnchor },
    canTalk: working,
    get commuting() { return commutes.size > 0; },
    get leaving() { return commutes.get(victorWorker)?.kind === 'leaving'; },
    get thought() {
      if (greeting) {
        greetingPoint.copy(greeting.worker.person.root.position).y = 1.67;
        return { text: greeting.text, point: greetingPoint };
      }
      guardPoint.copy(guard.position).y = 1.08;
      return { text: caught ? officeSecurityThoughts.caught : pursuit ? officeSecurityThoughts.chasing : '', point: guardPoint };
    },
  };
}
