'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  Star,
  Settings,
  Image,
  Mail,
  Calendar,
  Beaker,
  Quote,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const navGroups = [
  {
    label: 'Main',
    links: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Applications', href: '/admin/applications', icon: FileText },
      { name: 'Members', href: '/admin/members', icon: Users },
    ],
  },
  {
    label: 'Content',
    links: [
      { name: 'Blog Posts', href: '/admin/blog', icon: BookOpen },
      { name: 'Publications', href: '/admin/publications', icon: Beaker },
      { name: 'Events', href: '/admin/events', icon: Calendar },
      { name: 'Testimonials', href: '/admin/testimonials', icon: Quote },
    ],
  },
  {
    label: 'System',
    links: [
      { name: 'CMS Sections', href: '/admin/cms', icon: Layers },
      { name: 'Media Library', href: '/admin/media', icon: Image },
      { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <ShieldCheck size={20} className={styles.logoIcon} />
        <div>
          <span className={styles.logoText}>Westbridge</span>
          <span className={styles.logoSub}>Admin Panel</span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className={styles.nav}>
        {navGroups.map((group) => (
          <div key={group.label} className={styles.navGroup}>
            <p className={styles.groupLabel}>{group.label}</p>
            {group.links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.link} ${active ? styles.active : ''}`}
                >
                  <Icon size={16} className={styles.linkIcon} />
                  <span>{link.name}</span>
                  {link.href === '/admin/applications' && (
                    <span className={styles.badge} id="sidebar-apps-badge" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.footerText}>Westbridge Admin Panel</p>
        <p className={styles.footerText}>v2.0</p>
      </div>
    </aside>
  );
}
