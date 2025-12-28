import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { AuthProvider } from "@/components/auth/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowCraft by Ventryx - Visual Mermaid Flowchart Editor",
  description: "Create, edit, and export beautiful flowcharts using Mermaid syntax. Free, offline-capable, no API required. Built by Ventryx.",
  keywords: ["flowchart", "mermaid", "diagram", "process map", "workflow", "visual editor", "ventryx"],
  manifest: "/manifest.json",
  authors: [{ name: "Ventryx" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FlowCraft",
  },
  openGraph: {
    title: "FlowCraft by Ventryx - Visual Mermaid Flowchart Editor",
    description: "Create beautiful flowcharts with Mermaid syntax. Built by Ventryx.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
