import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Btown Area Events - Find Local Events That Fit Your Schedule",
  description:
    "Discover local events filtered by your availability and age groups. Perfect for parents who need events outside nap times!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ background: "var(--background)" }}>
        <nav className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                B
              </div>
              <span className="text-lg font-bold text-slate-800 tracking-tight">
                Btown <span className="text-indigo-600">Events</span>
              </span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/events" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                Browse Events
              </a>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-slate-400">
            Btown Area Events &mdash; Aggregating local events so you don&apos;t have to.
          </div>
        </footer>
      </body>
    </html>
  );
}
