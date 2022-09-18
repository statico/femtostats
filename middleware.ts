import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const HARDCODED_USERNAME = "admin";

// Very simple HTTP Basic auth with a hardcoded username.
export function middleware(req: NextRequest) {
  const secret = process.env.PASSWORD;
  if (!secret) return NextResponse.next();

  try {
    const auth = req.headers.get("authorization") || "";
    const [username, password] = atob(auth.substring(5)).split(":");
    if (username !== HARDCODED_USERNAME || password !== secret)
      throw new Error("Invalid credentials");
    return NextResponse.next();
  } catch (err) {
    console.log(`Authentication error: ${err}`);
    return new NextResponse(null, {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Dashboard"',
      },
    });
  }
}

export const config = {
  matcher: ["/", "/api/stats/:path*"],
};
