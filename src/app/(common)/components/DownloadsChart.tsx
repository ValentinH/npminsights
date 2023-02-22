'use client';
import clsx from 'clsx';
import { format } from 'date-fns';
import React from 'react';
import { ResponsiveAreaChart } from './AreaChart';
import { ResponsiveBarsChart } from './BarsChart';
import { NpmDailyDownloads } from '../utils/npm-api/types';

type DownloadsChartProps = {
  title: string;
  downloads: NpmDailyDownloads[];
  dateFormat: string;
  className?: string;
  chartType?: 'area' | 'bars';
};

export const DownloadsChart = ({
  title,
  downloads,
  dateFormat,
  className,
  chartType = 'area',
}: DownloadsChartProps) => {
  const downloadsPoints = React.useMemo(
    () =>
      downloads.map((d) => ({
        date: d.day,
        value: d.downloads,
      })),
    [downloads]
  );
  return (
    <div className={clsx('relative h-96 w-full rounded-t-xl bg-gray-800', className)}>
      <h3 className="absolute top-2 left-4 z-10 text-sm uppercase">{title}</h3>
      {chartType === 'area' ? (
        <ResponsiveAreaChart
          points={downloadsPoints}
          formatValue={(value) => value.toLocaleString('en')}
          formatDate={(date) => format(date, dateFormat)}
        />
      ) : (
        <ResponsiveBarsChart
          points={downloadsPoints}
          formatDate={(date) => format(date, dateFormat)}
          formatValue={(value) => value.toLocaleString('en')}
        />
      )}
    </div>
  );
};
