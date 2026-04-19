# Backend Integration Plan
Base URL: `https://pm-bck.twindix.com/api`

---

## How We Integrate Each Module
For each module we follow this pattern:
1. Update interfaces to match real API response shapes
2. Add/update service file with real API calls
3. Update Zustand store or React Context to call services
4. Remove seed/mock data usage from views
5. Handle loading, error, and empty states in views

---

## Checklist

### 1. Auth
- [ ] Set `VITE_API_URL=https://pm-bck.twindix.com/api` in `.env`
- [ ] Update `AuthProvider` to call `authService.loginHandler()` instead of validating against seed data
- [ ] Save token from login response to cookies
- [ ] Call `authService.meHandler()` on app load to restore session
- [ ] Wire up `POST /auth/logout` on logout
- [ ] Wire up `POST /auth/refresh` (already in axios interceptor — verify it works)
- [ ] Wire up `PATCH /auth/heartbeat` via `usePresence` hook
- [ ] Wire up `GET /auth/me` + `PUT /auth/me` in profile/settings views
- [ ] Remove demo credential validation from `AuthProvider`
- [ ] Test: login → token saved → refresh → logout

### 2. Users
- [ ] Add `services/users.ts` with all CRUD calls
- [ ] Update `views/users/index.tsx` to fetch from `GET /users`
- [ ] Update `views/users/detail.tsx` to fetch from `GET /users/{id}`
- [ ] Wire `POST /users` in create user flow
- [ ] Wire `PUT /users/{id}` in edit user flow
- [ ] Wire `DELETE /users/{id}` in deactivate user flow
- [ ] Wire `GET /users/me/settings` + `PUT /users/me/settings` in `views/settings`
- [ ] Wire `PUT /users/me/profile` in `views/profile`
- [ ] Remove seed `team-members.ts` usage from views

### 3. Teams
- [ ] Add `services/teams.ts`
- [ ] Wire `GET /teams` + `POST /teams` wherever teams are displayed/created

### 4. Sprints
- [ ] Add `services/sprints.ts`
- [ ] Update `useSprintStore` to fetch sprints from `GET /sprints`
- [ ] Wire `POST /sprints`, `PUT /sprints/{id}`, `DELETE /sprints/{id}`
- [ ] Wire `PATCH /sprints/{sprint_id}/activate`
- [ ] Wire `GET /sprints/{sprint_id}/summary`
- [ ] Remove seed `sprints.ts` usage

### 5. Tasks
- [ ] Add `services/tasks.ts`
- [ ] Wire `GET /sprints/{sprint_id}/tasks/kanban` → `views/tasks/BoardView.tsx`
- [ ] Wire `GET /sprints/{sprint_id}/tasks/pipeline` → `views/tasks/PipelineView.tsx`
- [ ] Wire `GET /sprints/{sprint_id}/tasks/pipeline-counts`
- [ ] Wire `GET /sprints/{sprint_id}/tasks/stats`
- [ ] Wire `POST /sprints/{sprint_id}/tasks` → `add-task-dialog.tsx`
- [ ] Wire `GET /tasks/{task_id}` → `TaskDetailDialog.tsx`
- [ ] Wire `PUT /tasks/{task_id}` → task edit
- [ ] Wire `PATCH /tasks/{task_id}/status` → `TransitionDialog.tsx`
- [ ] Wire `DELETE /tasks/{task_id}`
- [ ] Wire tags: `POST /tasks/{task_id}/tags`, `DELETE /tasks/{task_id}/tags/{tag}`
- [ ] Wire attachments: `POST /tasks/{task_id}/attachments`, `DELETE` → `TaskAttachments.tsx`
- [ ] Wire `GET /tasks/{task_id}/transition-criteria` → `TransitionDialog.tsx`
- [ ] Remove seed `tasks.ts` usage

### 6. Task Requirements
- [ ] Add `services/requirements.ts`
- [ ] Wire `GET /tasks/{task_id}/requirements` in `TaskDetailDialog`
- [ ] Wire `POST /tasks/{task_id}/requirements`
- [ ] Wire `PUT /requirements/{id}`, `PATCH /requirements/{id}/toggle`, `DELETE /requirements/{id}`

### 7. Time Logs
- [ ] Add `services/time-logs.ts`
- [ ] Wire `GET /tasks/{task_id}/time-logs` → `TaskTimeLogs.tsx`
- [ ] Wire `POST /tasks/{task_id}/time-logs`
- [ ] Wire `PUT /time-logs/{id}`, `DELETE /time-logs/{id}`
- [ ] Wire `GET /sprints/{sprint_id}/time-logs` + `/summary`

### 8. Blockers
- [ ] Add `services/blockers.ts`
- [ ] Wire `GET /sprints/{sprint_id}/blockers` → `views/blockers`
- [ ] Wire `GET /sprints/{sprint_id}/blockers/analytics`
- [ ] Wire `POST`, `PUT`, `PATCH /resolve`, `PATCH /escalate`
- [ ] Wire `POST /blockers/{id}/tasks`, `DELETE /blockers/{id}/tasks/{task}`
- [ ] Remove seed `blockers.ts` usage

### 9. Alerts
- [ ] Update `useAlertStore` to call real API instead of seed data
- [ ] Add `services/alerts.ts`
- [ ] Wire `GET /sprints/{sprint_id}/alerts` + `/count`
- [ ] Wire `POST`, `PUT`, `DELETE`
- [ ] Wire `PATCH /acknowledge`, `PATCH /done`
- [ ] Remove LocalStorage persistence for alerts (use API as source of truth)

### 10. Comments
- [ ] Add `services/comments.ts`
- [ ] Wire `GET /sprints/{sprint_id}/comments` → `views/comments-log`
- [ ] Wire `GET /sprints/{sprint_id}/comments/analytics`
- [ ] Wire `POST`, `PUT`, `DELETE`, `PATCH /respond`
- [ ] Wire comments in `TaskDetailDialog` via `TaskComments.tsx`
- [ ] Remove seed `comments.ts` usage

### 11. Decisions
- [ ] Add `services/decisions.ts`
- [ ] Wire `GET /sprints/{sprint_id}/decisions` → `views/decisions`
- [ ] Wire `POST`, `PUT`, `DELETE`
- [ ] Remove seed `decisions.ts` usage

### 12. Red Flags
- [ ] Update `useRedFlagStore` to call real API
- [ ] Add `services/red-flags.ts`
- [ ] Wire `GET /sprints/{sprint_id}/red-flags` + `/count`
- [ ] Wire `POST`, `PUT`, `DELETE`
- [ ] Remove LocalStorage persistence for red-flags (use API as source of truth)
- [ ] Remove seed `red-flags.ts` usage

### 13. Dashboard & Analytics
- [ ] Add `services/dashboard.ts`
- [ ] Wire `GET /sprints/{sprint_id}/dashboard` → `views/dashboard`
- [ ] Wire `GET /sprints/{sprint_id}/dashboard/health-score`
- [ ] Wire `GET /sprints/{sprint_id}/dashboard/metrics`
- [ ] Remove seed `metrics.ts` usage

---

## Order of Implementation
1. **Auth** ← starting here
2. Users
3. Teams
4. Sprints
5. Tasks + Requirements + Time Logs
6. Blockers
7. Alerts
8. Comments
9. Decisions
10. Red Flags
11. Dashboard & Analytics
