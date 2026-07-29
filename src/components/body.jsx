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
          // Lazy-load: swap data-src → src the first time the video nears the viewport
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
          const shownItem = e.detail[0];
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
        {this.props.body.map((subsection, idx) => {
          return (
            <section
              className="project-section"
              id={`section-${idx + (this.props.idOffset || 0)}`}
              key={'subsection-' + idx}
            >
              <Content title={subsection.title} />
              <Content image={subsection.image} />
              <Content text={subsection.text} />
            </section>
          );
        })}
      </div>
    ) : null;
  }
}
