"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PositionData {
  position: string;
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  approvedCount: number;
  rejectedCount: number;
  reviewCount: number;
}

interface PositionAnalysisProps {
  data: PositionData[];
  className?: string;
}

export function PositionAnalysis({ data, className = "" }: PositionAnalysisProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.totalInterviews - a.totalInterviews);
  }, [data]);

  const maxInterviews = Math.max(...data.map((d) => d.totalInterviews), 1);
  const overallAvgScore = data.length > 0
    ? Math.round(data.reduce((sum, d) => sum + d.averageScore * d.completedInterviews, 0) /
        data.reduce((sum, d) => sum + d.completedInterviews, 0) || 0)
    : 0;

  if (data.length === 0) {
    return (
      <div className={cn("p-6 rounded-xl bg-white/5 text-center", className)}>
        <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/50">No position data available</p>
        <p className="text-white/30 text-sm">Complete interviews to see position analytics</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white/5 text-center">
          <div className="text-2xl font-bold text-blue-400">{data.length}</div>
          <div className="text-sm text-white/50">Positions</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {data.reduce((sum, d) => sum + d.totalInterviews, 0)}
          </div>
          <div className="text-sm text-white/50">Total Interviews</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 text-center">
          <div className="text-2xl font-bold text-green-400">{overallAvgScore}%</div>
          <div className="text-sm text-white/50">Avg Score</div>
        </div>
      </div>

      {/* Position List */}
      <div className="space-y-3">
        {sortedData.map((position, index) => (
          <motion.div
            key={position.position}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium">{position.position}</h4>
                  <p className="text-sm text-white/50">
                    {position.completedInterviews} completed of {position.totalInterviews}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-lg font-bold",
                    position.averageScore >= 80
                      ? "text-green-400"
                      : position.averageScore >= 60
                        ? "text-yellow-400"
                        : "text-red-400"
                  )}
                >
                  {Math.round(position.averageScore)}%
                </span>
                {position.averageScore >= overallAvgScore ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>

            {/* Progress bar showing interview volume */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(position.totalInterviews / maxInterviews) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>

            {/* Recommendation breakdown */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-white/50">Approved:</span>
                <span className="text-green-400 font-medium">{position.approvedCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-white/50">Review:</span>
                <span className="text-yellow-400 font-medium">{position.reviewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-white/50">Rejected:</span>
                <span className="text-red-400 font-medium">{position.rejectedCount}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Compact bar chart for position comparison
interface PositionBarChartProps {
  data: PositionData[];
  metric: "averageScore" | "totalInterviews" | "approvedCount";
  title?: string;
  className?: string;
}

export function PositionBarChart({
  data,
  metric,
  title = "Position Comparison",
  className = "",
}: PositionBarChartProps) {
  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, 5); // Top 5
  }, [data, metric]);

  const maxValue = Math.max(...sortedData.map((d) => d[metric]), 1);

  const metricLabels = {
    averageScore: "Average Score",
    totalInterviews: "Total Interviews",
    approvedCount: "Approved",
  };

  const metricColors = {
    averageScore: "from-green-500 to-emerald-500",
    totalInterviews: "from-blue-500 to-cyan-500",
    approvedCount: "from-purple-500 to-pink-500",
  };

  if (sortedData.length === 0) {
    return (
      <div className={cn("p-6 rounded-xl bg-white/5 text-center", className)}>
        <BarChart2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/30">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-semibold text-white flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-blue-400" />
        {title} - {metricLabels[metric]}
      </h3>

      <div className="space-y-3">
        {sortedData.map((position, index) => (
          <motion.div
            key={position.position}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3"
          >
            <span className="w-32 text-sm text-white/70 truncate" title={position.position}>
              {position.position}
            </span>
            <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden">
              <motion.div
                className={cn("h-full rounded-lg bg-gradient-to-r", metricColors[metric])}
                initial={{ width: 0 }}
                animate={{ width: `${(position[metric] / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
            <span className="w-12 text-sm text-white/50 text-right">
              {metric === "averageScore" ? `${Math.round(position[metric])}%` : position[metric]}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default PositionAnalysis;
