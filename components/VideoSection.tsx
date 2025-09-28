'use client';

import React, { useState } from 'react';

interface VideoSectionProps {
  thumbnailUrl: string;
  videoUrl: string;
  alt?: string;
}

const VideoSection: React.FC<VideoSectionProps> = ({ 
  thumbnailUrl, 
  videoUrl, 
  alt = "Course Video" 
}) => {
  const [showPopup, setShowPopup] = useState(false);

  const handlePlayClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div className="main-video-section" onClick={handlePlayClick}>
        <img 
          src={thumbnailUrl} 
          alt={alt}
          className="video-thumbnail"
        />
        <div className="play-button">
          <div className="play-icon"></div>
        </div>
      </div>

      {showPopup && (
        <div className="video-popup" onClick={handleClosePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup" onClick={handleClosePopup}>
              ×
            </button>
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
          </div>
        </div>
      )}
    </>
  );
};

export default VideoSection;