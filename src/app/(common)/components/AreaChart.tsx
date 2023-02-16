'use client';
import { curveLinear } from '@visx/curve';
import { localPoint } from '@visx/event';
import { LinearGradient } from '@visx/gradient';
import { GridRows, GridColumns } from '@visx/grid';
import { ParentSize } from '@visx/responsive';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AreaClosed, Line, Bar } from '@visx/shape';
import { TooltipWithBounds, defaultStyles, useTooltip } from '@visx/tooltip';
import { max, extent, bisector } from 'd3-array';
import React, { useMemo, useCallback } from 'react';
import tailwindColors from 'tailwindcss/colors';

export type Point = {
  date: string;
  value: number;
};

export const background = tailwindColors.slate[800];
export const background2 = tailwindColors.gray[800];
export const accentColor = tailwindColors.slate[50];
export const accentColorDark = tailwindColors.amber[500];
const tooltipStyles = {
  ...defaultStyles,
  background,
  border: '1px solid white',
  color: 'white',
};

// accessors
const getDate = (d: Point) => new Date(d.date);
const getValue = (d: Point) => d.value;
const bisectDate = bisector<Point, Date>((d) => new Date(d.date)).left;

export type AreaProps = {
  points: Point[];
  formatDate: (date: Date) => string;
  formatValue: (value: number) => string;
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export const AreaChart = ({
  points,
  formatDate,
  formatValue,
  width,
  height,
  margin = { top: 0, right: 0, bottom: 0, left: 0 },
}: AreaProps) => {
  const {
    tooltipLeft = 0,
    tooltipTop = 0,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<Point>();

  // bounds
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // scales
  const dateScale = useMemo(
    () =>
      scaleTime({
        range: [margin.left, innerWidth + margin.left],
        domain: extent(points, getDate) as [Date, Date],
      }),
    [innerWidth, margin.left, points]
  );
  const valueScale = useMemo(
    () =>
      scaleLinear({
        range: [innerHeight + margin.top, margin.top],
        domain: [0, (max(points, getValue) || 0) + innerHeight / 3],
        nice: true,
      }),
    [innerHeight, margin.top, points]
  );

  // tooltip handler
  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = dateScale.invert(x);
      const index = bisectDate(points, x0, 1);
      const d0 = points[index - 1];
      const d1 = points[index];
      let d = d0;
      if (d1 && getDate(d1)) {
        d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: valueScale(getValue(d)),
      });
    },
    [dateScale, points, showTooltip, valueScale]
  );

  return (
    <div>
      <svg width={width} height={height}>
        <LinearGradient id="area-background-gradient" from={background} to={background2} />
        <LinearGradient id="area-gradient" from={accentColor} to={accentColor} toOpacity={0.1} />
        <GridRows
          left={margin.left}
          scale={valueScale}
          width={innerWidth}
          strokeDasharray="1,3"
          stroke={accentColor}
          strokeOpacity={0}
          pointerEvents="none"
        />
        <GridColumns
          top={margin.top}
          scale={dateScale}
          height={innerHeight}
          strokeDasharray="1,3"
          stroke={accentColor}
          strokeOpacity={0.2}
          pointerEvents="none"
        />
        <AreaClosed<Point>
          data={points}
          x={(d) => dateScale(getDate(d)) ?? 0}
          y={(d) => valueScale(getValue(d)) ?? 0}
          yScale={valueScale}
          strokeWidth={1}
          stroke="url(#area-gradient)"
          fill="url(#area-gradient)"
          curve={curveLinear}
        />
        <Bar
          x={margin.left}
          y={margin.top}
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={() => hideTooltip()}
        />
        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: margin.top }}
              to={{ x: tooltipLeft, y: innerHeight + margin.top }}
              stroke={accentColorDark}
              strokeWidth={2}
              pointerEvents="none"
              strokeDasharray="5,2"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop + 1}
              r={4}
              fill="black"
              fillOpacity={0.1}
              stroke="black"
              strokeOpacity={0.1}
              strokeWidth={2}
              pointerEvents="none"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={4}
              fill={accentColorDark}
              stroke="white"
              strokeWidth={2}
              pointerEvents="none"
            />
          </g>
        )}
      </svg>
      {tooltipData && (
        <div>
          <TooltipWithBounds
            key={Math.random()}
            top={tooltipTop - 52}
            left={tooltipLeft + 12}
            style={tooltipStyles}>
            {formatValue(getValue(tooltipData))}
          </TooltipWithBounds>
          <TooltipWithBounds
            top={innerHeight + margin.top - 24}
            left={tooltipLeft}
            style={{
              ...defaultStyles,
              minWidth: 72,
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}>
            {formatDate(getDate(tooltipData))}
          </TooltipWithBounds>
        </div>
      )}
    </div>
  );
};

type ResponsiveAreaProps = Omit<AreaProps, 'width' | 'height'>;

export const ResponsiveAreaChart = (props: ResponsiveAreaProps) => {
  return (
    <ParentSize debounceTime={10}>
      {({ width: visWidth, height: visHeight }) => (
        <AreaChart {...props} width={visWidth} height={visHeight} />
      )}
    </ParentSize>
  );
};
