"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary:
    "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] border border-transparent",
  secondary:
    "bg-white/10 text-white hover:bg-white/20 border border-white/5 backdrop-blur-sm",
  outline:
    "bg-transparent border border-white/20 text-white hover:bg-white/5 hover:border-white/40",
  ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
  link: "text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline p-0 h-auto",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-14 px-8 text-lg",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        suppressHydrationWarning
        className={cn(
          "relative inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {/* Glow effect for primary buttons */}
        {variant === "primary" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
        )}
        
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
