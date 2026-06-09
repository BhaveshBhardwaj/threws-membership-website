import React from 'react';
import { ORG } from '@/lib/site-content';

export const metadata = {
  title: 'Privacy Policy',
  description: `Privacy Policy for ${ORG.name}.`,
};

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--color-bg-primary)', minHeight: '60vh' }}>
      <section style={{ padding: '6rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ marginBottom: '2rem' }}>Privacy Policy</h1>
          <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              <strong>{ORG.name}</strong> ({ORG.legalName}) is committed to protecting your personal information
              and your right to privacy. This Privacy Policy describes how we collect, use, and share information
              when you use our services.
            </p>
            <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--color-text-primary)' }}>Information We Collect</h2>
            <p style={{ marginBottom: '1rem' }}>We collect information you provide directly, including:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyle: 'disc' }}>
              <li style={{ marginBottom: '0.5rem' }}>Name, email address, and contact details during registration</li>
              <li style={{ marginBottom: '0.5rem' }}>Academic credentials, research areas, and professional information in membership applications</li>
              <li style={{ marginBottom: '0.5rem' }}>Communications you send to us through our contact forms</li>
            </ul>
            <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--color-text-primary)' }}>How We Use Your Information</h2>
            <p style={{ marginBottom: '1rem' }}>Your information is used to:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyle: 'disc' }}>
              <li style={{ marginBottom: '0.5rem' }}>Process membership applications and maintain your member profile</li>
              <li style={{ marginBottom: '0.5rem' }}>Communicate about conferences, publications, and research opportunities</li>
              <li style={{ marginBottom: '0.5rem' }}>Improve our services and website experience</li>
            </ul>
            <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--color-text-primary)' }}>Contact</h2>
            <p>For privacy-related inquiries, contact us at <strong>{ORG.email}</strong>.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
