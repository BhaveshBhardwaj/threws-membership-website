'use client';

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { MEMBERSHIP_TIERS, type MembershipTierId } from '@/lib/membership-tiers';
import styles from './TierSelector.module.css';

interface TierSelectorProps {
  selected: MembershipTierId;
  /** When true, tiers link to apply pages; when false, only highlights selection */
  linkOnSelect?: boolean;
  onSelect?: (id: MembershipTierId) => void;
}

export function TierSelector({
  selected,
  linkOnSelect = true,
  onSelect,
}: TierSelectorProps) {
  return (
    <div className={styles.grid} role="radiogroup" aria-label="Membership tier">
      {MEMBERSHIP_TIERS.map((tier) => {
        const isSelected = tier.id === selected;
        const Icon = tier.icon;
        const inner = (
          <>
            {tier.featured && <span className={styles.popular}>Recommended</span>}
            <div className={styles.iconWrap}>
              <Icon size={22} strokeWidth={1.75} />
            </div>
            <div className={styles.meta}>
              <span className={styles.tagline}>{tier.tagline}</span>
              <h3 className={styles.name}>{tier.name}</h3>
            </div>
            {isSelected && (
              <span className={styles.selectedBadge}>
                <Check size={14} /> Selected
              </span>
            )}
          </>
        );

        const className = [
          styles.card,
          isSelected ? styles.cardSelected : '',
          tier.featured ? styles.cardFeatured : '',
        ]
          .filter(Boolean)
          .join(' ');

        if (linkOnSelect) {
          return (
            <Link
              key={tier.id}
              href={tier.applyPath}
              className={className}
              aria-current={isSelected ? 'page' : undefined}
              onClick={() => onSelect?.(tier.id)}
            >
              {inner}
            </Link>
          );
        }

        return (
          <button
            key={tier.id}
            type="button"
            className={className}
            aria-pressed={isSelected}
            onClick={() => onSelect?.(tier.id)}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
