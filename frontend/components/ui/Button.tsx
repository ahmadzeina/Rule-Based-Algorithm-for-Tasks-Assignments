"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "medium",
      isLoading = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const sizeClass =
      size === "small" ? "btn-sm" : size === "large" ? "btn-lg" : "btn-md";
    const inactive = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={inactive}
        className={cn("btn", `btn-${variant}`, sizeClass, className)}
        {...props}
      >
        {isLoading && (
          <span
            aria-hidden="true"
            style={{
              width: 12,
              height: 12,
              border: "2px solid rgba(255, 255, 255, 0.35)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.8s linear infinite",
            }}
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
