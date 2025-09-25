'use client';

import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="admin-main">
          <div className="dashboard-header">
            <h1>لوحة التحكم الإدارية</h1>
            <p>مرحباً بك في لوحة التحكم الإدارية</p>
          </div>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>إجمالي الكورسات</h3>
              <p className="stat-number">12</p>
            </div>
            <div className="stat-card">
              <h3>الطلاب المسجلين</h3>
              <p className="stat-number">245</p>
            </div>
            <div className="stat-card">
              <h3>الإيرادات الشهرية</h3>
              <p className="stat-number">15,000 ج.م</p>
            </div>
            <div className="stat-card">
              <h3>الكورسات المنشورة</h3>
              <p className="stat-number">8</p>
            </div>
          </div>

          <div className="quick-actions">
            <h2>الإجراءات السريعة</h2>
            <div className="actions-grid">
              <a href="/admin/courses" className="action-card">
                <h3>إدارة الكورسات</h3>
                <p>إضافة وتعديل الكورسات</p>
              </a>
              <div className="action-card">
                <h3>إدارة الطلاب</h3>
                <p>عرض وإدارة الطلاب المسجلين</p>
              </div>
              <div className="action-card">
                <h3>التقارير</h3>
                <p>عرض تقارير الأداء والإحصائيات</p>
              </div>
              <div className="action-card">
                <h3>الإعدادات</h3>
                <p>إعدادات النظام والموقع</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background-color: #f5f5f5;
        }
        
        .admin-content {
          display: flex;
        }
        
        .admin-main {
          flex: 1;
          padding: 2rem;
          margin-right: 224px;
          margin-top: 80px;
        }
        
        .dashboard-header {
          margin-bottom: 2rem;
        }
        
        .dashboard-header h1 {
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .stat-card h3 {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #029CBE;
          margin: 0;
        }
        
        .quick-actions h2 {
          color: #333;
          margin-bottom: 1rem;
        }
        
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }
        
        .action-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s ease;
          text-decoration: none;
          color: inherit;
        }
        
        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .action-card h3 {
          color: #029CBE;
          margin-bottom: 0.5rem;
        }
        
        .action-card p {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .admin-main {
            margin-right: 0;
            margin-top: 60px;
            padding: 1rem;
          }
          
          .dashboard-stats {
            grid-template-columns: 1fr;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
        
        .dashboard-header {
          margin-bottom: 2rem;
        }
        
        .dashboard-header h1 {
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .stat-card h3 {
          color: #666;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #007bff;
          margin: 0;
        }
        
        .quick-actions h2 {
          color: #333;
          margin-bottom: 1rem;
        }
        
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }
        
        .action-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s;
        }
        
        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .action-card h3 {
          color: #007bff;
          margin-bottom: 0.5rem;
        }
        
        .action-card p {
          color: #666;
          margin: 0;
        }
      `}</style>
    </div>
  );
}