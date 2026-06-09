import React from "react";
import styles from "./Skeleton.module.css";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export default function Skeleton({
  className = "",
  variant = "rect",
  width,
  height,
  style,
}: SkeletonProps) {
  const customStyle: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    ...style,
  };

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={customStyle}
    />
  );
}
