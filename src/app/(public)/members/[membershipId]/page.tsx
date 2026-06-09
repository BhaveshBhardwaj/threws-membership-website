import React from 'react';
import Link from 'next/link';
import { Award, BookOpen, Briefcase, Calendar, ExternalLink, Globe, Mail, ShieldCheck, Sparkles, User } from 'lucide-react';
import { notFound } from 'next/navigation';

import dbConnect from '@/lib/db';
import { ORG } from '@/lib/site-content';
import Member from '@/models/Member';

import styles from './page.module.css';

interface PageProps {
  params: Promise<{
    membershipId: string;
  }>;
}

function safeExternalUrl(value?: string, prefix = 'https://') {
  if (!value) return null;
  return value.startsWith('http') ? value : `${prefix}${value}`;
}

export default async function MemberPublicProfilePage({ params }: PageProps) {
  const { membershipId } = await params;

  await dbConnect();

  const member = await Member.findOne({
    membershipId: { $regex: new RegExp(`^${membershipId}$`, 'i') },
    status: 'active',
  }).lean();

  if (!member) {
    notFound();
  }

  const publicUrl = `https://${ORG.domain}/members/${member.membershipId}`;

  return (
    <div className={styles.page}>
      <div className="container">
        <section className={styles.hero}>
          <div className={styles.heroCard}>
            <div className={styles.identity}>
              <div className={styles.avatar}>
                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photoUrl} alt={member.fullName} />
                ) : (
                  <User size={48} />
                )}
              </div>

              <div className={styles.identityCopy}>
                <span className={styles.identityTag}>
                  <Sparkles size={14} /> Verified {member.type.replace(/_/g, ' ')} member
                </span>
                <h1>{member.fullName}</h1>
                <p>
                  {member.designation} at <strong>{member.institution}</strong>
                </p>
                <div className={styles.identityMeta}>
                  {member.department && (
                    <span>
                      <Briefcase size={15} /> {member.department}
                    </span>
                  )}
                  <span>
                    <Calendar size={15} /> Joined{' '}
                    {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            <aside className={styles.badgeCard}>
              <div className={styles.badgeTop}>
                <BookOpen size={22} />
                <span>{ORG.name}</span>
              </div>
              <div>
                <small>Membership ID</small>
                <strong>{member.membershipId}</strong>
              </div>
              <div className={styles.badgeStatus}>
                <ShieldCheck size={16} />
                Active and publicly verified
              </div>
            </aside>
          </div>
        </section>

        <section className={styles.content}>
          <article className={styles.card}>
            <h2>Biography</h2>
            <p>{member.bio || 'Biography details are currently being finalized by the researcher.'}</p>
          </article>

          <article className={styles.card}>
            <h2>Research Expertise</h2>
            <div className={styles.tags}>
              {member.researchAreas.map((area: string) => (
                <span key={area}>{area}</span>
              ))}
              {member.skills?.map((skill: string) => (
                <span key={skill} className={styles.softTag}>
                  {skill}
                </span>
              ))}
            </div>
          </article>

          <article className={styles.card}>
            <h2>Achievements</h2>
            <p>{member.achievements || 'No specific achievements are listed on this public page yet.'}</p>
          </article>

          <article className={styles.card}>
            <h2>Publications</h2>
            <p>{member.publications || 'No publications have been added to the public profile yet.'}</p>
          </article>

          <article className={styles.card}>
            <h2>Verified Links</h2>
            <div className={styles.linkList}>
              <div className={styles.linkItem}>
                <Mail size={16} />
                <span>{member.orgEmail || member.email}</span>
              </div>

              {safeExternalUrl(member.linkedinUrl) && (
                <a href={safeExternalUrl(member.linkedinUrl) || ''} target="_blank" rel="noreferrer" className={styles.linkItem}>
                  <Briefcase size={16} />
                  <span>LinkedIn Profile</span>
                  <ExternalLink size={14} />
                </a>
              )}

              {member.orcidUrl && (
                <a
                  href={member.orcidUrl.startsWith('http') ? member.orcidUrl : `https://orcid.org/${member.orcidUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.linkItem}
                >
                  <Award size={16} />
                  <span>ORCID Record</span>
                  <ExternalLink size={14} />
                </a>
              )}

              {safeExternalUrl(member.websiteUrl) && (
                <a href={safeExternalUrl(member.websiteUrl) || ''} target="_blank" rel="noreferrer" className={styles.linkItem}>
                  <Globe size={16} />
                  <span>Scholar Website</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </article>

          <article className={styles.card}>
            <h2>Public Verification</h2>
            <p>
              This page is served through the official {ORG.name} directory and can be referenced at{' '}
              <Link href={publicUrl}>{publicUrl}</Link>.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
