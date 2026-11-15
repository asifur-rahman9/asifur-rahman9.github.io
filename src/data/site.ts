// Single source of truth for page content. Edit this file to update the site.

export const site = {
  name: 'Asifur Rahman',
  title: 'Asifur Rahman, backend and platform developer',
  description:
    'Final-year CS (Co-op) at Concordia, two co-op terms at BMO Capital Markets on platform and infrastructure. Open to 2027 SWE internships and new grad roles.',
  url: 'https://asifur-rahman9.github.io',
  email: 'asifur970@gmail.com',
  schoolEmail: 'asifur.rahman@mail.concordia.ca',
  github: 'https://github.com/asifur-rahman9',
  linkedin: 'https://linkedin.com/in/asifurrahman7',
  // Drop your PDF at public/resume.pdf and set this to '/resume.pdf' to show the button.
  resume: null as string | null,
  status: 'Looking for 2027 internships and new grad roles',
};

export type Project = {
  id: string;
  hash: string;
  date: string;
  title: string;
  summary: string;
  body: string;
  part?: string;
  stack: string[];
  metrics: { value: string; label: string }[];
  badges: string[];
  image: string;
  imageAlt: string;
  repo: string;
};

export const projects: Project[] = [
  {
    id: 'bixi',
    hash: '685f84d',
    date: 'Jun 2025 to now',
    title: 'BIXI Station Monitor',
    summary: 'Live dock availability and stock-out forecasts for Montreal bike share',
    body: "Pulls every station from BIXI's live GBFS feed and joins hourly weather forecasts to predict departures and arrivals for the next 48 hours. A 6-hour risk board flags busy stations about to run out of bikes or docks. Falls back to the last good data when an upstream API is down.",
    stack: ['Python', 'scikit-learn', 'Streamlit', 'pytest', 'Docker', 'uv'],
    metrics: [
      { value: '31%', label: 'lower MAE than best baseline' },
      { value: '256,800', label: 'station-hours of real 2025 trips' },
      { value: '48 h', label: 'weather-aware forecast window' },
    ],
    badges: ['CI', 'Docker', 'Tests'],
    image: '/media/bixi.webp',
    imageAlt: 'Map of BIXI stations colored by bike availability',
    repo: 'https://github.com/asifur-rahman9/bike-station-monitor',
  },
  {
    id: 'booking',
    hash: 'd4d4a0d',
    date: 'Dec 2024 to now',
    title: 'Service booking platform',
    summary: 'Full-stack booking, invoicing and dashboards for local businesses',
    body: 'Customers search services, pick an open slot and request a booking. Businesses accept or decline, mark jobs complete, and invoices are generated automatically. Express REST API grouped by resource with Zod validation and a central error handler; React + TypeScript SPA with TanStack Query.',
    stack: ['TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Vitest'],
    metrics: [
      { value: '18', label: 'API tests on in-memory MongoDB' },
      { value: '5', label: 'REST resources' },
      { value: '2', label: 'roles with separate dashboards' },
    ],
    badges: ['Docker', 'Tests'],
    image: '/media/booking.webp',
    imageAlt: 'Service booking platform home page',
    repo: 'https://github.com/asifur-rahman9/service-booking-platform',
  },
  {
    id: 'engine',
    hash: 'cf88e38',
    date: 'Jul 2025 to now',
    title: 'Hammerfall Grove: C++ / OpenGL renderer',
    summary: 'Custom HDR renderer with shadows, bloom, instancing and IK',
    body: 'A first-person game on a custom C++17 / OpenGL renderer: shadow mapping with PCF, HDR with a bloom chain and ACES tone mapping, and GPU instancing. A mechanical arm tracks you with inverse kinematics and an AI state machine. Game logic lives in a library with no OpenGL dependency so it can be unit tested.',
    part: 'the two-joint arm, its IK and attack AI, the camera, and the project structure. Started with a partner, then rebuilt solo.',
    stack: ['C++17', 'OpenGL', 'GLSL', 'CMake', 'doctest'],
    metrics: [
      { value: '42', label: 'unit tests on engine-free game logic' },
      { value: '16,000', label: 'grass blades in 3 instanced draws' },
      { value: '16', label: 'dynamic point lights' },
    ],
    badges: ['CI', 'Tests'],
    image: '/media/hammerfall.webp',
    imageAlt: 'Mechanical hammer arm in a moonlit forest clearing',
    repo: 'https://github.com/asifur-rahman9/hammerfall-grove',
  },
];

export const minorProjects = [
  { hash: '684e586', title: 'NeetCode: DSA practice in Python', repo: 'neetcode-submissions' },
  { hash: '2fa4a91', title: 'Cell coverage analyzer: base station heatmaps', repo: 'cell-coverage-analyzer' },
  { hash: 'dbb5b1d', title: 'Heap from scratch in Java', repo: 'heap-implementation' },
];

// Toolbox, shown as a package.json. Keys are the JSON fields.
export const toolGroups: [string, string[]][] = [
  ['languages', ['Java', 'Python', 'TypeScript', 'SQL', 'C++', 'Bash']],
  ['backend', ['Spring Boot', 'Node.js', 'Express', 'React', 'JUnit', 'Pytest', 'Vitest']],
  ['cloudDevops', ['AWS', 'Jenkins', 'Ansible', 'Docker', 'GitHub Actions', 'Liquibase', 'Maven', 'Linux']],
  ['data', ['PostgreSQL', 'MongoDB', 'SQL Server', 'scikit-learn', 'OpenGL']],
];

export const usedIn: Record<string, string> = {
  Java: 'BMO, HEXA, Heap from scratch',
  Python: 'BIXI Station Monitor, Coverage analyzer, NeetCode',
  TypeScript: 'Service booking platform',
  SQL: 'BMO, HEXA',
  'C++': 'Hammerfall Grove',
  Bash: 'BMO, every repo here',
  'Spring Boot': 'BMO, HEXA',
  'Node.js': 'Service booking platform',
  Express: 'Service booking platform',
  React: 'HEXA, Service booking platform, this site',
  JUnit: 'BMO, HEXA',
  Pytest: 'BIXI Station Monitor',
  Vitest: 'Service booking platform, this site',
  AWS: 'BMO (Lambda, S3, Bedrock, Aurora)',
  Jenkins: 'BMO',
  Ansible: 'BMO',
  Docker: 'BIXI Station Monitor, Service booking platform',
  'GitHub Actions': 'BIXI Station Monitor, Hammerfall Grove, this site',
  Liquibase: 'BMO',
  Maven: 'BMO',
  Linux: 'BMO, everyday',
  PostgreSQL: 'BMO (Aurora)',
  MongoDB: 'Service booking platform',
  'SQL Server': 'BMO',
  'scikit-learn': 'BIXI Station Monitor',
  OpenGL: 'Hammerfall Grove',
};
