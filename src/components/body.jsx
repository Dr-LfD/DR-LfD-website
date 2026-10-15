import React from 'react';
import { render } from 'react-dom';
import { marked } from 'marked';
const renderer = new marked.Renderer();
renderer.table = (header, body) => {
  return `<div class="uk-overflow-auto uk-width-1-1"><table class="uk-table uk-table-small uk-text-small uk-table-divider"> ${header} ${body} </table></div>`;
};
marked.use({ renderer: renderer });

class Content extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    if (this.props.title)
      return (
        <h2 className="uk-text-bold uk-margin-top uk-heading-line uk-text-center">
          <span>{this.props.title}</span>
        </h2>
      );
    if (this.props.text)
      return (
        <div
          dangerouslySetInnerHTML={{ __html: marked.parse(this.props.text) }}
        />
      );
    if (this.props.image)
      return (
        <img
          src={`${this.props.image}`}
          className="uk-align-center uk-responsive-width"
          alt=""
        />
      );
    return null;
  }
}

export default class Body extends React.Component {
  constructor(props) {
    super(props);
  }

  setVideoPlaybackRates() {
    // Scans the whole document (not just this instance's subtree), and the page
    // can mount more than one Body — guard against double-attaching listeners.
    const videos = document.querySelectorAll(
      'video[data-playback-rate]:not([data-rate-bound])'
    );
    videos.forEach((video) => {
      const playbackRate = parseFloat(video.getAttribute('data-playback-rate'));
      if (!isNaN(playbackRate) && playbackRate > 0) {
        video.dataset.rateBound = 'true';
        video.playbackRate = playbackRate;
        // Also set it when the video starts playing (for autoplay videos)
        video.addEventListener('loadedmetadata', () => {
          video.playbackRate = playbackRate;
        });
        video.addEventListener('play', () => {
          video.playbackRate = playbackRate;
        });
      }
    });
  }

  setupVideoObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          // Load the poster near the viewport; preload="none" defers video data until play.
          if (entry.isIntersecting && video.dataset.poster) {
            video.poster = video.dataset.poster;
            video.removeAttribute('data-poster');
          }
          if (entry.isIntersecting && video.dataset.src) {
            video.src = video.dataset.src;
            video.removeAttribute('data-src');
          }
          // Pause + reset slider videos when they scroll out of view
          if (!entry.isIntersecting && video.closest('div[uk-slider]')) {
            if (!video.paused) video.pause();
            video.currentTime = 0;
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '200px', // start loading 200px before entering viewport
      }
    );

    // Same double-mount concern as above: skip videos/sliders already wired up.
    document
      .querySelectorAll('video:not([data-observer-bound])')
      .forEach((video) => {
        video.dataset.observerBound = 'true';
        observer.observe(video);
      });

    // UIKit slider fallback: reset off-slide videos on slide change
    document
      .querySelectorAll('div[uk-slider]:not([data-slider-bound])')
      .forEach((slider) => {
        slider.dataset.sliderBound = 'true';
        slider.addEventListener('itemshown', (e) => {
          const shownItem = e.target;
          slider.querySelectorAll('video').forEach((video) => {
            if (!shownItem.contains(video) && !video.paused) {
              video.pause();
              video.currentTime = 0;
            }
          });
        });
      });
  }

  componentDidMount() {
    setTimeout(() => {
      this.setVideoPlaybackRates();
      this.setupVideoObserver();
    }, 100);
  }

  componentDidUpdate() {
    setTimeout(() => {
      this.setVideoPlaybackRates();
      this.setupVideoObserver();
    }, 100);
  }

  render() {
    return this.props.body ? (
      <div className="uk-section">
        {this.props.body.map((subsection) => {
          return (
            <section
              className="project-section"
              id={subsection.id}
              key={subsection.id}
            >
              <details
                className="section-disclosure"
                open
                onToggle={(event) => {
                  if (!event.currentTarget.open) {
                    event.currentTarget
                      .querySelectorAll('video')
                      .forEach((video) => {
                        video.pause();
                      });
                  }
                }}
              >
                <summary>
                  <Content title={subsection.title} />
                </summary>
                <Content text={subsection.highlight} />
                <Content image={subsection.image} />
                <Content text={subsection.text} />
              </details>
            </section>
          );
        })}
      </div>
    ) : null;
  }
}
