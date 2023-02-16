import React from 'react';
import { PackageAutocomplete } from '#src/app/(common)/components/PackageAutocomplete';
import PackageInsights from './PackageInsights';

export const runtime = 'experimental-edge';
export const dynamicParams = true;

export async function generateStaticParams() {
  return [
    {
      name: 'react-easy-crop',
    },
  ];
}

type PackageProps = {
  params: { name: string };
};

export default async function Package({ params }: PackageProps) {
  const { name } = params;

  return (
    <>
      <div className="my-4 flex justify-center">
        <PackageAutocomplete placeholder="find another package" />
      </div>
      <h1 className="my-8 text-center text-4xl">
        {name} <span className="text-gray-400">insights</span>
      </h1>
      {/* @ts-expect-error Server Component */}
      <PackageInsights name={name} />
    </>
  );
}
