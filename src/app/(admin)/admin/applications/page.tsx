'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import {
  getApplications,
  updateApplicationStatus,
  deleteApplication,
  markApplicationAsRead,
  retryApplicationEmail,
} from '@/actions/application.actions';
import { createMemberFromApplication } from '@/actions/member.actions';

type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'interview' | 'approved' | 'rejected';
type ApplicationType = 'student' | 'collaborator' | 'professional' | 'senior' | 'fellow' | 'distinguished_fellow';

interface ApplicationRow {
  _id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address: string;
  institution: string;
  designation: string;
  department: string;
  researchAreas: string[];
  qualifications: string;
  experience: string;
  publications?: string;
  achievements?: string;
  referenceNames?: string;
  motivation: string;
  resumeUrl?: string;
  photoUrl?: string;
  emailDeliveryStatus: 'pending' | 'success' | 'failed';
  emailDeliveryError?: string;
  isAdminRead: boolean;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: { name?: string; email?: string } | null;
  adminNotes?: string;
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under review',
  interview: 'Interview',
  approved: 'Approved',
  rejected: 'Rejected',
};

const STATUS_VARIANTS: Record<ApplicationStatus, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  draft: 'default',
  submitted: 'info',
  under_review: 'warning',
  interview: 'warning',
  approved: 'success',
  rejected: 'error',
};

const TYPE_LABELS: Record<ApplicationType, string> = {
  student: 'Student Researcher',
  collaborator: 'Collaborator',
  professional: 'Professional Member',
  senior: 'Senior Member',
  fellow: 'Fellow (F.Res)',
  distinguished_fellow: 'Honorary Fellow',
};

const TYPE_VARIANTS: Record<ApplicationType, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  student: 'default',
  collaborator: 'default',
  professional: 'default',
  senior: 'warning',
  fellow: 'primary',
  distinguished_fellow: 'info',
};

export default function ApplicationsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | ApplicationStatus>('');
  const [typeFilter, setTypeFilter] = useState<'' | ApplicationType>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const limit = 15;

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const fetchApplications = useCallback(async () => {
    try {
      const result = await getApplications({
        page,
        limit,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: search || undefined,
      });
      if (result.success && result.data) {
        setApplications(result.data as unknown as ApplicationRow[]);
        setTotalCount(result.pagination?.total || 0);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, search]);

  useEffect(() => {
    setLoading(true);
    fetchApplications();
  }, [fetchApplications]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      fetchApplications();
    }, 30000);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [fetchApplications]);

  const handleStatusUpdate = async (id: string, newStatus: ApplicationStatus) => {
    setActionLoading(`status-${id}`);
    try {
      const result = await updateApplicationStatus(id, newStatus, adminNotes || undefined);
      if (result.success && result.data) {
        const updated = result.data as unknown as ApplicationRow;
        toast('success', `Application ${STATUS_LABELS[newStatus]} successfully`);
        setApplications((prev) =>
          prev.map((a) => (a._id === id ? { ...a, ...updated } : a))
        );
        setSelectedApp((prev) => (prev && prev._id === id ? { ...prev, ...updated } : prev));
        if (newStatus === 'approved' || newStatus === 'rejected') {
          setSelectedApp(null);
          setAdminNotes('');
        } else {
          setAdminNotes(updated.adminNotes || '');
        }
      } else {
        toast('error', result.error || 'Failed to update status');
      }
    } catch (err) {
      toast('error', 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveNotes = async (id: string, currentStatus: ApplicationStatus) => {
    setActionLoading(`notes-${id}`);
    try {
      const result = await updateApplicationStatus(id, currentStatus, adminNotes || '');
      if (result.success && result.data) {
        const updated = result.data as unknown as ApplicationRow;
        toast('success', 'Notes saved');
        setApplications((prev) =>
          prev.map((a) => (a._id === id ? { ...a, ...updated } : a))
        );
        setSelectedApp((prev) => (prev && prev._id === id ? { ...prev, ...updated } : prev));
      } else {
        toast('error', result.error || 'Failed to save notes');
      }
    } catch (err) {
      toast('error', 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application? This cannot be undone.')) return;
    setActionLoading(`delete-${id}`);
    try {
      const result = await deleteApplication(id);
      if (result.success) {
        toast('success', 'Application deleted');
        setApplications((prev) => prev.filter((a) => a._id !== id));
        setTotalCount((c) => c - 1);
      } else {
        toast('error', result.error || 'Failed to delete');
      }
    } catch {
      toast('error', 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkRead = async (id: string) => {
    setActionLoading(`read-${id}`);
    try {
      await markApplicationAsRead(id);
      setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, isAdminRead: true } : a)));
      setSelectedApp((prev) => (prev && prev._id === id ? { ...prev, isAdminRead: true } : prev));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetryEmail = async (id: string) => {
    setActionLoading(`email-${id}`);
    try {
      const result = await retryApplicationEmail(id);
      if (result.success) {
        toast('success', 'Email resent successfully');
        setApplications((prev) =>
          prev.map((a) =>
            a._id === id
              ? { ...a, emailDeliveryStatus: 'success', emailDeliveryError: undefined }
              : a
          )
        );
      } else {
        toast('error', result.error || 'Failed to resend email');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateMember = async (id: string) => {
    setActionLoading(`member-${id}`);
    try {
      const result = await createMemberFromApplication(id);
      if (result.success) {
        toast('success', result.message || 'Member profile created');
      } else {
        toast('error', result.error || 'Failed to create member');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);
  const unreadCount = applications.filter((a) => !a.isAdminRead).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            Membership Applications
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            {totalCount} total • {unreadCount} unread • Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setLoading(true); fetchApplications(); }}
          loading={loading}
        >
          ↻ Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
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
              <Button size="sm" variant="outline" onClick={() => { setSearch(searchInput); setPage(1); }}>
                Search
              </Button>
              {search && (
                <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
                  Clear
                </Button>
              )}
            </div>
          </div>
          <div style={{ minWidth: '160px' }}>
            <Select
              label="Status"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'submitted', label: 'Submitted' },
                { value: 'under_review', label: 'Under Review' },
                { value: 'interview', label: 'Interview' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
            />
          </div>
          <div style={{ minWidth: '160px' }}>
            <Select
              label="Type"
              options={[
                { value: '', label: 'All Types' },
                { value: 'student', label: 'Student' },
                { value: 'collaborator', label: 'Collaborator' },
                { value: 'professional', label: 'Professional' },
                { value: 'senior', label: 'Senior' },
                { value: 'fellow', label: 'Fellow Member' },
                { value: 'distinguished_fellow', label: 'Honorary Fellow' },
              ]}
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1); }}
            />
          </div>
        </div>
      </Card>

      {/* Applications List */}
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>No applications found</p>
            <p style={{ fontSize: '0.875rem' }}>Try adjusting your filters or wait for new submissions.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-secondary)', textAlign: 'left' }}>
                  {['Applicant', 'Type', 'Status', 'Email Status', 'Date', 'Actions'].map((h) => (
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
                {applications.map((app, i) => (
                  <tr
                    key={app._id}
                    style={{
                      background: !app.isAdminRead ? 'var(--color-primary-50)' : i % 2 === 0 ? 'var(--color-bg-primary)' : 'var(--color-bg-secondary)',
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {!app.isAdminRead && (
                          <span style={{ width: '8px', height: '8px', background: 'var(--color-warning)', borderRadius: '50%', flexShrink: 0 }} />
                        )}
                        <div>
                          <p style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{app.fullName}</p>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{app.email}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{app.institution}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge variant={TYPE_VARIANTS[app.type]}>
                        {TYPE_LABELS[app.type]}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge variant={STATUS_VARIANTS[app.status]}>
                        {STATUS_LABELS[app.status]}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge
                        variant={
                          app.emailDeliveryStatus === 'success' ? 'success' :
                          app.emailDeliveryStatus === 'failed' ? 'error' : 'warning'
                        }
                      >
                        {app.emailDeliveryStatus === 'success' ? 'Delivered' :
                         app.emailDeliveryStatus === 'failed' ? 'Failed' : 'Pending'}
                      </Badge>
                      {app.emailDeliveryStatus === 'failed' && (
                        <button
                          style={{ display: 'block', marginTop: '4px', fontSize: '0.7rem', color: 'var(--color-primary)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                          onClick={() => handleRetryEmail(app._id)}
                          disabled={actionLoading === `email-${app._id}`}
                        >
                          {actionLoading === `email-${app._id}` ? 'Retrying...' : 'Retry →'}
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }}>
                      {formatDate(app.createdAt)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {/* View details */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedApp(app);
                            setAdminNotes(app.adminNotes || '');
                            if (!app.isAdminRead) handleMarkRead(app._id);
                          }}
                        >
                          View
                        </Button>

                        {/* Review stages */}
                        {app.status !== 'approved' && app.status !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!actionLoading}
                            onClick={() => handleStatusUpdate(app._id, 'under_review')}
                          >
                            Under Review
                          </Button>
                        )}
                        {app.status !== 'approved' && app.status !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!actionLoading}
                            onClick={() => handleStatusUpdate(app._id, 'interview')}
                          >
                            Interview
                          </Button>
                        )}

                        {/* Approve */}
                        {app.status !== 'approved' && (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={!!actionLoading}
                            loading={actionLoading === `status-${app._id}`}
                            onClick={() => handleStatusUpdate(app._id, 'approved')}
                          >
                            Approve
                          </Button>
                        )}

                        {/* Reject */}
                        {app.status !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!!actionLoading}
                            loading={actionLoading === `status-${app._id}`}
                            onClick={() => handleStatusUpdate(app._id, 'rejected')}
                          >
                            Reject
                          </Button>
                        )}

                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={!!actionLoading}
                          loading={actionLoading === `delete-${app._id}`}
                          onClick={() => handleDelete(app._id)}
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
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Previous
            </Button>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </Button>
          </div>
        )}
      </Card>

      {/* Application Detail Modal */}
      {selectedApp && (
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
          onClick={() => setSelectedApp(null)}
        >
          <div
            style={{
              background: 'var(--color-bg-primary)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  {selectedApp.fullName}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <Badge variant={TYPE_VARIANTS[selectedApp.type]}>
                    {TYPE_LABELS[selectedApp.type]}
                  </Badge>
                  <Badge variant={STATUS_VARIANTS[selectedApp.status]}>
                    {STATUS_LABELS[selectedApp.status]}
                  </Badge>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                onClick={() => setSelectedApp(null)}
              >
                ✕
              </button>
            </div>

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Email', value: selectedApp.email },
                { label: 'Phone', value: selectedApp.phone },
                { label: 'Institution', value: selectedApp.institution },
                { label: 'Designation', value: selectedApp.designation },
                { label: 'Department', value: selectedApp.department },
                { label: 'Date of Birth', value: selectedApp.dateOfBirth },
                { label: 'Gender', value: selectedApp.gender },
                { label: 'Address', value: selectedApp.address },
                { label: 'Applied', value: formatDate(selectedApp.createdAt) },
                { label: 'Reviewed', value: selectedApp.reviewedAt ? formatDate(selectedApp.reviewedAt) : '—' },
                {
                  label: 'Reviewed By',
                  value: selectedApp.reviewedBy && typeof selectedApp.reviewedBy === 'object'
                    ? (selectedApp.reviewedBy.name || selectedApp.reviewedBy.email || '—')
                    : '—',
                },
                { label: 'SMTP', value: selectedApp.emailDeliveryStatus },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)', marginTop: '0.125rem' }}>{value || '—'}</p>
                </div>
              ))}
            </div>

            {selectedApp.emailDeliveryStatus === 'failed' && selectedApp.emailDeliveryError && (
              <div style={{ marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.875rem 1rem', borderRadius: '10px', color: 'var(--color-error)' }}>
                SMTP error: {selectedApp.emailDeliveryError}
              </div>
            )}

            {/* Research Areas */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Research Areas
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {(selectedApp.researchAreas || []).map((area) => (
                  <Badge key={area} variant="default" size="sm">{area}</Badge>
                ))}
              </div>
            </div>

            {/* Qualifications & Experience */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Qualifications
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: '1.7', background: 'var(--color-bg-secondary)', borderRadius: '8px', padding: '0.875rem' }}>
                  {selectedApp.qualifications || '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Experience
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: '1.7', background: 'var(--color-bg-secondary)', borderRadius: '8px', padding: '0.875rem' }}>
                  {selectedApp.experience || '—'}
                </p>
              </div>
            </div>

            {/* Publications & References */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Publications
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: '1.7', background: 'var(--color-bg-secondary)', borderRadius: '8px', padding: '0.875rem' }}>
                  {selectedApp.publications || '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Achievements
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: '1.7', background: 'var(--color-bg-secondary)', borderRadius: '8px', padding: '0.875rem' }}>
                  {selectedApp.achievements || '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  References
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: '1.7', background: 'var(--color-bg-secondary)', borderRadius: '8px', padding: '0.875rem' }}>
                  {selectedApp.referenceNames || '—'}
                </p>
              </div>
            </div>

            {/* Attachments */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Attachments
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', background: 'var(--color-bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Resume</span>
                  {selectedApp.resumeUrl ? (
                    <a href={selectedApp.resumeUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                      Open
                    </a>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)' }}>Not provided</span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', background: 'var(--color-bg-secondary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Profile Photo</span>
                  {selectedApp.photoUrl ? (
                    <a href={selectedApp.photoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                      View
                    </a>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)' }}>Not provided</span>
                  )}
                </div>
              </div>
            </div>

            {/* Motivation */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Motivation
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: '1.7', background: 'var(--color-bg-secondary)', borderRadius: '8px', padding: '0.875rem' }}>
                {selectedApp.motivation}
              </p>
            </div>

            {/* Admin Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Admin Notes (optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Add notes before approving or rejecting..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1.5px solid var(--color-border)', fontSize: '0.9rem', resize: 'vertical', color: 'var(--color-text-primary)', background: 'var(--color-bg-primary)', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                onClick={() => handleSaveNotes(selectedApp._id, selectedApp.status)}
                disabled={!!actionLoading}
                loading={actionLoading === `notes-${selectedApp._id}`}
              >
                Save Notes
              </Button>

              {selectedApp.status !== 'approved' && selectedApp.status !== 'rejected' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(selectedApp._id, 'under_review')}
                    disabled={!!actionLoading}
                    loading={actionLoading === `status-${selectedApp._id}`}
                  >
                    Mark Under Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate(selectedApp._id, 'interview')}
                    disabled={!!actionLoading}
                    loading={actionLoading === `status-${selectedApp._id}`}
                  >
                    Schedule Interview
                  </Button>
                </>
              )}

              {selectedApp.status !== 'approved' && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusUpdate(selectedApp._id, 'approved')}
                  disabled={!!actionLoading}
                  loading={actionLoading === `status-${selectedApp._id}`}
                >
                  ✓ Approve Application
                </Button>
              )}
              {selectedApp.status !== 'rejected' && (
                <Button
                  variant="danger"
                  onClick={() => handleStatusUpdate(selectedApp._id, 'rejected')}
                  disabled={!!actionLoading}
                  loading={actionLoading === `status-${selectedApp._id}`}
                >
                  ✕ Reject Application
                </Button>
              )}

              {selectedApp.status === 'approved' && (
                <Button
                  variant="secondary"
                  onClick={() => handleCreateMember(selectedApp._id)}
                  disabled={!!actionLoading}
                  loading={actionLoading === `member-${selectedApp._id}`}
                >
                  Create Member Profile
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
