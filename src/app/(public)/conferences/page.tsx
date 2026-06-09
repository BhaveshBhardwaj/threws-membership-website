import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Globe } from 'lucide-react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CONFERENCES, ISRP, ORG } from '@/lib/site-content';

import styles from './page.module.css';

export const metadata = {
  title: 'Conferences',
  description:
    'Westbridge Research conferences including the ICSD Scopus-indexed Conference on Sustainable Development and LLM Nexus.',
};

export default function ConferencesPage() {
  return (
    <div style={{ background: 'var(--color-bg-primary)' }}>
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.glow1} />
          <div className={styles.glow2} />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className={styles.title}>
            Conferences and <span className="gradient-text">Symposia</span>
          </h1>
          <p className={styles.subtitle}>
            Peer-reviewed forums hosted under {ORG.name}, connecting researchers, practitioners, and industry leaders
            worldwide.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`container ${styles.content}`}>
          <div className={styles.grid}>
            {CONFERENCES.map((conference) => (
              <Card key={conference.slug} padding="lg" className={styles.glassCard}>
                <Badge variant="info" style={{ marginBottom: '1rem' }}>
                  {conference.format}
                </Badge>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>
                  {conference.name}
                </h3>
                <p style={{ fontWeight: 600, color: 'var(--color-accent-dark)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {conference.subtitle}
                </p>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.75, fontSize: '0.925rem' }}>
                  {conference.description}
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <Globe size={16} /> Hybrid delivery
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <Calendar size={16} /> Annual program
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <Card padding="lg" className={styles.glassCard} style={{ marginTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-primary-dark)' }}>
              {ISRP.name}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.75, marginBottom: '1rem' }}>
              In partnership with {ISRP.partner}, Westbridge Research offers an ISRP fellowship with an acceptance
              rate {ISRP.acceptanceRate}. Fellows gain international visibility, publication priority, and peer review
              privileges.
            </p>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
              {ISRP.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </Card>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/contact">
              <Button variant="primary" size="lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Conference inquiries <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
