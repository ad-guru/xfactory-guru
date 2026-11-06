import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Office Lunch Poll",
  description: "Vote for today's lunch spot",
  icons: { icon: "./favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Self-hosted faces; a public/ stylesheet keeps font URLs relative under the proxy prefix. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="./fonts/fonts.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
