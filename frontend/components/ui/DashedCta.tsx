"use client";

import React from "react";
import Link from "next/link";
import { COLORS } from "@/lib/theme";

interface DashedCtaProps {
  label: string;
  sub?: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * Interactive prompt from design.md §5B: full-width, 1px dashed border,
 * centered text, subtle hover background. Renders a Link when `href` is
 * provided, otherwise a button.
 */
export function DashedCta({ label, sub, icon, href, onClick, style }: DashedCtaProps) {
  const inner = (
    <>
      {icon}
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      {sub && (
        <span style={{ fontSize: 11, color: COLORS.text.placeholder }}>{sub}</span>
      )}
    </>
  );
  const shared: React.CSSProperties = {
    width: "100%",
    border: `1px dashed ${COLORS.border}`,
    borderRadius: 8,
    background: "transparent",
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    color: COLORS.text.secondary,
    textAlign: "center",
    cursor: "pointer",
    transition: "background 0.15s ease, color 0.15s ease",
    ...style,
  };
  if (href) {
    return (
      <Link
        href={href}
        style={shared}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
          e.currentTarget.style.color = COLORS.text.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = COLORS.text.secondary;
        }}
      >
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      style={shared}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
        e.currentTarget.style.color = COLORS.text.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = COLORS.text.secondary;
      }}
    >
      {inner}
    </button>
  );
}

DashedCta.displayName = "DashedCta";
