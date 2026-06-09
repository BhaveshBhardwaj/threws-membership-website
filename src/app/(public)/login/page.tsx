'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

import styles from './page.module.css';

export default function PublicLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast('error', 'Invalid email or password. Please try again.');
        return;
      }

      try {
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        const role = sessionData?.user?.role;

        if (role === 'admin' || role === 'superadmin') {
          toast('success', 'Administrator login successful.');
          router.push('/admin');
        } else {
          toast('success', 'Signed in successfully.');
          router.push('/portal');
        }
      } catch {
        toast('success', 'Signed in successfully.');
        router.push('/portal');
      }

      router.refresh();
    } catch {
      toast('error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <span className={styles.kicker}>Westbridge Portal</span>
          <h1>Access your research membership workspace.</h1>
          <p>
            Review application progress, manage your public academic profile, and access verified member credentials
            through a cleaner, unified portal experience.
          </p>

          <div className={styles.featureList}>
            <span>Application tracking</span>
            <span>Public profile management</span>
            <span>Verified member credentials</span>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Sign in</h2>
            <p>Use your registered email or your provisioned academic credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@institution.edu"
              icon={<Mail size={18} />}
              required
            />

            <div className={styles.passwordField}>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                icon={<Lock size={18} />}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className={styles.formMeta}>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className={styles.submit}>
              {!loading && (
                <>
                  Continue <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          <div className={styles.footer}>
            <span>New to Westbridge Research?</span>
            <Link href="/signup">Create an account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
