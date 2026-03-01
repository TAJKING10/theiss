"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  BarChart3,
  Clock,
  TrendingUp,
  Video,
  UserPlus,
  FileText,
  MoreHorizontal,
  ArrowUpRight,
  Search,
  Bell,
  Plus,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { getDashboardData, type DashboardData } from "@/lib/actions/dashboard";
import { AddCandidateModal } from "@/components/modals/AddCandidateModal";
import { ScheduleInterviewModal } from "@/components/modals/ScheduleInterviewModal";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showScheduleInterview, setShowScheduleInterview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = data ? [
    { label: "Total Interviews", value: data.stats.totalInterviews.toString(), change: `+${data.stats.interviewGrowth}%`, positive: true, icon: Video },
    { label: "Candidates", value: data.stats.totalCandidates.toString(), change: `+${data.stats.candidateGrowth}%`, positive: true, icon: Users },
    { label: "Avg. Fairness Score", value: `${data.stats.avgFairnessScore}%`, change: `+${data.stats.scoreGrowth}%`, positive: true, icon: BarChart3 },
    { label: "Time Saved", value: `${data.stats.timeSavedHours}h`, change: `+${data.stats.timeGrowth}%`, positive: true, icon: Clock },
  ] : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
    if (date.toDateString() === today.toDateString()) {
      dayLabel = "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dayLabel = "Tomorrow";
    }

    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      label: dayLabel,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative p-4 md:p-8">
      <GradientBackground />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-white/50">Here&apos;s what&apos;s happening today.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <Button size="icon" variant="ghost" className="rounded-full bg-white/5">
            <Bell className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
            {user?.name?.charAt(0) || "U"}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <GlassCard
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`flex items-center text-sm ${stat.positive ? "text-green-400" : "text-red-400"}`}>
                {stat.change} <TrendingUp className="w-3 h-3 ml-1" />
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-white/50 text-sm">{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Interviews */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Interviews</h2>
            <Link href="/dashboard/interviews" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <GlassCard className="p-0 overflow-hidden">
            {data?.recentInterviews && data.recentInterviews.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider p-4">Candidate</th>
                      <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider p-4">Position</th>
                      <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider p-4">Date</th>
                      <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider p-4">Score</th>
                      <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider p-4">Status</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentInterviews.map((interview) => (
                      <tr key={interview.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                              {interview.candidate?.name?.charAt(0) || "?"}
                            </div>
                            <span className="font-medium text-sm">{interview.candidate?.name || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="p-4 text-white/60 text-sm">{interview.candidate?.position || "N/A"}</td>
                        <td className="p-4 text-white/40 text-sm">{formatDate(interview.scheduled_at)}</td>
                        <td className="p-4">
                          {interview.score ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${interview.score >= 90 ? "bg-green-500" : interview.score >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                                  style={{ width: `${interview.score}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">{interview.score}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-white/40">Pending</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            interview.status === "completed"
                              ? "bg-green-500/5 text-green-400 border-green-500/20"
                              : interview.status === "review"
                              ? "bg-yellow-500/5 text-yellow-400 border-yellow-500/20"
                              : "bg-blue-500/5 text-blue-400 border-blue-500/20"
                          }`}>
                            {interview.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/dashboard/interviews/${interview.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Video className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No interviews yet</h3>
                <p className="text-white/50 text-sm mb-4">Schedule your first interview to get started</p>
                <Button onClick={() => setShowScheduleInterview(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Schedule Interview
                </Button>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Upcoming</h2>
              <Link href="/dashboard/interviews">
                <Button variant="ghost" size="sm" className="h-8 text-xs">View Calendar</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {data?.upcomingInterviews && data.upcomingInterviews.length > 0 ? (
                data.upcomingInterviews.map((interview) => {
                  const timeInfo = formatTime(interview.scheduled_at);
                  return (
                    <Link key={interview.id} href={`/dashboard/interviews/${interview.id}`}>
                      <GlassCard className="p-4 flex items-center gap-4 group cursor-pointer hover:border-blue-500/30">
                        <div className="flex-col flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-colors">
                          <span className="text-xs font-bold text-white/40 group-hover:text-blue-400">{timeInfo.day}</span>
                          <span className="text-[10px] text-white/30 uppercase">{timeInfo.month}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{interview.candidate?.name || "Unknown"}</h4>
                          <p className="text-xs text-white/50">{interview.candidate?.position || "N/A"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
                            {timeInfo.time}
                          </p>
                        </div>
                      </GlassCard>
                    </Link>
                  );
                })
              ) : (
                <GlassCard className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-white/50 text-sm">No upcoming interviews</p>
                </GlassCard>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <GlassCard variant="accent" className="p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start h-12"
                onClick={() => setShowScheduleInterview(true)}
              >
                <Video className="w-4 h-4 mr-3 text-blue-400" />
                Start New Interview
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start h-12"
                onClick={() => setShowAddCandidate(true)}
              >
                <UserPlus className="w-4 h-4 mr-3 text-purple-400" />
                Add Candidate
              </Button>
              <Link href="/dashboard/reports" className="block">
                <Button variant="secondary" className="w-full justify-start h-12">
                  <FileText className="w-4 h-4 mr-3 text-green-400" />
                  Generate Report
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Modals */}
      <AddCandidateModal
        isOpen={showAddCandidate}
        onClose={() => setShowAddCandidate(false)}
        onSuccess={() => {
          setShowAddCandidate(false);
          loadData();
        }}
      />
      <ScheduleInterviewModal
        isOpen={showScheduleInterview}
        onClose={() => setShowScheduleInterview(false)}
        onSuccess={() => {
          setShowScheduleInterview(false);
          loadData();
        }}
      />
    </div>
  );
}
