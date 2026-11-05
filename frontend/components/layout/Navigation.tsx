"use client";

import { usePathname } from "next/navigation";
import React, { useState } from "react";
import {
  Compass,
  LayoutDashboard,
  ListChecks,
  Users,
  BarChart3,
  ChevronDown,
  Zap,
} from "lucide-react";
import { COLORS, SPACING } from "@/lib/theme";
import { useTeamStore } from "@/store/teamStore";
import { useTaskStore } from "@/store/taskStore";
import { NavItemLink } from "./NavItem";

interface NavigationProps {
  open?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar per design.md §4: fixed 240px, hierarchical navigation with
 * collapsible sections and numerical badges, outline 1.5px icons.
 */
export default function Navigation({ open = false, onClose }: NavigationProps) {
  const pathname = usePathname();
  const { team } = useTeamStore();
  const { tasks } = useTaskStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const sections: Array<{
    title: string;
    items: Array<{
      href: string;
      label: string;
      icon: React.ComponentType<{ size?: number | string; strokeWidth?: number | string }>;
      badge?: number;
    }>;
  }> = [
    {
      title: "Workspace",
      items: [
        { href: "/", label: "Overview", icon: Compass },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        {
          href: "/assignments",
          label: "Tasks & Assignments",
          icon: ListChecks,
          badge: tasks.length > 0 ? tasks.length : undefined,
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          href: "/team",
          label: "Team",
          icon: Users,
          badge: team.length > 0 ? team.length : undefined,
        },
        { href: "/analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
  ];

  // Prefix matching so nested routes (e.g. /assignments/results) keep their
  // parent section highlighted. "/" matches exactly only.
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      aria-label="Primary navigation"
      className={`fixed inset-y-0 left-0 z-40 flex w-[240px] shrink-0 flex-col overflow-y-auto border-r transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 md:visible ${
        open ? "visible translate-x-0" : "invisible -translate-x-full"
      }`}
      style={{ backgroundColor: COLORS.background.sidebar, borderColor: COLORS.border }}
    >
      {/* Logo */}
      <div style={{ padding: `${SPACING.md} ${SPACING.md} ${SPACING.sm}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: COLORS.tint.scope,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Zap size={14} strokeWidth={1.5} color={COLORS.accent.scope} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.primary }}>
              TaskAssigner
            </div>
            <div style={{ fontSize: 11, color: COLORS.text.secondary }}>
              Rule-based allocation
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible navigation sections with badges */}
      <nav
        className="flex-1"
        style={{ display: "flex", flexDirection: "column", padding: SPACING.sm }}
      >
        {sections.map((section) => {
          const isCollapsed = collapsed[section.title] ?? false;
          return (
            <div key={section.title} style={{ marginBottom: SPACING.base }}>
              <button
                type="button"
                aria-expanded={!isCollapsed}
                onClick={() =>
                  setCollapsed((prev) => ({ ...prev, [section.title]: !isCollapsed }))
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "4px 8px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: COLORS.text.secondary,
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  letterSpacing: "0.02em",
                }}
              >
                <span>{section.title}</span>
                <ChevronDown
                  size={12}
                  strokeWidth={1.5}
                  style={{
                    transform: isCollapsed ? "rotate(-90deg)" : "none",
                    transition: "transform 0.15s ease",
                  }}
                />
              </button>
              {!isCollapsed && (
                <div style={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 2 }}>
                  {section.items.map((item) => (
                    <NavItemLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={isActive(item.href)}
                      badge={item.badge}
                      onClick={onClose}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer with engine status */}
      <div
        style={{
          padding: SPACING.md,
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: COLORS.accent.completed,
              flexShrink: 0,
              animation: "pulse-dot 2.4s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: 11, color: COLORS.text.secondary, flexShrink: 0 }}>
            Engine API
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: COLORS.text.placeholder,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}
          </span>
        </div>
        <span style={{ fontSize: 11, color: COLORS.text.placeholder }}>
          Rule-Based Assignment · v1.0
        </span>
      </div>
    </aside>

  );
}
