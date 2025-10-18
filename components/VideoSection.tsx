'use client';

import React from 'react';
import styles from './VideoSection.module.css';

interface VideoSectionProps {
  thumbnailUrl: string;
  videoUrl: string;
  alt?: string;
  isLocked?: boolean;
  lockMessage?: string;
  onAttemptPlay?: () => void;
}

const VideoSection: React.FC<VideoSectionProps> = ({ 
  thumbnailUrl, 
  videoUrl, 
  alt = "Course Video",
  isLocked = false,
  lockMessage = 'محجوب حتى إكمال أسئلة الدرس',
  onAttemptPlay
}) => {
  // دعم روابط embed (مثل Cloudflare/MediaDelivery) بعرض iframe
  const isEmbedUrl = (() => {
    if (!videoUrl) return false;
    const url = videoUrl.toLowerCase();
    return url.includes('/embed/') || url.includes('mediadelivery.net/embed');
  })();

  // عرض الفيديو بشكل مدمج داخل السيكشن بدلاً من popup
  return (
    <div className={styles['main-video-section']} style={{ cursor: 'default' }}>
      {isLocked ? (
        <>
          <img 
            src={thumbnailUrl} 
            alt={alt}
            className={styles['video-thumbnail']}
          />
          <div className={styles['locked-overlay']}>
            <div className={styles['locked-badge']}>
              🔒 {lockMessage}
            </div>
          </div>
        </>
      ) : (
        <>
          {isEmbedUrl ? (
            <iframe
              src={videoUrl}
              width="100%"
              height="100%"
              style={{ borderRadius: '0' }}
              allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <video 
              controls 
              width="100%" 
              height="100%"
              poster={thumbnailUrl}
              className={styles['video-element']}
            >
              <source src={videoUrl} type="video/mp4" />
              متصفحك لا يدعم تشغيل الفيديو.
            </video>
          )}
        </>
      )}
    </div>
  );
};

export default VideoSection;