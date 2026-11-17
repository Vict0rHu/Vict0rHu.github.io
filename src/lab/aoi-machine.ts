import * as T from 'three';
import { box, cylinder } from './set';

const loadTime = 1;
const stationTime = 1.08;
// The tray faces +Z, so the top row on the monitor is the back row on the tray.
const stations = [[-.36, -.26], [.36, -.26], [-.36, .26], [.36, .26]] as const;
const exposureColors = [0xff303c, 0x304fff, 0x22ed67] as const;
const captureEnd = loadTime + stationTime * stations.length;
export const inspectionDuration = captureEnd + 1.18;

const ease = (progress: number) => T.MathUtils.smoothstep(progress, 0, 1);

export function aoiMachine() {
  const model = new T.Group();
  const frame = 0x29313e;
  const rail = 0x8292a5;
  box(model, [1.94, .17, 1.49], [0, .085, -.19], frame);
  box(model, [1.88, 1.49, .12], [0, .84, -.9], frame);
  for (const side of [-1, 1]) {
    const x = side * .92;
    for (const z of [-.89, .48]) box(model, [.101, 1.55, .103], [x, .87, z], frame);
    box(model, [.09, .095, 1.48], [x, 1.62, -.2], frame);
    box(model, [.07, .87, 1.29], [x, .77, -.2], 0x638394).material.setValues({
      opacity: .27, transparent: true, depthWrite: false,
    });
    box(model, [.071, .07, 2.1], [side * .73, .206, .16], rail);
    box(model, [.19, .31, .14], [side * .82, .28, .53], frame);
  }
  box(model, [1.93, .1, .11], [0, 1.62, -.88], frame);
  box(model, [1.93, .12, .12], [0, 1.28, .48], frame);
  box(model, [.49, .19, .052], [0, 1.07, .54], 0x384454);
  for (const x of [-.11, 0, .11]) cylinder(model, .025, .023, x, 1.07, .57, 0xe5b86a).rotation.x = Math.PI / 2;

  const tray = new T.Group();
  model.add(tray);
  box(tray, [1.33, .089, 1.16], [0, .264, 0], 0x485366);
  box(tray, [1.34, .10, .088], [0, .26, .58], rail);
  const specimenGeometry = new T.BoxGeometry(.35, .055, .26);
  const outlineGeometry = new T.EdgesGeometry(specimenGeometry);
  const clearMaterial = new T.MeshPhysicalMaterial({
    color: 0xc0e7ee, transparent: true, opacity: .27, roughness: .16, clearcoat: .82, depthWrite: false,
  });
  const edges = new T.LineBasicMaterial({ color: 0xc9ecf5, transparent: true, opacity: .73 });
  const emitters = stations.map(([x, z]) => {
    box(tray, [.45, .045, .35], [x, .325, z], 0xa6b3bc);
    box(tray, [.33, .009, .24], [x, .352, z], 0x4e6573);
    const specimen = new T.Mesh(specimenGeometry, clearMaterial);
    specimen.position.set(x, .39, z);
    specimen.add(new T.LineSegments(outlineGeometry, edges));
    tray.add(specimen);
    const emitter = new T.Mesh(new T.PlaneGeometry(.32, .23), new T.MeshBasicMaterial({ toneMapped: false }));
    emitter.rotation.x = -Math.PI / 2;
    emitter.position.set(x, .36, z);
    tray.add(emitter);
    return emitter;
  });
  const exposureLight = new T.PointLight(0xffffff, 0, .75);
  tray.add(exposureLight);

  const bridge = new T.Group();
  model.add(bridge);
  box(bridge, [1.65, .08, .10], [0, .93, 0], rail);
  const camera = new T.Group();
  bridge.add(camera);
  box(camera, [.29, .24, .29], [0, .777, 0], 0x253246);
  cylinder(camera, .111, .095, 0, .63, 0, 0x111e32);
  const lens = cylinder(camera, .073, .022, 0, .574, 0, 0x83e9ff);
  lens.material.emissive.setHex(0x83e9ff);

  const monitor = new T.Group();
  monitor.position.set(0, 1.67, .55);
  monitor.rotation.x = -.13;
  model.add(monitor);
  box(monitor, [1.77, .98, .095], [0, 0, 0], 0x141d2a);
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 210;
  const ink = canvas.getContext('2d');
  const map = new T.CanvasTexture(canvas);
  map.colorSpace = T.SRGBColorSpace;
  const screen = new T.Mesh(new T.PlaneGeometry(1.65, .86), new T.MeshBasicMaterial({ map, toneMapped: false }));
  screen.position.z = .054;
  monitor.add(screen);
  let lastDisplay = '';

  function display(status: string, captured: number) {
    if (!ink) return;
    const key = status + captured;
    if (key === lastDisplay) return;
    lastDisplay = key;
    ink.fillStyle = '#edf3f7';
    ink.fillRect(0, 0, 384, 210);
    ink.fillStyle = '#172839';
    ink.fillRect(0, 0, 384, 39);
    ink.fillStyle = '#edf3f7';
    ink.font = 'bold 22px sans-serif';
    ink.fillText('P2SPLAB  /  AOI', 15, 27);
    ink.fillStyle = '#efbc68';
    ink.fillRect(12, 48, 360, 30);
    ink.fillStyle = '#1d2934';
    ink.font = 'bold 20px sans-serif';
    ink.fillText(status, 22, 70);
    for (let index = 0; index < stations.length; index++) {
      const x = 12 + (index % 2) * 182;
      const y = 87 + Math.floor(index / 2) * 57;
      ink.fillStyle = index < captured ? '#b6ddbf' : '#ccd5de';
      ink.fillRect(x, y, 175, 49);
      ink.fillStyle = '#233749';
      ink.font = 'bold 15px monospace';
      ink.fillText(`${index + 1}  ${index < captured ? 'CAPTURED' : 'WAITING'}`, x + 10, y + 30);
    }
    map.needsUpdate = true;
  }

  function pose(seconds: number) {
    const loading = ease(seconds / loadTime);
    const ejecting = ease((seconds - captureEnd) / (inspectionDuration - captureEnd));
    const trayIn = -.34;
    const trayOut = .81;
    tray.position.z = T.MathUtils.lerp(trayOut, trayIn, loading - ejecting);
    const scan = Math.max(0, (seconds - loadTime) / stationTime);
    const index = Math.min(stations.length - 1, Math.floor(scan));
    const progress = T.MathUtils.clamp(scan - index, 0, 1);
    const previous = stations[index - 1] ?? [0, 0];
    const [x, z] = stations[index];
    const travel = ease(progress / .52);
    camera.position.x = T.MathUtils.lerp(previous[0], x, travel) * (1 - ejecting);
    bridge.position.z = T.MathUtils.lerp(previous[1], z, travel) + trayIn;
    bridge.position.z *= loading * (1 - ejecting);
    const exposure = (progress - .55) / .13;
    const color = exposureColors[Math.floor(exposure)];
    const firing = color !== undefined && exposure % 1 < .83;
    emitters.forEach((emitter, slot) => { emitter.visible = firing && slot === index; });
    exposureLight.intensity = 0;
    if (firing) {
      emitters[index].material.color.setHex(color);
      exposureLight.color.setHex(color);
      exposureLight.position.set(x, .43, z);
      exposureLight.intensity = 1.25;
    }
    lens.material.emissiveIntensity = firing ? 1.4 : .22;
    const captured = index + Number(progress >= .94);
    const status = seconds === 0 ? 'Ready' : seconds < loadTime ? 'Loading tray' :
      seconds < captureEnd ? `Imaging position ${index + 1}` : seconds < inspectionDuration ? 'Ejecting tray' : 'Inspection complete';
    display(status, captured);
  }

  pose(0);
  return { model, pose };
}
