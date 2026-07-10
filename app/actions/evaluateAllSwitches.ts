"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { computeStatus } from "@/lib/checkInStateMachine";

export async function evaluateAllSwitches() {
  const supabase = createServiceClient();

  const { data: switches, error: fetchError } = await supabase
    .from("switches")
    .select("id, status, last_checked_in_at, next_deadline_at, grace_period_days")
    .in("status", ["active", "grace_period"]);

  if (fetchError) {
    throw new Error(`Failed to fetch switches: ${fetchError.message}`);
  }

  const results: { id: string; changed: boolean; status: string }[] = [];

  for (const sw of switches ?? []) {
    const result = computeStatus(
      {
        status: sw.status,
        lastCheckedInAt: sw.last_checked_in_at ? new Date(sw.last_checked_in_at) : null,
        nextDeadlineAt: sw.next_deadline_at ? new Date(sw.next_deadline_at) : null,
        gracePeriodDays: sw.grace_period_days,
      },
      new Date()
    );

    if (result.status === sw.status) {
      results.push({ id: sw.id, changed: false, status: result.status });
      continue;
    }

    const { error: updateError } = await supabase
      .from("switches")
      .update({
        status: result.status,
        ...(result.triggeredAt ? { triggered_at: result.triggeredAt.toISOString() } : {}),
      })
      .eq("id", sw.id);

    if (updateError) {
      console.error(`Failed to update switch ${sw.id}: ${updateError.message}`);
      results.push({ id: sw.id, changed: false, status: sw.status });
      continue;
    }

    results.push({ id: sw.id, changed: true, status: result.status });
  }

  return results;
}