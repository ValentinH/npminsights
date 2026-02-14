import { createFileRoute, ErrorComponentProps } from '@tanstack/react-router';
import { getPackageInsights } from '~/utils/npm-api';
import PackageInsights from '~/components/PackageInsights';

export const Route = createFileRoute('/package/$')({
  errorComponent: PackageErrorComponent,
  loader: async ({ params }) => {
    const name = params['_splat'] || '';
    const packageName = decodeURIComponent(name);
    const data = await getPackageInsights(packageName);
    return { data, packageName };
  },
  headers: () => ({
    'Cache-Control': 'public, max-age=21600, s-maxage=21600, stale-while-revalidate=86400',
  }),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.packageName} - npminsights` },
      {
        property: 'og:title',
        content: loaderData?.packageName,
      },
      {
        property: 'og:description',
        content: `Get insights about ${loaderData?.packageName} NPM package`,
      },
      {
        property: 'og:url',
        content: `https://npminsights.vercel.app/package/${loaderData?.packageName}`,
      },
      { property: 'og:site_name', content: 'npminsights' },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'en-US' },
      {
        property: 'og:image',
        content: `https://npminsights.vercel.app/api/package/og-image/${loaderData?.packageName}`,
      },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      {
        property: 'og:image:alt',
        content: `${loaderData?.packageName} insights preview`,
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:creator', content: '@ValentinHervieu' },
      { name: 'twitter:title', content: loaderData?.packageName },
      {
        name: 'twitter:description',
        content: `Get insights about ${loaderData?.packageName} NPM package`,
      },
      {
        name: 'twitter:image',
        content: `https://npminsights.vercel.app/api/package/og-image/${loaderData?.packageName}`,
      },
    ],
  }),
  component: PackagePage,
});

function PackageErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="my-16 text-center">
      <h1 className="text-4xl">Something went wrong</h1>
      <p className="mt-4 text-gray-400">
        {error instanceof Error ? error.message : 'Failed to load package data'}
      </p>
    </div>
  );
}

function PackagePage() {
  const { data, packageName } = Route.useLoaderData();
  return (
    <>
      <h1 className="my-8 text-center text-4xl">
        {packageName} <span className="text-gray-400">insights</span>
      </h1>
      <PackageInsights data={data} />
    </>
  );
}
