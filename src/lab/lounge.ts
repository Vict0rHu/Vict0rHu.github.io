import * as T from 'three';

const screenLight = [
  { color: new T.Color(0x90caef), intensity: 250 },
  { color: new T.Color(0x637ec2), intensity: 165 },
  { color: new T.Color(0xeaba9b), intensity: 290 },
  { color: new T.Color(0xb1d6de), intensity: 210 },
];

function beanbagPoint(point: T.Vector3) {
  const { x, y, z } = point;
  const angle = Math.atan2(z, x);
  const fold = 1 + (Math.sin(angle * 3 + .6) * .046 + Math.cos(angle * 5) * .017) * (1 - Math.abs(y));
  const top = Math.max(0, y);
  const hollow = top * Math.exp(-((x / .51) ** 2 + ((z - .29) / .60) ** 2));
  const back = T.MathUtils.smoothstep(-z, .06, .83) * T.MathUtils.smoothstep(y, -.16, .72);
  return point.set(
    x * .87 * fold,
    Math.max(.04, .28 + y * .3 - z * .085 - hollow * .25 + back * .48),
    z * .8 * fold,
  );
}

export function lounge(scene: T.Scene, x: number, z: number, frontWallZ: number) {
  const facing = -Math.PI / 10;
  const forward = new T.Vector3(Math.sin(facing), 0, Math.cos(facing));
  const center = new T.Vector3(x, 0, z);
  const seatDepth = 1.04;
  const geometry = new T.SphereGeometry(1, 36, 24);
  const positions = geometry.attributes.position;
  const point = new T.Vector3();
  for (let i = 0; i < positions.count; i++) {
    beanbagPoint(point.fromBufferAttribute(positions, i));
    positions.setXYZ(i, point.x, point.y, point.z);
  }
  geometry.computeVertexNormals();
  const beanbag = new T.Mesh(geometry, new T.MeshStandardMaterial({ color: 0x74755d, roughness: 1 }));
  beanbag.position.copy(center);
  beanbag.rotation.y = facing;
  scene.add(beanbag);

  const seamPoints = Array.from({ length: 48 }, (_, i) => {
    const angle = i * 2 * Math.PI / 48;
    const height = .035 - .11 * Math.sin(angle);
    const radius = Math.sqrt(1 - height ** 2);
    return beanbagPoint(new T.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius));
  });
  const seam = new T.CatmullRomCurve3(seamPoints, true);
  beanbag.add(new T.Mesh(new T.TubeGeometry(seam, 64, .01, 5, true),
    new T.MeshStandardMaterial({ color: 0x646550, roughness: 1 })));

  const glow = new T.SpotLight(0x90caef, 0, 8.5, .53, .74);
  glow.position.set(x + (frontWallZ - z) * forward.x / forward.z, 1.58, frontWallZ);
  glow.target.position.copy(center).y = .71;
  scene.add(glow, glow.target);
  let age = 0;

  return {
    seat: center.clone().addScaledVector(forward, -seatDepth),
    seatDepth,
    facing,
    forward,
    obstacle: { left: x - .88, right: x + .88, back: z - .82, front: z + .82 },
    update(power: boolean, seconds: number, reduceMotion: boolean) {
      if (!power) {
        glow.intensity = 0;
        age = 0;
        return;
      }
      age = reduceMotion ? 0 : age + seconds;
      const shot = age / 1.45;
      const index = Math.floor(shot);
      const blend = T.MathUtils.smoothstep(shot - index, .64, 1);
      const current = screenLight[index % screenLight.length];
      const next = screenLight[(index + 1) % screenLight.length];
      glow.color.copy(current.color).lerp(next.color, blend);
      glow.intensity = T.MathUtils.lerp(current.intensity, next.intensity, blend);
    },
  };
}
