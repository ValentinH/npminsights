import { createFileRoute } from '@tanstack/react-router';
import { getPackageInsights } from '~/utils/npm-api';
import PackageInsights from '~/components/PackageInsights';

export const Route = createFileRoute('/')({
  loader: async () => {
    const data = await getPackageInsights();
    return { data };
  },
  headers: () => ({
    'Cache-Control': 'public, max-age=21600, s-maxage=21600, stale-while-revalidate=86400',
  }),
  component: HomePage,
});

function HomePage() {
  const { data } = Route.useLoaderData();
  return (
    <>
      <h2 className="my-8 text-center text-4xl">
        all NPM packages <span className="text-gray-400">insights</span>
      </h2>
      <PackageInsights data={data} />
    </>
  );
}
