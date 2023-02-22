import { ImageResponse } from '@vercel/og';
import { scaleBand, scaleLinear } from '@visx/scale';
import clsx from 'clsx';
import { NextRequest } from 'next/server';
import React from 'react';
import tailwindColors from 'tailwindcss/colors';
import { getPackageInsights } from '#src/app/(common)/utils/npm-api';
import { NpmDailyDownloads } from '#src/app/(common)/utils/npm-api/types';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
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

  // TODO: make text larger and remove some metrics. ATM this is not readable when displayed on social sites
  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col items-center justify-start bg-gray-900 p-4 relative">
        <h1 tw="mb-4 text-center text-4xl text-white">
          {packageName} <span tw="text-gray-400 ml-2">insights</span>
        </h1>
        <h2 tw="text-white self-start ml-14 text-xl">Downloads</h2>
        <div tw="flex items-center mb-4">
          <Card title="Last day" value={data.lastDay} previousValue={data.lastDayPreviousWeek} />
          <Card title="Last week" value={data.lastWeek} previousValue={data.previousWeek} />
          <Card title="Last month" value={data.lastMonth} previousValue={data.previousMonth} />
          <Card title="Last year" value={data.lastYear} previousValue={data.previousYear} />
        </div>
        <h2 tw="text-white self-start ml-14 text-xl">Monthly downloads history</h2>
        <DownloadsChart downloads={allMonthlyDownloads} width={800} height={300} />
        <p tw="absolute bottom-0 right-4 text-white text-sm">npminsights.com</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
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
    <div tw="mx-4 w-60 h-full flex flex-col rounded-lg bg-gray-800 px-4 py-6 ring-gray-900/5">
      <div tw="flex w-full items-center justify-between mb-2">
        <h3 tw="text-xl text-gray-100 m-0">{title}</h3>
        <p tw={clsx('m-0', percentageDiff > 0 ? 'text-green-500' : 'text-red-600')}>
          {percentageDiff > 0 && '+'}
          {percentageDiff.toLocaleString('en', { maximumFractionDigits: 1 }) || '-'}%
        </p>
      </div>
      <div tw="flex flex-wrap items-center">
        <p tw="text-yellow-400 m-0 mr-2">{value.toLocaleString('en') || '-'}</p>
        <p tw="text-sm text-gray-400 m-0">from {previousValue.toLocaleString('en') || '-'}</p>
      </div>
    </div>
  );
};

type DownloadsChartProps = {
  width: number;
  height: number;
  downloads: NpmDailyDownloads[];
};

const DownloadsChart = ({ downloads, width, height }: DownloadsChartProps) => {
  const points = downloads.map((d) => ({
    date: d.day,
    value: d.downloads,
  }));

  const getPoints = () => {
    // remove all leading zeros
    const firstNonZeroIndex = points.findIndex((p) => p.value !== 0);
    if (firstNonZeroIndex > 0) {
      return points.slice(firstNonZeroIndex);
    }
    return points;
  };

  return <BarsChart points={getPoints()} width={width} height={height} />;
};

export type Point = {
  date: string;
  value: number;
};

// accessors
const getDate = (d: Point) => d.date;
const getValue = (d: Point) => d.value;

export type BarsProps = {
  points: Point[];
  width: number;
  height: number;
};

export function BarsChart({ points, width, height }: BarsProps) {
  const leftMargin = 40;
  const verticalMargin = 70;
  // bounds
  const xMax = width - leftMargin;
  const yMax = height - verticalMargin;

  // scales, memoize for performance
  const dateScale = scaleBand<string>({
    range: [0, xMax],
    round: true,
    domain: points.map(getDate),
    padding: 0.1,
  });
  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    round: true,
    domain: [0, Math.max(...points.map(getValue))],
  });

  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id="bars-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color={tailwindColors.slate[100]} stop-opacity="1"></stop>
          <stop offset="100%" stop-color={tailwindColors.slate[50]} stop-opacity="0.1"></stop>
        </linearGradient>
      </defs>
      <g transform={`translate(${leftMargin}, ${verticalMargin / 2})`}>
        {points.map((p) => {
          const date = getDate(p);
          const barWidth = dateScale.bandwidth();
          const barHeight = yMax - (yScale(getValue(p)) ?? 0);
          const barX = dateScale(date) || 0;
          const barY = yMax - barHeight;
          return (
            <rect
              key={`bar-${date}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              stroke={tailwindColors.gray[800]}
              fill="url(#bars-gradient)"
            />
          );
        })}
      </g>
    </svg>
  );
}
