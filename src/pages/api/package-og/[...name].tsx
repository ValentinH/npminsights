import { ImageResponse } from '@vercel/og';
import { scaleBand, scaleLinear } from '@visx/scale';
import { NextApiRequest } from 'next';
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

  const allYearlyDownloads = data.allDailyDownloads.reduce<NpmDailyDownloads[]>((acc, curr) => {
    const last = acc[acc.length - 1];
    const isNewYear =
      !last || new Date(curr.day).getFullYear() !== new Date(last.day).getFullYear();
    if (isNewYear) {
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
  return new ImageResponse(
    (
      // Modified based on https://tailwindui.com/components/marketing/sections/cta-sections
      <div tw="h-full w-full flex flex-col items-center justify-center bg-gray-800">
        <DownloadsChart downloads={allYearlyDownloads} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

type DownloadsChartProps = {
  downloads: NpmDailyDownloads[];
};

const DownloadsChart = ({ downloads }: DownloadsChartProps) => {
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

  return <BarsChart points={getPoints()} width={1000} height={400} />;
};

export type Point = {
  date: string;
  value: number;
};

const leftMargin = 40;
const verticalMargin = 70;
export const background = tailwindColors.slate[800];
export const background2 = tailwindColors.gray[800];
export const accentColor = tailwindColors.slate[50];
export const accentColorDark = tailwindColors.slate[100];
export const axisColor = tailwindColors.amber[500];

// accessors
const getDate = (d: Point) => d.date;
const getValue = (d: Point) => d.value;

export type BarsProps = {
  points: Point[];
  width: number;
  height: number;
};

export function BarsChart({ points, width, height }: BarsProps) {
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
      <g transform={`translate(${leftMargin}, ${verticalMargin / 2})`}>
        {points.map((p) => {
          const date = getDate(p);
          const barWidth = dateScale.bandwidth();
          const barHeight = yMax - (yScale(getValue(p)) ?? 0);
          const barX = dateScale(date) || 0;
          const barY = yMax - barHeight;
          return (
            <rect
              className="test"
              key={`bar-${date}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              stroke="#fff"
              fill="#fff"
            />
          );
        })}
      </g>
    </svg>
  );
}
