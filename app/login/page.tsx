"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { UserRole } from "@/domain/models/evidence";

// ─── Portal config ────────────────────────────────────────────────────────────
interface Role { key: UserRole; label: string; path: string; }
interface Portal {
  id: string; title: string; icon: string; tagline: string;
  accent: string; bg: string; border: string; activeBorder: string;
  caps: string[]; roles: Role[];
}

const PORTALS: Portal[] = [
  {
    id: "manufacturer", title: "Nhà cung cấp", icon: "🏭",
    tagline: "Sản xuất & nhập khẩu",
    accent: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE", activeBorder: "#6D28D9",
    caps: ["📦 Quản lý kho", "📊 Dự báo SX", "💰 Công nợ"],
    roles: [
      { key: "manufacturer_admin",     label: "Quản trị viên", path: "/manufacturer/dashboard" },
      { key: "manufacturer_logistics", label: "Kho vận",        path: "/manufacturer/inventory" },
      { key: "manufacturer_finance",   label: "Tài chính",      path: "/manufacturer/catalog" },
    ],
  },
  {
    id: "distributor", title: "Nhà phân phối", icon: "🚛",
    tagline: "PhytoPharma · Trung gian phân phối",
    accent: "#024430", bg: "#F0FDF4", border: "#BBF7D0", activeBorder: "#024430",
    caps: ["📋 Quản lý đơn", "🚚 Giao hàng", "💳 Thanh toán"],
    roles: [
      { key: "supplier_admin",      label: "Quản trị",  path: "/supplier/dashboard" },
      { key: "supplier_logistics",  label: "Kho vận",   path: "/supplier/drugs" },
      { key: "supplier_finance",    label: "Tài chính", path: "/supplier/payments" },
    ],
  },
  {
    id: "hospital", title: "Bệnh viện", icon: "🏥",
    tagline: "Mua theo gói thầu & hợp đồng",
    accent: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", activeBorder: "#1D4ED8",
    caps: ["📝 Tạo đơn hàng", "✅ Nghiệm thu", "💰 Thanh toán"],
    roles: [
      { key: "hospital_admin",     label: "Quản trị viên",          path: "/hospital/dashboard" },
      { key: "hospital_buyer",     label: "Phụ trách mua hàng",     path: "/hospital/orders/new" },
      { key: "hospital_warehouse", label: "Quản kho / Nghiệm thu",  path: "/hospital/orders" },
      { key: "hospital_finance",   label: "Kế toán / Thanh toán",   path: "/hospital/payments" },
    ],
  },
  {
    id: "pharmacy", title: "Nhà thuốc", icon: "💊",
    tagline: "Nhập lẻ theo đợt",
    accent: "#0F766E", bg: "#F0FDFA", border: "#99F6E4", activeBorder: "#0F766E",
    caps: ["🛒 Đặt hàng", "📦 Theo dõi đơn", "💳 Thanh toán"],
    roles: [
      { key: "pharmacy_admin",     label: "Quản trị / Chủ NT",     path: "/pharmacy/dashboard" },
      { key: "pharmacy_buyer",     label: "Phụ trách đặt hàng",    path: "/pharmacy/orders/new" },
      { key: "pharmacy_warehouse", label: "Quản kho",               path: "/pharmacy/orders" },
      { key: "pharmacy_finance",   label: "Kế toán / Thanh toán",  path: "/pharmacy/payments" },
    ],
  },
];

// ─── Login page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { dispatch } = useApp();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedPath, setSelectedPath] = useState("");

  function selectRole(role: UserRole, path: string) {
    setSelectedRole(role);
    setSelectedPath(path);
  }

  function handleLogin() {
    if (!selectedRole) return;
    dispatch({ type: "SET_ROLE", payload: selectedRole });
    router.push(selectedPath);
  }

  const activePortal = PORTALS.find((p) => p.roles.some((r) => r.key === selectedRole));

  return (
    <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Logo + tagline */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#024430] mb-3 shadow-lg">
            <span className="text-white font-black text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-bold text-[#10231C]">DCP Platform</h1>
          <p className="text-sm text-[#6B7A73] mt-1">Nền tảng quản lý phân phối & hợp đồng dược phẩm</p>
        </div>

        {/* Supply chain line */}
        <div className="flex items-center justify-center gap-1 mb-6 flex-wrap text-xs">
          {[
            { icon: "🏭", label: "Nhà cung cấp" },
            { icon: "🚛", label: "Nhà phân phối" },
            { icon: "🏥", label: "Bệnh viện" },
            { icon: "💊", label: "Nhà thuốc" },
          ].map((n, i, arr) => (
            <span key={n.label} className="flex items-center gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-[#E4EAE7] rounded-lg font-medium text-[#10231C]">
                {n.icon} {n.label}
              </span>
              {i < arr.length - 1 && <span className="text-[#024430] font-bold">→</span>}
            </span>
          ))}
        </div>

        {/* 2×2 portal grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {PORTALS.map((portal) => {
            const isSelected = portal.roles.some((r) => r.key === selectedRole);
            return (
              <div
                key={portal.id}
                className="rounded-2xl border-2 p-4 cursor-pointer transition-all"
                style={{
                  background: portal.bg,
                  borderColor: isSelected ? portal.activeBorder : portal.border,
                  outline: isSelected ? `2px solid ${portal.activeBorder}` : "none",
                  outlineOffset: "-2px",
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: portal.accent + "18" }}>
                    {portal.icon}
                  </div>
                  <div>
                    <p className="font-bold text-[#10231C] text-sm leading-tight">{portal.title}</p>
                    <p className="text-[11px] text-[#6B7A73] leading-tight">{portal.tagline}</p>
                  </div>
                </div>

                {/* Role radio buttons */}
                <div className="flex flex-col gap-1.5 mb-2 border-t border-[#E4EAE7] pt-2">
                  {portal.roles.map((role) => {
                    const checked = selectedRole === role.key;
                    return (
                      <button
                        key={role.key}
                        onClick={(e) => { e.stopPropagation(); selectRole(role.key, role.path); }}
                        className="flex items-center gap-2 text-left w-full px-2 py-1.5 rounded-lg transition-colors"
                        style={{ background: checked ? portal.accent + "15" : "transparent" }}
                      >
                        <div className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                          style={{ borderColor: checked ? portal.accent : "#9CA3AF" }}>
                          {checked && <div className="w-1.5 h-1.5 rounded-full" style={{ background: portal.accent }} />}
                        </div>
                        <span className="text-xs font-medium text-[#10231C]">{role.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {portal.caps.map((c) => (
                    <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-md text-[#6B7A73]" style={{ background: portal.accent + "10" }}>{c}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Login button */}
        <button
          className={`w-full font-semibold text-base h-12 rounded-xl transition-all ${
            selectedRole ? "text-white shadow-md hover:opacity-90 active:scale-[0.99]" : "bg-[#E4EAE7] text-[#6B7A73] cursor-not-allowed"
          }`}
          style={selectedRole && activePortal ? { backgroundColor: activePortal.accent } : {}}
          onClick={handleLogin}
          disabled={!selectedRole}
        >
          {selectedRole && activePortal
            ? `Vào cổng ${activePortal.title} →`
            : "Chọn cổng để đăng nhập"}
        </button>

        <p className="text-center text-xs text-[#6B7A73] mt-3">
          Môi trường demo · không cần mật khẩu · dữ liệu reset khi tải lại trang
        </p>
      </div>
    </div>
  );
}
