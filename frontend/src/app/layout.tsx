import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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
        className={"antialiased h-screen flex"}
        // only suppress warnings one-level deeper (only body),
        // typically caused by extensions.
        // https://stackoverflow.com/a/75339011/6645624
        suppressHydrationWarning
      >
        <Sidebar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
