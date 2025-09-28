'use client';

import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import '@/styles/admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-dashboard">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}