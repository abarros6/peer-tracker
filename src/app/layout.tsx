import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CustomCursor } from "@/components/CustomCursor";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#c9a227",
};

export const metadata: Metadata = {
  title: "Peer Tracker",
  description: "Track your goals with friends",
  applicationName: "Peer Tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Peer Tracker",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CustomCursor />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
