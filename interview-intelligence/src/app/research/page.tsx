"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Database, 
  BrainCircuit, 
  Sparkles, 
  Scale, 
  Eye, 
  ShieldCheck, 
  Users, 
  FileText,
  ArrowRight,
  BookOpen,
  Calendar
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { Button } from "@/components/ui/Button";

const researchPapers = [
  {
    title: "Multimodal Fusion for Fair Interview Analysis",
    authors: "Interview Intelligence Research Team",
    date: "2024",
    abstract: "We present a novel approach to interview analysis using multimodal fusion of video, audio, and text signals to provide unbiased candidate assessments.",
    tags: ["Multimodal AI", "Fairness", "Deep Learning"],
  },
  {
    title: "Reducing Bias in Automated Interview Systems",
    authors: "AI Ethics Lab",
    date: "2024",
    abstract: "This paper explores methods for detecting and mitigating unconscious bias in AI-powered interview systems, ensuring equitable evaluation across all demographics.",
    tags: ["Ethics", "Bias Mitigation", "ML Fairness"],
  },
  {
    title: "Advanced Speech Analysis in Interviews",
    authors: "Speech Processing Team",
    date: "2023",
    abstract: "Leveraging advanced speech representation to analyze candidate communication patterns and vocal confidence indicators.",
    tags: ["Speech Processing", "Audio Analysis", "Communication"],
  },
];

const methodology = [
  {
    step: "01",
    title: "Data Collection",
    description: "Secure, consent-based collection of interview video, audio, and transcripts with end-to-end encryption.",
    icon: Database,
  },
  {
    step: "02",
    title: "Multimodal Processing",
    description: "Parallel analysis of visual cues, speech patterns, and language understanding.",
    icon: BrainCircuit,
  },
  {
    step: "03",
    title: "Fusion & Analysis",
    description: "Advanced multimodal fusion combines all signals to generate comprehensive, bias-aware assessments.",
    icon: Sparkles,
  },
  {
    step: "04",
    title: "Fairness Validation",
    description: "Continuous monitoring and validation against fairness metrics across all demographic groups.",
    icon: Scale,
  },
];

const ethicalPrinciples = [
  {
    title: "Transparency",
    description: "We openly share how our AI makes decisions, providing explainable insights for every assessment.",
    icon: Eye,
  },
  {
    title: "Fairness",
    description: "Our models are rigorously tested and calibrated to ensure equitable treatment across all demographics.",
    icon: Scale,
  },
  {
    title: "Privacy",
    description: "Interview data is encrypted, anonymized, and never used for training without explicit consent.",
    icon: ShieldCheck,
  },
  {
    title: "Human Oversight",
    description: "AI provides recommendations, but hiring decisions always remain with human professionals.",
    icon: Users,
  },
];

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-purple-500/30">
      <GradientBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_10px_rgba(192,132,252,0.5)]" />
            <span className="text-sm font-medium text-purple-200">RESEARCH & METHODOLOGY</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight"
          >
            Building Ethical
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
              AI for Hiring
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed"
          >
            Our research focuses on developing fair, transparent, and effective AI systems
            that help organizations make better hiring decisions while reducing bias.
          </motion.p>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Methodology</h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              A rigorous, science-driven approach to interview analysis that prioritizes
              fairness and accuracy at every step.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {methodology.map((item, index) => (
              <GlassCard
                key={item.step}
                variant="default"
                className="group relative pt-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="absolute top-6 left-6 p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-colors">
                  <item.icon className="w-6 h-6 text-white group-hover:text-purple-400 transition-colors" />
                </div>
                <div className="text-6xl font-bold text-white/5 absolute top-4 right-4 group-hover:text-white/10 transition-colors select-none">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3 mt-4">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Our AI Models</h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              State-of-the-art deep learning models working together to provide
              comprehensive interview analysis.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Visual Analysis */}
            <GlassCard variant="elevated" className="p-8 md:p-10 border-l-4 border-l-blue-500">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Eye className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Visual Analysis</h3>
                  <p className="text-blue-400 font-medium">Non-verbal Cues</p>
                </div>
              </div>
              <p className="text-white/60 leading-relaxed mb-6 text-lg">
                Advanced computer vision systems analyze visual signals from video frames,
                including body language, facial expressions, and engagement levels.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Computer Vision", "Expression Analysis", "Body Language"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* Speech Processing */}
            <GlassCard variant="elevated" className="p-8 md:p-10 border-l-4 border-l-green-500">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <BrainCircuit className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Speech Processing</h3>
                  <p className="text-green-400 font-medium">Vocal Patterns</p>
                </div>
              </div>
              <p className="text-white/60 leading-relaxed mb-6 text-lg">
                Sophisticated speech recognition systems that analyze vocal patterns,
                confidence indicators, and communication clarity.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Speech Analysis", "Tone Detection", "Confidence Metrics"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* Language Understanding */}
            <GlassCard variant="elevated" className="p-8 md:p-10 border-l-4 border-l-purple-500">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <FileText className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Language Understanding</h3>
                  <p className="text-purple-400 font-medium">Semantic Analysis</p>
                </div>
              </div>
              <p className="text-white/60 leading-relaxed mb-6 text-lg">
                Natural language processing systems for deep semantic understanding,
                analyzing response quality, relevance, and communication skills.
              </p>
              <div className="flex flex-wrap gap-2">
                {["NLP", "Semantic Analysis", "Context Understanding"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* Intelligence Fusion */}
            <GlassCard variant="elevated" className="p-8 md:p-10 border-l-4 border-l-orange-500">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Sparkles className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Multimodal Fusion</h3>
                  <p className="text-orange-400 font-medium">Combined Intelligence</p>
                </div>
              </div>
              <p className="text-white/60 leading-relaxed mb-6 text-lg">
                Advanced fusion layer that combines insights from all signals
                to generate holistic, bias-aware candidate assessments.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Signal Fusion", "Cross-Modal Analysis", "Fairness Metrics"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium border border-orange-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Ethics Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ethical AI Principles</h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Our commitment to building AI that is fair, transparent, and beneficial to all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ethicalPrinciples.map((principle) => (
              <GlassCard
                key={principle.title}
                className="text-center p-8 hover:bg-white/5 transition-colors"
                whileHover={{ y: -5 }}
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 text-white/80">
                  <principle.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{principle.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{principle.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Research Papers */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Research Publications</h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Peer-reviewed research driving the future of fair hiring technology.
            </p>
          </div>

          <div className="space-y-6">
            {researchPapers.map((paper, index) => (
              <GlassCard
                key={index}
                className="p-8 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{paper.title}</h3>
                    <p className="text-white/50 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" /> {paper.authors} • <Calendar className="w-4 h-4 ml-2" /> {paper.date}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Read Paper <BookOpen className="ml-2 w-4 h-4" />
                  </Button>
                </div>
                <p className="text-white/60 mb-6 leading-relaxed">{paper.abstract}</p>
                <div className="flex flex-wrap gap-2">
                  {paper.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-white/50 text-xs border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Join Our Research Mission
          </h2>
          <p className="text-xl text-white/50 mb-12 max-w-2xl mx-auto">
            We&apos;re always looking for talented researchers and engineers passionate about
            building fair AI systems.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
