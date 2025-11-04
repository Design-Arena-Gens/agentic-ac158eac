import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DriverProvider } from "@/components/providers/driver-provider";
import { SyncIndicator } from "@/components/sync-indicator";

const inter = Inter({
  variable: "--font-driver-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Driver Helper",
  description: "Offline-first co-pilot built for Indian drivers",
  applicationName: "Driver Helper",
  manifest: "/manifest.json",
  authors: [{ name: "Driver Helper" }],
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <DriverProvider>
          <SyncIndicator />
          <main className="app-container">{children}</main>
        </DriverProvider>
      </body>
    </html>
  );
}
