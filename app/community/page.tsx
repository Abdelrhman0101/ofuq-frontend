"use client";

import { Suspense } from 'react';
export const dynamic = 'force-dynamic';
import HomeHeader from '../../components/HomeHeader';
import Footer from '../../components/Footer';
import ScrollToTop from '../../components/ScrollToTop';
import SocialMediaFloat from '../../components/SocialMediaFloat';
import VideoSection from '../../components/VideoSection';

const VIDEO_URL = 'https://player.mediadelivery.net/embed/513468/649a72c1-06e5-4798-b0cd-6a18559d574f';

function CommunityContent() {
  return (
    <main>
      <VideoSection videoUrl={VIDEO_URL} title="مجتمع أفق" />
    </main>
  );
}

export default function CommunityPage() {
  return (
    <div>
      <HomeHeader />
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>جاري التحميل...</div>}>
        <CommunityContent />
      </Suspense>
      <Footer />
      <ScrollToTop />
      <SocialMediaFloat />
    </div>
  );
}