import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EvidenceOS — AI Digital Evidence Analysis & Intelligence Platform",
  description:
    "Transform unstructured digital evidence into structured, traceable intelligence using Google Gemma 4.",
  keywords: [
    "digital forensics",
    "evidence intelligence",
    "Gemma 4",
    "graph intelligence",
    "contradiction detection",
    "verbatim citations",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark h-full antialiased ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-[#080d1a] font-sans text-slate-100 selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

