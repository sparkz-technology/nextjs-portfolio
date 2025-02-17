import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "./lib/auth";

export const ROOT = "/";
export const PUBLIC_ROUTES = ["/", "/guestbook"];
export const PRIVATE_ROUTES = [/^\/dashboard\/.*$/];
export const DEFAULT_REDIRECT = "/";

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { nextUrl } = req;
  const isAuthenticated = !!session?.user;
  const userRole = session?.user?.role;

  const isPrivateRoute = PRIVATE_ROUTES.some((route) => route.test(nextUrl.pathname));

  // Redirect unauthenticated users from private routes
  if (!isAuthenticated && isPrivateRoute) {
    console.log("Redirecting unauthenticated user to login page");
    return NextResponse.redirect(new URL(ROOT, nextUrl));
  }

  // Restrict access for users without the SUPER_ADMIN role on private routes
  if (isPrivateRoute && userRole !== "SUPER_ADMIN") {
    console.log("Redirecting user without SUPER_ADMIN role to dashboard");
    return NextResponse.redirect(new URL(ROOT, nextUrl));
  }

  // Track visit
  const response = NextResponse.next();

  const tempId = req.cookies.get("tempId")?.value;
  let visitorId = req.cookies.get("visitorId")?.value;

  if (!tempId) {
    const newTempId = uuidv4();
    response.cookies.set("tempId", newTempId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
    });
    if (!visitorId) {
      visitorId = uuidv4();
      response.cookies.set("visitorId", visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }
    // const apiUrl = new URL("/api/user-visit", nextUrl.origin);
    // await fetch(apiUrl.toString(), {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ visitorId, tempId: newTempId }),
    // });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|sitemap.xml|robots.txt).*)", "/"],
};
