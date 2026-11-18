import * as T from 'three';
import { daylightAt, trailThoughts } from './content';
import { box, cylinder, travelCircle } from './set';
import { overlookBounds, overlookFence, overlookPath, overlookPortalX, trailHeight, trailLandscape } from './trail-landscape';
import { trailHikers } from './trail-hikers';

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

function buildUngulate(parent: T.Object3D, x: number, z: number, scale: number, yaw: number, species: 'elk' | 'deer', antlers: boolean) {
  const animal = new T.Group();
  animal.name = species === 'deer' ? 'Mule deer' : 'Elk';
  animal.position.set(x, trailHeight(x, z) + .045, z);
  animal.rotation.y = yaw;
  animal.scale.setScalar(scale);
  parent.add(animal);
  const deer = species === 'deer';
  const brown = deer ? 0x9d8771 : 0x9a6241;
  const dark = deer ? 0x665144 : 0x573a2c;
  ellipsoid(animal, brown, [0, .99, 0], [.84, .38, .31]);
  ellipsoid(animal, deer ? 0xe2d3bb : 0xd4af88, [-.6, .96, 0], [.24, .25, .28]);
  if (deer) ellipsoid(animal, dark, [-.78, .95, 0], [.11, .14, .085]);
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
    if (deer) {
      const ear = ellipsoid(neck, brown, [.405, .76, side * .20], [.095, .19, .081]);
      ear.rotation.x = side * .67;
    } else ellipsoid(neck, brown, [.42, .67, side * .17], [.13, .05, .095]);
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

function buildMarmot(scene: T.Scene, x: number, z: number, pace: number) {
  const animal = new T.Group();
  animal.name = 'Marmot';
  scene.add(animal);
  const fur = 0x9d754d;
  ellipsoid(animal, fur, [0,.27,0], [.4,.25,.22]);
  ellipsoid(animal, 0x71533f, [-.38,.18,0], [.19,.10,.105]);
  const head = new T.Group();
  head.position.set(.25,.36,0);
  animal.add(head);
  ellipsoid(head, 0xb68c65, [0,.03,0], [.21,.19,.17]);
  ellipsoid(head, 0x43362b, [.175,-.04,0], [.084,.07,.09]);
  for (const side of [-1,1]) {
    ellipsoid(head, fur, [-.093,.15,side * .108], [.064,.064,.057]);
    ellipsoid(head, 0x302822, [.079,.074,side * .145], [.031,.033,.028]);
  }
  animal.position.set(x, trailHeight(x,z), z);
  return { animal, head, x, z, pace };
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
  const start = -3.6;
  creature.position.set(start, trailHeight(start, overlookPath(start)), overlookPath(start));
  creature.rotation.y = -.19;
  scene.add(creature);
  return { creature, torso, head, arms, legs };
}

export function mountainOverlook() {
  const scene = new T.Scene();
  const sky = new T.Color();
  scene.background = sky;
  scene.fog = new T.Fog(sky, 28, 83);
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
    starPositions.push(Math.sin(i * 17.63) * 65, 21 + (i * 37 % 67) * .32, -66 - (i * 29 % 61) * .20);
  }
  const starGeometry = new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(starPositions, 3));
  const stars = new T.Points(starGeometry, new T.PointsMaterial({
    color: 0xe4eaff, size: 2.5, sizeAttenuation: false, transparent: true, depthWrite: false, toneMapped: false, fog: false,
  }));
  scene.add(stars);
  const landscape = trailLandscape(scene);
  const hikers = trailHikers(scene);

  const animals = (species: 'elk' | 'deer', positions: [number, number, number][]) => positions.map(([x, z, scale], i) => {
    const model = buildUngulate(scene, x, z, scale, -.31 + i * .92, species, species === 'elk' && i % 4 === 0);
    const shadow = ellipsoid(scene, 0x495644, [x, trailHeight(x,z) + .025, z], [.72 * scale, .012, .32 * scale]);
    return { ...model, home: new T.Vector3(x, 0, z), target: new T.Vector3(x, 0, z),
      wait: 3 + i * .75, moving: false, pace: .48 + i % 6 * .035, shadow };
  });
  const herd = animals('elk', [
    [2.55,-2.7,1.08], [.15,-4.9,.68], [-3.65,-2.15,.94], [6.15,-3.25,.9], [-1.98,-5.72,.86], [4.8,-5.3,1.02],
    [-16.6,-4.2,1.02], [-13.7,-2.35,.84], [-10.35,-5.9,.93],
    [11.2,-3.55,.98], [15.45,-5.45,1.04], [19.3,-2.95,.78],
  ]);
  const deer = animals('deer', [[-18.7,-6.6,.66], [16.2,-7.55,.65]]);
  const grazers = [...herd, ...deer];
  const marmots = [
    buildMarmot(scene,-11.45,-1.55,1.2), buildMarmot(scene,8.45,-1.39,1.1), buildMarmot(scene,18.15,-1.45,1.3),
  ];
  const { creature: sasquatch, torso, head, arms, legs } = buildSasquatch(scene);
  const sasquatchAnchor = { point: new T.Vector3(), target: new T.Vector3(), radius: 1.35 };
  let travelDirection = 1;
  let roamTarget = 3;
  let fleeRemaining = 0;
  let cooldown = 0;
  let looking = 0;
  let stopRemaining = 1.8;
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
  const elkAnchor = { point: new T.Vector3(), target: new T.Vector3(), radius: 1.65 };

  function say(group: T.Group, lines: readonly string[]) {
    const choices = lines.filter(line => line !== thought);
    thought = choices[Math.floor(Math.random() * choices.length)];
    speaker = group;
    thoughtRemaining = 4.6;
    nextThought = 8 + Math.random() * 6;
  }

  function walkHerd(seconds: number) {
    for (const elk of grazers) {
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
          if (Math.abs(turn) < .72) elk.animal.position.addScaledVector(direction, seconds * elk.pace / distance);
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
      const grade = trailHeight(elk.animal.position.x, elk.animal.position.z);
      elk.animal.position.y = grade + .045;
      elk.shadow.position.y = grade + .025;
      elk.shadow.rotation.y = elk.animal.rotation.y;
    }
    for (const { animal, head, x, z, pace } of marmots) {
      const phase = T.MathUtils.euclideanModulo(timeInScene * .12 * pace + x, 1);
      const moving = phase < .32 || (phase > .52 && phase < .84);
      const distance = -.46 + .92 * (
        T.MathUtils.smoothstep(phase, 0, .32) - T.MathUtils.smoothstep(phase, .52, .84)
      );
      animal.position.x = x + distance;
      animal.position.y = trailHeight(animal.position.x, z) + (moving ? Math.abs(Math.sin(timeInScene * 6 + z)) * .028 : 0);
      animal.rotation.y = T.MathUtils.damp(animal.rotation.y, phase < .52 ? 0 : Math.PI, 5, seconds);
      head.rotation.z = -.10 + Math.sin(timeInScene * 2.4 + x) * .12;
    }
  }

  function sneak(seconds: number, visitor: T.Vector3, reduceMotion: boolean) {
    cooldown = Math.max(0, cooldown - seconds);
    const here = sasquatch.position;
    const startled = cooldown === 0 && here.distanceToSquared(visitor) < 2.2 ** 2;
    if (startled) {
      travelDirection = here.x >= visitor.x ? 1 : -1;
      if (here.x + travelDirection * 5 < -19 || here.x + travelDirection * 5 > 20) travelDirection *= -1;
      roamTarget = T.MathUtils.clamp(here.x + travelDirection * 12, -19, 20);
      fleeRemaining = 3.3;
      stopRemaining = 0;
      cooldown = 8.5;
      say(sasquatch, trailThoughts.startled);
    }

    const running = fleeRemaining > 0;
    let walking = false;
    if (stopRemaining > 0) {
      looking += seconds;
      stopRemaining -= seconds;
    } else if (running || !reduceMotion) {
      const toGo = roamTarget - here.x;
      const moving = Math.min(Math.abs(toGo), seconds * (running ? 3.8 : .73));
      const x = here.x + moving * Math.sign(toGo);
      const z = overlookPath(x) + .12;
      if (moving > .001) {
        walking = true;
        const heading = Math.atan2(x - here.x, z - here.z);
        const turn = Math.atan2(Math.sin(heading - sasquatch.rotation.y), Math.cos(heading - sasquatch.rotation.y));
        sasquatch.rotation.y += turn * (1 - Math.exp(-(running ? 13 : 5) * seconds));
        here.set(x, trailHeight(x,z), z);
        gait += moving * (running ? 5.4 : 8.6);
      }
      fleeRemaining = Math.max(0, fleeRemaining - seconds);
      if (Math.abs(toGo) - moving < .002 || (running && fleeRemaining === 0)) {
        fleeRemaining = 0;
        stopRemaining = running ? 2.1 : 2.4 + Math.random() * 1.6;
        looking = 0;
        if (here.x + travelDirection * 3 < -18.5 || here.x + travelDirection * 3 > 19.5) travelDirection *= -1;
        roamTarget = T.MathUtils.clamp(here.x + travelDirection * (5 + Math.random() * 3), -18.5, 19.5);
      }
    }

    const stride = walking && !reduceMotion ? Math.sin(gait) : 0;
    torso.rotation.x = running ? .39 : .16 + Math.abs(stride) * .11;
    torso.position.y = 1.13 + Math.abs(stride) * (running ? .11 : .05);
    const glance = reduceMotion ? 0 : walking ? Math.sin(gait * .36) * .24 : Math.sin(looking * 1.73) * .72;
    head.rotation.y = T.MathUtils.damp(head.rotation.y, glance, 7, seconds);
    head.rotation.x = walking ? -.06 : .09;
    legs.forEach((leg, index) => {
      const swing = index === 0 ? stride : -stride;
      leg.rotation.x = swing * (running ? .71 : .39);
      leg.position.y = .81 + Math.max(0, -swing) * (running ? .18 : .10);
    });
    arms.forEach((arm, index) => {
      arm.rotation.x = -.53 + (index === 0 ? stride : -stride) * (running ? .55 : .24);
    });
    sasquatchAnchor.point.copy(here).y += 1.74;
    sasquatchAnchor.target.copy(here).y = 0;
  }

  function setTime(time: string) {
    const [hour, minute] = time.split(':').map(Number);
    const minutes = hour * 60 + minute;
    const { light, warmth } = daylightAt(time);
    landscape.setLight(light);
    hikers.setDaytime(minutes >= 9 * 60 && minutes < 18 * 60);
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
      cooldown = fleeRemaining = 0;
    }
    activeSasquatch = sasquatch.visible = isLate;
  }

  function update(seconds: number, visitor: T.Vector3, reduceMotion: boolean) {
    timeInScene += seconds;
    if (!reduceMotion) {
      walkHerd(seconds);
      hikers.walk(seconds);
    }
    const viewingX = visitor.x < -7 ? -13.7 : visitor.x > 9 ? 15.4 : 2.55;
    elkAnchor.target.set(viewingX, 0, 1.32);
    elkAnchor.point.set(viewingX, .76, overlookFence + .2);
    if (activeSasquatch) sneak(seconds, visitor, reduceMotion);
    const nearSasquatch = activeSasquatch && cooldown === 0 && sasquatch.position.distanceToSquared(visitor) < 4.7 ** 2;
    if (nearSasquatch && !wasNearSasquatch) say(sasquatch, trailThoughts.sasquatch);
    wasNearSasquatch = nearSasquatch;
    thoughtRemaining -= seconds;
    nextThought -= seconds;
    if (nextThought <= 0) {
      if (nearSasquatch) say(sasquatch, trailThoughts.sasquatch);
      else {
        const nearbyElk = herd.filter(({ animal }) => animal.position.distanceToSquared(visitor) < 7 ** 2);
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
  viewer.position.set(.3, trailHeight(.3,1.49), 1.49);
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

  const portalZ = overlookPath(overlookPortalX);
  const travel = travelCircle(scene, overlookPortalX, portalZ, trailHeight(overlookPortalX, portalZ));
  const spawnX = overlookPortalX + 1.22;

  setTime('14:00');
  return {
    scene, travel, spawn: new T.Vector3(spawnX, 0, overlookPath(spawnX)),
    heightAt: trailHeight,
    bounds: overlookBounds,
    obstacles: landscape.obstacles,
    anchors: {
      elk: elkAnchor,
      sasquatch: sasquatchAnchor,
      trailVictor: { point: new T.Vector3(.3, 1.65, 1.49), target: new T.Vector3(.3, 0, 2.07), radius: 1.24 },
    },
    setVisitor(present: boolean) { viewer.visible = present; },
    setTime,
    update,
    canInspectSasquatch: () => activeSasquatch,
  };
}
