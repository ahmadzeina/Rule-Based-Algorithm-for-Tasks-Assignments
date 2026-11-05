"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ListPlus, Pencil, Play, RotateCcw, Trash2 } from "lucide-react";
import { useTaskStore, Task } from "@/store/taskStore";
import { useTeamStore } from "@/store/teamStore";
import {
  taskStats,
  skillGaps,
  priorityTone,
  priorityColor,
  deadlineChip,
  formatShortDate,
} from "@/lib/derive";
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
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { HBarList } from "@/components/charts/HBarList";
import { DonutChart } from "@/components/charts/DonutChart";

const EMPTY_FORM = {
  id: "",
  priority: "Medium" as Task["priority"],
  deadline: "",
  story_points: 5,
  required_skills: "",
  min_experience: "Junior" as NonNullable<Task["min_experience"]>,
};

export default function AssignmentsPage() {
  const router = useRouter();
  const {
    tasks,
    addTask,
    updateTask,
    removeTask,
    isLoading,
    error,
    lastAssignmentResult,
    executeAssignment,
    clearAssignmentResult,
  } = useTaskStore();
  const { team } = useTeamStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
    setEditingId(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id.trim()) newErrors.id = "Task ID is required";
    if (!formData.deadline) newErrors.deadline = "Deadline is required";
    if (formData.story_points < 1) newErrors.story_points = "Story points must be at least 1";
    if (!formData.required_skills.trim())
      newErrors.required_skills = "At least one skill is required";
    if (tasks.some((t) => t.id.toLowerCase() === formData.id.toLowerCase() && t.id !== editingId)) {
      newErrors.id = "Task ID already exists";
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(formData.deadline);
    if (deadline < today) {
      newErrors.deadline = "Deadline must be today or in the future";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const taskData: Task = {
      id: formData.id,
      priority: formData.priority,
      deadline: formData.deadline,
      story_points: formData.story_points,
      required_skills: formData.required_skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      min_experience: formData.min_experience,
    };

    if (editingId) {
      updateTask(editingId, taskData);
    } else {
      addTask(taskData);
    }
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (task: Task) => {
    setFormData({
      id: task.id,
      priority: task.priority,
      deadline: task.deadline,
      story_points: task.story_points,
      required_skills: task.required_skills.join(", "),
      min_experience: task.min_experience ?? "Junior",
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Delete task ${id}?`)) {
      removeTask(id);
      if (editingId === id) {
        setShowForm(false);
        resetForm();
      }
    }
  };

  const handleExecuteAssignment = async () => {
    try {
      await executeAssignment(team, tasks);
    } catch {
      // Error state is surfaced by the store; the UI renders it below.
    }
  };

  const stats = useMemo(() => taskStats(tasks), [tasks]);
  const gaps = useMemo(() => skillGaps(tasks, team), [tasks, team]);
  const result = useMemo(
    () => resultStats(lastAssignmentResult, team),
    [lastAssignmentResult, team]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        breadcrumb={["Workspace", "Tasks & Assignments"]}
        title="Tasks & Assignments"
        description="Define the backlog, then let the rule-based engine allocate every task to the best-suited member."
        tabs={[
          { label: "Tasks", href: "/assignments", active: true },
          { label: "Results", href: "/assignments/results" },
        ]}
        actions={
          <>
            <Button
              variant={showForm ? "secondary" : "primary"}
              size="medium"
              onClick={() => (showForm ? (setShowForm(false), resetForm()) : setShowForm(true))}
            >
              <ListPlus size={14} strokeWidth={1.5} /> {showForm ? "Close form" : "Add task"}
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={handleExecuteAssignment}
              disabled={team.length === 0 || tasks.length === 0 || isLoading}
              isLoading={isLoading}
            >
              <Play size={14} strokeWidth={1.5} /> Run engine
            </Button>
          </>
        }
      />

      <PageShell
        aside={
          <>
            {/* Priority mix */}
            <Panel title="Priority mix">
              <DonutChart
                data={stats.byPriority.map((p) => ({
                  name: p.priority,
                  value: p.count,
                  color: priorityColor(p.priority),
                }))}
                centerValue={`${stats.total}`}
                centerLabel="tasks"
                height={150}
              />
              <div style={{ marginTop: SPACING.base }}>
                <HBarList
                  items={stats.byPriority.map((p) => ({
                    label: `${p.priority} SP`,
                    value: `${p.sp} SP`,
                    pct: stats.totalSP > 0 ? (p.sp / stats.totalSP) * 100 : 0,
                    color: priorityColor(p.priority),
                  }))}
                />
              </div>
            </Panel>

            {/* Skill demand */}
            <Panel title="Skill demand" subtitle="Tasks requiring each skill vs team coverage." style={{ marginTop: SPACING.md }}>
              <HBarList
                items={gaps.slice(0, 7).map((g) => ({
                  label: g.skill,
                  value: `${g.demand}↓ ${g.coverage}↑`,
                  pct: gaps.length > 0 && g.demand > 0 ? (g.demand / gaps[0].demand) * 100 : 0,
                  color: g.coverage === 0 ? COLORS.accent.alert : COLORS.accent.scope,
                }))}
              />
              <p style={{ margin: `${SPACING.sm} 0 0 0`, fontSize: 11, color: COLORS.text.placeholder }}>
                ↓ demand (tasks) · ↑ coverage (members with the skill) · red = nobody covers it
              </p>
            </Panel>

            {/* Engine request */}
            <Panel title="Engine request" style={{ marginTop: SPACING.md }}>
              <KeyValue
                rows={[
                  {
                    label: "Endpoint",
                    value: <code style={{ fontSize: 12, color: COLORS.accent.scope }}>POST /data/assign</code>,
                  },
                  { label: "team[]", value: `${team.length} member${team.length === 1 ? "" : "s"}` },
                  { label: "tasks[]", value: `${tasks.length} task${tasks.length === 1 ? "" : "s"}` },
                  { label: "Demand", value: `${stats.totalSP} SP` },
                  { label: "Capacity", value: `${team.reduce((s, m) => s + m.capacity_sp, 0)} SP` },
                ]}
              />
            </Panel>

            {/* How the engine decides */}
            <Panel title="How the engine decides" style={{ marginTop: SPACING.md }}>
              <KeyValue
                rows={[
                  { label: "1 · Order", value: "Priority desc, then earliest deadline" },
                  { label: "2 · Capacity", value: "Task must fit effective capacity" },
                  { label: "3 · Skills", value: "Similarity ≥ 30/40/50% by priority" },
                  { label: "4 · Experience", value: "Member level ≥ min_experience" },
                  { label: "5 · Score", value: "0.5 skill + 0.3 avail + 0.1 eff + 0.1 gap" },
                ]}
              />
            </Panel>

          </>
        }
      >
        {/* KPI row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: SPACING.md,
            marginBottom: SPACING.md,
          }}
        >
          <StatTile label="Tasks" value={stats.total} sub={`${stats.totalSP} SP total`} />
          <StatTile
            label="High priority"
            value={stats.byPriority[0].count}
            sub={`${stats.byPriority[0].sp} SP`}
            accent={stats.byPriority[0].count > 0 ? COLORS.accent.alert : undefined}
          />
          <StatTile
            label="Overdue"
            value={stats.overdue.length}
            sub="past deadline"
            accent={stats.overdue.length > 0 ? COLORS.accent.alert : undefined}
          />
          <StatTile
            label="Engine run"
            value={result ? `${result.assigned}/${result.total}` : "—"}
            sub={result ? "assigned last run" : "not run yet"}
            accent={result && result.unassigned === 0 ? COLORS.accent.completed : undefined}
          />
        </div>

        {/* Add / edit task form */}
        {showForm && (
          <Panel
            title={editingId ? `Edit task · ${editingId}` : "New task"}
            subtitle="Exactly the shape the backend engine expects per tasks[] entry."
            style={{ marginBottom: SPACING.md }}
          >
            <form onSubmit={handleSubmit} noValidate>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: SPACING.md,
                }}
              >
                <Input
                  id="task-id"
                  label="Task ID *"
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  error={errors.id}
                  placeholder="TASK1"
                />
                <Select
                  id="task-priority"
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as Task["priority"] })
                  }
                  options={[
                    { value: "High", label: "High" },
                    { value: "Medium", label: "Medium" },
                    { value: "Low", label: "Low" },
                  ]}
                />
                <Input
                  id="task-deadline"
                  label="Deadline *"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  error={errors.deadline}
                />
                <Input
                  id="task-sp"
                  label="Story points *"
                  type="number"
                  min={1}
                  value={formData.story_points}
                  onChange={(e) => setFormData({ ...formData, story_points: Number(e.target.value) })}
                  error={errors.story_points}
                />
                <Input
                  id="task-skills"
                  label="Required skills *"
                  type="text"
                  value={formData.required_skills}
                  onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                  error={errors.required_skills}
                  placeholder="Python, Django"
                />
                <Select
                  id="task-experience"
                  label="Min experience"
                  value={formData.min_experience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_experience: e.target.value as NonNullable<Task["min_experience"]>,
                    })
                  }
                  options={[
                    { value: "Junior", label: "Junior" },
                    { value: "Mid-level", label: "Mid-level" },
                    { value: "Senior", label: "Senior" },
                  ]}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: SPACING.md }}>
                <Button
                  type="button"
                  variant="ghost"
                  size="medium"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="medium">
                  {editingId ? "Update task" : "Add task"}
                </Button>
              </div>
            </form>
          </Panel>
        )}

        {/* Loading state */}
        {isLoading && (
          <div
            className="card"
            style={{ padding: SPACING.lg, textAlign: "center", marginBottom: SPACING.md }}
          >
            <Spinner />
            <p style={{ margin: `${SPACING.base} 0 0 0`, color: COLORS.text.secondary }}>
              Running assignment engine…
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !lastAssignmentResult && (
          <div style={{ marginBottom: SPACING.md }}>
            <ErrorState
              title="Assignment failed"
              message={error}
              action={{ label: "Retry", onClick: handleExecuteAssignment }}
            />
          </div>
        )}

        {/* Task backlog */}
        <Panel
          title={`Backlog · ${stats.total} task${stats.total === 1 ? "" : "s"} · ${stats.totalSP} SP`}
          subtitle="Ordered by priority, then deadline — the same order the engine processes them."
          style={{ marginBottom: SPACING.md }}
        >
          {tasks.length === 0 ? (
            <DashedCta
              label="No tasks yet"
              sub="Click “Add task” to queue your first task"
              onClick={() => setShowForm(true)}
              icon={<ListPlus size={16} strokeWidth={1.5} />}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {tasks.map((task, idx) => {
                const chip = deadlineChip(task.deadline);
                return (
                  <div
                    key={task.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 0",
                      borderBottom: idx < tasks.length - 1 ? `1px solid ${COLORS.border}` : "none",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.primary, minWidth: 72 }}>
                      {task.id}
                    </span>
                    <Tag variant={priorityTone(task.priority)} size="sm">{task.priority}</Tag>
                    <Tag variant={chip.tone} size="sm">{chip.label}</Tag>
                    <span style={{ fontSize: 12, color: COLORS.text.secondary }}>
                      {task.deadline ? formatShortDate(task.deadline) : "—"}
                    </span>
                    <Tag size="sm">{task.min_experience ?? "Junior"}+</Tag>
                    <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 500, color: COLORS.text.primary }}>
                      {task.story_points} SP
                    </span>
                    <span style={{ display: "flex", gap: 4, flexWrap: "wrap", flexBasis: "100%" }}>
                      {task.required_skills.map((s) => (
                        <Tag key={s} size="sm">{s}</Tag>
                      ))}
                    </span>
                    <span style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                      <Button variant="ghost" size="small" onClick={() => handleEdit(task)} aria-label={`Edit ${task.id}`}>
                        <Pencil size={13} strokeWidth={1.5} />
                      </Button>
                      <Button variant="ghost" size="small" onClick={() => handleDelete(task.id)} aria-label={`Delete ${task.id}`}>
                        <Trash2 size={13} strokeWidth={1.5} />
                      </Button>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Run prompt / latest result preview */}
        {!lastAssignmentResult ? (
          <DashedCta
            label={
              team.length === 0
                ? "Add team members first"
                : tasks.length === 0
                  ? "Add tasks to assign"
                  : `Run the engine on ${tasks.length} task${tasks.length === 1 ? "" : "s"} across ${team.length} member${team.length === 1 ? "" : "s"}`
            }
            sub="POST /data/assign → assignments + workload summary"
            onClick={handleExecuteAssignment}
            icon={<Play size={16} strokeWidth={1.5} />}
          />
        ) : (
          <Panel
            title="Latest run"
            subtitle="Preview of the most recent engine execution."
            actions={
              <Button
                variant="ghost"
                size="small"
                onClick={() => clearAssignmentResult()}
                aria-label="Clear assignment result"
              >
                <RotateCcw size={13} strokeWidth={1.5} /> Clear
              </Button>
            }
          >
            <KeyValue
              rows={[
                { label: "Assigned", value: `${result?.assigned ?? 0} / ${result?.total ?? 0} tasks` },
                { label: "Members used", value: `${result?.utilized ?? 0} / ${result?.members ?? 0}` },
                { label: "Avg match", value: result?.avgMatch != null ? result.avgMatch.toFixed(2) : "—" },
                {
                  label: "Unassigned",
                  value:
                    result && result.unassigned > 0 ? (
                      <Tag variant="alert" size="sm">{result.unassigned}</Tag>
                    ) : (
                      <Tag variant="completed" size="sm">0</Tag>
                    ),
                },
              ]}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: SPACING.base }}>
              <Button
                variant="secondary"
                size="medium"
                onClick={() => router.push("/assignments/results")}
              >
                View full results →
              </Button>
            </div>
          </Panel>
        )}


      </PageShell>
    </motion.div>
  );
}

