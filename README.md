# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

The search functionality is local/offline and is enabled by [docusarus-lunr-search](https://github.com/praveenn77/docusaurus-lunr-search).

## Installation

- [Install node](https://nodejs.org/en/download)
- Run `npm install`

## Local Development

```bash
npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

N.B. The Docusaurus search index is only generated from a full project build. The local development server does not provide search functionality. To test the search functionality locally:

```bash
npm run build
npm run serve
```

## Design

I am not a front-end developer, so I've just re-used the Docusaurus [default CSS](src/css/custom.css). I tried changing these and well... Everything I tried, was ugly.

## A few non-obvious things

Your LLM should answer any question about the setup. But there are few things that require some context/elaboration.

- I version control diagram code in [diagrams](diagrams) directory. These diagrams are generated with [diagrams.net](https://app.diagrams.net/). The diagrams are also exported as png and then stored in the [static](static/img) directory. The reasoning for such setup is that it allows anyone to load the diagram code into [diagrams.net](https://app.diagrams.net/) and edit it, whilst giving the flexibility of adjusting the diagram with a traditional UI.
- My setup is using `.md` files instead of `.mdx`. This is for 2 reasons:
  - I don't intend to have JS in my `.md` files, so there is no need for `.mdx`.
  - The only [official language support](https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx) extension for `.mdx` in VSCode (my IDE of choice) doesn't support previewing `.mdx` files in editor (a feature I often use).

## Deployment

The site gets deployed to GitHub pages. I've followed the [official deployment guide](https://docusaurus.io/docs/deployment#deploying-to-github-pages) from Docusaurus to set this up. It is a bit out of date, so a few things to note:

- I've updated all the GitHub Action versions to their latest version.
- The [environment settings](https://docusaurus.io/docs/deployment#environment-settings) are not needed, these are for `docusaurus deploy`, which I am not using.
- I am not using the [source/deployment branch pattern](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-from-a-branch). Everything gets built and deployed from `main` by [GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow).

## Contributing

In case you get a burning feeling to correct something in (**my** personal open source site) you have 2 choices:

- Raise a PR, which I may or may not accept.
- Fork the repo and do whatever you like.