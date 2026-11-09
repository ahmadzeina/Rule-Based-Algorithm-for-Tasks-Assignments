"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useTeamStore } from "@/store/teamStore";
import { scoreColor, utilizationColor } from "@/lib/derive";
import { resultStats } from "@/lib/burnup";
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
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { BarsChart } from "@/components/charts/BarsChart";
import { DonutChart } from "@/components/charts/DonutChart";

/**
 * Assignment results — everything on this page is rendered exactly as
 * returned by the backend engine (assignments + workload_summary).
 */
export default function AssignmentResultsPage() {
  const router = useRouter();
  const { lastAssignmentResult, isLoading, error } = useTaskStore();
  const { tasks } = useTaskStore();
  const { team } = useTeamStore();
  const mounted = useMounted();

  const result = useMemo(
    () => resultStats(lastAssignmentResult, team),
    [lastAssignmentResult, team]
  );

  const memberNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const member of lastAssignmentResult?.workload_summary ?? []) {
      map.set(member.member_id, member.name || member.member_id);
    }
    for (const m of team) if (m.name && !map.has(m.id)) map.set(m.id, m.name);
    return map;
  }, [lastAssignmentResult, team]);

  const assignmentRows = useMemo(
    () =>
      (lastAssignmentResult?.assignments ?? []).map((a) => {
        const isUnassigned = a.assigned_to === "UNASSIGNED";
        const name = memberNameById.get(a.assigned_to) ?? a.assigned_to;
        return [
          <span key={`id-${a.task_id}`} style={{ fontWeight: 600 }}>{a.task_id ?? "—"}</span>,
          isUnassigned ? (
            <Tag key={`as-${a.task_id}`} variant="alert">UNASSIGNED</Tag>
          ) : (
            <span key={`as-${a.task_id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Avatar id={a.assigned_to} name={name} size={16} />
              {name}
            </span>
          ),
          String(a.story_points ?? "—"),
          typeof a.match_score === "number" ? (
            <span key={`sc-${a.task_id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Donut pct={a.match_score * 100} size={14} stroke={3} color={scoreColor(a.match_score)} />
              {a.match_score.toFixed(2)}
            </span>
          ) : (
            "—"
          ),
          a.skill_match ? (
            <Tag
              key={`sm-${a.task_id}`}
              size="sm"
              variant={
                a.skill_match === "No suitable match"
                  ? "alert"
                  : parseInt(a.skill_match, 10) >= 80
                    ? "completed"
                    : parseInt(a.skill_match, 10) >= 50
                      ? "started"
                      : "neutral"
              }
            >
              {a.skill_match}
            </Tag>
          ) : (
            "—"
          ),
        ];
      }),
    [lastAssignmentResult, memberNameById]
  );

  if (isLoading && !error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: 48 }}>
        <Spinner size={28} />
        <p style={{ marginTop: 16, color: COLORS.text.secondary }}>Loading assignment results…</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        breadcrumb={["Workspace", "Assignments", "Results"]}
        title="Assignment Results"
        description="Review how the engine allocated tasks across the team — scores and workload exactly as returned."
        tabs={[
          { label: "Tasks", href: "/assignments" },
          { label: "Results", href: "/assignments/results", active: true },
        ]}
        actions={
          <Link href="/assignments" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="medium">
              Back to tasks
            </Button>
          </Link>
        }
      />

      {!lastAssignmentResult || !result ? (
        <div className="card">
          <EmptyState
            icon={<ClipboardList size={32} strokeWidth={1.5} />}
            title={error ? "Results unavailable" : "No assignment results yet"}
            description={
              error ??
              "Run the assignment engine from the Tasks & Assignments page to generate results."
            }
            action={
              error ? undefined : { label: "Go to Tasks & Assignments", onClick: () => router.push("/assignments") }
            }
          />
          {error && (
            <div style={{ padding: `0 ${SPACING.lg} ${SPACING.lg}` }}>
              <ErrorState title="Assignment failed" message={error} />
            </div>
          )}
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: SPACING.md,
              marginBottom: SPACING.xl,
            }}
          >
            <StatTile
              label="Tasks assigned"
              value={`${result.assigned}/${result.total}`}
              sub="from latest engine run"
              accent={result.unassigned === 0 ? COLORS.accent.completed : undefined}
            />
            <StatTile
              label="Unassigned"
              value={result.unassigned}
              sub={result.unassigned > 0 ? "no suitable match" : "all covered"}
              accent={result.unassigned > 0 ? COLORS.accent.alert : COLORS.accent.completed}
            />
            <StatTile
              label="Members utilized"
              value={`${result.utilized}/${result.members}`}
              sub="with ≥1 task"
            />
            <StatTile
              label="Avg match score"
              value={result.avgMatch != null ? result.avgMatch.toFixed(2) : "—"}
              sub="mean match_score"
            />
          </div>

          <PageShell
            aside={
              <>
                {/* Workload donut */}
                <Panel title="Workload split" subtitle="Workload % per member (engine output).">
                  <DonutChart
                    data={result.workload.map((w) => ({
                      name: w.name || w.member_id,
                      value: Math.max(1, Math.round(w.tasks_assigned > 0 ? w.workload_percentage ?? 0 : 0)),
                      color: utilizationColor(w.workload_percentage ?? 0),
                    }))}
                    centerValue={`${Math.round(
                      result.workload.length > 0
                        ? result.workload.reduce((s, w) => s + (w.workload_percentage ?? 0), 0) /
                            result.workload.length
                        : 0
                    )}%`}
                    centerLabel="avg load"
                    height={150}
                  />
                </Panel>

                {/* Score bands */}
                <Panel title="Match quality" subtitle="Distribution of match scores." style={{ marginTop: SPACING.md }}>
                  <DonutChart
                    data={[
                      { name: "Strong ≥ 0.8", value: result.scoreBands.strong, color: COLORS.accent.completed },
                      { name: "Solid 0.6–0.8", value: result.scoreBands.solid, color: COLORS.accent.started },
                      { name: "Weak < 0.6", value: result.scoreBands.weak, color: COLORS.accent.alert },
                    ]}
                    centerValue={result.avgMatch != null ? result.avgMatch.toFixed(2) : "—"}
                    centerLabel="avg"
                    height={150}
                  />
                </Panel>

                {/* Unassigned tasks */}
                <Panel title="Unassigned" subtitle="Tasks the engine could not place." style={{ marginTop: SPACING.md }}>
                  {result.unassignedTasks.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 12, color: COLORS.text.placeholder }}>
                      Every task found a suitable match.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {result.unassignedTasks.map((a) => (
                        <div
                          key={a.task_id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 10px",
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.primary }}>
                            {a.task_id}
                          </span>
                          <span style={{ fontSize: 12, color: COLORS.text.secondary }}>{a.story_points} SP</span>
                          <span style={{ marginLeft: "auto" }}>
                            <Tag size="sm" variant="alert">{a.skill_match || "No suitable match"}</Tag>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>

                {/* Run context */}
                <Panel title="Run context" style={{ marginTop: SPACING.md }}>
                  <KeyValue
                    rows={[
                      { label: "Tasks in run", value: `${result.total}` },
                      { label: "Team size", value: `${result.members}` },
                      { label: "Backlog now", value: `${tasks.length} task${tasks.length === 1 ? "" : "s"}` },
                      {
                        label: "Top scorer",
                        value: result.perMember[0]
                          ? `${result.perMember[0].name} · ${result.perMember[0].count} task${result.perMember[0].count === 1 ? "" : "s"}`
                          : "—",
                      },
                    ]}
                  />
                  <Link href="/assignments" style={{ textDecoration: "none", display: "block", marginTop: SPACING.base }}>
                    <Button variant="secondary" size="medium" style={{ width: "100%" }}>
                      Re-run with edits <ArrowRight size={14} strokeWidth={1.5} />
                    </Button>
                  </Link>
                </Panel>

              </>
            }
          >
            {/* Assignments table */}
            <Panel
              title="Assignments"
              subtitle="Task-to-member allocation returned by the engine."
              style={{ marginBottom: SPACING.md }}
            >
              {assignmentRows.length === 0 ? (
                <p style={{ margin: 0, color: COLORS.text.secondary }}>No assignments returned by the backend.</p>
              ) : (
                <Table
                  headers={["Task", "Assigned to", "Story points", "Match score", "Skill match"]}
                  rows={assignmentRows}
                  minWidth={560}
                />
              )}
            </Panel>

            {/* Workload summary */}
            <Panel
              title="Workload summary"
              subtitle="Post-assignment workload per member — effective capacity = capacity_sp × efficiency."
              style={{ marginBottom: SPACING.md }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                {result.workload.map((w, idx) => {
                  const overloaded = w.status === "Overloaded";
                  const pct = Math.max(0, Math.min(w.workload_percentage ?? 0, 100));
                  return (
                    <div
                      key={w.member_id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 0",
                        borderBottom: idx < result.workload.length - 1 ? `1px solid ${COLORS.border}` : "none",
                        flexWrap: "wrap",
                      }}
                    >
                      <Avatar id={w.member_id} name={w.name} size={20} />
                      <div style={{ minWidth: 130 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.text.primary }}>
                          {w.name || w.member_id}
                        </p>
                        <span style={{ display: "inline-flex", gap: 4, marginTop: 2 }}>
                          <Tag size="sm" variant={overloaded ? "alert" : "completed"}>{w.status}</Tag>
                          <Tag size="sm">{w.tasks_assigned} task{w.tasks_assigned === 1 ? "" : "s"}</Tag>
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", gap: 8 }}>
                        <Donut pct={pct} color={utilizationColor(w.workload_percentage ?? 0)} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 4, borderRadius: 2, background: COLORS.border, overflow: "hidden" }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background: utilizationColor(w.workload_percentage ?? 0),
                                borderRadius: 2,
                              }}
                            />
                          </div>
                          <p style={{ margin: "3px 0 0 0", fontSize: 11, color: COLORS.text.secondary, fontVariantNumeric: "tabular-nums" }}>
                            {w.current_sp} of {Math.round(w.effective_capacity)} effective SP · {Math.round(w.workload_percentage)}%
                          </p>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: COLORS.text.secondary, fontVariantNumeric: "tabular-nums" }}>
                        ×{(w.efficiency ?? 1).toFixed(2)} eff
                      </span>
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* Match score by task */}
            <Panel
              title="Match score by task"
              subtitle="match_score per assigned task, as returned by the engine."
            >
              {mounted && result.perMember.length >= 0 && assignmentRows.length > 0 ? (
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
                  }}
                >
                  {mounted ? "No scored assignments in the latest run." : ""}
                </div>
              )}
            </Panel>

          </PageShell>
        </>
      )}
    </motion.div>
  );
}

