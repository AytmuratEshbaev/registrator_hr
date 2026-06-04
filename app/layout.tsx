import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/language/language-provider";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Zeyin school",
  description: "Zeyin school ushin arza qabillaw platformasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="qq">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}>
        <LanguageProvider>
          <LanguageSwitcher />
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
