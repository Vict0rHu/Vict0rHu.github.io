import * as T from 'three';
import { mindTerminalWindows } from './content';
import { box, cylinder } from './set';

function terminalWindow({ title, lines }: typeof mindTerminalWindows[number]) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 224;
  const ink = canvas.getContext('2d')!;
  const map = new T.CanvasTexture(canvas);
  map.colorSpace = T.SRGBColorSpace;
  const screen = new T.Sprite(new T.SpriteMaterial({ map, toneMapped: false, opacity: .72, depthWrite: false }));
  screen.scale.set(2.22, 1.30, 1);
  let lastFrame = -1;

  return {
    screen,
    refresh(time: number) {
      const frame = Math.floor(time * 8);
      if (frame === lastFrame) return;
      lastFrame = frame;
      const row = Math.floor(frame / 6);
      ink.fillStyle = '#091b19';
      ink.fillRect(0, 0, 384, 224);
      ink.strokeStyle = '#5cba8c';
      ink.lineWidth = 5;
      ink.strokeRect(2, 2, 380, 220);
      ink.fillStyle = '#193830';
      ink.fillRect(5, 5, 374, 33);
      ink.fillStyle = '#7be1af';
      for (let i = 0; i < 3; i++) ink.fillRect(15 + i * 14, 19, 7, 7);
      ink.font = 'bold 19px monospace';
      ink.fillText(title, 63, 28);
      ink.font = '19px monospace';
      for (let i = 0; i < 5; i++) {
        const line = lines[(row + i) % lines.length];
        ink.fillStyle = i === 4 || (frame + i * 2) % 9 < 2 ? '#8efbb0' : '#4cba82';
        ink.fillText(i === 4 ? line.slice(0, 5 + frame % 6 * 4) : line, 16, 64 + i * 27);
      }
      ink.fillStyle = '#8efbb0';
      ink.fillText(frame % 8 < 4 ? '> ▌' : '>', 16, 202);
      ink.fillStyle = '#02211833';
      for (let y = 41; y < 220; y += 5) ink.fillRect(5, y, 374, 1);
      ink.fillStyle = '#77ffc01c';
      ink.fillRect(5, 40 + (frame * 17) % 166, 374, 9);
      map.needsUpdate = true;
    },
  };
}

function rocketModel() {
  const rocket = new T.Group();
  cylinder(rocket, .19, .75, 0, 0, 0, 0xfff4e3);
  const nose = new T.Mesh(new T.ConeGeometry(.19, .37, 12), new T.MeshStandardMaterial({ color: 0xff658c }));
  nose.position.y = .55;
  rocket.add(nose);
  cylinder(rocket, .08, .028, 0, .16, .184, 0x65d9ff).rotation.x = Math.PI / 2;
  for (const yaw of [0, Math.PI * 2 / 3, Math.PI * 4 / 3]) {
    const fin = new T.Group();
    fin.rotation.y = yaw;
    box(fin, [.052, .33, .27], [0, -.3, .23], 0xf76082).rotation.x = -.38;
    rocket.add(fin);
  }
  const plume = new T.Mesh(new T.ConeGeometry(.125, .55, 9), new T.MeshBasicMaterial({ color: 0xffb366 }));
  plume.position.y = -.6;
  plume.rotation.z = Math.PI;
  rocket.add(plume);
  return { rocket, plume };
}

function droneModel() {
  const drone = new T.Group();
  box(drone, [.5, .17, .36], [0, 0, 0], 0x35435e);
  box(drone, [.12, .105, .04], [0, -.022, .19], 0xa4f8e9, .62);
  const rotors: T.Group[] = [];
  for (const x of [-.34, .34]) for (const z of [-.27, .27]) {
    const strut = box(drone, [.46, .065, .085], [x / 2, .015, z / 2], 0x8e95b9);
    strut.rotation.y = -Math.atan2(z, x);
    cylinder(drone, .082, .13, x, .08, z, 0x69e1c8);
    const rotor = new T.Group();
    rotor.position.set(x, .155, z);
    box(rotor, [.31, .021, .048], [0, 0, 0], 0xffe6f3);
    drone.add(rotor);
    rotors.push(rotor);
  }
  return { drone, rotors };
}

export function createMindSpace(scene: T.Scene) {
  const stars = new T.BufferGeometry();
  const positions = [];
  const colors: number[] = [];
  const tints = [0xf9f7ff, 0xb3a9df, 0xa1bbc9, 0xf0c2ab].map(color => new T.Color(color));
  for (let i = 0; i < 190; i++) {
    const x = ((i * 73 % 193) / 193 - .5) * 62;
    const z = ((i * 97 % 197) / 197 - .5) * 52;
    const y = -4 - (i * 33 % 179) * .09;
    positions.push(x, y, z);
    tints[i % tints.length].toArray(colors, i * 3);
  }
  stars.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  stars.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  scene.add(new T.Points(stars, new T.PointsMaterial({
    size: 3, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: .72, depthWrite: false, toneMapped: false,
  })));

  const planets = [
    { position: [-.7, -6.5, -2.6], radius: 1.63, color: 0x9da1d8, terminal: 0 },
    { position: [-9.8, -8.8, -7.5], radius: 1.34, color: 0xc18cad, terminal: 1 },
    { position: [9.3, -8.5, -9.9], radius: 1.93, color: 0xd6b480, terminal: 2 },
    { position: [-7.9, -8.4, 7.6], radius: 2.16, color: 0x89b6bf },
    { position: [8.4, -5.4, 6.8], radius: 1.42, color: 0xbaa3cf },
    { position: [-2.1, -11.8, -18.7], radius: 2.5, color: 0xa4bab2 },
  ].map(({ position, radius, color, terminal }, i) => {
    const planet = new T.Group();
    planet.position.fromArray(position);
    const globe = new T.Mesh(new T.IcosahedronGeometry(radius, 1),
      new T.MeshStandardMaterial({ color, flatShading: true }));
    planet.add(globe);
    if (i % 3 !== 1) {
      const ring = new T.Mesh(new T.RingGeometry(radius * 1.24, radius * 1.48, 48),
        new T.MeshBasicMaterial({ color, side: T.DoubleSide, transparent: true, opacity: .46, depthWrite: false }));
      ring.rotation.set(1.05, .26, i % 2 ? -.36 : .25);
      planet.add(ring);
    }
    const window = terminal === undefined ? undefined : terminalWindow(mindTerminalWindows[terminal]);
    scene.add(planet);
    if (window) scene.add(window.screen);
    return { planet, globe, radius, window };
  });

  const deepFlight = rocketModel();
  const highFlight = rocketModel();
  deepFlight.rocket.scale.setScalar(.85);
  highFlight.rocket.scale.setScalar(.82);
  const { drone, rotors } = droneModel();
  scene.add(deepFlight.rocket, highFlight.rocket, drone);
  const up = new T.Vector3(0, 1, 0);
  const direction = new T.Vector3();
  let age = 0;

  function update(seconds: number) {
    age += seconds;
    planets.forEach(({ planet, globe, radius, window }, i) => {
      globe.rotation.y += seconds * .1;
      if (!window) return;
      const phase = age * .12 + [.26, 2.66, 4.88][i];
      const { x, y, z } = planet.position;
      window.screen.position.set(x + Math.cos(phase) * (radius + 1.6),
        y + .65 + Math.sin(phase) * .64, z + Math.sin(phase) * (radius + .85));
      window.screen.material.rotation = Math.sin(phase) * .075;
      window.refresh(age + i * .46);
    });

    const dive = age * .23 + 4.28;
    deepFlight.rocket.position.set(7.4 * Math.cos(dive), -5.7 + .72 * Math.sin(dive * 2), 1 + 5.9 * Math.sin(dive));
    direction.set(-7.4 * Math.sin(dive), 1.44 * Math.cos(dive * 2), 5.9 * Math.cos(dive)).normalize();
    deepFlight.rocket.quaternion.setFromUnitVectors(up, direction);
    deepFlight.plume.scale.y = 1 + .16 * Math.sin(age * 16);

    const flight = age * .18 + 2.05;
    highFlight.rocket.position.set(12 * Math.cos(flight), 3.6, 10.8 * Math.sin(flight));
    direction.set(-12 * Math.sin(flight), 0, 10.8 * Math.cos(flight)).normalize();
    highFlight.rocket.quaternion.setFromUnitVectors(up, direction);
    highFlight.plume.scale.y = 1 + .18 * Math.sin(age * 19);

    const loop = age * .25 + 2.4;
    drone.position.set(8.6 * Math.cos(loop), 2.8 + .38 * Math.sin(loop * 2), 9.2 * Math.sin(loop));
    drone.rotation.set(Math.sin(loop) * .12, -loop, Math.cos(loop) * .16);
    for (const rotor of rotors) rotor.rotation.y += seconds * 18;
  }

  return update;
}
