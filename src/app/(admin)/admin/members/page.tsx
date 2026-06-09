'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { getMembers, updateMember, deleteMember } from '@/actions/member.actions';
import type { MemberData } from '@/types';

const MEMBER_TYPE_LABELS: Record<MemberData['type'], string> = {
  student: 'Student Researcher',
  collaborator: 'Collaborator',
  professional: 'Professional Member',
  senior: 'Senior Member',
  fellow: 'Fellow (F.Res)',
  distinguished_fellow: 'Honorary Fellow',
};

const MEMBER_STATUS_VARIANTS: Record<MemberData['status'], 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'error',
};

export default function MembersPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'inactive' | 'suspended'>('');
  const [typeFilter, setTypeFilter] = useState<'' | 'student' | 'collaborator' | 'professional' | 'senior' | 'fellow' | 'distinguished_fellow'>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const limit = 15;

  const formatDate = (value?: string | Date) => {
    if (!value) return '—';
    const date = typeof value === 'string' ? new Date(value) : value;
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    if (!selectedMember) {
      setShowSecrets(false);
    }
  }, [selectedMember]);

  const fetchMembers = useCallback(async () => {
    try {
      const result = await getMembers({
        page,
        limit,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: search || undefined,
      });
      if (result.success && result.data) {
        setMembers(result.data);
        setTotalCount(result.pagination?.total || 0);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, search]);

  useEffect(() => {
    setLoading(true);
    fetchMembers();
  }, [fetchMembers]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      fetchMembers();
    }, 30000);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [fetchMembers]);

  const handleStatusChange = async (id: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setActionLoading(`status-${id}`);
    try {
      const result = await updateMember(id, { status: newStatus });
      if (result.success) {
        toast('success', `Member status updated to ${newStatus}`);
        setMembers((prev) => prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m)));
        setSelectedMember((prev) => (prev && prev._id === id ? { ...prev, status: newStatus } : prev));
      } else {
        toast('error', result.error || 'Failed to update member');
      }
    } catch {
      toast('error', 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };



  const handleDelete = async (id: string) => {
    if (!confirm('Delete this member? Only superadmins can do this.')) return;
    setActionLoading(`delete-${id}`);
    try {
      const result = await deleteMember(id);
      if (result.success) {
        toast('success', 'Member deleted');
        setMembers((prev) => prev.filter((m) => m._id !== id));
        setTotalCount((c) => c - 1);
        setSelectedMember((prev) => (prev && prev._id === id ? null : prev));
      } else {
        toast('error', result.error || 'Failed to delete');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            Members
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            {totalCount} total members • Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setLoading(true); fetchMembers(); }}
          loading={loading}
        >
          ↻ Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>
              Search
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
                placeholder="Name, email, institution..."
                style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--color-text-primary)', background: 'var(--color-bg-primary)', outline: 'none' }}
              />
              <Button size="sm" variant="outline" onClick={() => setSearch(searchInput)}>Search</Button>
              {search && <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setSearchInput(''); }}>Clear</Button>}
            </div>
          </div>
          <div style={{ minWidth: '160px' }}>
            <Select
              label="Status"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
              ]}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
            />
          </div>
          <div style={{ minWidth: '160px' }}>
            <Select
              label="Membership Type"
              options={[
                { value: '', label: 'All Types' },
                { value: 'student', label: 'Student Researcher' },
                { value: 'collaborator', label: 'Collaborator' },
                { value: 'professional', label: 'Professional Member' },
                { value: 'senior', label: 'Senior Member' },
                { value: 'fellow', label: 'Fellow (F.Res)' },
                { value: 'distinguished_fellow', label: 'Honorary Fellow' },
              ]}
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1); }}
            />
          </div>
        </div>
      </Card>

      {/* Members Table */}
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            Loading members...
          </div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>No members found</p>
            <p style={{ fontSize: '0.875rem' }}>
              Members are created when applications are approved. Go to Applications and approve submitted applications.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-secondary)', textAlign: 'left' }}>
                  {['Member', 'Membership ID', 'Type', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '0.75rem 1rem',
                        fontWeight: '600',
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.8125rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((member, i) => (
                  <tr
                    key={member._id}
                    style={{
                      background: i % 2 === 0 ? 'var(--color-bg-primary)' : 'var(--color-bg-secondary)',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{member.fullName}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{member.email}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{member.institution}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <code style={{ fontSize: '0.8rem', background: 'var(--color-bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {member.membershipId}
                      </code>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge variant={member.type === 'fellow' ? 'primary' : 'default'}>
                        {MEMBER_TYPE_LABELS[member.type]}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge variant={MEMBER_STATUS_VARIANTS[member.status]}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                    </td>

                    <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {formatDate(member.joinedAt)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedMember(member)}
                        >
                          View
                        </Button>

                        {/* Toggle Status */}
                        {member.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!!actionLoading}
                            onClick={() => handleStatusChange(member._id!, 'inactive')}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={!!actionLoading}
                            onClick={() => handleStatusChange(member._id!, 'active')}
                          >
                            {member.status === 'suspended' ? 'Reinstate' : 'Activate'}
                          </Button>
                        )}

                        {member.status !== 'suspended' && (
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={!!actionLoading}
                            onClick={() => handleStatusChange(member._id!, 'suspended')}
                          >
                            Suspend
                          </Button>
                        )}



                        {/* Delete (superadmin only) */}
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={!!actionLoading}
                          loading={actionLoading === `delete-${member._id}`}
                          onClick={() => handleDelete(member._id!)}
                        >
                          Del
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Previous
            </Button>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next →
            </Button>
          </div>
        )}
      </Card>

      {selectedMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setSelectedMember(null)}
        >
          <div
            style={{
              background: 'var(--color-bg-primary)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '760px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  {selectedMember.fullName}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <Badge variant={MEMBER_STATUS_VARIANTS[selectedMember.status]}>
                    {selectedMember.status.charAt(0).toUpperCase() + selectedMember.status.slice(1)}
                  </Badge>
                  <Badge variant="primary">{MEMBER_TYPE_LABELS[selectedMember.type]}</Badge>
                  <Badge variant="default">{selectedMember.membershipId}</Badge>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                onClick={() => setSelectedMember(null)}
              >
                ✕
              </button>
            </div>

            {selectedMember.photoUrl && (
              <div style={{ marginBottom: '1.5rem' }}>
                <img
                  src={selectedMember.photoUrl}
                  alt={`${selectedMember.fullName} profile`}
                  style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px', border: '1px solid var(--color-border)' }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Email', value: selectedMember.email },
                { label: 'Phone', value: selectedMember.phone || '—' },
                { label: 'Institution', value: selectedMember.institution },
                { label: 'Designation', value: selectedMember.designation },
                { label: 'Department', value: selectedMember.department || '—' },
                { label: 'Application ID', value: selectedMember.applicationId || '—' },
                { label: 'Org Email', value: selectedMember.orgEmail || '—' },
                { label: 'Org Email Status', value: selectedMember.orgEmailStatus || '—' },
                { label: 'Joined', value: formatDate(selectedMember.joinedAt) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)', marginTop: '0.125rem' }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Research Areas
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {(selectedMember.researchAreas || []).length > 0 ? (
                  selectedMember.researchAreas.map((area) => (
                    <Badge key={area} variant="default" size="sm">{area}</Badge>
                  ))
                ) : (
                  <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Skills
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {(selectedMember.skills || []).length > 0 ? (
                  (selectedMember.skills || []).map((skill) => (
                    <Badge key={skill} variant="info" size="sm">{skill}</Badge>
                  ))
                ) : (
                  <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Bio
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: '1.7', background: 'var(--color-bg-secondary)', borderRadius: '8px', padding: '0.875rem' }}>
                  {selectedMember.bio || '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Achievements
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: '1.7', background: 'var(--color-bg-secondary)', borderRadius: '8px', padding: '0.875rem' }}>
                  {selectedMember.achievements || '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Publications
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: '1.7', background: 'var(--color-bg-secondary)', borderRadius: '8px', padding: '0.875rem' }}>
                  {selectedMember.publications || '—'}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Links
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: 'Website', value: selectedMember.websiteUrl },
                  { label: 'LinkedIn', value: selectedMember.linkedinUrl },
                  { label: 'ORCID', value: selectedMember.orcidUrl },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', background: 'var(--color-bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                    {value ? (
                      <a href={value} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                        Open
                      </a>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>Not provided</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Org Email Credentials
              </p>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', background: 'var(--color-bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Forward To</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{selectedMember.orgEmailForwardTo || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', background: 'var(--color-bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Password</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    {selectedMember.orgEmailPassword
                      ? (showSecrets ? selectedMember.orgEmailPassword : '••••••••')
                      : '—'}
                  </span>
                </div>
                {selectedMember.orgEmailPassword && (
                  <Button size="sm" variant="outline" onClick={() => setShowSecrets((prev) => !prev)}>
                    {showSecrets ? 'Hide Credentials' : 'Show Credentials'}
                  </Button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {selectedMember.status !== 'active' && (
                <Button
                  variant="primary"
                  disabled={!!actionLoading}
                  onClick={() => handleStatusChange(selectedMember._id!, 'active')}
                >
                  Activate
                </Button>
              )}
              {selectedMember.status === 'active' && (
                <Button
                  variant="secondary"
                  disabled={!!actionLoading}
                  onClick={() => handleStatusChange(selectedMember._id!, 'inactive')}
                >
                  Deactivate
                </Button>
              )}
              {selectedMember.status !== 'suspended' && (
                <Button
                  variant="danger"
                  disabled={!!actionLoading}
                  onClick={() => handleStatusChange(selectedMember._id!, 'suspended')}
                >
                  Suspend
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
