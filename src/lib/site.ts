// Site-wide constants and helpers.

export const SITE = {
  name: 'Victor Hu',
  title: "Victor Hu's Portfolio",
  tagline: 'Robotics Engineer | Infrastructure Builder | Problem Solver',
  description:
    'Victor Hu — Robotics software & infrastructure engineer. M.S. Robotics at Purdue. Projects in ROS2, simulation, internal tooling, and computer vision.',
  email: 'hu1148@purdue.edu',
  socials: {
    instagram: 'https://www.instagram.com/_victor0301/',
    github: 'https://github.com/Vict0rHu',
    linkedin: 'https://www.linkedin.com/in/jyunchihu/',
  },
  defaultOgImage: '/assets/img/my-profile-img.jpg',
};

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
