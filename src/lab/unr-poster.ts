import { framedPoster } from './framed-poster';

/** A printed exchange keepsake, framed like the bedroom's project posters. */
export function unrPoster() {
  return framedPoster(.8, ink => {
    ink.fillStyle = '#263a54';
    ink.textAlign = 'center';
    ink.font = 'bold 39px sans-serif';
    ink.fillText('UNR EXCHANGE', 256, 66);
    ink.fillStyle = '#b47b53';
    ink.fillRect(36, 84, 440, 5);

    // Dawn over Reno: distant mountains and the balloon morning memory.
    ink.fillStyle = '#edc58e';
    ink.fillRect(36, 109, 440, 325);
    ink.fillStyle = '#f5dfac';
    ink.beginPath();
    ink.arc(387, 192, 47, 0, Math.PI * 2);
    ink.fill();
    ink.fillStyle = '#94a7a4';
    ink.beginPath();
    ink.moveTo(36, 316);
    for (const [x, y] of [[115, 242], [188, 309], [294, 228], [393, 302], [476, 257]]) ink.lineTo(x, y);
    ink.lineTo(476, 434);
    ink.lineTo(36, 434);
    ink.fill();
    for (const [x, y, scale, color] of [[106, 182, 1, '#b97959'], [425, 136, .55, '#617b89']] as const) {
      ink.save();
      ink.translate(x, y);
      ink.scale(scale, scale);
      ink.fillStyle = color;
      ink.beginPath();
      ink.ellipse(0, 0, 27, 35, 0, 0, Math.PI * 2);
      ink.fill();
      ink.strokeStyle = '#e8d6b8';
      ink.lineWidth = 6;
      ink.beginPath();
      ink.ellipse(0, 0, 12, 32, 0, 0, Math.PI * 2);
      ink.stroke();
      ink.strokeStyle = '#665448';
      ink.lineWidth = 2;
      ink.beginPath();
      ink.moveTo(-10, 30);
      ink.lineTo(-7, 46);
      ink.moveTo(10, 30);
      ink.lineTo(7, 46);
      ink.stroke();
      ink.fillStyle = '#83634c';
      ink.fillRect(-9, 44, 18, 12);
      ink.restore();
    }

    // Brick campus buildings sit behind the recognizable Nevada landmark.
    ink.fillStyle = '#ad785e';
    ink.fillRect(58, 344, 396, 90);
    ink.fillRect(355, 295, 70, 139);
    ink.fillStyle = '#d9c5a4';
    ink.fillRect(54, 337, 404, 9);
    ink.fillRect(351, 288, 78, 9);
    ink.fillStyle = '#466376';
    for (const x of [76, 112, 365, 401, 437]) {
      for (const y of [358, 394]) ink.fillRect(x, y, 17, 24);
    }
    ink.fillStyle = '#263a54';
    ink.fillRect(166, 222, 180, 212);
    ink.fillStyle = '#d4cbb9';
    ink.fillRect(148, 434, 216, 20);
    ink.font = 'bold 171px Georgia, serif';
    ink.lineJoin = 'round';
    ink.lineWidth = 9;
    ink.strokeStyle = '#f4f0e6';
    ink.strokeText('N', 256, 389);
    ink.fillStyle = '#263a54';
    ink.fillText('N', 256, 389);
    ink.fillStyle = '#263a54';
    ink.font = 'bold 23px sans-serif';
    ink.fillText('RENO, NEVADA', 256, 505);
  });
}
