"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const { resetPassword, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      <GradientBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-white font-bold text-xl">II</span>
          </div>
        </Link>

        <GlassCard variant="elevated" className="p-8 md:p-10">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-white/50 text-sm">
                We sent a password reset link to{" "}
                <span className="text-white/80 font-medium">{email}</span>.
                Check your inbox and click the link to reset your password.
              </p>
              <p className="text-white/30 text-xs">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  try again
                </button>.
              </p>
              <Link href="/login">
                <Button className="w-full mt-4">
                  Back to Sign In
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Reset password</h1>
                <p className="text-white/50 text-sm">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                      placeholder="you@company.com"
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full h-12 text-lg"
                >
                  Send reset link
                </Button>
              </form>
            </>
          )}
        </GlassCard>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white/70 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
