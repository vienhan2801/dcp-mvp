"use client";
import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Chip, Button } from "@/components/ui";
import { fmtVND, fmtDate, fmtNum } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

type BatchStatus = "ok" | "expiring" | "quarantine";
type Zone = "A1" | "A2" | "B1" | "COLD" | "QUARANTINE";

interface InventoryBatch {
  id: string;
  batchNo: string;
  drugName: string;
  zone: Zone;
  qty: number;
  unit: string;
  receivedDate: string;
  expiryDate: string;
  status: BatchStatus;
  costPrice: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-05-15");

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  return Math.round((d.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

const BATCHES: InventoryBatch[] = [
  {
    id: "B001",
    batchNo: "PARA-2601",
    drugName: "Paracetamol 500mg",
    zone: "A1",
    qty: 20000,
    unit: "Viên",
    receivedDate: "2026-01-10",
    expiryDate: "2027-08-31",
    status: "ok",
    costPrice: 14000,
  },
  {
    id: "B002",
    batchNo: "AMOX-2601",
    drugName: "Amoxicillin 250mg",
    zone: "A2",
    qty: 5000,
    unit: "Viên nang",
    receivedDate: "2026-01-15",
    expiryDate: "2026-06-10",
    status: "expiring",
    costPrice: 32000,
  },
  {
    id: "B003",
    batchNo: "CEFT-2601",
    drugName: "Ceftriaxone 1g",
    zone: "B1",
    qty: 1200,
    unit: "Lọ",
    receivedDate: "2026-02-20",
    expiryDate: "2026-06-01",
    status: "expiring",
    costPrice: 85000,
  },
  {
    id: "B004",
    batchNo: "INSG-2601",
    drugName: "Insulin Glargine 100U/mL",
    zone: "COLD",
    qty: 2500,
    unit: "Lọ",
    receivedDate: "2026-02-20",
    expiryDate: "2027-03-31",
    status: "ok",
    costPrice: 280000,
  },
  {
    id: "B005",
    batchNo: "METR-2602",
    drugName: "Metronidazole 250mg",
    zone: "A1",
    qty: 8000,
    unit: "Viên",
    receivedDate: "2026-03-22",
    expiryDate: "2027-12-31",
    status: "ok",
    costPrice: 18000,
  },
  {
    id: "B006",
    batchNo: "OMEP-QRT-01",
    drugName: "Omeprazole 20mg (Lô cách ly)",
    zone: "QUARANTINE",
    qty: 3000,
    unit: "Viên nang",
    receivedDate: "2026-04-05",
    expiryDate: "2027-06-30",
    status: "quarantine",
    costPrice: 28000,
  },
  {
    id: "B007",
    batchNo: "VITC-2603",
    drugName: "Vitamin C 1000mg",
    zone: "A2",
    qty: 6000,
    unit: "Viên sủi",
    receivedDate: "2026-04-25",
    expiryDate: "2028-07-31",
    status: "ok",
    costPrice: 22000,
  },
];

// ─── Zone capacity ────────────────────────────────────────────────────────────

interface ZoneInfo {
  zone: Zone;
  label: string;
  used: number;
  capacity: number;
  color: string;
}

const ZONES: ZoneInfo[] = [
  { zone: "A1",         label: "Khu A1 — Thuốc thông thường",   used: 72, capacity: 100, color: "#024430" },
  { zone: "A2",         label: "Khu A2 — Thuốc thông thường",   used: 55, capacity: 100, color: "#0EA5E9" },
  { zone: "B1",         label: "Khu B1 — Kháng sinh",           used: 83, capacity: 100, color: "#F59E0B" },
  { zone: "COLD",       label: "Kho lạnh (2–8°C)",              used: 48, capacity: 100, color: "#6366F1" },
  { zone: "QUARANTINE", label: "Khu cách ly / Kiểm tra",        used: 30, capacity: 100, color: "#EF4444" },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

function getStatusMeta(status: BatchStatus): { label: string; color: "success" | "warning" | "danger" } {
  switch (status) {
    case "ok":         return { label: "OK",           color: "success" };
    case "expiring":   return { label: "Sắp hết hạn",  color: "warning" };
    case "quarantine": return { label: "Cách ly",       color: "danger" };
  }
}

function expiryTextColor(days: number): string {
  if (days < 30)  return "text-red-600 font-bold";
  if (days < 90)  return "text-amber-600 font-semibold";
  return "text-green-700";
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterTab = "all" | "expiring" | "check";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",      label: "Tất cả" },
  { key: "expiring", label: "Sắp hết hạn" },
  { key: "check",    label: "Cần kiểm tra" },
];

// ─── Zone capacity bar ────────────────────────────────────────────────────────

function ZoneBar({ info }: { info: ZoneInfo }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#6B7A73]">{info.label}</span>
        <span className="font-semibold text-[#10231C]">{info.used}%</span>
      </div>
      <div className="w-full h-2 bg-[#E4EAE7] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${info.used}%`, background: info.color }}
        />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    if (activeTab === "expiring") {
      return BATCHES.filter((b) => {
        const days = daysUntil(b.expiryDate);
        return days < 90 && b.status !== "quarantine";
      });
    }
    if (activeTab === "check") {
      return BATCHES.filter((b) => b.status === "quarantine");
    }
    return BATCHES;
  }, [activeTab]);

  // KPI calculations
  const totalSKU = new Set(BATCHES.map((b) => b.drugName)).size;
  const totalBatches = BATCHES.length;
  const nearExpiry = BATCHES.filter((b) => {
    const days = daysUntil(b.expiryDate);
    return days < 90;
  }).length;
  const totalValue = BATCHES.reduce((s, b) => s + b.qty * b.costPrice, 0);

  const kpis = [
    {
      label: "Tổng SKU",
      value: `${totalSKU}`,
      sub: "loại thuốc trong kho",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: "Tổng lô hàng",
      value: `${totalBatches}`,
      sub: "lô đang quản lý",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      label: "Sắp hết hạn (<90 ngày)",
      value: `${nearExpiry}`,
      sub: "lô cần xử lý gấp",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      label: "Giá trị tồn kho",
      value: `${(totalValue / 1e9).toFixed(2)} tỷ ₫`,
      sub: "tổng giá trị theo giá nhập",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8F7]">
      <PageHeader
        title="Kho & Lô hàng"
        subtitle="Quản lý tồn kho theo lô, theo vị trí kho, FEFO"
        actions={
          <Button color="primary" size="sm">
            + Nhập lô mới
          </Button>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k, i) => (
          <Card key={i} className="bg-white border border-[#E4EAE7] shadow-sm">
            <CardBody className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#6B7A73] font-medium mb-1">{k.label}</p>
                  <p className="text-2xl font-bold text-[#10231C]">{k.value}</p>
                  <p className="text-xs text-[#6B7A73] mt-1">{k.sub}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#024430]/10 flex items-center justify-center text-[#024430]">
                  {k.icon}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Zone capacity */}
      <Card className="bg-white border border-[#E4EAE7] shadow-sm mb-6">
        <CardBody className="p-6">
          <h2 className="text-sm font-semibold text-[#10231C] mb-4">Công suất các khu kho</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ZONES.map((z) => (
              <ZoneBar key={z.zone} info={z} />
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white border border-[#E4EAE7] rounded-xl p-1 mb-4 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-[#024430] text-white shadow-sm"
                : "text-[#6B7A73] hover:text-[#10231C] hover:bg-[#F6F8F7]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Batch table */}
      <div className="bg-white rounded-xl border border-[#E4EAE7] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead className="bg-[#F6F8F7] border-b border-[#E4EAE7]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Lô hàng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Thuốc</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Vị trí</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7A73]">Số lượng</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Ngày nhận</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Hạn dùng</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Ngày còn lại</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#6B7A73]">
                    Không có lô hàng nào phù hợp.
                  </td>
                </tr>
              )}
              {filtered.map((batch) => {
                const days = daysUntil(batch.expiryDate);
                const meta = getStatusMeta(batch.status);
                const zoneInfo = ZONES.find((z) => z.zone === batch.zone);
                return (
                  <tr key={batch.id} className="border-t border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#024430] bg-[#024430]/8 px-2 py-0.5 rounded">
                        {batch.batchNo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#10231C]">{batch.drugName}</p>
                      <p className="text-xs text-[#6B7A73]">{fmtVND(batch.costPrice)} / {batch.unit}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-block text-xs font-bold px-2 py-0.5 rounded"
                        style={{ background: (zoneInfo?.color ?? "#024430") + "20", color: zoneInfo?.color ?? "#024430" }}
                      >
                        {batch.zone}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#10231C]">
                      {fmtNum(batch.qty)}
                      <span className="text-xs text-[#6B7A73] font-normal ml-1">{batch.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-[#6B7A73] text-xs">{fmtDate(batch.receivedDate)}</td>
                    <td className="px-4 py-3 text-center text-[#10231C] text-xs">{fmtDate(batch.expiryDate)}</td>
                    <td className="px-4 py-3 text-center">
                      <Chip color={meta.color} variant="flat" size="sm">
                        {meta.label}
                      </Chip>
                    </td>
                    <td className={`px-4 py-3 text-center text-sm ${expiryTextColor(days)}`}>
                      {days > 0 ? `${days} ngày` : <span className="text-red-600 font-bold">Đã hết hạn</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-[#E4EAE7] bg-[#F6F8F7] text-xs text-[#6B7A73] flex items-center justify-between">
          <span>
            Hiển thị <strong className="text-[#10231C]">{filtered.length}</strong> / {BATCHES.length} lô hàng
          </span>
          <span className="text-[10px]">
            Nguyên tắc FEFO — First Expired, First Out
          </span>
        </div>
      </div>
    </div>
  );
}
