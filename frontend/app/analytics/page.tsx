"use client";

import { useMemo, type ComponentType, type CSSProperties } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Crosshair,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useTeamStore } from "@/store/teamStore";
import { useTaskStore } from "@/store/taskStore";
import {
  teamCapacity,
  memberUtilization,
  taskStats,
  experienceMix,
  skillGaps,
  utilizationColor,
  priorityColor,
  scoreColor,
} from "@/lib/derive";
import { resultStats } from "@/lib/burnup";
import { useMounted } from "@/lib/useMounted";
import { COLORS, SPACING } from "@/lib/theme";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Panel } from "@/components/ui/Panel";
import { StatTile } from "@/components/ui/StatTile";
import { Tag } from "@/components/ui/Tag";
import { KeyValue } from "@/components/ui/KeyValue";
import { DashedCta } from "@/components/ui/DashedCta";
import { Button } from "@/components/ui/Button";
import { HBarList } from "@/components/charts/HBarList";
import { BarsChart } from "@/components/charts/BarsChart";
import { DonutChart } from "@/components/charts/DonutChart";

/**
 * Analytics — deep-dive into team capacity, task distribution, workload
 * and assignment quality. Every figure is derived from the team/task
 * stores and the latest backend engine run.
 */
export default function AnalyticsPage() {
  const { team } = useTeamStore();
  const { tasks, lastAssignmentResult } = useTaskStore();
  const mounted = useMounted();

  const capacity = useMemo(() => teamCapacity(team), [team]);
  const utilization = useMemo(() => memberUtilization(team), [team]);
  const stats = useMemo(() => taskStats(tasks), [tasks]);
  const expMix = useMemo(() => experienceMix(team), [team]);
  const gaps = useMemo(() => skillGaps(tasks, team), [tasks, team]);
  const result = useMemo(
    () => resultStats(lastAssignmentResult, team),
    [lastAssignmentResult, team]
  );

  const insights = useMemo(() => {
    const list: Array<{
      icon: ComponentType<{
        size?: number | string;
        strokeWidth?: number | string;
        color?: string;
        style?: CSSProperties;
      }>;
      tone: "completed" | "started" | "alert" | "scope";
      text: string;
    }> = [];
    if (team.length > 0) {
      const top = [...utilization].sort((a, b) => b.pct - a.pct)[0];
      if (top) {
        list.push({
          icon: Users,
          tone: top.pct >= 80 ? "alert" : top.pct >= 50 ? "started" : "completed",
          text: `${top.name} carries the highest utilization at ${top.pct}% of raw capacity.`,
        });
      }
    }
    if (gaps.length > 0) {
      const uncovered = gaps.filter((g) => g.coverage === 0 && g.demand > 0);
      if (uncovered.length > 0) {
        list.push({
          icon: AlertTriangle,
          tone: "alert",
          text: `${uncovered.length} skill${uncovered.length === 1 ? "" : "s"} demanded by tasks but not covered by anyone: ${uncovered.slice(0, 3).map((g) => g.skill).join(", ")}.`,
        });
      }
      list.push({
        icon: Crosshair,
        tone: "scope",
        text: `Most demanded skill: ${gaps[0].skill} (${gaps[0].demand} task${gaps[0].demand === 1 ? "" : "s"}, ${gaps[0].coverage} member${gaps[0].coverage === 1 ? "" : "s"} covering).`,
      });
    }
    if (stats.overdue.length > 0) {
      list.push({
        icon: AlertTriangle,
        tone: "alert",
        text: `${stats.overdue.length} task${stats.overdue.length === 1 ? " is" : "s are"} past their deadline.`,
      });
    }
    if (result) {
      if (result.unassigned > 0) {
        list.push({
          icon: AlertTriangle,
          tone: "alert",
          text: `${result.unassigned} task${result.unassigned === 1 ? "" : "s"} could not be assigned in the latest run — check skills or capacity.`,
        });
      } else {
        list.push({
          icon: CheckCircle2,
          tone: "completed",
          text: "Latest run assigned every task in the backlog.",
        });
      }
      if (result.avgMatch != null) {
        list.push({
          icon: Target,
          tone: result.avgMatch >= 0.8 ? "completed" : result.avgMatch >= 0.6 ? "started" : "alert",
          text: `Average match score is ${result.avgMatch.toFixed(2)} across ${result.assigned} assigned task${result.assigned === 1 ? "" : "s"}.`,
        });
      }
    }
    if (list.length === 0) {
      list.push({
        icon: Activity,
        tone: "scope",
        text: "Add team members and tasks to unlock insights.",
      });
    }
    return list;
  }, [team.length, utilization, gaps, stats.overdue.length, result]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        breadcrumb={["Workspace", "Analytics"]}
        title="Analytics"
        description="Capacity, distribution and quality metrics derived from your roster, backlog and the latest engine run."
        actions={
          <Link href="/assignments" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="medium">
              Open tasks <ArrowRight size={14} strokeWidth={1.5} />
            </Button>
          </Link>
        }
      />

      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: SPACING.md,
          marginBottom: SPACING.xl,
        }}
      >
        <StatTile label="Capacity" value={`${capacity.capacity} SP`} sub={`${capacity.effective} SP effective`} icon={<Users size={16} strokeWidth={1.5} />} />
        <StatTile label="Allocated" value={`${capacity.utilized} SP`} sub={`${capacity.utilizationPct}% of capacity`} accent={utilizationColor(capacity.utilizationPct)} />
        <StatTile label="Available" value={`${capacity.available} SP`} sub="raw headroom" />
        <StatTile label="Demand" value={`${stats.totalSP} SP`} sub={`${stats.total} queued task${stats.total === 1 ? "" : "s"}`} icon={<TrendingUp size={16} strokeWidth={1.5} />} />
      </div>

      <PageShell
        aside={
          <>
            {/* Experience mix */}
            <Panel title="Experience mix">
              <DonutChart
                data={expMix.map((e) => ({ name: e.level, value: e.count, color: e.color }))}
                centerValue={`${team.length}`}
                centerLabel="members"
                height={150}
              />
            </Panel>

            {/* Supply vs demand */}
            <Panel title="Supply vs demand" style={{ marginTop: SPACING.md }}>
              <KeyValue
                rows={[
                  { label: "Capacity", value: `${capacity.capacity} SP` },
                  { label: "Effective", value: `${capacity.effective} SP` },
                  { label: "Allocated", value: `${capacity.utilized} SP` },
                  { label: "Demand", value: `${stats.totalSP} SP` },
                  {
                    label: "Coverage",
                    value:
                      stats.totalSP > 0 ? (
                        <Tag
                          size="sm"
                          variant={capacity.effective >= stats.totalSP ? "completed" : "alert"}
                        >
                          {Math.min(999, Math.round((capacity.effective / stats.totalSP) * 100))}%
                        </Tag>
                      ) : (
                        "—"
                      ),
                    },
                  { label: "Overdue", value: `${stats.overdue.length} task${stats.overdue.length === 1 ? "" : "s"}` },
                ]}
              />
            </Panel>

            {/* Engine output summary */}
            <Panel title="Engine output" style={{ marginTop: SPACING.md }}>
              {result ? (
                <KeyValue
                  rows={[
                    { label: "Assigned", value: `${result.assigned}/${result.total}` },
                    { label: "Avg match", value: result.avgMatch != null ? result.avgMatch.toFixed(2) : "—" },
                    { label: "Members used", value: `${result.utilized}/${result.members}` },
                    { label: "Unassigned", value: `${result.unassigned}` },
                  ]}
                />
              ) : (
                <p style={{ margin: 0, fontSize: 12, color: COLORS.text.placeholder }}>
                  Run the engine to capture output metrics here.
                </p>
              )}
              <div style={{ marginTop: SPACING.base }}>
                <DashedCta
                  label="Open Tasks & Assignments"
                  sub="Queue work and run the engine"
                  href="/assignments"
                />
              </div>
            </Panel>

          </>
        }
      >
        {/* Team capacity */}
        <Panel
          title="Team capacity"
          subtitle="Current SP vs raw capacity per member."
          style={{ marginBottom: SPACING.md }}
        >
          <HBarList
            items={utilization.map((u) => ({
              label: u.name,
              value: `${u.current}/${u.capacity} SP · ${u.pct}%`,
              pct: u.pct,
              color: utilizationColor(u.pct),
            }))}
          />
        </Panel>

        {/* Workload distribution from latest run */}
        <Panel
          title="Workload distribution"
          subtitle={
            result && result.workload.length > 0
              ? "workload_percentage per member from the latest engine run."
              : "Appears after the first engine run."
          }
          style={{ marginBottom: SPACING.md }}
        >
          {result && result.workload.length > 0 && mounted ? (
            <BarsChart
              data={result.workload.map((w) => ({
                member: w.name || w.member_id,
                workload: Math.round(w.workload_percentage ?? 0),
              }))}
              xKey="member"
              yKey="workload"
              name="Workload %"
              colors={result.workload.map((w) => utilizationColor(w.workload_percentage ?? 0))}
              height={220}
            />
          ) : (
            <div
              className="chart-skeleton"
              style={{
                height: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.text.placeholder,
                fontSize: 12,
                padding: 16,
                textAlign: "center",
              }}
            >
              {mounted ? "No engine run yet — run the assignment engine to populate workload analytics." : ""}
            </div>
          )}
        </Panel>

        {/* Task distribution */}
        <Panel
          title="Task distribution"
          subtitle="Priority mix and story-point weight across the backlog."
          style={{ marginBottom: SPACING.md }}
        >
          {stats.total === 0 ? (
            <DashedCta
              label="No tasks defined yet"
              sub="Add tasks to see priority and deadline distributions"
              href="/assignments"
              icon={<Target size={16} strokeWidth={1.5} />}
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: SPACING.md,
              }}
            >
              <DonutChart
                data={stats.byPriority.map((p) => ({
                  name: p.priority,
                  value: p.count,
                  color: priorityColor(p.priority),
                }))}
                centerValue={`${stats.total}`}
                centerLabel="tasks"
                height={170}
              />
              {mounted && (
                <BarsChart
                  data={stats.byPriority.map((p) => ({ priority: p.priority, sp: p.sp }))}
                  xKey="priority"
                  yKey="sp"
                  name="Story points"
                  colors={stats.byPriority.map((p) => priorityColor(p.priority))}
                  height={170}
                />
              )}
            </div>
          )}
        </Panel>

        {/* Skill demand vs coverage */}
        <Panel
          title="Skill demand vs coverage"
          subtitle="How many tasks need each skill and how many members can do it."
          style={{ marginBottom: SPACING.md }}
        >
          <HBarList
            items={gaps.slice(0, 8).map((g) => ({
              label: g.skill,
              value: `${g.demand}↓ · ${g.coverage}↑`,
              pct:
                gaps[0] && gaps[0].demand > 0 ? (g.demand / gaps[0].demand) * 100 : 0,
              color: g.coverage === 0 && g.demand > 0 ? COLORS.accent.alert : COLORS.accent.scope,
            }))}
          />
          <p style={{ margin: `${SPACING.sm} 0 0 0`, fontSize: 11, color: COLORS.text.placeholder }}>
            ↓ demand (tasks) · ↑ coverage (members) · red = required by tasks but uncovered
          </p>
        </Panel>

        {/* Deadlines by month */}
        <Panel
          title="Deadlines by month"
          subtitle="Backlog weight per deadline month."
          style={{ marginBottom: SPACING.md }}
        >
          {stats.deadlineMonths.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12, color: COLORS.text.placeholder }}>
              No deadlines scheduled yet.
            </p>
          ) : (
            mounted && (
              <BarsChart
                data={stats.deadlineMonths.map((m) => ({ month: m.month, sp: m.sp, tasks: m.count }))}
                xKey="month"
                yKey="sp"
                name="Story points"
                color={COLORS.accent.started}
                height={200}
              />
            )
          )}
        </Panel>

        {/* Assignment quality */}
        <Panel
          title="Assignment quality"
          subtitle="match_score values from the latest engine run."
          style={{ marginBottom: SPACING.md }}
        >
          {!result ? (
            <DashedCta
              label="Run the engine to measure match quality"
              sub="Scores appear after your first run"
              href="/assignments"
              icon={<Target size={16} strokeWidth={1.5} />}
            />
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: SPACING.md,
                  marginBottom: SPACING.md,
                }}
              >
                <StatTile label="Avg match" value={result.avgMatch != null ? result.avgMatch.toFixed(2) : "—"} sub="mean score" />
                <StatTile label="Strong (≥ 0.8)" value={result.scoreBands.strong} accent={COLORS.accent.completed} />
                <StatTile label="Solid (0.6–0.8)" value={result.scoreBands.solid} accent={COLORS.accent.started} />
                <StatTile label="Weak (< 0.6)" value={result.scoreBands.weak} accent={COLORS.accent.alert} />
              </div>
              {mounted && (
                <BarsChart
                  data={(lastAssignmentResult?.assignments ?? [])
                    .filter((a) => a.assigned_to !== "UNASSIGNED" && typeof a.match_score === "number")
                    .map((a) => ({ task: a.task_id, match_score: a.match_score as number }))}
                  xKey="task"
                  yKey="match_score"
                  name="Match score"
                  colors={(lastAssignmentResult?.assignments ?? [])
                    .filter((a) => a.assigned_to !== "UNASSIGNED" && typeof a.match_score === "number")
                    .map((a) => scoreColor(a.match_score as number))}
                  height={200}
                />
              )}
            </>
          )}
        </Panel>

        {/* Assignments per member */}
        <Panel
          title="Assignments per member"
          subtitle="Task count and story points from the latest run."
          style={{ marginBottom: SPACING.md }}
        >
          {result && result.perMember.length > 0 ? (
            <HBarList
              items={result.perMember.map((m) => ({
                label: m.name,
                value: `${m.count} task${m.count === 1 ? "" : "s"} · ${m.sp} SP`,
                pct:
                  result.perMember[0] && result.perMember[0].count > 0
                    ? (m.count / result.perMember[0].count) * 100
                    : 0,
                color: COLORS.accent.scope,
              }))}
            />
          ) : (
            <p style={{ margin: 0, fontSize: 12, color: COLORS.text.placeholder }}>
              No assignments yet.
            </p>
          )}
        </Panel>

        {/* Auto insights */}
        <Panel title="Insights" subtitle="Derived from the current workspace data.">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {insights.map((insight, i) => {
              const Icon = insight.icon;
              const color =
                insight.tone === "alert"
                  ? COLORS.accent.alert
                  : insight.tone === "completed"
                    ? COLORS.accent.completed
                    : insight.tone === "started"
                      ? COLORS.accent.started
                      : COLORS.accent.scope;
              return (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Icon size={14} strokeWidth={1.5} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12.5, lineHeight: 1.6, color: COLORS.text.secondary }}>
                    {insight.text}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>

      </PageShell>
    </motion.div>
  );
}

