import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="relative border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-sm">II</span>
              </div>
              <span className="font-bold text-lg">Interview Intelligence</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              Building the future of fair and ethical AI-powered hiring.
            </p>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold text-white mb-4">About</h4>
            <ul className="space-y-3">
              <li><Link href="/research" className="text-white/50 hover:text-white text-sm transition-colors">Our Mission</Link></li>
              <li><Link href="/research" className="text-white/50 hover:text-white text-sm transition-colors">Team</Link></li>
              <li><Link href="/research" className="text-white/50 hover:text-white text-sm transition-colors">Careers</Link></li>
              <li><Link href="/research" className="text-white/50 hover:text-white text-sm transition-colors">Press</Link></li>
            </ul>
          </div>

          {/* Research */}
          <div>
            <h4 className="font-semibold text-white mb-4">Research</h4>
            <ul className="space-y-3">
              <li><Link href="/research" className="text-white/50 hover:text-white text-sm transition-colors">Publications</Link></li>
              <li><Link href="/research" className="text-white/50 hover:text-white text-sm transition-colors">Methodology</Link></li>
              <li><Link href="/research" className="text-white/50 hover:text-white text-sm transition-colors">Ethics</Link></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white text-sm transition-colors">Open Source</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li><Link href="/#contact" className="text-white/50 hover:text-white text-sm transition-colors">Support</Link></li>
              <li><Link href="/#contact" className="text-white/50 hover:text-white text-sm transition-colors">Sales</Link></li>
              <li><Link href="/#contact" className="text-white/50 hover:text-white text-sm transition-colors">Partners</Link></li>
              <li><Link href="/#contact" className="text-white/50 hover:text-white text-sm transition-colors">Media</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <p className="text-white/30 text-sm">
            © 2024 Interview Intelligence. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
