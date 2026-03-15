"use client";

import { useState, useEffect } from "react";
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
  Award
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { getInterviews } from "@/lib/actions/interviews";
import { cn } from "@/lib/utils";
import type { InterviewWithCandidate } from "@/lib/supabase/types";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [interviews, setInterviews] = useState<InterviewWithCandidate[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Calculate real metrics from interviews
  const completedInterviews = interviews.filter(i => i.status === "completed");
  const totalInterviews = interviews.length;
  const avgScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / completedInterviews.length)
    : 0;

  const approvedCount = completedInterviews.filter(i => (i.score || 0) >= 80).length;
  const reviewCount = completedInterviews.filter(i => (i.score || 0) >= 60 && (i.score || 0) < 80).length;
  const rejectedCount = completedInterviews.filter(i => (i.score || 0) < 60).length;

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
            <Button className="gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>

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

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <div className="text-lg font-bold text-blue-400">
              {interviews.filter(i => i.status === "scheduled").length}
            </div>
            <div className="text-sm text-white/50">Scheduled</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <div className="text-lg font-bold text-yellow-400">
              {interviews.filter(i => i.status === "in_progress").length}
            </div>
            <div className="text-sm text-white/50">In Progress</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <div className="text-lg font-bold text-green-400">{completedInterviews.length}</div>
            <div className="text-sm text-white/50">Completed</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 text-center">
            <div className="text-lg font-bold text-red-400">
              {interviews.filter(i => i.status === "cancelled").length}
            </div>
            <div className="text-sm text-white/50">Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
}
