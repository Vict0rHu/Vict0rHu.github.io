import { framedPoster } from './framed-poster';
import { posterPrints } from './content';

type Ink = CanvasRenderingContext2D;
type Point = readonly [number, number];
const navy = '#263a54';

function line(ink: Ink, points: readonly Point[], color: string, width: number) {
  ink.beginPath();
  points.forEach(([x, y], i) => i ? ink.lineTo(x, y) : ink.moveTo(x, y));
  ink.strokeStyle = color;
  ink.lineWidth = width;
  ink.stroke();
}

function dot(ink: Ink, x: number, y: number, radius: number, color: string) {
  ink.fillStyle = color;
  ink.beginPath();
  ink.arc(x, y, radius, 0, Math.PI * 2);
  ink.fill();
}

function arm(ink: Ink, joints: readonly Point[], width: number) {
  ink.lineCap = 'round';
  line(ink, joints, navy, width + 5);
  line(ink, joints, '#f0f0e9', width);
  for (const [x, y] of joints) dot(ink, x, y, width * .6, navy);
}

function contact(ink: Ink) {
  ink.fillStyle = '#829b93';
  ink.fillRect(58, 151, 396, 248);
  ink.fillStyle = '#f1eee5';
  ink.fillRect(54, 399, 404, 15);
  ink.fillStyle = navy;
  ink.fillRect(280, 385, 72, 15);
  arm(ink, [[316, 382], [310, 303], [235, 211], [139, 268], [139, 318]], 25);
  // Parallel jaws approach one fixture; the lifted part sits between them.
  line(ink, [[119, 321], [119, 349]], navy, 11);
  line(ink, [[159, 321], [159, 349]], navy, 11);
  ink.fillStyle = '#447f9a';
  ink.fillRect(130, 330, 18, 23);
  ink.fillStyle = '#c1d3c9';
  ink.fillRect(92, 382, 96, 16);
  ink.fillStyle = navy;
  ink.fillRect(121, 369, 36, 15);
  line(ink, [[139, 358], [139, 365]], '#447f9a', 2);

  // An illustrative tactile vector field, rather than invented results.
  ink.fillStyle = navy;
  ink.fillRect(341, 167, 104, 125);
  ink.fillStyle = '#e8e2d3';
  ink.font = 'bold 13px sans-serif';
  ink.fillText('TOUCH', 393, 188);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const x = 355 + col * 23;
      const y = 208 + row * 21;
      const dx = (col - 1.5) * 4;
      const dy = (row - 1.5) * 3;
      line(ink, [[x, y], [x + dx, y + dy]], '#8dd3bf', 2);
      dot(ink, x + dx, y + dy, 2, '#edc58e');
    }
  }
}

function teleoperation(ink: Ink) {
  // Oversized headset, with a rear strap and two lenses in a dark visor.
  ink.strokeStyle = '#9d7058';
  ink.lineWidth = 18;
  ink.beginPath();
  ink.ellipse(253, 216, 144, 58, -.1, 0, Math.PI * 2);
  ink.stroke();
  ink.fillStyle = '#f0ece3';
  ink.beginPath();
  ink.roundRect(106, 191, 295, 113, 37);
  ink.fill();
  ink.fillStyle = navy;
  ink.beginPath();
  ink.roundRect(125, 211, 257, 72, 25);
  ink.fill();
  for (const x of [192, 315]) {
    dot(ink, x, 247, 22, '#7095a0');
    dot(ink, x - 5, 242, 8, '#c5d9d7');
  }
  // Two ring controllers drive the small robot shown on the right.
  for (const x of [112, 209]) {
    ink.strokeStyle = '#f0ece3';
    ink.lineWidth = 12;
    ink.beginPath();
    ink.ellipse(x, 352, 24, 21, -.3, 0, Math.PI * 2);
    ink.stroke();
    line(ink, [[x + 4, 367], [x + 12, 407]], '#f0ece3', 18);
    dot(ink, x + 2, 351, 7, navy);
  }
  ink.save();
  ink.setLineDash([5, 7]);
  line(ink, [[251, 366], [291, 366]], '#9d7058', 3);
  ink.restore();
  line(ink, [[282, 359], [291, 366], [282, 373]], '#9d7058', 3);
  ink.fillStyle = navy;
  ink.fillRect(363, 414, 57, 12);
  arm(ink, [[391, 411], [388, 365], [346, 334], [316, 367]], 14);
  line(ink, [[307, 372], [307, 389]], navy, 6);
  line(ink, [[324, 372], [324, 389]], navy, 6);
}

function inspection(ink: Ink) {
  // Front monitor, camera gantry and pull-out tray match the AOI memory.
  ink.fillStyle = '#33404f';
  ink.fillRect(108, 149, 297, 262);
  ink.fillStyle = '#182533';
  ink.fillRect(122, 162, 269, 111);
  ink.fillStyle = '#eee9da';
  ink.fillRect(137, 177, 239, 79);
  ink.fillStyle = '#bfa15c';
  ink.fillRect(145, 185, 223, 14);
  ink.fillStyle = '#8db4a0';
  ink.fillRect(145, 208, 126, 37);
  ink.fillStyle = '#536774';
  ink.fillRect(280, 208, 88, 37);
  line(ink, [[140, 294], [374, 294]], '#93a5aa', 9);
  ink.fillStyle = '#e1e5e1';
  ink.fillRect(244, 282, 29, 30);
  dot(ink, 259, 310, 9, '#182533');
  ink.fillStyle = '#a2b5ba';
  ink.fillRect(126, 328, 264, 105);
  ink.fillStyle = '#dae4de';
  ink.fillRect(135, 340, 246, 82);
  for (const [x, y] of [[155, 349], [276, 349], [155, 387], [276, 387]]) {
    ink.fillStyle = '#879b9f';
    ink.fillRect(x, y, 81, 27);
    ink.fillStyle = 'rgba(231, 246, 242, .75)';
    ink.fillRect(x + 5, y + 3, 71, 18);
    for (const [i, color] of ['#bd706f', '#658db3', '#7ca88b'].entries()) {
      ink.fillStyle = color;
      ink.fillRect(x + 6 + i * 24, y + 22, 21, 3);
      ink.strokeStyle = color;
      ink.lineWidth = 2;
      ink.beginPath();
      ink.ellipse(x + 40, y + 12, 23 - i * 6, 8 - i * 2, -.2, 0, Math.PI * 2);
      ink.stroke();
    }
  }
  ink.fillStyle = '#798b92';
  ink.fillRect(126, 433, 264, 10);
}

const illustrations = { poster: contact, teleopPoster: teleoperation, aoiPoster: inspection };

export function projectPoster(id: keyof typeof posterPrints, width: number) {
  const print = posterPrints[id];
  return framedPoster(width, ink => {
    ink.textAlign = 'center';
    ink.fillStyle = navy;
    print.title.forEach((title, i) => {
      ink.font = `bold ${i ? 30 : 39}px sans-serif`;
      ink.fillText(title, 256, 57 + i * 38, 440);
    });
    ink.fillStyle = print.accent;
    ink.fillRect(36, 113, 440, 5);
    ink.fillStyle = print.paper;
    ink.fillRect(36, 136, 440, 320);
    ink.save();
    illustrations[id](ink);
    ink.restore();
    ink.fillStyle = navy;
    ink.font = 'bold 18px sans-serif';
    ink.fillText(print.caption, 256, 509, 440);
  });
}
