export const unrTitle = 'UNR Exchange';
export const unrProject = 'ntnu-exchange-scholarship';
export const unrOrigin = { x: 0, z: 1.8 };
export const unrRadius = 23.8;
export const unrEntryHalfWidth = 1.15;
export const unrEntryLength = 11.4;
export const unrGraduationPhoto = {
  title: 'Graduation photo',
  src: '/assets/img/portfolio/ntnu-exchange-scholarship/cover.jpg',
  alt: 'Victor in a graduation gown beside the Nevada N at the University of Nevada, Reno.',
  reply: '“Here you go. You actually kept your eyes open for this one.”',
  location: 'UNR · Reno, Nevada',
};
export const unrExchangeClosing = '“There’s more about my semester in Reno on the exchange page, if you’re curious.”';
const third = Math.PI / 3;
export const unrMemories = [
  { id: 'balloons', angle: -third, x: -12.12, z: -5.2, sky: 0xe9b99a, ground: 0x9dA66c, light: 0xffba77 },
  { id: 'graduation', angle: 0, x: 0, z: -12.2, sky: 0xcbdfe9, ground: 0xa8b98c, light: 0xffeccf },
  { id: 'solar', angle: third, x: 12.12, z: -5.2, sky: 0xc5dfeb, ground: 0x9ab77e, light: 0xfff0dd },
] as const;
export type UnrMoment = typeof unrMemories[number]['id'];
/** Reserve the full entrance corridors, including space for branches and props. */
export function onUnrEntryPath(x: number, z: number, clearance = 0) {
  const dx = x - unrOrigin.x, dz = z - unrOrigin.z;
  if (Math.hypot(dx, dz) < 1.3 + clearance) return true;
  return unrMemories.some(({ angle }) => {
    const along = dx * Math.sin(angle) - dz * Math.cos(angle);
    const across = dx * Math.cos(angle) + dz * Math.sin(angle);
    return along >= 0 && along <= unrEntryLength && Math.abs(across) < unrEntryHalfWidth + clearance;
  });
}
/** Angular thirds share ground; only a narrow band at each seam loses its color. */
export function unrPresence(x: number, z: number) {
  const dx = x - unrOrigin.x, dz = z - unrOrigin.z;
  const radius = Math.hypot(dx, dz);
  const angle = Math.atan2(dx, -dz);
  const index = angle < -Math.PI / 6 ? 0 : angle > Math.PI / 6 ? 2 : 1;
  const seamDistance = radius * Math.min(Math.abs(Math.sin(angle - Math.PI / 6)), Math.abs(Math.sin(angle + Math.PI / 6)));
  const smooth = (value: number, low: number, high: number) => {
    const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
    return t * t * (3 - 2 * t);
  };
  const weight = smooth(radius, .9, 2.2) * smooth(seamDistance, .15, 1.65);
  return { index, weight: dz > .05 ? 0 : weight, radius, angle };
}
export function unrHeightAt(x: number, z: number) {
  const { index, weight } = unrPresence(x, z);
  if (index !== 0)
    return 0;
  const distance = Math.hypot(x - unrMemories[0].x, z - unrMemories[0].z - 1);
  const t = Math.max(0, Math.min(1, (distance - 3.25) / 3.8));
  return 1.12 * (1 - t * t * (3 - 2 * t)) * weight;
}
export function withinUnr(x: number, z: number) {
  const radius = Math.hypot(x - unrOrigin.x, z - unrOrigin.z);
  return radius <= unrRadius - .28 && (z <= unrOrigin.z || radius <= .94);
}
export const unrThoughts = {
  balloons: ['Worth getting up this early.', 'Okay, one more balloon. Then breakfast.', 'That one looks like it forgot where it parked.'],
  solar: ['Positive to positive. Let’s try that again.', 'Sunshine, wires, and a very patient lab partner.', 'Okay, the meter agrees with us.'],
  graduation: ['One more photo. I blinked.', 'Does this pose look normal?', 'I’m going to miss this place.'],
} as const;
export const unrGrassSpectators = [
  { x: -3.2, z: 2.8, yaw: .3, shirt: 0x85977f },
  { x: 3.5, z: -1.7, yaw: -.5, shirt: 0x9d7b8c },
  { x: -1.5, z: 4.2, yaw: .55, shirt: 0x9e8b65 },
  { x: -4.8, z: 4.2, yaw: -.9, shirt: 0x73909c },
];
export const unrLandmarkTrees = [
  { x: -6.2, z: -1.5, height: 3.2 }, { x: 5.9, z: -2.0, height: 3.1 },
  { x: -5.6, z: 5.3, height: 2.9 }, { x: 6.6, z: 4.6, height: 3.0 },
];
export const unrSeatedStudents = [
  { x: -5.5, z: -.9, yaw: .5, shirt: 0x7c9690 },
  { x: 6.4, z: -1.4, yaw: -.7, shirt: 0xad8477 },
  { x: -5.0, z: 5.8, yaw: 1.0, shirt: 0x8b859e },
  { x: 7.2, z: 5.1, yaw: -1.1, shirt: 0x9d996a },
];
export const unrSolarTrees = [
  { x: -6.8, z: -5.7, height: 3.1 }, { x: 6.8, z: -5.7, height: 3.2 },
  { x: -7.0, z: 6.3, height: 3.0 }, { x: 7.0, z: 6.3, height: 3.1 },
  { x: -10.3, z: 2.8, height: 2.8 }, { x: 10.4, z: 2.8, height: 2.8 },
];
export const unrLandmarkWalks = [
  { curved: true, points: [{ x: -10, z: 3.4 }, { x: -5.4, z: 2.8 }, { x: -3.3, z: 3.6 }, { x: 3.7, z: 3.9 }, { x: 7.0, z: 4.1 }, { x: 10, z: 5.8 }], speed: .83, phase: 2.3, shirt: 0x7e93a4 },
  { curved: true, points: [{ x: 10, z: -3.0 }, { x: 5.8, z: -2.8 }, { x: 2.8, z: -3.4 }, { x: -3.1, z: -3.0 }, { x: -6.4, z: -2.5 }, { x: -10, z: -1.5 }], speed: .96, phase: 11, shirt: 0xae856f },
  { curved: true, points: [{ x: -8, z: -4 }, { x: -5.4, z: -2.5 }, { x: -4.6, z: .5, pause: 3, lookX: 0, lookZ: 0 }, { x: -5.8, z: 3.8 }, { x: -8.5, z: 7 }], speed: .66, phase: 5.5, shirt: 0x8b88a1 },
  { curved: true, points: [{ x: 8.5, z: 7 }, { x: 5.9, z: 3.2 }, { x: 4.8, z: .7 }, { x: 6.5, z: -2.6, pause: 2, lookX: 1, lookZ: -6 }, { x: 10, z: -4 }], speed: .79, phase: 18, shirt: 0x7e9a7b },
];
export const unrSolarWalks = [
  { points: [{ x: -11, z: 5.8 }, { x: -4.4, z: 2.9 }, { x: 4.4, z: 2.9 }, { x: 11, z: 5.8 }], speed: .95, phase: 2, shirt: 0xad7d66 },
  { points: [{ x: 11, z: -5.8 }, { x: 4.4, z: -2.4 }, { x: -4.4, z: -2.4 }, { x: -11, z: -5.8 }], speed: 1.05, phase: 7, shirt: 0x6e8c9c },
  { points: [{ x: -10, z: -5.8 }, { x: -4.4, z: -2.4 }, { x: -2.7, z: -1.6, pause: 4, lookX: 0, lookZ: 0 }, { x: -4.8, z: 1.5 }, { x: -10, z: 5.8 }], speed: .8, phase: 12, shirt: 0x8a83a5 },
  { points: [{ x: 10, z: 5.8 }, { x: 4.4, z: 2.9 }, { x: 3.5, z: .7, pause: 5, lookX: 0, lookZ: 0 }, { x: 4.4, z: -2.4 }, { x: 10, z: -5.8 }], speed: .88, phase: 9, shirt: 0x9aab7a },
  { points: [{ x: -11, z: 0 }, { x: -5.2, z: 0 }, { x: -4.4, z: 2.9 }, { x: 4.4, z: 2.9 }, { x: 11, z: 5.8 }], speed: .91, phase: 5, shirt: 0xb29362 },
  { points: [{ x: 0, z: 12 }, { x: -2.5, z: 4.7 }, { x: -4.4, z: 2.9 }, { x: -11, z: 5.8 }], speed: .97, phase: 14, shirt: 0x688780 },
];
const solarDirections = [[-12, 0], [12, 0], [-11, -5.8], [11, -5.8], [-11, 5.8], [11, 5.8], [0, 12], [0, -9]] as const;
export const unrSolarPaths = solarDirections.map(([x, z]) => {
  const length = Math.hypot(x, z - .3);
  return [x / length * 36, .3 + (z - .3) / length * 36] as const;
});
export function onSolarPaving(x: number, z: number, clearance = .95) {
  const dz = z - .3;
  if (Math.hypot(x, dz) < 5.5)
    return true;
  return unrSolarPaths.some(([endX, endZ]) => {
    const az = endZ - .3, length = Math.hypot(endX, az), projection = (x * endX + dz * az) / length;
    return projection > 0 && projection < length + .3 && Math.abs(x * az - dz * endX) / length < clearance;
  });
}

/** Foreground, side and horizon balloons surround the picnic without ground obstacles. */
export const unrBalloonFlights = [
  { x: -2.6, y: 1.3, z: -2.2, size: 2.7, color: 0xe0b255, stripe: 0xf3dc92 },
  { x: 2.7, y: 2.4, z: -3.0, size: 2.15, color: 0x537fba, stripe: 0xc9c367 },
  { x: -5.7, y: 2.0, z: 4.9, size: 2.1, color: 0xb46c67, stripe: 0xf1c987 },
  { x: 5.8, y: 2.9, z: 5.3, size: 1.9, color: 0x65938a, stripe: 0xeadbaf },
  { x: 0, y: 3.5, z: 7.3, size: 1.65, color: 0xbc874b, stripe: 0xf3d992, travel: 7 },
  { x: -7.1, y: 3.6, z: -.2, size: 1.3, color: 0x8478a4, stripe: 0xd8c5df },
  { x: 7.0, y: 4.1, z: .8, size: 1.15, color: 0xbd7a60, stripe: 0xead3b1 },
  { x: .1, y: 3.7, z: -5.3, size: 1.05, color: 0xd37f71, stripe: 0xf5c986 },
  { x: -5.2, y: 4.6, z: -7.6, size: .85, color: 0x5c819d, stripe: 0xd5d9b0 },
  { x: 5.6, y: 3.5, z: -7.3, size: .95, color: 0xa27a98, stripe: 0xead5a7 },
  { x: -3.2, y: 3.5, z: -8.7, size: .54, color: 0x8f9d67, stripe: 0xc9dbbc },
  { x: .7, y: 3.2, z: -9.4, size: .50, color: 0x9b7ca8, stripe: 0xe2c997 },
  { x: 2.1, y: 4.1, z: -8.7, size: .48, color: 0xdba365, stripe: 0xe3caaf },
  ...Array.from({ length: 13 }, (_, i) => ({
    x: -11 + i * 1.85, y: 3.8 + Math.sin(i * 2.4) * 1.6,
    z: -12 - (i % 4) * 1.5, size: .24 + (i % 3) * .12,
    color: [0xc48a63, 0x6b8c9b, 0x9a839e, 0x9aab76][i % 4],
    stripe: 0xe8d6a9,
  })),
] satisfies { x: number; y: number; z: number; size: number; color: number; stripe: number; travel?: number }[];
