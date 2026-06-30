import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

// Clerk is optional. When it isn't configured the app runs in open/anonymous
// mode and the middleware is a passthrough. We import Clerk lazily so its
// module code never executes (and never fails) in deployments without keys.
const isClerkConfigured =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "your_clerk_publishable_key";

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!isClerkConfigured) {
    return NextResponse.next();
  }

  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");

  const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
  ]);

  const handler = clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  });

  return handler(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
