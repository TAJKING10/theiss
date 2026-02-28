"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Users, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Video, 
  UserPlus, 
  FileText,
  MoreHorizontal,
  ArrowUpRight,
  Search,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";

// Mock data
const stats = [
  { label: "Total Interviews", value: "156", change: "+12%", positive: true, icon: Video },
  { label: "Candidates", value: "89", change: "+8%", positive: true, icon: Users },
  { label: "Avg. Fairness Score", value: "94%", change: "+3%", positive: true, icon: BarChart3 },
  { label: "Time Saved", value: "120h", change: "+15%", positive: true, icon: Clock },
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
    <div className="min-h-screen bg-black text-white relative">
      <GradientBackground />
      
      {/* Dashboard Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar (Simplified for now) */}
        <aside className="w-20 lg:w-64 hidden md:flex flex-col border-r border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">II</span>
            </div>
            <span className="font-bold text-lg hidden lg:block">Intelligence</span>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 mt-4">
            {["Overview", "Interviews", "Candidates", "Reports", "Settings"].map((item, i) => (
              <div
                key={item}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                  i === 0 ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="w-5 h-5 bg-current rounded-full opacity-20" />
                <span className="hidden lg:block">{item}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
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
                <Link href="#" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  View all <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <GlassCard className="p-0 overflow-hidden">
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
                      {recentInterviews.map((interview) => (
                        <tr key={interview.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                {interview.candidate.charAt(0)}
                              </div>
                              <span className="font-medium text-sm">{interview.candidate}</span>
                            </div>
                          </td>
                          <td className="p-4 text-white/60 text-sm">{interview.position}</td>
                          <td className="p-4 text-white/40 text-sm">{interview.date}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${interview.score >= 90 ? "bg-green-500" : "bg-yellow-500"}`} 
                                  style={{ width: `${interview.score}%` }} 
                                />
                              </div>
                              <span className="text-xs font-medium">{interview.score}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                              interview.status === "completed"
                                ? "bg-green-500/5 text-green-400 border-green-500/20"
                                : "bg-yellow-500/5 text-yellow-400 border-yellow-500/20"
                            }`}>
                              {interview.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Upcoming */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Upcoming</h2>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">View Calendar</Button>
                </div>
                <div className="space-y-4">
                  {upcomingInterviews.map((interview) => (
                    <GlassCard key={interview.id} className="p-4 flex items-center gap-4 group cursor-pointer hover:border-blue-500/30">
                      <div className="flex-col flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-colors">
                        <span className="text-xs font-bold text-white/40 group-hover:text-blue-400">14</span>
                        <span className="text-[10px] text-white/30 uppercase">Oct</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{interview.candidate}</h4>
                        <p className="text-xs text-white/50">{interview.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
                          {interview.time.split(',')[1]}
                        </p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <GlassCard variant="accent" className="p-6">
                <h3 className="font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="secondary" className="w-full justify-start h-12">
                    <Video className="w-4 h-4 mr-3 text-blue-400" />
                    Start New Interview
                  </Button>
                  <Button variant="secondary" className="w-full justify-start h-12">
                    <UserPlus className="w-4 h-4 mr-3 text-purple-400" />
                    Add Candidate
                  </Button>
                  <Button variant="secondary" className="w-full justify-start h-12">
                    <FileText className="w-4 h-4 mr-3 text-green-400" />
                    Generate Report
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
