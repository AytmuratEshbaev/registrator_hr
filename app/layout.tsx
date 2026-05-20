import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ZEYIN mektebi school — Подача заявки",
  description: "Платформа подачи заявок на работу в ZEYIN mektebi school",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
