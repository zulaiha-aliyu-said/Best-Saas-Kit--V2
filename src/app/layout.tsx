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

export const metadata: Metadata = {
  title: "AI SAAS Kit - Build AI-Powered Applications in Minutes",
  description: "The ultimate toolkit for developers to create, customize, and launch AI-powered SAAS applications with authentication, payments, and modern UI components.",
  keywords: ["AI", "SAAS", "Next.js", "TypeScript", "Tailwind CSS", "ShadCN", "OpenRouter", "Clerk", "Neon"],
  authors: [{ name: "AI SAAS Kit Team" }],
  creator: "AI SAAS Kit",
  publisher: "AI SAAS Kit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aisaaskit.com",
    title: "AI SAAS Kit - Build AI-Powered Applications in Minutes",
    description: "The ultimate toolkit for developers to create, customize, and launch AI-powered SAAS applications with authentication, payments, and modern UI components.",
    siteName: "AI SAAS Kit",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI SAAS Kit - Build AI-Powered Applications in Minutes",
    description: "The ultimate toolkit for developers to create, customize, and launch AI-powered SAAS applications with authentication, payments, and modern UI components.",
    creator: "@aisaaskit",
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
