// Single source of truth for page content. Edit this file to update the site.

export const site = {
  name: 'Asifur Rahman',
  title: 'Asifur Rahman · Backend & Platform Developer',
  description:
    'Final-year CS (Co-op) at Concordia, two co-op terms at BMO Capital Markets on platform and infrastructure. Open to 2027 SWE internships and new grad roles.',
  url: 'https://asifur-rahman9.github.io',
  email: 'asifur970@gmail.com',
  github: 'https://github.com/asifur-rahman9',
  linkedin: 'https://linkedin.com/in/asifurrahman7',
  // Drop your PDF at public/resume.pdf and set this to '/resume.pdf' to show the button.
  resume: null as string | null,
  status: 'Open to 2027 internships + new grad · MTL / TOR / remote',
};

export type Role = { title: string; dates: string; points: string[] };
export type Job = { org: string; team: string; roles: Role[]; stack: string[] };

export const experience: Job[] = [
  {
    org: 'BMO Capital Markets',
    team: 'Global Markets technology',
    roles: [
      {
        title: 'Software Developer Intern, Platform & Infrastructure Development',
        dates: 'May 2026 to Aug 2026',
        points: [
          'Built a Java tool comparing market data across Chrono and S3 with parallel downloads and streamed GZip parsing.',
          'Replaced an unmaintained REST library with an in-house implementation, unblocking platform-wide security upgrades.',
          'Prototyped dynamic data masking on Aurora PostgreSQL and presented the tradeoffs to the director.',
        ],
      },
      {
        title: 'Database Analyst Intern, Corporate DB / DevOps',
        dates: 'Sep 2025 to Apr 2026',
        points: [
          'Built an AI schema convention validator on AWS Lambda and Bedrock, wired into the CI/CD pipeline.',
          'Automated Liquibase database migrations through a Jenkins and Ansible pipeline.',
        ],
      },
    ],
    stack: ['Java', 'Spring Boot', 'AWS', 'PostgreSQL', 'Jenkins', 'Ansible', 'Liquibase'],
  },
  {
    org: 'HEXA',
    team: 'Software development internship',
    roles: [
      {
        title: 'Software Developer Intern',
        dates: '',
        points: ['Built features across Java/Spring Boot microservices and a React frontend.'],
      },
    ],
    stack: ['Java', 'Spring Boot', 'React', 'Microservices'],
  },
];

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

export const toolGroups: [string, string[]][] = [
  ['Languages', ['Java', 'Python', 'TypeScript', 'SQL', 'C++', 'JavaScript', 'Bash', 'C']],
  ['Backend & frameworks', ['Spring Boot', 'Node.js', 'Express', 'React', 'JUnit', 'Pytest', 'Vitest', 'scikit-learn', 'OpenGL']],
  ['Cloud & DevOps', ['AWS (Lambda, S3, Bedrock)', 'Jenkins', 'Ansible', 'Docker', 'GitHub Actions', 'Liquibase', 'Maven', 'Linux', 'Git']],
  ['Data & concepts', ['PostgreSQL (Aurora)', 'SQL Server', 'MongoDB', 'REST APIs', 'Microservices', 'Multithreading', 'CI/CD']],
];

export const usedIn: Record<string, string> = {
  Java: 'BMO, HEXA, Heap from scratch',
  Python: 'BIXI Station Monitor, Coverage analyzer, NeetCode',
  TypeScript: 'Service booking platform',
  SQL: 'BMO, HEXA',
  'C++': 'Hammerfall Grove',
  JavaScript: 'Service booking platform, this site',
  'Spring Boot': 'BMO, HEXA',
  'Node.js': 'Service booking platform',
  Express: 'Service booking platform',
  React: 'HEXA, Service booking platform, this site',
  Pytest: 'BIXI Station Monitor',
  Vitest: 'Service booking platform, this site',
  'scikit-learn': 'BIXI Station Monitor',
  OpenGL: 'Hammerfall Grove',
  'AWS (Lambda, S3, Bedrock)': 'BMO',
  Jenkins: 'BMO',
  Ansible: 'BMO',
  Docker: 'BIXI Station Monitor, Service booking platform',
  'GitHub Actions': 'BIXI Station Monitor, Hammerfall Grove, this site',
  Liquibase: 'BMO',
  Maven: 'BMO',
  Git: 'everything on this page',
  'PostgreSQL (Aurora)': 'BMO',
  MongoDB: 'Service booking platform',
  'REST APIs': 'BMO, HEXA, Service booking platform',
  Microservices: 'HEXA',
  Multithreading: 'BMO',
  'CI/CD': 'BMO, every project here',
};
