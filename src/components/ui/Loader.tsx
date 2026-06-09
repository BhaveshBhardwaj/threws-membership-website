import React from 'react';
import styles from './Loader.module.css';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
}

export default function Loader({
  size = 'md',
  variant = 'spinner',
  className = '',
}: LoaderProps) {
  const classNames = [styles.loader, styles[size], className]
    .filter(Boolean)
    .join(' ');

  if (variant === 'spinner') {
    return (
      <div className={classNames} role="status" aria-label="Loading">
        <svg
          className={styles.spinnerSvg}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className={styles.spinnerTrack}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle
            className={styles.spinnerArc}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="31.4 31.4"
          />
        </svg>
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={classNames} role="status" aria-label="Loading">
        <span className={styles.dot} />
        <span className={`${styles.dot} ${styles.dotDelay1}`} />
        <span className={`${styles.dot} ${styles.dotDelay2}`} />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  /* pulse */
  return (
    <div className={classNames} role="status" aria-label="Loading">
      <span className={styles.pulseRing} />
      <span className={styles.pulseDot} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
