import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProjectFlow Manager | إدارة المشاريع الاحترافية",
  description:
    "نظام متكامل لإدارة المشاريع والعملاء وفريق العمل بشكل احترافي",
  keywords: ["إدارة مشاريع", "project management", "team management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased bg-slate-50`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
