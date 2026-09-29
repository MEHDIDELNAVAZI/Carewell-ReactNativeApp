import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Line,
  Path,
  Stop,
} from 'react-native-svg';

import { PhysioOverviewProgressItem } from '../../api/physioeye.api';
import { cardShadow, colors, radius, tabularNums } from './theme';

interface Props {
  data: PhysioOverviewProgressItem[];
  title?: string;
  height?: number;
}

interface Point {
  x: number;
  y: number;
}

interface Label {
  index: number;
  date: string;
  time: string;
}

const PADDING = {
  top: 18,
  bottom: 28,
  left: 12,
  right: 12,
};

const LINE_COLOR = '#34B08A';

function formatDate(date: string | null) {
  if (!date) return 'Unknown';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return 'Unknown';

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(date: string | null) {
  if (!date) return '';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '';

  return parsedDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getPointLabel(date: string | null) {
  return {
    date: formatDate(date),
    time: formatTime(date),
  };
}

function smoothPath(points: Point[]) {
  if (points.length < 2) return '';

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

export function ProgressChart({
  data,
  title = 'Progress',
  height = 180,
}: Props) {
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No progress data available</Text>
      </View>
    );
  }

  const first = data[0];
  const last = data[data.length - 1];

  const firstValue = first.average ?? 0;
  const lastValue = last.average ?? 0;

  const values = data.map(point => point.average ?? 0);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;

  const breathing = valueRange === 0 ? 10 : Math.max(valueRange * 0.15, 5);
  const low = Math.max(0, minValue - breathing);
  const high = Math.min(100, maxValue + breathing);
  const actualRange = high - low || 1;

  const { linePath, areaPath, points } = useMemo(() => {
    if (width === 0 || data.length === 0) {
      return {
        linePath: '',
        areaPath: '',
        points: [] as Point[],
      };
    }

    const innerWidth = Math.max(width - PADDING.left - PADDING.right, 1);

    const innerHeight = Math.max(height - PADDING.top - PADDING.bottom, 1);

    const points = data.map((point, index) => {
      const x =
        data.length === 1
          ? PADDING.left + innerWidth / 2
          : PADDING.left + (index * innerWidth) / (data.length - 1);

      const value = point.average ?? 0;
      const normalized = (value - low) / actualRange;
      const y = PADDING.top + (1 - normalized) * innerHeight;

      return { x, y };
    });

    const line = points.length >= 2 ? smoothPath(points) : '';
    const bottom = height - PADDING.bottom;

    const area =
      points.length >= 2
        ? `${line} L ${points[points.length - 1].x} ${bottom} L ${
            points[0].x
          } ${bottom} Z`
        : '';

    return {
      linePath: line,
      areaPath: area,
      points,
    };
  }, [data, width, height, low, actualRange]);

  const visibleLabels = useMemo<Label[]>(() => {
    if (data.length <= 4) {
      return data.map((point, index) => ({
        index,
        ...getPointLabel(point.date),
      }));
    }

    const middleIndex = Math.floor((data.length - 1) / 2);

    return [
      {
        index: 0,
        ...getPointLabel(data[0].date),
      },
      {
        index: middleIndex,
        ...getPointLabel(data[middleIndex].date),
      },
      {
        index: data.length - 1,
        ...getPointLabel(data[data.length - 1].date),
      },
    ];
  }, [data]);

  return (
    <View style={styles.card} accessible>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>{title}</Text>
          <Text style={styles.chartSubtitle}>Assessment score</Text>
        </View>

        <View style={styles.latestBox}>
          <Text style={styles.latestLabel}>Latest</Text>
          <Text style={styles.latestValue}>{lastValue}</Text>
        </View>
      </View>

      {data.length >= 2 && (
        <View style={styles.changeRow}>
          <Text
            style={[
              styles.changeArrow,
              lastValue >= firstValue ? styles.positive : styles.negative,
            ]}
          >
            {lastValue >= firstValue ? '↑' : '↓'}
          </Text>

          <Text style={styles.changeText}>
            {Math.abs(lastValue - firstValue)} points
          </Text>

          <Text style={styles.changeMuted}>since first assessment</Text>
        </View>
      )}

      <View style={{ height, marginTop: 8 }} onLayout={onLayout}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.mint} stopOpacity={0.35} />
                <Stop offset="1" stopColor={colors.mint} stopOpacity={0} />
              </LinearGradient>
            </Defs>

            {[0.25, 0.5, 0.75].map(fraction => {
              const y =
                PADDING.top +
                fraction * (height - PADDING.top - PADDING.bottom);

              return (
                <Line
                  key={fraction}
                  x1={PADDING.left}
                  x2={width - PADDING.right}
                  y1={y}
                  y2={y}
                  stroke={colors.track}
                  strokeWidth={1}
                  strokeDasharray="3 6"
                />
              );
            })}

            {areaPath !== '' && <Path d={areaPath} fill="url(#progressFill)" />}

            {linePath !== '' && (
              <Path
                d={linePath}
                stroke={LINE_COLOR}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}

            {points.map((point, index) => {
              const isLast = index === points.length - 1;

              return (
                <React.Fragment key={`${data[index].session_id}-${index}`}>
                  <Circle
                    cx={point.x}
                    cy={point.y}
                    r={isLast ? 7 : 4}
                    fill={LINE_COLOR}
                    stroke="#FFFFFF"
                    strokeWidth={isLast ? 2.5 : 2}
                  />

                  {isLast && (
                    <Circle
                      cx={point.x}
                      cy={point.y}
                      r={12}
                      fill={LINE_COLOR}
                      opacity={0.14}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Svg>
        )}
      </View>

      <View style={styles.valueRow}>
        {visibleLabels.map(label => {
          const point = data[label.index];
          const value = point.average ?? 0;

          return (
            <View
              key={`${point.session_id}-${label.index}`}
              style={[
                styles.valueItem,
                {
                  left:
                    points.length > 1
                      ? `${(label.index / (points.length - 1)) * 100}%`
                      : '50%',
                  transform: [
                    {
                      translateX:
                        label.index === 0
                          ? 0
                          : label.index === points.length - 1
                          ? -48
                          : -24,
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.pointValue}>{value}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.axis}>
        {visibleLabels.map(label => {
          const point = data[label.index];

          return (
            <View
              key={`date-${point.session_id}-${label.index}`}
              style={[
                styles.axisItem,
                {
                  left:
                    points.length > 1
                      ? `${(label.index / (points.length - 1)) * 100}%`
                      : '50%',
                  transform: [
                    {
                      translateX:
                        label.index === 0
                          ? 0
                          : label.index === points.length - 1
                          ? -48
                          : -28,
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.axisDate}>{label.date}</Text>

              {label.time !== '' && (
                <Text style={styles.axisTime}>{label.time}</Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.sessionRow}>
        <Text style={styles.sessionText}>
          {data.length} {data.length === 1 ? 'assessment' : 'assessments'}
        </Text>

        <Text style={styles.sessionDot}>•</Text>

        <Text style={styles.sessionText}>
          Latest session #{last.session_id}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: radius.card,
    ...cardShadow,
  },

  chartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 4,
  },

  chartTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.ink,
  },

  chartSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSoft,
  },

  latestBox: {
    minWidth: 58,
    alignItems: 'flex-end',
  },

  latestLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.inkMuted,
  },

  latestValue: {
    marginTop: 1,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.ink,
    ...tabularNums,
  },

  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },

  changeArrow: {
    marginRight: 4,
    fontSize: 14,
    fontWeight: '700',
  },

  positive: {
    color: colors.mintInk,
  },

  negative: {
    color: colors.inkSoft,
  },

  changeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkSoft,
  },

  changeMuted: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.inkMuted,
  },

  valueRow: {
    position: 'relative',
    height: 20,
    marginTop: -30,
    marginHorizontal: PADDING.left,
  },

  valueItem: {
    position: 'absolute',
    width: 48,
    alignItems: 'center',
  },

  pointValue: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: colors.ink,
    ...tabularNums,
  },

  axis: {
    position: 'relative',
    height: 38,
    marginHorizontal: PADDING.left,
  },

  axisItem: {
    position: 'absolute',
    width: 56,
    alignItems: 'center',
  },

  axisDate: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    color: colors.inkSoft,
  },

  axisTime: {
    marginTop: 1,
    fontSize: 10,
    lineHeight: 14,
    color: colors.inkMuted,
  },

  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 8,
  },

  sessionText: {
    fontSize: 10,
    color: colors.inkMuted,
  },

  sessionDot: {
    marginHorizontal: 6,
    fontSize: 10,
    color: colors.inkMuted,
  },

  emptyContainer: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 13,
    color: colors.inkMuted,
  },
});
