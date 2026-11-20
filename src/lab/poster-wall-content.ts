import type { MemoryScene } from './content';

type PosterEntry = {
  id: string;
  title: string;
  column: number;
  row: number;
} & ({ art: 'poster' | 'teleopPoster' | 'aoiPoster' | 'unr'; memory: MemoryScene } |
  { art: 'placeholder'; heading: readonly [string, string] });

/** Add a slot here to extend both the physical wall and its browser. */
export const wallPosters = [
  { id: 'contact', title: 'CONTACT Research', column: 0, row: 0, art: 'poster', memory: 'memory' },
  { id: 'teleop', title: 'Egocentric Teleoperation', column: 1, row: 0, art: 'teleopPoster', memory: 'teleop' },
  { id: 'aoi', title: 'AI Photoelastic Inspection', column: 2, row: 0, art: 'aoiPoster', memory: 'aoi' },
  { id: 'factory', title: 'Factory Robotics', column: 0, row: 1, art: 'placeholder', heading: ['FACTORY', 'ROBOTICS'] },
  { id: 'unr', title: 'UNR Exchange', column: 1, row: 1, art: 'unr', memory: 'unr' },
  { id: 'control', title: 'Electronic Control', column: 2, row: 1, art: 'placeholder', heading: ['ELECTRONIC', 'CONTROL'] },
  { id: 'qa', title: 'QA Internship', column: 1, row: 2, art: 'placeholder', heading: ['QA', 'INTERNSHIP'] },
] as const satisfies readonly PosterEntry[];

export const posterWallCopy = { title: 'Memories', enter: 'Enter memory', pending: 'Coming later' };
export type PosterDirection = 'up' | 'down' | 'left' | 'right';
export const posterPosition = (index: number) => {
  const entry = wallPosters[index];
  return { x: -.91 + entry.column * .96, y: 2.91 - entry.row, z: -4.515 };
};

/** Prefer the same row/column; at a missing slot, choose the nearest neighbor. */
export function adjacentPoster(index: number, direction: PosterDirection) {
  const origin = wallPosters[index];
  const horizontal = direction === 'left' || direction === 'right';
  const sign = direction === 'left' || direction === 'up' ? -1 : 1;
  const candidates = wallPosters.map((entry, i) => {
    const dx = entry.column - origin.column;
    const dy = entry.row - origin.row;
    return { i, forward: (horizontal ? dx : dy) * sign, across: Math.abs(horizontal ? dy : dx) };
  }).filter(entry => entry.forward > 0);
  candidates.sort((a, b) => (a.forward + a.across * 3) - (b.forward + b.across * 3));
  return candidates[0]?.i ?? index;
}
