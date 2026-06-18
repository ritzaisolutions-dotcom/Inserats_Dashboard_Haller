import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DashboardShell } from "@/components/DashboardShell";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Haller Verwaltungssystem",
  description: "Internes Verwaltungssystem — Haller Immobilienberatung GmbH",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ToastProvider>
          <DashboardShell>{children}</DashboardShell>
        </ToastProvider>
      </body>
    </html>
  );
}
