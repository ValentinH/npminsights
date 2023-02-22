import { scaleBand, scaleLinear } from '@visx/scale';
import tailwindColors from 'tailwindcss/colors';

type Point = {
  date: string;
  value: number;
};

// accessors
const getDate = (d: Point) => d.date;
const getValue = (d: Point) => d.value;

type OgBarsChartProps = {
  points: Point[];
  width: number;
  height: number;
};

/* This component is made to be used inside an ImageResponse from @vercel/og where we cannot use default @visx components for some reasons */
export function OgBarsChart({ points, width, height }: OgBarsChartProps) {
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
