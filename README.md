# 🎪 RingFix

Grievance tracker for the **Circus of Wonders**: citizens report municipal issues, staff resolve them, everyone can watch progress live.

**Stack:** MongoDB Atlas · Express · React (Vite) · Node — MVC backend, separate SPA frontend.

## Structure

```
ringfix/
├── backend/src/
│   ├── config/        env validation, DB connection, constants (roles, statuses, SLA hours)
│   ├── models/        Mongoose schemas (User, Complaint, Notification)         -> M
│   ├── controllers/   thin HTTP handlers (req -> service -> res)               -> C
│   ├── services/      business logic (auth, complaints, SLA, analytics, reports, notifications)
│   ├── routes/        route definitions + middleware wiring
│   ├── middleware/    auth/RBAC, validation, uploads, error handling
│   ├── validators/    Joi schemas
│   ├── jobs/          cron: SLA scan & auto-escalation
│   ├── utils/         ApiError, asyncHandler
│   ├── app.js         Express app (no listen -> testable)
│   ├── server.js      bootstrap: DB, cron, listen
│   └── seed.js        demo data
└── frontend/src/      api/ · context/ · components/ · pages/ · utils/        -> V
```

Views are the React pages; the API returns JSON only. Controllers never touch models directly — all logic lives in services.

## Feature map (from the problem statement)

| # | Feature | Where |
|---|---------|-------|
| B1 | Registration & login (JWT, bcrypt) | `auth.service`, `AuthPages.jsx` |
| B2 | Complaint submission with text, location, photos | `complaint.service`, `upload.js`, `NewComplaint.jsx` |
| B3 | Lifecycle OPEN → IN_PROGRESS → RESOLVED (enforced transitions + history) | `constants.STATUS_TRANSITIONS`, `updateStatus` |
| B4 | Municipal dashboard: view / assign / update | `Dashboard.jsx`, `ComplaintDetail.jsx` |
| B5 | Search & filter by type, area, urgency, date | `Filters.jsx`, `buildFilter` |
| B6 | Citizen portal with status tracking | `/my-complaints`, timeline |
| B7 | Role-based access (citizen / staff / admin) | `middleware/auth.js`, `ProtectedRoute.jsx` |
| B8 | CSV / PDF export | `report.service.js` |
| A1 | Heatmap | `analytics.heatmap`, `HeatmapView.jsx` (Leaflet) |
| A2 | SLA tracking, overdue highlight | `slaDueAt`, `isOverdue`, `timeLeft()` |
| A3 | Auto-escalation on SLA breach | `sla.service.js` + `jobs/sla.job.js` |
| A4 | Public transparency portal | `/transparency`, `GET /api/public/stats` |
| A5 | Notifications (in-app + email; SMS stub) | `notification.service.js` |

SLA deadlines by urgency: critical 24h, high 48h, medium 72h, low 120h (edit in `config/constants.js`).

## Run it

### 1. MongoDB Atlas
Create a free cluster → Database Access (add user) → Network Access (allow your IP) → Connect → Drivers → copy the SRV string.

### 2. Backend
```bash
cd backend
cp .env.example .env     # paste MONGO_URI, set JWT_SECRET
npm install
npm run seed             # optional demo data (wipes collections!)
npm run dev              # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173  (proxies /api to :5000)
```

### Demo logins (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ringfix.test | Admin@123 |
| Staff | staff@ringfix.test | Staff@123 |
| Citizen | citizen@ringfix.test | Citizen@123 |

## API summary

```
POST   /api/auth/register | /login          GET /api/auth/me
POST   /api/complaints          (citizen, multipart: photos)
GET    /api/complaints          ?status&category&urgency&area&q&from&to&overdue&page&limit&sort
GET    /api/complaints/:id
PATCH  /api/complaints/:id/status   (staff/admin)  { status, note }
PATCH  /api/complaints/:id/assign   (staff/admin)  { staffId }
GET    /api/public/stats | /api/public/heatmap     (no auth)
GET    /api/analytics/areas | /api/staff           (staff/admin)
GET    /api/reports/csv | /pdf                     (same filters as list)
GET    /api/notifications   PATCH /api/notifications/read
POST   /api/staff  | /api/sla/scan                 (admin)
```

## Notes
- Public sign-up always creates a **citizen**; staff/admin are created by an admin (or seed).
- Staff may only change status on complaints assigned to them; admins can change any.
- Without SMTP creds, emails/SMS are logged to the console. Plug Twilio/MSG91 into `sendSms`.
- Uploaded photos are stored on local disk (`backend/uploads`). For production use S3/Cloudinary.
