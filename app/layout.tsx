import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import React from 'react';
import ClientNavbar from './components/ClientNavbar';
import { ToastProvider } from "./components/Toast";

export const metadata: Metadata = {
  title: "Projects App",
  description: "Create and manage your projects efficiently",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        <AuthProvider>
          <ToastProvider>
            <div className="h-full flex flex-col bg-gray-50">
              <div className="h-16">
                <ClientNavbar />
              </div>
              <main className="flex-grow container mx-auto px-4 py-6 overflow-hidden">
                {children}
              </main>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
