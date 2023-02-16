import { AxisBottom, AxisLeft } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { Group } from '@visx/group';
import ParentSize from '@visx/responsive/lib/components/ParentSizeModern';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { defaultStyles, Tooltip, useTooltip } from '@visx/tooltip';
import millify from 'millify';
import React, { useMemo } from 'react';
import tailwindColors from 'tailwindcss/colors';

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

const tooltipStyles = {
  ...defaultStyles,
  background,
  border: '1px solid white',
  color: 'white',
};

const axisLeftTickLabelProps = {
  dx: '-0.25em',
  dy: '0.25em',
  fontFamily: 'Arial',
  fontSize: 10,
  textAnchor: 'end' as const,
  fill: axisColor,
};

// access

// accessors
const getDate = (d: Point) => d.date;
const getValue = (d: Point) => d.value;

export type BarsProps = {
  points: Point[];
  width: number;
  height: number;
  formatDate: (date: Date) => string;
  formatValue: (value: number) => string;
};

function BarsChart({ points, width, height, formatDate, formatValue }: BarsProps) {
  const {
    tooltipLeft = 0,
    tooltipTop = 0,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<Point>();
  const tooltipTimeout = React.useRef<number>();

  // bounds
  const xMax = width - leftMargin;
  const yMax = height - verticalMargin;
  const showBottomLegend = width / points.length > 15;

  // scales, memoize for performance
  const dateScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        round: true,
        domain: points.map(getDate),
        padding: 0.1,
      }),
    [xMax, points]
  );
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...points.map(getValue))],
      }),
    [yMax, points]
  );

  const handleTooltip = React.useCallback(
    (point: Point, left: number, top: number) => () => {
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
      showTooltip({
        tooltipData: point,
        tooltipTop: top,
        tooltipLeft: left,
      });
    },
    [showTooltip]
  );

  return width < 10 ? null : (
    <>
      <svg width={width} height={height}>
        <LinearGradient id="bars-background-gradient" from={background} to={background2} />
        <LinearGradient
          id="bars-gradient"
          from={accentColorDark}
          to={accentColor}
          toOpacity={0.1}
        />
        <Group left={leftMargin} top={verticalMargin / 2}>
          {points.map((p) => {
            const date = getDate(p);
            const barWidth = dateScale.bandwidth();
            const barHeight = yMax - (yScale(getValue(p)) ?? 0);
            const barX = dateScale(date) || 0;
            const barY = yMax - barHeight;
            const tooltipX = barX + barWidth / 2 + leftMargin / 2;
            return (
              <Bar
                key={`bar-${date}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                stroke="url(#bars-gradient)"
                fill="url(#bars-gradient)"
                onMouseLeave={() => {
                  tooltipTimeout.current = window.setTimeout(hideTooltip, 300);
                }}
                onTouchStart={handleTooltip(p, tooltipX, barY)}
                onTouchMove={handleTooltip(p, tooltipX, barY)}
                onMouseMove={handleTooltip(p, tooltipX, barY)}
              />
            );
          })}
          {showBottomLegend && (
            <AxisBottom
              top={yMax}
              scale={dateScale}
              tickFormat={(d) => formatDate(new Date(d))}
              stroke={axisColor}
              tickStroke={axisColor}
              tickLabelProps={() => ({
                fill: axisColor,
                fontSize: 14,
                textAnchor: 'middle',
              })}
            />
          )}
          <AxisLeft
            scale={yScale}
            tickFormat={(v) => millify(Number(v))}
            numTicks={5}
            stroke={axisColor}
            tickStroke={axisColor}
            tickLabelProps={() => axisLeftTickLabelProps}
          />
        </Group>
      </svg>
      {tooltipData && (
        <div>
          <Tooltip
            key={Math.random()}
            top={tooltipTop - 20}
            left={tooltipLeft}
            style={{
              ...tooltipStyles,
              minWidth: 72,
              textAlign: 'center',
              transform: 'translateX(-50%)',
            }}>
            <p className="mb-1 whitespace-nowrap">{formatDate(new Date(getDate(tooltipData)))}</p>
            <p>{formatValue(getValue(tooltipData))}</p>
          </Tooltip>
        </div>
      )}
    </>
  );
}

type ResponsiveBarsChartProps = Omit<BarsProps, 'width' | 'height'>;

export const ResponsiveBarsChart = (props: ResponsiveBarsChartProps) => {
  return (
    <ParentSize debounceTime={10}>
      {({ width: visWidth, height: visHeight }) => (
        <BarsChart {...props} width={visWidth} height={visHeight} />
      )}
    </ParentSize>
  );
};
