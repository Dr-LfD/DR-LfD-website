import React from 'react';

export default function Video({ videos }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [autoPlay, setAutoPlay] = React.useState(false);
  const [hasStarted, setHasStarted] = React.useState(false);
  const player = React.useRef(null);
  if (!videos || !videos.length) return null;
  const activeVideo = videos[activeIndex];

  return (
    <section className="project-section video-introduction" id="video">
      <h2 className="uk-text-bold uk-heading-line">
        <span>Video Introduction</span>
      </h2>
      <div className="video-selector" role="group" aria-label="Video version">
        {videos.map((video, index) => (
          <button
            type="button"
            key={video.src}
            aria-pressed={index === activeIndex}
            aria-controls="introduction-player"
            onClick={() => {
              if (index === activeIndex) return;
              player.current.pause();
              setHasStarted(false);
              setAutoPlay(true);
              setActiveIndex(index);
            }}
          >
            <span>{video.label}</span>
          </button>
        ))}
      </div>
      <div className="video-introduction__player">
        <video
          id="introduction-player"
          key={activeVideo.src}
          ref={player}
          src={activeVideo.src}
          poster={activeVideo.poster}
          aria-label={activeVideo.label}
          width={1280}
          height={720}
          preload="none"
          controls
          controlsList="nodownload"
          playsInline
          autoPlay={autoPlay}
          onPlay={() => setHasStarted(true)}
        />
        {!hasStarted && (
          <button
            className="video-introduction__play"
            type="button"
            aria-label={`Play ${activeVideo.label}`}
            onClick={() => player.current.play()}
          >
            <span aria-hidden="true">▶</span>
          </button>
        )}
      </div>
    </section>
  );
}
