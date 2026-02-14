import { createFileRoute } from '@tanstack/react-router';
import { getPackageInsights } from '~/utils/npm-api';
import PackageInsights from '~/components/PackageInsights';

export const Route = createFileRoute('/package/$')({
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
        name: 'og:title',
        content: loaderData?.packageName,
      },
      {
        name: 'og:description',
        content: `Get insights about ${loaderData?.packageName} NPM package`,
      },
      {
        name: 'og:url',
        content: `https://npminsights.vercel.app/package/${loaderData?.packageName}`,
      },
      { name: 'og:site_name', content: 'npminsights' },
      { name: 'og:type', content: 'website' },
      { name: 'og:locale', content: 'en-US' },
      {
        name: 'og:image',
        content: `https://npminsights.vercel.app/api/package/og-image/${loaderData?.packageName}`,
      },
      { name: 'og:image:width', content: '1200' },
      { name: 'og:image:height', content: '630' },
      {
        name: 'og:image:alt',
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
