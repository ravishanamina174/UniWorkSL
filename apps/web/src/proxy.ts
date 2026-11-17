import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { hasClerkConfiguration } from "@/lib/clerk-config";

const proxy = hasClerkConfiguration() ? clerkMiddleware() : () => NextResponse.next();

export default proxy;

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in/:path*", "/sign-up/:path*"],
};
