"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Trash2, Calendar, UserX } from "lucide-react";
import { getCandidates, deleteCandidate } from "@/lib/actions/candidates";
import { AddCandidateModal } from "@/components/modals/AddCandidateModal";
import { ScheduleInterviewModal } from "@/components/modals/ScheduleInterviewModal";
import type { Candidate } from "@/lib/supabase/types";

const statusColors: Record<string, string> = {
  pending: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  interviewed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  hired: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedForInterview, setSelectedForInterview] = useState<string | undefined>();

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const data = await getCandidates();
      setCandidates(data);
    } catch (error) {
      console.error("Failed to load candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;
    try {
      await deleteCandidate(id);
      setCandidates(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Failed to delete candidate:", error);
    }
  };

  const handleScheduleInterview = (candidateId: string) => {
    setSelectedForInterview(candidateId);
    setShowScheduleModal(true);
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map((c) => c.id));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Candidates</h1>
          <p className="text-white/50">Manage and track all your candidates in one place.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Candidate
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
        >
          <option value="all" className="bg-gray-900">All Status</option>
          <option value="pending" className="bg-gray-900">Pending</option>
          <option value="interviewed" className="bg-gray-900">Interviewed</option>
          <option value="review" className="bg-gray-900">In Review</option>
          <option value="hired" className="bg-gray-900">Hired</option>
          <option value="rejected" className="bg-gray-900">Rejected</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedCandidates.length > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
          <span className="text-blue-400">{selectedCandidates.length} candidate(s) selected</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
              Export
            </button>
            <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors">
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table or Empty State */}
      {candidates.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-12 text-center">
          <UserX className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No candidates yet</h3>
          <p className="text-white/50 mb-6">Add your first candidate to get started with interviews.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Candidate
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded bg-white/5 border-white/20"
                    />
                  </th>
                  <th className="text-left text-sm font-medium text-white/50 p-4">Candidate</th>
                  <th className="text-left text-sm font-medium text-white/50 p-4">Position</th>
                  <th className="text-left text-sm font-medium text-white/50 p-4">Status</th>
                  <th className="text-left text-sm font-medium text-white/50 p-4">AI Score</th>
                  <th className="text-left text-sm font-medium text-white/50 p-4">Date Added</th>
                  <th className="text-left text-sm font-medium text-white/50 p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => toggleSelect(candidate.id)}
                        className="w-4 h-4 rounded bg-white/5 border-white/20"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-medium">
                          {getInitials(candidate.name)}
                        </div>
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-sm text-white/50">{candidate.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white/70">{candidate.position}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${statusColors[candidate.status] || statusColors.pending}`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {candidate.score ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                candidate.score >= 90 ? "bg-green-500" : candidate.score >= 80 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${candidate.score}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${
                            candidate.score >= 90 ? "text-green-400" : candidate.score >= 80 ? "text-yellow-400" : "text-red-400"
                          }`}>
                            {candidate.score}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                    <td className="p-4 text-white/50">{formatDate(candidate.created_at)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/candidates/${candidate.id}`}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleScheduleInterview(candidate.id)}
                          className="p-2 rounded-lg hover:bg-blue-500/20 transition-colors text-white/50 hover:text-blue-400"
                          title="Schedule interview"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(candidate.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-white/50 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Results count */}
          <div className="p-4 border-t border-white/5">
            <p className="text-sm text-white/50">
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddCandidateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadCandidates();
        }}
      />
      <ScheduleInterviewModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedForInterview(undefined);
        }}
        onSuccess={() => {
          setShowScheduleModal(false);
          setSelectedForInterview(undefined);
        }}
        preselectedCandidateId={selectedForInterview}
      />
    </div>
  );
}
