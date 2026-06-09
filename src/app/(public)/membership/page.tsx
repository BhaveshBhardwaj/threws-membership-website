import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

import Button from '@/components/ui/Button';
import { MEMBERSHIP_TIERS } from '@/lib/membership-tiers';
import { MEMBERSHIP_FUNNEL, ORG } from '@/lib/site-content';

import styles from './page.module.css';

const COMPARISON_ROWS = [
  {
    label: 'Directory profile',
    values: ['Included', 'Included', 'Included', 'Included', 'Included', 'Included'],
  },
  {
    label: 'Project access',
    values: ['Core', 'Core', 'Extended', 'Extended', 'Extended', 'Extended'],
  },
  {
    label: 'Research consultation',
    values: ['Limited', 'Included', 'Included', 'Included', 'Priority', 'Priority'],
  },
  {
    label: 'Advisory network',
    values: ['No', 'No', 'Included', 'Included', 'Included', 'Included'],
  },
  {
    label: 'Closed events and grants',
    values: ['No', 'No', 'No', 'No', 'Included', 'Priority'],
  },
  {
    label: 'Certificate and QR verification',
    values: ['No', 'No', 'No', 'No', 'Included', 'Included'],
  },
] as const;

export const metadata = {
  title: 'Membership',
  description: `Join ${ORG.name}: Student, Collaborator, Professional, Senior, Fellow, or Honorary Fellow.`,
};

export default function MembershipPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>Membership</span>
          <h1 className={styles.title}>
            Join a global network of <span className="gradient-text">research leaders</span>
          </h1>
          <p className={styles.subtitle}>
            Clear membership tracks for every stage of academic and professional growth, with structured review and
            verified recognition.
          </p>
        </div>
      </section>

      <section className={styles.tiersSection}>
        <div className="container">
          <div className={styles.tierGrid}>
            {MEMBERSHIP_TIERS.map((tier) => {
              const Icon = tier.icon;

              return (
                <article key={tier.id} className={`${styles.tierCard} ${tier.featured ? styles.tierFeatured : ''}`}>
                  {tier.featured && <span className={styles.popularLabel}>Recommended</span>}
                  <div className={styles.tierIcon}>
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                  <p className={styles.tierTagline}>{tier.tagline}</p>
                  <h2 className={styles.tierName}>{tier.name}</h2>
                  <div className={styles.tierAdmission}>{tier.admission}</div>
                  <p className={styles.tierDesc}>{tier.description}</p>
                  <ul className={styles.featureList}>
                    {tier.features.map((feature) => (
                      <li key={feature}>
                        <Check size={16} className={styles.checkIcon} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={tier.applyPath} className={styles.applyLink}>
                    <Button variant={tier.featured ? 'primary' : 'outline'} fullWidth>
                      Apply as {tier.name} <ArrowRight size={16} />
                    </Button>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.compareSection}>
        <div className="container">
          <h2 className={styles.compareTitle}>Compare tiers at a glance</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            Application flow: {MEMBERSHIP_FUNNEL.join(' -> ')}
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Feature</th>
                  {MEMBERSHIP_TIERS.map((tier) => (
                    <th key={tier.id}>{tier.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Admission type</td>
                  {MEMBERSHIP_TIERS.map((tier) => (
                    <td key={tier.id}>
                      <strong>{tier.admission}</strong>
                    </td>
                  ))}
                </tr>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    {row.values.map((value, index) => (
                      <td key={`${row.label}-${index}`}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={`container ${styles.ctaInner}`}>
          <h2>Ready to apply?</h2>
          <p>Select your tier and complete the secure application form. You will receive an email confirmation immediately.</p>
          <Link href="/membership/student">
            <Button variant="primary" size="lg">
              Start Application
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
