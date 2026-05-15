"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, ShoppingCart, Truck, CreditCard, ClipboardList, MessageSquare, Package, FlaskConical, BarChart2,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  type: "supplier" | "hospital";
}

const supplierNav: NavItem[] = [
  { label: "Bảng điều khiển", href: "/supplier/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Danh mục thuốc", href: "/supplier/drugs", icon: <FlaskConical size={18} /> },
  { label: "Hợp đồng", href: "/supplier/contracts", icon: <FileText size={18} /> },
  { label: "Đơn hàng", href: "/supplier/orders", icon: <ShoppingCart size={18} /> },
  { label: "Giao hàng", href: "/supplier/deliveries", icon: <Truck size={18} /> },
  { label: "Tổng hợp nhu cầu", href: "/supplier/aggregation", icon: <BarChart2 size={18} /> },
  { label: "Thanh toán", href: "/supplier/payments", icon: <CreditCard size={18} /> },
  { label: "Nhật ký bằng chứng", href: "/supplier/evidence-log", icon: <ClipboardList size={18} /> },
];

const hospitalNav: NavItem[] = [
  { label: "Bảng điều khiển", href: "/hospital/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Danh mục thuốc", href: "/hospital/drugs", icon: <FlaskConical size={18} /> },
  { label: "Hợp đồng của tôi", href: "/hospital/contracts", icon: <FileText size={18} /> },
  { label: "Tạo đơn hàng", href: "/hospital/contracts/CTR-2026-001", icon: <ShoppingCart size={18} /> },
  { label: "Đơn hàng của tôi", href: "/hospital/orders", icon: <Package size={18} /> },
  { label: "Thanh toán", href: "/hospital/payments", icon: <CreditCard size={18} /> },
  { label: "Tin nhắn", href: "/hospital/messages", icon: <MessageSquare size={18} /> },
];

export default function Sidebar({ type }: SidebarProps) {
  const pathname = usePathname();
  const nav = type === "supplier" ? supplierNav : hospitalNav;

  return (
    <aside className="w-60 bg-white border-r border-[#E4EAE7] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#E4EAE7]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#024430] flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <div>
            <div className="font-bold text-[#024430] text-sm leading-none">DCP</div>
            <div className="text-[10px] text-[#6B7A73] leading-none mt-0.5">Contract Platform</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#024430] text-white"
                  : "text-[#6B7A73] hover:bg-[#F6F8F7] hover:text-[#10231C]"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      {/* Footer */}
      <div className="p-4 border-t border-[#E4EAE7]">
        <div className="text-[10px] text-[#6B7A73] text-center">DCP v1.0 © 2026</div>
      </div>
    </aside>
  );
}
