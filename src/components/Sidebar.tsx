'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  Upload, 
  MessageSquareText, 
  Settings 
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import styles from './Sidebar.module.css';

export default function Sidebar({ hasInvoices = true }: { hasInvoices?: boolean }) {
  const pathname = usePathname();
  
  let navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'AI Chat', path: '/chat', icon: MessageSquareText },
  ];

  // Only show Upload if there are no invoices
  if (!hasInvoices) {
    navItems = [{ name: 'Upload', path: '/upload', icon: Upload }];
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}></div>
        <span className={styles.logoText}>ClearFlow</span>
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/');
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon size={20} className={styles.icon} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className={styles.bottomNav}>
        <ThemeToggle />
        <Link 
          href="/settings" 
          className={`${styles.navItem} ${pathname.startsWith('/settings') ? styles.active : ''}`}
        >
          <Settings size={20} className={styles.icon} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
