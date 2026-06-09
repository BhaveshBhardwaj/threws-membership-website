import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Calendar, Check, Globe, GraduationCap, Network, Shield } from 'lucide-react';

import Button from '@/components/ui/Button';
import { MEMBERSHIP_TIERS } from '@/lib/membership-tiers';
import { CONFERENCES, MEMBERSHIP_FUNNEL, MISSION, ORG, SERVICES, STATS, TRUST_SIGNALS } from '@/lib/site-content';

import styles from './page.module.css';

const HERO_IMAGE = '/images/hero_research_network.png';
const ABOUT_IMAGE = '/images/about_research_institute.png';

const BENEFITS = [
  {
    icon: Globe,
    title: 'Global Research Network',
    description: 'Connect with thousands of members, partner institutions, and researchers across dozens of countries.',
  },
  {
    icon: GraduationCap,
    title: 'Academic and Industry Bridge',
    description: 'Structured pathways linking university research with applied projects and professional advancement.',
  },
  {
    icon: Shield,
    title: 'Verified Membership',
    description: 'Formal credentials issued after nomination, application, CV review, and committee evaluation.',
  },
  {
    icon: Network,
    title: 'Research Collaboration',
    description: 'Joint projects, publication support, data analysis, and research consultation across disciplines.',
  },
  {
    icon: BookOpen,
    title: 'Scholarly Publishing',
    description: 'A growing body of peer-reviewed work and syndicate publications emerging from the network.',
  },
  {
    icon: Calendar,
    title: 'Conferences and Fellowships',
    description: 'Curated conference tracks and fellowship pathways for high-contribution researchers.',
  },
] as const;

export default function HomePage() {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <div className={styles.heroMesh} aria-hidden />
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              {ORG.name} | Est. {ORG.founded} | {ORG.legalName}
            </p>
            <h1 className={styles.heroTitle}>
              Bridging academia and <span className={styles.heroAccent}>credible professional practice</span>
            </h1>
            <p className={styles.heroLead}>{MISSION}</p>
            <div className={styles.heroActions}>
              <Link href="/membership">
                <Button variant="primary" size="lg" className={styles.heroBtnPrimary}>
                  Explore Membership
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Our Story
                </Button>
              </Link>
            </div>
            <ul className={styles.heroStats}>
              <li>
                <strong>{STATS.members}</strong>
                <span>Global members</span>
              </li>
              <li>
                <strong>{STATS.years}</strong>
                <span>Years active</span>
              </li>
              <li>
                <strong>{STATS.papers}</strong>
                <span>Research papers</span>
              </li>
            </ul>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroImageFrame}>
              <Image
                src={HERO_IMAGE}
                alt="Abstract editorial illustration representing a global research network"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.heroImage}
              />
              <div className={styles.heroImageOverlay} />
            </div>
            <div className={styles.heroFloatingCard}>
              <span className={styles.floatingLabel}>Join a verified scholarly network</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Link href="/membership/student">
                  <Button size="sm" variant="primary">Apply Now</Button>
                </Link>
                <Link href="/members/verify">
                  <Button size="sm" variant="outline">Verify Member</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} slide-up`} style={{ animationDelay: '0.2s' }}>
        <div className={`container ${styles.aboutGrid}`}>
          <div className={styles.aboutImageWrap}>
            <Image
              src={ABOUT_IMAGE}
              alt="Abstract publication and knowledge system artwork"
              fill
              sizes="(max-width: 900px) 100vw, 45vw"
              className={styles.aboutImage}
            />
          </div>
          <div className={styles.aboutCopy}>
            <p className={styles.sectionEyebrow}>About {ORG.name}</p>
            <h2 className={styles.sectionHeading}>Research collaboration with structure and dependability</h2>
            <p className={styles.sectionText}>
              Registered as the {ORG.legalName}, {ORG.name} supports academic networking, research collaboration,
              publication guidance, and professional project development through a disciplined membership model.
            </p>
            <p className={styles.sectionText}>
              Our research hub spans {STATS.researchers} researchers, {STATS.projects} projects, and {STATS.publications}{' '}
              publications with a clear commitment to rigor, collaboration, and relevance.
            </p>
            <Link href="/about" className={styles.textLink}>
              Learn about our mission <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.tiersSection} slide-up`} style={{ animationDelay: '0.4s' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Membership</p>
            <h2 className={styles.sectionHeading}>Choose your tier</h2>
            <p className={styles.sectionSub}>Select the tier that matches your current research stage and ambitions.</p>
          </div>

          <div className={styles.tierGrid}>
            {MEMBERSHIP_TIERS.map((tier) => {
              const Icon = tier.icon;
              return (
                <article key={tier.id} className={`${styles.tierCard} ${tier.featured ? styles.tierFeatured : ''}`}>
                  {tier.featured && <span className={styles.tierBadge}>Recommended</span>}
                  <div className={styles.tierIcon}>
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <p className={styles.tierTagline}>{tier.tagline}</p>
                  <h3 className={styles.tierName}>{tier.name}</h3>
                  <div className={styles.tierAdmission}>{tier.admission}</div>
                  <p className={styles.tierDesc}>{tier.description}</p>
                  <ul className={styles.tierFeatures}>
                    {tier.features.slice(0, 3).map((feature) => (
                      <li key={feature}>
                        <Check size={15} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={tier.applyPath} className={styles.tierLink}>
                    <Button variant={tier.featured ? 'primary' : 'outline'} fullWidth>
                      Apply as {tier.name}
                    </Button>
                  </Link>
                </article>
              );
            })}
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Application process: {MEMBERSHIP_FUNNEL.join(' -> ')}.
          </p>

          <div className={styles.tiersFooter}>
            <Link href="/membership" className={styles.textLink}>
              Compare all features <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Services</p>
            <h2 className={styles.sectionHeading}>What we offer</h2>
            <p className={styles.sectionSub}>End-to-end support for scholars, students, and industry professionals.</p>
          </div>
          <div className={styles.benefitsGrid}>
            {SERVICES.map((item) => (
              <div key={item.title} className={styles.benefitCard}>
                <h3 className={styles.benefitTitle}>{item.title}</h3>
                <p className={styles.benefitText}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Conferences</p>
            <h2 className={styles.sectionHeading}>Global forums for rigorous exchange</h2>
          </div>
          <div className={styles.benefitsGrid}>
            {CONFERENCES.map((conference) => (
              <div key={conference.slug} className={styles.benefitCard}>
                <h3 className={styles.benefitTitle}>{conference.name}</h3>
                <p className={styles.benefitText}>{conference.description}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/conferences" className={styles.textLink}>
              Conference details <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Global Reach</p>
            <h2 className={styles.sectionHeading}>Research without borders</h2>
            <p className={styles.sectionSub}>
              Trusted by institutions and driven by thousands of researchers collaborating across borders.
            </p>
          </div>

          <div className={styles.benefitsGrid} style={{ marginBottom: '3rem' }}>
            {TRUST_SIGNALS.metrics.map((metric) => (
              <div key={metric.label} className={styles.benefitCard} style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 className={styles.benefitTitle} style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  {metric.value}
                </h3>
                <p className={styles.benefitText} style={{ fontWeight: 600 }}>
                  {metric.label}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <p className={styles.sectionEyebrow} style={{ marginBottom: '1rem' }}>
              Partner Institutes and Collaborators
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', opacity: 0.75 }}>
              {TRUST_SIGNALS.partners.map((partner) => (
                <span key={partner} style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Member Benefits</p>
            <h2 className={styles.sectionHeading}>Built for serious researchers</h2>
          </div>
          <div className={styles.benefitsGrid}>
            {BENEFITS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className={styles.benefitTitle}>{item.title}</h3>
                  <p className={styles.benefitText}>{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaMesh} aria-hidden />
        <div className={`container ${styles.ctaInner}`}>
          <h2 className={styles.ctaTitle}>Ready to join {ORG.name}?</h2>
          <p className={styles.ctaText}>
            Submit your application in minutes. Our review committee typically responds within 7-14 business days
            after CV and reference evaluation.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/membership/fellow">
              <Button variant="primary" size="lg">Start Application</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className={styles.ctaOutlineBtn}>Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
