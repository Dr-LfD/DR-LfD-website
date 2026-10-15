import React from 'react';

export default class Navigation extends React.Component {
  constructor(props) {
    super(props);
    const firstItem = props.items && props.items[0];
    this.state = { activeTarget: firstItem ? firstItem.target : '' };
    this.frame = null;
    this.updateActiveTarget = this.updateActiveTarget.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.updateActiveTarget, {
      passive: true,
    });
    window.addEventListener('resize', this.updateActiveTarget);
    window.addEventListener('hashchange', this.updateActiveTarget);
    this.updateActiveTarget();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateActiveTarget);
    window.removeEventListener('resize', this.updateActiveTarget);
    window.removeEventListener('hashchange', this.updateActiveTarget);
    if (this.frame) window.cancelAnimationFrame(this.frame);
  }

  updateActiveTarget() {
    if (this.frame) return;
    this.frame = window.requestAnimationFrame(() => {
      const items = this.props.items || [];
      const activationLine = 120;
      let activeTarget = items.length ? items[0].target : '';

      items.forEach(({ target }) => {
        const section = document.getElementById(target);
        if (section && section.getBoundingClientRect().top <= activationLine) {
          activeTarget = target;
        }
      });

      if (activeTarget !== this.state.activeTarget) {
        this.setState({ activeTarget });
      }
      this.frame = null;
    });
  }

  render() {
    const { items } = this.props;
    if (!items || !items.length) return null;

    return (
      <nav className="section-navigation" aria-label="Page sections">
        <div className="section-navigation__scroll">
          <ul className="section-navigation__list">
            {items.map(({ label, target }) => {
              const isActive = target === this.state.activeTarget;
              return (
                <li key={target}>
                  <a
                    className={isActive ? 'is-active' : undefined}
                    href={`#${target}`}
                    onClick={() => {
                      const disclosure = document.querySelector(
                        `#${target} > .section-disclosure`
                      );
                      if (disclosure) disclosure.open = true;
                    }}
                    aria-current={isActive ? 'location' : undefined}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    );
  }
}
