"use client";

import React from "react";
import Link from "next/link";
import { COLORS, TYPOGRAPHY } from "@/lib/theme";

export interface PageTab {
  label: string;
  href: string;
  active?: boolean;
}

interface PageHeaderProps {
  breadcrumb: string[];
  title: string;
  description?: string;
  tabs?: PageTab[];
  actions?: React.ReactNode;
}

/**
 * Top navigation per design.md §4: breadcrumbs, page title (24-28px
 * semi-bold), optional horizontal tabs with active states, and actions.
 */
export function PageHeader({ breadcrumb, title, description, tabs, actions }: PageHeaderProps) {
  return (
    <header style={{ marginBottom: 24 }}>
      <nav
        aria-label="Breadcrumb"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
          fontSize: 12,
          color: COLORS.text.secondary,
          marginBottom: 8,
        }}
      >
        {breadcrumb.map((crumb, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {i > 0 && (
              <span aria-hidden="true" style={{ color: COLORS.text.placeholder }}>
                ›
              </span>
            )}
            <span style={{ color: i === breadcrumb.length - 1 ? COLORS.text.primary : COLORS.text.secondary }}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1 style={{ ...TYPOGRAPHY.title, margin: 0 }}>{title}</h1>
          {description && (
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: COLORS.text.secondary, maxWidth: 560 }}>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {actions}
          </div>
        )}
      </div>

      {tabs && tabs.length > 0 && (
        <div
          role="tablist"
          style={{
            display: "flex",
            gap: 4,
            marginTop: 16,
            borderBottom: `1px solid ${COLORS.border}`,
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => (
            <Link
              key={`${tab.href}-${tab.label}`}
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              style={{
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 500,
                color: tab.active ? COLORS.text.primary : COLORS.text.secondary,
                textDecoration: "none",
                borderRadius: "6px 6px 0 0",
                background: tab.active ? COLORS.hover : "transparent",
                borderBottom: tab.active
                  ? `2px solid ${COLORS.accent.scope}`
                  : "2px solid transparent",
                marginBottom: -1,
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

PageHeader.displayName = "PageHeader";
