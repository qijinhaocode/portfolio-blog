import type { Metadata } from "next";
import Link from "next/link";
import Search from "@/components/Search";
import "./globals.css";
import { VT323 } from 'next/font/google'

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-vt323',
})

export const metadata: Metadata = {
  title: {
    default: "Jinhao's Blog",
    template: "%s | Jinhao's Blog",
  },
  description: "A space to showcase my work and thoughts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={vt323.variable}>
      <body>
        <header className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl">
                Jinhao's Blog
              </Link>
              <div className="w-1/3">
                <Search />
              </div>
              <nav className="flex items-center space-x-4">
                <Link href="/">
                  /home
                </Link>
                <Link href="/about">
                  /about
                </Link>
                <Link href="/feedback">
                  /feedback
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {children}
        </main>
        <footer className="text-center py-6 text-sm">
          <p>© 2020 Jinhao's Blog. All Rights Reserved.</p>
        </footer>
      </body>
    </html>
  );
}
