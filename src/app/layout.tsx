import type { Metadata } from "next";
import { Noto_Serif_JP, Zen_Antique, Geist_Mono } from "next/font/google";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  weight: ['200', '300', '400', '500', '600'],
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
});

const zenAntique = Zen_Antique({
  weight: '400',
  variable: "--font-zen-antique",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "いろえらび - カラーピッカー",
  description: "美しいガラスモーフィズムデザインの日本語カラーピッカーアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSerifJP.variable} ${zenAntique.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
