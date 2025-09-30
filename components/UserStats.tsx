import React from 'react';
import './UserStats.css';

interface UserStatsProps {
  lastTestScore?: number;
  completedPrograms?: number;
  registeredPrograms?: number;
}

export default function UserStats({ 
  lastTestScore = 85,
  completedPrograms = 3,
  registeredPrograms = 5
}: UserStatsProps) {
  return (
    <div className="user-stats">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <h3 className="stat-number">{lastTestScore}%</h3>
          <p className="stat-label">نتيجة آخر اختبار</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-content">
          <h3 className="stat-number">{completedPrograms}</h3>
          <p className="stat-label">البرامج المكتملة</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📚</div>
        <div className="stat-content">
          <h3 className="stat-number">{registeredPrograms}</h3>
          <p className="stat-label">البرامج المسجلة</p>
        </div>
      </div>
    </div>
  );
}