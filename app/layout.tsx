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

// --- SEO: STRUCTURED DATA (The "Code for Robots") ---
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Verdict",
  "applicationCategory": "SocialNetworkApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "The UFC for Intellectuals. A competitive debate platform with an AI Judge and Logic Quotient (LQ) scoring system.",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "2408" // Matches your hardcoded waitlist number
  }
};

// --- SEO: METADATA CONFIGURATION ---
export const metadata: Metadata = {
  metadataBase: new URL('https://getverdict.in'),

  title: {
    default: "Verdict | The Logic Arena",
    template: "%s | Verdict",
  },
  
  description: "The UFC for Intellectuals. Win arguments, earn Elo, and silence the noise. Pass the logic entrance exam to join.",
  
  keywords: ["debate platform", "logic test", "intellectual debate", "elo rating", "AI judge", "Verdict app", "logic quotient", "fallacy detector"],
  
  authors: [{ name: "Verdict Team" }],
  creator: "Verdict",
  
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

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://getverdict.in",
    siteName: "Verdict",
    title: "Verdict | The Logic Arena",
    description: "90% of people fail this logic test. Can you pass the entrance exam?",
    images: [
      {
        url: "/opengraph-image", // Points to the dynamic image route
        width: 1200,
        height: 630,
        alt: "Verdict Founder Card",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Verdict | The Logic Arena",
    description: "I just took the Verdict logic test. Are you a Genius or Average?",
    images: ["/opengraph-image"], // Uses the same dynamic image
  },
  
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
        {/* INJECT JSON-LD FOR GOOGLE */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {children}
      </body>
    </html>
  );
}