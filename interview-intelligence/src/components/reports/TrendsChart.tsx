"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface TrendsChartProps {
  data: DataPoint[];
  title?: string;
  valueLabel?: string;
  height?: number;
  showTrend?: boolean;
  color?: "blue" | "green" | "purple" | "orange";
  className?: string;
}

const colors = {
  blue: {
    line: "stroke-blue-500",
    fill: "fill-blue-500/20",
    dot: "fill-blue-500",
    glow: "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    text: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  green: {
    line: "stroke-green-500",
    fill: "fill-green-500/20",
    dot: "fill-green-500",
    glow: "drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]",
    text: "text-green-400",
    bg: "bg-green-500/10",
  },
  purple: {
    line: "stroke-purple-500",
    fill: "fill-purple-500/20",
    dot: "fill-purple-500",
    glow: "drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]",
    text: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  orange: {
    line: "stroke-orange-500",
    fill: "fill-orange-500/20",
    dot: "fill-orange-500",
    glow: "drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]",
    text: "text-orange-400",
    bg: "bg-orange-500/10",
  },
};

export function TrendsChart({
  data,
  title = "Trend",
  valueLabel = "Score",
  height = 200,
  showTrend = true,
  color = "blue",
  className = "",
}: TrendsChartProps) {
  const colorScheme = colors[color];

  const { points, path, areaPath, minValue, maxValue, trend, avgValue } = useMemo(() => {
    if (data.length === 0) {
      return { points: [], path: "", areaPath: "", minValue: 0, maxValue: 100, trend: 0, avgValue: 0 };
    }

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    // Calculate trend (compare first half avg to second half avg)
    const halfIndex = Math.floor(values.length / 2);
    const firstHalfAvg = values.slice(0, halfIndex).reduce((a, b) => a + b, 0) / halfIndex || 0;
    const secondHalfAvg = values.slice(halfIndex).reduce((a, b) => a + b, 0) / (values.length - halfIndex) || 0;
    const trendValue = secondHalfAvg - firstHalfAvg;

    const padding = 20;
    const chartWidth = 100;
    const chartHeight = 100;

    const pts = data.map((d, i) => ({
      x: padding + (i / (data.length - 1 || 1)) * (chartWidth - padding * 2),
      y: padding + ((max - d.value) / range) * (chartHeight - padding * 2),
      value: d.value,
      date: d.date,
      label: d.label,
    }));

    // Create line path
    const linePath = pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    // Create area path (line + bottom edge)
    const area =
      pts.length > 0
        ? `${linePath} L ${pts[pts.length - 1].x} ${chartHeight - padding} L ${pts[0].x} ${chartHeight - padding} Z`
        : "";

    return {
      points: pts,
      path: linePath,
      areaPath: area,
      minValue: min,
      maxValue: max,
      trend: trendValue,
      avgValue: avg,
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className={cn("p-6 rounded-xl bg-white/5 text-center", className)}>
        <p className="text-white/30">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-white/50">
            Avg: {Math.round(avgValue)}% | Range: {Math.round(minValue)}-{Math.round(maxValue)}%
          </p>
        </div>
        {showTrend && (
          <div
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium",
              trend > 2 ? "bg-green-500/20 text-green-400" : trend < -2 ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/50"
            )}
          >
            {trend > 2 ? (
              <TrendingUp className="w-4 h-4" />
            ) : trend < -2 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span>{trend > 0 ? "+" : ""}{Math.round(trend)}%</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="20"
              y1={y}
              x2="80"
              y2={y}
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-white/10"
            />
          ))}

          {/* Area fill */}
          <motion.path
            d={areaPath}
            className={colorScheme.fill}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Line */}
          <motion.path
            d={path}
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(colorScheme.line, colorScheme.glow)}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Data points */}
          {points.map((point, i) => (
            <motion.circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="2"
              className={cn(colorScheme.dot, colorScheme.glow)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.2 }}
            />
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-white/30 py-2">
          <span>{Math.round(maxValue)}%</span>
          <span>{Math.round((maxValue + minValue) / 2)}%</span>
          <span>{Math.round(minValue)}%</span>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-white/30 px-4">
        {data.length <= 7 ? (
          data.map((d, i) => (
            <span key={i}>{d.label || d.date}</span>
          ))
        ) : (
          <>
            <span>{data[0].label || data[0].date}</span>
            <span>{data[Math.floor(data.length / 2)].label || data[Math.floor(data.length / 2)].date}</span>
            <span>{data[data.length - 1].label || data[data.length - 1].date}</span>
          </>
        )}
      </div>
    </div>
  );
}

// Multi-line trends chart for comparing multiple metrics
interface MultiTrendsChartProps {
  datasets: {
    label: string;
    data: DataPoint[];
    color: "blue" | "green" | "purple" | "orange";
  }[];
  title?: string;
  height?: number;
  className?: string;
}

export function MultiTrendsChart({
  datasets,
  title = "Performance Trends",
  height = 200,
  className = "",
}: MultiTrendsChartProps) {
  const processedData = useMemo(() => {
    if (datasets.length === 0) return [];

    return datasets.map((dataset) => {
      const values = dataset.data.map((d) => d.value);
      const min = 0;
      const max = 100;
      const range = max - min;

      const padding = 20;
      const chartWidth = 100;
      const chartHeight = 100;

      const points = dataset.data.map((d, i) => ({
        x: padding + (i / (dataset.data.length - 1 || 1)) * (chartWidth - padding * 2),
        y: padding + ((max - d.value) / range) * (chartHeight - padding * 2),
        value: d.value,
      }));

      const path = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");

      return {
        ...dataset,
        points,
        path,
      };
    });
  }, [datasets]);

  if (datasets.length === 0) {
    return (
      <div className={cn("p-6 rounded-xl bg-white/5 text-center", className)}>
        <p className="text-white/30">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-4">
          {datasets.map((dataset) => (
            <div key={dataset.label} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", colors[dataset.color].dot.replace("fill-", "bg-"))} />
              <span className="text-xs text-white/50">{dataset.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="20"
              y1={y}
              x2="80"
              y2={y}
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-white/10"
            />
          ))}

          {/* Lines */}
          {processedData.map((dataset, index) => (
            <motion.path
              key={dataset.label}
              d={dataset.path}
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(colors[dataset.color].line, colors[dataset.color].glow)}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
            />
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-white/30 py-2">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>
      </div>
    </div>
  );
}

export default TrendsChart;
