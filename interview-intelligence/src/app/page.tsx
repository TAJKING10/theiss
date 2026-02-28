"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Tech Stack Data
const techStack = {
  frontend: [
    { name: "Next.js", icon: "▲", description: "React Framework" },
    { name: "React", icon: "⚛", description: "UI Library" },
    { name: "Tailwind CSS", icon: "◈", description: "Styling" },
  ],
  backend: [
    { name: "Firebase", icon: "🔥", description: "Cloud Platform" },
    { name: "FastAPI", icon: "⚡", description: "Python API" },
  ],
  ai: [
    { name: "CNN", icon: "🧠", description: "Visual Analysis" },
    { name: "Wav2Vec 2.0", icon: "🎙", description: "Speech Processing" },
    { name: "BERT", icon: "📝", description: "NLP Understanding" },
    { name: "Multimodal Fusion", icon: "🔮", description: "Combined Intelligence" },
  ],
};

// Features Data
const features = [
  {
    title: "Real-time Analysis",
    description: "Get instant AI-powered insights during live interviews with our advanced multimodal analysis.",
    icon: "⚡",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Bias Detection",
    description: "Our AI actively identifies and flags potential biases to ensure fair evaluation of all candidates.",
    icon: "🛡",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Comprehensive Reports",
    description: "Generate detailed reports with actionable insights, scoring breakdowns, and improvement suggestions.",
    icon: "📊",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Secure & Private",
    description: "Enterprise-grade security with end-to-end encryption. Your data never leaves your control.",
    icon: "🔒",
    gradient: "from-orange-500 to-red-500",
  },
];

// Pricing Data
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
    features: ["Up to 200 interviews/month", "Advanced AI analysis", "Priority support", "Custom reports", "API access", "Team collaboration"],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with custom needs",
    features: ["Unlimited interviews", "Full AI suite", "24/7 dedicated support", "Custom integrations", "On-premise option", "SLA guarantee"],
    cta: "Contact Sales",
    popular: false,
  },
];

// Process Steps
const processSteps = [
  {
    step: "01",
    title: "Record Interview",
    description: "Conduct your interview as usual. Our AI captures video, audio, and transcripts in real-time.",
  },
  {
    step: "02",
    title: "AI Analysis",
    description: "Our multimodal AI analyzes verbal and non-verbal cues using CNN, BERT, and Wav2Vec 2.0.",
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-50" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-white/70">Now in Private Beta</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 md:mb-8">
            <span className="gradient-text">AI-Powered</span>
            <br />
            Interview Analysis
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-white/50 max-w-3xl mx-auto mb-10 md:mb-14 leading-relaxed">
            Leverage cutting-edge machine learning to analyze interviews fairly and objectively.
            Built for the future of ethical hiring.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 text-center"
            >
              Get Early Access
            </Link>
            <Link
              href="/research"
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 text-white font-medium text-lg hover:bg-white/5 transition-colors text-center"
            >
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "98%", label: "Accuracy Rate" },
              { value: "50K+", label: "Interviews Analyzed" },
              { value: "200+", label: "Companies" },
              { value: "4.9/5", label: "User Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem & Process Section */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <span className="inline-block px-4 py-2 rounded-full text-xs md:text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-6">
              THE PROBLEM
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
              Traditional Interviews Are
              <br />
              <span className="gradient-text">Inherently Biased</span>
            </h2>
            <p className="text-lg md:text-xl text-white/50 max-w-3xl mx-auto">
              Studies show that unconscious bias affects 79% of hiring decisions.
              Our AI helps you see candidates for their true potential.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {processSteps.map((step, index) => (
              <div
                key={step.step}
                className="relative p-6 md:p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 group"
              >
                <div className="text-5xl md:text-6xl font-bold text-white/5 absolute top-4 right-4 group-hover:text-white/10 transition-colors">
                  {step.step}
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                </div>
                {index < processSteps.length - 1 && (
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

      {/* Features Section */}
      <section id="features" className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <span className="inline-block px-4 py-2 rounded-full text-xs md:text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6">
              FEATURES
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
              Everything You Need for
              <br />
              <span className="gradient-text">Fair Hiring</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-8 md:p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="text-4xl md:text-5xl mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-white/50 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 md:mt-24 p-4 md:p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
            <div className="aspect-video rounded-2xl bg-black/50 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-white/50">Interactive Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <span className="inline-block px-4 py-2 rounded-full text-xs md:text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20 mb-6">
              RESEARCH & TECHNOLOGY
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight">
              Built with Modern Tech
            </h2>
            <p className="text-base md:text-xl text-white/50 max-w-2xl mx-auto">
              Our stack combines the best of web development with state-of-the-art AI models
            </p>
          </div>

          {/* Frontend Stack */}
          <div className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
              <h3 className="text-xl md:text-2xl font-semibold text-white/90">Frontend</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {techStack.frontend.map((tech) => (
                <div key={tech.name} className="tech-badge rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center gap-3 cursor-pointer">
                  <span className="text-3xl md:text-4xl">{tech.icon}</span>
                  <span className="font-semibold text-white/90">{tech.name}</span>
                  <span className="text-xs text-white/50">{tech.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Backend Stack */}
          <div className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full" />
              <h3 className="text-xl md:text-2xl font-semibold text-white/90">Backend</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl">
              {techStack.backend.map((tech) => (
                <div key={tech.name} className="tech-badge rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center gap-3 cursor-pointer">
                  <span className="text-3xl md:text-4xl">{tech.icon}</span>
                  <span className="font-semibold text-white/90">{tech.name}</span>
                  <span className="text-xs text-white/50">{tech.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Models */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
              <h3 className="text-xl md:text-2xl font-semibold text-white/90">AI Models</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {techStack.ai.map((tech) => (
                <div key={tech.name} className="tech-badge rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer">
                  <span className="text-4xl md:text-5xl">{tech.icon}</span>
                  <span className="font-semibold text-lg text-white/90">{tech.name}</span>
                  <span className="text-sm text-white/50 text-center">{tech.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Visualization */}
          <div className="mt-12 md:mt-16 p-6 md:p-10 rounded-3xl glass border border-white/5">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center lg:text-left">
                <h4 className="text-2xl md:text-3xl font-bold mb-4">Multimodal Fusion Pipeline</h4>
                <p className="text-white/50 text-base md:text-lg max-w-lg">
                  Our AI combines visual, audio, and textual analysis to provide comprehensive,
                  unbiased interview assessments.
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center">
                <div className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">Video → CNN</div>
                <span className="text-white/30">+</span>
                <div className="px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">Audio → Wav2Vec</div>
                <span className="text-white/30">+</span>
                <div className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">Text → BERT</div>
                <span className="text-white/30">=</span>
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium">Fusion</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <span className="inline-block px-4 py-2 rounded-full text-xs md:text-sm font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-6">
              PRICING
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
              Simple, Transparent
              <br />
              <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-3xl ${
                  plan.popular
                    ? "bg-gradient-to-b from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30"
                    : "bg-white/[0.02] border border-white/5"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-white/50 text-sm">{plan.description}</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-bold">{plan.price === "Custom" ? "" : "$"}{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-white/50">/month</span>}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full py-4 rounded-xl text-center font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl md:rounded-[40px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20" />
            <div className="absolute inset-0 glass" />
            <div className="absolute top-10 left-10 w-32 h-32 md:w-64 md:h-64 bg-blue-500/30 rounded-full blur-[80px] animate-float" />
            <div className="absolute bottom-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-purple-500/30 rounded-full blur-[60px] animate-float" style={{ animationDelay: "-3s" }} />

            <div className="relative z-10 px-6 py-16 md:px-16 md:py-24 text-center">
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 md:mb-8">
                Build Fairer Interviews
                <br />
                <span className="gradient-text">with AI</span>
              </h2>

              <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto mb-10 md:mb-12">
                Join the future of ethical hiring. Get early access to our AI-powered interview
                analysis platform and transform your recruitment process.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="group w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-full bg-white text-black font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 flex items-center justify-center gap-2"
                >
                  Request Access
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/research"
                  className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-full border border-white/30 text-white font-medium text-lg hover:bg-white/10 transition-colors text-center"
                >
                  Learn More
                </Link>
              </div>

              <div className="mt-12 md:mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-white/40 text-sm">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  SOC 2 Compliant
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Enterprise Security
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  GDPR Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
