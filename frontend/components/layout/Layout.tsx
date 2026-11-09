"use client";

import React, { useState } from "react";
import { COLORS, SPACING } from "@/lib/theme";
import Navigation from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * App shell: fixed sidebar (240px) + main column. The main column is
 * centered with a max width that fits main content (~760px) plus the
 * right analytics panel (320px) from design.md §4.
 */
export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="flex min-h-screen w-full"
      style={{ backgroundColor: COLORS.background.main }}
    >
      {/* Sidebar */}
      <Navigation open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-30 md:hidden"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        />
      )}

      {/* Main column — min-w-0 lets grids/tables shrink and scroll internally */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar with menu trigger (desktop has no app header) */}
        <header
          className="flex items-center gap-3 border-b md:hidden"
          style={{
            backgroundColor: COLORS.background.sidebar,
            borderColor: COLORS.border,
            padding: `${SPACING.sm} ${SPACING.md}`,
          }}
        >
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md border"
            style={{
              borderColor: COLORS.border,
              backgroundColor: "transparent",
              color: COLORS.text.primary,
              padding: `${SPACING.xs} ${SPACING.sm}`,
              fontSize: "16px",
              lineHeight: 1,
            }}
          >
            ☰
          </button>
          <span style={{ color: COLORS.text.primary, fontSize: "14px", fontWeight: 600 }}>
            TaskAssigner
          </span>
        </header>

        {/* Page content — centered INSIDE the main column, not the viewport */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
