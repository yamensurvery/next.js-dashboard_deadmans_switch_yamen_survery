import { NextRequest, NextResponse } from "next/server";
import { evaluateAllSwitches } from "@/app/actions/evaluateAllSwitches";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.error("CRON_SECRET is not set in environment");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await evaluateAllSwitches();
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("evaluateAllSwitches failed:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}