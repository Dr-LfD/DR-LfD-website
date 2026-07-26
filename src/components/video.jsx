import React from 'react';
import { render } from 'react-dom';

export default class Video extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.video) return null;
    const poster = 'posters/' + this.props.video.replace(/\.mp4$/, '.jpg');
    return (
      <div className="uk-section">
        <h2 className="uk-text-bold uk-heading-line uk-text-center" id="video">
          <span>Supplementary Video</span>
        </h2>
        <video
          className="uk-align-center uk-width-1-1"
          data-src={this.props.video}
          poster={poster}
          preload="none"
          controls
          controlsList="nodownload"
          muted
          playsInline
          style={{ cursor: 'pointer', display: 'block' }}
          onClick={(e) => {
            const v = e.currentTarget;
            if (v.dataset.src) {
              v.src = v.dataset.src;
              v.removeAttribute('data-src');
            }
            v.paused ? v.play() : v.pause();
          }}
        />
      </div>
    );
  }
}
