import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WebVitalsProvider } from '@/components/WebVitalsProvider'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary, AsyncErrorBoundary } from '@/components/error-boundary'
import { HeroUIProvider } from "@heroui/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
});

export const metadata: Metadata = {
  title: "Meraki Reach - AI-Powered Video Outreach",
  description: "Create personalized video outreach campaigns with AI-powered voice cloning and automated prospect targeting",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script
          async
          defer
          src="https://js.whop.com/static/checkout/loader.js"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HeroUIProvider>
          <ErrorBoundary>
            <AsyncErrorBoundary>
              <AuthProvider>
                <WebVitalsProvider>
                  <SubscriptionProvider>
                    {children}
                  </SubscriptionProvider>
                </WebVitalsProvider>
              </AuthProvider>
            </AsyncErrorBoundary>
          </ErrorBoundary>
        </HeroUIProvider>
      </body>
    </html>
  );
}
