'use client';
import { format } from 'date-fns';
import React from 'react';
import { ResponsiveAreaChart } from './AreaChart';
import { NpmDailyDownloads } from '../utils/npm-api/types';

type DownloadsChartProps = {
  title: string;
  downloads: NpmDailyDownloads[];
  dateFormat: string;
};

export const DownloadsChart = ({ title, downloads, dateFormat }: DownloadsChartProps) => {
  const downloadsPoints = React.useMemo(() => {
    const points = downloads.map((d) => ({
      date: d.day,
      value: d.downloads,
    }));

    // remove all leading zeros
    const firstNonZeroIndex = points.findIndex((p) => p.value !== 0);
    if (firstNonZeroIndex > 0) {
      return points.slice(firstNonZeroIndex);
    }
    return points;
  }, [downloads]);
  return (
    <div className="relative h-full w-full">
      <h3 className="absolute top-2 left-4 z-10 text-sm uppercase">{title}</h3>
      <ResponsiveAreaChart
        points={downloadsPoints}
        formatValue={(value) => value.toLocaleString('en')}
        formatDate={(date) => format(date, dateFormat)}
      />
    </div>
  );
};
