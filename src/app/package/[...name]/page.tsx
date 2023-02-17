import React from 'react';
import { PackageAutocomplete } from '#src/app/(common)/components/PackageAutocomplete';
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

type PackageProps = {
  params: { name: string[] }; // we use an array of strings to support scoped packages
};

export default async function Package({ params }: PackageProps) {
  const { name } = params;
  const packageName = name.map(decodeURIComponent).join('/');

  return (
    <>
      <div className="my-4 flex justify-center">
        <PackageAutocomplete placeholder="find another package" />
      </div>
      <h1 className="my-8 text-center text-4xl">
        {packageName} <span className="text-gray-400">insights</span>
      </h1>
      {/* @ts-expect-error Server Component */}
      <PackageInsights packageName={name.join('/')} />
    </>
  );
}
