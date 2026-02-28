import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    title: "Wav2Vec 2.0 for Speech Analysis in Interviews",
    authors: "Speech Processing Team",
    date: "2023",
    abstract: "Leveraging self-supervised learning for speech representation to analyze candidate communication patterns and vocal confidence indicators.",
    tags: ["Speech Processing", "Self-Supervised Learning", "NLP"],
  },
];

const methodology = [
  {
    step: "01",
    title: "Data Collection",
    description: "Secure, consent-based collection of interview video, audio, and transcripts with end-to-end encryption.",
    icon: "🔐",
  },
  {
    step: "02",
    title: "Multimodal Processing",
    description: "Parallel analysis using CNN for visual cues, Wav2Vec 2.0 for speech, and BERT for language understanding.",
    icon: "🧠",
  },
  {
    step: "03",
    title: "Fusion & Analysis",
    description: "Advanced multimodal fusion combines all signals to generate comprehensive, bias-aware assessments.",
    icon: "🔮",
  },
  {
    step: "04",
    title: "Fairness Validation",
    description: "Continuous monitoring and validation against fairness metrics across all demographic groups.",
    icon: "⚖️",
  },
];

const ethicalPrinciples = [
  {
    title: "Transparency",
    description: "We openly share how our AI makes decisions, providing explainable insights for every assessment.",
    icon: "👁",
  },
  {
    title: "Fairness",
    description: "Our models are rigorously tested and calibrated to ensure equitable treatment across all demographics.",
    icon: "⚖️",
  },
  {
    title: "Privacy",
    description: "Interview data is encrypted, anonymized, and never used for training without explicit consent.",
    icon: "🔒",
  },
  {
    title: "Human Oversight",
    description: "AI provides recommendations, but hiring decisions always remain with human professionals.",
    icon: "🤝",
  },
];

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-50" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-2 rounded-full text-xs md:text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-6">
            RESEARCH & METHODOLOGY
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 md:mb-8">
            Building Ethical
            <br />
            <span className="gradient-text">AI for Hiring</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Our research focuses on developing fair, transparent, and effective AI systems
            that help organizations make better hiring decisions while reducing bias.
          </p>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Methodology</h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              A rigorous, science-driven approach to interview analysis that prioritizes
              fairness and accuracy at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {methodology.map((item, index) => (
              <div
                key={item.step}
                className="relative p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-6xl font-bold text-white/5 absolute top-4 right-4 group-hover:text-white/10 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                {index < methodology.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 text-white/20">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Our AI Models</h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              State-of-the-art deep learning models working together to provide
              comprehensive interview analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CNN */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-3xl">
                  🧠
                </div>
                <div>
                  <h3 className="text-2xl font-bold">CNN</h3>
                  <p className="text-blue-400">Visual Analysis</p>
                </div>
              </div>
              <p className="text-white/60 leading-relaxed mb-4">
                Convolutional Neural Networks analyze visual cues from video frames,
                including body language, facial expressions, and engagement levels.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs">Computer Vision</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs">Expression Analysis</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs">Body Language</span>
              </div>
            </div>

            {/* Wav2Vec */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center text-3xl">
                  🎙
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Wav2Vec 2.0</h3>
                  <p className="text-green-400">Speech Processing</p>
                </div>
              </div>
              <p className="text-white/60 leading-relaxed mb-4">
                Self-supervised speech recognition model that analyzes vocal patterns,
                confidence indicators, and communication clarity.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">Speech Recognition</span>
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">Tone Analysis</span>
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">Confidence Detection</span>
              </div>
            </div>

            {/* BERT */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-3xl">
                  📝
                </div>
                <div>
                  <h3 className="text-2xl font-bold">BERT</h3>
                  <p className="text-purple-400">Language Understanding</p>
                </div>
              </div>
              <p className="text-white/60 leading-relaxed mb-4">
                Bidirectional transformer model for deep language understanding,
                analyzing response quality, relevance, and communication skills.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs">NLP</span>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs">Semantic Analysis</span>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs">Context Understanding</span>
              </div>
            </div>

            {/* Multimodal Fusion */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-3xl">
                  🔮
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Multimodal Fusion</h3>
                  <p className="text-orange-400">Combined Intelligence</p>
                </div>
              </div>
              <p className="text-white/60 leading-relaxed mb-4">
                Advanced fusion layer that combines insights from all modalities
                to generate holistic, bias-aware candidate assessments.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs">Cross-Modal Learning</span>
                <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs">Attention Mechanisms</span>
                <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs">Fairness Constraints</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ethics Section */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ethical AI Principles</h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Our commitment to building AI that is fair, transparent, and beneficial to all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ethicalPrinciples.map((principle) => (
              <div
                key={principle.title}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all text-center"
              >
                <div className="text-4xl mb-4">{principle.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{principle.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Papers */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Research Publications</h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Peer-reviewed research driving the future of fair hiring technology.
            </p>
          </div>

          <div className="space-y-6">
            {researchPapers.map((paper, index) => (
              <div
                key={index}
                className="p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{paper.title}</h3>
                    <p className="text-white/50 text-sm">{paper.authors} • {paper.date}</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors whitespace-nowrap">
                    Read Paper
                  </button>
                </div>
                <p className="text-white/60 mb-4">{paper.abstract}</p>
                <div className="flex flex-wrap gap-2">
                  {paper.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-white/50 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Join Our Research Mission
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-2xl mx-auto">
            We&apos;re always looking for talented researchers and engineers passionate about
            building fair AI systems.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Get Started
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 text-white font-medium text-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
