import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const HARDCODED_USERNAME = "admin";

// Helper function to extract single parameter value
const singleParam = (
  value: string | string[] | number | undefined | null,
): string => {
  if (value == null) return "";
  if (Array.isArray(value)) return value[0] || "";
  if (typeof value === "number") return String(value);
  return value || "";
};

// Very simple HTTP Basic auth with a hardcoded username.
export function proxy(req: NextRequest) {
  const secret = process.env.PASSWORD;
  if (!secret) return NextResponse.next();

  const ip =
    singleParam(req.headers.get("x-forwarded-for")).split(",").pop()?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  try {
    const auth = req.headers.get("authorization") || "";

    // Buffer is not available in the Next Edge environment, so use atob
    // https://edge-runtime.vercel.app/features/available-apis
    const [username, password] = atob(auth.substring(5)).split(":");

    if (username !== HARDCODED_USERNAME || password !== secret)
      throw new Error("Invalid credentials");
    return NextResponse.next();
  } catch (err) {
    console.log(`Authentication error: ${err} from ${ip}`);
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
