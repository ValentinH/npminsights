# npminsights.com

The application is made using Next.js 13 with the new `app` directory architecture.

The original idea behind this website was too generate images containing download metrics in order to display them on Github Readmes.
In order to have something to link to when clicking the image, a website was created as well.

## Images
The OG image for each package is made using the [@vercel/og](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation) library.

We also provide an image made for being displayed on libraries READMEs like this one:
[![react-easy-crop npminsights.com](https://npminsights.com/api/package/readme-image/react-easy-crop?v=2023-02-22)](https://npminsights.com/package/react-easy-crop)

To add it to your README, just use the following markdown snippet (replace "YOUR_PACKAGE" by your package name):
```markdown
[![YOUR_PACKAGE npminsights.com](https://npminsights.com/api/package/readme-image/YOUR_PACKAGE)](https://npminsights.com/package/YOUR_PACKAGE)
```

## Development

To install the dependencies:
```sh
yarn install
```

To run the app:
```sh
yarn dev
```

