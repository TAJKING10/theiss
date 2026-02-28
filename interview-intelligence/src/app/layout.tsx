import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Interview Intelligence | AI-Powered Fair Hiring",
  description: "Build fairer interviews with cutting-edge AI. Analyze candidate responses using CNN, Wav2Vec 2.0, BERT, and multimodal fusion for unbiased hiring decisions.",
  keywords: ["AI interviews", "fair hiring", "machine learning", "interview analysis"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-black text-white`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
