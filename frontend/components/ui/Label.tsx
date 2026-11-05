"use client";

import React from "react";
import { COLORS } from "@/lib/theme";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ required, children, ...props }) => (
  <label
    style={{
      display: "block",
      fontSize: "13px",
      fontWeight: 500,
      color: COLORS.text.secondary,
      marginBottom: "4px",
    }}
    {...props}
  >
    {children}
    {required && <span style={{ color: COLORS.accent.alert, marginLeft: "4px" }}>*</span>}
  </label>
);

Label.displayName = "Label";