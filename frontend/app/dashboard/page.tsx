"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, ListChecks, Play, Users } from "lucide-react";
import { useTeamStore } from "@/store/teamStore";
import { useTaskStore } from "@/store/taskStore";
import {
  teamCapacity,
  memberUtilization,
  taskStats,
  experienceMix,
  skillGaps,
  utilizationColor,
  priorityTone,
  deadlineChip,
  formatShortDate,
} from "@/lib/derive";
import { burnupFromResult, resultStats } from "@/lib/burnup";
import { useMounted } from "@/lib/useMounted";
import { COLORS, SPACING } from "@/lib/theme";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Panel } from "@/components/ui/Panel";
import { StatTile } from "@/components/ui/StatTile";
import { Tag } from "@/components/ui/Tag";
import { Avatar } from "@/components/ui/Avatar";
import { Donut } from "@/components/ui/Donut";
import { KeyValue } from "@/components/ui/KeyValue";
import { DashedCta } from "@/components/ui/DashedCta";
import { Button } from "@/components/ui/Button";
import { HBarList } from "@/components/charts/HBarList";
import { BurnupChart, ChartLegend } from "@/components/charts/BurnupChart";
import { DonutChart } from "@/components/charts/DonutChart";

/**
 * Dashboard — live overview of the workspace: capacity KPIs, the delivery
 * burn-up from the latest backend run, workload per member, the task queue
 * and the right analytics panel (assignees / skills / deadlines + mixes).
 */
export default function DashboardPage() {
  const { team } = useTeamStore();
  const { tasks, lastAssignmentResult } = useTaskStore();
  const mounted = useMounted();
  const [asideTab, setAsideTab] = useState<"assignees" | "skills" | "deadlines">("assignees");

  const capacity = useMemo(() => teamCapacity(team), [team]);
  const stats = useMemo(() => taskStats(tasks), [tasks]);
  const utilization = useMemo(() => memberUtilization(team), [team]);
  const expMix = useMemo(() => experienceMix(team), [team]);
  const gaps = useMemo(() => skillGaps(tasks, team), [tasks, team]);
  const result = useMemo(
    () => resultStats(lastAssignmentResult, team),
    [lastAssignmentResult, team]
  );
  const burnup = useMemo(
    () => burnupFromResult(lastAssignmentResult, tasks),
    [lastAssignmentResult, tasks]
  );

  // Workload per member: backend result when available, else store data
  const workloadItems = useMemo(() => {
    if (result && result.workload.length > 0) {
      return result.workload.map((w) => ({
        label: w.name || w.member_id,
        value: `${Math.round(w.workload_percentage)}%`,
        pct: w.workload_percentage,
        color: utilizationColor(w.workload_percentage),
      }));
    }
    return utilization.map((u) => ({
      label: u.name,
      value: `${u.current}/${u.capacity} SP`,
      pct: u.pct,
      color: utilizationColor(u.pct),
    }));
  }, [result, utilization]);

  const asideRows = useMemo(() => {
    if (asideTab === "skills") {
      const maxDemand = Math.max(1, ...gaps.map((g) => g.demand));
      return gaps.slice(0, 6).map((g) => ({
        key: g.skill,
        label: g.skill,
        value: `${g.demand} task${g.demand === 1 ? "" : "s"} · ${g.coverage} member${g.coverage === 1 ? "" : "s"}`,
        pct: (g.demand / maxDemand) * 100,
        color: COLORS.accent.scope,
      }));
    }
    if (asideTab === "deadlines") {
      const maxSp = Math.max(1, ...stats.deadlineMonths.map((m) => m.sp));
      return stats.deadlineMonths.map((m) => ({
        key: m.month,
        label: m.month,
        value: `${m.count} task${m.count === 1 ? "" : "s"} · ${m.sp} SP`,
        pct: (m.sp / maxSp) * 100,
        color: COLORS.accent.started,
      }));
    }
    const workloadById = new Map((result?.workload ?? []).map((w) => [w.member_id, w]));
    return utilization.map((u) => {
      const w = workloadById.get(u.id);
      const pct = w ? w.workload_percentage : u.pct;
      const cap = w ? w.effective_capacity : u.capacity;
      return {
        key: u.id,
        label: u.name,
        value: `${Math.round(pct)}% of ${Math.round(cap)} SP`,
        pct,
        color: utilizationColor(pct),
      };
    });
  }, [asideTab, gaps, stats.deadlineMonths, utilization, result]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        breadcrumb={["Workspace", "Dashboard"]}
        title="Dashboard"
        description="Live capacity, allocation and delivery metrics across your team and task queue."
        actions={
          <>
            <Link href="/assignments" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="medium">
                <Play size={14} strokeWidth={1.5} /> Run engine
              </Button>
            </Link>
            {result && (
              <Link href="/assignments/results" style={{ textDecoration: "none" }}>
                <Button variant="primary" size="medium">
                  View results <ArrowRight size={14} strokeWidth={1.5} />
                </Button>
              </Link>
            )}
          </>
        }
      />

      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: SPACING.md,
          marginBottom: SPACING.xl,
        }}
      >
        <StatTile
          label="Team members"
          value={capacity.members}
          sub={expMix.map((e) => `${e.count} ${e.level}`).join(" · ")}
          icon={<Users size={16} strokeWidth={1.5} />}
        />
        <StatTile
          label="Capacity"
          value={`${capacity.capacity} SP`}
          sub={`${capacity.effective} SP effective`}
          icon={<ListChecks size={16} strokeWidth={1.5} />}
        />
        <StatTile
          label="Allocated"
          value={`${capacity.utilizationPct}%`}
          sub={`${capacity.utilized} of ${capacity.capacity} SP`}
          accent={utilizationColor(capacity.utilizationPct)}
        />
        <StatTile
          label="Task demand"
          value={`${stats.totalSP} SP`}
          sub={`${stats.total} task${stats.total === 1 ? "" : "s"} · ${stats.overdue.length} overdue`}
          accent={stats.overdue.length > 0 ? COLORS.accent.alert : undefined}
          icon={<CalendarDays size={16} strokeWidth={1.5} />}
        />
      </div>

      <PageShell
        aside={
          <>
            {/* Assignees / skills / deadlines — design.md §5D */}
            <Panel
              title="Distribution"
              actions={
                <div style={{ display: "flex", gap: 4 }}>
                  {(["assignees", "skills", "deadlines"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setAsideTab(tab)}
                      style={{
                        height: 22,
                        padding: "0 10px",
                        borderRadius: 11,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: 11,
                        fontWeight: 500,
                        background: asideTab === tab ? COLORS.tint.scope : "transparent",
                        color: asideTab === tab ? COLORS.accent.scope : COLORS.text.secondary,
                        textTransform: "capitalize",
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              }
            >
              {asideTab === "assignees" ? (
                asideRows.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 12, color: COLORS.text.placeholder }}>
                    No team members yet.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {asideRows.map((row) => (
                      <div key={row.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar id={row.key} name={row.label} size={20} />
                        <span
                          style={{
                            fontSize: 13,
                            color: COLORS.text.primary,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.label}
                        </span>
                        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                          <Donut pct={row.pct} color={row.color} />
                          <span style={{ fontSize: 12, color: COLORS.text.secondary, whiteSpace: "nowrap" }}>
                            {row.value}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <HBarList items={asideRows} />
              )}
            </Panel>

            {/* Priority mix */}
            <Panel title="Priority mix" style={{ marginTop: SPACING.md }}>
              <DonutChart
                data={stats.byPriority.map((p) => ({
                  name: p.priority,
                  value: p.count,
                  color:
                    p.priority === "High"
                      ? COLORS.accent.alert
                      : p.priority === "Medium"
                        ? COLORS.accent.started
                        : COLORS.accent.scope,
                }))}
                centerValue={`${stats.total}`}
                centerLabel="tasks"
                height={150}
              />
            </Panel>

            {/* Experience mix */}
            <Panel title="Experience mix" style={{ marginTop: SPACING.md }}>
              <DonutChart
                data={expMix.map((e) => ({ name: e.level, value: e.count, color: e.color }))}
                centerValue={`${team.length}`}
                centerLabel="members"
                height={150}
              />
            </Panel>

            {/* Engine output */}
            <Panel title="Engine output" style={{ marginTop: SPACING.md }}>
              {result ? (
                <>
                  <KeyValue
                    rows={[
                      { label: "Assigned", value: `${result.assigned} / ${result.total}` },
                      {
                        label: "Avg match",
                        value: result.avgMatch != null ? result.avgMatch.toFixed(2) : "—",
                      },
                      {
                        label: "Members used",
                        value: `${result.utilized} / ${result.members}`,
                      },
                      {
                        label: "Unassigned",
                        value:
                          result.unassigned > 0 ? (
                            <Tag variant="alert" size="sm">{result.unassigned}</Tag>
                          ) : (
                            <Tag variant="completed" size="sm">0</Tag>
                          ),
                      },
                    ]}
                  />
                  <Link href="/assignments/results" style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="medium" style={{ width: "100%", marginTop: SPACING.base }}>
                      Open full results <ArrowRight size={14} strokeWidth={1.5} />
                    </Button>
                  </Link>
                </>
              ) : (
                <DashedCta
                  label="Run the assignment engine"
                  sub="Assignments & workload appear here"
                  href="/assignments"
                  icon={<Play size={16} strokeWidth={1.5} />}
                />
              )}
            </Panel>

          </>
        }
      >
        {/* Delivery curve */}
        <Panel
          title="Delivery curve"
          subtitle={
            burnup.hasData
              ? "Cumulative demand vs allocated story points, ordered by task deadline (latest engine run)."
              : "Run the engine to plot demand against allocation."
          }
          actions={burnup.hasData ? <Tag variant="scope" size="sm">latest run</Tag> : undefined}
          style={{ marginBottom: SPACING.md }}
        >
          {burnup.hasData && mounted ? (
            <>
              <BurnupChart points={burnup.points} todayIndex={burnup.todayIndex} />
              <ChartLegend
                items={[
                  { label: "Scope", value: `${burnup.totals.demand} SP`, color: COLORS.accent.scope },
                  { label: "Allocated", value: `${burnup.totals.allocated} SP`, color: COLORS.accent.completed },
                  { label: "Unallocated", value: `${burnup.totals.unassigned} SP`, color: COLORS.accent.alert },
                ]}
              />
            </>
          ) : (
            <div
              className="chart-skeleton"
              style={{
                height: 240,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.text.placeholder,
                fontSize: 12,
                padding: 16,
                textAlign: "center",
              }}
            >
              {mounted
                ? "No engine run yet — the burn-up curve appears after your first assignment run."
                : ""}
            </div>
          )}
        </Panel>

        {/* Workload by member */}
        <Panel
          title="Workload by member"
          subtitle={
            result && result.workload.length > 0
              ? "Workload percentage as returned by the engine for the latest run."
              : "Current SP vs raw capacity from the team roster."
          }
          style={{ marginBottom: SPACING.md }}
        >
          <HBarList items={workloadItems} />
          <p style={{ margin: `${SPACING.base} 0 0 0`, fontSize: 11, color: COLORS.text.placeholder }}>
            Green &lt; 50% · Gold 50-79% · Red ≥ 80% of capacity
          </p>
        </Panel>

        {/* Task queue */}
        <Panel
          title="Task queue"
          subtitle="Next tasks in engine order — priority first, then deadline."
          actions={
            <Link href="/assignments" style={{ textDecoration: "none", fontSize: 12, color: COLORS.accent.scope }}>
              Manage tasks →
            </Link>
          }
          style={{ marginBottom: SPACING.md }}
        >
          {stats.next.length === 0 ? (
            <DashedCta
              label="No tasks queued yet"
              sub="Add tasks to see them ordered for assignment"
              href="/assignments"
              icon={<ListChecks size={16} strokeWidth={1.5} />}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {stats.next.map((t, idx) => {
                const chip = deadlineChip(t.deadline);
                return (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 0",
                      borderBottom:
                        idx < stats.next.length - 1 ? `1px solid ${COLORS.border}` : "none",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.primary, minWidth: 72 }}>
                      {t.id}
                    </span>
                    <Tag variant={priorityTone(t.priority)} size="sm">{t.priority}</Tag>
                    <Tag variant={chip.tone} size="sm">{chip.label}</Tag>
                    <span style={{ fontSize: 12, color: COLORS.text.secondary }}>
                      {t.deadline ? formatShortDate(t.deadline) : "—"}
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 500, color: COLORS.text.primary }}>
                      {t.story_points} SP
                    </span>
                    <span style={{ display: "flex", gap: 4, flexWrap: "wrap", flexBasis: "100%" }}>
                      {t.required_skills.slice(0, 4).map((s) => (
                        <Tag key={s} size="sm">{s}</Tag>
                      ))}
                      {t.required_skills.length > 4 && (
                        <Tag size="sm">+{t.required_skills.length - 4}</Tag>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Deadline radar */}
        <Panel title="Deadline radar" subtitle="Where the time pressure sits right now.">
          <KeyValue
            rows={[
              {
                label: "Overdue",
                value:
                  stats.overdue.length > 0 ? (
                    <Tag variant="alert" size="sm">{stats.overdue.length} task{stats.overdue.length === 1 ? "" : "s"}</Tag>
                  ) : (
                    <Tag variant="completed" size="sm">None</Tag>
                  ),
              },
              {
                label: "Due ≤ 7 days",
                value: `${stats.urgent.length} task${stats.urgent.length === 1 ? "" : "s"}`,
              },
              {
                label: "Nearest deadline",
                value:
                  stats.next.length > 0 && stats.next[0].deadline
                    ? `${stats.next[0].id} · ${formatShortDate(stats.next[0].deadline)}`
                    : "—",
              },
              {
                label: "Busiest month",
                value:
                  stats.deadlineMonths.length > 0
                    ? `${stats.deadlineMonths[0].month} · ${stats.deadlineMonths[0].sp} SP`
                    : "—",
              },
            ]}
          />
        </Panel>

      </PageShell>

    </motion.div>
  );
}

