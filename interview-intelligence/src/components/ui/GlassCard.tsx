"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "accent";
}

const variants = {
  default:
    "bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/20",
  elevated:
    "bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-blue-500/30",
  accent:
    "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40",
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{
          y: -5,
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
        }}
        className={cn(
          "relative rounded-3xl p-6 transition-colors duration-300 overflow-hidden",
          variants[variant],
          className
        )}
        {...props}
      >
        <div className="relative z-10">{children}</div>
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        
        {/* Hover glow effect */}
        <div className="absolute -inset-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-sm" />
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";
