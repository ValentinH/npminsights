import React from 'react';
import PackageInsights from './package/[...name]/PackageInsights';

export const runtime = 'experimental-edge';

export default async function Home() {
  return (
    <>
      <h2 className="my-8 text-center text-4xl">
        all NPM packages <span className="text-gray-400">insights</span>
      </h2>
      {/* @ts-expect-error Server Component */}
      <PackageInsights />
    </>
  );
}
