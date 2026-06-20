import { serve } from "bun";
import index from "./index.html";
import { authHandler } from "./api/auth";
import { usersHandler } from "./api/users";
import { adminHandler } from "./api/admin";

const server = serve({
  routes: {
    "/api/auth/*": (req: Request) => authHandler(req),
    "/api/admin/*": (req: Request) => adminHandler(req),
    "/api/users/*": (req: Request) => usersHandler(req),
    // exact match for /api/posts (list + create)
    "/api/posts": async (req: Request) =>
      (await import("./api/posts")).postsHandler(req),
    // wildcard for /api/posts/:id and nested routes
    "/api/posts/*": async (req: Request) =>
      (await import("./api/posts")).postsHandler(req),
    // exact match for /api/comments/:id (delete)
    "/api/comments/*": async (req: Request) =>
      (await import("./api/posts")).postsHandler(req),
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);