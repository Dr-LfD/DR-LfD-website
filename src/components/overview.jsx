import React from 'react';

export default function Overview({ teaser }) {
  return (
    <section className="project-section result-overview" id="overview">
      <img
        src={teaser}
        alt="DR-LfD framework: demonstration decomposition, skill learning, and task and motion planning."
      />
    </section>
  );
}
