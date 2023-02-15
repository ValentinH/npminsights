import clsx from 'clsx';
import React from 'react';
import { DownloadsChart } from '#src/app/(common)/components/DownloadsChart';
import * as npmApi from '#src/app/(common)/utils/npm-api';
import { NpmDailyDownloads } from '#src/app/(common)/utils/npm-api/types';

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
  const data = await npmApi.getPackageInsights(name);

  const firstMonday = data.allDailyDownloads.findIndex((d) => new Date(d.day).getDay() === 1);
  const allWeeklyDownloads = data.allDailyDownloads
    .slice(firstMonday)
    .reduce<NpmDailyDownloads[]>((acc, curr) => {
      const isMonday = new Date(curr.day).getDay() === 1;
      if (isMonday) {
        return [
          ...acc,
          {
            day: curr.day,
            downloads: curr.downloads,
          },
        ];
      }

      const last = acc[acc.length - 1];
      last.downloads += curr.downloads;
      return acc;
    }, []);

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

  return (
    <>
      <h1 className="my-8 text-center text-4xl">{name} insights</h1>
      <section className="mb-8">
        <h2 className="mb-4 text-2xl">Downloads</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card title="Last day" value={data.lastDay} previousValue={data.lastDayPreviousWeek} />
          <Card title="Last week" value={data.lastWeek} previousValue={data.previousWeek} />
          <Card title="Last month" value={data.lastMonth} previousValue={data.previousMonth} />
          <Card title="Last year" value={data.lastYear} previousValue={data.previousYear} />
        </div>
      </section>
      <section className="mb-8">
        <h2 className="mb-4 text-2xl">History</h2>
        <DownloadsChart
          downloads={data.allDailyDownloads}
          title="Daily downloads"
          dateFormat="PP"
          className="mb-8"
        />
        <DownloadsChart
          downloads={allWeeklyDownloads}
          title="Weekly downloads"
          dateFormat="yyyy-'W'ww"
          className="mb-8"
        />
        <DownloadsChart
          downloads={allMonthlyDownloads}
          title="Monthly downloads"
          dateFormat="MMM yyyy"
          className="mb-8"
          chartType="bars"
        />
        <DownloadsChart
          downloads={allYearlyDownloads}
          title="Yearly downloads"
          dateFormat="yyyy"
          className="mb-8"
          chartType="bars"
        />
      </section>
    </>
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
    <div className="rounded-lg bg-gray-800 px-6 py-8 shadow-xl ring-1 ring-gray-900/5">
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-xl text-gray-100">{title}</h3>
        <p className={clsx('ml-auto', percentageDiff > 0 ? 'text-green-500' : 'text-red-600')}>
          {percentageDiff > 0 && '+'}
          {percentageDiff.toLocaleString('en', { maximumFractionDigits: 1 }) || '-'}%
        </p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-yellow-400">{value.toLocaleString('en') || '-'}</p>
        <p className="text-sm text-gray-400">from {previousValue.toLocaleString('en') || '-'}</p>
      </div>
    </div>
  );
};
