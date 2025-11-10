import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
import { Toaster } from "sonner";
import { LoadingProvider } from "@/components/providers/loading-provider";

export const runtime = 'edge';
import { AuthSessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Reporposely - AI-Powered Content Repurposing Platform",
  description: "Transform your content across multiple platforms with AI-powered repurposing. Create optimized posts for Twitter, LinkedIn, Instagram, and Email in seconds.",
  keywords: ["content repurposing", "AI content", "social media", "content creation", "multi-platform", "Reporposely"],
  authors: [{ name: "Reporposely Team" }],
  creator: "Reporposely",
  publisher: "Reporposely",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://reporposely.com",
    title: "Reporposely - AI-Powered Content Repurposing Platform",
    description: "Transform your content across multiple platforms with AI-powered repurposing. Create optimized posts for Twitter, LinkedIn, Instagram, and Email in seconds.",
    siteName: "Reporposely",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reporposely - AI-Powered Content Repurposing Platform",
    description: "Transform your content across multiple platforms with AI-powered repurposing. Create optimized posts for Twitter, LinkedIn, Instagram, and Email in seconds.",
    creator: "@reporposely",
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
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <ThemeScript />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: ` (function(c,l,a,r,i,t,y){ c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)}; t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i; y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y); })(window, document, "clarity", "script", "u3r5sm1qmt");`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <AuthSessionProvider>
          <ThemeProvider
            defaultTheme="system"
            storageKey="ui-theme"
          >
            <LoadingProvider>
              {children}
              <Toaster richColors />
            </LoadingProvider>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
