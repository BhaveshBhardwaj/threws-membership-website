import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  style,
}: BadgeProps) {
  return (
    <span
      className={[styles.badge, styles[variant], styles[size], className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {children}
    </span>
  );
}
