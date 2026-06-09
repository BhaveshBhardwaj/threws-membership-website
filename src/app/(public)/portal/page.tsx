'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  BookOpen,
  Briefcase,
  Calendar,
  Copy,
  ExternalLink,
  Globe,
  LogOut,
  Mail,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react';

import { getPortalData } from '@/actions/auth.actions';
import { updateMemberProfile } from '@/actions/member.actions';
import ImageUpload from '@/components/ui/ImageUpload';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';

import styles from './page.module.css';

type PortalApplication = {
  _id: string;
  type: 'student' | 'collaborator' | 'professional' | 'senior' | 'fellow' | 'distinguished_fellow';
  status: 'draft' | 'submitted' | 'under_review' | 'interview' | 'approved' | 'rejected';
  fullName: string;
  email: string;
  institution: string;
  designation: string;
  researchAreas: string[];
  createdAt: string;
};

type PortalMember = {
  _id: string;
  membershipId: string;
  type: 'student' | 'collaborator' | 'professional' | 'senior' | 'fellow' | 'distinguished_fellow';
  status: 'active' | 'inactive' | 'suspended';
  fullName: string;
  email: string;
  institution: string;
  designation: string;
  department?: string;
  researchAreas: string[];
  photoUrl?: string;
  bio?: string;
  orgEmail?: string;
  orgEmailStatus?: 'active' | 'inactive' | 'suspended';
  skills?: string[];
  achievements?: string;
  publications?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  orcidUrl?: string;
  joinedAt: string;
};

type PortalData = {
  member: PortalMember | null;
  applications: PortalApplication[];
};

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function MemberPortalPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState({
    bio: '',
    achievements: '',
    publications: '',
    websiteUrl: '',
    linkedinUrl: '',
    orcidUrl: '',
    photoUrl: '',
    skills: '',
  });

  const loadPortalData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getPortalData();
      if (!res.success || !res.data) {
        toast('error', res.error || 'Failed to load portal data.');
        return;
      }

      const data = res.data as PortalData;
      setPortalData(data);

      if (data.member) {
        setProfile({
          bio: data.member.bio || '',
          achievements: data.member.achievements || '',
          publications: data.member.publications || '',
          websiteUrl: data.member.websiteUrl || '',
          linkedinUrl: data.member.linkedinUrl || '',
          orcidUrl: data.member.orcidUrl || '',
          photoUrl: data.member.photoUrl || '',
          skills: data.member.skills?.join(', ') || '',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [router, status]);

  useEffect(() => {
    if (session?.user.role === 'admin' || session?.user.role === 'superadmin') {
      router.push('/admin');
    }
  }, [router, session]);

  useEffect(() => {
    if (session?.user) {
      loadPortalData();
    }
  }, [loadPortalData, session]);

  const filteredApplications = useMemo(() => {
    const applications = portalData?.applications || [];
    if (!searchQuery.trim()) return applications;

    const query = searchQuery.toLowerCase();
    return applications.filter((application) =>
      [application.fullName, application.email, application.institution, application.designation]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query))
    );
  }, [portalData?.applications, searchQuery]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await updateMemberProfile({
        bio: profile.bio,
        achievements: profile.achievements,
        publications: profile.publications,
        websiteUrl: profile.websiteUrl,
        linkedinUrl: profile.linkedinUrl,
        orcidUrl: profile.orcidUrl,
        photoUrl: profile.photoUrl,
        skills: profile.skills
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      });

      if (!res.success) {
        toast('error', res.error || 'Failed to save your profile.');
        return;
      }

      toast('success', res.message || 'Profile updated successfully.');
      await loadPortalData();
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className={styles.loading}>Loading your member portal...</div>;
  }

  if (!session?.user) return null;

  const member = portalData?.member;
  const applications = portalData?.applications || [];
  const pendingCount = applications.filter((item) => item.status === 'submitted' || item.status === 'under_review').length;

  return (
    <div className={styles.page}>
      <div className="container">
        <section className={styles.header}>
          <div>
            <span className={styles.kicker}>Member Portal</span>
            <h1>Welcome back, {session.user.name}.</h1>
            <p>Track your standing, manage your public academic page, and keep your profile current.</p>
          </div>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })} className={styles.logoutButton}>
            <LogOut size={16} /> Sign Out
          </Button>
        </section>

        <section className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <span>Applications</span>
            <strong>{applications.length}</strong>
            <p>Total records linked to your account.</p>
          </article>
          <article className={styles.summaryCard}>
            <span>Under review</span>
            <strong>{pendingCount}</strong>
            <p>Applications awaiting committee action.</p>
          </article>
          <article className={styles.summaryCard}>
            <span>Member status</span>
            <strong>{member ? formatLabel(member.status) : 'Applicant'}</strong>
            <p>{member ? `${formatLabel(member.type)} member profile active.` : 'No activated membership yet.'}</p>
          </article>
        </section>

        <section className={styles.workspace}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={activeTab === 'overview' ? styles.tabActive : ''}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={activeTab === 'profile' ? styles.tabActive : ''}
              onClick={() => setActiveTab('profile')}
              disabled={!member}
            >
              Public Profile
            </button>
          </div>

          {activeTab === 'overview' ? (
            <div className={styles.overview}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h2>Credential Summary</h2>
                    <p>Your active Westbridge identity and public profile link.</p>
                  </div>
                </div>

                {member ? (
                  <div className={styles.identityGrid}>
                    <div className={styles.identityCard}>
                      <span className={styles.identityTag}>{formatLabel(member.type)}</span>
                      <h3>{member.fullName}</h3>
                      <p>
                        {member.designation} at {member.institution}
                      </p>
                      <div className={styles.identityMeta}>
                        <span>
                          <Shield size={15} /> {formatLabel(member.status)}
                        </span>
                        <span>
                          <Calendar size={15} /> Joined{' '}
                          {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className={styles.credentialsCard}>
                      <dl>
                        <div>
                          <dt>Membership ID</dt>
                          <dd>{member.membershipId}</dd>
                        </div>
                        <div>
                          <dt>Portal Email</dt>
                          <dd>{member.email}</dd>
                        </div>
                        <div>
                          <dt>Academic Email</dt>
                          <dd>{member.orgEmail || 'Not provisioned yet'}</dd>
                        </div>
                      </dl>

                      <div className={styles.profileActions}>
                        <Link href={`/members/${member.membershipId}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink size={15} /> View Public Profile
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/members/${member.membershipId}`);
                            toast('success', 'Public profile link copied.');
                          }}
                        >
                          <Copy size={15} /> Copy Link
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.placeholder}>
                    <BookOpen size={24} />
                    <p>Your membership profile will appear here after application approval.</p>
                    <Link href="/membership/fellow">
                      <Button variant="primary">Apply for Membership</Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h2>Application History</h2>
                    <p>Review recent applications connected to this account.</p>
                  </div>
                  <div className={styles.searchInline}>
                    <Search size={16} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search applications"
                    />
                  </div>
                </div>

                <div className={styles.applicationList}>
                  {filteredApplications.length === 0 ? (
                    <div className={styles.placeholder}>No applications matched your search.</div>
                  ) : (
                    filteredApplications.map((application) => (
                      <article key={application._id} className={styles.applicationCard}>
                        <div>
                          <span className={styles.applicationType}>{formatLabel(application.type)}</span>
                          <h3>{application.fullName}</h3>
                          <p>
                            {application.designation} at {application.institution}
                          </p>
                        </div>
                        <div className={styles.applicationMeta}>
                          <span>{formatLabel(application.status)}</span>
                          <span>
                            Submitted{' '}
                            {new Date(application.createdAt).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            member && (
              <form className={styles.profileForm} onSubmit={handleSave}>
                <div className={styles.cardHeader}>
                  <div>
                    <h2>Public Academic Profile</h2>
                    <p>This information appears on your public member page after saving.</p>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formPanel}>
                    <ImageUpload value={profile.photoUrl} onChange={(value) => setProfile((prev) => ({ ...prev, photoUrl: value }))} />
                    <Textarea
                      label="Short Biography"
                      rows={5}
                      value={profile.bio}
                      onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Summarize your research background, focus areas, and current work."
                    />
                    <Input
                      label="Skills"
                      value={profile.skills}
                      onChange={(e) => setProfile((prev) => ({ ...prev, skills: e.target.value }))}
                      placeholder="Comma-separated, for example: Computational Biology, Signal Processing"
                    />
                  </div>

                  <div className={styles.formPanel}>
                    <Textarea
                      label="Achievements"
                      rows={4}
                      value={profile.achievements}
                      onChange={(e) => setProfile((prev) => ({ ...prev, achievements: e.target.value }))}
                      placeholder="List awards, recognitions, grants, or notable academic milestones."
                    />
                    <Textarea
                      label="Publications"
                      rows={4}
                      value={profile.publications}
                      onChange={(e) => setProfile((prev) => ({ ...prev, publications: e.target.value }))}
                      placeholder="Summarize publications, journals, conference papers, or books."
                    />
                    <Input
                      label="Website"
                      value={profile.websiteUrl}
                      onChange={(e) => setProfile((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                      icon={<Globe size={16} />}
                      placeholder="researchsite.org/profile"
                    />
                    <Input
                      label="LinkedIn"
                      value={profile.linkedinUrl}
                      onChange={(e) => setProfile((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
                      icon={<Briefcase size={16} />}
                      placeholder="linkedin.com/in/username"
                    />
                    <Input
                      label="ORCID"
                      value={profile.orcidUrl}
                      onChange={(e) => setProfile((prev) => ({ ...prev, orcidUrl: e.target.value }))}
                      icon={<Sparkles size={16} />}
                      placeholder="orcid.org/0000-0000-0000-0000"
                    />
                  </div>
                </div>

                <div className={styles.formFooter}>
                  <div className={styles.profileHint}>
                    <Mail size={16} />
                    <span>Public profile: /members/{member.membershipId}</span>
                  </div>
                  <Button type="submit" variant="primary" loading={saving}>
                    Save profile
                  </Button>
                </div>
              </form>
            )
          )}
        </section>
      </div>
    </div>
  );
}
