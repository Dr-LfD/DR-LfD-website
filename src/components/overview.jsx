import React from 'react';
import { marked } from 'marked';

export default function Overview({ teaser, highlights }) {
  return (
    <section className="project-section result-overview" aria-label="Overview">
      {highlights && (
        <div
          dangerouslySetInnerHTML={{ __html: marked.parse(highlights.text) }}
        />
      )}
      <figure>
        <img
          src={teaser}
          width="2167"
          height="681"
          alt="DR-LfD framework: demonstration decomposition, skill learning, and task and motion planning."
          fetchpriority="high"
        />
      </figure>
    </section>
  );
}
