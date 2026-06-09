import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';

import { ORG } from '@/lib/site-content';

import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <Image src="/images/logo.png" alt={ORG.name} width={32} height={32} className={styles.logoImage} />
              <span>{ORG.name}</span>
            </Link>
            <p className={styles.description}>
              {ORG.legalName}. {ORG.registration}. Advancing research collaboration, academic networking, and structured
              academic projects since {ORG.founded}.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <Mail size={16} />
                <span>{ORG.email}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <MapPin size={16} />
                <span>
                  {ORG.office} | {ORG.domain}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className={styles.heading}>Organization</h3>
            <ul className={styles.linkList}>
              <li><Link href="/about" className={styles.link}>About Us</Link></li>
              <li><Link href="/conferences" className={styles.link}>Conferences</Link></li>
              <li><Link href="/blog" className={styles.link}>Blog and News</Link></li>
              <li><Link href="/contact" className={styles.link}>Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className={styles.heading}>Membership</h3>
            <ul className={styles.linkList}>
              <li><Link href="/membership" className={styles.link}>Compare Tiers</Link></li>
              <li><Link href="/membership/student" className={styles.link}>Student Researcher</Link></li>
              <li><Link href="/membership/senior" className={styles.link}>Senior Member</Link></li>
              <li><Link href="/membership/fellow" className={styles.link}>Fellow (F.Res)</Link></li>
              <li><Link href="/honorary-fellow" className={styles.link}>Honorary Fellow</Link></li>
            </ul>
          </div>

          <div>
            <h3 className={styles.heading}>Legal</h3>
            <ul className={styles.linkList}>
              <li><Link href="/privacy" className={styles.link}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={styles.link}>Terms of Service</Link></li>
              <li><Link href="/code-of-conduct" className={styles.link}>Code of Conduct</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.gradientDivider} />

        <div className={styles.bottom}>
          <p>
            &copy; {new Date().getFullYear()} {ORG.name} | {ORG.legalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
