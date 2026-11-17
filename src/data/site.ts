// Single source of truth for page content. Edit this file to update the site.

export const site = {
  name: 'Asifur Rahman',
  title: 'Asifur Rahman, software developer',
  description:
    'Final-year CS (Co-op) at Concordia, two co-op terms at BMO Capital Markets on platform and infrastructure. Open to 2027 SWE internships and new grad roles.',
  url: 'https://asifur-rahman9.github.io',
  email: 'asifur970@gmail.com',
  schoolEmail: 'asifur.rahman@mail.concordia.ca',
  github: 'https://github.com/asifur-rahman9',
  linkedin: 'https://linkedin.com/in/asifurrahman7',
  // Drop your PDF at public/resume.pdf and set this to '/resume.pdf' to show the button.
  resume: '/resume.pdf' as string | null,
};

export type Project = {
  /** Also the terminal name: `open <id>`. */
  id: string;
  /** Extra names `open` accepts (hidden from its suggestions). */
  aliases?: string[];
  hash: string;
  date: string;
  title: string;
  summary: string;
  body: string;
  part?: string;
  stack: string[];
  metrics: { value: string; label: string }[];
  badges: string[];
  /** Screenshots inside the project's own repo (paths from the repo root), first one is the cover.
   *  Loaded straight from GitHub, so updating docs/ in the repo updates the site. */
  images: { path: string; alt: string }[];
  repo: string;
};

export const projects: Project[] = [
  {
    id: 'campusshare',
    aliases: ['grpc'],
    hash: '781a325',
    date: 'SOEN 423 project, rebuilt',
    title: 'CampusShare: distributed reservations over gRPC',
    summary: 'Equipment reservation system for three university campuses, built in Java with gRPC',
    body: "Each campus (SGW, LOY and WIL) runs its own server and owns its equipment, with no shared database. Reserving from another campus makes a gRPC call to the campus that owns the item, searches fan out to every campus with a timeout, and full items get a first come, first served waiting queue. If one campus goes down, the other two keep working.",
    stack: ['Java', 'gRPC', 'Protocol Buffers', 'Gradle', 'JUnit 5'],
    metrics: [
      { value: '3', label: 'independent campus servers' },
      { value: '3 s', label: 'timeout per campus on fan-out search' },
      { value: '0', label: 'shared databases between campuses' },
    ],
    badges: ['CI', 'Tests'],
    images: [
      { path: 'docs/images/02-cross-campus-reservation.png', alt: 'A LOY student reserving an SGW camera, with the gRPC calls it made' },
      { path: 'docs/images/01-overview.png', alt: 'Overview of the three campus servers and their status' },
      { path: 'docs/images/03-waiting-queue.png', alt: 'A WIL student joining the waiting queue for a full item' },
      { path: 'docs/images/04-manager-inventory.png', alt: 'Manager view of the equipment inventory at one campus' },
      { path: 'docs/images/05-node-offline.png', alt: 'Search still working on two campuses after LOY goes offline' },
    ],
    repo: 'https://github.com/asifur-rahman9/campusshare-grpc',
  },
  {
    id: 'bixi',
    hash: '51daec1',
    date: 'Jun 2025 to now',
    title: 'BIXI Station Monitor',
    summary: 'Live BIXI bike availability in Montreal plus hourly demand forecasts, built with Python and Streamlit',
    body: "Maps every station from BIXI's live GBFS feed, colored by how full it is, and lists the ones that are nearly empty or nearly full. A gradient boosting model trained on 2025 trips and hourly weather forecasts departures and arrivals for the next 48 hours at the 50 busiest stations.",
    stack: ['Python', 'pandas', 'scikit-learn', 'Streamlit', 'pytest', 'Docker'],
    metrics: [
      { value: '32%', label: 'lower error than same hour last week' },
      { value: '256,800', label: 'station-hours of real 2025 trips' },
      { value: '48 h', label: 'weather-aware forecast window' },
    ],
    badges: ['CI', 'Docker', 'Tests'],
    images: [
      { path: 'docs/media/live-map.jpg', alt: 'Live map of BIXI stations colored by bike availability' },
      { path: 'docs/media/forecast.jpg', alt: 'Forecast tab with predicted departures and arrivals' },
      { path: 'docs/media/model.jpg', alt: 'Model tab with accuracy and actual vs predicted trips' },
      { path: 'docs/media/before-v1.jpg', alt: 'The first version of the app' },
    ],
    repo: 'https://github.com/asifur-rahman9/bixi-demand-forecaster',
  },
  {
    id: 'booking',
    hash: '82ca40f',
    date: 'Dec 2024 to now',
    title: 'Service booking platform',
    summary: 'Full-stack app for booking local services, built with React, Express and MongoDB',
    body: 'Customers search services, pick an open time slot and request a booking. Businesses accept or decline, mark jobs done, and an invoice is created automatically. Express API with JWT cookie auth, role checks on every route and a double-booking check; React + TypeScript front end.',
    part: 'built the first version with two collaborators as plain HTML/JS pages, then rebuilt it with React, Express and MongoDB.',
    stack: ['TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Vitest'],
    metrics: [
      { value: '19', label: 'REST endpoints' },
      { value: '5', label: 'API route groups' },
      { value: '2', label: 'roles: customer and business' },
    ],
    badges: ['CI', 'Tests'],
    images: [
      { path: 'docs/media/landing.jpg', alt: 'Service booking platform home page' },
      { path: 'docs/media/service-detail.jpg', alt: 'Picking an open time slot for a service' },
      { path: 'docs/media/business-dashboard.jpg', alt: 'Business dashboard with incoming bookings' },
      { path: 'docs/media/customer-bookings.jpg', alt: 'Customer view of their bookings' },
      { path: 'docs/media/demo.gif', alt: 'Demo of booking a service end to end' },
    ],
    repo: 'https://github.com/asifur-rahman9/service-booking-platform',
  },
  {
    id: 'hammerfall',
    aliases: ['engine'],
    hash: '0e60a66',
    date: 'Jul 2025 to now',
    title: 'Hammerfall Grove: C++ / OpenGL game',
    summary: 'First-person game built with C++ and OpenGL',
    body: 'A first-person game on a custom C++17 / OpenGL renderer: a moonlight with soft PCF shadows, point lights for fireflies and embers, and instanced grass and trees. A four-part mechanical arm aims its hammer with forward kinematics and a table of strike poses, driven by a state machine. Game logic lives in a library with no OpenGL dependency so it can be unit tested.',
    part: 'the arm, its kinematics and attack AI, the camera, and the project structure. Built the first version with a partner, then reworked the engine and added the gameplay.',
    stack: ['C++17', 'OpenGL', 'GLSL', 'CMake', 'doctest'],
    metrics: [
      { value: '5', label: "states in the arm's attack AI" },
      { value: '10,000+', label: 'grass and tree instances in 3 draw calls' },
      { value: '16', label: 'point lights at once' },
    ],
    badges: ['CI', 'Tests'],
    images: [
      { path: 'docs/media/gameplay.jpg', alt: 'Mechanical hammer arm in a moonlit forest clearing' },
      { path: 'docs/media/title.jpg', alt: 'Hammerfall Grove title screen' },
      { path: 'docs/media/catch.jpg', alt: 'Catching an ember near the hammer arm' },
    ],
    repo: 'https://github.com/asifur-rahman9/hammerfall-grove',
  },
];

export type MinorProject = { hash: string; title: string; repo: string };

export const minorProjects: MinorProject[] = [
  { hash: '6ae9818', title: 'LeetCode practice: data structures and algorithms in Python', repo: 'https://github.com/asifur-rahman9/leetcode-practice' },
  { hash: '2fa4a91', title: 'Cell coverage analyzer: base station heatmaps', repo: 'https://github.com/asifur-rahman9/cell-coverage-analyzer' },
  { hash: 'dbb5b1d', title: 'Heap from scratch in Java', repo: 'https://github.com/asifur-rahman9/heap-implementation' },
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
      'Developed internal tooling and shared Java and Spring Boot libraries with S3 and REST clients for Global Markets teams',
      'Implemented column-level dynamic data masking on Aurora PostgreSQL with role-based controls to protect sensitive PII data',
      'Automated deployments across 7 installations and 4 environments using parameterized, config-driven Jenkins pipelines on Linux',
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
  ['Frameworks & Libraries', 'Spring Boot, gRPC, React, Node.js, Express.js, JUnit, Pytest, Pandas, NumPy, Scikit-learn, OpenGL'],
  ['Technologies', 'AWS, Jenkins, GitHub Actions, Ansible, Linux, Liquibase, Docker, Git, Maven, PostgreSQL, SQL Server, MongoDB'],
  ['Concepts', 'REST APIs, Distributed Systems, Multithreading, Microservices, TCP/UDP Sockets, CI/CD'],
];

export const education = {
  school: 'Concordia University', place: 'Montreal, Québec',
  degree: 'Bachelor of Computer Science (Co-op)', dates: 'January 2023 to December 2027',
  coursework: 'Data Structures & Algorithms, Distributed Systems, Databases, Operating Systems, Computer Networks, Software Engineering, Web Programming, Computer Graphics, Artificial Intelligence',
};
