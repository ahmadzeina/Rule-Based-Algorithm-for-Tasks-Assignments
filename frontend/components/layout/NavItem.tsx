"use client";

import Link from "next/link";
import React from "react";
import { COLORS } from "@/lib/theme";

interface NavItemLinkProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; strokeWidth?: number | string }>;
  active: boolean;
  badge?: number;
  onClick?: () => void;
}

/** Single sidebar row: outline icon + label + optional numeric badge. */
export function NavItemLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
  onClick,
}: NavItemLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 8px",
        color: active ? COLORS.text.primary : COLORS.text.secondary,
        textDecoration: "none",
        borderRadius: 6,
        background: active ? COLORS.active : "transparent",
        fontSize: 13,
        fontWeight: 500,
        transition: "background 0.15s ease, color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = COLORS.hover;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <Icon size={16} strokeWidth={1.5} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      {badge != null && (
        <span
          style={{
            marginLeft: "auto",
            minWidth: 20,
            height: 18,
            padding: "0 6px",
            borderRadius: 9,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 500,
            background: active ? COLORS.tint.scope : COLORS.active,
            color: active ? COLORS.accent.scope : COLORS.text.secondary,
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

NavItemLink.displayName = "NavItemLink";
