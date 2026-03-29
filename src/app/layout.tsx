import type { Metadata } from "next";
import { Outfit, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brain Buzz — Smart Caffeine Weekly Quiz",
  description:
    "Test your knowledge across 5 topics! Score high, earn badges, climb leaderboards, and share your results. New questions every week. Powered by Smart Caffeine.",
  openGraph: {
    title: "Brain Buzz — Smart Caffeine Weekly Quiz",
    description:
      "5 topics. 10 questions. One attempt. Can you top the leaderboard?",
    type: "website",
    url: "https://smartcaffeine.com/quiz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brain Buzz — Smart Caffeine Weekly Quiz",
    description:
      "5 topics. 10 questions. One attempt. Can you top the leaderboard?",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${outfit.variable} ${bricolage.variable}`}>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ fontFamily: "var(--font-outfit), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
