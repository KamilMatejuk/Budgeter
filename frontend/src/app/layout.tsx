import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Budgeter",
  description: "Helps you manage your budget effectively",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        // only suppress warnings one-level deeper (only body),
        // typically caused by extensions.
        // https://stackoverflow.com/a/75339011/6645624
        suppressHydrationWarning
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
