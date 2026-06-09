'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { getAllPosts, deletePost, updatePost } from '@/actions/blog.actions';
import type { BlogPostData } from '@/types';

export default function AdminBlogPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | 'draft' | 'published'>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const limit = 15;

  const fetchPosts = useCallback(async () => {
    try {
      const result = await getAllPosts({
        page,
        limit,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      if (result.success && result.data) {
        setPosts(result.data);
        setTotalCount(result.pagination?.total || 0);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    setLoading(true);
    fetchPosts();
  }, [fetchPosts]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      fetchPosts();
    }, 60000);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    setActionLoading(`delete-${id}`);
    try {
      const result = await deletePost(id);
      if (result.success) {
        toast('success', 'Post deleted successfully');
        setPosts((prev) => prev.filter((p) => p._id !== id));
        setTotalCount((c) => c - 1);
      } else {
        toast('error', result.error || 'Failed to delete post');
      }
    } catch {
      toast('error', 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: string) => {
    setActionLoading(`publish-${id}`);
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      const result = await updatePost(id, { status: newStatus });
      if (result.success) {
        toast('success', newStatus === 'published' ? 'Post published!' : 'Post moved to draft');
        setPosts((prev) => prev.map((p) => p._id === id ? { ...p, status: newStatus as any } : p));
      } else {
        toast('error', result.error || 'Failed to update status');
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
            Blog Posts
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            {totalCount} total posts • Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setLoading(true); fetchPosts(); }}
            loading={loading}
          >
            ↻ Refresh
          </Button>
          <Link href="/admin/blog/new">
            <Button variant="primary" size="sm">
              + New Post
            </Button>
          </Link>
        </div>
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
                placeholder="Title or tags..."
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
                { value: '', label: 'All Posts' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Drafts' },
              ]}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
            />
          </div>
        </div>
      </Card>

      {/* Posts Table */}
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>No posts found</p>
            <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Create your first blog post to get started.</p>
            <Link href="/admin/blog/new">
              <Button variant="primary">+ Create First Post</Button>
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-secondary)', textAlign: 'left' }}>
                  {['Title', 'Author', 'Category', 'Status', 'Views', 'Date', 'Actions'].map((h) => (
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
                {posts.map((post, i) => (
                  <tr
                    key={post._id}
                    style={{
                      background: i % 2 === 0 ? 'var(--color-bg-primary)' : 'var(--color-bg-secondary)',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <td style={{ padding: '0.875rem 1rem', maxWidth: '280px' }}>
                      <p style={{ fontWeight: '600', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {post.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                        /{post.slug}
                      </p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-secondary)' }}>
                      {post.author?.name || '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {post.category ? (
                        <Badge variant="default" size="sm">{post.category}</Badge>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <Badge variant={post.status === 'published' ? 'success' : 'warning'}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                      {post.views ?? 0}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {/* Edit */}
                        <Link href={`/admin/blog/${post._id}/edit`}>
                          <Button size="sm" variant="outline">Edit</Button>
                        </Link>

                        {/* Publish / Unpublish */}
                        <Button
                          size="sm"
                          variant={post.status === 'published' ? 'secondary' : 'primary'}
                          disabled={!!actionLoading}
                          loading={actionLoading === `publish-${post._id}`}
                          onClick={() => handlePublishToggle(post._id!, post.status)}
                        >
                          {post.status === 'published' ? 'Unpublish' : 'Publish'}
                        </Button>

                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={!!actionLoading}
                          loading={actionLoading === `delete-${post._id}`}
                          onClick={() => handleDelete(post._id!)}
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
    </div>
  );
}
