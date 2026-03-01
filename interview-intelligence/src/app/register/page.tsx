"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { User, Mail, Lock, ShieldCheck, LockKeyhole, ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register, loginWithGoogle, loginWithGithub, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      await register(name, email, password);
      setSuccess("Check your email to confirm your account!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up with Google");
    }
  };

  const handleGithubLogin = async () => {
    try {
      await loginWithGithub();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up with GitHub");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
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

        {/* Card */}
        <GlassCard variant="elevated" className="p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-white/50">Start your 14-day free trial</p>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              suppressHydrationWarning
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={handleGithubLogin}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              suppressHydrationWarning
            >
              <Github className="w-5 h-5" />
              GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black/50 backdrop-blur-sm text-white/50 rounded-full">Or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
              >
                {success}
              </motion.div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  placeholder="John Doe"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                Work email
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  placeholder="Min. 8 characters"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  placeholder="Confirm your password"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="w-4 h-4 mt-1 rounded bg-white/5 border-white/20 checked:bg-blue-500" required suppressHydrationWarning />
              <label htmlFor="terms" className="text-sm text-white/50">
                I agree to the{" "}
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</a>
              </label>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-12 text-lg"
            >
              Create account <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <LockKeyhole className="w-4 h-4 text-green-400" />
              256-bit encryption
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              SOC 2 Type II
            </span>
          </div>
        </GlassCard>

        <p className="text-center mt-8 text-white/50">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
