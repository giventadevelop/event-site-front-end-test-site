import { NextResponse } from "next/server";

// Clerk auth catch-all route
// Note: runtime must NOT be 'edge' — Amplify doesn't support Edge API Routes
export async function GET() {
  return new NextResponse(null, { status: 200 });
}

export async function POST() {
  return new NextResponse(null, { status: 200 });
}
