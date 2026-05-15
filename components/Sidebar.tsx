"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, ShoppingCart, Truck, CreditCard, ClipboardList,
  MessageSquare, Package, FlaskConical, BarChart2, Gavel, Bell, BarChart3,
  Warehouse, Tag, Shield, GitBranch, Settings, Users, KeyRound, ScrollText,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  section?: string; // optional section divider label
}

interface SidebarProps {
  type: "supplier" | "hospital";
}

const supplierNav: NavItem[] = [
  // Core
  { label: "Bảng điều khiển", href: "/supplier/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Danh mục thuốc", href: "/supplier/drugs", icon: <FlaskConical size={18} /> },
  { label: "Hợp đồng", href: "/supplier/contracts", icon: <FileText size={18} /> },
  { label: "Gói thầu", href: "/supplier/tender-library", icon: <Gavel size={18} /> },
  // Order & Fulfillment
  { label: "Đơn hàng", href: "/supplier/orders", icon: <ShoppingCart size={18} />, section: "Vận hành" },
  { label: "Giao hàng", href: "/supplier/deliveries", icon: <Truck size={18} /> },
  { label: "Kho & Lô hàng", href: "/supplier/warehouse", icon: <Warehouse size={18} /> },
  { label: "Tổng hợp nhu cầu", href: "/supplier/aggregation", icon: <BarChart2 size={18} /> },
  // Finance & Legal
  { label: "Thanh toán", href: "/supplier/payments", icon: <CreditCard size={18} />, section: "Tài chính" },
  { label: "Bảng giá", href: "/supplier/price-list", icon: <Tag size={18} /> },
  { label: "Hồ sơ pháp lý", href: "/supplier/legal-docs", icon: <Shield size={18} /> },
  // Reports & Logs
  { label: "Báo cáo", href: "/supplier/reports", icon: <BarChart3 size={18} />, section: "Phân tích" },
  { label: "Nhật ký hoạt động", href: "/supplier/evidence-log", icon: <ScrollText size={18} /> },
  { label: "Thông báo", href: "/supplier/notifications", icon: <Bell size={18} /> },
  // Settings
  { label: "Người dùng", href: "/supplier/settings/users", icon: <Users size={18} />, section: "Cài đặt" },
  { label: "Phân quyền", href: "/supplier/settings/roles", icon: <KeyRound size={18} /> },
  { label: "Workflow", href: "/supplier/settings/workflow", icon: <GitBranch size={18} /> },
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

  let lastSection: string | undefined = undefined;

  return (
    <aside className="w-60 bg-white border-r border-[#E4EAE7] flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#E4EAE7] flex-shrink-0">
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
      <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;

          return (
            <div key={item.href}>
              {showSection && (
                <p className="text-[10px] font-bold uppercase text-[#6B7A73] px-3 pt-3 pb-1 tracking-wider">
                  {item.section}
                </p>
              )}
              <Link
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
            </div>
          );
        })}
      </nav>
      {/* Footer */}
      <div className="p-4 border-t border-[#E4EAE7] flex-shrink-0">
        <div className="text-[10px] text-[#6B7A73] text-center">DCP v2.0 © 2026</div>
      </div>
    </aside>
  );
}
