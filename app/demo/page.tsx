"use client";
import Link from "next/link";
import { useState } from "react";

// ── Demo scenarios ────────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    id: "order-flow",
    title: "Luồng đặt hàng đầy đủ",
    subtitle: "Từ đặt hàng → phê duyệt → giao hàng → nghiệm thu",
    emoji: "📦",
    color: "#024430",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    steps: [
      {
        role: "🏥 Khách hàng · Mua hàng",
        roleKey: "customer_buyer",
        portal: "/customer/orders/new",
        action: "Tạo đơn hàng mới",
        detail: "Chọn hợp đồng CT-2026-001 → Thêm Paracetamol 500mg (5,000 viên) → Chọn ngày giao → Xác nhận",
      },
      {
        role: "🚛 NPP · Quản trị",
        roleKey: "supplier_admin",
        portal: "/supplier/orders",
        action: "Xem đơn chờ phê duyệt",
        detail: "Vào Đơn hàng → Lọc 'Chờ phê duyệt' → Mở ORD-2026-004 → Kiểm tra hạn mức hợp đồng → Phê duyệt",
      },
      {
        role: "🚛 NPP · Kho vận",
        roleKey: "supplier_logistics",
        portal: "/supplier/deliveries",
        action: "Tạo lô giao hàng",
        detail: "Vào Giao hàng → Mở DEL-2026-001 → Chọn lô hàng theo FEFO → Bắt đầu vận chuyển",
      },
      {
        role: "🏥 Khách hàng · Nhận hàng",
        roleKey: "customer_receiver",
        portal: "/customer/receipts",
        action: "Nghiệm thu hàng nhận",
        detail: "Vào Nhận hàng → Kiểm tra số lô, hạn dùng, số lượng → Xác nhận nghiệm thu",
      },
      {
        role: "🚛 NPP · Tài chính",
        roleKey: "supplier_finance",
        portal: "/supplier/payments",
        action: "Theo dõi thanh toán",
        detail: "Vào Thanh toán → Kiểm tra trạng thái hóa đơn → Ghi nhận thanh toán từ khách hàng",
      },
    ],
  },
  {
    id: "approval-flow",
    title: "Phê duyệt đa cấp",
    subtitle: "Đơn lớn qua workflow phê duyệt NPP Admin",
    emoji: "✅",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    steps: [
      {
        role: "🏥 Bệnh viện · Mua hàng",
        roleKey: "hospital_buyer",
        portal: "/hospital/orders/new",
        action: "Tạo đơn hàng lớn",
        detail: "Đặt Ceftriaxone 1g × 500 lọ + Amoxicillin × 10,000 viên → Tổng > 200M → Tự động vào hàng đợi phê duyệt",
      },
      {
        role: "🚛 NPP · Quản trị",
        roleKey: "supplier_admin",
        portal: "/supplier/orders/ORD-2026-004",
        action: "Xem đơn pending_approval",
        detail: "Đơn hiển thị chip 'Chờ phê duyệt' → Xem chi tiết từng dòng, kiểm tra hạn mức → Nhấn 'Phê duyệt đơn hàng'",
      },
      {
        role: "🏥 Bệnh viện · Mua hàng",
        roleKey: "hospital_buyer",
        portal: "/hospital/orders",
        action: "Xác nhận đơn đã được phê duyệt",
        detail: "Đơn chuyển sang trạng thái 'Đã xác nhận' → Nhà phân phối bắt đầu chuẩn bị hàng",
      },
    ],
  },
  {
    id: "complaint-flow",
    title: "Xử lý khiếu nại",
    subtitle: "Báo sự cố chất lượng → điều tra → giải quyết",
    emoji: "⚠️",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    steps: [
      {
        role: "🏥 Khách hàng · Nhận hàng",
        roleKey: "customer_receiver",
        portal: "/customer/receipts",
        action: "Phát hiện sự cố khi nghiệm thu",
        detail: "Khi nhận hàng, phát hiện Paracetamol bị ẩm → Ghi nhận sự cố, chụp ảnh bằng chứng",
      },
      {
        role: "🚛 NPP · Quản trị",
        roleKey: "supplier_admin",
        portal: "/supplier/complaints",
        action: "Tiếp nhận khiếu nại",
        detail: "Vào Khiếu nại → Thấy CMP-003 mới → Mở chi tiết → Nhấn 'Bắt đầu điều tra'",
      },
      {
        role: "🚛 NPP · Quản trị",
        roleKey: "supplier_admin",
        portal: "/supplier/complaints/CMP-001",
        action: "Xử lý và đóng case",
        detail: "Xem timeline → Nhập kết quả điều tra → Xác nhận bồi thường / thu hồi lô hàng → Đánh dấu đã giải quyết",
      },
    ],
  },
  {
    id: "supply-chain",
    title: "Chuỗi cung ứng",
    subtitle: "Từ nhà sản xuất → NPP → khách hàng",
    emoji: "🔗",
    color: "#6D28D9",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    steps: [
      {
        role: "🏭 Nhà cung cấp · Quản trị",
        roleKey: "manufacturer_admin",
        portal: "/manufacturer/dashboard",
        action: "Xem tình trạng sản xuất",
        detail: "Dashboard hiển thị mức tồn kho, đơn từ NPP đang chờ, doanh thu 6 tháng",
      },
      {
        role: "🏭 Nhà cung cấp · Quản trị",
        roleKey: "manufacturer_admin",
        portal: "/manufacturer/forecast",
        action: "Lập kế hoạch sản xuất",
        detail: "Tab Dự báo: T6/T7 forecast → Tab Lịch SX: xem batch đang chạy → Tab Cảnh báo: Omeprazole sắp hết",
      },
      {
        role: "🏭 Nhà cung cấp · Kho vận",
        roleKey: "manufacturer_logistics",
        portal: "/manufacturer/orders",
        action: "Xử lý đơn từ NPP",
        detail: "PO-2026-001 từ PhytoPharma → Mở chi tiết → Phân bổ lô FEFO → Bắt đầu xuất kho",
      },
      {
        role: "🚛 NPP · Quản trị",
        roleKey: "supplier_admin",
        portal: "/supplier/warehouse",
        action: "Nhập kho từ nhà sản xuất",
        detail: "Nhập lô mới LOT-2026-005 → Ghi nhận số lô, hạn dùng, điều kiện bảo quản",
      },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === activeScenario) ?? SCENARIOS[0];

  return (
    <div className="min-h-screen bg-[#F6F8F7] p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#024430] mb-4 shadow-lg">
            <span className="text-white font-black text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-bold text-[#10231C]">DCP Demo Guide</h1>
          <p className="text-[#6B7A73] mt-1 text-sm">Hướng dẫn chạy demo theo từng kịch bản nghiệp vụ</p>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            {[{ icon: "🏭", label: "NCC" }, { icon: "🚛", label: "NPP" }, { icon: "🏥", label: "KH" }].map((n, i, arr) => (
              <span key={n.label} className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-[#E4EAE7] rounded-lg text-xs font-medium text-[#10231C]">
                  {n.icon} {n.label}
                </span>
                {i < arr.length - 1 && <span className="text-[#024430] font-bold text-xs">→</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Scenario tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className="rounded-xl border-2 p-3 text-left transition-all cursor-pointer"
              style={{
                background: activeScenario === s.id ? s.bg : "white",
                borderColor: activeScenario === s.id ? s.color : "#E4EAE7",
              }}
            >
              <div className="text-2xl mb-1">{s.emoji}</div>
              <p className="text-xs font-bold text-[#10231C] leading-tight">{s.title}</p>
              <p className="text-[10px] text-[#6B7A73] mt-0.5 leading-tight">{s.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl border border-[#E4EAE7] p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{scenario.emoji}</span>
            <div>
              <h2 className="text-lg font-bold text-[#10231C]">{scenario.title}</h2>
              <p className="text-sm text-[#6B7A73]">{scenario.subtitle}</p>
            </div>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-[#E4EAE7]" />

            <div className="flex flex-col gap-6">
              {scenario.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  {/* Step number */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 z-10 shadow-sm"
                    style={{ backgroundColor: scenario.color }}
                  >
                    {i + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F6F8F7] border border-[#E4EAE7] text-[#6B7A73]">
                        {step.role}
                      </span>
                    </div>
                    <p className="font-semibold text-[#10231C] mb-1">{step.action}</p>
                    <p className="text-sm text-[#6B7A73] leading-relaxed mb-2">{step.detail}</p>
                    <Link href={step.portal}>
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-opacity cursor-pointer"
                        style={{ backgroundColor: scenario.color }}
                      >
                        Mở trang →
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "NPP Portal", href: "/supplier/dashboard", emoji: "🚛", color: "#024430" },
            { label: "NCC Portal", href: "/manufacturer/dashboard", emoji: "🏭", color: "#6D28D9" },
            { label: "Bệnh viện", href: "/hospital/dashboard", emoji: "🏥", color: "#1D4ED8" },
            { label: "Nhà thuốc", href: "/pharmacy/dashboard", emoji: "💊", color: "#0F766E" },
            { label: "Khách hàng", href: "/customer/dashboard", emoji: "🏢", color: "#1D4ED8" },
          ].map((p) => (
            <Link key={p.href} href={p.href}>
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-[#E4EAE7] hover:border-current hover:shadow-sm transition-all cursor-pointer"
                style={{ color: p.color }}>
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-xs font-semibold text-center">{p.label}</span>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-[#6B7A73] mt-6">
          Môi trường demo · dữ liệu reset khi tải lại trang ·{" "}
          <Link href="/login"><span className="underline cursor-pointer hover:text-[#10231C]">Đổi cổng đăng nhập</span></Link>
        </p>
      </div>
    </div>
  );
}
