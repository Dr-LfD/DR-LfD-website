import React from 'react';

export default class Navigation extends React.Component {
  constructor(props) {
    super(props);
    const firstItem = props.items && props.items[0];
    this.state = {
      activeTarget: firstItem ? firstItem.target : '',
      expanded: false,
    };
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
        <a
          className="toc-brand"
          href="#overview"
          onClick={() => this.setState({ expanded: false })}
        >
          DR-LfD<span>Decompose and Reorganize</span>
        </a>
        <button
          className="toc-toggle"
          type="button"
          aria-expanded={this.state.expanded}
          aria-controls="page-toc"
          onClick={() => this.setState({ expanded: !this.state.expanded })}
        >
          On this page{' '}
          <span aria-hidden="true">{this.state.expanded ? '−' : '+'}</span>
        </button>
        <div
          id="page-toc"
          className={`section-navigation__scroll${this.state.expanded ? ' is-expanded' : ''}`}
        >
          <p className="toc-heading">On this page</p>
          <ul className="section-navigation__list">
            {items.map(({ label, target, subitem }) => {
              const isActive = target === this.state.activeTarget;
              return (
                <li
                  key={target}
                  className={subitem ? 'toc-subitem' : undefined}
                >
                  <a
                    className={isActive ? 'is-active' : undefined}
                    href={`#${target}`}
                    onClick={() => {
                      this.setState({ expanded: false, activeTarget: target });
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
