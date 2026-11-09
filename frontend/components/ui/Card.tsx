"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Legacy compatibility card — subtle surface (transparent background +
 * 1px border, no shadow) per design.md §7. New code should prefer Panel.
 */
export const Card: React.FC<CardProps> = ({ children, style, ...props }) => (
  <div className="card" style={{ padding: 16, ...style }} {...props}>
    {children}
  </div>
);

Card.displayName = "Card";
