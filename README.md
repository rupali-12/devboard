# DevBoard

DevBoard is a modern, full-stack kanban board application designed to help teams and individuals organize work visually through boards, columns, and tasks. The project combines a Vue 3 frontend with an Express + MongoDB backend, offering authentication, protected routes, and a clean, responsive user experience.

## Overview

This application provides a simple and efficient way to manage projects using the popular kanban workflow. Users can create boards, add columns, move tasks, and interact with a secure backend API.

## Features

- User authentication with JWT and cookies
- Secure login and registration flow
- Create, update, and manage boards
- Add and organize columns and tasks
- Task-based project workflow with structured UI
- Protected API routes for authenticated users
- Deployment-ready setup for frontend and backend on Vercel

## Tech Stack

### Frontend
- Vue 3
- Vite
- TypeScript
- Pinia
- Vue Router
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT authentication
- Socket.IO

## Project Structure

```text
client/   # Vue 3 frontend application
server/   # Express.js backend API
```

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18 or newer
- npm or pnpm
- A MongoDB instance or connection string

## Environment Variables

### Frontend
Create a `.env` file inside the client folder:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Backend
Create a `.env` file inside the server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Installation

### 1. Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Run the backend

```bash
cd server
npm run dev
```

### 3. Run the frontend

```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000`.

## Build

### Frontend

```bash
cd client
npm run build
```

### Backend

```bash
cd server
npm run build
```

## Deployment on Vercel

The frontend and backend should be deployed as two separate Vercel projects.

### Backend deployment
- Root directory: `server`
- Framework: Vercel Node
- Entry point: `server/api/index.ts`

Required environment variables:
- `MONGO_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- `FRONTEND_URL=https://your-frontend-domain.vercel.app`

### Frontend deployment
- Root directory: `client`
- Framework: Vercel static app (Vite)

Required environment variable:
- `VITE_API_URL=https://your-backend-domain.vercel.app/api/v1`

## Notes

- The frontend and backend must be deployed separately.
- A root-level Vercel project is not required if you deploy the client and server as separate apps.
- If you want to manage both from one repository, each project should use its own root directory setting in Vercel.

## Contact

For questions, feedback, or collaboration opportunities, please contact:

- Name: Rupali Sharma
- Email: replyexpensetracker10@gmail.com
- GitHub: https://github.com/rupali-12

## License and Copyright

Copyright (c) 2026 Rupali

This project is created and maintained by Rupali for educational, portfolio, and personal development purposes.

You may:
- view and study the source code
- use it as a reference for learning and inspiration
- modify it for personal or non-commercial experimentation

You may not:
- claim the project as your own work without attribution
- sell, redistribute, or commercially exploit the project without permission
- remove or alter the copyright notice

If you want to use this project in a commercial product or publish it publicly, please contact the owner for permission.
