"use client";
import Link from "next/link";
import { useRole } from "@/lib/useRole";
import { DonutChart, BarChart } from "@/components/Charts";
import { Card, CardBody, CardHeader, Chip } from "@/components/ui";
import PageHeader from "@/components/PageHeader";
import { fmtVND, fmtDate } from "@/lib/format";

// ─── Shared data ───────────────────────────────────────────────────────────────

const CONTRACT = {
  code: "HD-NTH-MPH-2026-001", supplier: "PhytoPharma",
  total: 850_000_000, requested: 320_000_000, paid: 180_000_000, outstanding: 45_000_000,
  items: [
    { name: "Paracetamol 500mg", unit: "Hộp", contracted: 2_000, requested: 800,  remaining: 1_200, price: 22_000 },
    { name: "Amoxicillin 500mg", unit: "Hộp", contracted: 1_000, requested: 450,  remaining: 550,   price: 48_000 },
    { name: "Vitamin C 500mg",   unit: "Lọ",  contracted: 500,   requested: 280,  remaining: 220,   price: 35_000 },
  ],
};

const RECENT_ORDERS = [
  { id: "NT-ORD-003", date: "2026-05-05", items: "Paracetamol × 200 hộp", total: 4_400_000, status: "shipping" },
  { id: "NT-ORD-002", date: "2026-04-20", items: "Amoxicillin × 150 hộp, Vitamin C × 100 lọ", total: 10_700_000, status: "received_confirmed" },
  { id: "NT-ORD-001", date: "2026-04-01", items: "Paracetamol × 250 hộp", total: 5_500_000, status: "received_confirmed" },
];

const MONTHLY_SPEND = [
  { label: "T3", value: 7_200_000 },
  { label: "T4", value: 16_200_000 },
  { label: "T5", value: 4_400_000 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(a: number, b: number) { return b > 0 ? Math.round((a / b) * 100) : 0; }

function barColorClass(used: number, contracted: number) {
  const p = pct(used, contracted);
  if (p > 80) return "bg-red-500";
  if (p > 60) return "bg-amber-500";
  return "bg-[#0F766E]";
}

// ─── PharmacyWarehouseDashboard ───────────────────────────────────────────────

const WAREHOUSE_STOCK = [
  { name: "Paracetamol 500mg", stock: 185, unit: "hộp", status: "ok"  },
  { name: "Amoxicillin 500mg", stock:  42, unit: "hộp", status: "low" },
  { name: "Vitamin C 500mg",   stock: 120, unit: "lọ",  status: "ok"  },
  { name: "Ibuprofen 200mg",   stock:  18, unit: "hộp", status: "low" },
  { name: "Omeprazole 20mg",   stock: 230, unit: "hộp", status: "ok"  },
];

const WAREHOUSE_INCOMING = [
  {
    id: "NT-ORD-003",
    npp: "PhytoPharma",
    drugs: "Paracetamol 500mg × 200 hộp",
    eta: "08/05/2026",
    status: "shipping",
  },
];

function PharmacyWarehouseDashboard() {
  const ACCENT = "#0F766E";
  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title="Dashboard Kho vận — Nhà thuốc" subtitle="Nhà thuốc · Kho vận" />

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/pharmacy/orders">
          <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-teal-500 transition-colors">
            <p className="text-xs font-medium text-teal-700">Đơn đang giao</p>
            <p className="text-4xl font-extrabold text-teal-800 leading-none">1</p>
            <p className="text-xs text-teal-600">đơn</p>
          </div>
        </Link>
        <Link href="/pharmacy/orders">
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-orange-400 transition-colors">
            <p className="text-xs font-medium text-orange-700">Chờ xác nhận nhận hàng</p>
            <p className="text-4xl font-extrabold text-orange-800 leading-none">1</p>
            <p className="text-xs text-orange-600">đơn</p>
          </div>
        </Link>
        <Link href="/pharmacy/drugs">
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-red-400 transition-colors">
            <p className="text-xs font-medium text-red-700">Sản phẩm tồn kho thấp</p>
            <p className="text-4xl font-extrabold text-red-800 leading-none">2</p>
            <p className="text-xs text-red-600">sản phẩm</p>
          </div>
        </Link>
      </div>

      {/* Incoming shipments */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#10231C]">Đơn hàng đang vận chuyển</h3>
        </CardHeader>
        <CardBody className="pt-0 flex flex-col gap-3">
          {WAREHOUSE_INCOMING.map((shipment) => (
            <div key={shipment.id} className="p-4 rounded-xl border border-teal-100 bg-teal-50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-teal-800">{shipment.id}</span>
                <span className="text-xs text-teal-600">NPP: {shipment.npp}</span>
              </div>
              <p className="text-sm text-[#10231C]">{shipment.drugs}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B7A73]">ETA: <span className="font-semibold text-[#10231C]">{shipment.eta}</span></span>
                <Link href="/pharmacy/orders">
                  <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: ACCENT }}>
                    Xem đơn & chuẩn bị nhận hàng
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Stock mini-list */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#10231C]">Tồn kho hiện tại</h3>
          <p className="text-xs text-[#6B7A73] mt-0.5">Chỉ xem</p>
        </CardHeader>
        <CardBody className="pt-0 flex flex-col gap-2">
          {WAREHOUSE_STOCK.map((row) => (
            <div key={row.name} className="flex items-center justify-between py-2 border-b border-[#F0FDFA] last:border-0">
              <span className="text-xs font-semibold text-[#10231C]">{row.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#10231C]">{row.stock} {row.unit}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  row.status === "low" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}>
                  {row.status === "low" ? "Tồn thấp" : "Bình thường"}
                </span>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

// ─── PharmacyFinanceDashboard ─────────────────────────────────────────────────

const FINANCE_PENDING_PAYMENTS = [
  { id: "NT-ORD-003", value: 4_400_000,  dueDate: "20/05/2026" },
  { id: "NT-ORD-002", value: 10_700_000, dueDate: "30/05/2026" },
];

function PharmacyFinanceDashboard() {
  const ACCENT = "#0F766E";
  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title="Dashboard Tài chính — Nhà thuốc" subtitle="Nhà thuốc · Tài chính" />

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/pharmacy/payments">
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-orange-400 transition-colors">
            <p className="text-xs font-medium text-orange-700">Công nợ phải trả</p>
            <p className="text-2xl font-extrabold text-orange-800 leading-none">2,2 triệu ₫</p>
            <p className="text-[10px] text-orange-600">chưa thanh toán</p>
          </div>
        </Link>
        <Link href="/pharmacy/payments">
          <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-green-400 transition-colors">
            <p className="text-xs font-medium text-green-700">Đã thanh toán tháng này</p>
            <p className="text-2xl font-extrabold text-green-800 leading-none">1,96 triệu ₫</p>
            <p className="text-[10px] text-green-600">tháng 5/2026</p>
          </div>
        </Link>
        <Link href="/pharmacy/payments">
          <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-teal-500 transition-colors">
            <p className="text-xs font-medium text-teal-700">Đơn chờ thanh toán</p>
            <p className="text-2xl font-extrabold text-teal-800 leading-none">1</p>
            <p className="text-[10px] text-teal-600">đơn</p>
          </div>
        </Link>
      </div>

      {/* Pending payments list */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#10231C]">Đơn cần thanh toán</h3>
        </CardHeader>
        <CardBody className="pt-0 flex flex-col gap-3">
          {FINANCE_PENDING_PAYMENTS.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-orange-100 bg-orange-50">
              <div>
                <p className="text-sm font-semibold text-[#10231C]">{item.id}</p>
                <p className="text-xs text-orange-700 mt-0.5">Hạn: {item.dueDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold text-orange-800">{fmtVND(item.value)}</p>
                <Link href="/pharmacy/payments">
                  <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: ACCENT }}>
                    Thanh toán ngay
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/pharmacy/payments">
          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer hover:bg-teal-50 transition-colors"
            style={{ borderColor: ACCENT }}>
            <span className="text-lg">💳</span>
            <span className="text-sm font-semibold" style={{ color: ACCENT }}>Thanh toán</span>
          </div>
        </Link>
        <Link href="/pharmacy/contracts">
          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer hover:bg-teal-50 transition-colors"
            style={{ borderColor: ACCENT }}>
            <span className="text-lg">📋</span>
            <span className="text-sm font-semibold" style={{ color: ACCENT }}>Hợp đồng</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ─── PharmacyAdminDashboard (existing content) ────────────────────────────────

function PharmacyAdminDashboard() {
  const quota = CONTRACT.total - CONTRACT.requested;

  return (
    <div>
      <PageHeader
        title="Nhà thuốc Minh Phúc"
        actions={
          <Link href="/pharmacy/orders/new">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] text-white text-sm font-medium rounded-xl cursor-pointer hover:bg-[#0d6560]">
              ＋ Đặt hàng ngay
            </span>
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-[#99F6E4] bg-[#F0FDFA] p-4">
          <p className="text-xs text-[#0F766E] font-medium mb-1">Quota còn lại</p>
          <p className="text-2xl font-bold text-[#0F766E]">{fmtVND(quota)}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs text-blue-600 font-medium mb-1">Đơn đang giao</p>
          <p className="text-2xl font-bold text-blue-700">1</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs text-red-600 font-medium mb-1">Còn nợ</p>
          <p className="text-2xl font-bold text-red-600">{fmtVND(CONTRACT.outstanding)}</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 flex flex-col gap-6">
          <Card>
            <CardHeader><h3 className="font-semibold text-[#10231C]">Tình trạng thuốc theo hợp đồng</h3></CardHeader>
            <CardBody className="pt-2 flex flex-col gap-3">
              {CONTRACT.items.map((item) => {
                const usedPct = pct(item.requested, item.contracted);
                const bar = barColorClass(item.requested, item.contracted);
                return (
                  <div key={item.name} className="flex items-center gap-4 p-3 bg-[#F0FDFA] rounded-xl border border-[#99F6E4]">
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm font-semibold text-[#10231C]">{item.name}</span>
                        <span className="text-xl font-bold text-[#0F766E]">{item.remaining.toLocaleString("vi-VN")} <span className="text-xs font-normal text-[#6B7A73]">{item.unit} còn</span></span>
                      </div>
                      <div className="w-full bg-[#ccfbf1] rounded-full h-2">
                        <div className={`h-2 rounded-full ${bar}`} style={{ width: `${Math.min(100, usedPct)}%` }} />
                      </div>
                      <p className="text-[10px] text-[#6B7A73] mt-0.5">Đã đặt {item.requested}/{item.contracted} ({usedPct}%)</p>
                    </div>
                    <Link href="/pharmacy/orders/new">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#0F766E] text-white cursor-pointer hover:bg-[#0d6560] whitespace-nowrap">Đặt thêm</span>
                    </Link>
                  </div>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-semibold text-[#10231C]">Chi tiêu 3 tháng gần nhất</h3></CardHeader>
            <CardBody className="pt-0">
              <BarChart
                data={MONTHLY_SPEND}
                color="#0F766E"
                height={140}
                formatValue={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : String(v)}
              />
            </CardBody>
          </Card>
        </div>

        <div className="col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader><h3 className="font-semibold text-[#10231C]">Sử dụng hợp đồng</h3></CardHeader>
            <CardBody className="pt-0 flex flex-col items-center">
              <DonutChart
                value={CONTRACT.requested}
                max={CONTRACT.total}
                color="#0F766E"
                label="38%"
                sublabel="đã đặt"
                size={130}
                thickness={12}
              />
              <p className="text-sm text-[#6B7A73] mt-2">Còn lại: <span className="font-bold text-[#0F766E]">530M ₫</span></p>
              <p className="text-[11px] text-[#6B7A73] mt-0.5">{CONTRACT.code} · {CONTRACT.supplier}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-semibold text-[#10231C]">Đơn hàng gần đây</h3>
              <Link href="/pharmacy/orders"><span className="text-xs text-[#0F766E] cursor-pointer hover:underline">Xem tất cả</span></Link>
            </CardHeader>
            <CardBody className="pt-1 flex flex-col gap-2">
              {RECENT_ORDERS.map((o) => (
                <div key={o.id} className="flex items-start justify-between gap-2 py-2 border-b border-[#F0FDFA] last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#10231C]">{o.id}</span>
                      {o.status === "shipping" ? (
                        <Chip color="primary" variant="flat" size="sm">Đang giao</Chip>
                      ) : (
                        <Chip color="success" variant="flat" size="sm">Đã nhận</Chip>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B7A73] truncate mt-0.5">{o.items}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{fmtDate(o.date)}</p>
                  </div>
                  <p className="text-xs font-bold text-[#0F766E] whitespace-nowrap">{fmtVND(o.total)}</p>
                </div>
              ))}
            </CardBody>
          </Card>

          {CONTRACT.outstanding > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">
                Còn nợ {fmtVND(CONTRACT.outstanding)} · Hạn 15/06/2026
              </p>
              <Link href="/pharmacy/payments">
                <span className="inline-block mt-2 text-xs font-medium px-3 py-1.5 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700">Xem chi tiết</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function PharmacyDashboard() {
  const role = useRole();
  if (role.isPharmacyWarehouse) return <PharmacyWarehouseDashboard />;
  if (role.isPharmacyFinance)   return <PharmacyFinanceDashboard />;
  return <PharmacyAdminDashboard />;
}
