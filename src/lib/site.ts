// Site-wide constants and helpers.

const name = 'Victor Hu';
const publicationName = 'Jyun-Chi Hu';

export const SITE = {
  name,
  publicationName,
  profileImage: '/assets/img/my-profile-img.jpg',
  title: `${name} (${publicationName}) — Robotics Engineer`,
  description:
    `${name} (${publicationName}), Purdue robotics graduate student and AMD research associate. Projects in tactile robot learning, optical inspection, and teleoperation.`,
  email: 'hu1148@purdue.edu',
  // Set the path to a PDF under public/assets/ to link to it from the Résumé navigation.
  resume: '',
  socials: {
    github: 'https://github.com/Vict0rHu',
    linkedin: 'https://www.linkedin.com/in/jyunchihu/',
  },
  defaultOgImage: '/assets/img/og-cover.jpg',
  // Leave empty to disable analytics. Runs only in production builds.
  gaMeasurementId: 'G-XFJMCF5LXW',
};

export function personStructuredData(site: URL) {
  const homepage = new URL(withBase('/'), site);

  return {
    '@type': 'Person',
    '@id': new URL('#person', homepage).href,
    name: SITE.publicationName,
    alternateName: SITE.name,
    jobTitle: 'Robotics Engineer',
    url: homepage.href,
    image: new URL(withBase(SITE.profileImage), site).href,
    affiliation: { '@type': 'CollegeOrUniversity', name: 'Purdue University' },
    sameAs: [SITE.socials.linkedin, SITE.socials.github],
  };
}

/**
 * Recent news / milestones, newest first. `url` is optional and may be an
 * internal path (e.g. "/portfolio/...") or a full external URL. To add an
 * update, prepend one line here.
 */
export const NEWS: { date: string; text: string; url?: string }[] = [
  {
    date: '2026',
    text: 'Presented CONTACT at IROS 2026',
    url: '/portfolio/visuotactile-diffusion-policy/',
  },
  {
    date: 'Aug 2026',
    text: 'Joined AMD as a Research Associate',
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
