import React from 'react';
import { ORG } from '@/lib/site-content';

export const metadata = {
  title: 'Code of Conduct',
  description: `Code of Conduct for ${ORG.name} members and contributors.`,
};

export default function CodeOfConductPage() {
  return (
    <div style={{ background: 'var(--color-bg-primary)', minHeight: '60vh' }}>
      <section style={{ padding: '6rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ marginBottom: '2rem' }}>Code of Conduct</h1>
          <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1rem' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              <strong>{ORG.name}</strong> is committed to fostering an inclusive, respectful, and collaborative
              environment for all members, researchers, and participants.
            </p>
            <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--color-text-primary)' }}>Our Standards</h2>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyle: 'disc' }}>
              <li style={{ marginBottom: '0.5rem' }}>Maintain the highest standards of academic integrity and ethical research</li>
              <li style={{ marginBottom: '0.5rem' }}>Treat all members, collaborators, and participants with respect and professionalism</li>
              <li style={{ marginBottom: '0.5rem' }}>Foster open, constructive dialogue and knowledge sharing</li>
              <li style={{ marginBottom: '0.5rem' }}>Respect intellectual property and give proper attribution to contributors</li>
              <li style={{ marginBottom: '0.5rem' }}>Uphold the reputation of {ORG.name} in all professional activities</li>
            </ul>
            <h2 style={{ fontSize: '1.5rem', margin: '2rem 0 1rem', color: 'var(--color-text-primary)' }}>Reporting</h2>
            <p>
              If you witness or experience behavior that violates this Code of Conduct, please report it to
              our team at <strong>{ORG.email}</strong>. All reports will be handled confidentially.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
