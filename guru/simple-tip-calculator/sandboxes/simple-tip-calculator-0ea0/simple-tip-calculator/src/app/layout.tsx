import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simple Tip Calculator",
  description: "Calculate tips and split bills easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
