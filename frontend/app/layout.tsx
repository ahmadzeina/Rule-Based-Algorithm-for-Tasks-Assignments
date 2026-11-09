import "./globals.css";
import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import Layout from "@/components/layout/Layout";

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap' });

export const metadata: Metadata = {
  title: "TaskAssigner - Intelligent Task Allocation",
  description: "Intelligent workforce allocation and task assignment system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}