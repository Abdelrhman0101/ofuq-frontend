"use client";

import React, { useEffect, useRef } from 'react';
import styles from './VideoSection.module.css';

interface VideoSectionProps {
  videoUrl: string;
  title?: string;
  thumbnailUrl?: string;
  alt?: string;
  useIframe?: boolean;
  isLocked?: boolean;
  lockMessage?: string;
  onEnded?: () => void | Promise<void>;
}

const VideoSection: React.FC<VideoSectionProps> = ({ videoUrl, title, thumbnailUrl, alt, useIframe, isLocked, lockMessage, onEnded }) => {
  const isEmbed = typeof useIframe === 'boolean'
    ? useIframe
    : /player\.mediadelivery\.net|youtube\.com|youtu\.be|vimeo\.com/.test(videoUrl);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // منع التحميل وأوامر المطور من الواجهة الأمامية فقط
  useEffect(() => {
    if (isEmbed) return;

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    const handleKeydown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey && key === 's') ||
          (e.ctrlKey && key === 'u') ||
          (e.key === 'F12') ||
          (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'c' || key === 'j'))) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleDragStart = (e: Event) => {
      e.preventDefault();
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('copy', handleCopy);
    };
  }, [isEmbed]);

  return (
    <section className={styles.videoSection}>
      <div className={styles.container}>
        {/* {title ? <h2 className={styles.title}>{title}</h2> : null} */}
        <div className={styles.videoWrapper}>
          {isEmbed ? (
            <iframe
              src={videoUrl}
              loading="lazy"
              className={styles.iframe}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen={true}
              referrerPolicy="no-referrer"
              title={alt || title || 'Video Player'}
            />
          ) : (
            <video
              className={styles.video}
              controls={!isLocked}
              playsInline
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              preload="metadata"
              onContextMenu={(e) => e.preventDefault()}
              poster={thumbnailUrl}
              aria-label={alt || title || 'Course video'}
              onEnded={onEnded}
              ref={videoRef}
            >
              <source src={videoUrl} />
              متصفحك لا يدعم تشغيل الفيديو.
            </video>
          )}
          {isLocked ? (
            <div className={styles.lockOverlay}>
              <div className={styles.lockContent}>
                <svg className={styles.lockIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-6h-1V9a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-8 0V9a3 3 0 0 1 6 0v2H10z" />
                </svg>
                <p className={styles.lockMessage}>{lockMessage || 'الفيديو مقفول حتى إتمام الشروط المطلوبة'}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;