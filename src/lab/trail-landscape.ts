import * as T from 'three';

type Point = [number, number];
type Prop = { x: number; y: number; z: number; width: number; height: number; depth: number; color: number; yaw?: number };
const lake = { x: 10.4, z: 8.9, width: 5.6, depth: 3.55, level: -.28 };
export const overlookFence = .55;
export const overlookPath = (x: number) => 2.95 + .52 * (1 - Math.cos(x * .19));
export const overlookBounds = { left: -21, right: 22, back: .83, front: 16.4 };
export const overlookPortalX = -9.35;
const lakeWalk: Point[] = [[-5.9,5.6],[-2.9,8.8],[1.8,11.2],[5.5,13.8],[10.6,14.25],[15,13.3],[18.55,10.5],[19.3,6.3]];

const shoreStops: Point[] = [[-7.5, overlookPath(-7.5)], ...lakeWalk, [20.1, overlookPath(20.1)]];
export const shoreTrail = new T.CatmullRomCurve3(shoreStops.map(([x, z]) => new T.Vector3(x, 0, z)));
const shorePath = shoreTrail.getPoints(96);
const pathRegion = { left: -66, width: 132, depth: 18 };

function pathDistance(x: number, z: number) {
  let distance = Math.abs(z - overlookPath(x));
  if (x < -9 || x > 22 || z < 3 || z > 17 || distance < .8) return distance;
  for (let i = 1; i < shorePath.length; i++) {
    const { x: startX, z: startZ } = shorePath[i - 1];
    const dx = shorePath[i].x - startX;
    const dz = shorePath[i].z - startZ;
    const along = T.MathUtils.clamp(((x - startX) * dx + (z - startZ) * dz) / (dx * dx + dz * dz), 0, 1);
    distance = Math.min(distance, Math.hypot(x - startX - along * dx, z - startZ - along * dz) + .28);
  }
  return distance;
}

function lakeDistance(x: number, z: number) {
  return Math.hypot((x - lake.x) / lake.width, (z - lake.z) / lake.depth);
}

export function trailHeight(x: number, z: number) {
  const distanceToLake = lakeDistance(x, z);
  const shore = T.MathUtils.smoothstep(distanceToLake, .63, 1);
  const foothills = T.MathUtils.smoothstep(-z, 8, 23) * (1.3 + .84 * Math.sin(x * .35) * Math.cos(z * .43));
  const awayFromWater = T.MathUtils.smoothstep(distanceToLake, 1.03, 1.52);
  const awayFromPortal = T.MathUtils.smoothstep(Math.hypot(x - overlookPortalX, z - overlookPath(overlookPortalX)), 1.05, 2.7);
  const rollingMeadow = T.MathUtils.smoothstep(z, .6, 2.9) * awayFromWater * awayFromPortal *
    (.22 * Math.sin(x * .24 + z * .16) + .16 * Math.cos(x * .30 - z * .44));
  return -.015 - (1 - shore) * 1.17 + foothills + rollingMeadow;
}

function trailMask() {
  const canvas = document.createElement('canvas');
  canvas.width = 3072;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) return;
  const { left, width, depth } = pathRegion;
  const scaleX = canvas.width / width;
  context.setTransform(scaleX, 0, 0, canvas.height / depth, -left * scaleX, 0);
  context.lineJoin = 'round';
  context.lineCap = 'round';
  const main: Point[] = Array.from({ length: 529 }, (_, i) => {
    const x = left + i / 4;
    return [x, overlookPath(x)];
  });
  for (const [points, width] of [[main, 2.44], [shorePath.map(({ x, z }): Point => [x, z]), 1.84]] as const) {
    context.beginPath();
    context.moveTo(...points[0]);
    for (const point of points.slice(1)) context.lineTo(...point);
    context.strokeStyle = 'rgba(255,255,255,.35)';
    context.lineWidth = width + .14;
    context.stroke();
    context.strokeStyle = '#fff';
    context.lineWidth = width;
    context.stroke();
  }
  const texture = new T.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

function instances(parent: T.Object3D, geometry: T.BufferGeometry, placements: Prop[]) {
  const mesh = new T.InstancedMesh(geometry, new T.MeshStandardMaterial({ flatShading: true, roughness: .96 }), placements.length);
  const place = new T.Object3D();
  const tint = new T.Color();
  for (const [index, item] of placements.entries()) {
    place.position.set(item.x, item.y, item.z);
    place.rotation.y = item.yaw ?? 0;
    place.scale.set(item.width, item.height, item.depth);
    place.updateMatrix();
    mesh.setMatrixAt(index, place.matrix);
    mesh.setColorAt(index, tint.setHex(item.color));
  }
  parent.add(mesh);
}

function ridge(parent: T.Object3D, x: number, z: number, width: number, height: number, color: number, snow: boolean) {
  const ringSize = 9;
  const rings = [
    [1, 0],
    [.59, .36],
    [.30, .69],
    [.12, .91],
  ].map(([radius, altitude], band) => Array.from({ length: ringSize }, (_, index) => {
    const angle = index / ringSize * Math.PI * 2 + x * .14;
    const edge = radius * (1 + .21 * Math.sin(index * 9.7 + x));
    const lean = altitude * width * .19 * Math.sin(x);
    const jagged = band === 2 ? .08 * Math.cos(index * 4.3 + x) : band ? .045 * Math.sin(index * 4 + x) : 0;
    return [x + Math.cos(angle) * width * edge + lean, -.15 + (altitude + jagged) * height, z + Math.sin(angle) * width * .72 * edge];
  }));
  const peak = [x + width * .19 * Math.sin(x), height, z - width * .095];
  const vertices: number[] = [];
  const colors: number[] = [];
  const tone = new T.Color();
  const triangle = (a: number[], b: number[], c: number[], band: number, side: number) => {
    vertices.push(...a, ...b, ...c);
    const covered = snow && band >= 2;
    tone.setHex(covered ? 0xe4edf3 : color).multiplyScalar(.89 + .17 * Math.sin(side * 2.25 + x));
    for (let i = 0; i < 3; i++) colors.push(tone.r, tone.g, tone.b);
  };
  for (let i = 0; i < ringSize; i++) {
    const next = (i + 1) % ringSize;
    for (let band = 0; band < rings.length - 1; band++) {
      const lower = rings[band];
      const upper = rings[band + 1];
      triangle(lower[i], upper[i], lower[next], band, i);
      triangle(lower[next], upper[i], upper[next], band, i);
    }
    triangle(rings[3][i], peak, rings[3][next], 3, i);
  }
  const mesh = new T.BufferGeometry();
  mesh.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
  mesh.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  mesh.computeVertexNormals();
  parent.add(new T.Mesh(mesh, new T.MeshStandardMaterial({ vertexColors: true, roughness: 1 })));
}

export function trailLandscape(scene: T.Scene) {
  const landscape = new T.Group();
  landscape.name = 'Overlook landscape';
  scene.add(landscape);

  function terrainAxis(start: number, bands: [end: number, segments: number][]) {
    const samples = [start];
    for (const [end, segments] of bands) {
      const from = samples[samples.length - 1];
      for (let i = 1; i <= segments; i++) samples.push(T.MathUtils.lerp(from, end, i / segments));
    }
    return samples;
  }
  // Keep the shoreline and path edges crisp, with fewer triangles in the distant terrain.
  const columns = terrainAxis(-66, [[-24, 21], [24, 160], [66, 21]]);
  const rows = terrainAxis(-75, [[-9, 33], [19, 94], [61, 21]]);
  const ground = new T.PlaneGeometry(1, 1, columns.length - 1, rows.length - 1);
  ground.rotateX(-Math.PI / 2);
  const groundPositions = ground.attributes.position;
  const groundColors: number[] = [];
  const meadow = new T.Color(0x75855a);
  const grass = new T.Color(0x596f50);
  const dirt = new T.Color(0xbfa47b);
  const sand = new T.Color(0xa9aa83);
  const color = new T.Color();
  const pathMask = trailMask();
  for (let i = 0; i < groundPositions.count; i++) {
    const x = columns[i % columns.length], z = rows[Math.floor(i / columns.length)];
    groundPositions.setXYZ(i, x, trailHeight(x, z), z);
    const variation = .50 + .30 * Math.sin(x * .4 + z * .34) * Math.cos(z * .39 - x * .28);
    const shore = lakeDistance(x, z);
    color.copy(grass).lerp(meadow, variation);
    color.lerp(sand, T.MathUtils.smoothstep(shore, .64, .85) * (1 - T.MathUtils.smoothstep(shore, .94, 1.15)));
    if (!pathMask) color.lerp(dirt, 1 - T.MathUtils.smoothstep(pathDistance(x, z), .95, 1.28));
    groundColors.push(color.r, color.g, color.b);
  }
  ground.setAttribute('color', new T.Float32BufferAttribute(groundColors, 3));
  ground.computeVertexNormals();
  const groundMaterial = new T.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  if (pathMask) {
    groundMaterial.onBeforeCompile = shader => {
      shader.uniforms.trailMask = { value: pathMask };
      shader.uniforms.trailDirt = { value: dirt };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vTrailUv;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vTrailUv = vec2((position.x - (${pathRegion.left.toFixed(1)})) / ${pathRegion.width.toFixed(1)}, 1.0 - position.z / ${pathRegion.depth.toFixed(1)});`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vTrailUv;\nuniform sampler2D trailMask;\nuniform vec3 trailDirt;')
        .replace('#include <color_fragment>', `#include <color_fragment>
          diffuseColor.rgb = mix(diffuseColor.rgb, trailDirt, texture2D(trailMask, vTrailUv).a);`);
    };
  }
  landscape.add(new T.Mesh(ground, groundMaterial));

  const waterMaterial = new T.MeshStandardMaterial({ color: 0x5c9ea5, roughness: .54, emissive: 0x234d65 });
  const daylightWater = new T.Color(0x6eabb1);
  const waterShape = new T.CircleGeometry(1, 96).scale(lake.width * 1.025, lake.depth * 1.025, 1);
  const water = new T.Mesh(waterShape, waterMaterial);
  water.rotation.x = -Math.PI / 2;
  water.position.set(lake.x, lake.level, lake.z);
  landscape.add(water);
  const ripplePositions: number[] = [];
  for (const [x, z, length] of [[7.9,7.94,.86],[9.7,7.51,.70],[11.8,8.20,1.14],[8.65,9.50,1.26],[12.08,9.31,.69],[10.8,10.54,.99],[13.5,9.92,.74]]) {
    const y = lake.level + .014;
    ripplePositions.push(x - length / 2, y, z, x + length / 2, y, z);
  }
  const rippleGeometry = new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(ripplePositions, 3));
  const ripples = new T.LineSegments(rippleGeometry, new T.LineBasicMaterial({ color: 0xbfe7e1, transparent: true, depthWrite: false }));
  landscape.add(ripples);

  for (const [x, z, width, height, tint] of [
    [-38,-38,15,17,0x688ba1], [-22,-36,13,16,0x748a9c], [-8,-40,17,23,0x768ca6],
    [8,-42,17,22,0x74889d], [23,-37,15,19,0x647f93], [40,-39,17,19,0x6c8599],
    [-28,-23,16,8,0x567b76], [-10,-23,13,7,0x658279], [7,-24,14,9,0x628277], [24,-23,13,7,0x507872],
  ]) ridge(landscape, x, z, width, height >= 16 ? height * .86 : height, tint, height >= 16);

  const trunks: Prop[] = [];
  const pines: Prop[] = [];
  const stones: Prop[] = [];
  const leaves: Prop[] = [];
  const grasses: Prop[] = [];
  let seed = 137;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  function tree(x: number, z: number, height: number, aspen: boolean) {
    const y = trailHeight(x,z);
    trunks.push({ x, y: y + height * .31, z, width: .095, height: height * .62, depth: .095, color: aspen ? 0xc1b5a0 : 0x725e4b });
    if (aspen) {
      leaves.push({ x, y: y + height * .77, z, width: height * .24, height: height * .31, depth: height * .23, color: 0xc2b555 });
      leaves.push({ x: x + .37, y: y + height * .69, z: z + .15, width: height * .19, height: height * .22, depth: height * .17, color: 0xa3a654 });
      return;
    }
    for (let tier = 0; tier < 3; tier++) {
      const width = height * (.32 - tier * .055);
      pines.push({ x, y: y + height * (.43 + tier * .21), z, width, height: height * .56, depth: width,
        color: [0x31564a, 0x406753, 0x537855][tier], yaw: x + tier * .48 });
    }
  }

  for (let i = 0; i < 65; i++) {
    const x = (random() - .5) * 91;
    const z = -8.6 - random() * 12;
    tree(x, z, 1.45 + random() * 2.65, i % 5 === 0);
  }
  for (const [x, z] of [[-19,7.15],[-15.5,10.5],[-12.4,13.2],[-8.9,15.3],[-3.4,16.6],[3.75,16.3],[17.35,15.7],[23.4,8.7]]) {
    tree(x, z, 1.85 + random() * 1.30, x === -12.4 || x === 17.35);
  }
  for (const [x, z] of [[-9,-5.6],[-5.8,-7.1],[6.8,-6],[9.6,-5.9],[13,-6.7]]) tree(x,z,2.9,true);
  for (const [x,z] of [[-16,5.6],[-10.2,6.1],[-4.45,6.7],[2,6.1],[3.6,12.9],[9.2,14.95],[14.3,11.85],[17.35,10.5],[19.85,7.55]]) {
    const y = trailHeight(x,z);
    for (let i = 0; i < 3; i++) {
      const width = .19 + random() * .28;
      stones.push({ x: x + (random() - .5) * 1.3, y: y + width * .26, z: z + (random() - .5) * .65,
        width, height: width * .62, depth: width * .78, color: i % 2 ? 0x88867c : 0x99917d, yaw: random() * 6 });
    }
  }
  for (const [x,z] of [[-13.2,5.5],[-7.3,5.5],[-4.0,9.1],[-1.9,6.2],[1.9,6.7],[5.5,15.5],[14.7,12.1],[19.9,10.2]]) {
    const y = trailHeight(x,z);
    leaves.push({ x, y: y + .19, z, width: .49, height: .34, depth: .35, color: 0x53714b },
      { x: x + .32, y: y + .15, z: z + .18, width: .31, height: .22, depth: .30, color: 0x73834a });
  }
  for (let i = 0; i < 310; i++) {
    const x = -26 + random() * 53;
    const z = -7.7 + random() * 26;
    const dist = pathDistance(x,z);
    if (dist < 1.1 || lakeDistance(x,z) < .97) continue;
    const y = trailHeight(x,z);
    const height = .13 + random() * .24;
    const wildflower = i % 6 === 0 && z > 1.2;
    grasses.push({ x, y: y + height * .37, z, width: .12, height, depth: .12, color: i % 3 ? 0x6c8a49 : 0x91a163, yaw: random() * 6 });
    if (wildflower) leaves.push({ x, y: y + height * .75, z, width: .056, height: .032, depth: .059, color: i % 2 ? 0xebc865 : 0xaa8cbb });
  }
  instances(landscape, new T.CylinderGeometry(.72, 1, 1, 6), trunks);
  instances(landscape, new T.ConeGeometry(1, 1, 7), pines);
  const rounded = new T.IcosahedronGeometry(1, 0);
  instances(landscape, rounded, leaves);
  instances(landscape, rounded, stones);
  instances(landscape, new T.ConeGeometry(1, 1, 3), grasses);

  const fence: Prop[] = [];
  for (let x = -61.2; x <= 61.21; x += 1.8) fence.push({ x, y: .36, z: overlookFence, width: .13, height: .76, depth: .13, color: 0x715744 });
  for (const y of [.28,.58]) fence.push({ x: 0, y, z: overlookFence, width: 123.2, height: .078, depth: .11, color: 0x9a7451 });
  instances(landscape, new T.BoxGeometry(1,1,1), fence);

  return {
    obstacles: Array.from({ length: 10 }, (_, index) => {
      // Use the widest water cross-section within each strip to keep the shoreline dry underfoot.
      const back = lake.z + (index / 10 * 2 - 1) * lake.depth * .90;
      const front = back + lake.depth * .18;
      const offset = back <= lake.z && front >= lake.z ? 0 : Math.min(Math.abs(back - lake.z), Math.abs(front - lake.z));
      const width = lake.width * Math.sqrt(.91 ** 2 - (offset / lake.depth) ** 2);
      return { left: lake.x - width, right: lake.x + width, back, front };
    }),
    setLight(light: number) {
      waterMaterial.color.setHex(0x335374).lerp(daylightWater, light);
      waterMaterial.emissiveIntensity = .29 - light * .20;
      ripples.material.opacity = .18 + light * .31;
    },
  };
}
