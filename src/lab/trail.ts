import * as T from 'three';
import { daylightAt, trailThoughts } from './content';
import { box, cylinder, travelCircle } from './set';

function ellipsoid(parent: T.Object3D, color: number, position: [number, number, number], size: [number, number, number]) {
  const mesh = new T.Mesh(new T.IcosahedronGeometry(1, 1), new T.MeshStandardMaterial({ color, flatShading: true }));
  mesh.position.set(...position);
  mesh.scale.set(...size);
  parent.add(mesh);
  return mesh;
}

function branch(parent: T.Object3D, from: [number, number, number], to: [number, number, number], radius: number, color: number) {
  const start = new T.Vector3(...from);
  const end = new T.Vector3(...to);
  const mid = start.clone().lerp(end, .5);
  const mesh = cylinder(parent, radius, start.distanceTo(end), mid.x, mid.y, mid.z, color);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), end.sub(start).normalize());
}

function buildElk(parent: T.Object3D, x: number, z: number, scale: number, yaw: number, antlers: boolean) {
  const animal = new T.Group();
  animal.position.set(x, .04, z);
  animal.rotation.y = yaw;
  animal.scale.setScalar(scale);
  parent.add(animal);
  const brown = 0x9a6241;
  const dark = 0x573a2c;
  ellipsoid(animal, brown, [0, .99, 0], [.84, .38, .31]);
  ellipsoid(animal, 0xd4af88, [-.6, .96, 0], [.24, .25, .28]);
  const legs: T.Group[] = [];
  for (const lx of [-.52, .52]) for (const lz of [-.2, .2]) {
    const leg = new T.Group();
    leg.position.set(lx, .86, lz);
    branch(leg, [0, 0, 0], [.04, -.46, 0], .065, brown);
    branch(leg, [.04, -.46, 0], [-.04, -.77, 0], .044, dark);
    animal.add(leg);
    legs.push(leg);
  }
  const neck = new T.Group();
  neck.position.set(.54, 1.04, 0);
  animal.add(neck);
  branch(neck, [0, -.12, 0], [.42, .55, 0], .185, dark);
  ellipsoid(neck, dark, [.53, .58, 0], [.26, .15, .14]);
  ellipsoid(neck, 0x977155, [.74, .53, 0], [.16, .105, .12]);
  for (const side of [-1, 1]) {
    ellipsoid(neck, brown, [.42, .67, side * .17], [.13, .05, .095]);
    if (!antlers) continue;
    const antler = 0xc6a879;
    const tip: [number, number, number] = [.03, 1.24, side * .44];
    branch(neck, [.47, .68, side * .08], [.27, .93, side * .3], .034, antler);
    branch(neck, [.27, .93, side * .3], tip, .025, antler);
    branch(neck, [.24, .96, side * .32], [.44, 1.19, side * .41], .022, antler);
    branch(neck, [.13, 1.12, side * .39], [.07, 1.36, side * .41], .016, antler);
  }
  return { animal, neck, legs };
}

function buildSasquatch(scene: T.Scene) {
  const creature = new T.Group();
  const fur = 0x82563f;
  const face = 0xc69875;
  const torso = new T.Group();
  torso.position.y = 1.18;
  creature.add(torso);
  ellipsoid(torso, fur, [0, .07, 0], [.49, .64, .32]);
  const head = new T.Group();
  head.position.set(0, .69, .03);
  torso.add(head);
  ellipsoid(head, fur, [0, 0, 0], [.43, .38, .36]);
  ellipsoid(head, face, [0, -.03, .275], [.31, .22, .12]);
  const arms = [];
  const legs = [];
  for (const side of [-1, 1]) {
    ellipsoid(head, fur, [side * .38, .05, .02], [.13, .15, .13]);
    box(head, [.066, .075, .037], [side * .12, .03, .386], 0x241e1e);
    const arm = new T.Group();
    arm.position.set(side * .39, .26, 0);
    arm.rotation.z = side * .31;
    ellipsoid(arm, fur, [side * .08, -.22, .075], [.15, .34, .18]);
    ellipsoid(arm, face, [side * .09, -.47, .16], [.11, .13, .13]);
    torso.add(arm);
    arms.push(arm);
    const leg = new T.Group();
    leg.position.set(side * .21, .81, 0);
    ellipsoid(leg, fur, [0, -.3, 0], [.16, .39, .17]);
    ellipsoid(leg, face, [0, -.64, .13], [.17, .13, .28]);
    creature.add(leg);
    legs.push(leg);
  }
  box(head, [.13, .038, .023], [0, -.1, .395], 0x55342c);
  cylinder(torso, .34, .12, 0, .47, 0, 0xc46b62);
  box(torso, [.15, .31, .075], [-.17, .31, .292], 0xc46b62).rotation.z = -.16;
  creature.position.set(-1.9, 0, -.88);
  creature.rotation.y = -.19;
  scene.add(creature);
  return { creature, torso, head, arms, legs };
}

export function coloradoTrail() {
  const scene = new T.Scene();
  const sky = new T.Color();
  scene.background = sky;
  scene.fog = new T.Fog(sky, 22, 62);
  const ambient = new T.HemisphereLight(0xe2f2ef, 0x958568, 2.05);
  scene.add(ambient);
  const sun = new T.DirectionalLight(0xffdbab, 2.9);
  sun.position.set(-6, 8, 3);
  const moon = new T.DirectionalLight(0x9ebdff, 1.35);
  moon.position.set(4, 10, -4);
  scene.add(sun, moon);
  const nightSky = new T.Color(0x131d36);
  const daySky = new T.Color(0xaeccd4);
  const twilightSky = new T.Color(0xe1a69a);
  const nightAmbient = new T.Color(0x9eafff);
  const dayAmbient = new T.Color(0xe2f2ef);
  const sunlight = new T.Color(0xffdbab);
  const twilight = new T.Color(0xff9d62);
  const starPositions = [];
  for (let i = 0; i < 72; i++) {
    starPositions.push(Math.sin(i * 17.63) * 31, 5.5 + (i * 37 % 67) * .19, -20 - (i * 29 % 61) * .19);
  }
  const starGeometry = new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(starPositions, 3));
  const stars = new T.Points(starGeometry, new T.PointsMaterial({
    color: 0xe4eaff, size: 2.5, sizeAttenuation: false, transparent: true, depthWrite: false, toneMapped: false, fog: false,
  }));
  scene.add(stars);
  const trailZ = 2.8;
  const trailLength = 80;
  box(scene, [100, .19, 45], [0, -.11, -5], 0x728052);
  box(scene, [trailLength, .021, 3.35], [0, .001, trailZ], 0xab946e);
  box(scene, [trailLength, .026, .37], [0, .003, trailZ + 1.5], 0x9d865e);
  box(scene, [trailLength, .026, .22], [0, .004, trailZ - 1.55], 0xc0a979);

  for (const [x, z, height, width, color] of [
    [-17,-24,10,9,0x7799a1], [-6,-25,14,10,0x7a9aa7], [5,-28,15,12,0x7e9cb0], [17,-24,11,9,0x7895a0],
    [-12,-17,8,9,0x527778], [-2,-19,6,8,0x64867e], [10,-18,9,10,0x63807f], [20,-16,7,8,0x4c7475],
  ]) {
    const mountain = new T.Mesh(new T.ConeGeometry(width, height, 5), new T.MeshStandardMaterial({ color, flatShading: true }));
    mountain.position.set(x, height * .33, z);
    mountain.rotation.y = x * .18;
    scene.add(mountain);
    if (height < 10) continue;
    const snow = new T.Mesh(new T.ConeGeometry(width * .32, height * .325, 5), new T.MeshStandardMaterial({ color: 0xe1e7df }));
    snow.position.set(x, height * .669, z);
    snow.rotation.copy(mountain.rotation);
    scene.add(snow);
  }

  for (const [x, z, height] of [[-9,-5,3.4],[-6.8,-7,2.8],[-4.2,-9,3.3],[6.9,-5.9,3.3],[8.1,-7.1,3],[9.4,-4.8,2.8], [2,-11,3.6]]) {
    cylinder(scene, .115, height, x, height / 2, z, 0xb0a190);
    ellipsoid(scene, 0xc4ae46, [x, height * .87, z], [.74, 1.13, .64]);
    ellipsoid(scene, 0x9c9b4b, [x - .48, height * .73, z + .17], [.56, .67, .54]);
    for (const y of [.47, .93, 1.52]) box(scene, [.18, .043, .027], [x, y, z + .109], 0x554d40);
  }
  for (let i = 0; i < 24; i++) {
    const x = (i % 12 - 5.5) * 2.62 + Math.sin(i) * .6;
    const z = -8.8 - Math.floor(i / 12) * 3.4 - Math.cos(i * 1.8);
    const size = 1.42 + .7 * Math.cos(i * 2.1) ** 2;
    for (const [level, radius] of [[.71,.53],[1.13,.44]]) {
      const pine = new T.Mesh(new T.ConeGeometry(size * radius, size, 6), new T.MeshStandardMaterial({ color: i % 2 ? 0x385d56 : 0x466b58 }));
      pine.position.set(x, size * level, z);
      scene.add(pine);
    }
  }
  for (let i = 0; i < 22; i++) {
    const x = (i - 10.5) * 1.13;
    const z = Math.sin(i * 3.15) * 2 - (i % 3 ? 1.35 : 3.4);
    ellipsoid(scene, i % 3 ? 0x93966b : 0x777569, [x, .095, z], [.37, .17, .31]);
  }

  const fenceZ = .55;
  for (let x = -39.6; x <= 39.61; x += 1.8) box(scene, [.13, .75, .13], [x, .37, fenceZ], 0x645041);
  for (const y of [.29, .59]) box(scene, [trailLength, .075, .11], [0, y, fenceZ], 0x88684a);
  const herd = [
    [2.55, -2.7, 1.08], [.15, -4.9, .68], [-3.65, -2.15, .94],
    [6.15, -3.25, .9], [-1.98, -5.72, .86], [4.8, -5.3, 1.02],
  ].map(([x, z, scale], i) => ({
    ...buildElk(scene, x, z, scale, -.31 + i * .92, i === 0 || i === 5),
    home: new T.Vector3(x, 0, z), target: new T.Vector3(x, 0, z),
    wait: 4 + i * 1.6, moving: false, pace: .48 + i * .035,
    shadow: ellipsoid(scene, 0x495644, [x, .011, z], [.72 * scale, .026, .32 * scale]),
  }));
  const { creature: sasquatch, torso, head, arms, legs } = buildSasquatch(scene);
  const sasquatchAnchor = { point: new T.Vector3(), target: new T.Vector3(), radius: 1.35 };
  const patrol = [
    new T.Vector3(-1.9, 0, -.88), new T.Vector3(-.65, 0, -1.43),
    new T.Vector3(-2.29, 0, -1.63), new T.Vector3(-3.19, 0, -.91),
  ];
  let patrolIndex = 0;
  let looking = 0;
  let stopRemaining = 2;
  let gait = 0;
  let timeInScene = 0;
  let activeSasquatch = false;
  let thoughtRemaining = 0;
  let nextThought = 1.7;
  let speaker: T.Group | undefined;
  let thought = '';
  let wasNearSasquatch = false;
  const thoughtPoint = new T.Vector3();
  const direction = new T.Vector3();

  function say(group: T.Group, lines: readonly string[]) {
    const choices = lines.filter(line => line !== thought);
    thought = choices[Math.floor(Math.random() * choices.length)];
    speaker = group;
    thoughtRemaining = 4.6;
    nextThought = 8 + Math.random() * 6;
  }

  function walkHerd(seconds: number) {
    for (const elk of herd) {
      if (elk.moving) {
        direction.set(elk.target.x - elk.animal.position.x, 0, elk.target.z - elk.animal.position.z);
        const distance = direction.length();
        if (distance <= seconds * elk.pace) {
          elk.animal.position.x = elk.target.x;
          elk.animal.position.z = elk.target.z;
          elk.moving = false;
          elk.wait = 4 + Math.random() * 8;
        } else {
          const heading = Math.atan2(-direction.z, direction.x);
          const turn = Math.atan2(Math.sin(heading - elk.animal.rotation.y), Math.cos(heading - elk.animal.rotation.y));
          elk.animal.rotation.y += T.MathUtils.clamp(turn, -seconds * 3, seconds * 3);
          elk.animal.position.addScaledVector(direction, seconds * elk.pace / distance);
        }
      } else {
        elk.wait -= seconds;
        if (elk.wait <= 0) {
          elk.target.x = elk.home.x + (Math.random() - .5) * 2.45;
          elk.target.z = elk.home.z + (Math.random() - .5) * 1.5;
          elk.moving = true;
        }
      }
      const phase = timeInScene * 8 + elk.home.x;
      const swing = elk.moving ? Math.sin(phase) * .32 : 0;
      elk.legs.forEach((leg, i) => { leg.rotation.z = i === 0 || i === 3 ? swing : -swing; });
      elk.neck.rotation.z = T.MathUtils.damp(elk.neck.rotation.z,
        elk.moving ? -.08 : -.62 + Math.sin(timeInScene * 1.12 + elk.home.z) * .47, 2.8, seconds);
      elk.shadow.position.x = elk.animal.position.x;
      elk.shadow.position.z = elk.animal.position.z;
      elk.shadow.rotation.y = elk.animal.rotation.y;
    }
  }

  function sneak(seconds: number, reduceMotion: boolean) {
    const delta = direction.subVectors(patrol[patrolIndex], sasquatch.position);
    const pace = seconds * .61;
    let walking = false;
    if (!reduceMotion && stopRemaining > 0) {
      looking += seconds;
      stopRemaining -= seconds;
    } else if (!reduceMotion && delta.lengthSq() <= pace ** 2) {
      sasquatch.position.copy(patrol[patrolIndex]);
      patrolIndex = (patrolIndex + 1) % patrol.length;
      stopRemaining = 2.5;
      looking = 0;
    } else if (!reduceMotion) {
      walking = true;
      const heading = Math.atan2(delta.x, delta.z);
      const turn = Math.atan2(Math.sin(heading - sasquatch.rotation.y), Math.cos(heading - sasquatch.rotation.y));
      sasquatch.rotation.y += T.MathUtils.clamp(turn, -seconds * 3, seconds * 3);
      sasquatch.position.addScaledVector(delta.normalize(), pace);
      gait += seconds * 8.8;
    }
    const stride = walking ? Math.sin(gait) : 0;
    torso.rotation.x = .16 + Math.abs(stride) * .11;
    torso.position.y = 1.13 + Math.abs(stride) * .056;
    const glance = reduceMotion ? 0 : walking ? Math.sin(gait * .38) * .3 : Math.sin(looking * 2.65) * .88;
    head.rotation.y = T.MathUtils.damp(head.rotation.y, glance, 7, seconds);
    head.rotation.x = walking ? -.06 : .09;
    legs.forEach((leg, index) => {
      const swing = index === 0 ? stride : -stride;
      leg.rotation.x = swing * .42;
      leg.position.y = .81 + Math.max(0, -swing) * .12;
    });
    arms.forEach((arm, index) => {
      arm.rotation.x = -.61 + (index === 0 ? stride : -stride) * .28;
    });
    sasquatchAnchor.point.copy(sasquatch.position).y = 1.73;
    sasquatchAnchor.target.set(sasquatch.position.x, 0, 1.23);
  }

  function setTime(time: string) {
    const [hour, minute] = time.split(':').map(Number);
    const minutes = hour * 60 + minute;
    const { light, warmth } = daylightAt(time);
    const dusk = Math.max(0, Math.min(1, (minutes - 1050) / 65, (1220 - minutes) / 90));
    const warm = Math.max(warmth, dusk);
    sky.copy(nightSky).lerp(daySky, light).lerp(twilightSky, warm * .58);
    scene.fog!.color.copy(sky);
    ambient.color.copy(nightAmbient).lerp(dayAmbient, light);
    ambient.intensity = .72 + light * 1.33;
    sun.color.copy(sunlight).lerp(twilight, warm);
    sun.intensity = light * 2.9;
    sun.position.set(T.MathUtils.lerp(-12, 12, T.MathUtils.clamp((minutes - 345) / 855, 0, 1)), 2.7 + light * 5.3, 4);
    moon.intensity = (1 - light) * 1.35;
    stars.visible = light < .65;
    stars.material.opacity = (1 - light) ** 2;
    const isLate = minutes >= 22 * 60 || minutes < 5 * 60;
    if (isLate !== activeSasquatch) {
      nextThought = 1.4;
      if (!isLate && speaker === sasquatch) thoughtRemaining = 0;
      wasNearSasquatch = false;
    }
    activeSasquatch = sasquatch.visible = isLate;
  }

  function update(seconds: number, visitor: T.Vector3, reduceMotion: boolean) {
    timeInScene += seconds;
    if (!reduceMotion) walkHerd(seconds);
    if (activeSasquatch) sneak(seconds, reduceMotion);
    const nearSasquatch = activeSasquatch && Math.abs(visitor.x - sasquatch.position.x) < 3.2;
    if (nearSasquatch && !wasNearSasquatch) say(sasquatch, trailThoughts.sasquatch);
    wasNearSasquatch = nearSasquatch;
    thoughtRemaining -= seconds;
    nextThought -= seconds;
    if (nextThought <= 0) {
      if (nearSasquatch) say(sasquatch, trailThoughts.sasquatch);
      else {
        const nearbyElk = herd.filter(({ animal }) => Math.abs(animal.position.x - visitor.x) < 4.9);
        if (nearbyElk.length) say(nearbyElk[Math.floor(Math.random() * nearbyElk.length)].animal, trailThoughts.elk);
        else nextThought = 1;
      }
    }
    if (!speaker || thoughtRemaining <= 0) return undefined;
    if (speaker === sasquatch) head.getWorldPosition(thoughtPoint).y += .43;
    else thoughtPoint.copy(speaker.position).y += 2.23 * speaker.scale.y;
    return { text: thought, point: thoughtPoint };
  }

  const viewer = new T.Group();
  viewer.position.set(.3, 0, 1.49);
  box(viewer, [.48,.55,.3], [0,.91,0], 0x9a6345);
  box(viewer, [.31,.31,.28], [0,1.32,0], 0xb98a6c);
  cylinder(viewer, .25, .06, 0, 1.47, 0, 0x5d6650);
  cylinder(viewer, .155, .13, 0, 1.53, 0, 0x5d6650);
  for (const x of [-.13,.13]) {
    box(viewer, [.19,.63,.23], [x,.34,0], 0x424953);
    box(viewer, [.14,.4,.15], [x * 1.8,1.11,-.14], 0x9a6345).rotation.x = -.55;
    box(viewer, [.12,.13,.14], [x * 1.42,1.29,-.243], 0xb98a6c);
    box(viewer, [.059,.045,.014], [x * .55,1.37,-.143], 0x2d2d32);
  }
  box(viewer, [.31,.115,.15], [0,1.33,-.19], 0x293746);
  scene.add(viewer);

  const travel = travelCircle(scene, -5.62, trailZ);

  setTime('14:00');
  return {
    scene, travel, spawn: new T.Vector3(-4.49, 0, trailZ),
    bounds: { left: -10.55, right: 10.55, back: .82, front: 4.45 },
    obstacles: [],
    anchors: {
      elk: { point: new T.Vector3(2.55, .76, .75), target: new T.Vector3(2.55, 0, 1.32), radius: 1.5 },
      sasquatch: sasquatchAnchor,
      trailVictor: { point: new T.Vector3(.3, 1.65, 1.49), target: new T.Vector3(.3, 0, 2.07), radius: 1.24 },
    },
    setVisitor(present: boolean) { viewer.visible = present; },
    setTime,
    update,
    canInspectSasquatch: () => activeSasquatch,
  };
}
