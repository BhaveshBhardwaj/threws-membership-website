import React from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Target, Lightbulb, Heart, Globe2 } from 'lucide-react';
import { ORG, STATS, MISSION, PILLARS } from '@/lib/site-content';

export const metadata = {
  title: 'About Us',
  description: `Learn about ${ORG.name} — ${ORG.legalName}, established ${ORG.founded}, bridging university theory and corporate employment.`,
};

export default function AboutPage() {
  const timelineMilestones = [
    {
      year: '2013',
      title: 'Society Established',
      desc: `${ORG.legalName} registered under the Societies Registration Act (India, Act XXI of 1860), launching Westbridge Research as a bridge between academic research and industry.`,
    },
    {
      year: '2016',
      title: 'Research Hub Growth',
      desc: 'Expanded research collaboration, academic networking, and structured Tech, MBA, and MCA project pathways.',
    },
    {
      year: '2020',
      title: 'Global Research Network',
      desc: `Reached ${STATS.researchers} researchers, ${STATS.partners} partner institutions, and presence across ${STATS.countries} countries.`,
    },
    {
      year: '2024',
      title: 'ICSD & LLM Nexus',
      desc: 'Launched the ICSD Westbridge Research Scopus-Indexed Conference on Sustainable Development and the LLM Nexus sub-conference.',
    },
    {
      year: '2026',
      title: 'Digital Transformation',
      desc: 'Launched the new member verification portal, centralized publication hub, and digital research dashboards.',
    },
  ];

  return (
    <div style={{ background: 'var(--color-bg-primary)' }}>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroCopy}>
            <span className={styles.heroKicker}>About Westbridge Research</span>
            <h1 className={styles.title}>
              Bridging scholarship and verified professional impact.
            </h1>
            <p className={styles.subtitle}>
              {ORG.registration}. Established {ORG.founded}. Offices in {ORG.office} and {ORG.domain}.
            </p>
            <div className={styles.heroFacts}>
              <div>
                <span>{STATS.members}</span>
                <p>Global members</p>
              </div>
              <div>
                <span>{STATS.papers}</span>
                <p>Research papers</p>
              </div>
              <div>
                <span>{STATS.countries}</span>
                <p>Countries</p>
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <Image
              src="/images/hero_research_network.png"
              alt="Global research network"
              fill
              className={styles.heroImage}
              priority
            />
            <div className={styles.heroFrame} />
          </div>
        </div>
      </section>

      <section className={`${styles.section} slide-up`} style={{ animationDelay: '0.2s' }}>
        <div className={`container ${styles.content}`}>
          <div className={styles.imageAndText}>
            <div className={styles.imageBlock}>
              <div className={styles.imageCard}>
                <Image
                  src="/images/about_research_institute.png"
                  alt="Research institute collaboration"
                  fill
                  className={styles.sectionImage}
                />
              </div>
            </div>
            <div className={styles.textBlock}>
              <h2 className={styles.heading2}>Our Legacy</h2>
              <p>{MISSION}</p>
              <p>
                With {STATS.members} global members, {STATS.papers} research papers, and {STATS.years} years of
                presence, {ORG.name} delivers research consultation, publication support, data analysis, and
                training through a member-led governance model.
              </p>
              <div className={styles.inlineHighlight}>
                Fellow, Honorary Fellow, and Distinguished Fellow members advancing research and industry
                collaboration worldwide.
              </div>
            </div>
          </div>

          <div className={styles.statStrip}>
            {[
              { label: 'Global members', value: STATS.members },
              { label: 'Research papers', value: STATS.papers },
              { label: 'Researchers', value: STATS.researchers },
              { label: 'Publications', value: STATS.publications },
              { label: 'Awards', value: STATS.awards },
              { label: 'Countries', value: STATS.countries },
            ].map((s) => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className={styles.grid}>
            <Card padding="lg" className={styles.glassCard}>
              <div className={styles.iconWrapper}>
                <Target size={24} />
              </div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                Our Mission
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', lineHeight: 1.75 }}>{MISSION}</p>
            </Card>
            <Card padding="lg" className={styles.glassCard}>
              <div className={styles.iconWrapper}>
                <Lightbulb size={24} />
              </div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                Our Vision
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', lineHeight: 1.75 }}>
                A research ecosystem where academic rigor and corporate innovation reinforce one another — with
                open collaboration, verified credentials, and measurable impact.
              </p>
            </Card>
            <Card padding="lg" className={styles.glassCard}>
              <div className={styles.iconWrapper}>
                <Globe2 size={24} />
              </div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                Global Impact
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', lineHeight: 1.75 }}>
                Rooted in {ORG.office}, our network spans {STATS.countries} countries and {STATS.partners} partner
                institutions — connecting laboratories, universities, and corporate R&amp;D teams.
              </p>
            </Card>
            <Card padding="lg" className={styles.glassCard}>
              <div className={styles.iconWrapper}>
                <Heart size={24} />
              </div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                Core Pillars
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', lineHeight: 1.75 }}>
                {PILLARS.join(' · ')} — guiding every syndicate, publication, and membership decision.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className={`${styles.timelineSection} slide-up`} style={{ animationDelay: '0.4s' }}>
        <div className="container">
          <div className={styles.sectionTitle} style={{ marginBottom: '6rem' }}>
            <Badge
              variant="info"
              style={{
                background: 'rgba(224,152,0,0.08)',
                color: 'var(--color-accent-dark)',
                border: '1px solid rgba(224,152,0,0.25)',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Legacy Milestones
            </Badge>
            <h2>Chronology of Achievements</h2>
            <p>From society registration to global conferences and research leadership.</p>
          </div>
          <div className={styles.timeline}>
            {timelineMilestones.map((item, idx) => (
              <div
                key={item.year}
                className={`${styles.timelineItem} ${idx % 2 === 1 ? styles.timelineItemEven : ''}`}
              >
                <div className={styles.timelineDot} />
                <div className={styles.timelineCard}>
                  <span className={styles.timelineYear}>{item.year}</span>
                  <h3 className={styles.timelineTitle}>{item.title}</h3>
                  <p className={styles.timelineDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
