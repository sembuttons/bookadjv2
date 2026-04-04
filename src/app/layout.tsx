import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "bookadj — Vind de perfecte DJ voor jouw evenement",
  description:
    "De DJ-boekingsmarktplaats van Nederland. Geverifieerde DJ's, transparante prijzen en volledige betalingsbescherming.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white font-sans text-neutral-900">
        {children}
      </body>
    </html>
  );
}
