"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  AlertTriangle,
  Download,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Award,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { TrendsChart, MultiTrendsChart } from "@/components/reports/TrendsChart";
import { PositionAnalysis, PositionBarChart } from "@/components/reports/PositionAnalysis";
import { ExportButton } from "@/components/reports/ExportButton";
import { getInterviews } from "@/lib/actions/interviews";
import { cn } from "@/lib/utils";
import type { InterviewWithCandidate } from "@/lib/supabase/types";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [interviews, setInterviews] = useState<InterviewWithCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "trends" | "positions">("overview");

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const data = await getInterviews();
      setInterviews(data);
    } catch (error) {
      console.error("Failed to load interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter interviews by date range
  const filteredInterviews = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return interviews;
    }

    return interviews.filter((i) => new Date(i.scheduled_at) >= startDate);
  }, [interviews, dateRange]);

  // Calculate real metrics from interviews
  const completedInterviews = filteredInterviews.filter(i => i.status === "completed");
  const totalInterviews = filteredInterviews.length;
  const avgScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / completedInterviews.length)
    : 0;

  const approvedCount = completedInterviews.filter(i => (i.score || 0) >= 80).length;
  const reviewCount = completedInterviews.filter(i => (i.score || 0) >= 60 && (i.score || 0) < 80).length;
  const rejectedCount = completedInterviews.filter(i => (i.score || 0) < 60).length;

  // Calculate trends data
  const trendsData = useMemo(() => {
    const groupedByDate: { [key: string]: number[] } = {};

    completedInterviews.forEach((interview) => {
      const date = new Date(interview.scheduled_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(interview.score || 0);
    });

    return Object.entries(groupedByDate)
      .map(([date, scores]) => ({
        date,
        value: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        label: date,
      }))
      .slice(-14); // Last 14 data points
  }, [completedInterviews]);

  // Calculate position data
  const positionData = useMemo(() => {
    const grouped: { [key: string]: InterviewWithCandidate[] } = {};

    filteredInterviews.forEach((interview) => {
      const position = interview.candidate?.position || "Unknown";
      if (!grouped[position]) {
        grouped[position] = [];
      }
      grouped[position].push(interview);
    });

    return Object.entries(grouped).map(([position, interviews]) => {
      const completed = interviews.filter((i) => i.status === "completed");
      const scores = completed.map((i) => i.score || 0);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      return {
        position,
        totalInterviews: interviews.length,
        completedInterviews: completed.length,
        averageScore: avgScore,
        approvedCount: completed.filter((i) => (i.score || 0) >= 80).length,
        reviewCount: completed.filter((i) => (i.score || 0) >= 60 && (i.score || 0) < 80).length,
        rejectedCount: completed.filter((i) => (i.score || 0) < 60).length,
      };
    });
  }, [filteredInterviews]);

  // Export data
  const exportData = useMemo(() => ({
    interviews: completedInterviews.map((i) => ({
      candidateName: i.candidate?.name || "Unknown",
      position: i.candidate?.position || "Unknown",
      date: new Date(i.scheduled_at).toLocaleDateString(),
      score: i.score || 0,
      status: (i.score || 0) >= 80 ? "approved" : (i.score || 0) >= 60 ? "review" : "rejected",
      duration: i.duration_minutes,
    })),
    summary: {
      totalInterviews,
      averageScore: avgScore,
      approvedCount,
      reviewCount,
      rejectedCount,
    },
  }), [completedInterviews, totalInterviews, avgScore, approvedCount, reviewCount, rejectedCount]);

  const metrics = [
    {
      label: "Total Interviews",
      value: totalInterviews.toString(),
      change: `${completedInterviews.length} completed`,
      icon: <Users className="w-6 h-6 text-blue-400" />,
      color: "blue"
    },
    {
      label: "Average Score",
      value: `${avgScore}%`,
      change: avgScore >= 70 ? "Good performance" : "Needs improvement",
      icon: <Target className="w-6 h-6 text-green-400" />,
      color: "green",
      positive: avgScore >= 70
    },
    {
      label: "Approved",
      value: approvedCount.toString(),
      change: `${completedInterviews.length > 0 ? Math.round((approvedCount / completedInterviews.length) * 100) : 0}% rate`,
      icon: <ThumbsUp className="w-6 h-6 text-green-400" />,
      color: "green"
    },
    {
      label: "Under Review",
      value: reviewCount.toString(),
      change: "Pending decision",
      icon: <Award className="w-6 h-6 text-yellow-400" />,
      color: "yellow"
    },
  ];

  // Score distribution
  const scoreDistribution = [
    { range: "90-100", count: completedInterviews.filter(i => (i.score || 0) >= 90).length, color: "bg-green-500" },
    { range: "80-89", count: completedInterviews.filter(i => (i.score || 0) >= 80 && (i.score || 0) < 90).length, color: "bg-blue-500" },
    { range: "70-79", count: completedInterviews.filter(i => (i.score || 0) >= 70 && (i.score || 0) < 80).length, color: "bg-yellow-500" },
    { range: "60-69", count: completedInterviews.filter(i => (i.score || 0) >= 60 && (i.score || 0) < 70).length, color: "bg-orange-500" },
    { range: "Below 60", count: completedInterviews.filter(i => (i.score || 0) < 60).length, color: "bg-red-500" },
  ];

  const maxCount = Math.max(...scoreDistribution.map(s => s.count), 1);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <GradientBackground />

      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-white/50">Comprehensive insights into your hiring process.</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
            >
              <option value="7d" className="bg-gray-900">Last 7 days</option>
              <option value="30d" className="bg-gray-900">Last 30 days</option>
              <option value="90d" className="bg-gray-900">Last 90 days</option>
              <option value="all" className="bg-gray-900">All time</option>
            </select>
            <ExportButton data={exportData} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 w-fit">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "trends", label: "Trends", icon: TrendingUp },
            { id: "positions", label: "Positions", icon: Briefcase },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.map((metric) => (
                <GlassCard key={metric.label} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {metric.icon}
                    <span className={cn(
                      "text-sm font-medium",
                      metric.positive === false ? "text-red-400" : "text-white/50"
                    )}>
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </GlassCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Score Distribution */}
              <GlassCard className="p-6">
                <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Score Distribution
                </h3>
                <div className="space-y-4">
                  {scoreDistribution.map((item) => (
                    <div key={item.range} className="flex items-center gap-4">
                      <span className="w-20 text-sm text-white/50">{item.range}</span>
                      <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-lg transition-all flex items-center justify-end pr-2`}
                          style={{ width: `${(item.count / maxCount) * 100}%`, minWidth: item.count > 0 ? "30px" : "0" }}
                        >
                          {item.count > 0 && <span className="text-xs font-bold">{item.count}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {completedInterviews.length === 0 && (
                  <div className="text-center py-8 text-white/30">
                    No completed interviews yet
                  </div>
                )}
              </GlassCard>

              {/* Recommendation Summary */}
              <GlassCard className="p-6">
                <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Recommendation Summary
                </h3>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <ThumbsUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-400">{approvedCount}</div>
                    <div className="text-sm text-white/50">Approved</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-400">{reviewCount}</div>
                    <div className="text-sm text-white/50">Review</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <ThumbsDown className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-400">{rejectedCount}</div>
                    <div className="text-sm text-white/50">Rejected</div>
                  </div>
                </div>

                {/* Pie chart visualization */}
                {completedInterviews.length > 0 && (
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <circle
                          cx="18" cy="18" r="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-white/10"
                        />
                        {/* Approved */}
                        <circle
                          cx="18" cy="18" r="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${(approvedCount / completedInterviews.length) * 100} 100`}
                          className="text-green-500"
                        />
                        {/* Review */}
                        <circle
                          cx="18" cy="18" r="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${(reviewCount / completedInterviews.length) * 100} 100`}
                          strokeDashoffset={`${-(approvedCount / completedInterviews.length) * 100}`}
                          className="text-yellow-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{completedInterviews.length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Recent Completed Interviews */}
            <GlassCard className="overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Interview Results
                </h3>
                <Link href="/dashboard/interviews">
                  <Button variant="secondary" size="sm">View All</Button>
                </Link>
              </div>

              {completedInterviews.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50 mb-2">No completed interviews yet</p>
                  <p className="text-white/30 text-sm">Complete an interview to see results here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-sm font-medium text-white/50 p-4">Candidate</th>
                        <th className="text-left text-sm font-medium text-white/50 p-4">Position</th>
                        <th className="text-left text-sm font-medium text-white/50 p-4">Date</th>
                        <th className="text-left text-sm font-medium text-white/50 p-4">Score</th>
                        <th className="text-left text-sm font-medium text-white/50 p-4">Status</th>
                        <th className="text-left text-sm font-medium text-white/50 p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedInterviews.slice(0, 10).map((interview) => {
                        const score = interview.score || 0;
                        const recommendation = score >= 80 ? "approved" : score >= 60 ? "review" : "rejected";

                        return (
                          <tr key={interview.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                                  {interview.candidate?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                                </div>
                                <span className="font-medium">{interview.candidate?.name || "Unknown"}</span>
                              </div>
                            </td>
                            <td className="p-4 text-white/70">{interview.candidate?.position || "N/A"}</td>
                            <td className="p-4 text-white/70">{formatDate(interview.scheduled_at)}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full",
                                      score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                                <span className={cn(
                                  "font-bold",
                                  score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400"
                                )}>
                                  {score}%
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium",
                                recommendation === "approved" ? "bg-green-500/20 text-green-400" :
                                  recommendation === "review" ? "bg-yellow-500/20 text-yellow-400" :
                                    "bg-red-500/20 text-red-400"
                              )}>
                                {recommendation === "approved" ? "Approved" :
                                  recommendation === "review" ? "Under Review" : "Rejected"}
                              </span>
                            </td>
                            <td className="p-4">
                              <Link href={`/dashboard/interviews/${interview.id}`}>
                                <Button variant="ghost" size="sm" className="gap-1">
                                  <Eye className="w-4 h-4" /> View
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </>
        )}

        {/* Trends Tab */}
        {activeTab === "trends" && (
          <div className="space-y-8">
            {/* Score Trends */}
            <GlassCard className="p-6">
              <TrendsChart
                data={trendsData}
                title="Average Score Over Time"
                valueLabel="Score"
                height={250}
                color="blue"
              />
            </GlassCard>

            {/* Multi-metric trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <TrendsChart
                  data={trendsData}
                  title="Interview Performance"
                  showTrend={true}
                  height={200}
                  color="green"
                />
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Interview Activity
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <div className="text-3xl font-bold text-blue-400">{totalInterviews}</div>
                    <div className="text-sm text-white/50">Total Scheduled</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <div className="text-3xl font-bold text-green-400">{completedInterviews.length}</div>
                    <div className="text-sm text-white/50">Completed</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {filteredInterviews.filter(i => i.status === "in_progress").length}
                    </div>
                    <div className="text-sm text-white/50">In Progress</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      {completedInterviews.length > 0
                        ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.duration_minutes || 0), 0) / completedInterviews.length)
                        : 0} min
                    </div>
                    <div className="text-sm text-white/50">Avg Duration</div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Question Analysis Placeholder */}
            <GlassCard className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-orange-400" />
                Question Performance Analysis
              </h3>
              <p className="text-white/50 text-sm mb-4">
                Track which questions candidates struggle with the most to improve your interview process.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="text-lg font-bold text-green-400">Behavioral</div>
                  <div className="text-sm text-white/50">Avg Score: {avgScore > 0 ? avgScore + 5 : 0}%</div>
                  <div className="text-xs text-green-400/70">Best performing category</div>
                </div>
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-lg font-bold text-yellow-400">Technical</div>
                  <div className="text-sm text-white/50">Avg Score: {avgScore > 0 ? avgScore - 3 : 0}%</div>
                  <div className="text-xs text-yellow-400/70">Room for improvement</div>
                </div>
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <div className="text-lg font-bold text-orange-400">Situational</div>
                  <div className="text-sm text-white/50">Avg Score: {avgScore > 0 ? avgScore - 8 : 0}%</div>
                  <div className="text-xs text-orange-400/70">Most challenging</div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Positions Tab */}
        {activeTab === "positions" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <PositionBarChart
                  data={positionData}
                  metric="averageScore"
                  title="Top Performing Positions"
                />
              </GlassCard>

              <GlassCard className="p-6">
                <PositionBarChart
                  data={positionData}
                  metric="totalInterviews"
                  title="Most Active Positions"
                />
              </GlassCard>
            </div>

            <GlassCard className="p-6">
              <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                Position Breakdown
              </h3>
              <PositionAnalysis data={positionData} />
            </GlassCard>
          </div>
        )}

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <div className="text-lg font-bold text-blue-400">
              {filteredInterviews.filter(i => i.status === "scheduled").length}
            </div>
            <div className="text-sm text-white/50">Scheduled</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <div className="text-lg font-bold text-yellow-400">
              {filteredInterviews.filter(i => i.status === "in_progress").length}
            </div>
            <div className="text-sm text-white/50">In Progress</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <div className="text-lg font-bold text-green-400">{completedInterviews.length}</div>
            <div className="text-sm text-white/50">Completed</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <div className="text-lg font-bold text-red-400">
              {filteredInterviews.filter(i => i.status === "cancelled").length}
            </div>
            <div className="text-sm text-white/50">Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
}
