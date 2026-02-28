"use client";

import { useState } from "react";
import Link from "next/link";

// Mock candidates data
const candidatesData = [
  { id: 1, name: "Sarah Johnson", email: "sarah.j@email.com", position: "Senior Developer", status: "interviewed", score: 92, date: "2024-01-15", avatar: "SJ" },
  { id: 2, name: "Michael Chen", email: "m.chen@email.com", position: "Product Manager", status: "interviewed", score: 88, date: "2024-01-14", avatar: "MC" },
  { id: 3, name: "Emily Davis", email: "emily.d@email.com", position: "UX Designer", status: "hired", score: 95, date: "2024-01-14", avatar: "ED" },
  { id: 4, name: "James Wilson", email: "j.wilson@email.com", position: "Data Scientist", status: "review", score: 85, date: "2024-01-13", avatar: "JW" },
  { id: 5, name: "Lisa Anderson", email: "l.anderson@email.com", position: "DevOps Engineer", status: "interviewed", score: 91, date: "2024-01-13", avatar: "LA" },
  { id: 6, name: "Robert Taylor", email: "r.taylor@email.com", position: "Backend Developer", status: "pending", score: null, date: "2024-01-12", avatar: "RT" },
  { id: 7, name: "Jennifer Martinez", email: "j.martinez@email.com", position: "Frontend Developer", status: "pending", score: null, date: "2024-01-12", avatar: "JM" },
  { id: 8, name: "David Brown", email: "d.brown@email.com", position: "ML Engineer", status: "rejected", score: 72, date: "2024-01-11", avatar: "DB" },
  { id: 9, name: "Amanda White", email: "a.white@email.com", position: "QA Engineer", status: "interviewed", score: 89, date: "2024-01-10", avatar: "AW" },
  { id: 10, name: "Christopher Lee", email: "c.lee@email.com", position: "System Architect", status: "hired", score: 97, date: "2024-01-09", avatar: "CL" },
];

const statusColors: Record<string, string> = {
  pending: "bg-gray-500/10 text-gray-400",
  interviewed: "bg-blue-500/10 text-blue-400",
  review: "bg-yellow-500/10 text-yellow-400",
  hired: "bg-green-500/10 text-green-400",
  rejected: "bg-red-500/10 text-red-400",
};

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);

  const filteredCandidates = candidatesData.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: number) => {
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Candidates</h1>
          <p className="text-white/50">Manage and track all your candidates in one place.</p>
        </div>
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Candidate
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
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
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="interviewed">Interviewed</option>
          <option value="review">In Review</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
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

      {/* Table */}
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
                <th className="text-left text-sm font-medium text-white/50 p-4">Date</th>
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
                        {candidate.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-white/50">{candidate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-white/70">{candidate.position}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[candidate.status]}`}>
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
                  <td className="p-4 text-white/50">{candidate.date}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/candidates/${candidate.id}`} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-white/50 hover:text-red-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between">
          <p className="text-sm text-white/50">
            Showing {filteredCandidates.length} of {candidatesData.length} candidates
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm">1</button>
            <button className="px-4 py-2 rounded-lg bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
