Why a separate api/index.ts instead of touching server.ts?

Your existing server.ts has Socket.io and httpServer.listen() — it works perfectly for local dev. We keep it completely untouched. The new api/index.ts is a clean serverless version that Vercel uses. Two separate files, no conflicts.

# DevBoard — Real-Time Collaborative Task Management

A full-stack Kanban board built from scratch with Vue 3, Node.js, MongoDB.

## 🔗 Live Demo
- **App:** https://devboard.vercel.app
- **API:** https://devboard-api.vercel.app/api/health

## 🛠 Tech Stack
- **Frontend:** Vue 3, TypeScript, Pinia, Tailwind CSS, Vite
- **Backend:** Node.js, Express, TypeScript, MongoDB, Socket.io
- **Database:** MongoDB Atlas
- **Deployment:** Vercel (frontend + backend)

## ✨ Features
- JWT authentication with httpOnly cookies
- Kanban board with drag and drop
- Real-time collaboration via Socket.io (local dev)
- Task management — create, edit, archive, restore, delete
- Priority levels, labels, due dates
- Custom confirm modals and toast notifications

## 🚀 Run Locally
# Backend
cd server && npm install && npm run dev

# Frontend
cd client && npm install && npm run dev