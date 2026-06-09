'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { requestPasswordReset } from '@/actions/password.actions';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast('error', 'Please enter your email address.');
      return;
    }
    setLoading(true);

    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setSubmitted(true);
        toast('success', res.message || 'Check your email for next steps.');
      } else {
        toast('error', res.error || 'Something went wrong. Please try again.');
      }
    } catch {
      toast('error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1.5rem',
      background: 'var(--color-bg-secondary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: 'var(--glass-bg, rgba(255, 255, 255, 0.03))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--color-border)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '460px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem',
          }}>
            Forgot Password
          </h1>
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
          }}>
            {submitted
              ? 'If an account exists with that email, you will receive a password reset link shortly. Check your inbox and spam folder.'
              : 'Enter the email address associated with your account and we will send you a reset link.'}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Mail size={18} style={{ opacity: 0.7 }} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
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
              }}
            >
              {loading ? 'Sending...' : (
                <>
                  Send Reset Link <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Button
              variant="primary"
              onClick={() => setSubmitted(false)}
              style={{ marginBottom: '0.75rem', width: '100%' }}
            >
              Send another link
            </Button>
          </div>
        )}

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
