import "./globals.css";
import Sidebar from "@/components/sidebar/Sidebar";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { twMerge } from "tailwind-merge";


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
        <ReactQueryProvider>
          <div className={twMerge(
            "flex-1 overflow-auto w-full h-full p-4 pb-64 space-y-4",
            "md:[&::-webkit-scrollbar]:hidden md:[-ms-overflow-style:none] md:[scrollbar-width:none]",
          )}>
            {children}
          </div>
          <Sidebar />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
