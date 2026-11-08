// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'My Engineering Notes',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://nscriabin.github.io',
  baseUrl: '/my-engineering-notes/',

  // GitHub pages deployment config.
  projectName: 'my-engineering-notes',
  organizationName: 'nscriabin',
  trailingSlash: false, // GitHub pages add a trailing slashes by default.
  plugins: ['docusaurus-lunr-search'],

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      navbar: {
        title: 'My Engineering Notes',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'toolsSidebar',
            position: 'left',
            label: 'Tools',
          },
          {
            type: 'docSidebar',
            sidebarId: 'techHandbookSidebar',
            position: 'left',
            label: 'Tech Handbook',
          },
          {
            to: '/docs/learning-log',
            position: 'left',
            label: 'Learning Log',
          },
          {
            href: 'https://github.com/nscriabin/my-engineering-notes',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
    }),
};

export default config;
