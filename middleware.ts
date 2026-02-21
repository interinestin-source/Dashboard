import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get cookies
  const authToken = request.cookies.get("authToken")?.value;
  const role = request.cookies.get("role")?.value;
  const uid = request.cookies.get("uid")?.value;

  const isLoggedIn = !!(authToken && uid && role);

  // Redirect logged-in users away from auth pages
  if (pathname === "/login" || pathname === "/register") {
    if (isLoggedIn) {
      let redirectPath = "/";
      
      if (role === "designer") redirectPath = "/designer-dashboard";
      else if (role === "admin") redirectPath = "/admin";
      else if (role === "user") redirectPath = "/user-dashboard";

      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    // Not logged in, allow access to auth pages
    return NextResponse.next();
  }

  // Protected routes mapping
  const protectedRoutes = {
    "/designer-dashboard": "designer",
    "/admin": "admin",
    "/user-dashboard": "user",
  };

  // Check if current path is a protected route
  for (const [route, requiredRole] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      // Not authenticated - redirect to login
      if (!isLoggedIn) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Wrong role - redirect to correct dashboard or unauthorized
      if (role !== requiredRole) {
        let redirectPath = "/login";
        
        if (role === "designer") redirectPath = "/designer-dashboard";
        else if (role === "admin") redirectPath = "/admin";
        else if (role === "user") redirectPath = "/user-dashboard";

        return NextResponse.redirect(new URL(redirectPath, request.url));
      }

      // Authorized - allow access
      return NextResponse.next();
    }
  }

  // Public routes - allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/designer-dashboard/:path*",
    "/admin/:path*",
    "/user-dashboard/:path*",
  ],
};
