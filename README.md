# Project Management Tool (MERN)

A production-quality, full-stack Project Management application built with the MERN stack (MongoDB, Express, React, Node.js). Features responsive Kanban drag-and-drop boards, interactive analytics dashboards with Recharts, a custom CSS Grid timeline / Gantt chart, task discussions with auto-polling, and comprehensive project & member management.

---

## Tech Stack

### Backend (`/server`)
- **Runtime:** Node.js (ES Modules, `"type": "module"`)
- **Framework:** Express.js 4.x
- **Database & ODM:** MongoDB & Mongoose 8.x
- **Authentication & Security:** JWT (`jsonwebtoken`), `bcryptjs` password hashing, `helmet`, `cors`
- **Validation & Utilities:** `express-validator`, `morgan`, `dotenv`

### Frontend (`/client`)
- **Build Tool & Framework:** Vite 6 + React 18
- **Routing:** React Router v6
- **Styling:** Tailwind CSS v3 with PostCSS & Autoprefixer
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **HTTP Client:** Axios with JWT request and 401 response interceptors

---

## Prerequisites

- **Node.js:** v18.0.0 or later (v20+ / v22 recommended)
- **MongoDB:** v6.0+ running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection URI

---

## Quick Start Instructions

Execute the following exact commands in two terminal windows:

### Terminal 1 — Backend

```bash
cd server
npm install
cp .env.example .env      # then edit MONGO_URI if using Atlas
npm run seed
npm run dev
```

### Terminal 2 — Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
# open http://localhost:5173  (login: alex@example.com / Password123!)
```

---

## Demo Credentials

The database is seeded with two demo users:

| Name | Email | Password | Role / Projects |
|---|---|---|---|
| **Alex Johnson** | `alex@example.com` | `Password123!` | Owner: Website Redesign; Member: Mobile App Launch |
| **Priya Sharma** | `priya@example.com` | `Password123!` | Owner: Mobile App Launch; Member: Website Redesign |

> Both users can be pre-filled quickly using the **Quick Demo Fill** buttons on the Login page.

---

## REST API Route Reference

Base URL: `/api`. All protected routes require header `Authorization: Bearer <token>`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return token |
| `GET` | `/api/auth/me` | Private | Fetch authenticated user profile |
| `GET` | `/api/auth/users` | Private | Fetch all users (for member & assignee selection) |

### Projects (`/api/projects`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/projects` | Private | List projects where user is owner or member (includes `taskCount`) |
| `POST` | `/api/projects` | Private | Create new project (`name`, `description?`, `members?`) |
| `GET` | `/api/projects/:id` | Private | Get single project details (owner & members only) |
| `PUT` | `/api/projects/:id` | Private | Update project (owner only) |
| `DELETE` | `/api/projects/:id` | Private | Delete project & cascade delete all associated tasks and comments (owner only) |

### Tasks (`/api/projects/:projectId/tasks` & `/api/tasks`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/projects/:projectId/tasks` | Private | List project tasks sorted by `status` then `order` ascending (includes `commentCount`) |
| `POST` | `/api/projects/:projectId/tasks` | Private | Create task; `order` auto-appended to end of column |
| `PATCH` | `/api/tasks/reorder` | Private | Atomically reorder task positions and update statuses via MongoDB `bulkWrite` |
| `GET` | `/api/tasks/:id` | Private | Get task details populated with `assignee` and `createdBy` |
| `PUT` | `/api/tasks/:id` | Private | Update editable task attributes (`title`, `description`, `status`, `priority`, `assignee`, `startDate`, `dueDate`) |
| `DELETE` | `/api/tasks/:id` | Private | Delete task and all of its comments |

### Comments (`/api/tasks/:taskId/comments` & `/api/comments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tasks/:taskId/comments` | Private | Get discussion comments for task (oldest first, populated with author) |
| `POST` | `/api/tasks/:taskId/comments` | Private | Post comment on task (`text`) |
| `DELETE` | `/api/comments/:id` | Private | Delete comment (author only; 403 otherwise) |

### Analytics (`/api/projects/:projectId/analytics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/projects/:projectId/analytics` | Private | Returns `{ total, byStatus, byPriority, overdue, overdueTasks }` |

### Health Check (`/api/health`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Returns `{ status: 'ok' }` |

---

## Troubleshooting

### 1. MongoDB Not Running or Connection Refused (`ECONNREFUSED 127.0.0.1:27017`)
- Ensure the MongoDB daemon is active.
- On Windows: start the MongoDB Windows service via `net start MongoDB` or run `mongod --dbpath <data_dir>`.
- On Linux/macOS: `sudo systemctl start mongod` or `brew services start mongodb-community`.
- If using MongoDB Atlas, update `MONGO_URI` in `/server/.env` with your cluster connection string.

### 2. Port Conflicts (`EADDRINUSE: port 5000` or `5173`)
- **Backend:** Change `PORT=5000` in `/server/.env` to another port (e.g. `5001`), and update `VITE_API_URL=http://localhost:5001/api` in `/client/.env`.
- **Frontend:** Change `port: 5173` in `/client/vite.config.js` to another port (e.g. `5174`), and update `CLIENT_URL=http://localhost:5174` in `/server/.env` to ensure CORS headers match.

### 3. CORS Preflight or Blocked Request Errors
- Verify that `CLIENT_URL` in `/server/.env` exactly matches the URL where the Vite dev server is running (e.g., `http://localhost:5173`).
- Ensure no trailing slash is appended to `CLIENT_URL` (use `http://localhost:5173`, not `http://localhost:5173/`).
