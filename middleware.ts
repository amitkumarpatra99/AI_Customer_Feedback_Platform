import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Yahan baad mein hum specific role checks add kar sakte hain
    // Example: if (req.nextUrl.pathname.startsWith("/settings/team") && req.nextauth.token?.role !== "ADMIN") { ... }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // User ke paas valid token hona chahiye
    },
    pages: {
      signIn: "/login", // Agar authorized nahi hai, toh yahan redirect karo
    },
  }
);

// In routes ko protect karna hai
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inbox/:path*",
    "/themes/:path*",
    "/ask/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};