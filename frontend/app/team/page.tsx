"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { useTeamStore, TeamMember } from "@/store/teamStore";
import { teamCapacity, memberUtilization, experienceMix, experienceTone, utilizationColor } from "@/lib/derive";
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
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { HBarList } from "@/components/charts/HBarList";
import { DonutChart } from "@/components/charts/DonutChart";

const EMPTY_FORM = {
  id: "",
  name: "",
  skills: "",
  capacity_sp: 10,
  current_sp: 0,
  experience: "Mid-level" as TeamMember["experience"],
  efficiency: 1.0,
};

export default function TeamPage() {
  const { team, setTeam } = useTeamStore();
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
    if (!formData.id.trim()) newErrors.id = "ID is required";
    if (!formData.skills.trim()) newErrors.skills = "At least one skill is required";
    if (formData.capacity_sp < 1) newErrors.capacity_sp = "Capacity must be at least 1";
    if (formData.current_sp < 0) newErrors.current_sp = "Current SP cannot be negative";
    if (formData.current_sp > formData.capacity_sp)
      newErrors.current_sp = "Current SP cannot exceed capacity";
    if (formData.efficiency < 0.5 || formData.efficiency > 2)
      newErrors.efficiency = "Efficiency must be between 0.5 and 2.0";
    if (
      team.some(
        (m) => m.id.toLowerCase() === formData.id.toLowerCase() && m.id !== editingId
      )
    ) {
      newErrors.id = "ID already exists";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const memberData = {
      id: formData.id,
      name: formData.name || undefined,
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      capacity_sp: formData.capacity_sp,
      current_sp: formData.current_sp,
      experience: formData.experience,
      efficiency: formData.efficiency,
    };

    if (editingId) {
      setTeam(team.map((m) => (m.id === editingId ? { ...m, ...memberData } : m)));
    } else {
      setTeam([...team, memberData]);
    }
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (member: TeamMember) => {
    setFormData({
      id: member.id,
      name: member.name || "",
      skills: member.skills.join(", "),
      capacity_sp: member.capacity_sp,
      current_sp: member.current_sp,
      experience: member.experience,
      efficiency: member.efficiency,
    });
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Delete team member ${id}?`)) {
      setTeam(team.filter((m) => m.id !== id));
      if (editingId === id) {
        setShowForm(false);
        resetForm();
      }
    }
  };

  const capacity = useMemo(() => teamCapacity(team), [team]);
  const utilization = useMemo(() => memberUtilization(team), [team]);
  const expMix = useMemo(() => experienceMix(team), [team]);
  const avgEfficiency = useMemo(
    () =>
      team.length > 0
        ? Math.round((team.reduce((s, m) => s + (m.efficiency || 1), 0) / team.length) * 100) / 100
        : 0,
    [team]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        breadcrumb={["Workspace", "Team"]}
        title="Team"
        description="The roster the engine assigns to — skills, experience, capacity and efficiency per member."
        actions={
          <Button
            variant={showForm ? "secondary" : "primary"}
            size="medium"
            onClick={() => (showForm ? (setShowForm(false), resetForm()) : setShowForm(true))}
          >
            <UserPlus size={14} strokeWidth={1.5} /> {showForm ? "Close form" : "Add member"}
          </Button>
        }
      />

      <PageShell
        aside={
          <>
            {/* Roster stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: SPACING.sm,
              }}
            >
              <StatTile label="Members" value={capacity.members} />
              <StatTile label="Capacity" value={`${capacity.capacity} SP`} sub={`${capacity.effective} SP effective`} />
              <StatTile label="Avg efficiency" value={`×${avgEfficiency.toFixed(2)}`} />
            </div>

            {/* Experience mix */}
            <Panel title="Experience mix" style={{ marginTop: SPACING.md }}>
              <DonutChart
                data={expMix.map((e) => ({ name: e.level, value: e.count, color: e.color }))}
                centerValue={`${team.length}`}
                centerLabel="members"
                height={150}
              />
            </Panel>

            {/* Utilization per member */}
            <Panel title="Utilization" subtitle="Current SP vs raw capacity." style={{ marginTop: SPACING.md }}>
              <HBarList
                items={utilization.map((u) => ({
                  label: u.name,
                  value: `${u.pct}%`,
                  pct: u.pct,
                  color: utilizationColor(u.pct),
                }))}
              />
            </Panel>

            {/* Effective capacity */}
            <Panel title="Effective capacity" subtitle="capacity_sp × efficiency, as the engine computes it." style={{ marginTop: SPACING.md }}>
              <KeyValue
                rows={utilization.map((u) => ({
                  label: u.name,
                  value: `${u.current} / ${u.effective} SP`,
                }))}
              />
            </Panel>

          </>
        }
      >
        {/* Add / edit form */}
        {showForm && (
          <Panel
            title={editingId ? `Edit member · ${editingId}` : "New team member"}
            subtitle="This is the exact shape the backend engine expects per team[] entry."
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
                  id="member-id"
                  label="ID *"
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  error={errors.id}
                  placeholder="TM3"
                />
                <Input
                  id="member-name"
                  label="Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alex Doe"
                />
                <Input
                  id="member-skills"
                  label="Skills *"
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  error={errors.skills}
                  placeholder="Python, Django"
                />
                <Select
                  id="member-experience"
                  label="Experience"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experience: e.target.value as TeamMember["experience"],
                    })
                  }
                  options={[
                    { value: "Junior", label: "Junior" },
                    { value: "Mid-level", label: "Mid-level" },
                    { value: "Senior", label: "Senior" },
                  ]}
                />
                <Input
                  id="member-capacity"
                  label="Capacity (SP) *"
                  type="number"
                  min={1}
                  value={formData.capacity_sp}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity_sp: Number(e.target.value) })
                  }
                  error={errors.capacity_sp}
                />
                <Input
                  id="member-current"
                  label="Current SP"
                  type="number"
                  min={0}
                  value={formData.current_sp}
                  onChange={(e) =>
                    setFormData({ ...formData, current_sp: Number(e.target.value) })
                  }
                  error={errors.current_sp}
                />
                <Input
                  id="member-efficiency"
                  label="Efficiency (0.5 – 2.0)"
                  type="number"
                  step="0.1"
                  value={formData.efficiency}
                  onChange={(e) =>
                    setFormData({ ...formData, efficiency: Number(e.target.value) })
                  }
                  error={errors.efficiency}
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
                  {editingId ? "Update member" : "Add member"}
                </Button>
              </div>
            </form>
          </Panel>
        )}

        {/* Member roster */}
        <Panel
          title={`Roster · ${team.length} member${team.length === 1 ? "" : "s"}`}
          subtitle="Utilization is current SP vs raw capacity; the engine uses capacity × efficiency."
          style={{ marginBottom: SPACING.md }}
        >
          {team.length === 0 ? (
            <DashedCta
              label="No team members yet"
              sub="Click “Add member” to create your first roster entry"
              onClick={() => setShowForm(true)}
              icon={<UserPlus size={16} strokeWidth={1.5} />}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {team.map((member, idx) => {
                const pct =
                  member.capacity_sp > 0
                    ? Math.round((member.current_sp / member.capacity_sp) * 100)
                    : 0;
                return (
                  <div
                    key={member.id || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 0",
                      borderBottom: idx < team.length - 1 ? `1px solid ${COLORS.border}` : "none",
                      flexWrap: "wrap",
                    }}
                  >
                    <Avatar id={member.id} name={member.name} size={24} />
                    <div style={{ minWidth: 140 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.text.primary }}>
                        {member.name || member.id}
                        {member.name && (
                          <span style={{ fontWeight: 400, color: COLORS.text.secondary }}> · {member.id}</span>
                        )}
                      </p>
                      <span style={{ display: "inline-flex", gap: 4, marginTop: 2, flexWrap: "wrap" }}>
                        <Tag size="sm" variant={experienceTone(member.experience)}>
                          {member.experience}
                        </Tag>
                        <Tag size="sm">×{member.efficiency.toFixed(1)}</Tag>
                      </span>
                    </div>
                    <span style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1, minWidth: 160 }}>
                      {member.skills.length > 0 ? (
                        member.skills.slice(0, 5).map((s) => <Tag key={s} size="sm">{s}</Tag>)
                      ) : (
                        <span style={{ fontSize: 12, color: COLORS.text.placeholder }}>No skills</span>
                      )}
                      {member.skills.length > 5 && <Tag size="sm">+{member.skills.length - 5}</Tag>}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 150 }}>
                      <Donut pct={pct} color={utilizationColor(pct)} />
                      <div style={{ flex: 1, minWidth: 70 }}>
                        <p style={{ margin: 0, fontSize: 12, color: COLORS.text.primary, fontVariantNumeric: "tabular-nums" }}>
                          {member.current_sp}/{member.capacity_sp} SP
                        </p>
                        <div style={{ height: 3, borderRadius: 2, background: COLORS.border, overflow: "hidden", marginTop: 3 }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.min(100, pct)}%`,
                              background: utilizationColor(pct),
                              borderRadius: 2,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <span style={{ display: "flex", gap: 4 }}>
                      <Button variant="ghost" size="small" onClick={() => handleEdit(member)} aria-label={`Edit ${member.id}`}>
                        <Pencil size={13} strokeWidth={1.5} />
                      </Button>
                      <Button variant="ghost" size="small" onClick={() => handleDelete(member.id)} aria-label={`Delete ${member.id}`}>
                        <Trash2 size={13} strokeWidth={1.5} />
                      </Button>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* How team data influences assignments */}
        <Panel
          title="How team data influences assignments"
          subtitle="Each field maps directly to a gate or weight in the engine."
        >
          <KeyValue
            rows={[
              { label: "Skills", value: "Tasks are only assigned to members whose skills fuzzy-match the requirements." },
              { label: "Experience", value: "Minimum experience levels act as a hard filter (Junior < Mid-level < Senior)." },
              { label: "Capacity (SP)", value: "Total story points a member can take; multiplied by efficiency for the effective capacity." },
              { label: "Current SP", value: "Already-allocated points; the engine only plans within the remaining headroom." },
              { label: "Efficiency", value: "Multiplies capacity (×0.5–×2.0) and contributes 10% of the match score." },
            ]}
          />
        </Panel>

      </PageShell>
    </motion.div>
  );
}

