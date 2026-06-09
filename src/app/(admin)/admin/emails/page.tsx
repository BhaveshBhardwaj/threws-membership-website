'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Mail, Search, RefreshCw, Send, CheckCircle, ShieldAlert, Edit2, Check } from 'lucide-react';
import {
  getOrgEmails,
  updateOrgEmailStatus,
  updateOrgEmailForwarding,
  resendWelcomeEmail,
} from '@/actions/emailMgmt.actions';

interface MemberEmailRow {
  _id: string;
  fullName: string;
  membershipId: string;
  type: 'fellow' | 'senior';
  email: string;
  orgEmail: string;
  orgEmailStatus: 'active' | 'inactive' | 'suspended';
  orgEmailForwardTo: string;
  orgEmailPassword?: string;
  joinedAt: string;
}

export default function OrgEmailsPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<MemberEmailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editForwardingId, setEditForwardingId] = useState<string | null>(null);
  const [newForwardingAddress, setNewForwardingAddress] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const limit = 15;

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchEmails = useCallback(async () => {
    try {
      const result = await getOrgEmails({
        page,
        limit,
        status: statusFilter === 'all' ? '' : statusFilter,
        search: search.trim() || undefined,
      });

      if (result.success && result.data) {
        setMembers(result.data as unknown as MemberEmailRow[]);
        setTotalCount(result.pagination?.total || 0);
      } else {
        toast('error', result.error || 'Failed to fetch emails');
      }
    } catch (err) {
      console.error('Failed to load org emails:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, toast]);

  useEffect(() => {
    setLoading(true);
    fetchEmails();
  }, [fetchEmails]);

  const handleStatusUpdate = async (id: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setActionLoading(`status-${id}`);
    try {
      const result = await updateOrgEmailStatus(id, newStatus);
      if (result.success) {
        toast('success', `Status updated to ${newStatus}`);
        setMembers((prev) =>
          prev.map((m) => (m._id === id ? { ...m, orgEmailStatus: newStatus } : m))
        );
      } else {
        toast('error', result.error || 'Failed to update status');
      }
    } catch {
      toast('error', 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleForwardingUpdate = async (id: string) => {
    if (!newForwardingAddress) return;
    setActionLoading(`forward-${id}`);
    try {
      const result = await updateOrgEmailForwarding(id, newForwardingAddress);
      if (result.success) {
        toast('success', 'Forwarding destination updated!');
        setMembers((prev) =>
          prev.map((m) => (m._id === id ? { ...m, orgEmailForwardTo: newForwardingAddress } : m))
        );
        setEditForwardingId(null);
        setNewForwardingAddress('');
      } else {
        toast('error', result.error || 'Failed to update forwarding');
      }
    } catch {
      toast('error', 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendWelcome = async (id: string) => {
    setActionLoading(`resend-${id}`);
    try {
      const result = await resendWelcomeEmail(id);
      if (result.success) {
        toast('success', 'Onboarding email sent successfully');
      } else {
        toast('error', result.error || 'Failed to resend email');
      }
    } catch (err: any) {
      toast('error', err?.message || 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const startEditingForwarding = (member: MemberEmailRow) => {
    setEditForwardingId(member._id);
    setNewForwardingAddress(member.orgEmailForwardTo || member.email);
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            Organization Email Provisioning
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Manage professional `@westbridgeresearch.com` emails, configure automatic personal forwarders, and control onboarding workflows.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setLoading(true); fetchEmails(); }}
          loading={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* Filters Toolbar */}
      <Card>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flexGrow: 1, maxWidth: '600px' }}>
            <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search by name, ID, or provisioned email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '8px',
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ minWidth: '160px' }}>
              <Select
                label="Email Status"
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active Only' },
                  { value: 'suspended', label: 'Suspended Only' },
                  { value: 'inactive', label: 'Inactive Only' },
                ]}
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
              />
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', paddingBottom: '0.5rem' }}>
            Showing <strong>{members.length}</strong> of <strong>{totalCount}</strong> addresses
          </div>
        </div>
      </Card>

      {/* Main Grid */}
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)' }}>
            Loading provisioned emails...
          </div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)' }}>
            <Mail size={40} style={{ color: 'var(--color-text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>No provisioned email addresses found</p>
            <p style={{ fontSize: '0.875rem' }}>Verify that membership applications are approved to automatically trigger provisioning.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-secondary)', textAlign: 'left' }}>
                  {['Member & ID', 'Provisioned WBR Address', 'Destination Forwarder', 'Status', 'Actions'].map((h) => (
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
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Member Profile */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{member.fullName}</p>
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem', alignItems: 'center' }}>
                          <Badge variant={member.type === 'fellow' ? 'primary' : 'default'} size="sm">
                            {member.type.toUpperCase()}
                          </Badge>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ID: {member.membershipId}</span>
                        </div>
                      </div>
                    </td>

                    {/* Provisioned Email & Password */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.9375rem', color: 'var(--color-primary-dark)', fontWeight: '600' }}>
                          {member.orgEmail}
                        </span>
                        {member.orgEmailPassword && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Password:</span>
                            <span style={{ fontFamily: 'monospace', background: 'var(--color-bg-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)', fontWeight: '600' }}>
                              {visiblePasswords[member._id] ? member.orgEmailPassword : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(member._id)}
                              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, padding: 0 }}
                            >
                              {visiblePasswords[member._id] ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Forwarding Address */}
                    <td style={{ padding: '0.875rem 1rem', maxWidth: '300px' }}>
                      {editForwardingId === member._id ? (
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <input
                            type="email"
                            value={newForwardingAddress}
                            onChange={(e) => setNewForwardingAddress(e.target.value)}
                            style={{
                              padding: '0.35rem 0.5rem',
                              borderRadius: '6px',
                              border: '1px solid var(--color-primary)',
                              fontSize: '0.85rem',
                              width: '180px',
                              outline: 'none',
                            }}
                          />
                          <button
                            onClick={() => handleForwardingUpdate(member._id)}
                            disabled={actionLoading === `forward-${member._id}`}
                            style={{ background: 'var(--color-success-bg, #ecfdf5)', color: 'var(--color-success, #059669)', border: 'none', padding: '0.35rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Save"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditForwardingId(null)}
                            style={{ background: 'var(--color-error-bg, #fef2f2)', color: 'var(--color-error, #dc2626)', border: 'none', padding: '0.35rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
                            {member.orgEmailForwardTo || member.email}
                          </span>
                          <button
                            onClick={() => startEditingForwarding(member)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                            title="Edit Forwarding"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Email Status */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge
                        variant={
                          member.orgEmailStatus === 'active' ? 'success' :
                          member.orgEmailStatus === 'suspended' ? 'error' : 'warning'
                        }
                      >
                        {member.orgEmailStatus.charAt(0).toUpperCase() + member.orgEmailStatus.slice(1)}
                      </Badge>
                    </td>

                    {/* Administrative Controls */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {/* Status Toggle */}
                        {member.orgEmailStatus === 'active' ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!!actionLoading}
                            onClick={() => handleStatusUpdate(member._id, 'suspended')}
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!actionLoading}
                            onClick={() => handleStatusUpdate(member._id, 'active')}
                          >
                            Activate
                          </Button>
                        )}

                        {/* Onboarding Credentials resend */}
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={!!actionLoading}
                          loading={actionLoading === `resend-${member._id}`}
                          onClick={() => handleResendWelcome(member._id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Send size={12} /> Credentials
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
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
    </div>
  );
}
