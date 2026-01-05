import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Set the Base URL so social images work everywhere
export const metadata: Metadata = {
  metadataBase: new URL('https://getverdict.in'),

  // 2. Title Template (Good for inner pages later)
  title: {
    default: "Verdict | The Logic Arena",
    template: "%s | Verdict",
  },
  
  // 3. The "Hook" Description for Google Search Results
  description: "The UFC for Intellectuals. Win arguments, earn Elo, and silence the noise. Pass the logic entrance exam to join.",
  
  // 4. Keywords for SEO Indexing
  keywords: ["debate platform", "logic test", "intellectual debate", "elo rating", "AI judge", "Verdict app", "logic quotient"],
  
  // 5. Author info
  authors: [{ name: "Verdict Team" }],
  creator: "Verdict",
  
  // 6. Robots Control (Crucial for Google)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 7. Open Graph (Facebook, LinkedIn, Discord previews)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://getverdict.in",
    siteName: "Verdict",
    title: "Verdict | The Logic Arena",
    description: "90% of people fail this logic test. Can you pass the entrance exam?",
    images: [
      {
        url: "/og-image.png", // Uses the dynamic image we created
        width: 1200,
        height: 630,
        alt: "Verdict Founder Card",
      },
    ],
  },

  // 8. Twitter Card (X previews)
  twitter: {
    card: "summary_large_image",
    title: "Verdict | The Logic Arena",
    description: "I just took the Verdict logic test. Are you a Genius or Average?",
    images: ["/og-image.png"],
    creator: "@your_handle", // Replace with your actual Twitter handle if you have one
  },
  
  // 9. Icons (Optional, but good for SEO completeness)
  icons: {
    icon: "/icon.png", 
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050505]`}
      >
        {children}
      </body>
    </html>
  );
}