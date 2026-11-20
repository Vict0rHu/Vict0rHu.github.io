/** Reading order also sets the physical display order; article text stays in projects. */
export const awardDisplays = [
  { project: 'ntnu-mechatronics-capstone', work: 'smart-mfg-quality-prediction', shape: 'cup', results: 1 },
  { project: 'gpm-ai-automation-award', work: 'aoi-ai-inspection', shape: 'plaque', results: 1 },
  { project: 'starkhacks-2026', work: 'starkhacks-2026', shape: 'medals', results: 2 },
] as const;
export const awardPosition = (index: number) => ({ x: -4.04 + index * .72, y: 1.23, z: -4.02 });
export const awardsLayer = 2;
