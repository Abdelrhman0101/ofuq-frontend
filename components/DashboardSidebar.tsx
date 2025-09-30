import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  
  const navigationItems = [
    { name: 'لوحة التحكم', icon: '🏠', href: '/user' },
    { name: 'برامجي', icon: '📚', href: '/user/my_courses' },
    { name: 'اختباراتي', icon: '📝', href: '/user/my_exams' },
    { name: 'شهاداتي', icon: '🏆', href: '/user/my_certificates' },
  ];

  const bottomItems = [
    { name: 'الإعدادات', icon: '⚙️', href: '/user/settings' },
    { name: 'تسجيل الخروج', icon: '🚪', href: '/logout' },
  ];

  return (
    <div className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <button className="close-button" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="logo-container">
          <Image
            src="/mahad_alofk2.png"
            alt="معهد الأفق للتعليم عن بعد"
            width={150}
            height={80}
            className="sidebar-logo"
          />
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navigationItems.map((item, index) => (
            <li key={index} className="nav-item">
              <Link 
                href={item.href} 
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-bottom">
        <ul className="bottom-list">
          {bottomItems.map((item, index) => (
            <li key={index} className="bottom-item">
              <Link href={item.href} className="bottom-link">
                <span className="bottom-icon">{item.icon}</span>
                <span className="bottom-text">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardSidebar;