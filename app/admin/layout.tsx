'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import '@/styles/admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <AdminAuthGuard>
      <div className="admin-dashboard">
        <Header onToggleSidebar={toggleMobileSidebar} />
        <div className="admin-content">
          <Sidebar 
            isMobileOpen={isMobileSidebarOpen} 
            onClose={closeMobileSidebar}
          />
          <main className="admin-main">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}