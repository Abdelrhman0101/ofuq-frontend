'use client';

import React from 'react';
import HomeHeader from '../../components/HomeHeader';
import Footer from '../../components/Footer';
import Quiz from '../../components/Quiz';

const TestPage = () => {
  return (
    <div>
      <HomeHeader />
      
      <main style={{ 
        minHeight: '60vh', 
        padding: '40px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '100%'
        }}>
          <Quiz />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TestPage;