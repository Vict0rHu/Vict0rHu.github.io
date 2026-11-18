export const CONTACT_ID = 'visuotactile-diffusion-policy';
const contactTitle = 'CONTACT Research';

export const objects = {
  poster: { label: contactTitle, detail: 'A research poster about a robot learning to take things apart by feel.', action: 'Step into the memory' },
  teleopPoster: { label: 'Teleoperation poster', detail: 'The Franka and pan–tilt camera setup from the VR demo.', action: 'Step into the memory' },
  aoiPoster: { label: 'Optical inspection poster', detail: 'An optical inspection prototype from Victor’s time in Taiwan.', action: 'Step into the memory' },
  awards: { label: 'Trophy cabinet', detail: 'Awards from a few builds and competitions.' },
  printer: { label: '3D printer', detail: 'A half-finished bracket sits on the build plate.' },
  robotBench: { label: 'Robotics workbench', detail: 'A compact SO-101-style follower arm with a rotating base, articulated joints, and a two-finger gripper.' },
  bathroom: { label: 'Bathroom', detail: 'The little robot checks the sink. No leaks to report.' },
  bathroomDoor: { label: 'Bathroom door', detail: 'Victor usually closes it behind him.' },
  entryClock: { label: 'Knock' },
  terminal: { label: 'Running terminal', detail: 'A demo replay is still running on Victor’s laptop.' },
  backpack: { label: 'Victor’s backpack', detail: 'Empty. Not even a spare USB cable.' },
  victor: { label: 'Victor', detail: 'He glances over at the little robot.', action: 'Peek at his thoughts' },
  bed: { label: 'Hide under the covers' },
  dream: { label: 'Victor is asleep', detail: 'Completely out. The monitors haven’t bothered him either.', action: 'Peek at his dream' },
  elk: { label: 'Watch the elk', detail: 'The herd drifts across the meadow between bites of grass. The little robot stays on the trail.' },
  sasquatch: { label: 'Sasquatch', detail: 'He’s wearing a scarf. Apparently this makes him less terrifying.' },
  trailVictor: { label: 'Victor', detail: '“See the one by the aspen? It hasn’t moved in ten minutes.”' },
  mindPanda: { label: contactTitle },
  mindAoi: { label: 'AI Photoelastic Inspection' },
  mindTeleop: { label: 'Egocentric Teleoperation' },
  aoiInspection: { label: 'Run inspection', detail: 'Run a reconstructed imaging cycle on the four-position specimen tray.' },
  aoiVictor: { label: 'Victor', detail: '“Wait, who are you? …Well, since you’re here, want to see what I’m building?”', action: 'Ask about the project' },
  teleopVictor: { label: 'Victor', detail: '“Hey! I’m trying to move this part without taking off the headset. Want to see how it works?”', action: 'Ask about the project' },
  teleopPower: { label: 'Unplug power', detail: 'The cable powers the teleoperation rig.' },
  contactVictor: { label: 'Victor', detail: '“Hey! We’re recording demonstrations for CONTACT. Give me a second to park the arm.”', action: 'Ask about the research' },
} as const;

export const bedPrompts = { hide: objects.bed.label, nap: 'Nap beside Victor', exit: 'Hop out of bed' };

export const posterProjects = {
  poster: CONTACT_ID,
  teleopPoster: 'fpv-ptz-teleoperation',
  aoiPoster: 'aoi-ai-inspection',
} as const;

export const awardProjects = ['ntnu-mechatronics-capstone', 'gpm-ai-automation-award', 'starkhacks-2026'] as const;

export function daylightAt(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  const minutes = hour * 60 + minute;
  return { light: Math.max(0, Math.min(1, (minutes - 345) / 75, (1200 - minutes) / 120)),
    warmth: Math.max(0, Math.min(1, (minutes - 345) / 50, (540 - minutes) / 105)) };
}

export type ObjectId = keyof typeof objects;
export type MemoryEntry = 'victor' | 'dream';
export type RoomState = 'awake' | 'asleep' | 'away' | 'shower' | 'lounge';
export const memoryPortals = { mindPanda: 'memory', mindAoi: 'aoi', mindTeleop: 'teleop' } as const;
export type MindPortal = keyof typeof memoryPortals;
export type MemoryScene = typeof memoryPortals[MindPortal];
export type Destination = MemoryScene | 'trail' | 'mind';
export const posterMemories = { poster: 'memory', teleopPoster: 'teleop', aoiPoster: 'aoi' } as const satisfies Record<keyof typeof posterProjects, MemoryScene>;
export const memoryScenes = {
  memory: { title: contactTitle, objects: ['contactVictor'], project: CONTACT_ID },
  aoi: { title: 'AI Photoelastic Inspection', objects: ['aoiInspection', 'aoiVictor'], project: 'aoi-ai-inspection' },
  teleop: { title: 'Egocentric Teleoperation', objects: ['teleopVictor', 'teleopPower'], project: 'fpv-ptz-teleoperation' },
} as const;
export const mindObjects = Object.keys(memoryPortals) as MindPortal[];
export const memoryVictorDetails = {
  contactVictor: [
    '“I use the SpaceMouse to guide the Panda through each disassembly. My lab partner resets the fixture and moves the pieces around between takes.”',
    '“The front camera sees the whole fixture. The wrist camera moves with the gripper, so it can see things up close until the fingers get in the way.”',
    '“Those arrows visualize motion across the tactile sensor during contact. We compare using vision alone, using tactile RGB images, and using this tactile force field.”',
    '“The whiteboard shows an example of how we tally successful trials for each input.”',
  ],
  aoiVictor: [
  '“See those clear samples? Under polarized light, the patterns in them tell us about stress we can’t see with the naked eye.”',
  '“I built the motion and lighting controls into the firmware. At each stop, the camera takes a red, blue, and green exposure before moving on.”',
  '“The optical setup took a lot of CAD revisions. That printer made more test mounts than I care to count.”',
  '“I used OpenCV and an autoencoder with an MLP to estimate residual stress on edge hardware. The monitor shows what the system is doing as it runs.”',
  ],
  teleopVictor: [
    '“When I look left or tilt my head down, the camera does the same. The monitor mirrors what I see in the headset.”',
    '“The controller moves the gripper, and the trigger closes it. I’m testing whether I can move the part between those two pads using only the camera feed.”',
    '“I set workspace limits on the real Franka so the arm stays inside the safe working area while I’m teleoperating it.”',
  ],
} as const;

export const memoryDialogueClosing = {
  victor: '“If you’re curious, there’s more about it on my project page.”',
  robot: 'Thanks, got it!',
} as const;

export const teleopPowerThoughts = {
  confused: 'Huh? I just lost the video feed.',
  checking: 'Okay… power first. Did that come loose?',
};
export const trailObjects: ObjectId[] = ['elk', 'sasquatch', 'trailVictor'];
export const travelDestinations = [
  { id: 'room', name: 'Victor’s room', detail: 'Workbench and research memories' },
  { id: 'trail', name: 'Colorado foothills', detail: 'Elk overlook' },
] as const;
export type TravelDestination = typeof travelDestinations[number]['id'];

export const terminalLines = [
  '$ python replay_demo.py --scene panda',
  '[replay] camera frames ready',
  '[replay] tactile stream ready',
  '[replay] waiting for contact…',
  '[replay] contact frame received',
  '[replay] merging observations',
  '[replay] writing demo preview',
];

const denverClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'America/Denver', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export function denverNow(now: Date) {
  const parts = denverClock.formatToParts(now);
  const part = (type: string) => parts.find(entry => entry.type === type)?.value ?? '';
  return {
    minutes: Number(part('hour')) * 60 + Number(part('minute')),
    date: `${part('year')}.${part('month')}.${part('day')}`,
    weekday: part('weekday'),
    weekend: ['Sat', 'Sun'].includes(part('weekday')),
  };
}

export function formatTime(minutes: number) {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  return `${hours}:${String(minutes % 60).padStart(2, '0')}`;
}

export function roomSchedule(minutes: number, weekend: boolean): { state: RoomState; onTrail: boolean; lights: boolean } {
  const hour = Math.floor(minutes / 60);
  const away = hour >= 9 && hour < 20;
  const shower = (minutes >= 8 * 60 + 50 && minutes < 9 * 60) ||
    (minutes >= 21 * 60 && minutes < 21 * 60 + 10);
  const state = hour >= 3 && hour < 7 ? 'asleep' : away ? 'away' : shower ? 'shower' : hour >= 22 ? 'lounge' : 'awake';
  return { state, onTrail: away && weekend, lights: hour >= 20 || hour < 3 };
}

export const victorThoughts = {
  work: ['Let me ask Codex…', 'Did I launch the right ROS node?', 'One more replay, then a break.', 'That worked. Why did that work?'],
  posters: ['I still have the raw data for this.', 'That Panda demo took a few tries.'],
  awards: ['I should probably dust these.', 'We really did finish that in 36 hours.'],
  bathroom: ['Back in a minute.'],
  wash: ['Soap first. The bugs can wait.'],
  lostThought: ['Why does it feel like a little robot’s running laps in my head?'],
  interrupted: ['Hey! Can I get a little privacy?', 'Wait, did I forget to close the door?'],
  shower: ['I swear I do my best debugging in here.'],
  showerWarning: ['Hey, I’m in here! The duck and I need a minute.'],
  showerEscort: ['Whoa, back up! You’re about to get soaked.'],
  away: ['Laptop. Keys. Okay, let’s go.'],
  home: ['Home. I can finally put this laptop down.'],
  bed: ['I’ll debug it tomorrow. Probably.'],
  wake: ['What time is it?'],
  loungePhone: ['One more scroll. Then I’m putting this down.'],
  loungeTV: ['Wait, this is the episode I fell asleep halfway through.'],
  loungeWake: ['Huh? Did I miss anything?'],
  backToWork: ['Wait, it’s midnight already? I’ve gotta get back to work.'],
  bedSurprise: ['Whoa! How’d you get under there?'],
  wakeSurprise: ['Ah! Were you there all night?'],
} as const;

export const mindGuardThoughts = {
  patrol: '',
  investigate: 'Footprints? In here?',
  chase: 'Intruder detected!',
  cooling: 'My CPU’s overheating. You win this round.',
  caught: 'Busted. Sending you back to Victor’s room.',
} as const;

export const mindTerminalWindows = [
  { title: 'ROS / CORTEX', lines: [
    '$ ros2 topic echo /brain', '[ok] synapse stream online', 'seq=034  signal=0.87',
    'seq=035  signal=0.91', '[warn] thought loop detected', 'seq=036  signal=0.78',
  ] },
  { title: 'MEMORY REPLAY', lines: [
    '$ replay --from-memory', '[ok] loading tactile data', '[sync] frame 0284',
    '[sync] frame 0285', '[warn] unexpected coffee break', '[sync] frame 0286',
  ] },
  { title: 'THOUGHT BUFFER', lines: [
    '$ ls ~/unfinished-ideas', 'desk_v2  rocket_v9  coffee.py', '[warn] 47 tabs still open',
    '$ git stash -m "weekend"', '[ok] weekend saved', '[warn] weekend restored anyway',
  ] },
];

export const trailThoughts = {
  elk: [
    'Is that robot counting us again?',
    'Excellent grass. Five stars.',
    'These antlers are terrible for hide-and-seek.',
    'I walked over here and forgot why.',
  ],
  sasquatch: [
    'These woods get creepy after midnight.',
    'Did you hear that? Please say it was you.',
    'Why does everyone assume I like the dark?',
    'If we see a bear, you go first.',
  ],
} as const;
