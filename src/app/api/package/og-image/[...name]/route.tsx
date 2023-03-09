import { ImageResponse } from '@vercel/og';
import clsx from 'clsx';
import { NextRequest } from 'next/server';
import React from 'react';
import { OgBarsChart } from '#src/app/(common)/components/OgBarsChart';
import { SIX_HOURS_IN_SECONDS } from '#src/app/(common)/utils/consts';
import { getPackageInsights } from '#src/app/(common)/utils/npm-api';
import { NpmDailyDownloads } from '#src/app/(common)/utils/npm-api/types';

export const runtime = 'experimental-edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const packageName = searchParams.getAll('name').join('/');
  if (!packageName) {
    return new Response('Missing package name', { status: 400 });
  }

  const data = await getPackageInsights(packageName);

  const allMonthlyDownloads = data.allDailyDownloads.reduce<NpmDailyDownloads[]>((acc, curr) => {
    const last = acc[acc.length - 1];
    const isNewMonth = !last || new Date(curr.day).getMonth() !== new Date(last.day).getMonth();
    if (isNewMonth) {
      return [
        ...acc,
        {
          day: curr.day,
          downloads: curr.downloads,
        },
      ];
    }

    last.downloads += curr.downloads;
    return acc;
  }, []);

  const points = allMonthlyDownloads.map((d) => ({
    date: d.day,
    value: d.downloads,
  }));

  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col items-center justify-start bg-gray-900 px-8 py-2 relative">
        <h1 tw="mb-6 text-center text-6xl text-white">
          {packageName} <span tw="text-gray-400 ml-4">insights</span>
        </h1>
        <div tw="flex w-full items-center justify-between">
          <div tw="flex flex-col items-start">
            <Card title="Last week" value={data.lastWeek} previousValue={data.previousWeek} />
            <Card title="Last month" value={data.lastMonth} previousValue={data.previousMonth} />
            <Card title="Last year" value={data.lastYear} previousValue={data.previousYear} />
          </div>
          <div tw="flex flex-col items-center border-gray-800 border-4 rounded-lg">
            <OgBarsChart points={points} width={750} height={450} />
          </div>
        </div>

        <div tw="absolute flex justify-center -bottom-3 left-0 right-0">
          <p tw=" text-white text-sm">npminsights.com</p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': `public, immutable, no-transform, max-age=${SIX_HOURS_IN_SECONDS}`,
      },
    }
  );
}

type CardProps = {
  title: string;
  value: number;
  previousValue: number;
};

const Card = ({ title, value, previousValue }: CardProps) => {
  const percentageDiff =
    value !== 0 && previousValue !== 0 ? ((value - previousValue) / previousValue) * 100 : 0;
  return (
    <div tw="mb-6 w-80 flex flex-col rounded-lg bg-gray-800 p-4">
      <div tw="flex w-full items-center justify-between mb-2">
        <h3 tw="text-2xl text-gray-100 m-0">{title}</h3>
        <p tw={clsx('text-xl m-0', percentageDiff > 0 ? 'text-green-500' : 'text-red-600')}>
          {percentageDiff > 0 && '+'}
          {percentageDiff.toLocaleString('en', { maximumFractionDigits: 1 }) || '-'}%
        </p>
      </div>
      <div tw="flex flex-wrap items-end">
        <p tw="text-2xl text-yellow-400 m-0 mr-2 leading-none">
          {value.toLocaleString('en') || '-'}
        </p>
        <p tw="text-gray-400 m-0 leading-none">from {previousValue.toLocaleString('en') || '-'}</p>
      </div>
    </div>
  );
};
