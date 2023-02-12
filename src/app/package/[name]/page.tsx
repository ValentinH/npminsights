import clsx from 'clsx';
import * as npmApi from '#src/app/(utils)/npm-api';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [
    {
      name: 'react-easy-crop',
    },
  ];
}

async function getData(packageName: string) {
  const data = await npmApi.getPackageInsights(packageName);
  return data;
}

type PackageProps = {
  params: { name: string };
};

export default async function Package({ params }: PackageProps) {
  const { name } = params;
  const data = await getData(name);
  return (
    <>
      <h1 className="my-8 text-center text-4xl">{name} insights</h1>
      <section>
        <h2 className="mb-4 text-2xl">Downloads</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card title="Last day" value={data.lastDay} previousValue={data.lastDayPreviousWeek} />
          <Card title="Last week" value={data.lastWeek} previousValue={data.previousWeek} />
          <Card title="Last month" value={data.lastMonth} previousValue={data.previousMonth} />
          <Card title="Last year" value={data.lastYear} previousValue={data.previousYear} />
        </div>
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
