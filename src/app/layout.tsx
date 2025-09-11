import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WebVitalsProvider } from '@/components/WebVitalsProvider'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'

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
  title: "Loom.ai - AI-Powered Video Outreach",
  description: "Create personalized video outreach campaigns with AI-powered voice cloning and automated prospect targeting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
        <WebVitalsProvider>
          <SubscriptionProvider>
            {children}
          </SubscriptionProvider>
        </WebVitalsProvider>
      </body>
    </html>
  );
}
