"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Compass,
  Cpu,
  Crosshair,
  ListChecks,
  Scale,
  ShieldCheck,
  Target,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { useTeamStore } from "@/store/teamStore";
import { useTaskStore } from "@/store/taskStore";
import { teamCapacity, taskStats } from "@/lib/derive";
import { resultStats } from "@/lib/burnup";
import { COLORS, SPACING } from "@/lib/theme";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Panel } from "@/components/ui/Panel";
import { StatTile } from "@/components/ui/StatTile";
import { Tag } from "@/components/ui/Tag";
import { KeyValue } from "@/components/ui/KeyValue";
import { DashedCta } from "@/components/ui/DashedCta";
import { Button } from "@/components/ui/Button";

/**
 * Home / Overview — an introduction to the rule-based assignment model:
 * how it works, the exact scoring formula used by the backend engine
 * (backend/logic.py), a worked example and design principles. All live
 * numbers come from the workspace stores and the latest backend run.
 */

const STEPS = [
  {
    icon: Workflow,
    title: "1 · Order tasks by urgency",
    body: "Tasks are processed High → Medium → Low priority; within the same priority, earlier deadlines come first. Urgent work is never starved by easy work.",
  },
  {
    icon: Cpu,
    title: "2 · Capacity gate",
    body: "Each member has an effective capacity of capacity_sp × efficiency. A task is only eligible if it fits without pushing the member's workload over 100%.",
  },
  {
    icon: Crosshair,
    title: "3 · Skill gate",
    body: "Required skills are fuzzy-compared against member skills. The similarity must beat a threshold that adapts to priority: High 30%, Medium 40%, Low 50%.",
  },
  {
    icon: ShieldCheck,
    title: "4 · Experience gate",
    body: "Members below the task's minimum experience (Junior < Mid-level < Senior) are filtered out, so critical work lands on qualified people.",
  },
  {
    icon: Target,
    title: "5 · Score & assign",
    body: "Eligible members are scored and the best one wins the task. Ties are broken by fewest assigned tasks, then lowest workload — a fairness guarantee.",
  },
];

const PRINCIPLES = [
  {
    icon: Scale,
    title: "Fairness",
    body: "Workload is balanced across the team; ties always favour the least-loaded member, preventing bottlenecks and burnout.",
  },
  {
    icon: BookOpen,
    title: "Transparency",
    body: "Every decision follows explicit, inspectable rules — no black box. Each assignment ships with its match score and skill match.",
  },
  {
    icon: Compass,
    title: "Adaptability",
    body: "Change the team, the tasks or a deadline and the very next run re-balances everything — no manual rescheduling.",
  },
  {
    icon: BarChart3,
    title: "Scalability",
    body: "A greedy single pass over sorted tasks keeps runs fast and predictable, from a handful of members to hundreds of tasks.",
  },
];

export default function HomePage() {
  const { team } = useTeamStore();
  const { tasks, lastAssignmentResult } = useTaskStore();

  const capacity = useMemo(() => teamCapacity(team), [team]);
  const stats = useMemo(() => taskStats(tasks), [tasks]);
  const result = useMemo(
    () => resultStats(lastAssignmentResult, team),
    [lastAssignmentResult, team]
  );

  const weights = [
    { label: "Skill match", pct: 50, color: COLORS.accent.scope },
    { label: "Availability", pct: 30, color: COLORS.accent.completed },
    { label: "Efficiency", pct: 10, color: COLORS.accent.started },
    { label: "Experience gap", pct: 10, color: COLORS.accent.alert },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        breadcrumb={["Workspace", "Overview"]}
        title="Intelligent Task Assignment"
        description="A rule-based engine that matches tasks to the right people using skills, experience, capacity and fairness — explained end to end."
        tabs={[
          { label: "How it works", href: "#how-it-works", active: true },
          { label: "Scoring", href: "#scoring" },
          { label: "Example", href: "#example" },
          { label: "Principles", href: "#principles" },
        ]}
        actions={
          <>
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <Button variant="primary" size="medium">
                Open Dashboard <ArrowRight size={14} strokeWidth={1.5} />
              </Button>
            </Link>
          </>
        }
      />

      <PageShell
        aside={
          <>
            <Panel title="Model at a glance">
              <KeyValue
                rows={[
                  {
                    label: "Endpoint",
                    value: (
                      <code style={{ fontSize: 12, color: COLORS.accent.scope }}>
                        POST /data/assign
                      </code>
                    ),
                  },
                  { label: "Strategy", value: "Greedy, priority-first" },
                  { label: "Skill weight", value: "50%" },
                  { label: "Availability weight", value: "30%" },
                  { label: "Efficiency weight", value: "10%" },
                  { label: "Experience weight", value: "10%" },
                  {
                    label: "Skill thresholds",
                    value: (
                      <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4 }}>
                        <Tag size="sm" variant="alert">High 30%</Tag>
                        <Tag size="sm" variant="started">Mid 40%</Tag>
                        <Tag size="sm" variant="scope">Low 50%</Tag>
                      </span>
                    ),
                  },
                  { label: "Max workload", value: "100% of effective capacity" },
                ]}
              />
            </Panel>

            <Panel title="Getting started" style={{ marginTop: SPACING.md }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <DashedCta label="1 · Add your team" sub="Skills, capacity, experience" href="/team" icon={<Users size={16} strokeWidth={1.5} />} />
                <DashedCta label="2 · Queue tasks" sub="Priority, deadline, story points" href="/assignments" icon={<ListChecks size={16} strokeWidth={1.5} />} />
                <DashedCta label="3 · Run the engine" sub="Get assignments & workload" href="/assignments" icon={<Zap size={16} strokeWidth={1.5} />} />
              </div>
            </Panel>

            <Panel title="Workspace status" style={{ marginTop: SPACING.md }}>
              <KeyValue
                rows={[
                  { label: "Team members", value: `${capacity.members}` },
                  { label: "Capacity", value: `${capacity.capacity} SP` },
                  { label: "Tasks queued", value: `${stats.total}` },
                  { label: "Demand", value: `${stats.totalSP} SP` },
                  {
                    label: "Last engine run",
                    value: result ? (
                      <Tag variant="completed" size="sm">
                        {result.assigned}/{result.total} assigned
                      </Tag>
                    ) : (
                      <Tag variant="neutral" size="sm">Not run yet</Tag>
                    ),
                  },
                ]}
              />
            </Panel>
          </>
        }
      >
        {/* Live workspace stats */}
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
            sub={`${capacity.capacity} SP capacity`}
            icon={<Users size={16} strokeWidth={1.5} />}
          />
          <StatTile
            label="Tasks queued"
            value={stats.total}
            sub={`${stats.totalSP} SP demand`}
            icon={<ListChecks size={16} strokeWidth={1.5} />}
          />
          <StatTile
            label="Avg match score"
            value={result?.avgMatch != null ? result.avgMatch.toFixed(2) : "—"}
            sub={result ? "from latest engine run" : "run the engine to compute"}
            icon={<Target size={16} strokeWidth={1.5} />}
          />
          <StatTile
            label="Allocation"
            value={result ? `${result.assigned}/${result.total}` : "—"}
            sub={result ? "tasks assigned" : "no results yet"}
            accent={result && result.unassigned === 0 ? COLORS.accent.completed : undefined}
            icon={<CheckCircle2 size={16} strokeWidth={1.5} />}
          />
        </div>

        {/* How it works */}
        <Panel
          id="how-it-works"
          title="How the engine works"
          subtitle="Five deterministic steps turn a team + a task list into fair assignments."
          style={{ marginBottom: SPACING.md }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: SPACING.md }}>
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} style={{ display: "flex", gap: 12 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: COLORS.tint.scope,
                      color: COLORS.accent.scope,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={15} strokeWidth={1.5} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.text.primary }}>
                      {step.title}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        fontSize: 12.5,
                        lineHeight: 1.6,
                        color: COLORS.text.secondary,
                      }}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Scoring */}
        <Panel
          id="scoring"
          title="Scoring formula"
          subtitle="The weight vector the engine optimises for every task–member pair."
          style={{ marginBottom: SPACING.md }}
        >
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12.5,
              color: COLORS.text.primary,
              background: COLORS.background.subtle,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: SPACING.md,
              overflowX: "auto",
              marginBottom: SPACING.md,
              whiteSpace: "nowrap",
            }}
          >
            score = 0.50 · skill_match + 0.30 · availability + 0.10 · efficiency + 0.10 · experience_gap
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {weights.map((w) => (
              <div key={w.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 120, fontSize: 13, color: COLORS.text.secondary, flexShrink: 0 }}>
                  {w.label}
                </span>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: COLORS.border, overflow: "hidden" }}>
                  <div style={{ width: `${w.pct * 2}%`, height: "100%", background: w.color, borderRadius: 2 }} />
                </div>
                <span
                  style={{
                    width: 36,
                    fontSize: 12,
                    color: COLORS.text.primary,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {w.pct}%
                </span>
              </div>
            ))}
          </div>
          <p style={{ margin: `${SPACING.md} 0 0 0`, fontSize: 12, color: COLORS.text.secondary }}>
            availability = remaining effective capacity · experience_gap = seniority levels above the
            requirement. Both push work towards people who have room and proven depth.
          </p>
        </Panel>

        {/* Example */}
        <Panel
          id="example"
          title="Worked example"
          subtitle="One task, five gates — from queue to assignee."
          style={{ marginBottom: SPACING.md }}
        >
          <KeyValue
            rows={[
              { label: "Task", value: <code style={{ fontSize: 12, color: COLORS.accent.scope }}>TASK-102</code> },
              {
                label: "Requires",
                value: (
                  <span style={{ display: "inline-flex", gap: 4 }}>
                    <Tag size="sm">Java</Tag>
                    <Tag size="sm">Spring</Tag>
                  </span>
                ),
              },
              { label: "Priority", value: <Tag size="sm" variant="alert">High</Tag> },
              { label: "Deadline", value: <Tag size="sm" variant="started">in 2 days</Tag> },
              { label: "Min experience", value: <Tag size="sm" variant="started">Mid-level</Tag> },
              { label: "Size", value: "8 SP" },
            ]}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: SPACING.md }}>
            {[
              "Filter the team to members holding Java and Spring (fuzzy skill similarity).",
              "Keep only Mid-level or Senior members — the experience gate.",
              "Drop anyone whose remaining effective capacity is below 8 SP.",
              "High-priority threshold is 30%, so only strong skill matches survive.",
              "Assign to the highest scorer; if scores tie, the least-loaded member wins.",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontSize: 11, color: COLORS.accent.scope, fontWeight: 600, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 12.5, color: COLORS.text.secondary }}>{line}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: SPACING.md, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <CheckCircle2 size={14} strokeWidth={1.5} color={COLORS.accent.completed} />
            <span style={{ fontSize: 12, color: COLORS.text.secondary }}>Result:</span>
            <Tag variant="completed" size="sm">assigned · match 0.87</Tag>
          </div>
        </Panel>

        {/* Principles */}
        <Panel id="principles" title="Why rule-based?" subtitle="Four properties you get for free.">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: SPACING.md,
            }}
          >
            {PRINCIPLES.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    padding: SPACING.md,
                    background: COLORS.background.subtle,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Icon size={15} strokeWidth={1.5} color={COLORS.accent.scope} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.primary }}>
                      {p.title}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: COLORS.text.secondary }}>
                    {p.body}
                  </p>
                </div>
              );
            })}
          </div>
        </Panel>


      </PageShell>
    </motion.div>
  );
}

