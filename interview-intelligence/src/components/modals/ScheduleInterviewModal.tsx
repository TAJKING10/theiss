"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createInterview } from "@/lib/actions/interviews";
import { getCandidates } from "@/lib/actions/candidates";
import type { Candidate } from "@/lib/supabase/types";

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedCandidateId?: string;
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedCandidateId
}: ScheduleInterviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [formData, setFormData] = useState({
    candidate_id: preselectedCandidateId || "",
    title: "",
    scheduled_date: "",
    scheduled_time: "",
    duration_minutes: "60",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadCandidates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedCandidateId) {
      setFormData(prev => ({ ...prev, candidate_id: preselectedCandidateId }));
    }
  }, [preselectedCandidateId]);

  const loadCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const data = await getCandidates();
      setCandidates(data);
    } catch (err) {
      console.error("Failed to load candidates:", err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.candidate_id) {
      setError("Please select a candidate");
      return;
    }

    if (!formData.scheduled_date || !formData.scheduled_time) {
      setError("Please select date and time");
      return;
    }

    setLoading(true);

    try {
      const scheduledAt = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`).toISOString();
      const selectedCandidate = candidates.find(c => c.id === formData.candidate_id);
      const title = formData.title || `Interview with ${selectedCandidate?.name || "Candidate"}`;

      await createInterview({
        candidate_id: formData.candidate_id,
        title,
        scheduled_at: scheduledAt,
        duration_minutes: parseInt(formData.duration_minutes),
        notes: formData.notes || null,
      });

      setFormData({
        candidate_id: "",
        title: "",
        scheduled_date: "",
        scheduled_time: "",
        duration_minutes: "60",
        notes: "",
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule interview");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">Schedule Interview</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Candidate *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <select
                    name="candidate_id"
                    value={formData.candidate_id}
                    onChange={handleChange}
                    required
                    disabled={loadingCandidates}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-gray-900">
                      {loadingCandidates ? "Loading candidates..." : "Select a candidate"}
                    </option>
                    {candidates.map(candidate => (
                      <option key={candidate.id} value={candidate.id} className="bg-gray-900">
                        {candidate.name} - {candidate.position}
                      </option>
                    ))}
                  </select>
                </div>
                {candidates.length === 0 && !loadingCandidates && (
                  <p className="text-xs text-yellow-400 mt-1">
                    No candidates found. Add a candidate first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Interview Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
                  placeholder="e.g., Technical Interview Round 1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="date"
                      name="scheduled_date"
                      value={formData.scheduled_date}
                      onChange={handleChange}
                      min={today}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Time *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="time"
                      name="scheduled_time"
                      value={formData.scheduled_time}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Duration
                </label>
                <select
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                >
                  <option value="30" className="bg-gray-900">30 minutes</option>
                  <option value="45" className="bg-gray-900">45 minutes</option>
                  <option value="60" className="bg-gray-900">1 hour</option>
                  <option value="90" className="bg-gray-900">1.5 hours</option>
                  <option value="120" className="bg-gray-900">2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Notes
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 resize-none"
                    placeholder="Interview focus areas, special instructions..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={loading}
                  disabled={candidates.length === 0}
                >
                  Schedule Interview
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
