import * as T from 'three';
import { memoryMist } from './memory-mist';
import { balloonMorning, graduationPhoto, outdoorSolarClass } from './unr-scenes';
import { unrHeightAt, unrMemories, unrOrigin, unrPresence, unrRadius, unrThoughts, withinUnr, type UnrMoment } from './unr-content';
import { unrGround } from './unr-ground';
import { memoryAtmosphere } from './unr-atmosphere';
import { memoryClearing, memoryLandscape } from './unr-landscape';
import type { WalkableSpace } from './navigation';
export function unrExchange() {
  const scene = new T.Scene();
  const quietSky = new T.Color(0xb2bcc4);
  const sky = quietSky.clone();
  scene.background = sky;
  const ambient = new T.HemisphereLight(0xd4c9be, 0x51586b, 1.15);
  const sunlight = new T.DirectionalLight(0xffddb5, 1.5);
  sunlight.position.set(-12, 4, -8);
  scene.add(ambient, sunlight);
  const bounds = { left: -unrRadius, right: unrRadius, back: unrOrigin.z - unrRadius, front: unrOrigin.z + .94 };
  const obstacles: WalkableSpace['obstacles'] = [];
  const atmosphere = memoryAtmosphere();
  const ground = unrGround(scene);
  atmosphere.layer(ground.root, 1, false);
  const clearing = memoryClearing(scene);
  const entrancePaths = atmosphere.layer(clearing.paths);
  const mist = memoryMist(scene, unrRadius, unrOrigin.z);
  const factories = { balloons: balloonMorning, solar: outdoorSolarClass, graduation: graduationPhoto };
  const moments = unrMemories.map(moment => {
    const group = new T.Group();
    group.name = moment.id;
    group.position.set(moment.x, unrHeightAt(moment.x, moment.z), moment.z);
    scene.add(group);
    const details: { speaker: T.Group; photoTarget?: T.Group; obstacles: WalkableSpace['obstacles']; update(age: number, reduced: boolean): void } =
      moment.id === 'balloons' ? balloonMorning(group, (x, z) => unrHeightAt(moment.x + x, moment.z + z) - group.position.y) : factories[moment.id](group);
    const light = new T.PointLight(moment.light, moment.id === 'balloons' ? 8 : 12, 13, 1.4);
    light.position.set(0, 5, 0);
    group.add(light);
    memoryLandscape(group, moment.id);
    const haze = atmosphere.layer(group, 0);
    return { ...moment, group, details, haze, skyColor: new T.Color(moment.sky), lightColor: new T.Color(moment.light), groundColor: new T.Color(moment.ground) };
  });
  function block(id: UnrMoment, x: number, z: number, width: number, depth: number) {
    const center = moments.find(moment => moment.id === id)!;
    obstacles.push({ left: center.x + x - width / 2, right: center.x + x + width / 2, back: center.z + z - depth / 2, front: center.z + z + depth / 2 });
  }
  for (const moment of moments) {
    for (const rectangle of moment.details.obstacles) {
      obstacles.push({left:moment.x+rectangle.left,right:moment.x+rectangle.right,back:moment.z+rectangle.back,front:moment.z+rectangle.front,blocksAt:(x,z)=>unrMemories[unrPresence(x,z).index].id===moment.id});
    }
  }
  block('solar', -.72, -.4, 2.45, 1.8);
  block('solar', 1.65, -.72, 1.27, .75);
  block('graduation', 0, -.65, 3.05, 1.0);
  block('balloons', 0, 1.05, 4.9, 2.4);
  const anchors = {
    unrBalloons: { point: new T.Vector3(), target: new T.Vector3(), radius: 2.1 },
    unrSolar: { point: new T.Vector3(), target: new T.Vector3(), radius: 1.8 },
    unrPhoto: { point: new T.Vector3(), target: new T.Vector3(), radius: 1.8 },
  };
  for (const moment of moments) {
    const anchor = anchors[moment.id === 'balloons' ? 'unrBalloons' : moment.id === 'solar' ? 'unrSolar' : 'unrPhoto'];
    const subject = moment.details.photoTarget ?? moment.details.speaker;
    subject.getWorldPosition(anchor.point);
    anchor.target.copy(anchor.point).setY(0);
    if (moment.id === 'balloons')
      anchor.target.set(moment.x, 0, moment.z + 2.75);
    anchor.point.y += moment.id === 'balloons' ? .8 : 1.9;
  }
  let age = 0, immersion = 0;
  let active: UnrMoment | undefined;
  let thought = '', thoughtUntil = 0, nextThought = 4;
  const thoughtPoint = new T.Vector3();
  const targetSky = new T.Color(), targetLight = new T.Color(), targetGround = new T.Color(), groundColor = new T.Color(0x93999d);
  const sunDirection = new T.Vector3();
  const sunPositions = { balloons: new T.Vector3(-12, 4, -8), graduation: new T.Vector3(-8, 10, 4), solar: new T.Vector3(-6, 13, 8) };
  function update(seconds: number, visitor: T.Vector3, reduced: boolean) {
    age += seconds;
    const presence = unrPresence(visitor.x, visitor.z);
    const chosen = moments[presence.index];
    const next = presence.weight > .3 ? chosen.id : undefined;
    if (next !== active) {
      active = next;
      thought = '';
      thoughtUntil = 0;
      nextThought = age + 2;
    }
    immersion = reduced ? presence.weight : T.MathUtils.damp(immersion, presence.weight, 6, seconds);
    targetSky.copy(quietSky).lerp(chosen.skyColor, presence.weight);
    sky.lerp(targetSky, reduced ? 1 : 1 - Math.exp(-seconds * 3));
    ambient.intensity = 1.35 + immersion * .35;
    targetLight.setHex(0xd4dadd).lerp(chosen.lightColor, presence.weight);
    ambient.color.lerp(targetLight, reduced ? 1 : 1 - Math.exp(-seconds * 3));
    sunlight.color.copy(ambient.color);
    sunlight.intensity = 1.35 + immersion * (chosen.id === 'solar' ? 1.65 : chosen.id === 'balloons' ? .65 : .1);
    sunDirection.copy(sunPositions[chosen.id]);
    sunlight.position.lerp(sunDirection, reduced ? 1 : 1 - Math.exp(-seconds * 3));
    targetGround.setHex(0x93999d).lerp(chosen.groundColor, presence.weight);
    groundColor.lerp(targetGround, reduced ? 1 : 1 - Math.exp(-seconds * 3));
    ground.setColor(groundColor);
    atmosphere.update(visitor, sky, immersion);
    mist(age, sky, reduced);
    entrancePaths.setReveal(1 - T.MathUtils.smoothstep(presence.radius, 3, 7));
    for (const [index, moment] of moments.entries()) {
      moment.details.update(age, reduced);
      const reveal = index === presence.index ? presence.weight : 0;
      const blend = reduced ? reveal : T.MathUtils.damp(moment.haze.reveal, reveal, 5, seconds);
      moment.haze.setReveal(blend);
    }
    const nearSpeaker = Math.hypot(visitor.x - chosen.x, visitor.z - chosen.z) < 5;
    if (active && nearSpeaker && immersion > .65 && age >= nextThought) {
      const lines = unrThoughts[active];
      thought = lines[Math.floor(age * 7) % lines.length];
      thoughtUntil = age + 3.8;
      nextThought = age + 13;
    }
    if (age > thoughtUntil || !nearSpeaker)
      thought = '';
    if (active) {
      chosen.details.speaker.getWorldPosition(thoughtPoint);
      thoughtPoint.y += active === 'balloons' ? .8 : 1.9;
    }
  }
  const spawn = new T.Vector3(unrOrigin.x, 0, unrOrigin.z);
  update(0, spawn, true);
  return {
    scene, bounds, obstacles, anchors, spawn, contains: withinUnr, heightAt: unrHeightAt,
    update,
    updateBackdrop(_seconds: number) { },
    reset() {
      age = immersion = 0;
      active = undefined;
      thought = '';
      nextThought = 4;
      for (const moment of moments) moment.haze.setReveal(0);
      update(0, spawn, true);
    },
    get immersion() { return immersion; },
    get moment() { return active; },
    get thought() { return { text: thought, point: thoughtPoint }; },
  };
}
