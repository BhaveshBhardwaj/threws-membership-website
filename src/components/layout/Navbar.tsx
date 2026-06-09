'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Shield, Sun, User, X, LogIn } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

import Button from '@/components/ui/Button';
import { ORG } from '@/lib/site-content';

import styles from './Navbar.module.css';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Membership', href: '/membership' },
  { label: 'Conferences', href: '/conferences' },
  { label: 'Blog', href: '/blog' },
  { label: 'Members', href: '/members' },
  { label: 'Contact', href: '/contact' },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/membership') return pathname.startsWith('/membership');
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const Navbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const isAdmin = session?.user.role === 'admin' || session?.user.role === 'superadmin';

  return (
    <header className={styles.header}>
      <nav className={`container ${styles.nav}`}>
        <Link href="/" className={styles.logo}>
          <Image src="/images/logo.png" alt={ORG.name} width={36} height={36} className={styles.logoImage} />
          <span>{ORG.name}</span>
        </Link>

        <div className={styles.desktopMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${isNavActive(pathname, link.href) ? styles.navLinkActive : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle color theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className={styles.desktopActions}>
            {session ? (
              <>
                <Link href="/portal">
                  <Button variant="outline" size="sm" className={styles.actionButton}>
                    <User size={14} /> Portal
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className={`${styles.actionButton} ${styles.adminButton}`}>
                      <Shield size={14} /> Admin
                    </Button>
                  </Link>
                )}
                <Button variant="primary" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className={styles.actionButton}>
                    <LogIn size={14} /> Sign In
                  </Button>
                </Link>
                <Link href="/membership">
                  <Button variant="primary" size="sm">
                    Explore Membership
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className={styles.mobileToggle}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${isNavActive(pathname, link.href) ? styles.navLinkActive : ''}`}
            >
              {link.label}
            </Link>
          ))}

          <div className={styles.mobileActions}>
            {session ? (
              <>
                <Link href="/portal">
                  <Button variant="primary" fullWidth className={styles.actionButton}>
                    <User size={16} /> Member Portal
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" fullWidth className={styles.actionButton}>
                      <Shield size={16} /> Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="outline" fullWidth onClick={() => signOut({ callbackUrl: '/' })}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" fullWidth className={styles.actionButton}>
                    <LogIn size={16} /> Sign In
                  </Button>
                </Link>
                <Link href="/membership">
                  <Button variant="primary" fullWidth>
                    View Membership
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
