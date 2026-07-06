// Site-wide constants and helpers.

export const SITE = {
  name: 'Victor Hu',
  title: "Victor Hu's Portfolio",
  tagline: 'Robotics · Mechatronics · Embedded Systems',
  description:
    'Victor Hu, robotics engineer focused on perception and control. M.S. Robotics at Purdue; AI & Robotics Intern at Factory Intelligence. Work spans imitation learning, tactile–visual sensor fusion, ROS2, simulation, and embedded systems.',
  email: 'hu1148@purdue.edu',
  location: 'West Lafayette, IN',
  currentRole: 'AI & Robotics Intern @ Factory Intelligence',
  // Drop a PDF in public/assets/ and set its path here to show the
  // "Download Résumé" button (left empty = button hidden).
  resume: '',
  socials: {
    instagram: 'https://www.instagram.com/_victor0301/',
    github: 'https://github.com/Vict0rHu',
    linkedin: 'https://www.linkedin.com/in/jyunchihu/',
  },
  defaultOgImage: '/assets/img/my-profile-img.jpg',
  // Google Analytics 4 Measurement ID, looks like "G-XXXXXXXXXX".
  // Get it from analytics.google.com → Admin → Data Streams → your web stream.
  // Leave empty to disable. Only loads in production builds (dev visits ignored).
  gaMeasurementId: 'G-XFJMCF5LXW',
};

/**
 * Recent news / milestones, newest first. `url` is optional and may be an
 * internal path (e.g. "/portfolio/...") or a full external URL. To add an
 * update, prepend one line here.
 */
export const NEWS: { date: string; text: string; url?: string }[] = [
  {
    date: 'Jun 2026',
    text: 'CONTACT accepted to IEEE/RSJ IROS 2026',
    url: '/portfolio/visuotactile-diffusion-policy/',
  },
  {
    date: 'May 2026',
    text: 'Joined Factory Intelligence as an AI & Robotics Intern',
  },
  {
    date: 'Apr 2026',
    text: '2nd place (Microsoft Track) and 3rd (Best Use of AMD) at StarkHacks 2026',
    url: '/portfolio/starkhacks-2026/',
  },
  {
    date: 'Aug 2025',
    text: 'Began M.S. in Robotics at Purdue University',
  },
];

/**
 * Prefix a path with the configured `base` so links/assets work whether the
 * site is served from '/' (user page) or '/sub/' (project page).
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}
