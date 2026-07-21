Why a separate api/index.ts instead of touching server.ts?

Your existing server.ts has Socket.io and httpServer.listen() — it works perfectly for local dev. We keep it completely untouched. The new api/index.ts is a clean serverless version that Vercel uses. Two separate files, no conflicts.