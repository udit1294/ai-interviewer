// proxy.ts - Protects Dashboard routes from unauthenticated users
// Next.js 16+ uses "proxy" convention instead of "middleware"
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/interview/:path*",
  ],
};
