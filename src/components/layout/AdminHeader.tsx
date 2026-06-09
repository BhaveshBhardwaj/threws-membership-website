'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Bell, LogOut, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import styles from './AdminHeader.module.css';

export default function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === '/admin/login') {
    return null;
  }

  // Build a breadcrumb from pathname
  const breadcrumb = pathname
    .replace('/admin', '')
    .split('/')
    .filter(Boolean)
    .map((seg) =>
      seg
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    );

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  const userName = session?.user?.name || 'Admin';
  const userRole = (session?.user as any)?.role || 'admin';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className={styles.header}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span className={styles.breadcrumbRoot}>Admin</span>
        {breadcrumb.map((seg, i) => (
          <span key={i} className={styles.breadcrumbItem}>
            <ChevronRight size={14} />
            <span>{seg}</span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className={styles.rightSection}>
        {/* Role Badge */}
        <Badge variant={userRole === 'superadmin' ? 'error' : 'primary'} size="sm">
          {userRole === 'superadmin' ? '⚡ Super Admin' : '🔒 Admin'}
        </Badge>

        {/* User Info */}
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {userInitials}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userEmail}>{session?.user?.email || ''}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={styles.logoutBtn}
          title="Sign out"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
