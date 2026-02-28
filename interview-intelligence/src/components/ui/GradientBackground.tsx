"use client";

import { motion } from "framer-motion";

export const GradientBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-black">
      {/* Primary Gradient Orb */}
      <motion.div
        animate={{
          x: ["-25%", "25%", "-25%"],
          y: ["-25%", "25%", "-25%"],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-[80vw] h-[80vw] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"
      />

      {/* Secondary Gradient Orb */}
      <motion.div
        animate={{
          x: ["25%", "-25%", "25%"],
          y: ["25%", "-25%", "25%"],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-0 w-[80vw] h-[80vw] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"
      />
      
      {/* Tertiary Gradient Orb */}
      <motion.div
        animate={{
          x: ["-10%", "10%", "-10%"],
          y: ["10%", "-10%", "10%"],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen"
      />

      {/* Noise Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
    </div>
  );
};
