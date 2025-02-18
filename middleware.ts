// import { NextResponse } from "next/server";
// import { NextRequest } from "next/server";
// import { v4 as uuidv4 } from "uuid";
// import { auth } from "./lib/auth";

// export const ROOT = "/";
// export const PUBLIC_ROUTES = ["/", "/guestbook"];
// export const PRIVATE_ROUTES = [/^\/dashboard\/.*$/];
// export const DEFAULT_REDIRECT = "/";

// export async function middleware(req: NextRequest) {
//   const session = await auth();
//   const { nextUrl } = req;
//   const isAuthenticated = !!session?.user;
//   const userRole = session?.user?.role;

//   const isPrivateRoute = PRIVATE_ROUTES.some((route) => route.test(nextUrl.pathname));

//   if (!isAuthenticated && isPrivateRoute) {
//     console.log("Redirecting unauthenticated user to login page");
//     return NextResponse.redirect(new URL(ROOT, nextUrl));
//   }

//   if (isPrivateRoute && userRole !== "SUPER_ADMIN") {
//     console.log("Redirecting user without SUPER_ADMIN role to dashboard");
//     return NextResponse.redirect(new URL(ROOT, nextUrl));
//   }

// return NextResponse.next(); 
// }
  

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|sitemap.xml|robots.txt).*)", "/"],
// };
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

export const ROOT = "/";
export const PUBLIC_ROUTES = ["/", "/guestbook"];
export const PRIVATE_ROUTES = [/^\/dashboard\/.*$/];
export const DEFAULT_REDIRECT = "/";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { nextUrl } = request;
  const isAuthenticated = !!session?.user;
  const userRole = session?.user?.role;

  const isPrivateRoute = PRIVATE_ROUTES.some((route) => route.test(nextUrl.pathname));

  if (!isAuthenticated && isPrivateRoute) {
    console.log("Redirecting unauthenticated user to login page");
    return NextResponse.redirect(new URL(ROOT, request.url));
  }

  if (isPrivateRoute && userRole !== "SUPER_ADMIN") {
    console.log("Redirecting user without SUPER_ADMIN role to dashboard");
    return NextResponse.redirect(new URL(ROOT, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|sitemap.xml|robots.txt).*)",
    "/",
  ],
};
