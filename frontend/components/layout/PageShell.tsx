"use client";

import React from "react";

interface PageShellProps {
  children: React.ReactNode;
  /** Right context/analytics panel content (design.md §4, ~320px). */
  aside?: React.ReactNode;
}

/**
 * Main content area (max ~760px) + right context panel (320px, separated
 * by a 1px vertical border). The panel stacks below the main column on
 * small screens. See .ps-shell / .ps-main / .ps-aside in globals.css.
 */
export function PageShell({ children, aside }: PageShellProps) {
  return (
    <div className="ps-shell">
      <div className="ps-main">{children}</div>
      {aside != null && <aside className="ps-aside">{aside}</aside>}
    </div>
  );
}

PageShell.displayName = "PageShell";
