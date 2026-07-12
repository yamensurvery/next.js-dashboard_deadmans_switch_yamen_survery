import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/notifications/email";

export async function POST(req: NextRequest) {
  const { to } = await req.json();

  if (!to) {
    return NextResponse.json({ error: "Missing recipient email" }, { status: 400 });
  }

  try {
    await sendTestEmail(to);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}