"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Shield, 
  FileText, 
  Lock, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  BarChart3, 
  Cpu, 
  ArrowRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { cn } from "@/lib/utils";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Data
const features = [
  {
    title: "Real-time Analysis",
    description: "Get instant AI-powered insights during live interviews with our advanced multimodal analysis.",
    icon: <Cpu className="w-8 h-8 text-blue-400" />,
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Bias Detection",
    description: "Our AI actively identifies and flags potential biases to ensure fair evaluation of all candidates.",
    icon: <Shield className="w-8 h-8 text-purple-400" />,
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "Comprehensive Reports",
    description: "Generate detailed reports with actionable insights, scoring breakdowns, and improvement suggestions.",
    icon: <FileText className="w-8 h-8 text-green-400" />,
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "Secure & Private",
    description: "Enterprise-grade security with end-to-end encryption. Your data never leaves your control.",
    icon: <Lock className="w-8 h-8 text-orange-400" />,
    gradient: "from-orange-500/20 to-red-500/20",
  },
];

const pricing = [
  {
    name: "Starter",
    price: "49",
    description: "Perfect for small teams getting started",
    features: ["Up to 50 interviews/month", "Basic AI analysis", "Email support", "Standard reports"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "149",
    description: "For growing teams that need more power",
    features: ["Up to 200 interviews/month", "Advanced AI analysis", "Priority support", "Custom reports", "API access"],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with custom needs",
    features: ["Unlimited interviews", "Full AI suite", "24/7 dedicated support", "Custom integrations", "SLA guarantee"],
    cta: "Contact Sales",
    popular: false,
  },
];

const processSteps = [
  {
    step: "01",
    title: "Record Interview",
    description: "Conduct your interview as usual. Our AI captures video, audio, and transcripts in real-time.",
  },
  {
    step: "02",
    title: "AI Analysis",
    description: "Our multimodal AI analyzes verbal and non-verbal cues to provide objective insights.",
  },
  {
    step: "03",
    title: "Generate Insights",
    description: "Receive comprehensive reports with fairness scores, strengths, and areas for growth.",
  },
  {
    step: "04",
    title: "Make Decisions",
    description: "Use data-driven insights to make unbiased hiring decisions with confidence.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-blue-500/30">
      <GradientBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
            <span className="text-sm font-medium text-white/80">Now in Private Beta</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight"
          >
            <span className="text-white">AI-Powered</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient-x bg-[length:200%_auto]">
              Interview Analysis
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Leverage cutting-edge machine learning to analyze interviews fairly and objectively.
            Built for the future of ethical hiring.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14">
                Get Early Access <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/research">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 h-14">
                View Methodology
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-20 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12"
          >
            {[
              { value: "98%", label: "Accuracy Rate" },
              { value: "50K+", label: "Interviews Analyzed" },
              { value: "200+", label: "Companies" },
              { value: "4.9/5", label: "User Rating" },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeIn} className="text-center group cursor-default">
                <div className="text-3xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-white/40">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem & Process Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
              Traditional Interviews Are
              <br />
              <span className="text-purple-400">Inherently Biased</span>
            </h2>
            <p className="text-lg md:text-xl text-white/50 max-w-3xl mx-auto">
              Studies show that unconscious bias affects 79% of hiring decisions.
              Our AI helps you see candidates for their true potential.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {processSteps.map((step, index) => (
              <GlassCard
                key={step.step}
                variant="default"
                className="group relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-6xl font-bold text-white/5 absolute top-4 right-4 group-hover:text-white/10 transition-colors select-none">
                  {step.step}
                </div>
                <div className="relative z-10 pt-4">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6 uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Everything You Need for
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Fair Hiring
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {features.map((feature, idx) => (
              <GlassCard
                key={feature.title}
                variant="elevated"
                className="group p-8 md:p-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className="relative z-10 flex flex-col items-start gap-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-white/50 leading-relaxed text-lg">{feature.description}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Simple Pricing
            </h2>
            <p className="text-white/50 text-lg">
              Choose the plan that fits your needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {pricing.map((plan, idx) => (
              <GlassCard
                key={plan.name}
                variant={plan.popular ? "accent" : "default"}
                className={cn(
                  "p-8",
                  plan.popular && "ring-2 ring-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.1)] scale-105 z-10"
                )}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-xs font-bold uppercase tracking-wider shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-white/50 text-sm">{plan.description}</p>
                </div>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-5xl font-bold">{plan.price === "Custom" ? "" : "$"}{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-white/50">/mo</span>}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    variant={plan.popular ? "primary" : "secondary"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <GlassCard variant="elevated" className="relative p-12 md:p-20 text-center overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-8">
                Ready to Transform Your Hiring?
              </h2>
              <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
                Join the future of ethical hiring. Get early access to our platform today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-16 px-10 text-lg">
                    Request Access
                  </Button>
                </Link>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}
