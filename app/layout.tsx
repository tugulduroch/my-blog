import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Nav from "@/components/Nav";
import ThemeToggle from "@/components/ThemeToggle";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: site.name, template: `%s - ${site.name}` },
  description: site.description,
};

// Хуудас ачаалахаас өмнө theme-ийг тохируулж, гэрэлтэх (flash) явдлаас сэргийлнэ.
const themeScript = `try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" data-theme="dark" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="header">
          <Link href="/" className="avatar" aria-label="Нүүр">
            {site.initials}
          </Link>
          <Nav />
          <ThemeToggle />
        </header>
        {children}
      </body>
    </html>
  );
}
