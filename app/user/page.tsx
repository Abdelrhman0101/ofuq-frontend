'use client';

import React, { useEffect, useState } from 'react';
import UserWelcome from '../../components/UserWelcome';
import UserStats from '../../components/UserStats';
import WatchProgress from '../../components/WatchProgress';
import { getCurrentUser, User } from '../../utils/authService';
import '../../styles/dashboard.css';

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = getCurrentUser();
    setUser(userData);
  }, []);

  return (
    <div className="dashboard-container user-dashboard">
      <UserWelcome 
        userName={user?.name}
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