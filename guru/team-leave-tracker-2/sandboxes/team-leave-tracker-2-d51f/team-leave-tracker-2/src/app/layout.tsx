import "./globals.css";
import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Team Leave Tracker",
  description: "Log leave days and see who is off this week",
  icons: { icon: "./favicon.svg" },
};

const themeInit = `try{document.documentElement.dataset.theme=localStorage.getItem("theme:"+location.pathname.split("/app/")[0])==="dark"?"dark":"light"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen">
        <header className="h-[52px] bg-surface border-b border-border flex items-center px-6 gap-2">
          <CalendarDays className="size-5 text-primary" aria-hidden />
          <span className="font-semibold text-[16px]">Team Leave Tracker</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
