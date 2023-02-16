import React from 'react';
import PackageInsights from './package/[name]/PackageInsights';

export const runtime = 'experimental-edge';

export default async function Home() {
  return (
    <>
      <h1 className="my-2 text-center text-xl">npminsights.com</h1>
      <h2 className=" mt-4 mb-8 text-center text-4xl">All NPM packages insights</h2>
      {/* @ts-expect-error Server Component */}
      <PackageInsights />
    </>
  );
}
