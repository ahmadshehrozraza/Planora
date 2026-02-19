import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { QueryProviders } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { WebVitals } from "@/components/WebVitals";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    preload: true,
  });

export const metadata: Metadata = {
  title: "Planora",
  description: "A Software Project Management Tool",
  // icons: "/Planora_Logo_shadow.png"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(inter.className, "antialiased min-h-screen")}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        <QueryProviders>
          <Toaster />
          <WebVitals />
        {children}
        </QueryProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}