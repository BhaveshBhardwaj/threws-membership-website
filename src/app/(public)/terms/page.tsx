import React from 'react';
import { ORG } from '@/lib/site-content';

export const metadata = {
  title: 'Terms of Service',
  description: `Terms of Service for ${ORG.name}.`,
};

export default function TermsPage() {
  return (
    <div style={{ background: 'var(--color-bg-primary)', minHeight: '60vh' }}>
      <section style={{ padding: '6rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ marginBottom: '2rem' }}>Terms of Service</h1>
          <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Welcome to <strong>{ORG.name}</strong>. By accessing and using our website and services, you agree
              to comply with these Terms of Service.
            </p>
            <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--color-text-primary)' }}>Membership</h2>
            <p style={{ marginBottom: '1rem' }}>
              Membership in {ORG.name} is subject to application review, committee evaluation, and adherence to our
              standards of academic integrity. The organization reserves the right to approve or decline any application.
            </p>
            <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--color-text-primary)' }}>Intellectual Property</h2>
            <p style={{ marginBottom: '1rem' }}>
              All content published through {ORG.name}, including research papers, publications, and website content,
              is protected by copyright law. Members retain rights to their own research contributions.
            </p>
            <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--color-text-primary)' }}>Limitation of Liability</h2>
            <p style={{ marginBottom: '1rem' }}>
              {ORG.name} provides its services on an &quot;as-is&quot; basis. We do not guarantee specific outcomes from
              membership, research collaboration, or conference participation.
            </p>
            <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--color-text-primary)' }}>Contact</h2>
            <p>For questions about these terms, contact us at <strong>{ORG.email}</strong>.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
