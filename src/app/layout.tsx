import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "상상우리 — 시니어 일자리 매칭",
  description: "시니어와 일자리를 자동으로 연결해 드립니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-blue-700 text-white shadow-md">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-90">
              상상우리
            </Link>
            <nav className="flex gap-6 text-lg font-medium">
              <Link href="/register" className="hover:text-blue-200 transition-colors">
                프로필 등록
              </Link>
              <Link href="/recommendations" className="hover:text-blue-200 transition-colors">
                추천 목록
              </Link>
              <Link href="/admin" className="hover:text-blue-200 transition-colors">
                담당자 대시보드
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
          {children}
        </main>
        <footer className="bg-gray-200 text-center py-4 text-base text-gray-600">
          © 2026 상상우리 시니어 일자리 매칭 시스템
        </footer>
      </body>
    </html>
  );
}
