import type { TeamMember } from "@/store/teamStore";
import type { Task } from "@/store/taskStore";
import type { TagTone } from "@/components/ui/Tag";
import { COLORS } from "@/lib/theme";

/* ------------------------------------------------------------------ */
/* Small date helpers (all local-time, no UTC drift)                   */
/* ------------------------------------------------------------------ */

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function daysUntil(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return NaN;
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export interface DeadlineChip {
  label: string;
  tone: TagTone;
}

export function deadlineChip(iso: string): DeadlineChip {
  if (!iso) return { label: "No deadline", tone: "neutral" };
  const days = daysUntil(iso);
  if (Number.isNaN(days)) return { label: "No deadline", tone: "neutral" };
  if (days < 0) return { label: `${-days}d overdue`, tone: "alert" };
  if (days === 0) return { label: "Due today", tone: "started" };
  if (days <= 3) return { label: `${days}d left`, tone: "started" };
  return { label: `${days}d left`, tone: "neutral" };
}

/* ------------------------------------------------------------------ */
/* Color semantics                                                     */
/* ------------------------------------------------------------------ */

export type Priority = "High" | "Medium" | "Low";

export function priorityColor(priority: Priority): string {
  if (priority === "High") return COLORS.accent.alert;
  if (priority === "Medium") return COLORS.accent.started;
  return COLORS.accent.scope;
}

export function priorityTone(priority: Priority): TagTone {
  if (priority === "High") return "alert";
  if (priority === "Medium") return "started";
  return "scope";
}

export function experienceTone(level: TeamMember["experience"]): TagTone {
  if (level === "Senior") return "completed";
  if (level === "Mid-level") return "started";
  return "scope";
}

/** <50% green (relaxed), <80% gold (filling up), else red (hot). */
export function utilizationColor(pct: number): string {
  if (pct < 50) return COLORS.accent.completed;
  if (pct < 80) return COLORS.accent.started;
  return COLORS.accent.alert;
}

/** Match score color: >=0.8 strong, >=0.6 solid, else weak. */
export function scoreColor(score: number): string {
  if (score >= 0.8) return COLORS.accent.completed;
  if (score >= 0.6) return COLORS.accent.started;
  return COLORS.accent.alert;
}

/* ------------------------------------------------------------------ */
/* Team derivations                                                    */
/* ------------------------------------------------------------------ */

export interface TeamCapacity {
  members: number;
  capacity: number;
  utilized: number;
  available: number;
  /** capacity_sp × efficiency summed across the team (backend formula) */
  effective: number;
  utilizationPct: number;
}

export function teamCapacity(team: TeamMember[]): TeamCapacity {
  const capacity = team.reduce((s, m) => s + (m.capacity_sp || 0), 0);
  const utilized = team.reduce((s, m) => s + (m.current_sp || 0), 0);
  const effective = team.reduce(
    (s, m) => s + (m.capacity_sp || 0) * (m.efficiency || 1),
    0
  );
  return {
    members: team.length,
    capacity,
    utilized,
    available: capacity - utilized,
    effective: Math.round(effective * 10) / 10,
    utilizationPct: capacity > 0 ? Math.round((utilized / capacity) * 100) : 0,
  };
}

export interface MemberUtilization {
  id: string;
  name: string;
  current: number;
  capacity: number;
  effective: number;
  pct: number;
}

export function memberUtilization(team: TeamMember[]): MemberUtilization[] {
  return team.map((m) => {
    const effective = (m.capacity_sp || 0) * (m.efficiency || 1);
    return {
      id: m.id,
      name: m.name || m.id,
      current: m.current_sp || 0,
      capacity: m.capacity_sp || 0,
      effective: Math.round(effective * 10) / 10,
      pct:
        m.capacity_sp > 0
          ? Math.round(((m.current_sp || 0) / m.capacity_sp) * 100)
          : 0,
    };
  });
}

export function experienceMix(
  team: TeamMember[]
): Array<{ level: string; count: number; color: string }> {
  const levels = ["Junior", "Mid-level", "Senior"] as const;
  return levels.map((level) => ({
    level,
    count: team.filter((m) => m.experience === level).length,
    color:
      level === "Senior"
        ? COLORS.accent.completed
        : level === "Mid-level"
          ? COLORS.accent.started
          : COLORS.accent.scope,
  }));
}

/** demand: tasks requiring the skill; coverage: members who have it. */
export function skillGaps(
  tasks: Task[],
  team: TeamMember[]
): Array<{ skill: string; demand: number; coverage: number }> {
  const demand = new Map<string, { count: number; display: string }>();
  for (const t of tasks) {
    for (const s of t.required_skills) {
      const key = s.trim().toLowerCase();
      if (!key) continue;
      const e = demand.get(key) ?? { count: 0, display: s.trim() };
      e.count += 1;
      demand.set(key, e);
    }
  }
  const coverage = new Map<string, number>();
  for (const m of team) {
    for (const s of m.skills) {
      const key = s.trim().toLowerCase();
      if (!key) continue;
      coverage.set(key, (coverage.get(key) ?? 0) + 1);
    }
  }
  const keys = new Set([...demand.keys(), ...coverage.keys()]);
  return [...keys]
    .map((key) => ({
      skill: demand.get(key)?.display ?? key,
      demand: demand.get(key)?.count ?? 0,
      coverage: coverage.get(key) ?? 0,
    }))
    .sort((a, b) => b.demand - a.demand || b.coverage - a.coverage);
}

/* ------------------------------------------------------------------ */
/* Task derivations                                                    */
/* ------------------------------------------------------------------ */

export interface TaskStats {
  total: number;
  totalSP: number;
  byPriority: Array<{ priority: Priority; count: number; sp: number }>;
  skills: Array<{ skill: string; count: number }>;
  deadlineMonths: Array<{ month: string; count: number; sp: number }>;
  overdue: Task[];
  urgent: Task[];
  next: Task[];
}

export function taskStats(tasks: Task[]): TaskStats {
  const priorities: Priority[] = ["High", "Medium", "Low"];
  const count: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
  const sp: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
  const skillMap = new Map<string, number>();
  const monthMap = new Map<string, { count: number; sp: number }>();
  const overdue: Task[] = [];
  const today = todayISO();
  let totalSP = 0;

  for (const t of tasks) {
    totalSP += t.story_points || 0;
    count[t.priority] = (count[t.priority] ?? 0) + 1;
    sp[t.priority] = (sp[t.priority] ?? 0) + (t.story_points || 0);
    for (const s of t.required_skills) {
      const key = s.trim();
      if (!key) continue;
      skillMap.set(key, (skillMap.get(key) ?? 0) + 1);
    }
    const month = t.deadline ? t.deadline.slice(0, 7) : "No date";
    const e = monthMap.get(month) ?? { count: 0, sp: 0 };
    e.count += 1;
    e.sp += t.story_points || 0;
    monthMap.set(month, e);
    if (t.deadline && t.deadline < today) overdue.push(t);
  }

  const byDeadline = (a: Task, b: Task) =>
    (a.deadline || "9999-12-31").localeCompare(b.deadline || "9999-12-31");

  return {
    total: tasks.length,
    totalSP,
    byPriority: priorities.map((p) => ({ priority: p, count: count[p], sp: sp[p] })),
    skills: [...skillMap.entries()]
      .map(([skill, c]) => ({ skill, count: c }))
      .sort((a, b) => b.count - a.count),
    deadlineMonths: [...monthMap.entries()]
      .map(([month, v]) => ({ month, ...v }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    overdue,
    urgent: tasks.filter((t) => t.deadline && t.deadline <= addDaysISO(today, 7)),
    next: [...tasks].sort(byDeadline).slice(0, 5),
  };
}


