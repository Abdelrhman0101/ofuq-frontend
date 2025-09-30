'use client';

import React, { useState } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import DashboardHeader from '../../components/DashboardHeader';
import '../../styles/dashboard.css';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      <div className="dashboard-main">
        <DashboardHeader onToggleSidebar={toggleSidebar} />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}