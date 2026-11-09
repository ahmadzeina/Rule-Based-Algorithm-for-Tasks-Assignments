import type { TeamMember } from "@/store/teamStore";
import type { Task } from "@/store/taskStore";
import type {
  AssignmentResponse,
  Assignment,
  WorkloadSummary,
} from "@/services/api";
import { formatShortDate, todayISO } from "@/lib/derive";

/* ------------------------------------------------------------------ */
/* Assignment result derivations (all values come from the backend)    */
/* ------------------------------------------------------------------ */

export interface ResultStats {
  total: number;
  assigned: number;
  unassigned: number;
  avgMatch: number | null;
  members: number;
  utilized: number;
  perMember: Array<{ id: string; name: string; count: number; sp: number }>;
  unassignedTasks: Assignment[];
  workload: WorkloadSummary[];
  scoreBands: { strong: number; solid: number; weak: number };
}

export function resultStats(
  result: AssignmentResponse | null,
  team?: TeamMember[]
): ResultStats | null {
  if (!result) return null;

  const names = new Map<string, string>();
  if (team) for (const m of team) if (m.name) names.set(m.id, m.name);
  for (const w of result.workload_summary)
    names.set(w.member_id, w.name || w.member_id);

  const assignedList = result.assignments.filter(
    (a) => a.assigned_to !== "UNASSIGNED"
  );
  const unassignedTasks = result.assignments.filter(
    (a) => a.assigned_to === "UNASSIGNED"
  );

  const grouped = new Map<string, { count: number; sp: number }>();
  const scores: number[] = [];
  const bands = { strong: 0, solid: 0, weak: 0 };
  for (const a of assignedList) {
    const e = grouped.get(a.assigned_to) ?? { count: 0, sp: 0 };
    e.count += 1;
    e.sp += a.story_points ?? 0;
    grouped.set(a.assigned_to, e);
    if (typeof a.match_score === "number") {
      scores.push(a.match_score);
      if (a.match_score >= 0.8) bands.strong += 1;
      else if (a.match_score >= 0.6) bands.solid += 1;
      else bands.weak += 1;
    }
  }

  return {
    total: result.assignments.length,
    assigned: assignedList.length,
    unassigned: unassignedTasks.length,
    avgMatch:
      scores.length > 0
        ? Math.round((scores.reduce((s, x) => s + x, 0) / scores.length) * 100) /
          100
        : null,
    members: result.workload_summary.length,
    utilized: result.workload_summary.filter((w) => w.tasks_assigned > 0).length,
    perMember: [...grouped.entries()]
      .map(([id, v]) => ({ id, name: names.get(id) || id, ...v }))
      .sort((a, b) => b.count - a.count || b.sp - a.sp),
    unassignedTasks,
    workload: [...result.workload_summary].sort(
      (a, b) => (b.workload_percentage ?? 0) - (a.workload_percentage ?? 0)
    ),
    scoreBands: bands,
  };
}

/** Resolver for member id → display name (team store first, then result). */
export function nameResolver(
  team: TeamMember[],
  workload?: WorkloadSummary[]
): (id: string) => string {
  const map = new Map<string, string>();
  for (const m of team) map.set(m.id, m.name || m.id);
  if (workload)
    for (const w of workload) map.set(w.member_id, w.name || w.member_id);
  return (id: string) => map.get(id) || id;
}

/* ------------------------------------------------------------------ */
/* Burn-up series (scope vs allocated, cumulative by task deadline)    */
/* ------------------------------------------------------------------ */

export interface BurnupPoint {
  label: string;
  demand: number;
  allocated: number;
  unassigned: number;
  today?: boolean;
}

export interface Burnup {
  points: BurnupPoint[];
  totals: { demand: number; allocated: number; unassigned: number };
  todayIndex: number | null;
  hasData: boolean;
}

/**
 * Builds an honest burn-up from the latest backend run:
 * tasks are ordered by deadline, "demand" is the cumulative story points
 * due, "allocated" is the cumulative story points the engine assigned.
 * A red "today" marker is inserted at the current date.
 */
export function burnupFromResult(
  result: AssignmentResponse | null,
  tasks: Task[]
): Burnup {
  const totals = { demand: 0, allocated: 0, unassigned: 0 };
  if (!result || result.assignments.length === 0)
    return { points: [], totals, todayIndex: null, hasData: false };

  const deadlineById = new Map(tasks.map((t) => [t.id, t.deadline]));
  const events: Array<{ date: string; sp: number; ok: boolean }> = [];
  for (const a of result.assignments) {
    const date = deadlineById.get(a.task_id);
    if (!date) continue;
    events.push({ date, sp: a.story_points ?? 0, ok: a.assigned_to !== "UNASSIGNED" });
  }
  if (events.length === 0)
    return { points: [], totals, todayIndex: null, hasData: false };

  events.sort((x, y) => x.date.localeCompare(y.date));
  const dates = [...new Set(events.map((e) => e.date))].sort();
  const today = todayISO();

  const points: BurnupPoint[] = [];
  let demand = 0;
  let allocated = 0;
  let insertedToday = false;

  const push = (iso: string, isToday = false) =>
    points.push({
      label: formatShortDate(iso),
      demand,
      allocated,
      unassigned: demand - allocated,
      today: isToday || undefined,
    });

  for (const date of dates) {
    if (!insertedToday && today < date) {
      push(today, true);
      insertedToday = true;
    }
    for (const e of events) {
      if (e.date !== date) continue;
      demand += e.sp;
      if (e.ok) allocated += e.sp;
    }
    const markToday = !insertedToday && today === date;
    if (markToday) insertedToday = true;
    push(date, markToday);
  }
  if (!insertedToday) push(today, true);

  totals.demand = demand;
  totals.allocated = allocated;
  totals.unassigned = demand - allocated;
  return {
    points,
    totals,
    todayIndex: points.findIndex((p) => p.today),
    hasData: true,
  };
}
