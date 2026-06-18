import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const uuid = request.nextUrl.searchParams.get("uuid");
  const entscheidung = request.nextUrl.searchParams.get("entscheidung");

  if (!uuid || !entscheidung || !["go", "nogo"].includes(entscheidung)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_N8N_BASE ?? "https://n8n.ritz-ai.solutions";
  const url = `${base}/webhook/hitl-go?uuid=${encodeURIComponent(uuid)}&entscheidung=${encodeURIComponent(entscheidung)}`;

  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      return NextResponse.json({ error: "webhook_failed" }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "webhook_error" }, { status: 502 });
  }
}
