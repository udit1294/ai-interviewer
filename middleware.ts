// Middleware.ts - Protects Dashboard routes from unauthenticated users
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    // You can add more protected routes here later
  ],
};
