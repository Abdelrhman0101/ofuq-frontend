'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../styles/sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true }) => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      href: '/admin',
      label: 'الرئيسية',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
    },
    {
      href: '/students',
      label: 'الطلاب',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01.99L12 11l2.01 2.01c.47.62 1.21.99 2.01.99h2.5V22h2zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm1.5 2h-3C2.67 8 2 8.67 2 10v3h1.5v9h3v-9H8v-3c0-1.33-.67-2-1.5-2z"/>
        </svg>
      )
    },
    {
      href: '/admin/courses',
      label: 'الدورات',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L23 9l-11-6zM18.82 9L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
        </svg>
      )
    },
    {
      href: '/reports',
      label: 'التقارير',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
      )
    }
  ];

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img 
              src="/mahad_alofk2.png" 
              alt="معهد أفق للتعليم عن بعد" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="sidebar-title">معهد أفق</h1>
          <p className="sidebar-subtitle">للتعليم عن بعد</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div key={item.href} className="nav-item">
              <Link 
                href={item.href} 
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <p className="footer-text">
             شركة دوام للأعمال التقنية
          </p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;