import * as T from 'three';
import { box, cylinder, travelCircle } from './set';
import { daylightAt, type RoomState } from './content';
import { deskArm } from './desk-arm';
import { bathroomDoor } from './bathroom-door';
import { lounge } from './lounge';
import { walkingRoute } from './navigation';
import { victorRoutine } from './routine';
import { woodFloor } from './wood-floor';
import { victorAvatar } from './victor-avatar';
import { enclosedPrinter } from './enclosed-printer';
import { entryClock } from './entry-clock';

export function bedroom(fastRoutine: boolean) {
  const scene = new T.Scene();
  const ambient = new T.HemisphereLight(0xb8c7ee, 0x8b7274, 1.65);
  const fill = new T.DirectionalLight(0xe4d6e3, 1.35);
  fill.position.set(4, 8, 6);
  const sun = new T.DirectionalLight(0xffa151, 0);
  sun.position.set(-5, 4, 2);
  scene.add(ambient, fill, sun);
  const wall = 0xa79b8c;
  const trim = 0xe1dbd1;
  const wood = 0x665064;
  const black = 0x19212d;
  const bounds = { left: -7.12, right: 7.12, back: -4.34, front: 4.34 };
  const partition = 3.25;
  const partitionDepth = .17;
  const bathEdge = 1.54;
  const bathRightWall = 7.39;
  const wallDepth = .16;
  const wallHeight = 2.64;
  const backWallZ = -4.63;
  const backWallDepth = .17;
  const backWallOuter = backWallZ - backWallDepth / 2;
  const bathBack = backWallZ + backWallDepth / 2;
  const bathFrontEdge = bathEdge + wallDepth / 2;
  const bathLeft = partition + partitionDepth / 2;
  const bathRight = bathRightWall - wallDepth / 2;
  const rightWallOuter = bathRightWall + wallDepth / 2;
  const frontWallZ = 4.55;
  const frontWallDepth = .16;
  const frontWallOuter = frontWallZ + frontWallDepth / 2;
  const frontWallInner = frontWallZ - frontWallDepth / 2;
  const leftWallX = -7.42;
  const leftWallDepth = .17;
  const leftWallOuter = leftWallX - leftWallDepth / 2;
  const leftWallInner = leftWallX + leftWallDepth / 2;
  const roomDepth = frontWallOuter - backWallOuter;
  const roomZ = (frontWallOuter + backWallOuter) / 2;
  woodFloor(scene, rightWallOuter - leftWallOuter, roomDepth, (rightWallOuter + leftWallOuter) / 2, roomZ);

  const backWall = new T.Group();
  const leftWall = new T.Group();
  scene.add(backWall, leftWall);
  const tallWallHeight = 3.455;
  const crossWallWidth = bathRight - leftWallInner;
  const crossWallX = (leftWallInner + bathRight) / 2;
  box(leftWall, [leftWallDepth, tallWallHeight, roomDepth], [leftWallX, tallWallHeight / 2, roomZ], wall);
  box(backWall, [crossWallWidth, tallWallHeight, backWallDepth], [crossWallX, tallWallHeight / 2, backWallZ], wall);
  box(scene, [crossWallWidth, .29, frontWallDepth], [crossWallX, .145, frontWallZ], wall);

  const baseboardDepth = .09;
  const baseboardHeight = .14;
  const baseboardY = baseboardHeight / 2;
  const crossBaseboardWidth = crossWallWidth - baseboardDepth;
  const crossBaseboardX = crossWallX + baseboardDepth / 2;
  box(leftWall, [baseboardDepth, baseboardHeight, frontWallInner - bathBack],
    [leftWallInner + baseboardDepth / 2, baseboardY, (bathBack + frontWallInner) / 2], trim);
  box(backWall, [crossBaseboardWidth, baseboardHeight, baseboardDepth],
    [crossBaseboardX, baseboardY, bathBack + baseboardDepth / 2], trim);
  box(scene, [crossBaseboardWidth, baseboardHeight, baseboardDepth],
    [crossBaseboardX, baseboardY, frontWallInner - baseboardDepth / 2], trim);

  const doorWidth = 1.46;
  const clearWidth = 1.5;
  const clearHeight = 2.19;
  const casingWidth = .10;
  const casingTop = clearHeight + casingWidth;
  const frameHalfWidth = clearWidth / 2 + casingWidth;
  const entranceZ = 3.68;

  function doorFrame(parent: T.Object3D, x: number, z: number, rotation: number) {
    const frame = new T.Group();
    frame.position.set(x, 0, z);
    frame.rotation.y = rotation;
    parent.add(frame);
    for (const side of [-1, 1]) {
      box(frame, [casingWidth, casingTop, wallDepth], [side * (clearWidth + casingWidth) / 2, casingTop / 2, 0], trim);
    }
    box(frame, [clearWidth, casingWidth, wallDepth], [0, clearHeight + casingWidth / 2, 0], trim);
    return box(frame, [frameHalfWidth * 2, wallHeight - casingTop, wallDepth],
      [0, (wallHeight + casingTop) / 2, 0], wall);
  }

  function sideWall(parent: T.Object3D, fromZ: number, toZ: number) {
    box(parent, [wallDepth, wallHeight, toZ - fromZ], [bathRightWall, wallHeight / 2, (fromZ + toZ) / 2], wall);
  }

  const entryWall = new T.Group();
  const entrySide = new T.Group();
  scene.add(entryWall, entrySide);
  sideWall(entrySide, bathFrontEdge, entranceZ - frameHalfWidth);
  sideWall(entrySide, entranceZ + frameHalfWidth, frontWallOuter);
  doorFrame(entryWall, bathRightWall, entranceZ, Math.PI / 2);
  function hingedDoor(parent: T.Object3D, x: number, z: number) {
    const door = new T.Group();
    door.position.set(x, 0, z);
    parent.add(door);
    box(door, [.09, 2.14, doorWidth], [0, 1.08, -doorWidth / 2], 0x6f5e65);
    for (const side of [-1, 1]) box(door, [.14, .065, .15], [side * .064, .97, -1.22], 0xb0a693);
    return door;
  }
  const entranceDoor = hingedDoor(entryWall, bathRightWall, entranceZ + doorWidth / 2);
  box(entryWall, [.055, .22, .16], [7.28, 1.05, 2.8], 0xddd1bb);
  const entryToggle = box(entryWall, [.036, .094, .058], [7.244, 1.05, 2.8], 0x8d8073);
  box(leftWall, [.055, .22, .16], [-7.3, 1.05, -.96], 0xddd1bb);
  const bedToggle = box(leftWall, [.036, .094, .058], [-7.264, 1.05, -.96], 0x8d8073);

  const shoeX = 6.29;
  const shoeZ = 1.98;
  box(scene, [1.76, .69, .58], [shoeX, .345, shoeZ], 0x547173);
  box(scene, [1.84, .075, .65], [shoeX, .71, shoeZ], 0x839594);
  for (const x of [shoeX - .43, shoeX + .43]) {
    box(scene, [.82, .52, .05], [x, .36, shoeZ + .304], 0x719091);
    box(scene, [.28, .035, .065], [x, .51, shoeZ + .338], 0xc1b79e);
  }

  const clock = entryClock(scene, shoeX, shoeZ - .05);

  function windowAt(parent: T.Object3D, x: number, z: number, width: number, rotation = 0) {
    const frame = new T.Group();
    frame.position.set(x, 2.34, z);
    frame.rotation.y = rotation;
    parent.add(frame);
    const pane = box(frame, [width, 1.16, .055], [0, 0, 0], 0x58698a, .55);
    for (const x of [-width / 2, 0, width / 2]) box(frame, [.065, 1.23, .09], [x, 0, .03], trim);
    box(frame, [width + .08, .065, .1], [0, .6, .03], trim);
    box(frame, [width + .16, .075, .16], [0, -.6, .05], trim);
    return pane.material;
  }
  const windows = [
    windowAt(leftWall, -7.3, .18, 2.1, Math.PI / 2),
    windowAt(backWall, -3.31, -4.52, 2.32),
    windowAt(backWall, 5.36, -4.52, 1.84),
  ];
  const rug = new T.Group();
  rug.position.set(-1.57, 0, 0);
  scene.add(rug);
  box(rug, [4.35, .025, 3.34], [0, .013, 0], 0x3a302d).material.roughness = 1;
  box(rug, [4.05, .012, 3.04], [0, .033, 0], 0x52443c).material.roughness = 1;
  const loungeArea = lounge(scene, rug.position.x, rug.position.z, frontWallZ - frontWallDepth / 2);

  // Model the desk in local coordinates, then rotate it against the bathroom wall.
  const desk = new T.Group();
  desk.position.set(2.48, 0, -1.54);
  desk.rotation.y = -Math.PI / 2;
  scene.add(desk);
  const deskTop = 1.06;
  box(desk, [5.94, .14, 1.33], [0, deskTop - .07, 0], 0x25242a).material.roughness = .92;
  for (const x of [-2.77, 2.77]) {
    for (const z of [-.48, .48]) box(desk, [.13, .95, .13], [x, .47, z], black);
  }
  const screens: T.MeshStandardMaterial[] = [];
  const screenLines = new T.Group();
  screenLines.visible = false;
  desk.add(screenLines);
  for (const [index, [x, y]] of [[.02, 1.54], [1.11, 1.54], [.02, 2.21], [1.11, 2.21]].entries()) {
    box(desk, [.99, .6, .18], [x, y, -.67], black);
    screens.push(box(desk, [.89, .5, .025], [x, y, -.565], 0x151a22).material);
    for (let line = 0; line < 5; line++) {
      const width = [.51, .33, .61, .25, .41][(line + index) % 5];
      box(screenLines, [width, .017, .01], [x - .36 + width / 2, y + .15 - line * .073, -.548], line === 3 ? 0x64dcca : 0x79aaff, .63);
    }
  }
  const laptop = new T.Group();
  desk.add(laptop);
  box(laptop, [.7, .045, .45], [.65, 1.09, .25], black);
  const laptopLid = new T.Group();
  laptopLid.position.set(.65, 1.126, .04);
  laptop.add(laptopLid);
  box(laptopLid, [.7, .43, .045], [0, .211, 0], 0x313c50);
  const laptopDisplay = box(laptopLid, [.61, .341, .012], [0, .211, .024], 0x345e81, .62);
  box(desk, [.29, .034, .31], [1.25, 1.08, .24], 0x454a60);
  const spill = new T.PointLight(0x468dff, 9, 5.3);
  spill.position.set(.55, 2.05, .19);
  desk.add(spill);

  function backpackModel() {
    const bag = new T.Group();
    box(bag, [.48, .58, .24], [0, -.03, 0], 0x404e42);
    box(bag, [.42, .095, .21], [0, .3, 0], 0x52644e);
    box(bag, [.41, .24, .09], [0, -.155, .153], 0x66795a);
    box(bag, [.36, .024, .028], [0, -.064, .204], 0x303f37);
    box(bag, [.027, .049, .019], [.128, -.085, .217], 0xc2a474);
    for (const x of [-.064, .064]) box(bag, [.028, .085, .031], [x, .36, -.015], 0x303f37);
    box(bag, [.14, .026, .03], [0, .408, -.015], 0x303f37);
    return bag;
  }
  const hookTipHeight = .089;
  const hookTipY = deskTop - hookTipHeight / 2;
  const bagRack = new T.Vector3(2.49, hookTipY - .424, 1.64);
  const bagStop = new T.Vector3(bagRack.x, 0, 2.24);
  const workSpot = new T.Vector3(1.34, 0, -.88);
  const bagTransferStart = new T.Vector3();
  box(scene, [.19, .43, .065], [bagRack.x, deskTop - .25, 1.45], 0x443743);
  box(scene, [.075, .049, .21], [bagRack.x, hookTipY - .026, 1.535], 0xa28d75);
  box(scene, [.064, hookTipHeight, .035], [bagRack.x, hookTipY, 1.63], 0xa28d75);
  const hangingBag = backpackModel();
  hangingBag.position.copy(bagRack);
  hangingBag.visible = false;
  scene.add(hangingBag);

  const ceilingLights = [
    new T.PointLight(0xffbd82, 0, 12),
    new T.PointLight(0xffd0a1, 0, 11),
  ];
  ceilingLights[0].position.set(1.25, 3.45, -.95);
  ceilingLights[1].position.set(-3.35, 3.45, 1.08);
  scene.add(...ceilingLights);

  const posterGroup = new T.Group();
  scene.add(posterGroup);
  const posters = [
    { id: 'poster', x: -.91, y: 2.35, w: .98, accent: 0x447f9a },
    { id: 'teleopPoster', x: .11, y: 2.64, w: .72, accent: 0xbd8464 },
    { id: 'aoiPoster', x: .94, y: 2.16, w: .8, accent: 0x746fac },
  ] as const;
  const posterAnchors = Object.fromEntries(posters.map(({ id, x, y, w, accent }) => {
    box(posterGroup, [w, .87, .06], [x, y, -4.515], black);
    box(posterGroup, [w - .09, .78, .02], [x, y, -4.475], 0xd5d3cb, .13);
    box(posterGroup, [w - .17, .12, .019], [x, y + .26, -4.459], accent, .17);
    for (const offset of [-w * .22, w * .19]) {
      box(posterGroup, [.225, .29, .017], [x + offset, y - .03, -4.456], accent, .13);
      box(posterGroup, [.2, .034, .017], [x + offset, y - .25, -4.456], 0x5d6376);
    }
    return [id, { point: new T.Vector3(x, y + .3, -4.37), target: new T.Vector3(x, 0, -3.72), radius: 1.24 }];
  })) as Record<(typeof posters)[number]['id'], { point: T.Vector3; target: T.Vector3; radius: number }>;

  const awardX = -3.32;
  box(scene, [2.25, .77, .76], [awardX, .385, -4.09], wood);
  box(scene, [2.31, .075, .8], [awardX, .81, -4.09], 0x916f68);
  for (const x of [awardX - .55, awardX + .55]) {
    box(scene, [1.04, .6, .05], [x, .39, -3.686], 0x775e63);
    box(scene, [.25, .045, .07], [x, .51, -3.65], 0xba9b7b);
  }
  for (const [i, offset] of [-.72, 0, .72].entries()) {
    const x = awardX + offset;
    const z = -4.02;
    const color = [0xc58c52, 0xf0be61, 0xb8b5b9][i];
    box(scene, [.24, .07, .23], [x, .88, z], 0x262228);
    cylinder(scene, .055, .15, x, .98, z, color);
    const cup = new T.Mesh(new T.CylinderGeometry(.145, .062, .21, 14), new T.MeshStandardMaterial({ color, metalness: .43, roughness: .3, emissive: color, emissiveIntensity: .13 }));
    cup.position.set(x, 1.12, z);
    scene.add(cup);
  }
  const printer = enclosedPrinter().model;
  printer.position.set(-2.36, 1.06, -.06);
  printer.scale.setScalar(.76);
  desk.add(printer);

  const bedX = -6.01;
  const bed = new T.Group();
  bed.position.set(bedX, 0, -4.44);
  scene.add(bed);
  box(bed, [2.06, .35, 2.91], [0, .22, 1.52], 0x574455);
  box(bed, [2.01, .21, 2.81], [0, .5, 1.52], 0x9b9caa);
  box(bed, [2.04, .2, 1.98], [0, .63, 1.97], 0x536b94);
  box(bed, [2.04, .11, .13], [0, .73, .99], 0x7b8bad);
  box(bed, [2.12, .9, .13], [0, .5, .07], 0x645164);
  for (const x of [-.48, .48]) box(bed, [.8, .17, .49], [x, .68, .53], 0xbcc1c9);
  const bedHiding = new T.Vector3(bedX - .45, .75, -2.83);
  const bedNap = new T.Vector3(bedX - .47, .84, -3.05);
  const blanketLump = new T.Mesh(new T.SphereGeometry(1, 14, 8),
    new T.MeshStandardMaterial({ color: 0x536b94, roughness: .92 }));
  blanketLump.scale.set(.36, .27, .46);
  blanketLump.position.copy(bedHiding).y = .7;
  blanketLump.visible = false;
  scene.add(blanketLump);

  const bench = new T.Group();
  bench.position.set(-6.5, 0, 2.76);
  bench.rotation.y = Math.PI / 2;
  scene.add(bench);
  box(bench, [2.65, .12, 1.28], [0, .94, 0], 0x5d7a78);
  for (const x of [-1.19, 1.19]) box(bench, [.12, .88, 1.12], [x, .44, 0], 0x425b60);
  box(bench, [1.36, .04, .89], [.34, 1.02, .04], 0x283d47);
  deskArm(bench);
  box(bench, [.63, .41, .07], [-.81, 1.31, -.28], 0x263941);
  box(bench, [.55, .32, .022], [-.81, 1.31, -.231], 0x497e8b, .4);

  // The bathroom opens onto the entrance hall at its front-left corner.
  const bathFront = new T.Group();
  const bathSide = new T.Group();
  scene.add(bathFront, bathSide);
  const partitionLength = bathFrontEdge - bathBack;
  const partitionZ = (bathBack + bathFrontEdge) / 2;
  box(scene, [partitionDepth, wallHeight, partitionLength], [partition, wallHeight / 2, partitionZ], wall);
  box(scene, [.045, .14, partitionLength], [partition - partitionDepth / 2, .07, partitionZ], trim);
  sideWall(bathSide, backWallOuter, bathFrontEdge);
  const bathDoorX = bathLeft + frameHalfWidth;
  const bathDoorHinge = bathDoorX - doorWidth / 2;
  const bathFrontWallStart = bathDoorX + frameHalfWidth;
  const bathDoorOpeningRight = bathDoorX + clearWidth / 2;
  box(bathFront, [bathRight - bathFrontWallStart, wallHeight, wallDepth],
    [(bathRight + bathFrontWallStart) / 2, wallHeight / 2, bathEdge], wall);
  const bathHeaderWall = doorFrame(scene, bathDoorX, bathEdge, 0);
  const bathroomLeaf = hingedDoor(scene, bathDoorHinge, bathEdge);
  bathroomLeaf.rotation.y = -Math.PI / 2;
  const bathDoor = bathroomDoor(bathroomLeaf, bathDoorX - clearWidth / 2, bathDoorOpeningRight, bathEdge);
  const bathFloorFront = bathEdge - wallDepth / 2;
  const bathWidth = bathRight - bathLeft;
  const bathCenterX = (bathLeft + bathRight) / 2;
  box(scene, [bathWidth, .025, bathFloorFront - bathBack],
    [bathCenterX, .014, (bathBack + bathFloorFront) / 2], 0x73878b);
  for (let z = bathBack + .25; z < bathFloorFront; z += .43) {
    box(scene, [bathWidth, .006, .014], [bathCenterX, .029, z], 0x596a77);
  }

  // Shower tray and glass screen.
  const showerLeft = bathLeft;
  const showerRight = bathRight;
  const showerWidth = bathWidth;
  const showerBack = bathBack;
  const showerEdge = -2.74;
  const glassLeft = showerLeft + showerWidth / 3;
  const glassWidth = showerRight - glassLeft;
  const glassX = (glassLeft + showerRight) / 2;
  const showerZ = (showerBack + showerEdge) / 2;
  const showerSpot = new T.Vector3(glassX + .24, 0, showerZ);
  box(scene, [showerWidth, .05, showerEdge - showerBack], [(showerLeft + showerRight) / 2, .028, showerZ], 0xeff3f1);
  box(scene, [glassWidth, .062, .066], [glassX, .078, showerEdge], 0xc5d0d3);
  const showerGlass = new T.Mesh(new T.BoxGeometry(glassWidth, 1.67, .035), new T.MeshStandardMaterial({
    color: 0x96c9d2, roughness: .3, transparent: true, opacity: .28, depthWrite: false,
  }));
  showerGlass.position.set(glassX, .94, showerEdge);
  scene.add(showerGlass);
  for (const x of [glassLeft, showerRight]) box(scene, [.032, 1.68, .045], [x, .94, showerEdge], 0x91a3a9);
  cylinder(scene, .1, .014, glassLeft + .59, .056, showerZ, 0x8e9da3);
  const streams = new T.Float32BufferAttribute(new Float32Array(18 * 6), 3);
  streams.setUsage(T.DynamicDrawUsage);
  const spray = new T.LineSegments(new T.BufferGeometry().setAttribute('position', streams),
    new T.LineBasicMaterial({ color: 0xb6e6fb, transparent: true, opacity: .57, depthWrite: false }));
  spray.position.copy(showerSpot);
  spray.frustumCulled = false;
  spray.visible = false;
  scene.add(spray);

  const sinkZ = .58;
  box(scene, [.59, .76, 1.02], [6.97, .38, sinkZ], 0xaac1c5);
  box(scene, [.66, .13, 1.1], [6.97, .8, sinkZ], 0xe0dfda);
  cylinder(scene, .25, .038, 6.94, .88, sinkZ, 0xa5babd);
  box(scene, [.07, .2, .07], [7.2, .97, sinkZ], 0x738696);
  const water = box(scene, [.032, .19, .032], [7.12, .986, sinkZ], 0x84d5e7, .7);
  water.visible = false;
  box(bathSide, [.045, .81, .93], [7.285, 1.58, sinkZ], 0xa8bed3, .17);

  const toiletZ = -1.29;
  cylinder(scene, .19, .35, 6.88, .18, toiletZ, 0xdedfe1);
  cylinder(scene, .29, .17, 6.8, .41, toiletZ, 0xdedfe1).scale.x = 1.26;
  cylinder(scene, .2, .026, 6.78, .507, toiletZ, 0xb9c3cd).scale.x = 1.21;
  box(scene, [.245, .65, .61], [7.17, .46, toiletZ], 0xdedfe1);
  const bathroomLight = new T.PointLight(0xffdbad, 0, 5.2);
  bathroomLight.position.set(6.05, 3.32, -1.64);
  scene.add(bathroomLight);

  const { root: awake, dressed, eyes, openEyes, closedEyes, legs, arms } = victorAvatar();
  awake.position.copy(workSpot);
  awake.rotation.y = Math.PI / 2;
  const wornBag = backpackModel();
  wornBag.position.set(0, .91, -.242);
  wornBag.rotation.y = Math.PI;
  dressed.add(wornBag);
  const bagStraps = new T.Group();
  for (const x of [-.16, .16]) box(bagStraps, [.065, .42, .052], [x, 1.007, .14], 0x4a5644);
  dressed.add(bagStraps);
  const carriedLaptop = new T.Group();
  box(carriedLaptop, [.58, .065, .35], [0, .956, .39], 0x313c50);
  box(carriedLaptop, [.45, .018, .023], [0, .97, .57], 0x58657b);
  dressed.add(carriedLaptop);
  const seatedLegs = new T.Group();
  for (const x of [-.13, .13]) {
    box(seatedLegs, [.19, .19, .37], [x, .63, .168], 0x303650);
    box(seatedLegs, [.18, .36, .18], [x, .465, .308], 0x303650);
    box(seatedLegs, [.185, .106, .22], [x, .3, .35], 0x262a3c);
  }
  dressed.add(seatedLegs);
  const phone = new T.Group();
  phone.position.set(0, .95, .42);
  phone.rotation.x = -.24;
  box(phone, [.157, .029, .244], [0, 0, 0], 0x202b35);
  box(phone, [.131, .006, .207], [0, .017, 0], 0x69b6dc, .53);
  for (let i = 0; i < 3; i++) box(phone, [.093 - i * .012, .003, .012], [0, .022, -.047 + i * .035], 0xd0e8ef, .24);
  dressed.add(phone);
  const foamBubbles = [
    [0, 1.4, 0, .24], [-.14, 1.5, -.04, .13], [.13, 1.51, -.015, .15], [0, 1.61, -.02, .13],
    [-.17, 1.29, .045, .145], [.17, 1.27, .04, .14], [0, 1.17, 0, .26], [0, .91, 0, .29],
    [-.23, 1.06, .055, .18], [.25, 1.08, -.035, .17], [0, .69, .03, .245],
    [-.14, .47, -.025, .18], [.14, .47, .025, .17], [-.14, .25, .035, .155], [.15, .24, -.025, .16],
    [-.15, .125, .09, .12], [.16, .13, .075, .13], [0, .8, .235, .12], [.13, 1.02, .23, .12],
    [-.13, 1.07, .22, .11], [-.19, .65, -.16, .12], [.21, .78, -.17, .13],
  ];
  const bubblesPerArm = 3;
  const foam = new T.InstancedMesh(new T.SphereGeometry(1, 12, 8),
    new T.MeshStandardMaterial({ roughness: .42 }), foamBubbles.length + 2 * bubblesPerArm);
  foam.instanceMatrix.setUsage(T.DynamicDrawUsage);
  const bubbleTransform = new T.Matrix4();
  const bubbleColor = new T.Color();
  foamBubbles.forEach(([x, y, z, radius], i) => {
    bubbleTransform.makeScale(radius, radius, radius).setPosition(x, y, z);
    foam.setMatrixAt(i, bubbleTransform);
    foam.setColorAt(i, bubbleColor.setHex(i % 3 ? 0xfffdf8 : 0xeaf3fc));
  });
  const foamPose = new T.Group();
  const foamEyes = eyes.clone();
  foamEyes.position.z = .115;
  foamPose.add(foam, foamEyes);
  awake.add(foamPose);

  function scrub(time: number) {
    foamPose.rotation.set(-Math.sin(time * 1.6) * .075, Math.sin(time * 1.85) * .12, Math.sin(time * 2.1) * .065);
    for (const [arm, side] of [-1, 1].entries()) {
      const reach = (1 - Math.cos(time * 1.7 + arm * Math.PI)) / 2;
      const handX = side * (.34 - .16 * reach);
      const handY = .65 + .84 * reach + Math.sin(time * 10) * .07 * reach;
      const handZ = .1 + .22 * reach;
      for (let i = 0; i < bubblesPerArm; i++) {
        const blend = (i + 1) / bubblesPerArm;
        const radius = i === bubblesPerArm - 1 ? .15 : .12;
        bubbleTransform.makeScale(radius, radius, radius).setPosition(
          T.MathUtils.lerp(side * .25, handX, blend),
          T.MathUtils.lerp(1.09, handY, blend),
          T.MathUtils.lerp(0, handZ, blend),
        );
        foam.setMatrixAt(foamBubbles.length + arm * bubblesPerArm + i, bubbleTransform);
      }
    }
    foam.instanceMatrix.needsUpdate = true;
  }
  scrub(0);
  scene.add(awake);
  const washingHands = new T.Group();
  for (const side of [-1, 1]) {
    box(washingHands, [.13, .14, .52], [side * .12, .96, .36], 0x7287a3);
    box(washingHands, [.13, .13, .19], [side * .08, .94, .677], 0xb58a78);
  }
  washingHands.visible = false;
  dressed.add(washingHands);
  const sleeping = new T.Group();
  box(sleeping, [.36, .23, .32], [.48, .86, .55], 0xb58a78);
  for (const x of [.404, .556]) box(sleeping, [.064, .012, .024], [x, .981, .554], 0x34323d);
  box(sleeping, [.37, .23, .11], [.48, .87, .43], 0x292738);
  box(sleeping, [.77, .16, 1.35], [.45, .78, 1.49], 0x5e77a0);
  bed.add(sleeping);

  const snoreFace = document.createElement('canvas');
  snoreFace.width = snoreFace.height = 64;
  const snoreInk = snoreFace.getContext('2d');
  if (snoreInk) {
    snoreInk.fillStyle = '#d3f6ff';
    snoreInk.font = 'bold 51px monospace';
    snoreInk.textAlign = 'center';
    snoreInk.textBaseline = 'middle';
    snoreInk.fillText('z', 32, 30);
  }
  const snoreMap = new T.CanvasTexture(snoreFace);
  snoreMap.colorSpace = T.SRGBColorSpace;
  const snores = [0, 1, 2].map(() => {
    const snore = new T.Sprite(new T.SpriteMaterial({ map: snoreMap, transparent: true, depthWrite: false, toneMapped: false }));
    snore.visible = false;
    scene.add(snore);
    return snore;
  });

  const travel = travelCircle(scene, 6.22, entranceZ);
  const spawn = new T.Vector3(5.04, 0, entranceZ);
  const anchors = {
    ...posterAnchors,
    terminal: { point: new T.Vector3(3.02, 2.48, -.78), target: new T.Vector3(1.45, 0, -.52), radius: .98 },
    backpack: { point: new T.Vector3(bagRack.x, bagRack.y + .63, bagRack.z), target: bagStop, radius: 1.25 },
    victor: { point: new T.Vector3(1.34, 1.65, -.88), target: new T.Vector3(.67, 0, -.88), radius: 1.08 },
    bed: { point: new T.Vector3(bedX - .12, 1.05, -2.75), target: new T.Vector3(-4.66, 0, -2.63) },
    dream: { point: new T.Vector3(bedX + .48, 1.05, -3.79), target: new T.Vector3(-4.66, 0, -3.73), radius: .95 },
    awards: { point: new T.Vector3(awardX, 1.49, -3.89), target: new T.Vector3(awardX, 0, -3.28) },
    printer: { point: new T.Vector3(2.43, 1.92, -3.9), target: new T.Vector3(1.43, 0, -3.9), radius: 1.1 },
    robotBench: { point: new T.Vector3(-6.48, 1.8, 2.91), target: new T.Vector3(-5.52, 0, 2.81), radius: 1.17 },
    bathroom: { point: new T.Vector3(6.85, 1.64, sinkZ), target: new T.Vector3(6.05, 0, .58), radius: 1.14 },
    bathroomDoor: { point: new T.Vector3(bathDoorX, casingTop + .05, bathEdge), target: new T.Vector3(bathDoorX, 0, bathEdge), radius: 1.31 },
    entryClock: { point: clock.mount.position.clone().add(new T.Vector3(0, .34, .07)), target: new T.Vector3(shoeX, 0, shoeZ + .77), radius: 1.65 },
  };
  const bedActions = { hide: bedHiding, nap: bedNap, exit: anchors.bed.target };
  const obstacles = [
    loungeArea.obstacle,
    { left: 1.81, right: 3.16, back: -4.51, front: 1.44 },
    { left: bedX - 1.06, right: bedX + 1.06, back: -4.44, front: -1.46 },
    { left: awardX - 1.16, right: awardX + 1.16, back: -4.47, front: -3.66 },
    { left: -7.16, right: -5.84, back: 1.41, front: 4.1 },
    { left: partition - partitionDepth / 2, right: bathLeft, back: bathBack, front: bathFrontEdge },
    { left: bathLeft, right: bathDoorX - clearWidth / 2, back: bathEdge - wallDepth / 2, front: bathFrontEdge },
    { left: bathDoorOpeningRight, right: bathRight, back: bathEdge - wallDepth / 2, front: bathFrontEdge },
    { left: 5.37, right: 7.24, back: shoeZ - .325, front: shoeZ + .325 },
    { left: 6.63, right: 7.33, back: sinkZ - .55, front: sinkZ + .55 },
    { left: 6.42, right: 7.33, back: toiletZ - .32, front: toiletZ + .32 },
    { left: glassLeft - .016, right: showerRight, back: showerEdge - .033, front: showerEdge + .033 },
  ];
  const obstaclesWithOpenDoor = [...obstacles,
    { left: bathDoorHinge - .045, right: bathDoorHinge + .045, back: bathEdge - doorWidth, front: bathEdge }];
  const space = { bounds, obstacles: obstaclesWithOpenDoor };
  const obstaclesWithDoor = [...obstacles, bathDoor.obstacle];
  const night = new T.Color(0x1f2635);
  const day = new T.Color(0x47474c);
  const warm = new T.Color(0xff994a);
  const cool = new T.Color(0xffeddd);
  const nightAmbient = ambient.color.clone();
  const morningAmbient = new T.Color(0xffddbf);
  const sky = new T.Color(0x6a80a7);
  scene.background = night.clone();
  let state: RoomState = 'awake';
  let blueLight = 9;
  let screensOn = false;
  function syncLighting() {
    const lit = routine.lightsOn;
    spill.intensity = screensOn ? blueLight * (lit ? .64 : 1) : 0;
    ceilingLights[0].intensity = lit ? 30 : 0;
    ceilingLights[1].intensity = lit ? 37 : 0;
    bathroomLight.intensity = lit ? 21 : 0;
    entryToggle.rotation.z = lit ? .31 : -.31;
    bedToggle.rotation.z = -entryToggle.rotation.z;
  }
  function setLight(time: string) {
    const { light, warmth } = daylightAt(time);
    ambient.intensity = 1.55 + light * 1.28;
    ambient.color.copy(nightAmbient).lerp(morningAmbient, light * .85);
    fill.intensity = 1.15 + light * .7;
    sun.color.copy(cool).lerp(warm, warmth);
    sun.intensity = light * (3.2 + warmth * 1.4);
    for (const pane of windows) {
      pane.color.copy(sky).lerp(sun.color, light * .85);
      pane.emissive.copy(pane.color);
    }
    blueLight = 9 - light * 4;
    syncLighting();
    (scene.background as T.Color).copy(night).lerp(day, light);
  }
  function setStatus(next: RoomState, lights: boolean) {
    state = next;
    routine.setStatus(next, lights);
    syncVictor();
    syncLighting();
  }

  const isInBathroom = (visitor: T.Vector3) => visitor.x > partition && visitor.z < bathEdge - .08;
  const isInShower = (visitor: T.Vector3) => visitor.x >= showerLeft && visitor.x <= showerRight && visitor.z < showerEdge;
  const bathroomExit = new T.Vector3(bathDoorX, 0, bathEdge + .77);
  const routine = victorRoutine(space, awake, legs, entranceDoor, {
    work: { position: workSpot, facing: Math.PI / 2 },
    posters: { position: new T.Vector3(-.85, 0, -3.53), facing: Math.PI },
    awards: { position: new T.Vector3(awardX, 0, -3.32), facing: Math.PI },
    bathroom: { position: new T.Vector3(6.14, 0, toiletZ), facing: -Math.PI / 2 },
    wash: { position: new T.Vector3(6.39, 0, sinkZ), facing: Math.PI / 2 },
    shower: { position: showerSpot, facing: Math.PI / 2 },
    lounge: { position: loungeArea.seat, facing: loungeArea.facing },
    bed: { position: new T.Vector3(-4.64, 0, -2.63), facing: -Math.PI / 2 },
    entrySwitch: { position: new T.Vector3(6.98, 0, 3.08), facing: Math.PI / 2 },
    bedSwitch: { position: new T.Vector3(-6.89, 0, -1.25), facing: -Math.PI / 2 },
    hangBag: { position: bagStop, facing: Math.PI },
    takeBag: { position: bagStop, facing: Math.PI },
    setupLaptop: { position: workSpot, facing: Math.PI / 2 },
    packLaptop: { position: workSpot, facing: Math.PI / 2 },
    away: { position: new T.Vector3(7.92, 0, entranceZ), facing: Math.PI / 2 },
  }, isInBathroom, isInShower, fastRoutine);

  function syncVictor() {
    awake.visible = routine.visible || (routine.bedReached && routine.startled);
    sleeping.visible = routine.asleep;
    foamPose.visible = routine.showering;
    dressed.visible = eyes.visible = !foamPose.visible;
    const gear = routine.gear;
    const transfer = gear?.kind === 'hangBag' ? T.MathUtils.smoothstep(gear.progress, .22, .58) :
      gear?.kind === 'takeBag' ? 1 - T.MathUtils.smoothstep(gear.progress, .58, .89) :
      Number(routine.bagOnHook);
    hangingBag.visible = transfer > 0;
    wornBag.visible = bagStraps.visible = transfer === 0;
    hangingBag.position.copy(bagRack);
    if (transfer > 0 && transfer < 1) {
      bagTransferStart.copy(wornBag.position);
      awake.localToWorld(bagTransferStart);
      hangingBag.position.lerpVectors(bagTransferStart, bagRack, transfer);
      const arc = Math.sin(Math.PI * transfer);
      hangingBag.position.x -= arc * .35;
      hangingBag.position.y += arc * .22;
    }
    carriedLaptop.visible = routine.laptop === 'carried';
    laptop.visible = routine.laptop === 'closed' || routine.laptop === 'running';
    const powered = routine.laptop === 'running';
    if (powered !== screensOn) {
      screensOn = powered;
      screenLines.visible = powered;
      laptopDisplay.material.color.setHex(powered ? 0x345e81 : 0x151a22);
      laptopDisplay.material.emissiveIntensity = powered ? .62 : 0;
      for (const screen of screens) {
        screen.color.setHex(powered ? 0x24486d : 0x151a22);
        screen.emissiveIntensity = powered ? .85 : 0;
      }
      syncLighting();
    }
    let lid = powered ? -.2 : Math.PI / 2;
    if (gear?.kind === 'setupLaptop') {
      lid = T.MathUtils.lerp(Math.PI / 2, -.2, T.MathUtils.smoothstep(gear.progress, .34, .86));
    } else if (gear?.kind === 'packLaptop') {
      lid = T.MathUtils.lerp(-.2, Math.PI / 2, T.MathUtils.smoothstep(gear.progress, .08, .58));
    }
    laptopLid.rotation.x = lid;
    anchors.victor.point.copy(awake.position);
    anchors.victor.point.y = 1.78 + dressed.position.y;
    if (routine.loungeActivity) anchors.victor.point.addScaledVector(loungeArea.forward, dressed.position.z);
    anchors.victor.target.copy(awake.position);
  }
  let washTime = 0;
  let showerTime = 0;
  let snoreTime = 0;
  let wasStartled = false;
  let startleTime = 0;
  let loungeTime = 0;
  let sitBlend = 0;
  function updateVictor(seconds: number, visitor: T.Vector3 | undefined, reduceMotion: boolean, escortingVisitor: boolean) {
    const lightsBefore = routine.lightsOn;
    const waitingForDoor = bathDoor.update(seconds, awake.position, routine.nextWaypoint, visitor, escortingVisitor, reduceMotion);
    const escort = routine.step(seconds, visitor, reduceMotion, waitingForDoor);
    if (lightsBefore !== routine.lightsOn) syncLighting();
    water.visible = washingHands.visible = routine.washing;
    const startled = routine.startled;
    if (!wasStartled || !startled) startleTime = 0;
    if (startled) startleTime += seconds;
    wasStartled = startled;
    const flinch = startled && !reduceMotion ? Math.sin(Math.min(1, startleTime / .65) * Math.PI) : 0;
    const activity = routine.loungeActivity;
    const dozing = activity === 'dozing';
    const sitting = activity ? 1 : 0;
    sitBlend = reduceMotion ? sitting : T.MathUtils.clamp(sitting, sitBlend - seconds * 4.8, sitBlend + seconds * 4.8);
    const reclining = sitBlend > .5;
    loungeTime = activity && !reduceMotion ? loungeTime + seconds : 0;
    openEyes.visible = !dozing;
    closedEyes.visible = dozing;
    const pitch = dozing ? .21 + Math.sin(loungeTime * 2.3) * .035 : activity === 'phone' ? .123 : -.064;
    dressed.rotation.x = eyes.rotation.x = pitch * sitBlend;
    dressed.position.z = eyes.position.z = loungeArea.seatDepth * sitBlend;
    dressed.position.y = eyes.position.y = flinch * .14 - sitBlend * .25;
    sleeping.position.y = flinch * .14;
    seatedLegs.visible = reclining;
    legs.forEach(leg => { leg.visible = !reclining; });
    phone.visible = activity === 'phone' && reclining;
    phone.position.z = .42 + Math.sin(loungeTime * 6) * .021;
    loungeArea.update(!!activity, seconds, reduceMotion);
    const gear = routine.gear;
    const gearReach = gear ? Math.sin(Math.PI * gear.progress) : 0;
    arms.forEach((arm, i) => {
      arm.visible = !routine.washing;
      const carrying = routine.laptop === 'carried';
      if (reclining) {
        arm.rotation.x = phone.visible ? -.96 + (i ? Math.sin(loungeTime * 9) * .1 : 0) : -.53;
        arm.rotation.z = phone.visible ? (i === 0 ? .45 : -.45) : 0;
      } else {
        arm.rotation.x = carrying ? -1.32 : -legs[i].rotation.x * .65 - flinch -
          (i === 1 ? 1.15 * routine.switchReach : 0) - 1.28 * gearReach;
        arm.rotation.z = (i === 0 ? -1 : 1) * flinch * .55;
      }
    });
    if (routine.washing) {
      washTime += seconds;
      washingHands.position.z = reduceMotion ? 0 : Math.sin(washTime * 16) * .04;
    } else washTime = 0;
    spray.visible = routine.showering;
    if (spray.visible) {
      showerTime = reduceMotion ? 0 : showerTime + seconds;
      scrub(showerTime);
      for (let i = 0; i < streams.count / 2; i++) {
        const x = Math.sin(i * 2.3) * .52;
        const z = Math.cos(i * 1.9) * .38;
        const y = 2.28 - (showerTime * 3.6 + i * .71) % 1.95;
        streams.setXYZ(i * 2, x, y, z);
        streams.setXYZ(i * 2 + 1, x + .024, y - .16, z);
      }
      streams.needsUpdate = true;
    } else showerTime = 0;
    const snoring = routine.asleep || dozing;
    snoreTime = snoring ? snoreTime + seconds : 0;
    snores.forEach((snore, i) => {
      const phase = reduceMotion ? i / 3 + .14 : (snoreTime / 2.9 + i / 3) % 1;
      snore.visible = snoring;
      snore.position.set(
        (dozing ? rug.position.x + .14 : bedX + .52) + phase * .65,
        (dozing ? 1.45 : 1.16) + phase * .93,
        (dozing ? rug.position.z - .15 : bed.position.z + .5) - phase * .37,
      );
      snore.scale.setScalar(.24 + phase * .25);
      snore.material.opacity = reduceMotion ? .9 : Math.sin(phase * Math.PI);
    });
    syncVictor();
    return { escort };
  }

  function orientWalls(camera: T.Vector3, visitor: T.Vector3) {
    const insideBathroom = isInBathroom(visitor);
    const cutFront = insideBathroom && camera.z > bathEdge;
    const cutSide = insideBathroom && camera.x > bathRightWall;
    bathFront.scale.y = cutFront ? .26 : 1;
    bathHeaderWall.visible = !cutFront;
    bathSide.scale.y = entrySide.scale.y = cutSide ? .26 : 1;
    entryWall.visible = camera.x < 7.45 || visitor.x > 5.2;
    entrySide.visible = cutSide || entryWall.visible;
    backWall.visible = camera.z >= -4.54;
    leftWall.visible = camera.x >= -7.32;
  }
  setLight('01:00');
  return {
    scene, anchors, bounds, travel, spawn, bedActions, setLight, setStatus, orientWalls, updateVictor,
    bathroomDoor: bathDoor, clock,
    get obstacles() { return bathDoor.blocked ? obstaclesWithDoor : obstaclesWithOpenDoor; },
    bathroomExitRoute(visitor: T.Vector3) { return walkingRoute(space, visitor, bathroomExit); },
    setBlanketLump(visible: boolean) { blanketLump.visible = visible; },
    reactToBedGuest: routine.reactToBedGuest,
    get asleep() { return routine.asleep; },
    get bedReached() { return routine.bedReached; },
    get thought() { return awake.visible || routine.startled ? routine.thought : ''; },
    canInspectBackpack: () => routine.bagOnHook,
    canInspectTerminal: () => screensOn,
    reactToThoughtVisit: routine.reactToThoughtVisit,
    canInspectVictor: () => awake.visible && !routine.bedReached && !routine.atToilet &&
      routine.loungeActivity !== 'dozing' && state !== 'shower',
  };
}
