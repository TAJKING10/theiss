"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

// Mock data for dashboard
const stats = [
  { label: "Total Interviews", value: "156", change: "+12%", positive: true },
  { label: "Candidates", value: "89", change: "+8%", positive: true },
  { label: "Avg. Fairness Score", value: "94%", change: "+3%", positive: true },
  { label: "Time Saved", value: "120h", change: "+15%", positive: true },
];

const recentInterviews = [
  { id: 1, candidate: "Sarah Johnson", position: "Senior Developer", date: "2024-01-15", score: 92, status: "completed" },
  { id: 2, candidate: "Michael Chen", position: "Product Manager", date: "2024-01-14", score: 88, status: "completed" },
  { id: 3, candidate: "Emily Davis", position: "UX Designer", date: "2024-01-14", score: 95, status: "completed" },
  { id: 4, candidate: "James Wilson", position: "Data Scientist", date: "2024-01-13", score: 85, status: "review" },
  { id: 5, candidate: "Lisa Anderson", position: "DevOps Engineer", date: "2024-01-13", score: 91, status: "completed" },
];

const upcomingInterviews = [
  { id: 1, candidate: "Alex Thompson", position: "Frontend Developer", time: "Today, 2:00 PM" },
  { id: 2, candidate: "Maria Garcia", position: "Backend Developer", time: "Today, 4:30 PM" },
  { id: 3, candidate: "David Kim", position: "Full Stack Developer", time: "Tomorrow, 10:00 AM" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-white/50">Here&apos;s what&apos;s happening with your interviews today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
          >
            <p className="text-white/50 text-sm mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold">{stat.value}</span>
              <span className={`text-sm ${stat.positive ? "text-green-400" : "text-red-400"}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Interviews */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Interviews</h2>
              <Link href="/dashboard/candidates" className="text-sm text-blue-400 hover:text-blue-300">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-sm font-medium text-white/50 p-4">Candidate</th>
                    <th className="text-left text-sm font-medium text-white/50 p-4">Position</th>
                    <th className="text-left text-sm font-medium text-white/50 p-4">Date</th>
                    <th className="text-left text-sm font-medium text-white/50 p-4">Score</th>
                    <th className="text-left text-sm font-medium text-white/50 p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInterviews.map((interview) => (
                    <tr key={interview.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-medium">
                            {interview.candidate.charAt(0)}
                          </div>
                          <span className="font-medium">{interview.candidate}</span>
                        </div>
                      </td>
                      <td className="p-4 text-white/70">{interview.position}</td>
                      <td className="p-4 text-white/50">{interview.date}</td>
                      <td className="p-4">
                        <span className={`font-medium ${interview.score >= 90 ? "text-green-400" : interview.score >= 80 ? "text-yellow-400" : "text-red-400"}`}>
                          {interview.score}%
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          interview.status === "completed"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}>
                          {interview.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div>
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Upcoming</h2>
              <Link href="/dashboard/interviews" className="text-sm text-blue-400 hover:text-blue-300">
                Schedule
              </Link>
            </div>
            <div className="p-4 space-y-4">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-medium">
                      {interview.candidate.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{interview.candidate}</p>
                      <p className="text-sm text-white/50">{interview.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <span className="text-sm text-white/50">{interview.time}</span>
                    <Link
                      href="/dashboard/interviews"
                      className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors"
                    >
                      Join
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/interviews"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm">Start New Interview</span>
              </Link>
              <Link
                href="/dashboard/candidates"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <span className="text-sm">Add Candidate</span>
              </Link>
              <Link
                href="/dashboard/reports"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm">Generate Report</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
