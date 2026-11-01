import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Nav from "@/components/Nav";
import ThemeToggle from "@/components/ThemeToggle";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: site.name, template: `%s - ${site.name}` },
  description: site.description,
  openGraph: { siteName: site.name, type: "website", locale: "mn_MN" },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.avatar} alt={site.name} width={36} height={36} />
          </Link>
          <Nav />
          <ThemeToggle />
        </header>
        {children}
        <footer className="footer">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <nav>
            {site.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label}
              </a>
            ))}
          </nav>
        </footer>
      </body>
    </html>
  );
}
