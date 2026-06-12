import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Apfluence | Influencer Marketing on Autopilot",
  description:
    "Build valuable partnerships to grow your business with our AI-powered influencer marketing platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        "font-sans",
        "font-manrope",
        "font-plus-jakarta",
      )}
    >
      <body className="min-h-screen flex flex-col overflow-x-hidden w-full max-w-full">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
