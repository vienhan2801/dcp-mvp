"use client";
import { useApp } from "@/lib/store";
import { fmtVND, fmtDate } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader, Chip } from "@/components/ui";
import { DonutChart, BarChart } from "@/components/Charts";
import Link from "next/link";

const ACCENT = "#1D4ED8";

const RECENT_ORDERS = [
  { id: "ORD-2026-081", date: "10/05/2026", supplier: "PhytoPharma", amount: 85_000_000, status: "shipping",             statusLabel: "Đang giao",      statusColor: "primary" as const },
  { id: "ORD-2026-079", date: "05/05/2026", supplier: "MedPharma",   amount: 52_000_000, status: "delivered",            statusLabel: "Đã giao",        statusColor: "success" as const },
  { id: "ORD-2026-075", date: "28/04/2026", supplier: "PhytoPharma", amount: 120_000_000, status: "received_confirmed",  statusLabel: "Hoàn thành",     statusColor: "success" as const },
  { id: "ORD-2026-070", date: "20/04/2026", supplier: "MedPharma",   amount: 68_000_000, status: "received_confirmed",  statusLabel: "Hoàn thành",     statusColor: "success" as const },
  { id: "ORD-2026-065", date: "10/04/2026", supplier: "PhytoPharma", amount: 97_000_000, status: "received_confirmed",  statusLabel: "Hoàn thành",     statusColor: "success" as const },
];

const MONTHLY_BARS = [
  { label: "T1", value: 210_000_000, color: ACCENT },
  { label: "T2", value: 185_000_000, color: ACCENT },
  { label: "T3", value: 320_000_000, color: ACCENT },
  { label: "T4", value: 280_000_000, color: ACCENT },
  { label: "T5", value: 485_000_000, color: ACCENT },
];

export default function CustomerDashboard() {
  const { state } = useApp();

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <PageHeader title="Tổng quan" subtitle="Cổng khách hàng · Tổng quan hoạt động" />
        <Link href="/customer/orders/new">
          <span className="inline-flex items-center gap-1.5 px-5 py-2.5 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-sm transition-colors"
            style={{ backgroundColor: ACCENT }}>
            + Tạo đơn hàng
          </span>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: "📄", value: "2",      label: "Hợp đồng hiệu lực",    href: "/customer/contracts",  border: "border-blue-200",   bg: "bg-blue-50",   text: "text-blue-800",   sub: "text-blue-600"   },
          { icon: "🛒", value: "8",      label: "Đơn hàng tháng này",   href: "/customer/orders",     border: "border-green-200",  bg: "bg-green-50",  text: "text-green-800",  sub: "text-green-600"  },
          { icon: "💰", value: "485M ₫", label: "Tổng chi tháng này",   href: "/customer/payments",   border: "border-purple-200", bg: "bg-purple-50", text: "text-purple-800", sub: "text-purple-600" },
          { icon: "⏳", value: "120M ₫", label: "Công nợ chưa thanh toán", href: "/customer/payments", border: "border-orange-200", bg: "bg-orange-50", text: "text-orange-800", sub: "text-orange-600" },
        ].map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <div className={`rounded-2xl border-2 ${kpi.border} ${kpi.bg} p-5 flex flex-col gap-1 cursor-pointer hover:opacity-90 transition-opacity`}>
              <span className="text-2xl leading-none">{kpi.icon}</span>
              <p className={`text-2xl font-extrabold ${kpi.text} leading-tight`}>{kpi.value}</p>
              <p className={`text-xs ${kpi.sub}`}>{kpi.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: bar chart + recent orders */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Monthly spending chart */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Giá trị đặt hàng theo tháng</h3>
              <p className="text-xs text-[#6B7A73] mt-0.5">Năm 2026</p>
            </CardHeader>
            <CardBody className="pt-2">
              <BarChart data={MONTHLY_BARS} height={130} color={ACCENT} />
              <div className="grid grid-cols-5 gap-2 mt-1">
                {MONTHLY_BARS.map((b) => (
                  <div key={b.label} className="text-center">
                    <p className="text-[11px] font-semibold text-[#10231C]">
                      {b.value >= 1e9 ? `${(b.value / 1e9).toFixed(1)}B` : `${(b.value / 1e6).toFixed(0)}M`}
                    </p>
                    <p className="text-[10px] text-[#6B7A73]">{b.label}/26</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Recent orders table */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-semibold text-[#10231C]">Đơn hàng gần đây</h3>
              <Link href="/customer/orders">
                <span className="text-xs font-medium hover:underline cursor-pointer" style={{ color: ACCENT }}>Xem tất cả →</span>
              </Link>
            </CardHeader>
            <CardBody className="pt-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E4EAE7]">
                    <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Mã đơn</th>
                    <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Ngày</th>
                    <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">NPP</th>
                    <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Giá trị</th>
                    <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((o) => (
                    <tr key={o.id} className="border-b border-[#F3F4F6] last:border-0">
                      <td className="py-2.5 pr-4">
                        <Link href={`/customer/orders/${o.id}`}>
                          <span className="font-mono text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer">{o.id}</span>
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-[#6B7A73]">{o.date}</td>
                      <td className="py-2.5 pr-4 text-xs text-[#10231C]">{o.supplier}</td>
                      <td className="py-2.5 pr-4 text-xs font-semibold text-[#10231C]">{fmtVND(o.amount)}</td>
                      <td className="py-2.5">
                        <Chip color={o.statusColor} variant="flat" size="sm">{o.statusLabel}</Chip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>

        {/* Right: donut + quick links */}
        <div className="flex flex-col gap-6">
          {/* Donut: payment breakdown */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Tình trạng công nợ</h3>
              <p className="text-xs text-[#6B7A73] mt-0.5">Tháng 5/2026</p>
            </CardHeader>
            <CardBody className="flex flex-col items-center gap-4">
              <DonutChart
                value={365_000_000}
                max={485_000_000}
                color={ACCENT}
                label="75%"
                sublabel="đã thanh toán"
                size={140}
                thickness={14}
              />
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                  <p className="text-[10px]" style={{ color: ACCENT }}>Đã thanh toán</p>
                  <p className="text-sm font-bold" style={{ color: "#1e40af" }}>365M ₫</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-orange-600">Còn nợ</p>
                  <p className="text-sm font-bold text-orange-700">120M ₫</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Thao tác nhanh</h3>
            </CardHeader>
            <CardBody className="pt-3 flex flex-col gap-2">
              <Link href="/customer/orders/new" className="block">
                <span className="flex items-center justify-center gap-2 w-full py-3 text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors"
                  style={{ backgroundColor: ACCENT }}>
                  🛒 Tạo đơn hàng
                </span>
              </Link>
              <Link href="/customer/catalog" className="block">
                <span className="flex items-center justify-center gap-2 w-full py-2.5 border-2 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
                  style={{ borderColor: ACCENT, color: ACCENT }}>
                  💊 Catalog thuốc
                </span>
              </Link>
              <Link href="/customer/receipts" className="block">
                <span className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-[#024430] text-[#024430] text-sm font-semibold rounded-xl cursor-pointer hover:bg-[#024430]/5 transition-colors">
                  📦 Nhận hàng
                </span>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
