import React from "react";
import { Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import { useTheme } from "@/src/theme/useTheme";

export function LineChart({
  width,
  data,
  markers,
  color,
  height = 190,
  unit,
  formatValue,
}: {
  width: number;
  data: number[];
  markers?: boolean[];
  color: string;
  height?: number;
  unit?: string;
  formatValue?: (value: number) => string;
}) {
  const { colors, font, fontSize } = useTheme();
  const axisWidth = 42;
  const padRight = 8;
  const padTop = 12;
  const padBottom = 22;

  if (!data.length || width <= 0) {
    return <View style={{ height }} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const innerW = width - axisWidth - padRight;
  const innerH = height - padTop - padBottom;

  const x = (i: number) => axisWidth + (innerW * i) / (data.length - 1 || 1);
  const y = (v: number) => padTop + innerH * (1 - (v - min) / range);
  const label = (v: number) => formatValue?.(v) ?? `${Math.round(v)}${unit ?? ""}`;
  const ticks = [max, min + range / 2, min];

  const linePath = data
    .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(" ");

  const areaPath =
    `M ${x(0).toFixed(1)} ${y(data[0]).toFixed(1)} ` +
    data.map((v, i) => `L ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ") +
    ` L ${x(data.length - 1).toFixed(1)} ${(height - padBottom).toFixed(1)}` +
    ` L ${x(0).toFixed(1)} ${(height - padBottom).toFixed(1)} Z`;

  const avg = data.reduce((a, b) => a + b, 0) / data.length;
  const avgY = y(avg);

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.28" />
            <Stop offset="1" stopColor={color} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Y-axis and three evenly spaced reference labels. */}
        <Line
          x1={axisWidth}
          y1={padTop}
          x2={axisWidth}
          y2={height - padBottom}
          stroke={colors.outlineVariant}
          strokeWidth={1}
        />
        {ticks.map((tick, index) => {
          const tickY = y(tick);
          return (
            <React.Fragment key={index}>
              <Line
                x1={axisWidth}
                y1={tickY}
                x2={width - padRight}
                y2={tickY}
                stroke={colors.outlineVariant}
                strokeWidth={1}
                strokeDasharray="3 5"
              />
              <SvgText
                x={axisWidth - 6}
                y={tickY + 4}
                textAnchor="end"
                fill={colors.textFaint}
                fontSize={fontSize.xs}
                fontFamily={font.mono}
              >
                {label(tick)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* baseline (avg) */}
        <Line
          x1={axisWidth}
          y1={avgY}
          x2={width - padRight}
          y2={avgY}
          stroke={colors.borderStrong}
          strokeWidth={1}
          strokeDasharray="4 5"
        />

        <Path d={areaPath} fill="url(#areaGrad)" />
        <Path d={linePath} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" />

        {data.map((v, i) => {
          const marked = markers?.[i];
          return (
            <Circle
              key={i}
              cx={x(i)}
              cy={y(v)}
              r={marked ? 4.5 : 2.5}
              fill={marked ? color : colors.surface}
              stroke={color}
              strokeWidth={marked ? 2 : 1.5}
            />
          );
        })}
      </Svg>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
        <Text style={{ color: colors.textFaint, fontFamily: font.mono, fontSize: fontSize.xs }}>
          14d ago
        </Text>
        <Text style={{ color: colors.textFaint, fontFamily: font.mono, fontSize: fontSize.xs }}>
          avg {label(avg)}
        </Text>
        <Text style={{ color: colors.textFaint, fontFamily: font.mono, fontSize: fontSize.xs }}>
          today
        </Text>
      </View>
    </View>
  );
}
