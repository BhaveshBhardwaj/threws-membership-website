'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { resetPasswordWithToken } from '@/actions/password.actions';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast('error', 'Invalid reset link. Please request a new password reset.');
      return;
    }
    if (password.length < 8) {
      toast('error', 'Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      toast('error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordWithToken(token, password);
      if (res.success) {
        toast('success', res.message || 'Password updated successfully.');
        router.push('/login');
      } else {
        toast('error', res.error || 'Could not reset password.');
      }
    } catch {
      toast('error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          This reset link is invalid or missing. Request a new link from the forgot password page.
        </p>
        <Link href="/forgot-password" style={{
          color: 'var(--color-primary)',
          fontWeight: 600,
          textDecoration: 'none',
        }}>
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          New Password
        </label>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
          }}>
            <Lock size={18} style={{ opacity: 0.7 }} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            style={{
              width: '100%',
              padding: '0.75rem 2.75rem 0.75rem 2.75rem',
              borderRadius: '12px',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Confirm New Password
        </label>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
          }}>
            <Lock size={18} style={{ opacity: 0.7 }} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              borderRadius: '12px',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        style={{
          padding: '0.875rem',
          borderRadius: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '0.25rem',
        }}
      >
        {loading ? 'Updating...' : (
          <>
            Update Password <ArrowRight size={18} />
          </>
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1.5rem',
      background: 'var(--color-bg-secondary)',
    }}>
      <div style={{
        background: 'var(--glass-bg, rgba(255, 255, 255, 0.03))',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--color-border)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '460px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem',
          }}>
            Set New Password
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
            Choose a strong password for your account.
          </p>
        </div>

        <Suspense fallback={<p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>

        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-border)',
        }}>
          <Link href="/login" style={{
            color: 'var(--color-primary)',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.925rem',
          }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
