import React from 'react';
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
      <h1 className="my-8 text-center text-4xl">{name} insights</h1>
      {/* @ts-expect-error Server Component */}
      <PackageInsights name={name} />
    </>
  );
}
