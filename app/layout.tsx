import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-context";
import { QueryProvider } from "@/context/query-context";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/hooks/use-toast-context";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fintrack.netlify.app"),
  title: "FinTrack - Personal Finance Tracker",
  description: "Track your expenses, manage recurring bills, and gain insights into your spending habits.",
  keywords: "personal finance, expense tracker, budget manager, financial dashboard",
  authors: [{ name: "Ranyll" }],
  creator: "Ranyll",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fintrack.netlify.app",
    title: "FinTrack - Personal Finance Tracker",
    description: "Track your expenses, manage recurring bills, and gain insights into your spending habits.",
    siteName: "FinTrack",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "FinTrack - Personal Finance Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FinTrack - Personal Finance Tracker",
    description: "Track your expenses, manage recurring bills, and gain insights into your spending habits.",
    images: ["/logo.png"]
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <ToastProvider>
                <TooltipProvider>
                  {children}
                </TooltipProvider>
              </ToastProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
