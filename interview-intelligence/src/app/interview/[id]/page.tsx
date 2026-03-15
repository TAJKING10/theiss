"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { GradientBackground } from "@/components/ui/GradientBackground";

export default function InterviewRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  useEffect(() => {
    // Redirect to the dashboard interview session
    router.push(`/dashboard/interviews/${interviewId}/session`);
  }, [interviewId, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <GradientBackground />
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-white/50">Redirecting to interview session...</p>
      </div>
    </div>
  );
}
