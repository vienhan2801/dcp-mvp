"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, ShoppingCart, Truck, CreditCard,
  ClipboardList, MessageSquare, Package, BarChart2, FlaskConical,
  Factory, Warehouse, BookOpen, Store, Gavel, Bell, BarChart3,
  Tag, Shield, ScrollText, KeyRound, GitBranch, Users, Building2,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { UserRole } from "@/domain/models/evidence";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
}

export type SidebarType = "supplier" | "hospital" | "manufacturer" | "pharmacy" | "customer";

interface SidebarProps {
  type: SidebarType;
}

// ─── Portal accent themes ─────────────────────────────────────
const PORTAL_STYLE: Record<SidebarType, {
  accent: string; accentLight: string; accentBg: string;
  label: string; sublabel: string; emoji: string;
}> = {
  supplier: {
    accent: "#024430", accentLight: "#F0FDF4", accentBg: "bg-[#024430]",
    label: "DCP", sublabel: "Nhà phân phối", emoji: "🚛",
  },
  hospital: {
    accent: "#1D4ED8", accentLight: "#EFF6FF", accentBg: "bg-blue-700",
    label: "DCP", sublabel: "Bệnh viện", emoji: "🏥",
  },
  manufacturer: {
    accent: "#6D28D9", accentLight: "#F5F3FF", accentBg: "bg-violet-700",
    label: "DCP", sublabel: "Nhà cung cấp", emoji: "🏭",
  },
  pharmacy: {
    accent: "#0F766E", accentLight: "#F0FDFA", accentBg: "bg-teal-700",
    label: "DCP", sublabel: "Nhà thuốc", emoji: "💊",
  },
  customer: {
    accent: "#1D4ED8", accentLight: "#EFF6FF", accentBg: "bg-blue-700",
    label: "DCP", sublabel: "Khách hàng", emoji: "🏥",
  },
};

// ─── Nav items per portal ────────────────────────────────────
const supplierNav: NavItem[] = [
  // Core
  { label: "Bảng điều khiển", href: "/supplier/dashboard",        icon: <LayoutDashboard size={17} /> },
  { label: "Danh mục thuốc",  href: "/supplier/drugs",             icon: <FlaskConical size={17} /> },
  { label: "Hợp đồng",        href: "/supplier/contracts",         icon: <FileText size={17} /> },
  { label: "Gói thầu",        href: "/supplier/tender-library",    icon: <Gavel size={17} /> },
  // Vận hành
  { label: "Đơn hàng",        href: "/supplier/orders",            icon: <ShoppingCart size={17} /> },
  { label: "Giao hàng",       href: "/supplier/deliveries",        icon: <Truck size={17} /> },
  { label: "Kho & Lô hàng",   href: "/supplier/warehouse",         icon: <Warehouse size={17} /> },
  { label: "Tổng hợp nhu cầu",href: "/supplier/aggregation",       icon: <BarChart2 size={17} /> },
  // Tài chính
  { label: "Thanh toán",      href: "/supplier/payments",          icon: <CreditCard size={17} /> },
  { label: "Bảng giá",        href: "/supplier/price-list",        icon: <Tag size={17} /> },
  { label: "Hồ sơ pháp lý",   href: "/supplier/legal-docs",        icon: <Shield size={17} /> },
  // Phân tích
  { label: "Báo cáo",         href: "/supplier/reports",           icon: <BarChart3 size={17} /> },
  { label: "Nhật ký",         href: "/supplier/evidence-log",      icon: <ScrollText size={17} /> },
  { label: "Thông báo",       href: "/supplier/notifications",     icon: <Bell size={17} /> },
  // Cài đặt
  { label: "Người dùng",      href: "/supplier/settings/users",    icon: <Users size={17} /> },
  { label: "Phân quyền",      href: "/supplier/settings/roles",    icon: <KeyRound size={17} /> },
  { label: "Workflow",        href: "/supplier/settings/workflow",  icon: <GitBranch size={17} /> },
];

const hospitalNav: NavItem[] = [
  { label: "Bảng điều khiển", href: "/hospital/dashboard",      icon: <LayoutDashboard size={17} /> },
  { label: "Danh mục thuốc",  href: "/hospital/drugs",          icon: <FlaskConical size={17} /> },
  { label: "Hợp đồng của tôi",href: "/hospital/contracts",      icon: <FileText size={17} />, exact: true },
  { label: "Tạo đơn hàng",    href: "/hospital/orders/new",     icon: <ShoppingCart size={17} />, exact: true },
  { label: "Đơn hàng của tôi",href: "/hospital/orders",         icon: <Package size={17} /> },
  { label: "Thanh toán",      href: "/hospital/payments",       icon: <CreditCard size={17} /> },
  { label: "Tin nhắn",        href: "/hospital/messages",       icon: <MessageSquare size={17} /> },
];

const manufacturerNav: NavItem[] = [
  { label: "Bảng điều khiển", href: "/manufacturer/dashboard",  icon: <LayoutDashboard size={17} /> },
  { label: "Sản phẩm của tôi",href: "/manufacturer/products",   icon: <FlaskConical size={17} /> },
  { label: "Đơn từ NPP",      href: "/manufacturer/orders",     icon: <ShoppingCart size={17} /> },
  { label: "Kho hàng",        href: "/manufacturer/inventory",  icon: <Warehouse size={17} /> },
  { label: "Dự báo & SX",     href: "/manufacturer/forecast",   icon: <BarChart2 size={17} /> },
  { label: "Công nợ",         href: "/manufacturer/catalog",    icon: <CreditCard size={17} /> },
];

const pharmacyNav: NavItem[] = [
  { label: "Bảng điều khiển", href: "/pharmacy/dashboard",      icon: <LayoutDashboard size={17} /> },
  { label: "Danh mục thuốc",  href: "/pharmacy/drugs",          icon: <FlaskConical size={17} /> },
  { label: "Hợp đồng",        href: "/pharmacy/contracts",      icon: <FileText size={17} />, exact: true },
  { label: "Tạo đơn hàng",    href: "/pharmacy/orders/new",     icon: <ShoppingCart size={17} />, exact: true },
  { label: "Đơn hàng",        href: "/pharmacy/orders",         icon: <Package size={17} /> },
  { label: "Thanh toán",      href: "/pharmacy/payments",       icon: <CreditCard size={17} /> },
];

const customerNav: NavItem[] = [
  { label: "Tổng quan",    href: "/customer/dashboard",   icon: <LayoutDashboard size={17} /> },
  { label: "Hợp đồng",    href: "/customer/contracts",   icon: <FileText size={17} /> },
  { label: "Catalog thuốc", href: "/customer/catalog",   icon: <FlaskConical size={17} />, exact: true },
  { label: "Tạo đơn hàng", href: "/customer/orders/new", icon: <ShoppingCart size={17} />, exact: true },
  { label: "Đơn hàng",    href: "/customer/orders",      icon: <Package size={17} /> },
  { label: "Nhận hàng",   href: "/customer/receipts",    icon: <Truck size={17} /> },
  { label: "Công nợ",     href: "/customer/payments",    icon: <CreditCard size={17} /> },
  { label: "Chi nhánh",   href: "/customer/branches",    icon: <Building2 size={17} /> },
];

const NAV_MAP: Record<SidebarType, NavItem[]> = {
  supplier: supplierNav,
  hospital: hospitalNav,
  manufacturer: manufacturerNav,
  pharmacy: pharmacyNav,
  customer: customerNav,
};

const ROLE_DISPLAY: Record<UserRole, string> = {
  supplier_admin: "NPP · Quản trị",
  supplier_logistics: "NPP · Kho vận",
  supplier_finance: "NPP · Tài chính",
  manufacturer_admin: "NCC · Quản trị",
  manufacturer_logistics: "NCC · Kho vận",
  manufacturer_finance: "NCC · Tài chính",
  hospital_admin: "BV · Quản trị",
  hospital_buyer: "BV · Mua hàng",
  hospital_warehouse: "BV · Kho vận",
  hospital_finance: "BV · Tài chính",
  pharmacy_admin: "NT · Quản trị",
  pharmacy_buyer: "NT · Đặt hàng",
  pharmacy_warehouse: "NT · Kho vận",
  pharmacy_finance: "NT · Tài chính",
  customer_admin: "KH · Quản trị",
  customer_buyer: "KH · Mua hàng",
  customer_receiver: "KH · Nhận hàng",
  customer_finance: "KH · Tài chính",
};

function filterNavByRole(nav: NavItem[], role: UserRole, type: SidebarType): NavItem[] {
  const match = (labels: string[]) => nav.filter((i) => labels.includes(i.label));

  if (type === "supplier") {
    if (role === "supplier_logistics") return match(["Bảng điều khiển", "Danh mục thuốc", "Đơn hàng", "Giao hàng", "Nhật ký"]);
    if (role === "supplier_finance")   return match(["Bảng điều khiển", "Hợp đồng", "Thanh toán", "Nhật ký"]);
    return nav;
  }
  if (type === "manufacturer") {
    if (role === "manufacturer_logistics") return match(["Bảng điều khiển", "Sản phẩm của tôi", "Kho hàng"]);
    if (role === "manufacturer_finance")   return match(["Bảng điều khiển", "Đơn từ NPP", "Công nợ"]);
    return nav;
  }
  if (type === "hospital") {
    if (role === "hospital_warehouse") return match(["Bảng điều khiển", "Đơn hàng của tôi"]);
    if (role === "hospital_finance")   return match(["Bảng điều khiển", "Hợp đồng của tôi", "Thanh toán"]);
    if (role === "hospital_buyer")     return match(["Bảng điều khiển", "Danh mục thuốc", "Hợp đồng của tôi", "Tạo đơn hàng", "Đơn hàng của tôi", "Tin nhắn"]);
    return nav;
  }
  if (type === "pharmacy") {
    if (role === "pharmacy_warehouse") return match(["Bảng điều khiển", "Đơn hàng"]);
    if (role === "pharmacy_finance")   return match(["Bảng điều khiển", "Hợp đồng", "Thanh toán"]);
    if (role === "pharmacy_buyer")     return match(["Bảng điều khiển", "Danh mục thuốc", "Hợp đồng", "Tạo đơn hàng", "Đơn hàng"]);
    return nav;
  }
  if (type === "customer") {
    if (role === "customer_receiver") return match(["Tổng quan", "Đơn hàng", "Nhận hàng"]);
    if (role === "customer_finance")  return match(["Tổng quan", "Hợp đồng", "Công nợ"]);
    if (role === "customer_buyer")    return match(["Tổng quan", "Hợp đồng", "Catalog thuốc", "Tạo đơn hàng", "Đơn hàng"]);
    return nav;
  }
  return nav;
}

export default function Sidebar({ type }: SidebarProps) {
  const pathname = usePathname();
  const { state } = useApp();
  const nav = NAV_MAP[type];
  const filteredNav = filterNavByRole(nav, state.currentRole, type);
  const style = PORTAL_STYLE[type];
  const roleLabel = ROLE_DISPLAY[state.currentRole];

  return (
    <aside className="w-56 bg-white border-r border-[#E4EAE7] flex flex-col">
      {/* Logo — colored by portal */}
      <div className="h-16 flex items-center px-5 border-b border-[#E4EAE7]">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl ${style.accentBg} flex items-center justify-center shadow-sm`}>
            <span className="text-lg leading-none">{style.emoji}</span>
          </div>
          <div>
            <div className="font-black text-[#10231C] text-sm leading-tight">{style.label}</div>
            <div className="text-[11px] font-medium leading-tight mt-0.5" style={{ color: style.accent }}>
              {style.sublabel}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2.5 flex flex-col gap-0.5 overflow-y-auto">
        {filteredNav.map((item) => {
          // Active if exact match, OR prefix match but NOT overridden by another exact item
          const active = item.exact
            ? pathname === item.href
            : (pathname === item.href || pathname.startsWith(item.href + "/")) &&
              !filteredNav.some(
                (other) => other.exact && other.href !== item.href && pathname === other.href && other.href.startsWith(item.href + "/")
              );
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                active
                  ? "text-white shadow-sm"
                  : "text-[#6B7A73] hover:text-[#10231C] hover:bg-[#F6F8F7]"
              }`}
              style={active ? { backgroundColor: style.accent } : {}}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#E4EAE7] flex flex-col gap-1">
        {/* Role badge */}
        <div className="text-center px-2 py-1">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: style.accent, backgroundColor: style.accentLight }}>
            {roleLabel}
          </span>
        </div>
        <Link href="/login">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6B7A73] hover:text-[#10231C] cursor-pointer py-1.5 rounded-lg hover:bg-[#F6F8F7] transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Đổi cổng đăng nhập
          </div>
        </Link>
      </div>
    </aside>
  );
}
