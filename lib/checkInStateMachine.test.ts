import { computeStatus } from "./checkInStateMachine";

const DAY = 24 * 60 * 60 * 1000;
const now = new Date("2026-07-05T12:00:00Z");

const cases = [
  {
    label: "well before deadline -> active",
    state: {
      status: "active" as const,
      lastCheckedInAt: new Date(now.getTime() - 1 * DAY),
      nextDeadlineAt: new Date(now.getTime() + 3 * DAY),
      gracePeriodDays: 2,
    },
  },
  {
    label: "just past deadline, within grace -> grace_period",
    state: {
      status: "active" as const,
      lastCheckedInAt: new Date(now.getTime() - 8 * DAY),
      nextDeadlineAt: new Date(now.getTime() - 1 * DAY),
      gracePeriodDays: 2,
    },
  },
  {
    label: "past deadline and past grace -> triggered",
    state: {
      status: "active" as const,
      lastCheckedInAt: new Date(now.getTime() - 12 * DAY),
      nextDeadlineAt: new Date(now.getTime() - 5 * DAY),
      gracePeriodDays: 2,
    },
  },
  {
    label: "exactly at deadline -> grace_period (boundary check)",
    state: {
      status: "active" as const,
      lastCheckedInAt: new Date(now.getTime() - 7 * DAY),
      nextDeadlineAt: now,
      gracePeriodDays: 2,
    },
  },
  {
    label: "manually paused, deadline long past -> stays paused",
    state: {
      status: "paused" as const,
      lastCheckedInAt: new Date(now.getTime() - 30 * DAY),
      nextDeadlineAt: new Date(now.getTime() - 20 * DAY),
      gracePeriodDays: 2,
    },
  },
  {
    label: "no deadline set yet -> active",
    state: {
      status: "active" as const,
      lastCheckedInAt: null,
      nextDeadlineAt: null,
      gracePeriodDays: 2,
    },
  },
];

for (const { label, state } of cases) {
  const result = computeStatus(state, now);
  console.log(`${label}\n  -> status: ${result.status}, triggeredAt: ${result.triggeredAt}\n`);
}