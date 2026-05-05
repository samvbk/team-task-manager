# TaskFlow — Team Task Manager

<div align="center">

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-Team%20Task%20Manager-6c63ff?style=for-the-badge&logo=trello&logoColor=white)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)
[![Railway](https://img.shields.io/badge/Deployed%20on-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)](https://railway.app)

**A full-stack team productivity app with role-based access control, Kanban boards, and real-time task tracking.**

[🚀 Live Demo](#) · [📡 API Docs](#-api-reference) · [🛠 Local Setup](#-local-development)

</div>

---

## 📸 Screenshots

> Login with demo credentials and explore:
> - **Admin**: `admin@taskflow.com` / `Admin@123`
> - **Member**: `member@taskflow.com` / `Member@123`

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure signup/login with bcrypt password hashing
- 👥 **Role-Based Access Control** — Global roles (Admin/Member) + per-project roles
- 📁 **Project Management** — Create projects, invite team members, manage access
- 📋 **Kanban Board** — Drag-and-drop tasks across **To Do → In Progress → Done**
- ⚡ **Task Management** — Create, edit, assign, set priority (Low/Medium/High) & due dates
- 🔴 **Overdue Detection** — Tasks past due date are flagged automatically
- 📊 **Dashboard** — Live stats: total tasks, in progress, completed, overdue, and recent activity
- 🧑‍💼 **Team Management** — Add/remove project members with role enforcement

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js |
| **ORM** | Prisma |
| **Database** | MySQL (local) / PostgreSQL (Railway) |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs |
| **Frontend** | React 18, Vite |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios |
| **Styling** | Vanilla CSS (custom dark design system) |
| **Deployment** | Railway |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # DB models & relationships
│   │   └── seed.js              # Demo data seeder
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── project.controller.js
│   │   │   ├── task.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js   # JWT + RBAC guards
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── project.routes.js
│   │   │   ├── task.routes.js
│   │   │   └── user.routes.js
│   │   └── index.js
│   ├── .env.example
│   ├── railway.toml
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js            # Axios instance with auth interceptors
    │   ├── components/
    │   │   └── Layout.jsx           # Sidebar + user dropdown
    │   ├── context/
    │   │   └── AuthContext.jsx      # Auth state management
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   └── ProjectDetail.jsx    # Kanban board + member management
    │   ├── App.jsx                  # Router + protected routes
    │   └── index.css                # Design system (dark theme)
    ├── .env.example
    ├── railway.toml
    └── package.json
```

---

## 🔑 Role-Based Access Control

| Action | Global Admin | Project Admin | Project Member |
|--------|:-----------:|:-------------:|:--------------:|
| View own projects | ✅ | ✅ | ✅ |
| View **all** projects | ✅ | ❌ | ❌ |
| Create project | ✅ | ✅ | ✅ |
| Edit / Delete project | ✅ | ✅ | ❌ |
| Add / Remove members | ✅ | ✅ | ❌ |
| Create task | ✅ | ✅ | ✅ |
| Update task status | ✅ | ✅ | ✅ |
| Delete task | ✅ | ✅ | ❌ |

> The **first registered user** automatically becomes Global Admin. All subsequent users default to Member.

---

## 🗄 Database Schema

```
User
 ├── id, name, email, password, role (ADMIN|MEMBER)
 └── relations: projectMemberships, assignedTasks, createdTasks, createdProjects

Project
 ├── id, name, description, createdById
 └── relations: members (ProjectMember[]), tasks (Task[])

ProjectMember          ← join table with per-project role
 ├── projectId, userId
 └── role (ADMIN|MEMBER)

Task
 ├── id, title, description
 ├── status (TODO|IN_PROGRESS|DONE)
 ├── priority (LOW|MEDIUM|HIGH)
 ├── dueDate, projectId, assigneeId, createdById
 └── relations: project, assignee, createdBy
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login, receive JWT | ❌ |
| `GET` | `/api/auth/me` | Get current user | ✅ |

### Projects
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/api/projects` | List user's projects | ✅ |
| `POST` | `/api/projects` | Create project | ✅ |
| `GET` | `/api/projects/:id` | Project detail + tasks | Member |
| `PUT` | `/api/projects/:id` | Update project | Admin |
| `DELETE` | `/api/projects/:id` | Delete project | Admin |
| `POST` | `/api/projects/:id/members` | Add member | Admin |
| `DELETE` | `/api/projects/:id/members/:uid` | Remove member | Admin |

### Tasks
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/api/projects/:id/tasks` | List project tasks | Member |
| `POST` | `/api/projects/:id/tasks` | Create task | Member |
| `PUT` | `/api/tasks/:projectId/:taskId` | Update task | Member |
| `DELETE` | `/api/tasks/:projectId/:taskId` | Delete task | Admin |
| `GET` | `/api/tasks/dashboard` | Dashboard stats | ✅ |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/api/users` | List all users | ✅ |

---

## 🚀 Local Development

### Prerequisites
- Node.js v18+
- MySQL 8+ running locally

### 1. Clone the repository
```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

### 2. Backend setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/taskflow"
JWT_SECRET="your-secret-key-here"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
# Push schema to database (auto-creates 'taskflow' DB)
npx prisma db push

# Seed demo data
npm run db:seed

# Start dev server
npm run dev
# → API running at http://localhost:5000
```

### 3. Frontend setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start dev server
npm run dev
# → App running at http://localhost:5173
```

---

## 🚂 Railway Deployment

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Create **two services** from the same repo:

### Backend Service
- Root directory: `backend/`
- Set environment variables:
  ```
  DATABASE_URL   = <auto-filled by Railway PostgreSQL addon>
  JWT_SECRET     = <generate a strong random string>
  FRONTEND_URL   = https://<your-frontend-url>.up.railway.app
  NODE_ENV       = production
  ```
- Railway will auto-run `npx prisma migrate deploy && node src/index.js`

### Frontend Service
- Root directory: `frontend/`
- Set environment variables:
  ```
  VITE_API_URL = https://<your-backend-url>.up.railway.app/api
  ```

### PostgreSQL Addon
- Click **+ New** → **Database** → **PostgreSQL** inside your project
- Railway auto-injects `DATABASE_URL` into the backend service

---

## 🌱 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Global Admin | `admin@taskflow.com` | `Admin@123` |
| Member | `member@taskflow.com` | `Member@123` |

---

## 📝 License

MIT © 2025
