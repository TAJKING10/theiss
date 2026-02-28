"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm md:text-lg">II</span>
            </div>
            <span className="font-bold text-lg md:text-xl hidden sm:block">Interview Intelligence</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</Link>
            <Link href="/#pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link href="/research" className="text-sm text-white/60 hover:text-white transition-colors">Research</Link>
            <Link href="/#contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full text-sm text-white/80 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-full text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full text-sm text-white/80 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/80"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <Link href="/#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</Link>
              <Link href="/#pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
              <Link href="/research" className="text-sm text-white/60 hover:text-white transition-colors">Research</Link>
              <Link href="/#contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</Link>
              <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link href="/dashboard" className="px-4 py-2 rounded-full text-sm text-center bg-white/10 text-white">Dashboard</Link>
                    <button onClick={logout} className="px-4 py-2 rounded-full text-sm bg-white text-black">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="px-4 py-2 rounded-full text-sm text-center bg-white/10 text-white">Sign In</Link>
                    <Link href="/register" className="px-4 py-2 rounded-full text-sm text-center bg-white text-black">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
