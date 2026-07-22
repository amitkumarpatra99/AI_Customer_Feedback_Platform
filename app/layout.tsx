import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner"; // 👈 Sonner import kiya
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
  title: "Project LOOP | AI Customer Feedback Intelligence",
  description: "Analyze, categorize, and act on customer feedback with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        
        {/* 👇 Global Toaster Component (Dark theme, top-right position) */}
        <Toaster 
          theme="dark" 
          position="top-right" 
          richColors 
          closeButton
        />
      </body>
    </html>
  );
}