import { PackageProps } from './page';

export default function Head({ params }: PackageProps) {
  const { name } = params;
  const packageName = name.map(decodeURIComponent).join('/');

  const description = `Get insights about ${packageName} NPM package`;
  return (
    <>
      <title>{`${packageName} - npminsights.com`}</title>
      <meta property="og:url" content={`https://npminsights.com/package/${packageName}`} />
      <meta property="og:site_name " content="npminsights.com" />
      <meta property="og:title" content={packageName} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta
        property="og:image"
        content={`https://npminsights.com/api/package/og-image/${packageName}`}
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={`https://npminsights.com/package/${packageName}`} />
      <meta name="twitter:title" content={packageName} />
      <meta name="twitter:description" content={description} />
      <meta
        name="twitter:image"
        content={`https://npminsights.com/api/package/og-image/${packageName}`}
      />
      <meta name="twitter:image:alt" content={`${packageName} insights preview`} />
      <meta name="twitter:domain" content="npminsights.com" />
    </>
  );
}
