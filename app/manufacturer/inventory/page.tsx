"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import { Card, CardBody, Input } from "@/components/ui";

// ── Mock Data ────────────────────────────────────────────────
type StockStatus = "normal" | "low" | "critical";

interface InventoryItem {
  id: string;
  name: string;
  batchNo: string;
  expiry: string;
  inStock: number;
  reserved: number;
  unit: string;
  capacity: number;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "INV001", name: "Amoxicillin 500mg", batchNo: "AMX-2026-003", expiry: "2028-03-31", inStock: 48000, reserved: 12000, unit: "Viên", capacity: 60000 },
  { id: "INV002", name: "Paracetamol 650mg", batchNo: "PCT-2026-007", expiry: "2027-12-31", inStock: 6000, reserved: 4000, unit: "Viên", capacity: 80000 },
  { id: "INV003", name: "Metformin 850mg", batchNo: "MET-2026-002", expiry: "2028-06-30", inStock: 22000, reserved: 8000, unit: "Viên", capacity: 50000 },
  { id: "INV004", name: "Atorvastatin 20mg", batchNo: "ATV-2026-005", expiry: "2028-09-30", inStock: 31000, reserved: 5000, unit: "Viên", capacity: 40000 },
  { id: "INV005", name: "Omeprazole 20mg", batchNo: "OMP-2026-004", expiry: "2027-08-31", inStock: 9000, reserved: 6000, unit: "Viên", capacity: 45000 },
  { id: "INV006", name: "Cetirizine 10mg", batchNo: "CTZ-2026-001", expiry: "2028-01-31", inStock: 37000, reserved: 5000, unit: "Viên", capacity: 40000 },
  { id: "INV007", name: "Azithromycin 250mg", batchNo: "AZT-2026-006", expiry: "2027-05-31", inStock: 14000, reserved: 7000, unit: "Viên", capacity: 30000 },
  { id: "INV008", name: "Salbutamol 2mg/5ml", batchNo: "SBT-2026-001", expiry: "2027-03-31", inStock: 3200, reserved: 1500, unit: "Chai", capacity: 10000 },
];

function getStatus(inStock: number, capacity: number): StockStatus {
  const pct = inStock / capacity;
  if (pct < 0.10) return "critical";
  if (pct < 0.30) return "low";
  return "normal";
}

function getDaysToExpiry(expiry: string): number {
  const today = new Date("2026-05-07");
  const exp = new Date(expiry);
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function fmtNum(n: number) {
  return n.toLocaleString("vi-VN");
}

function fmtVND(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} tỷ`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)} triệu đ`;
  return n.toLocaleString("vi-VN") + "đ";
}

const UNIT_PRICES: Record<string, number> = {
  "INV001": 1200, "INV002": 800, "INV003": 1500,
  "INV004": 3500, "INV005": 2200, "INV006": 900,
  "INV007": 4500, "INV008": 28000,
};

export default function ManufacturerInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [search, setSearch] = useState("");
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState("");

  const filtered = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.batchNo.toLowerCase().includes(search.toLowerCase())
  );

  const totalSKUs = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + item.inStock * (UNIT_PRICES[item.id] ?? 1000), 0);
  const nearExpiry = inventory.filter((item) => getDaysToExpiry(item.expiry) < 180).length;
  const lowStockCount = inventory.filter((item) => getStatus(item.inStock, item.capacity) !== "normal").length;

  function handleRestock(id: string) {
    const qty = parseInt(restockQty);
    if (!qty || qty <= 0) return;
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, inStock: item.inStock + qty } : item
      )
    );
    setRestockId(null);
    setRestockQty("");
  }

  const rowBg: Record<StockStatus, string> = {
    critical: "bg-red-50 border-l-4 border-l-red-500",
    low:      "bg-amber-50 border-l-4 border-l-amber-400",
    normal:   "",
  };

  const statusBadge: Record<StockStatus, string> = {
    critical: "bg-red-100 text-red-700",
    low:      "bg-amber-100 text-amber-700",
    normal:   "bg-emerald-100 text-emerald-700",
  };

  const statusLabel: Record<StockStatus, string> = {
    critical: "Nguy hiểm",
    low:      "Thấp",
    normal:   "Bình thường",
  };

  return (
    <div>
      <PageHeader
        title="Kho hàng"
        subtitle="Quản lý tồn kho và nhập kho sản phẩm"
      />

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Tổng SKU"
          value={String(totalSKUs)}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
          sub="Mặt hàng đang quản lý"
        />
        <KpiCard
          title="Giá trị tồn kho"
          value={fmtVND(totalValue)}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          sub="Tổng giá trị hàng trong kho"
        />
        <KpiCard
          title="Sắp hết hạn"
          value={String(nearExpiry)}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          sub="Hết hạn trong 6 tháng"
          trend={nearExpiry > 0 ? "Cần theo dõi" : undefined}
          trendUp={false}
        />
        <KpiCard
          title="Tồn kho thấp"
          value={String(lowStockCount)}
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
          sub="Cần nhập kho thêm"
          trend={lowStockCount > 0 ? "Cần bổ sung" : undefined}
          trendUp={false}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> <span className="text-[#6B7A73]">Nguy hiểm (&lt;10%)</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400" /> <span className="text-[#6B7A73]">Thấp (&lt;30%)</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /> <span className="text-[#6B7A73]">Bình thường (≥30%)</span></div>
      </div>

      {/* Search */}
      <div className="mb-4 max-w-xs">
        <Input
          placeholder="Tìm theo tên, lô hàng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startContent={
            <svg className="w-4 h-4 text-[#6B7A73]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>

      {/* Inventory Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Sản phẩm", "Lô hàng", "Hạn dùng", "Tồn kho", "Đã đặt trước", "Còn trống", "Tình trạng", "Thao tác"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7A73] bg-[#F6F8F7] whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl border-b border-[#E4EAE7]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const status = getStatus(item.inStock, item.capacity);
                  const available = item.inStock - item.reserved;
                  const daysLeft = getDaysToExpiry(item.expiry);
                  const pct = Math.round((item.inStock / item.capacity) * 100);
                  const isRestocking = restockId === item.id;

                  return (
                    <tr key={item.id} className={`border-t border-[#E4EAE7] transition-colors hover:brightness-[0.98] ${rowBg[status]}`}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-[#10231C]">{item.name}</p>
                        <p className="text-[10px] text-[#6B7A73]">{item.unit}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7A73] font-mono">{item.batchNo}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-[#10231C]">{item.expiry}</p>
                        <p className={`text-[10px] font-medium ${daysLeft < 180 ? "text-amber-600" : "text-[#6B7A73]"}`}>
                          {daysLeft < 180 ? `⚠ Còn ${daysLeft} ngày` : `Còn ${Math.round(daysLeft / 30)} tháng`}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-[#10231C]">{fmtNum(item.inStock)}</p>
                        <div className="w-20 bg-[#E4EAE7] rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${status === "critical" ? "bg-red-500" : status === "low" ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-[#6B7A73]">{pct}% công suất</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-[#10231C]">{fmtNum(item.reserved)}</p>
                        <p className="text-[10px] text-[#6B7A73]">Đã phân bổ</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm font-semibold ${available < 0 ? "text-red-600" : "text-[#10231C]"}`}>{fmtNum(Math.max(0, available))}</p>
                        <p className="text-[10px] text-[#6B7A73]">Có thể xuất</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[status]}`}>
                          {statusLabel[status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isRestocking ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={restockQty}
                              onChange={(e) => setRestockQty(e.target.value)}
                              placeholder="Số lượng"
                              className="w-20 border border-[#E4EAE7] rounded-lg px-2 py-1 text-xs text-[#10231C] bg-[#F6F8F7] outline-none focus:border-[#024430]"
                            />
                            <button
                              onClick={() => handleRestock(item.id)}
                              className="text-xs px-2 py-1 bg-[#024430] text-white rounded-lg font-medium hover:bg-[#056246] transition-colors"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => { setRestockId(null); setRestockQty(""); }}
                              className="text-xs px-2 py-1 bg-[#F6F8F7] border border-[#E4EAE7] text-[#6B7A73] rounded-lg font-medium hover:bg-[#E4EAE7] transition-colors"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setRestockId(item.id); setRestockQty(""); }}
                            className="text-xs px-3 py-1.5 bg-[#024430]/10 text-[#024430] rounded-lg font-medium hover:bg-[#024430]/20 transition-colors whitespace-nowrap"
                          >
                            + Nhập kho
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
