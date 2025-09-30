import React from 'react';
import UserWelcome from '../../components/UserWelcome';
import UserStats from '../../components/UserStats';
import WatchProgress from '../../components/WatchProgress';
import '../../styles/dashboard.css';

export default function UserDashboard() {
  return (
    <div className="dashboard-container user-dashboard">
      <UserWelcome 
        userName="أحمد محمد"
        profileImage="/profile.jpg"
      />
      
      <UserStats 
        lastTestScore={85}
        completedPrograms={3}
        registeredPrograms={5}
      />

      <div className="dashboard-sections">
        <WatchProgress />
      </div>
    </div>
  );
}