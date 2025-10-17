'use client';

import React, { useState } from 'react';
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
  const [showPopup, setShowPopup] = useState(false);

  // دعم روابط embed (مثل Cloudflare/MediaDelivery) بعرض iframe
  const isEmbedUrl = (() => {
    if (!videoUrl) return false;
    const url = videoUrl.toLowerCase();
    return url.includes('/embed/') || url.includes('mediadelivery.net/embed');
  })();

  const handlePlayClick = () => {
    if (isLocked) {
      if (onAttemptPlay) onAttemptPlay();
      return;
    }
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div 
        className={styles['main-video-section']} 
        onClick={handlePlayClick}
        style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
      >
        <img 
          src={thumbnailUrl} 
          alt={alt}
          className={styles['video-thumbnail']}
        />
        <div className={styles['play-button']}>
          <div className={styles['play-icon']}></div>
        </div>
        {isLocked && (
          <div className={styles['locked-overlay']}>
            <div className={styles['locked-badge']}>
              🔒 {lockMessage}
            </div>
          </div>
        )}
      </div>

      {showPopup && (
        <div className={styles['video-popup']} onClick={handleClosePopup}>
          <div className={styles['popup-content']} onClick={(e) => e.stopPropagation()}>
            <button className={styles['close-popup']} onClick={handleClosePopup}>
              ×
            </button>
            {isEmbedUrl ? (
              <iframe
                src={videoUrl}
                width="100%"
                height="100%"
                style={{ borderRadius: '8px' }}
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <video 
                controls 
                autoPlay 
                width="100%" 
                height="100%"
                style={{ borderRadius: '8px' }}
              >
                <source src={videoUrl} type="video/mp4" />
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VideoSection;