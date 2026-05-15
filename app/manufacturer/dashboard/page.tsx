"use client";
import Link from "next/link";
import { useRole } from "@/lib/useRole";
import { DonutChart, BarChart } from "@/components/Charts";
import { Card, CardBody, CardHeader } from "@/components/ui";
import PageHeader from "@/components/PageHeader";

// ── Shared data ───────────────────────────────────────────────────────────────

const PRODUCTS = [
  { id: "P1", name: "Amoxicillin 500mg",  form: "Viên nang", stock: 48_000, reserved: 12_000, capacity: 80_000,  unitPrice: 1_200,  unit: "Viên", monthlyDemand: 8_500  },
  { id: "P2", name: "Paracetamol 500mg",  form: "Viên nén",  stock: 90_000, reserved: 22_000, capacity: 150_000, unitPrice: 800,    unit: "Viên", monthlyDemand: 18_000 },
  { id: "P3", name: "Ceftriaxone 1g",     form: "Bột tiêm",  stock: 1_500,  reserved: 1_200,  capacity: 30_000,  unitPrice: 45_000, unit: "Lọ",  monthlyDemand: 1_200  },
  { id: "P4", name: "Azithromycin 500mg", form: "Viên nang", stock: 20_000, reserved: 5_000,  capacity: 40_000,  unitPrice: 3_500,  unit: "Viên", monthlyDemand: 4_500  },
  { id: "P5", name: "Omeprazole 20mg",    form: "Viên nang", stock: 200,    reserved: 150,    capacity: 50_000,  unitPrice: 2_800,  unit: "Viên", monthlyDemand: 6_000  },
];

const ORDERS_FROM_NPP = [
  { id: "PO-2026-001", date: "2026-05-02", items: "Amoxicillin × 12.000, Paracetamol × 30.000", total: 38_400_000, status: "processing" },
  { id: "PO-2026-002", date: "2026-04-20", items: "Ceftriaxone × 800, Azithromycin × 4.500",     total: 51_750_000, status: "shipped"    },
  { id: "PO-2026-003", date: "2026-04-05", items: "Paracetamol × 25.000, Omeprazole × 8.000",   total: 42_400_000, status: "completed"  },
];

const MONTHLY_SALES = [
  { label: "T1", value: 185_000_000 }, { label: "T2", value: 210_000_000 },
  { label: "T3", value: 198_000_000 }, { label: "T4", value: 242_000_000 },
  { label: "T5", value: 228_000_000 },
];

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  processing: { label: "Đang xử lý", cls: "bg-orange-100 text-orange-700" },
  shipped:    { label: "Đã giao",    cls: "bg-blue-100 text-blue-700"   },
  completed:  { label: "Hoàn thành", cls: "bg-green-100 text-green-700" },
};

const QUICK_ACTIONS = [
  { icon: "📦", label: "Đơn đặt hàng", href: "/manufacturer/orders"    },
  { icon: "🏪", label: "Kho hàng",     href: "/manufacturer/inventory" },
  { icon: "📈", label: "Dự báo",       href: "/manufacturer/forecast"  },
  { icon: "📋", label: "Danh mục",     href: "/manufacturer/catalog"   },
];

function fmtNum(n: number) { return n.toLocaleString("vi-VN"); }
function monthsLeft(p: typeof PRODUCTS[number]) { return (p.stock - p.reserved) / p.monthlyDemand; }

// ── ManufacturerLogisticsDashboard ────────────────────────────────────────────

const LOGISTICS_DISPATCH_ORDERS = [
  { id: "PO-2026-001", npp: "PhytoPharma",      drug: "Amoxicillin 500mg, Paracetamol 500mg", qty: "42.000 đv", dueDate: "10/05/2026" },
  { id: "PO-2026-004", npp: "MedDistrib Co.",   drug: "Ceftriaxone 1g",                        qty: "600 lọ",    dueDate: "12/05/2026" },
  { id: "PO-2026-005", npp: "PhytoPharma",      drug: "Azithromycin 500mg",                    qty: "3.000 đv",  dueDate: "15/05/2026" },
];

const LOGISTICS_INVENTORY = [
  { name: "Amoxicillin 500mg",  stock: 48_000, reserved: 12_000, available: 36_000, unit: "Viên" },
  { name: "Paracetamol 500mg",  stock: 90_000, reserved: 22_000, available: 68_000, unit: "Viên" },
  { name: "Ceftriaxone 1g",     stock: 1_500,  reserved: 1_200,  available: 300,    unit: "Lọ"   },
  { name: "Azithromycin 500mg", stock: 20_000, reserved: 5_000,  available: 15_000, unit: "Viên" },
  { name: "Omeprazole 20mg",    stock: 200,    reserved: 150,    available: 50,     unit: "Viên" },
];

function ManufacturerLogisticsDashboard() {
  const ACCENT = "#6D28D9";
  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title="Dashboard Kho vận — Nhà cung cấp" subtitle="NCC · Kho vận" />

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/manufacturer/products">
          <div className="rounded-2xl border-2 border-purple-200 bg-[#F5F3FF] p-5 flex flex-col gap-1 cursor-pointer hover:border-purple-500 transition-colors">
            <p className="text-xs font-medium text-purple-700">Tổng SKU đang quản lý</p>
            <p className="text-4xl font-extrabold text-purple-800 leading-none">5</p>
            <p className="text-xs text-purple-600">sản phẩm</p>
          </div>
        </Link>
        <Link href="/manufacturer/orders">
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-orange-400 transition-colors">
            <p className="text-xs font-medium text-orange-700">Đơn từ NPP chờ xuất</p>
            <p className="text-4xl font-extrabold text-orange-800 leading-none">3</p>
            <p className="text-xs text-orange-600">đơn</p>
          </div>
        </Link>
        <Link href="/manufacturer/inventory">
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-red-400 transition-colors">
            <p className="text-xs font-medium text-red-700">Tồn kho thấp</p>
            <p className="text-4xl font-extrabold text-red-800 leading-none">1</p>
            <p className="text-xs text-red-600">SKU</p>
          </div>
        </Link>
      </div>

      {/* Dispatch orders table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="font-semibold text-[#10231C]">Đơn cần xuất kho</h3>
          <Link href="/manufacturer/orders">
            <span className="text-xs font-medium hover:underline cursor-pointer" style={{ color: ACCENT }}>Xem tất cả →</span>
          </Link>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4EAE7]">
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Mã đơn</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">NPP</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Thuốc</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">SL</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Ngày giao</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {LOGISTICS_DISPATCH_ORDERS.map((row) => (
                  <tr key={row.id} className="border-b border-[#F3F4F6] last:border-0">
                    <td className="py-2.5 pr-4 font-mono text-xs font-bold text-[#4C1D95]">{row.id}</td>
                    <td className="py-2.5 pr-4 text-xs text-[#10231C]">{row.npp}</td>
                    <td className="py-2.5 pr-4 text-xs text-[#6B7A73]">{row.drug}</td>
                    <td className="py-2.5 pr-4 text-xs text-[#10231C]">{row.qty}</td>
                    <td className="py-2.5 pr-4 text-xs text-[#6B7A73]">{row.dueDate}</td>
                    <td className="py-2.5">
                      <Link href={`/manufacturer/orders/${row.id}`}>
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: ACCENT }}>
                          Chuẩn bị xuất
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Inventory mini-table */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#10231C]">Tồn kho sản phẩm</h3>
        </CardHeader>
        <CardBody className="pt-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E4EAE7]">
                <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Sản phẩm</th>
                <th className="text-right text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Tồn kho</th>
                <th className="text-right text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Đã đặt trước</th>
                <th className="text-right text-xs font-semibold text-[#6B7A73] pb-2">Khả dụng</th>
              </tr>
            </thead>
            <tbody>
              {LOGISTICS_INVENTORY.map((row) => (
                <tr key={row.name} className="border-b border-[#F3F4F6] last:border-0">
                  <td className="py-2.5 pr-4 text-xs font-semibold text-[#10231C]">{row.name}</td>
                  <td className="py-2.5 pr-4 text-xs text-right text-[#10231C]">{fmtNum(row.stock)} {row.unit}</td>
                  <td className="py-2.5 pr-4 text-xs text-right text-orange-700">{fmtNum(row.reserved)} {row.unit}</td>
                  <td className={`py-2.5 text-xs text-right font-semibold ${row.available < 500 ? "text-red-600" : "text-[#6D28D9]"}`}>
                    {fmtNum(row.available)} {row.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/manufacturer/products">
          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer hover:bg-[#F5F3FF] transition-colors"
            style={{ borderColor: ACCENT }}>
            <span className="text-lg">🏭</span>
            <span className="text-sm font-semibold" style={{ color: ACCENT }}>Sản phẩm</span>
          </div>
        </Link>
        <Link href="/manufacturer/inventory">
          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer hover:bg-[#F5F3FF] transition-colors"
            style={{ borderColor: ACCENT }}>
            <span className="text-lg">🏪</span>
            <span className="text-sm font-semibold" style={{ color: ACCENT }}>Kho hàng</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ── ManufacturerFinanceDashboard ──────────────────────────────────────────────

const FINANCE_REVENUE_DATA = [
  { label: "T12", value: 1_800_000_000 },
  { label: "T1",  value: 2_100_000_000 },
  { label: "T2",  value: 1_900_000_000 },
  { label: "T3",  value: 2_400_000_000 },
  { label: "T4",  value: 2_200_000_000 },
  { label: "T5",  value: 2_400_000_000 },
];

const FINANCE_AR_TABLE = [
  { npp: "PhytoPharma",  orderCount: 5, value: 620_000_000, dueDate: "15/05/2026" },
  { npp: "MedDistrib Co.", orderCount: 2, value: 270_000_000, dueDate: "30/05/2026" },
];

function ManufacturerFinanceDashboard() {
  const ACCENT = "#6D28D9";
  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title="Dashboard Tài chính — Nhà cung cấp" subtitle="NCC · Tài chính" />

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <Link href="/manufacturer/catalog">
          <div className="rounded-2xl border-2 border-purple-200 bg-[#F5F3FF] p-5 flex flex-col gap-1 cursor-pointer hover:border-purple-500 transition-colors">
            <p className="text-xs font-medium text-purple-700">Doanh thu tháng này</p>
            <p className="text-2xl font-extrabold text-purple-800 leading-none">2,4 tỷ ₫</p>
            <p className="text-[10px] text-purple-600">tháng 5/2026</p>
          </div>
        </Link>
        <Link href="/manufacturer/catalog">
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-orange-400 transition-colors">
            <p className="text-xs font-medium text-orange-700">Công nợ phải thu từ NPP</p>
            <p className="text-2xl font-extrabold text-orange-800 leading-none">890 triệu ₫</p>
            <p className="text-[10px] text-orange-600">chưa thanh toán</p>
          </div>
        </Link>
        <Link href="/manufacturer/catalog">
          <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-green-400 transition-colors">
            <p className="text-xs font-medium text-green-700">Đã thanh toán</p>
            <p className="text-2xl font-extrabold text-green-800 leading-none">1,51 tỷ ₫</p>
            <p className="text-[10px] text-green-600">tháng 5/2026</p>
          </div>
        </Link>
        <Link href="/manufacturer/orders">
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-blue-400 transition-colors">
            <p className="text-xs font-medium text-blue-700">Đơn hoàn thành</p>
            <p className="text-2xl font-extrabold text-blue-800 leading-none">8</p>
            <p className="text-[10px] text-blue-600">đơn tháng này</p>
          </div>
        </Link>
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#10231C]">Doanh thu 6 tháng</h3>
          <p className="text-xs text-[#6B7A73] mt-0.5">Đơn vị: tỷ ₫</p>
        </CardHeader>
        <CardBody>
          <BarChart
            data={FINANCE_REVENUE_DATA}
            height={160}
            color={ACCENT}
            formatValue={(v) => v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : `${(v / 1e6).toFixed(0)}M`}
          />
        </CardBody>
      </Card>

      {/* AR table */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#10231C]">Công nợ chưa thanh toán</h3>
        </CardHeader>
        <CardBody className="pt-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E4EAE7]">
                <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">NPP</th>
                <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Số đơn</th>
                <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Giá trị</th>
                <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2">Hạn thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {FINANCE_AR_TABLE.map((row) => (
                <tr key={row.npp} className="border-b border-[#F3F4F6] last:border-0">
                  <td className="py-2.5 pr-4 text-xs font-semibold text-[#10231C]">{row.npp}</td>
                  <td className="py-2.5 pr-4 text-xs text-[#10231C]">{row.orderCount} đơn</td>
                  <td className="py-2.5 pr-4 text-xs font-semibold text-orange-700">{(row.value / 1e6).toFixed(0)}M ₫</td>
                  <td className="py-2.5 text-xs text-[#6B7A73]">{row.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

// ── ManufacturerAdminDashboard (existing content) ────────────────────────────

function ManufacturerAdminDashboard() {
  const totalStockValue = PRODUCTS.reduce((s, p) => s + p.stock * p.unitPrice, 0);
  const pendingOrders   = ORDERS_FROM_NPP.filter((o) => o.status === "processing").length;
  const lowStockItems   = PRODUCTS.filter((p) => monthsLeft(p) < 1.5);
  const RECEIVABLE = 132_500_000;
  const TOTAL_AR   = 413_000_000;

  return (
    <div>
      <PageHeader title="Bảng điều khiển" subtitle="Nhà cung cấp · Quản lý sản xuất & kho" />

      {lowStockItems.length > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
          <span>⚠️</span>
          <p className="text-sm font-medium text-red-800">
            {lowStockItems.map((p) => p.name).join(" và ")}: tồn kho &lt; 2 tháng — Lên kế hoạch sản xuất
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-4 py-4">
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">🏭</span><p className="text-xs font-medium text-[#6D28D9]">Sản phẩm đang SX</p></div>
          <p className="text-2xl font-bold text-[#4C1D95]">{PRODUCTS.length}</p>
          <p className="text-xs text-[#7C3AED] mt-0.5">hoạt động</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-4">
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">📦</span><p className="text-xs font-medium text-orange-700">Đơn từ NPP</p></div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-orange-800">{ORDERS_FROM_NPP.length}</p>
            <span className="mb-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full bg-orange-200 text-orange-800">{pendingOrders} chờ</span>
          </div>
          <p className="text-xs text-orange-600 mt-0.5">đơn đặt hàng</p>
        </div>
        <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-4 py-4">
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">🏪</span><p className="text-xs font-medium text-[#6D28D9]">Tổng tồn kho</p></div>
          <p className="text-2xl font-bold text-[#4C1D95]">{(totalStockValue / 1e9).toFixed(1)} tỷ</p>
          <p className="text-xs text-[#7C3AED] mt-0.5">₫ giá trị kho</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-4">
          <div className="flex items-center gap-2 mb-2"><span className="text-xl">💰</span><p className="text-xs font-medium text-red-700">Công nợ NPP</p></div>
          <p className="text-2xl font-bold text-red-800">132.5M</p>
          <p className="text-xs text-red-600 mt-0.5">₫ còn phải thu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Mức tồn kho sản phẩm</h3>
              <p className="text-xs text-[#6B7A73] mt-0.5">Còn lại theo tháng tiêu thụ</p>
            </CardHeader>
            <CardBody className="pt-3 flex flex-col gap-4">
              {PRODUCTS.map((p) => {
                const months   = monthsLeft(p);
                const pct      = Math.round((p.stock / p.capacity) * 100);
                const barColor = months < 2 ? "#EF4444" : months < 3 ? "#F59E0B" : "#6D28D9";
                const txtColor = months < 2 ? "text-red-600" : months < 3 ? "text-amber-600" : "text-[#6D28D9]";
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <p className="text-sm font-semibold text-[#10231C]">{p.name}</p>
                        <p className="text-[10px] text-[#6B7A73]">{p.form} · {fmtNum(p.stock)} / {fmtNum(p.capacity)} {p.unit}</p>
                      </div>
                      <span className={`text-xs font-bold ${txtColor}`}>{months < 0.1 ? "< 0.1" : months.toFixed(1)} tháng còn</span>
                    </div>
                    <div className="w-full h-2 bg-[#EDE9FE] rounded-full overflow-hidden">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Doanh thu bán cho NPP</h3>
              <p className="text-xs text-[#6B7A73] mt-0.5">T1–T5 / 2026</p>
            </CardHeader>
            <CardBody className="pt-2">
              <BarChart data={MONTHLY_SALES} color="#6D28D9" height={160}
                formatValue={(v) => v >= 1e9 ? `${(v/1e9).toFixed(1)}B` : `${(v/1e6).toFixed(0)}M`} />
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-semibold text-[#10231C]">Đơn đặt hàng từ NPP</h3>
              <Link href="/manufacturer/orders"><span className="text-xs text-[#6D28D9] font-medium hover:underline cursor-pointer">Xem tất cả →</span></Link>
            </CardHeader>
            <CardBody className="pt-3 flex flex-col gap-3">
              {ORDERS_FROM_NPP.map((o) => {
                const cfg = STATUS_CFG[o.status] ?? { label: o.status, cls: "bg-gray-100 text-gray-700" };
                return (
                  <div key={o.id} className="p-3 rounded-xl border border-[#EDE9FE] bg-[#FAFAFF] hover:bg-[#F5F3FF] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-[#4C1D95]">{o.id}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-[#6B7A73] truncate mb-1">{o.items}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#6B7A73]">{o.date}</span>
                      <span className="text-xs font-bold text-[#6D28D9]">{(o.total / 1e6).toFixed(1)}M ₫</span>
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Công nợ phải thu</h3>
              <p className="text-xs text-[#6B7A73] mt-0.5">Từ PhytoPharma (NPP)</p>
            </CardHeader>
            <CardBody className="pt-2">
              <div className="flex items-center gap-6">
                <DonutChart value={RECEIVABLE} max={TOTAL_AR} label="32%" sublabel="còn nợ"
                  color="#F97316" size={110} thickness={12} showPercent={false} />
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                    <div><p className="text-[10px] text-[#6B7A73]">Đã thu</p><p className="text-sm font-bold text-green-700">280.5M ₫</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
                    <div><p className="text-[10px] text-[#6B7A73]">Còn nợ</p><p className="text-sm font-bold text-orange-700">132.5M ₫</p></div>
                  </div>
                  <div className="pt-1 border-t border-[#EDE9FE]">
                    <p className="text-[10px] text-[#6B7A73]">Tổng phải thu</p>
                    <p className="text-sm font-bold text-[#4C1D95]">413M ₫</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-semibold text-[#10231C]">Truy cập nhanh</h3></CardHeader>
            <CardBody className="pt-3">
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map((a) => (
                  <Link key={a.href} href={a.href}>
                    <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] hover:bg-[#EDE9FE] hover:border-[#6D28D9] transition-colors cursor-pointer">
                      <span className="text-2xl">{a.icon}</span>
                      <span className="text-xs font-semibold text-[#6D28D9] text-center">{a.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Entry point ───────────────────────────────────────────────────────────────

export default function ManufacturerDashboard() {
  const role = useRole();
  if (role.isManufacturerLogistics) return <ManufacturerLogisticsDashboard />;
  if (role.isManufacturerFinance)   return <ManufacturerFinanceDashboard />;
  return <ManufacturerAdminDashboard />;
}
