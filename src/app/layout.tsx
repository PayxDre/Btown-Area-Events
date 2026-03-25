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
      <body className="bg-gray-50 min-h-full flex flex-col font-sans">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-blue-600">
              Btown Area Events
            </a>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
