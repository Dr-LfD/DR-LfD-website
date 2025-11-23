import React from 'react';
import { render } from 'react-dom';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
//import 'highlight.js/styles/base16/gruvbox-dark-hard.css';
// import 'highlight.js/styles/base16/github.css';
import 'highlight.js/styles/tokyo-night-dark.css';
// import 'highlight.js/styles/pojoaque.css';

import 'img-comparison-slider';

const renderer = new marked.Renderer();
renderer.table = (header, body) => {
  return `<div class="uk-overflow-auto uk-width-1-1"><table class="uk-table uk-table-small uk-text-small uk-table-divider"> ${header} ${body} </table></div>`;
};
renderer.code = (code, language) => {
  return `<pre class="hljs"><code class="hljs language-${language}">${code}</code></pre>`;
};

marked.use(markedKatex({ throwOnError: false }));
marked.use(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);
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
    // Find all video elements and set their playback rate based on data attribute
    const videos = document.querySelectorAll('video[data-playback-rate]');
    videos.forEach((video) => {
      const playbackRate = parseFloat(video.getAttribute('data-playback-rate'));
      if (!isNaN(playbackRate) && playbackRate > 0) {
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

  setupVideoResetOnSlide() {
    // Find all videos in sliders and reset them when they go out of view
    const videos = document.querySelectorAll('div[uk-slider] video');

    if (videos.length === 0) return;

    // Use Intersection Observer to detect when videos go out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (!entry.isIntersecting) {
            // Video is out of view - pause and reset
            if (!video.paused) {
              video.pause();
            }
            video.currentTime = 0;
          }
        });
      },
      {
        threshold: 0.1, // Trigger when less than 10% visible
        rootMargin: '0px',
      }
    );

    videos.forEach((video) => {
      observer.observe(video);
    });

    // Also listen to UIKit slider events as a fallback
    const sliders = document.querySelectorAll('div[uk-slider]');
    sliders.forEach((slider) => {
      // Listen for slider item changes
      slider.addEventListener('itemshown', (e) => {
        // Reset all videos in this slider that are not the shown one
        const allVideos = slider.querySelectorAll('video');
        const shownItem = e.detail[0];
        allVideos.forEach((video) => {
          if (!shownItem.contains(video) && !video.paused) {
            video.pause();
            video.currentTime = 0;
          }
        });
      });
    });
  }

  componentDidMount() {
    // Set playback rates after initial render
    setTimeout(() => {
      this.setVideoPlaybackRates();
      this.setupVideoResetOnSlide();
    }, 100);
  }

  componentDidUpdate() {
    // Set playback rates after content updates
    setTimeout(() => {
      this.setVideoPlaybackRates();
      this.setupVideoResetOnSlide();
    }, 100);
  }

  render() {
    return this.props.body ? (
      <div className="uk-section">
        {this.props.body.map((subsection, idx) => {
          return (
            <div key={'subsection-' + idx}>
              <Content title={subsection.title} />
              <Content image={subsection.image} />
              <Content text={subsection.text} />
            </div>
          );
        })}
      </div>
    ) : null;
  }
}
