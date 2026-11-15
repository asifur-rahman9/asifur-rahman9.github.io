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
  resume: '/resume.pdf' as string | null,
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

// Resume content for the terminal (kept verbatim from the resume PDF).
export type Job = { key: string; short: string; company: string; title: string; dates: string; org: string; place: string; bullets: string[] };
export const experience: Job[] = [
  {
    key: 'bmo', short: 'May–Aug 2026', company: 'BMO Capital Markets',
    title: 'Software Developer Intern', dates: 'May to August 2026',
    org: 'BMO Capital Markets, Platform & Infrastructure Development', place: 'Toronto, Ontario',
    bullets: [
      'Built a multithreaded Java reconciler indexing market data by composite key, surfacing discrepancies against AWS S3 archives',
      'Replaced a deprecated Bitbucket REST library with a native Java client, clearing transitive CVEs blocking platform upgrades',
      'Automated deployments across 7 installations and 4 environments using parameterized, config-driven Jenkins pipelines on Linux',
      'Implemented column-level dynamic data masking on Aurora PostgreSQL with role-based controls to protect sensitive PII data',
    ],
  },
  {
    key: 'devops', short: 'Sep 2025–Apr 2026', company: 'BMO Financial Group',
    title: 'DevOps Engineer Intern', dates: 'September 2025 to April 2026',
    org: 'BMO Financial Group, Corporate Database DevOps', place: 'Toronto, Ontario',
    bullets: [
      'Built an AWS Lambda pipeline in Python to parse DDL, leveraging Bedrock AI models for CI/CD compliance validation reports',
      'Orchestrated Liquibase deployment and rollback across Linux hosts via Ansible, onboarding 3 vendor teams to the pipeline',
      'Designed MS SQL Server changelogs for automated Liquibase regression testing, driven by Bash scripts sequencing Ansible jobs',
      'Documented Liquibase deployment and rollback workflows in guides adopted by developers and vendor teams as standard reference',
    ],
  },
  {
    key: 'concordia', short: 'Jan–Apr 2025', company: 'Concordia University',
    title: 'Web Developer', dates: 'January to April 2025',
    org: 'Concordia University, Open Educational Resources', place: 'Montreal, Québec',
    bullets: [
      'Built accessible HTML/CSS templates for open educational resources, achieving over 95% WCAG 2.1 AA standard compliance',
      'Engineered an open-source plugin in PHP and JavaScript to simplify interactive element creation for non-technical users',
      'Authored the technical guide for publishing accessible web resources, adopted by 50+ faculty members across 8 departments',
    ],
  },
  {
    key: 'hexa', short: 'May–Aug 2024', company: 'HEXA',
    title: 'Software Engineer Intern', dates: 'May to August 2024',
    org: 'HEXA, Full-Stack Development', place: 'Waterloo, Ontario',
    bullets: [
      "Engineered reusable React component architecture for an EdTech startup's platform, ensuring responsive cross-device rendering",
      'Designed Spring Boot services with REST APIs for real-time media streaming and 500+ concurrent document retrievals',
      'Reduced average API response time by 30% by optimizing Spring Boot service logic and refactoring inefficient SQL queries',
      'Built Power BI dashboards tracking engagement and performance metrics, surfacing user behavior insights for product decisions',
    ],
  },
];

export const skills: [string, string][] = [
  ['Languages', 'Java, Python, TypeScript, JavaScript, C++, C, SQL, Bash'],
  ['Frameworks & Libraries', 'Spring Boot, React, Node.js, Express.js, JUnit, Pytest, Pandas, NumPy, Scikit-learn, OpenGL'],
  ['Technologies', 'AWS, Jenkins, Ansible, Linux, Liquibase, Docker, Git, Maven, PostgreSQL, SQL Server, MongoDB, Wireshark'],
  ['Concepts', 'REST APIs, Multithreading, Microservices, TCP/UDP Sockets, CI/CD'],
];

export const education = {
  school: 'Concordia University', place: 'Montreal, Québec',
  degree: 'Bachelor of Computer Science (Co-op)', dates: 'January 2023 to December 2027',
  coursework: 'Data Structures & Algorithms, Distributed Systems, Databases, Operating Systems, Computer Networks, Software Engineering, Web Programming, Computer Graphics, Artificial Intelligence',
};
