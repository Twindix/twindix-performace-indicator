# Twindix Performance Indicator

<div align="center">

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║       ████████╗██╗    ██╗██╗███╗   ██╗██████╗ ██╗██╗  ██╗   ║
║       ╚══██╔══╝██║    ██║██║████╗  ██║██╔══██╗██║╚██╗██╔╝   ║
║          ██║   ██║ █╗ ██║██║██╔██╗ ██║██║  ██║██║ ╚███╔╝    ║
║          ██║   ██║███╗██║██║██║╚██╗██║██║  ██║██║ ██╔██╗    ║
║          ██║   ╚███╔███╔╝██║██║ ╚████║██████╔╝██║██╔╝ ██╗   ║
║          ╚═╝    ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝╚═╝  ╚═╝   ║
║                                                              ║
║              P E R F O R M A N C E   I N D I C A T O R       ║
║                                                              ║
║     Team Delivery Friction Tracking  •  Sprint Health         ║
║     17 Key Metrics  •  Task Readiness Gates  •  Reports       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Team Performance and Delivery Friction Tracking Platform**

*A platform that makes delivery friction visible, measurable, and actionable — so teams can fix real root causes instead of guessing what went wrong.*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Radix UI](https://img.shields.io/badge/Radix_UI-Accessible-161618?logo=radixui&logoColor=white)](https://www.radix-ui.com)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Zustand](https://img.shields.io/badge/Zustand-State-433E38)](https://zustand-demo.pmnd.rs)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

**[Live Demo →](https://twindix-performace-indicator.netlify.app)**

</div>

---

## About the Project

Twindix Performance Indicator is a team performance and communication intelligence platform designed to solve the most common and recurring problems that slow down software delivery teams.

The platform was born from real pain points experienced by the frontend engineering team: unclear requirements reaching development, decisions lost in Slack threads, blockers sitting unresolved for days, inconsistent handoffs between teams, and a lack of visibility into where delivery friction actually comes from.

**This is not about judging people.** It is about showing where delivery friction really comes from — weak stories, delayed answers, missing dependencies, unclear ownership, or poor handoffs — so teams can fix the process, not blame individuals.

### What Problems Does This Platform Solve?

Based on the [Twindix Team Performance Platform Feasibility Study](./Twindix%20Team%20Performance%20Platform%20Feasibility%20Study.docx), the platform addresses **6 core delivery friction areas**:

| # | Problem Area | What Happens | Platform Solution |
|---|-------------|-------------|-------------------|
| 1 | **Poor Requirements** | Tasks reach development with missing business rules, weak acceptance criteria, unclear edge cases | Task Readiness Gate with 7-point checklist that blocks incomplete tasks from starting |
| 2 | **Communication Gaps** | Delayed Slack replies, decisions lost in chat, no single source of truth, long clarification waits | Decision Log, Communication Tracker with response time SLAs, structured blocker tracking |
| 3 | **Weak Ownership** | Unclear technical boundaries, cross-scope changes without review, duplicated effort | Ownership Map with named owners, backup owners, conflict detection, and review gates |
| 4 | **Dependency Blockers** | Backend API not ready, missing data contracts, design not finalized, QA handoff unclear | Blocker Tracker with type classification, duration tracking, impact visualization |
| 5 | **Process Gaps** | No readiness gate, deadlines before feasibility check, no sprint risk review | Task phase transitions with entry/exit criteria, Handoff Tracker with completion scoring |
| 6 | **Team & Culture** | Blame over root-cause, context switching overload, uneven workload, high turnover cost | Workload Balancer, context switching frequency tracking, root-cause focused reporting |

### 17 Key Metrics Tracked

The platform continuously tracks these metrics across every sprint:

1. **Task Readiness Rate** — % of tasks starting with complete requirements
2. **Clarification Waiting Time** — Average hours lost waiting for answers
3. **Blocked Task Count** — Number of tasks blocked per sprint
4. **Requirement Leakage Rate** — % of requirements found after development starts
5. **Rework Percentage** — % of work redone due to weak requirements
6. **Communication Response Time** — Average response time for critical questions
7. **Cross-Team Dependency Delay** — Days of delay per cross-team dependency
8. **Story Quality Score** — Score based on completeness and edge case coverage
9. **Ownership Conflict Count** — Cases of unclear ownership causing problems
10. **Bug Source Analysis** — % of bugs from shortcuts vs requirements vs design
11. **Handoff Completion Rate** — % of transitions meeting entry/exit criteria
12. **Decision Log Coverage** — % of decisions documented vs discussed verbally
13. **Context Switching Frequency** — How often team members switch tasks per day
14. **Workload Distribution Balance** — Balance score across team members
15. **Onboarding & Turnover Cost** — Cost of knowledge transfer when team changes
16. **Shared Component Change Tracking** — Unreviewed changes to shared code
17. **Vibe-Coding Incident Rate** — Implementations lacking architecture notes

---

## Platform Features

### Sprint Dashboard
The central view showing sprint health at a glance. A large health score gauge (0-100), six friction area cards with individual scores, key metrics overview, active blockers summary, recent decisions feed, and team workload distribution.

### Task Management with Readiness Gates
A Kanban board with 6 phases (Backlog → Ready → In Progress → Review → QA → Done). The key innovation is the **Readiness Gate** — a 7-point checklist that must be completed before a task can move from Backlog to Ready:
- Acceptance criteria defined
- Business rules clear
- Edge cases identified
- Dependencies mapped
- Design available
- API contract ready
- Estimation done

### Blocker Tracker
Track every blocker with its type (Requirements, API Dependency, Design, QA Handoff, Communication, Technical), impact level, duration, responsible owner, and affected tasks. See the total blocked time and impact by type through visual charts.

### Decision Log
Document every important project decision with context, owner, participants, and outcome. Stop losing decisions in Slack threads. Track decision log coverage to ensure the team works on confirmed direction, not assumptions.

### Communication Tracker
Monitor response times across channels (Slack, email, meetings, Jira), identify unanswered questions blocking team members, and track SLA compliance. See which channels are slowest and which questions have been waiting the longest.

### Team Workload
Visualize workload distribution across team members. Identify overloaded members, track context switching frequency, and balance capacity. Prevent burnout and quality drops from uneven work distribution.

### Reports (Executive & Friction Analysis)
Generate reports readable by anyone — technical or non-technical. The Executive Summary shows sprint health, key findings, and actionable recommendations in plain English. The Friction Analysis breaks down each problem area with scores and trends.

### Sprint Analytics
Compare metrics across sprints to show improvement trends. See how every metric has changed over time, identify which friction areas improved the most, and which still need attention.

### Ownership Map
Define clear technical ownership for every shared component and cross-team code. Track conflicts, unauthorized changes, and ensure review gates are enforced.

### Handoff Tracker
Track the quality of phase transitions with entry and exit criteria checklists. Measure handoff completion rates and identify where in the pipeline tasks are falling through the cracks.

---

## As a Frontend Developer — What Matters Most

These are the critical points that directly impact frontend developer productivity and delivery speed. These are the things that, when missing or broken, cause delays, rework, and frustration:

1. **Clear, complete requirements before coding starts** — Nothing wastes more time than building something based on assumptions, then rebuilding it when the real requirements arrive. Every task must have acceptance criteria, business rules, edge cases, and expected behavior defined before development starts.

2. **API contracts ready before frontend implementation** — Frontend cannot build data-driven features without knowing the exact API response shape, error formats, and available endpoints. Missing or changing API contracts mid-sprint is the #1 cause of frontend blockers.

3. **Fast answers to blocking questions** — When a developer asks a clarifying question and waits 8+ hours for an answer, that's a full day lost. Critical questions need response time SLAs — not optional, enforced.

4. **Stable requirements — no mid-sprint changes without impact assessment** — Requirement changes after development starts create rework, estimate drift, and delivery delays. Changes must be tracked and their impact on timeline must be visible to everyone.

5. **One source of truth for decisions** — Decisions made in random Slack threads are invisible to the rest of the team. Every confirmed decision must be documented in one searchable, visible place.

6. **Visible blockers from day one** — If a frontend task depends on a backend API that's not ready, everyone should know that on sprint day 1, not day 5. Early visibility prevents cascading delays.

7. **Clear ownership of shared code** — When shared components are modified by someone without context, it creates regressions and conflicting implementations. Every shared area needs a named owner who must be consulted before changes.

8. **Balanced workload** — When one developer is juggling 5 tasks while another has capacity, quality drops and burnout rises. Workload must be visible and actively rebalanced.

9. **Consistent handoffs between phases** — Tasks moving from design to development without finalized designs, or from development to QA without test documentation, create repeated misunderstandings and rework.

10. **Architecture-first approach for complex features** — Quick fixes and vibe coding create fragile implementations with hidden edge cases. Complex tasks need architecture notes before implementation.

11. **Reduced context switching** — Switching between unrelated tasks multiple times per day destroys focus and slows delivery. Active task count per developer should be limited and visible.

12. **Root-cause focus, not blame** — When delays happen, the question should be "what broke in the process?" not "who is responsible?" Blame culture makes people hide problems instead of surfacing them early.

---

## How Each Point Is Implemented in the Platform

This section describes how each of the above critical points is realized within the Twindix Performance Indicator platform:

| # | What Matters | How It's Implemented |
|---|-------------|---------------------|
| 1 | **Complete requirements before coding** | The **Task Readiness Gate** blocks tasks from moving to "Ready" unless they score above 70% on a 7-point checklist covering acceptance criteria, business rules, edge cases, dependencies, design, API contracts, and estimation. Tasks below threshold stay in Backlog with a visible warning. The **Task Readiness Rate** metric tracks what percentage of tasks start fully ready across each sprint. |
| 2 | **API contracts ready** | The readiness checklist includes "API contract ready" as a mandatory field. The **Blocker Tracker** has a specific "API Dependency" type that flags frontend tasks blocked by missing or unfinished backend APIs. The **Cross-Team Dependency Delay** metric measures how many days of delay are caused by these dependencies, making the cost visible to leadership. |
| 3 | **Fast answers to blocking questions** | The **Communication Tracker** logs every blocking question with who asked, who was asked, which channel, and when it was asked. It calculates response time automatically and flags questions exceeding the SLA. The **Clarification Waiting Time** metric tracks the average hours lost per question across the sprint. Unanswered questions are listed with escalation indicators. |
| 4 | **Stable requirements** | The **Requirement Leakage Rate** metric measures how many requirements are discovered after development starts. The **Rework Percentage** metric tracks how much completed work had to be redone. Together they make the cost of mid-sprint changes visible in plain numbers that PMs and managers can understand. |
| 5 | **Single source of truth for decisions** | The **Decision Log** captures every confirmed decision with date, owner, context, participants, and outcome. The **Decision Log Coverage** metric shows what percentage of decisions are documented vs. discussed only verbally. Over time, this drives the team toward using the log as the default, not Slack. |
| 6 | **Visible blockers from day one** | The **Blocker Tracker** surfaces all active blockers on the Sprint Dashboard with duration, impact, and owner. The **Blocked Task Count** metric is shown prominently. Blockers lasting over 48 hours are flagged for escalation. Every blocker shows which tasks it affects, making the delivery impact immediately clear. |
| 7 | **Clear ownership of shared code** | The **Ownership Map** assigns a primary and backup owner to every shared component. The **Shared Component Change Tracking** metric counts changes made without owner review. The **Ownership Conflict Count** metric tracks cases where unclear ownership caused problems. Conflicts are highlighted with red indicators and detailed descriptions. |
| 8 | **Balanced workload** | The **Team Workload** view shows assigned points vs. capacity for every team member with utilization percentage bars. Members above 100% are highlighted in red. The **Workload Distribution Balance** metric provides a single score (0-100) for how evenly work is distributed. Leaders can rebalance before quality drops. |
| 9 | **Consistent handoffs** | The **Handoff Tracker** defines entry and exit criteria for every phase transition (Product→Design, Design→Development, Development→Review, Review→QA, QA→Done). Each handoff shows a completion rate based on how many criteria were met. The **Handoff Completion Rate** metric tracks the overall quality of transitions. |
| 10 | **Architecture-first approach** | The **Vibe-Coding Incident Rate** metric tracks implementations flagged for missing architecture notes or shortcut patterns. The **Bug Source Analysis** metric shows what percentage of bugs came from hasty implementations vs. genuine complexity. The readiness checklist encourages upfront thinking by requiring edge cases and dependencies to be identified. |
| 11 | **Reduced context switching** | The **Team Workload** view shows active task count and context switches per team member. The **Context Switching Frequency** metric measures how many different tasks each person touches per day. When someone is juggling too many tasks, it's immediately visible and can be addressed by the team lead. |
| 12 | **Root-cause focus** | The **Reports** module generates executive summaries and friction analyses that show *why* delays happened — unclear requirements, dependency issues, communication gaps — not *who* caused them. The Sprint Dashboard's friction area scores guide retrospectives toward process fixes. Every metric answers "what broke?" not "who broke it?" |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.7 |
| Styling | Tailwind CSS 4.1 |
| Components | Radix UI (accessible primitives) + shadcn/ui patterns |
| State | Zustand (sidebar, sprint selection) |
| Routing | React Router 7 |
| Icons | Lucide React |
| Notifications | Sonner (toast) |
| Backend | localStorage (POC — no real API) |
| Auth | Dummy login (localStorage session) |
| Build | Vite 6.4 |
| PWA | vite-plugin-pwa (service worker, offline fallback) |
| Font | Inter |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone or navigate to the project directory
cd "Team Performance Indicator"

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Demo Login
- **Email:** admin@twindix.com
- **Password:** demo

**[Live Demo →](https://twindix-performace-indicator.netlify.app)**

On first load, the app automatically seeds realistic demo data with 3 sprints showing improvement trends (Sprint 12 → 13 → 14).

---

## Backend & Data Storage (POC Approach)

**This POC has no real backend.** All data operations are handled entirely on the client side using browser storage APIs. This was a deliberate decision to ship the demo quickly without backend dependencies.

### How data works in this POC:

| Concern | How It's Handled |
|---------|-----------------|
| **Database** | `localStorage` — all data (tasks, blockers, decisions, metrics, etc.) is stored as JSON in the browser's localStorage under keys prefixed with `twindix_perf_` |
| **Authentication** | Dummy login — any team member email + password `demo` works. The logged-in user is stored in `localStorage` under `twindix_perf_auth_user`. No JWT, no sessions, no server. |
| **Seed Data** | On first load (or when seed version changes), the app writes pre-built dummy data into localStorage. This includes 12 team members, 3 sprints, 25+ tasks, blockers, decisions, communications, metrics, workload data, ownership entries, and handoffs. |
| **Data Mutations** | Task phase changes (drag-and-drop) are persisted to localStorage immediately. Other mutations (creating blockers, decisions) are visual-only in the POC — the data comes from seed. |
| **Theme Preference** | Stored in localStorage (`twindix_perf_theme`) — persists dark/light mode choice across sessions. |
| **State Management** | Zustand for UI state (sidebar open/close, active sprint). React Context for auth and theme. |

### Storage Keys

| Key | Data | Records |
|---|---|---|
| `twindix_perf_auth_user` | Authenticated user session | 1 |
| `twindix_perf_theme` | Dark/light mode preference | 1 |
| `twindix_perf_settings` | Date format, compact view, language | 1 |
| `twindix_perf_team_members` | Team member roster (name, role, email) | 12 |
| `twindix_perf_sprints` | Sprint definitions (name, dates, status) | 3 |
| `twindix_perf_tasks` | Tasks with readiness checklists and phases | 26 |
| `twindix_perf_blockers` | Blocker records with type, impact, duration | 9 |
| `twindix_perf_decisions` | Decision log entries with context and outcome | 13 |
| `twindix_perf_communications` | Communication records with response times | 17 |
| `twindix_perf_workload` | Team member workload and capacity data | 8 |
| `twindix_perf_metrics` | Sprint metrics and friction scores (17 metrics each) | 3 |
| `twindix_perf_ownership` | Ownership map entries for shared components | 12 |
| `twindix_perf_handoffs` | Phase transition criteria and completion rates | 6 |
| `twindix_perf_seeded` | Seed version stamp for cache invalidation | 1 |

### What a real backend would look like:

```
Client (React)  →  REST API (Node.js/Express)  →  PostgreSQL
                    ↕                                ↕
                 Redis (cache)              Migration scripts
                    ↕
              WebSocket (real-time)
```

The localStorage approach works well for a POC because:
- Zero deployment complexity (static files only)
- Data survives page refreshes
- Instant read/write with no network latency
- Easy to reset: clear localStorage and refresh

---

## Workarounds & POC Limitations

This is a Proof of Concept built for demonstration purposes. The following are known limitations with planned solutions:

| Area | Current Workaround | Planned Solution |
|------|-------------------|-----------------|
| **Backend** | All data stored in browser localStorage. No real API calls. | Full REST API with Node.js + PostgreSQL |
| **Authentication** | Dummy login — any team member email + password `demo`. Stored in localStorage. | OAuth 2.0 / SSO with JWT tokens |
| **Real-time updates** | Page refresh needed to see changes from other sessions. | WebSocket-based real-time sync |
| **Data persistence** | Data lost if browser storage is cleared. Auto-reseeds on next load. | Server-side persistence with backup |
| **Charts** | CSS-only bars and gauges. No interactive charts. | Recharts or Visx for interactive visualizations |
| **Notifications** | No push notifications for blockers or SLA breaches. | Email + Slack webhook notifications |
| **Integrations** | No external tool connections. | Jira, Slack, GitHub, ClickUp integrations |
| **Time tracking** | Not implemented — workload shows story points and context switches only. | Per-task time logging with timer, daily/weekly timesheets |
| **User management** | Fixed team of 12 real team members via seed data. | Full user CRUD with role management |
| **Report export** | Reports visible in-browser only. | PDF and CSV export capability |
| **Mobile** | Basic responsive layout. | Full mobile-optimized experience |
| **Onboarding cost tracking** | Metric shown but not actively calculated. | Integration with HR systems for real cost data |
| **AI-based candidate screening** | Not implemented in POC. | Compare candidate profiles against role requirements using AI |

---

## SaaS Product Direction

The proposed product can start as an internal team performance and communication intelligence platform:

1. **Internal validation first** — Use within Twindix teams to prove value and iterate on real feedback
2. **Core MVP modules** — Task readiness checker, blocker tracker, response time tracker, decision log, handoff quality scoring, sprint health dashboard, root-cause reporting
3. **Integration layer** — Slack, Jira, ClickUp, Asana, GitHub for automatic data collection
4. **Market positioning** — Practical visibility platform: helping software teams understand *why* work is delayed, not just *which person closed fewer tasks*
5. **Target customers** — Software teams, agencies, product companies struggling with delivery predictability

---

## Project Structure

```
src/
├── atoms/          → Reusable UI primitives (Button, Badge, Card, Input, Label)
├── components/     → Composed components organized by feature
│   └── shared/     → Sidebar, Topbar, Header, MetricCard, ScoreGauge, StatusBadge
├── contexts/       → React contexts (Auth, Theme)
├── data/           → Route config, sidebar navigation, seed data
│   └── seed/       → All dummy data (team members, sprints, tasks, blockers, etc.)
├── enums/          → TypeScript enums for statuses, types, categories
├── hooks/          → Custom hooks (useAuth, useTheme, useLocalStorage)
├── interfaces/     → TypeScript interfaces for all data models
├── layouts/        → Auth and Dashboard layouts
├── providers/      → Context providers (Auth, Theme)
├── routes/         → Router config with protected/public routes
├── store/          → Zustand stores (sidebar, sprint selection)
├── ui/             → Radix UI wrapper components
├── utils/          → Utility functions (cn, storage, formatDate)
└── views/          → Page views (13 views covering all platform features)
```

---

## License

PROPRIETARY — Twindix Global Inc.

## Author

**[Mohamed Elhawary](https://hawary.dev)**

Based on the *Twindix Team Performance Platform Feasibility Study* — a comprehensive analysis of recurring delivery problems, practical solutions, and the foundation for a product that solves the same challenges for other companies.
