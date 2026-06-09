import React from 'react';
import styles from './PageBackdrop.module.css';

type PageBackdropVariant = 'default' | 'hero' | 'subtle' | 'membership';

interface PageBackdropProps {
  children: React.ReactNode;
  variant?: PageBackdropVariant;
  className?: string;
}

export function PageBackdrop({
  children,
  variant = 'default',
  className = '',
}: PageBackdropProps) {
  return (
    <div className={`${styles.wrap} ${styles[variant]} ${className}`}>
      <div className={styles.mesh} aria-hidden />
      <div className={styles.gridPattern} aria-hidden />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
