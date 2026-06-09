import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  variant?: 'default' | 'glass' | 'bordered' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  children,
  className = '',
  style,
}: CardProps) {
  const classNames = [
    styles.card,
    styles[variant],
    styles[`padding_${padding}`],
    hover ? styles.hover : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} style={style}>
      {children}
    </div>
  );
}
