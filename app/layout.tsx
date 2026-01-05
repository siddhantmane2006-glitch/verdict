import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({ 
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-ibm'
});

export const metadata: Metadata = {
  title: "Verdict | The Logic Arena",
  description: "The UFC for Intellectuals. Win arguments, earn Elo, and silence the noise. Pass the entrance exam to join.",
  openGraph: {
    title: "Verdict | The Logic Arena",
    description: "90% of people fail this logic test. Can you pass the entrance exam?",
    url: 'https://getverdict.in',
    siteName: 'Verdict',
    images: [
      {
        url: 'https://getverdict.in/og-image.png', // We will generate this next
        width: 1200,
        height: 630,
        alt: 'Verdict Founder Card',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Verdict | The Logic Arena",
    description: "I just took the Verdict logic test. Are you a Genius or Average?",
    creator: '@your_handle', // Put your twitter handle here
    images: ['https://getverdict.in/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.variable} font-sans antialiased bg-[#050505]`}>
        {children}
      </body>
    </html>
  );
}