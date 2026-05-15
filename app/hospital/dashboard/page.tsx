"use client";
import { useApp } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { fmtVND, fmtDate, pct } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader, Chip, Progress } from "@/components/ui";
import { DonutChart, BarChart } from "@/components/Charts";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { mockContracts } from "@/domain/mock/contracts";
import Link from "next/link";

// ── HospitalWarehouseDashboard ────────────────────────────────────────────────

const WAREHOUSE_INCOMING_SHIPMENTS = [
  {
    id: "SHIP-2026-011",
    npp: "PhytoPharma",
    drugs: "Paracetamol 500mg × 500 hộp, Ibuprofen 400mg × 200 hộp",
    eta: "08/05/2026",
  },
  {
    id: "SHIP-2026-012",
    npp: "PhytoPharma",
    drugs: "Amoxicillin 500mg × 300 hộp",
    eta: "10/05/2026",
  },
];

const WAREHOUSE_STOCK = [
  { name: "Paracetamol 500mg", stock: 1_240, unit: "hộp", status: "ok"  },
  { name: "Ibuprofen 400mg",   stock:   380, unit: "hộp", status: "ok"  },
  { name: "Amoxicillin 500mg", stock:    45, unit: "hộp", status: "low" },
  { name: "Metformin 500mg",   stock:   720, unit: "hộp", status: "ok"  },
  { name: "Amlodipine 5mg",    stock:    62, unit: "hộp", status: "low" },
];

function HospitalWarehouseDashboard() {
  const ACCENT = "#1D4ED8";
  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title="Dashboard Kho vận — Bệnh viện" subtitle="Bệnh viện · Kho vận" />

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/hospital/orders">
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-blue-400 transition-colors">
            <p className="text-xs font-medium text-blue-700">Lô hàng đang trên đường</p>
            <p className="text-4xl font-extrabold text-blue-800 leading-none">2</p>
            <p className="text-xs text-blue-600">lô</p>
          </div>
        </Link>
        <Link href="/hospital/orders">
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-orange-400 transition-colors">
            <p className="text-xs font-medium text-orange-700">Chờ nghiệm thu hôm nay</p>
            <p className="text-4xl font-extrabold text-orange-800 leading-none">1</p>
            <p className="text-xs text-orange-600">lô</p>
          </div>
        </Link>
        <Link href="/hospital/orders">
          <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-green-400 transition-colors">
            <p className="text-xs font-medium text-green-700">Đã nhập kho tháng này</p>
            <p className="text-4xl font-extrabold text-green-800 leading-none">8</p>
            <p className="text-xs text-green-600">lô</p>
          </div>
        </Link>
      </div>

      {/* Incoming shipments */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#10231C]">Lô hàng đến hôm nay / tuần này</h3>
        </CardHeader>
        <CardBody className="pt-0 flex flex-col gap-3">
          {WAREHOUSE_INCOMING_SHIPMENTS.map((shipment) => (
            <div key={shipment.id} className="p-4 rounded-xl border border-blue-100 bg-blue-50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-800">{shipment.id}</span>
                <span className="text-xs text-blue-600">NPP: {shipment.npp}</span>
              </div>
              <p className="text-sm text-[#10231C]">{shipment.drugs}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B7A73]">ETA: <span className="font-semibold text-[#10231C]">{shipment.eta}</span></span>
                <Link href="/hospital/orders">
                  <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: ACCENT }}>
                    Chuẩn bị biên bản nghiệm thu
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Stock mini-table */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#10231C]">Tồn kho hiện tại</h3>
          <p className="text-xs text-[#6B7A73] mt-0.5">Chỉ xem — cập nhật do bộ phận nghiệm thu</p>
        </CardHeader>
        <CardBody className="pt-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E4EAE7]">
                <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Thuốc</th>
                <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Tồn kho BV</th>
                <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2">Tình trạng</th>
              </tr>
            </thead>
            <tbody>
              {WAREHOUSE_STOCK.map((row) => (
                <tr key={row.name} className="border-b border-[#F3F4F6] last:border-0">
                  <td className="py-2.5 pr-4 text-xs font-semibold text-[#10231C]">{row.name}</td>
                  <td className="py-2.5 pr-4 text-xs text-[#10231C]">{row.stock.toLocaleString("vi-VN")} {row.unit}</td>
                  <td className="py-2.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      row.status === "low" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>
                      {row.status === "low" ? "Tồn thấp" : "Bình thường"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Link href="/hospital/orders">
        <div className="flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer hover:bg-blue-50 transition-colors"
          style={{ borderColor: ACCENT }}>
          <span className="text-sm font-semibold" style={{ color: ACCENT }}>Xem tất cả đơn hàng →</span>
        </div>
      </Link>
    </div>
  );
}

// ── HospitalFinanceDashboard ──────────────────────────────────────────────────

const FINANCE_PAYMENT_SCHEDULE = [
  { contract: "CTR-2026-001", amount: 450_000_000, deadline: "15/05/2026", status: "upcoming" },
  { contract: "CTR-2026-002", amount: 230_000_000, deadline: "30/05/2026", status: "upcoming" },
  { contract: "CTR-2026-001", amount: 180_000_000, deadline: "15/06/2026", status: "scheduled" },
];

function HospitalFinanceDashboard() {
  const ACCENT = "#1D4ED8";
  const CONTRACT_TOTAL = 12_700_000_000;
  const USED_VALUE     =  2_870_000_000;

  const scheduleStatusCls: Record<string, string> = {
    upcoming:  "bg-orange-100 text-orange-700",
    scheduled: "bg-blue-100 text-blue-700",
    paid:      "bg-green-100 text-green-700",
  };
  const scheduleStatusLabel: Record<string, string> = {
    upcoming:  "Sắp đến hạn",
    scheduled: "Đã lên lịch",
    paid:      "Đã thanh toán",
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title="Dashboard Tài chính — Bệnh viện" subtitle="Bệnh viện · Tài chính" />

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <Link href="/hospital/payments">
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-orange-400 transition-colors">
            <p className="text-xs font-medium text-orange-700">Công nợ phải trả NPP</p>
            <p className="text-2xl font-extrabold text-orange-800 leading-none">1,2 tỷ ₫</p>
            <p className="text-[10px] text-orange-600">chưa thanh toán</p>
          </div>
        </Link>
        <Link href="/hospital/payments">
          <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-green-400 transition-colors">
            <p className="text-xs font-medium text-green-700">Đã thanh toán tháng này</p>
            <p className="text-2xl font-extrabold text-green-800 leading-none">680 triệu ₫</p>
            <p className="text-[10px] text-green-600">tháng 5/2026</p>
          </div>
        </Link>
        <Link href="/hospital/payments">
          <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-green-400 transition-colors">
            <p className="text-xs font-medium text-green-700">Quá hạn</p>
            <p className="text-2xl font-extrabold text-green-800 leading-none">0 ₫</p>
            <p className="text-[10px] text-green-600">Không có nợ quá hạn</p>
          </div>
        </Link>
        <Link href="/hospital/contracts">
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-blue-400 transition-colors">
            <p className="text-xs font-medium text-blue-700">Tổng giá trị HĐ đang HĐ</p>
            <p className="text-2xl font-extrabold text-blue-800 leading-none">12,7 tỷ ₫</p>
            <p className="text-[10px] text-blue-600">hợp đồng hoạt động</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut: budget usage */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-[#10231C]">Ngân sách hợp đồng</h3>
            <p className="text-xs text-[#6B7A73] mt-0.5">Đã sử dụng / tổng giá trị HĐ</p>
          </CardHeader>
          <CardBody className="flex flex-col items-center gap-4">
            <DonutChart
              value={USED_VALUE}
              max={CONTRACT_TOTAL}
              color={ACCENT}
              label="22%"
              sublabel="đã dùng"
              size={140}
              thickness={14}
            />
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <p className="text-[10px] text-blue-600">Đã sử dụng</p>
                <p className="text-sm font-bold text-blue-800">2,87 tỷ ₫</p>
              </div>
              <div className="bg-[#F6F8F7] border border-[#E4EAE7] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#6B7A73]">Còn lại</p>
                <p className="text-sm font-bold text-[#10231C]">9,83 tỷ ₫</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Payment schedule */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-semibold text-[#10231C]">Lịch thanh toán</h3>
            <Link href="/hospital/payments">
              <span className="text-xs font-medium hover:underline cursor-pointer" style={{ color: ACCENT }}>Xem tất cả →</span>
            </Link>
          </CardHeader>
          <CardBody className="pt-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4EAE7]">
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-3">HĐ</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-3">Số tiền</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-3">Hạn chót</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {FINANCE_PAYMENT_SCHEDULE.map((row, i) => (
                  <tr key={i} className="border-b border-[#F3F4F6] last:border-0">
                    <td className="py-2.5 pr-3 font-mono text-[10px] font-bold text-[#10231C]">{row.contract}</td>
                    <td className="py-2.5 pr-3 text-xs text-[#10231C]">{fmtVND(row.amount)}</td>
                    <td className="py-2.5 pr-3 text-xs text-[#6B7A73]">{row.deadline}</td>
                    <td className="py-2.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${scheduleStatusCls[row.status]}`}>
                        {scheduleStatusLabel[row.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/hospital/payments">
          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer hover:bg-blue-50 transition-colors"
            style={{ borderColor: ACCENT }}>
            <span className="text-lg">💳</span>
            <span className="text-sm font-semibold" style={{ color: ACCENT }}>Thanh toán</span>
          </div>
        </Link>
        <Link href="/hospital/contracts">
          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer hover:bg-blue-50 transition-colors"
            style={{ borderColor: ACCENT }}>
            <span className="text-lg">📋</span>
            <span className="text-sm font-semibold" style={{ color: ACCENT }}>Hợp đồng</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ── HospitalBuyerDashboard ────────────────────────────────────────────────────

function HospitalBuyerDashboard() {
  const { state } = useApp();
  const { contract, orders, payments } = state;

  const myOrders = orders.filter((o) => o.contractId === contract.id);
  const inDeliveryOrders = myOrders.filter((o) =>
    ["confirmed", "preparing", "shipping"].includes(o.status)
  );
  const deliveredOrders = myOrders.filter((o) => o.status === "delivered");
  const pendingOrders = myOrders.filter((o) => o.status === "pending_confirmation");
  const outstandingTotal = payments
    .filter((p) => p.contractId === contract.id && p.status !== "paid")
    .reduce((s, p) => s + p.outstandingAmount, 0);

  const activeContractCount = mockContracts.filter(
    (c) => c.contractStatus === "active" && c.hospitalName === contract.hospitalName
  ).length;

  const lowStockItem = contract.items.find((item) =>
    item.contractedQty > 0 && (item.requestedQty / item.contractedQty) >= 0.7
  );

  const monthlyBars = ["T1", "T2", "T3", "T4", "T5"].map((label, m) => ({
    label,
    value: myOrders
      .filter((o) => {
        const d = new Date(o.orderDate);
        return d.getFullYear() === 2026 && d.getMonth() === m;
      })
      .reduce((s, o) => s + o.totalRequestedAmount, 0),
    color: "#1D4ED8",
  }));

  const recentOrders = [...myOrders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <PageHeader title="Bảng điều khiển" />
          <p className="text-sm text-[#6B7A73] mt-0.5">Chào mừng, Phụ trách mua hàng</p>
        </div>
        <Link href="/hospital/orders/new">
          <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-sm font-semibold rounded-xl cursor-pointer shadow-sm transition-colors">
            ＋ Tạo đơn hàng
          </span>
        </Link>
      </div>

      {lowStockItem && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-sm font-medium text-amber-800 flex-1">
            ⚠️ {lowStockItem.productName} sắp hết quota — Đặt ngay →
          </span>
          <Link href="/hospital/orders/new">
            <span className="text-xs font-bold text-amber-700 underline cursor-pointer">Đặt hàng</span>
          </Link>
        </div>
      )}
      {deliveredOrders.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <span className="text-sm font-medium text-emerald-800 flex-1">
            ✅ {deliveredOrders.length} đơn đã giao, chờ nghiệm thu
          </span>
          <Link href="/hospital/orders">
            <span className="text-xs font-bold text-emerald-700 underline cursor-pointer">Xem ngay</span>
          </Link>
        </div>
      )}
      {pendingOrders.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl">
          <span className="text-sm font-medium text-[#1D4ED8] flex-1">
            🕐 {pendingOrders.length} đơn đang chờ nhà cung cấp xác nhận
          </span>
          <Link href="/hospital/orders">
            <span className="text-xs font-bold text-[#1D4ED8] underline cursor-pointer">Theo dõi</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: "📄", value: String(activeContractCount), label: "Hợp đồng hoạt động", accent: "text-[#1D4ED8]" },
          { icon: "🚚", value: String(inDeliveryOrders.length), label: "Đơn đang giao", accent: "text-[#024430]" },
          { icon: "📦", value: String(deliveredOrders.length), label: "Chờ nghiệm thu", accent: deliveredOrders.length > 0 ? "text-amber-600" : "text-[#024430]" },
          { icon: "💳", value: fmtVND(outstandingTotal), label: "Công nợ", accent: outstandingTotal > 0 ? "text-red-600" : "text-[#024430]" },
        ].map((k) => (
          <Card key={k.label} className="p-4 flex flex-col gap-1">
            <span className="text-2xl leading-none">{k.icon}</span>
            <p className={`text-xl font-extrabold ${k.accent} leading-tight`}>{k.value}</p>
            <p className="text-xs text-[#6B7A73]">{k.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-semibold text-[#10231C]">Quota hợp đồng</h3>
              <Link href="/hospital/contracts">
                <span className="text-xs text-[#1D4ED8] font-medium cursor-pointer hover:underline">Xem hợp đồng →</span>
              </Link>
            </CardHeader>
            <CardBody className="pt-3">
              <div className="grid grid-cols-3 gap-4">
                {contract.items.map((item) => {
                  const usedPct = item.contractedQty > 0
                    ? Math.round((item.requestedQty / item.contractedQty) * 100)
                    : 0;
                  const donutColor = usedPct >= 80 ? "#EF4444" : usedPct >= 60 ? "#F59E0B" : "#024430";
                  return (
                    <div key={item.id} className="flex flex-col items-center gap-1 text-center">
                      <DonutChart
                        value={item.requestedQty}
                        max={item.contractedQty}
                        color={donutColor}
                        size={80}
                        thickness={8}
                      />
                      <p className="text-xs font-bold text-[#10231C] leading-tight line-clamp-2">{item.productName}</p>
                      <p className="text-[10px] text-[#6B7A73]">Còn {item.remainingQty.toLocaleString("vi-VN")} hộp</p>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Giá trị đặt hàng theo tháng</h3>
            </CardHeader>
            <CardBody className="pt-2">
              <BarChart data={monthlyBars} height={130} color="#1D4ED8" />
              <div className="grid grid-cols-5 gap-2 mt-1">
                {monthlyBars.map((b) => (
                  <div key={b.label} className="text-center">
                    <p className="text-[11px] font-semibold text-[#10231C]">
                      {b.value > 0 ? (b.value >= 1e9 ? `${(b.value / 1e9).toFixed(1)}B` : `${(b.value / 1e6).toFixed(0)}M`) : "—"}
                    </p>
                    <p className="text-[10px] text-[#6B7A73]">{b.label}/26</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Thao tác nhanh</h3>
            </CardHeader>
            <CardBody className="pt-3 flex flex-col gap-2">
              <Link href="/hospital/orders/new" className="block">
                <span className="flex items-center justify-center gap-2 w-full py-3 bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors">
                  🛒 Tạo đơn hàng
                </span>
              </Link>
              <Link href="/hospital/contracts" className="block">
                <span className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-[#1D4ED8] text-[#1D4ED8] text-sm font-semibold rounded-xl cursor-pointer hover:bg-[#EFF6FF] transition-colors">
                  📋 Xem hợp đồng
                </span>
              </Link>
              <Link href="/hospital/payments" className="block">
                <span className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-[#024430] text-[#024430] text-sm font-semibold rounded-xl cursor-pointer hover:bg-[#024430]/5 transition-colors">
                  💳 Thanh toán
                </span>
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-semibold text-[#10231C]">Đơn hàng gần đây</h3>
              <Link href="/hospital/orders">
                <span className="text-xs text-[#1D4ED8] font-medium cursor-pointer hover:underline">Xem tất cả</span>
              </Link>
            </CardHeader>
            <CardBody className="pt-2 flex flex-col gap-2">
              {recentOrders.length === 0 && (
                <p className="text-xs text-[#6B7A73] text-center py-4">Chưa có đơn hàng</p>
              )}
              {recentOrders.map((o) => (
                <div key={o.id} className="flex flex-col gap-1 p-3 rounded-xl border border-[#E4EAE7]">
                  <div className="flex items-center justify-between gap-2">
                    <Chip color="default" variant="flat" size="sm">{o.id}</Chip>
                    <Chip color={ORDER_STATUS_COLORS[o.status]} variant="flat" size="sm">
                      {ORDER_STATUS_LABELS[o.status]}
                    </Chip>
                  </div>
                  <p className="text-sm font-bold text-[#10231C]">{fmtVND(o.totalRequestedAmount)}</p>
                  {o.status === "delivered" && (
                    <Link href={`/hospital/orders/${o.id}`}>
                      <span className="block text-center text-xs font-semibold py-1.5 bg-[#024430] text-white rounded-lg cursor-pointer mt-1">
                        Xác nhận nghiệm thu
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Thanh toán</h3>
            </CardHeader>
            <CardBody className="pt-2">
              {[
                { label: "Đã giao hàng",  value: contract.deliveredValue,  color: "text-emerald-700" },
                { label: "Đã thanh toán", value: contract.paidValue,       color: "text-[#024430]"  },
                { label: "Còn phải trả",  value: contract.outstandingValue, color: "text-red-600"    },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center py-2 border-b border-[#E4EAE7] last:border-0">
                  <span className="text-xs text-[#6B7A73]">{s.label}</span>
                  <span className={`text-sm font-bold ${s.color}`}>{fmtVND(s.value)}</span>
                </div>
              ))}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#6B7A73]">Đã thanh toán</span>
                  <span className="font-semibold">{pct(contract.paidValue, contract.deliveredValue)}%</span>
                </div>
                <Progress value={pct(contract.paidValue, contract.deliveredValue)} />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── HospitalAdminDashboard (existing content) ────────────────────────────────

function HospitalAdminDashboard() {
  const { state } = useApp();
  const { contract, orders, payments } = state;

  const myOrders = orders.filter((o) => o.contractId === contract.id);
  const inDeliveryOrders = myOrders.filter((o) =>
    ["confirmed", "preparing", "shipping"].includes(o.status)
  );
  const deliveredOrders = myOrders.filter((o) => o.status === "delivered");
  const pendingOrders = myOrders.filter((o) => o.status === "pending_confirmation");
  const outstandingTotal = payments
    .filter((p) => p.contractId === contract.id && p.status !== "paid")
    .reduce((s, p) => s + p.outstandingAmount, 0);

  const activeContractCount = mockContracts.filter(
    (c) => c.contractStatus === "active" && c.hospitalName === contract.hospitalName
  ).length;

  const lowStockItem = contract.items.find((item) =>
    item.contractedQty > 0 && (item.requestedQty / item.contractedQty) >= 0.7
  );

  const monthlyBars = ["T1", "T2", "T3", "T4", "T5"].map((label, m) => ({
    label,
    value: myOrders
      .filter((o) => {
        const d = new Date(o.orderDate);
        return d.getFullYear() === 2026 && d.getMonth() === m;
      })
      .reduce((s, o) => s + o.totalRequestedAmount, 0),
    color: "#1D4ED8",
  }));

  const recentOrders = [...myOrders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <PageHeader title="Bảng điều khiển" />
        <Link href="/hospital/orders/new">
          <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-sm font-semibold rounded-xl cursor-pointer shadow-sm transition-colors">
            ＋ Tạo đơn hàng
          </span>
        </Link>
      </div>

      {lowStockItem && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-sm font-medium text-amber-800 flex-1">
            ⚠️ {lowStockItem.productName} sắp hết quota — Đặt ngay →
          </span>
          <Link href="/hospital/orders/new">
            <span className="text-xs font-bold text-amber-700 underline cursor-pointer">Đặt hàng</span>
          </Link>
        </div>
      )}
      {deliveredOrders.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <span className="text-sm font-medium text-emerald-800 flex-1">
            ✅ {deliveredOrders.length} đơn đã giao, chờ nghiệm thu
          </span>
          <Link href="/hospital/orders">
            <span className="text-xs font-bold text-emerald-700 underline cursor-pointer">Xem ngay</span>
          </Link>
        </div>
      )}
      {pendingOrders.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl">
          <span className="text-sm font-medium text-[#1D4ED8] flex-1">
            🕐 {pendingOrders.length} đơn đang chờ nhà cung cấp xác nhận
          </span>
          <Link href="/hospital/orders">
            <span className="text-xs font-bold text-[#1D4ED8] underline cursor-pointer">Theo dõi</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: "📄", value: String(activeContractCount), label: "Hợp đồng hoạt động", accent: "text-[#1D4ED8]" },
          { icon: "🚚", value: String(inDeliveryOrders.length), label: "Đơn đang giao", accent: "text-[#024430]" },
          { icon: "📦", value: String(deliveredOrders.length), label: "Chờ nghiệm thu", accent: deliveredOrders.length > 0 ? "text-amber-600" : "text-[#024430]" },
          { icon: "💳", value: fmtVND(outstandingTotal), label: "Công nợ", accent: outstandingTotal > 0 ? "text-red-600" : "text-[#024430]" },
        ].map((k) => (
          <Card key={k.label} className="p-4 flex flex-col gap-1">
            <span className="text-2xl leading-none">{k.icon}</span>
            <p className={`text-xl font-extrabold ${k.accent} leading-tight`}>{k.value}</p>
            <p className="text-xs text-[#6B7A73]">{k.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-semibold text-[#10231C]">Quota hợp đồng</h3>
              <Link href="/hospital/contracts">
                <span className="text-xs text-[#1D4ED8] font-medium cursor-pointer hover:underline">Xem hợp đồng →</span>
              </Link>
            </CardHeader>
            <CardBody className="pt-3">
              <div className="grid grid-cols-3 gap-4">
                {contract.items.map((item) => {
                  const usedPct = item.contractedQty > 0
                    ? Math.round((item.requestedQty / item.contractedQty) * 100)
                    : 0;
                  const donutColor = usedPct >= 80 ? "#EF4444" : usedPct >= 60 ? "#F59E0B" : "#024430";
                  return (
                    <div key={item.id} className="flex flex-col items-center gap-1 text-center">
                      <DonutChart value={item.requestedQty} max={item.contractedQty} color={donutColor} size={80} thickness={8} />
                      <p className="text-xs font-bold text-[#10231C] leading-tight line-clamp-2">{item.productName}</p>
                      <p className="text-[10px] text-[#6B7A73]">Còn {item.remainingQty.toLocaleString("vi-VN")} hộp</p>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Giá trị đặt hàng theo tháng</h3>
            </CardHeader>
            <CardBody className="pt-2">
              <BarChart data={monthlyBars} height={130} color="#1D4ED8" />
              <div className="grid grid-cols-5 gap-2 mt-1">
                {monthlyBars.map((b) => (
                  <div key={b.label} className="text-center">
                    <p className="text-[11px] font-semibold text-[#10231C]">
                      {b.value > 0 ? (b.value >= 1e9 ? `${(b.value / 1e9).toFixed(1)}B` : `${(b.value / 1e6).toFixed(0)}M`) : "—"}
                    </p>
                    <p className="text-[10px] text-[#6B7A73]">{b.label}/26</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Thao tác nhanh</h3>
            </CardHeader>
            <CardBody className="pt-3 flex flex-col gap-2">
              <Link href="/hospital/orders/new" className="block">
                <span className="flex items-center justify-center gap-2 w-full py-3 bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors">
                  🛒 Tạo đơn hàng
                </span>
              </Link>
              <Link href="/hospital/contracts" className="block">
                <span className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-[#1D4ED8] text-[#1D4ED8] text-sm font-semibold rounded-xl cursor-pointer hover:bg-[#EFF6FF] transition-colors">
                  📋 Xem hợp đồng
                </span>
              </Link>
              <Link href="/hospital/payments" className="block">
                <span className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-[#024430] text-[#024430] text-sm font-semibold rounded-xl cursor-pointer hover:bg-[#024430]/5 transition-colors">
                  💳 Thanh toán
                </span>
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-semibold text-[#10231C]">Đơn hàng gần đây</h3>
              <Link href="/hospital/orders">
                <span className="text-xs text-[#1D4ED8] font-medium cursor-pointer hover:underline">Xem tất cả</span>
              </Link>
            </CardHeader>
            <CardBody className="pt-2 flex flex-col gap-2">
              {recentOrders.length === 0 && (
                <p className="text-xs text-[#6B7A73] text-center py-4">Chưa có đơn hàng</p>
              )}
              {recentOrders.map((o) => (
                <div key={o.id} className="flex flex-col gap-1 p-3 rounded-xl border border-[#E4EAE7]">
                  <div className="flex items-center justify-between gap-2">
                    <Chip color="default" variant="flat" size="sm">{o.id}</Chip>
                    <Chip color={ORDER_STATUS_COLORS[o.status]} variant="flat" size="sm">
                      {ORDER_STATUS_LABELS[o.status]}
                    </Chip>
                  </div>
                  <p className="text-sm font-bold text-[#10231C]">{fmtVND(o.totalRequestedAmount)}</p>
                  {o.status === "delivered" && (
                    <Link href={`/hospital/orders/${o.id}`}>
                      <span className="block text-center text-xs font-semibold py-1.5 bg-[#024430] text-white rounded-lg cursor-pointer mt-1">
                        Xác nhận nghiệm thu
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Thanh toán</h3>
            </CardHeader>
            <CardBody className="pt-2">
              {[
                { label: "Đã giao hàng",  value: contract.deliveredValue,  color: "text-emerald-700" },
                { label: "Đã thanh toán", value: contract.paidValue,       color: "text-[#024430]"  },
                { label: "Còn phải trả",  value: contract.outstandingValue, color: "text-red-600"    },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center py-2 border-b border-[#E4EAE7] last:border-0">
                  <span className="text-xs text-[#6B7A73]">{s.label}</span>
                  <span className={`text-sm font-bold ${s.color}`}>{fmtVND(s.value)}</span>
                </div>
              ))}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#6B7A73]">Đã thanh toán</span>
                  <span className="font-semibold">{pct(contract.paidValue, contract.deliveredValue)}%</span>
                </div>
                <Progress value={pct(contract.paidValue, contract.deliveredValue)} />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Entry point ───────────────────────────────────────────────────────────────

export default function HospitalDashboard() {
  const role = useRole();
  if (role.isHospitalWarehouse) return <HospitalWarehouseDashboard />;
  if (role.isHospitalFinance)   return <HospitalFinanceDashboard />;
  if (role.isHospitalBuyer)     return <HospitalBuyerDashboard />;
  return <HospitalAdminDashboard />;
}
