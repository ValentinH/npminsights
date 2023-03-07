import type { Metadata } from 'next';
import React from 'react';
import PackageInsights from './PackageInsights';

// cannot use edge-runtime due to https://github.com/vercel/next.js/issues/43384
// export const runtime = 'experimental-edge';

export async function generateStaticParams() {
  return [
    {
      name: ['react-easy-crop'],
    },
  ];
}

export type PackageProps = {
  params: { name: string[] }; // we use an array of strings to support scoped packages
};

export default async function Package({ params }: PackageProps) {
  const { name } = params;
  const packageName = name.map(decodeURIComponent).join('/');

  return (
    <>
      <h1 className="my-8 text-center text-4xl">
        {packageName} <span className="text-gray-400">insights</span>
      </h1>
      {/* @ts-expect-error Server Component */}
      <PackageInsights name={packageName} />
    </>
  );
}

export async function generateMetadata({ params }: PackageProps): Promise<Metadata> {
  const { name } = params;
  const packageName = name.map(decodeURIComponent).join('/');

  const url = `https://npminsights.com/package/${packageName}`;
  const description = `Get insights about ${packageName} NPM package`;
  const image: NonNullable<Metadata['openGraph']>['images'] = {
    url: `https://npminsights.com/api/package/og-image/${packageName}`,
    width: 1200,
    height: 630,
    alt: `${packageName} insights preview`,
  };
  return {
    title: `${packageName} - npminsights.com`,
    openGraph: {
      title: packageName,
      description,
      url,
      siteName: 'npminsights.com',
      type: 'website',
      locale: 'en-US',
      images: image,
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@ValentinHervieu',
      title: packageName,
      description,
      images: image,
    },
  };
}
