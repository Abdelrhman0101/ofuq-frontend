import styles from './VideoSection.module.css';

interface VideoSectionProps {
  videoUrl: string;
  title: string;
}

const VideoSection: React.FC<VideoSectionProps> = ({ videoUrl, title }) => {
  return (
    <section className={styles.videoSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.videoWrapper}>
          <iframe
            src={videoUrl}
            loading="lazy"
            className={styles.iframe}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen={true}
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;