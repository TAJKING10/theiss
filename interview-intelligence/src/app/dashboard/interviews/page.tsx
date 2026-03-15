"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Video,
  Calendar,
  Clock,
  MoreHorizontal,
  Play,
  Trash2,
  Eye,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { getInterviews, deleteInterview } from "@/lib/actions/interviews";
import { ScheduleInterviewModal } from "@/components/modals/ScheduleInterviewModal";
import type { InterviewWithCandidate } from "@/lib/supabase/types";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewWithCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showScheduleModal, setShowScheduleModal] = useState(false);

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this interview?")) return;
    try {
      await deleteInterview(id);
      setInterviews(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error("Failed to delete interview:", error);
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.candidate?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.candidate?.position?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <GradientBackground />

      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Interviews</h1>
            <p className="text-white/50">Manage and conduct AI-powered interviews.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/interviews/lobby">
              <Button variant="secondary" className="gap-2">
                <Play className="w-4 h-4" /> Start Live Session
              </Button>
            </Link>
            <Button
              className="gap-2 shadow-lg shadow-blue-500/20"
              onClick={() => setShowScheduleModal(true)}
            >
              <Plus className="w-4 h-4" /> Schedule Interview
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="all" className="bg-gray-900">All Status</option>
              <option value="scheduled" className="bg-gray-900">Scheduled</option>
              <option value="in_progress" className="bg-gray-900">In Progress</option>
              <option value="completed" className="bg-gray-900">Completed</option>
              <option value="cancelled" className="bg-gray-900">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Interviews List or Empty State */}
        {interviews.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Video className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No interviews scheduled</h3>
            <p className="text-white/50 mb-6">Schedule your first interview to get started.</p>
            <Button onClick={() => setShowScheduleModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> Schedule Interview
            </Button>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map((interview) => (
              <GlassCard
                key={interview.id}
                className="p-0 overflow-hidden hover:border-white/20 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
                  {/* Candidate Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                      {interview.candidate?.name ? getInitials(interview.candidate.name) : "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold">{interview.title}</h3>
                      <p className="text-sm text-white/50">
                        {interview.candidate?.name || "Unknown"} &middot; {interview.candidate?.position || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-white/60">
                      <Calendar className="w-4 h-4" />
                      {formatDate(interview.scheduled_at)}
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="w-4 h-4" />
                      {formatTime(interview.scheduled_at)}
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Video className="w-4 h-4" />
                      {interview.duration_minutes || 60} min
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${statusColors[interview.status] || statusColors.scheduled}`}>
                      {interview.status.replace("_", " ")}
                    </span>

                    {interview.score && (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${interview.score >= 90 ? "bg-green-500" : interview.score >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${interview.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{interview.score}%</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {(interview.status === "scheduled" || interview.status === "in_progress") && (
                      <Link href={`/dashboard/interviews/${interview.id}`}>
                        <Button size="sm" className="gap-2">
                          <Play className="w-4 h-4" /> Start
                        </Button>
                      </Link>
                    )}
                    <Link href={`/dashboard/interviews/${interview.id}`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-red-500/20 hover:text-red-400"
                      onClick={() => handleDelete(interview.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Results count */}
        {interviews.length > 0 && (
          <div className="mt-6 text-sm text-white/50">
            Showing {filteredInterviews.length} of {interviews.length} interviews
          </div>
        )}
      </div>

      {/* Modals */}
      <ScheduleInterviewModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSuccess={() => {
          setShowScheduleModal(false);
          loadInterviews();
        }}
      />
    </div>
  );
}
