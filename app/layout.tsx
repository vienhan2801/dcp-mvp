import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DCP - Nền tảng quản lý phân bổ hợp đồng dược phẩm",
  description: "DCP Contract Allocation Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full">
      <body className={`${inter.className} h-full bg-[#F6F8F7] text-[#10231C]`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
