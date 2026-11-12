import type { Metadata } from "next";
import { Geist, Geist_Mono, Scheherazade_New, Amiri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const scheherazade = Scheherazade_New({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "MonaQosah · Pondok Pesantren Bahtra",
  description:
    "Sidang ujian keilmuan santri Pondok Pesantren Bahtra - sistem monaqosah dengan makro nama, kelas dan kitab.",
  keywords: [
    "monaqosah",
    "pesantren",
    "bahtra",
    "santri",
    "kitab",
    "fiqih",
    "islam",
  ],
  authors: [{ name: "Pondok Pesantren Bahtra" }],
  icons: {
    icon: "/bahtra-logo-vector.svg",
  },
  openGraph: {
    title: "MonaQosah · Pondok Pesantren Bahtra",
    description: "Sidang ujian keilmuan santri dengan animasi buku flipbook.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${scheherazade.variable} ${amiri.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
