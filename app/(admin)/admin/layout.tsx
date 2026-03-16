import SidebarClientWrapper from "@/components/admin/SidebarClientWrapper";
import { Metadata } from "next";
import { Geist, Geist_Mono, Mulish } from "next/font/google";
import React from "react";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const Muli = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interinest Designer Dashboard",
  description: "Interinest - Nested Freelance Marketplace for Designers",
};
export default function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // <div className={` ${geistSans.variable} ${geistMono.variable} antialiased`}>
    //   <main className="p-6">{children}</main>
    // </div>
    <html lang="en">
      <body className={`${Muli.variable} ${Muli.variable} antialiased`}>
        <SidebarClientWrapper>
          <div className="min-h-screen ">{children}</div>
        </SidebarClientWrapper>
      </body>
    </html>
  );
}
