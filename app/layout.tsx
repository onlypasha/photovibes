import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhotoVibes — Photobooth",
  description: "A fun and playful photobooth web application. Capture memories with style!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-display antialiased bg-background-light text-neutral-dark min-h-screen">
        {children}
      </body>
    </html>
  );
}
