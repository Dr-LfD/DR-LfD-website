import React from 'react';
import { render } from 'react-dom';
import { Helmet } from 'react-helmet';

import Header from '@/components/header';
import Navigation from '@/components/navigation';
import Overview from '@/components/overview';
import Video from '@/components/video';
import Body from '@/components/body';
import SpeakerDeck from '@/components/speakerdeck';
import data from '../../template.yaml';

import '@/js/styles.js';

class Template extends React.Component {
  render() {
    return (
      <div>
        <Helmet
          title={data.tabTitle || data.title}
          link={[
            { rel: 'icon', type: 'image/x-icon', href: 'capicon.ico' },
            // { rel: 'icon', type: 'image/x-icone', href: 'favicon.ico' },
            // {
            //   rel: 'icon',
            //   type: 'image/png',
            //   sizes: '32x32',
            //   href: 'favicon-32x32.png',
            // },
            // {
            //   rel: 'icon',
            //   type: 'image/png',
            //   sizes: '16x16',
            //   href: 'favicon-16x16.png',
            // },
          ]}
          meta={[
            {
              name: 'description',
              content: data.description,
            },
            {
              name: 'viewport',
              content: 'width=device-width,initial-scale=1',
            },
            // Open Graph / Facebook
            {
              property: 'og:type',
              content: 'article',
            },
            {
              property: 'og:url',
              content: data.url,
            },
            {
              property: 'og:title',
              content: data.title,
            },
            {
              property: 'og:description',
              content: data.description,
            },
            {
              property: 'og:image',
              content: data.image,
            },
            {
              property: 'og:image:alt',
              content: data.description,
            },
            {
              property: 'og:image:width',
              content: '1200',
            },
            {
              property: 'og:image:height',
              content: '630',
            },
            {
              property: 'og:site_name',
              content: data.organization,
            },
            // Twitter
            {
              name: 'twitter:card',
              content: 'summary_large_image',
            },
            {
              name: 'twitter:url',
              content: data.url,
            },
            {
              name: 'twitter:title',
              content: data.title,
            },
            {
              name: 'twitter:description',
              content: data.description,
            },
            {
              name: 'twitter:image:src',
              content: data.image,
            },
            {
              name: 'twitter:site',
              content: data.twitter,
            },
          ]}
        />
        <Header
          title={data.title}
          // journal={data.journal}
          // conference={data.conference}
          // authors={data.authors}
          // affiliations={data.affiliations}
          // meta={data.meta}
          resources={data.resources}
          theme={data.theme}
        />
        <div className="uk-container uk-container-small">
          <Video videos={data.videoIntroduction} />
          <Overview
            abstract={data.abstract}
            teaser={data.teaser}
            description={data.description}
          />
        </div>
        <Navigation items={data.navigation} />
        <div className="uk-container uk-container-small">
          <SpeakerDeck dataId={data.speakerdeck} />
          <Body body={data.body} />
        </div>
      </div>
    );
  }
}

render(<Template />, document.getElementById('root'));
