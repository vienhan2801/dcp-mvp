"use client";
import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Input,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@/components/ui";
import { DonutChart, BarChart, SparkLine } from "@/components/Charts";
import { fmtVND, fmtNum, fmtDate } from "@/lib/format";
import { useRole } from "@/lib/useRole";
import FileUpload from "@/components/FileUpload";

// ─── Data model ───────────────────────────────────────────────────────────────

interface Batch {
  batchNo: string;
  qty: number;
  expiry: string;
  receivedDate: string;
}

interface InventoryItem {
  id: string;
  name: string;
  ingredient: string;
  form: string;
  unit: string;
  manufacturer: string;
  stockQty: number;
  reservedQty: number;
  availableQty: number;
  minStock: number;
  maxStock: number;
  batches: Batch[];
  monthlyOut: number[];
  hospitalDemand: number;
  pharmacyDemand: number;
  costPrice: number;
  sellPrice: number;
  lastRestockDate: string;
  nextRestockDate?: string;
  pendingFromNCC: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INVENTORY: InventoryItem[] = [
  {
    id: "INV-001",
    name: "Paracetamol 500mg",
    ingredient: "Paracetamol",
    form: "Viên nén",
    unit: "Hộp",
    manufacturer: "PhytoPharma",
    stockQty: 45000,
    reservedQty: 8000,
    availableQty: 37000,
    minStock: 10000,
    maxStock: 80000,
    batches: [
      { batchNo: "PARA-2601", qty: 20000, expiry: "2027-08-31", receivedDate: "2026-01-10" },
      { batchNo: "PARA-2602", qty: 15000, expiry: "2027-11-30", receivedDate: "2026-03-05" },
      { batchNo: "PARA-2603", qty: 10000, expiry: "2028-02-28", receivedDate: "2026-04-20" },
    ],
    monthlyOut: [9200, 8700, 10100, 11300, 9800, 10500],
    hospitalDemand: 5500,
    pharmacyDemand: 2500,
    costPrice: 14000,
    sellPrice: 18000,
    lastRestockDate: "2026-04-20",
    nextRestockDate: "2026-06-15",
    pendingFromNCC: 15000,
  },
  {
    id: "INV-002",
    name: "Amoxicillin 500mg",
    ingredient: "Amoxicillin trihydrate",
    form: "Viên nang",
    unit: "Hộp",
    manufacturer: "Mekophar",
    stockQty: 8500,
    reservedQty: 3000,
    availableQty: 5500,
    minStock: 10000,
    maxStock: 40000,
    batches: [
      { batchNo: "AMOX-2601", qty: 5000, expiry: "2026-09-30", receivedDate: "2026-01-15" },
      { batchNo: "AMOX-2602", qty: 3500, expiry: "2027-03-31", receivedDate: "2026-03-10" },
    ],
    monthlyOut: [4200, 5100, 4800, 5600, 6100, 5800],
    hospitalDemand: 2000,
    pharmacyDemand: 1000,
    costPrice: 32000,
    sellPrice: 42000,
    lastRestockDate: "2026-03-10",
    nextRestockDate: "2026-05-20",
    pendingFromNCC: 12000,
  },
  {
    id: "INV-003",
    name: "Omeprazole 20mg",
    ingredient: "Omeprazole",
    form: "Viên nang",
    unit: "Hộp",
    manufacturer: "Stada Việt Nam",
    stockQty: 22000,
    reservedQty: 4000,
    availableQty: 18000,
    minStock: 8000,
    maxStock: 50000,
    batches: [
      { batchNo: "OMEP-2601", qty: 12000, expiry: "2027-06-30", receivedDate: "2026-02-01" },
      { batchNo: "OMEP-2602", qty: 10000, expiry: "2028-01-31", receivedDate: "2026-04-01" },
    ],
    monthlyOut: [3800, 4100, 3600, 4400, 3900, 4200],
    hospitalDemand: 2800,
    pharmacyDemand: 1200,
    costPrice: 28000,
    sellPrice: 38000,
    lastRestockDate: "2026-04-01",
    nextRestockDate: "2026-07-01",
    pendingFromNCC: 8000,
  },
  {
    id: "INV-004",
    name: "Vitamin C 1000mg",
    ingredient: "Ascorbic acid",
    form: "Viên sủi",
    unit: "Hộp",
    manufacturer: "DHG Pharma",
    stockQty: 31000,
    reservedQty: 5000,
    availableQty: 26000,
    minStock: 12000,
    maxStock: 60000,
    batches: [
      { batchNo: "VITC-2601", qty: 15000, expiry: "2027-10-31", receivedDate: "2026-01-20" },
      { batchNo: "VITC-2602", qty: 10000, expiry: "2028-04-30", receivedDate: "2026-03-15" },
      { batchNo: "VITC-2603", qty: 6000, expiry: "2028-07-31", receivedDate: "2026-04-25" },
    ],
    monthlyOut: [5500, 6200, 5800, 7100, 6400, 6800],
    hospitalDemand: 3000,
    pharmacyDemand: 2000,
    costPrice: 22000,
    sellPrice: 30000,
    lastRestockDate: "2026-04-25",
    nextRestockDate: "2026-08-01",
    pendingFromNCC: 0,
  },
  {
    id: "INV-005",
    name: "Azithromycin 250mg",
    ingredient: "Azithromycin dihydrate",
    form: "Viên nén",
    unit: "Hộp",
    manufacturer: "Imexpharm",
    stockQty: 3200,
    reservedQty: 1800,
    availableQty: 1400,
    minStock: 5000,
    maxStock: 20000,
    batches: [
      { batchNo: "AZIT-2601", qty: 2000, expiry: "2026-07-31", receivedDate: "2026-01-05" },
      { batchNo: "AZIT-2602", qty: 1200, expiry: "2027-01-31", receivedDate: "2026-02-28" },
    ],
    monthlyOut: [2100, 2400, 2200, 2800, 2600, 2900],
    hospitalDemand: 1200,
    pharmacyDemand: 600,
    costPrice: 45000,
    sellPrice: 60000,
    lastRestockDate: "2026-02-28",
    nextRestockDate: "2026-05-10",
    pendingFromNCC: 8000,
  },
  {
    id: "INV-006",
    name: "Metronidazole 250mg",
    ingredient: "Metronidazole",
    form: "Viên nén",
    unit: "Hộp",
    manufacturer: "Pymepharco",
    stockQty: 18000,
    reservedQty: 2500,
    availableQty: 15500,
    minStock: 6000,
    maxStock: 35000,
    batches: [
      { batchNo: "METR-2601", qty: 10000, expiry: "2027-05-31", receivedDate: "2026-01-18" },
      { batchNo: "METR-2602", qty: 8000, expiry: "2027-12-31", receivedDate: "2026-03-22" },
    ],
    monthlyOut: [3100, 2900, 3400, 3200, 3600, 3300],
    hospitalDemand: 1800,
    pharmacyDemand: 700,
    costPrice: 18000,
    sellPrice: 25000,
    lastRestockDate: "2026-03-22",
    nextRestockDate: "2026-09-01",
    pendingFromNCC: 0,
  },
  {
    id: "INV-007",
    name: "Ciprofloxacin 500mg",
    ingredient: "Ciprofloxacin hydrochloride",
    form: "Viên nén",
    unit: "Hộp",
    manufacturer: "Mekophar",
    stockQty: 9500,
    reservedQty: 2000,
    availableQty: 7500,
    minStock: 8000,
    maxStock: 25000,
    batches: [
      { batchNo: "CIPR-2601", qty: 6000, expiry: "2026-10-31", receivedDate: "2026-02-10" },
      { batchNo: "CIPR-2602", qty: 3500, expiry: "2027-06-30", receivedDate: "2026-04-05" },
    ],
    monthlyOut: [3200, 3500, 3100, 3800, 3600, 3900],
    hospitalDemand: 2500,
    pharmacyDemand: 1100,
    costPrice: 40000,
    sellPrice: 55000,
    lastRestockDate: "2026-04-05",
    nextRestockDate: "2026-06-01",
    pendingFromNCC: 6000,
  },
  {
    id: "INV-008",
    name: "Dexamethasone 0.5mg",
    ingredient: "Dexamethasone",
    form: "Viên nén",
    unit: "Hộp",
    manufacturer: "Roussel Việt Nam",
    stockQty: 0,
    reservedQty: 0,
    availableQty: 0,
    minStock: 3000,
    maxStock: 15000,
    batches: [],
    monthlyOut: [1800, 2100, 1900, 2300, 2000, 0],
    hospitalDemand: 1500,
    pharmacyDemand: 500,
    costPrice: 15000,
    sellPrice: 22000,
    lastRestockDate: "2025-12-10",
    nextRestockDate: "2026-05-15",
    pendingFromNCC: 5000,
  },
  {
    id: "INV-009",
    name: "Insulin Glargine 100U/mL",
    ingredient: "Insulin glargine",
    form: "Dung dịch tiêm",
    unit: "Lọ",
    manufacturer: "Sanofi",
    stockQty: 4200,
    reservedQty: 800,
    availableQty: 3400,
    minStock: 2000,
    maxStock: 10000,
    batches: [
      { batchNo: "INSG-2601", qty: 2500, expiry: "2027-03-31", receivedDate: "2026-02-20" },
      { batchNo: "INSG-2602", qty: 1700, expiry: "2027-09-30", receivedDate: "2026-04-10" },
    ],
    monthlyOut: [900, 1100, 950, 1200, 1050, 1100],
    hospitalDemand: 700,
    pharmacyDemand: 100,
    costPrice: 280000,
    sellPrice: 350000,
    lastRestockDate: "2026-04-10",
    nextRestockDate: "2026-07-15",
    pendingFromNCC: 2000,
  },
  {
    id: "INV-010",
    name: "Cefuroxime 500mg",
    ingredient: "Cefuroxime axetil",
    form: "Viên nén",
    unit: "Hộp",
    manufacturer: "Zinnat GSK",
    stockQty: 12000,
    reservedQty: 2200,
    availableQty: 9800,
    minStock: 5000,
    maxStock: 30000,
    batches: [
      { batchNo: "CEFU-2601", qty: 7000, expiry: "2027-07-31", receivedDate: "2026-01-25" },
      { batchNo: "CEFU-2602", qty: 5000, expiry: "2028-01-31", receivedDate: "2026-04-15" },
    ],
    monthlyOut: [2600, 2800, 2500, 3100, 2900, 3000],
    hospitalDemand: 2000,
    pharmacyDemand: 200,
    costPrice: 95000,
    sellPrice: 130000,
    lastRestockDate: "2026-04-15",
    nextRestockDate: "2026-08-01",
    pendingFromNCC: 0,
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = ["T1", "T2", "T3", "T4", "T5", "T6"];

const FORM_COLORS: Record<string, { bg: string; text: string }> = {
  "Viên nén":       { bg: "bg-blue-100",   text: "text-blue-700" },
  "Viên nang":      { bg: "bg-purple-100",  text: "text-purple-700" },
  "Viên sủi":       { bg: "bg-cyan-100",    text: "text-cyan-700" },
  "Bột pha tiêm":   { bg: "bg-orange-100",  text: "text-orange-700" },
  "Dung dịch tiêm": { bg: "bg-red-100",     text: "text-red-700" },
  "Siro":           { bg: "bg-green-100",   text: "text-green-700" },
};

// ─── Status helpers ───────────────────────────────────────────────────────────

type StockStatus = "stockout" | "critical" | "low" | "ok" | "nearfull";

function getStockStatus(item: InventoryItem): StockStatus {
  if (item.availableQty === 0) return "stockout";
  if (item.availableQty < item.minStock * 0.5) return "critical";
  if (item.availableQty < item.minStock) return "low";
  if (item.stockQty > item.maxStock * 0.9) return "nearfull";
  return "ok";
}

interface StatusMeta {
  label: string;
  chipColor: "danger" | "warning" | "success" | "secondary" | "default";
  barColor: string;
}

function getStatusMeta(status: StockStatus): StatusMeta {
  switch (status) {
    case "stockout":  return { label: "Hết hàng",  chipColor: "danger",    barColor: "#EF4444" };
    case "critical":  return { label: "Nguy cấp",  chipColor: "danger",    barColor: "#F97316" };
    case "low":       return { label: "Sắp hết",   chipColor: "warning",   barColor: "#F59E0B" };
    case "nearfull":  return { label: "Sắp đầy",   chipColor: "secondary", barColor: "#3B82F6" };
    case "ok":        return { label: "Đủ hàng",   chipColor: "success",   barColor: "#22C55E" };
  }
}

// ─── Stock priority sort helper ───────────────────────────────────────────────

function stockPriority(item: InventoryItem): number {
  if (item.availableQty === 0) return 0;                          // Hết hàng — always first
  if (item.availableQty < item.minStock * 0.5) return 1;         // Nguy cấp
  if (item.availableQty < item.minStock) return 2;               // Sắp hết
  if (item.stockQty > item.maxStock * 0.9) return 4;             // Sắp đầy
  return 3;                                                        // Đủ hàng
}

// ─── Days-to-expiry helper ────────────────────────────────────────────────────

function daysToExpiry(expiry: string): number {
  const today = new Date();
  const exp = new Date(expiry);
  return Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function expiryColor(days: number): string {
  if (days < 90) return "text-red-600 font-semibold";
  if (days < 180) return "text-amber-600 font-semibold";
  return "text-green-700";
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function todayPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── KPI calculations ─────────────────────────────────────────────────────────

function useKPIs(items: InventoryItem[]) {
  return useMemo(() => {
    const totalSKU = items.length;
    const totalStock = items.reduce((s, i) => s + i.stockQty, 0);
    const totalValue = items.reduce((s, i) => s + i.stockQty * i.costPrice, 0);
    const needRestock = items.filter((i) => i.availableQty < i.minStock).length;
    const totalPending = items.reduce((s, i) => s + i.pendingFromNCC, 0);
    const nccCount = items.filter((i) => i.pendingFromNCC > 0).length;
    const needRestockSKU = items.filter((i) => {
      const s = getStockStatus(i);
      return s === "stockout" || s === "critical" || s === "low";
    }).length;
    return { totalSKU, totalStock, totalValue, needRestock, totalPending, nccCount, needRestockSKU };
  }, [items]);
}

// ─── Alert banner ─────────────────────────────────────────────────────────────

function AlertBanner({ items }: { items: InventoryItem[] }) {
  const urgent = items.filter((i) => {
    const s = getStockStatus(i);
    return s === "stockout" || s === "critical";
  });
  if (urgent.length === 0) return null;
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <span className="text-lg leading-none">⚠️</span>
      <div>
        <p className="text-sm font-semibold text-red-700">
          {urgent.length} mặt hàng cần đặt hàng ngay
        </p>
        <p className="text-xs text-red-600 mt-0.5">
          {urgent.map((i) => i.name).join(", ")}
        </p>
      </div>
    </div>
  );
}

// ─── Stock progress bar ───────────────────────────────────────────────────────

function StockBar({ item }: { item: InventoryItem }) {
  const pct = item.maxStock > 0 ? Math.min(100, (item.availableQty / item.maxStock) * 100) : 0;
  const status = getStockStatus(item);
  const { barColor } = getStatusMeta(status);
  return (
    <div className="w-full h-1.5 bg-[#E4EAE7] rounded-full mt-1 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: barColor }}
      />
    </div>
  );
}

// ─── Drug detail modal ────────────────────────────────────────────────────────

function DrugDetailModal({
  item,
  onClose,
}: {
  item: InventoryItem;
  onClose: () => void;
}) {
  const status = getStockStatus(item);
  const { barColor } = getStatusMeta(status);
  const pct = item.maxStock > 0 ? Math.round((item.availableQty / item.maxStock) * 100) : 0;

  const barData = MONTHS.map((label, i) => ({
    label,
    value: item.monthlyOut[i] ?? 0,
  }));

  const hospitalBarData = MONTHS.map((label, i) => ({
    label,
    value: Math.round((item.monthlyOut[i] ?? 0) * (item.hospitalDemand / (item.hospitalDemand + item.pharmacyDemand + 1))),
    color: "#024430",
  }));

  const pharmacyBarData = MONTHS.map((label, i) => ({
    label,
    value: Math.round((item.monthlyOut[i] ?? 0) * (item.pharmacyDemand / (item.hospitalDemand + item.pharmacyDemand + 1))),
    color: "#0EA5E9",
  }));

  const formColors = FORM_COLORS[item.form] ?? { bg: "bg-gray-100", text: "text-gray-700" };

  return (
    <Modal isOpen onClose={onClose} size="xl">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${formColors.bg} ${formColors.text}`}>
              {item.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold text-[#10231C]">{item.name}</p>
              <p className="text-xs text-[#6B7A73] font-normal mt-0">{item.ingredient} · {item.manufacturer}</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
            {/* Left: donut */}
            <div className="flex flex-col items-center gap-3">
              <DonutChart
                value={item.availableQty}
                max={item.maxStock}
                label={`${pct}%`}
                sublabel="Khả dụng"
                color={barColor}
                size={140}
                thickness={14}
                showPercent={false}
              />
              <p className="text-xs text-[#6B7A73] text-center">
                {fmtNum(item.availableQty)} / {fmtNum(item.maxStock)} {item.unit}
              </p>
            </div>

            {/* Right: stats */}
            <div className="flex flex-col gap-4">
              {/* KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Tồn kho", value: fmtNum(item.stockQty), sub: item.unit },
                  { label: "Đặt trước", value: fmtNum(item.reservedQty), sub: item.unit },
                  { label: "Khả dụng", value: fmtNum(item.availableQty), sub: item.unit },
                  { label: "Chờ NCC", value: fmtNum(item.pendingFromNCC), sub: item.unit },
                ].map((s) => (
                  <div key={s.label} className="bg-[#F6F8F7] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#6B7A73]">{s.label}</p>
                    <p className="text-base font-bold text-[#10231C] mt-0.5">{s.value}</p>
                    <p className="text-[10px] text-[#6B7A73]">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Restock info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#F6F8F7] rounded-xl p-3">
                  <p className="text-xs text-[#6B7A73] mb-1">Nhập kho gần nhất</p>
                  <p className="font-semibold text-[#10231C]">{fmtDate(item.lastRestockDate)}</p>
                </div>
                <div className="bg-[#F6F8F7] rounded-xl p-3">
                  <p className="text-xs text-[#6B7A73] mb-1">Dự kiến nhập tiếp theo</p>
                  <p className="font-semibold text-[#10231C]">
                    {item.nextRestockDate ? fmtDate(item.nextRestockDate) : "—"}
                  </p>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[#6B7A73]">Giá nhập</p>
                  <p className="font-bold text-[#10231C]">{fmtVND(item.costPrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7A73]">Giá bán</p>
                  <p className="font-bold text-[#024430]">{fmtVND(item.sellPrice)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Batch table */}
          <div className="mt-5">
            <p className="text-sm font-semibold text-[#10231C] mb-2">Thông tin lô hàng</p>
            {item.batches.length === 0 ? (
              <p className="text-sm text-[#6B7A73] italic">Không có lô hàng trong kho.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#E4EAE7]">
                <table className="w-full text-sm">
                  <thead className="bg-[#F6F8F7] text-xs text-[#6B7A73]">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Số lô</th>
                      <th className="px-3 py-2 text-right font-semibold">Số lượng</th>
                      <th className="px-3 py-2 text-left font-semibold">Hạn dùng</th>
                      <th className="px-3 py-2 text-left font-semibold">Ngày nhận</th>
                      <th className="px-3 py-2 text-right font-semibold">Còn lại (ngày)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.batches.map((b) => {
                      const days = daysToExpiry(b.expiry);
                      return (
                        <tr key={b.batchNo} className="border-t border-[#E4EAE7]">
                          <td className="px-3 py-2 font-mono text-xs text-[#10231C]">{b.batchNo}</td>
                          <td className="px-3 py-2 text-right text-[#10231C]">{fmtNum(b.qty)}</td>
                          <td className="px-3 py-2 text-[#10231C]">{fmtDate(b.expiry)}</td>
                          <td className="px-3 py-2 text-[#6B7A73]">{fmtDate(b.receivedDate)}</td>
                          <td className={`px-3 py-2 text-right ${expiryColor(days)}`}>{days}d</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sparkline + demand charts */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Outbound trend */}
            <div className="bg-[#F6F8F7] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#6B7A73] mb-3">Xu hướng xuất kho (6 tháng)</p>
              <div className="flex items-center gap-4">
                <SparkLine
                  data={item.monthlyOut}
                  color="#024430"
                  height={48}
                  width={120}
                />
                <div className="flex-1 grid grid-cols-3 gap-1">
                  {MONTHS.map((m, i) => (
                    <div key={m} className="text-center">
                      <p className="text-[10px] text-[#6B7A73]">{m}</p>
                      <p className="text-xs font-semibold text-[#10231C]">{fmtNum(item.monthlyOut[i] ?? 0)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hospital vs pharmacy demand */}
            <div className="bg-[#F6F8F7] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#6B7A73] mb-3">Nhu cầu hiện tại</p>
              <div className="flex gap-4 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#024430]" />
                  <span className="text-xs text-[#6B7A73]">Bệnh viện: <strong className="text-[#10231C]">{fmtNum(item.hospitalDemand)}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#0EA5E9]" />
                  <span className="text-xs text-[#6B7A73]">Nhà thuốc: <strong className="text-[#10231C]">{fmtNum(item.pharmacyDemand)}</strong></span>
                </div>
              </div>
              <div className="flex gap-2">
                <BarChart
                  data={hospitalBarData}
                  height={100}
                  color="#024430"
                  showValues={false}
                  showGrid={false}
                />
                <BarChart
                  data={pharmacyBarData}
                  height={100}
                  color="#0EA5E9"
                  showValues={false}
                  showGrid={false}
                />
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// ─── Reorder modal ────────────────────────────────────────────────────────────

const NCC_OPTIONS = ["PhytoPharma Manufacturing", "MedPharm Co", "VietPharma"];

interface ReorderForm {
  ncc: string;
  qty: number;
  date: string;
  priority: "normal" | "high" | "urgent";
  note: string;
}

function ReorderModal({
  item,
  onClose,
}: {
  item: InventoryItem;
  onClose: () => void;
}) {
  const status = getStockStatus(item);
  const meta = getStatusMeta(status);

  const recommendedQty = Math.max(item.minStock * 2 - item.stockQty, item.minStock);
  const defaultPriority: ReorderForm["priority"] = status === "stockout" ? "urgent" : "normal";
  const allNccOptions = item.manufacturer
    ? [item.manufacturer, ...NCC_OPTIONS.filter((o) => o !== item.manufacturer)]
    : NCC_OPTIONS;

  const [form, setForm] = useState<ReorderForm>({
    ncc: item.manufacturer,
    qty: recommendedQty,
    date: todayPlusDays(7),
    priority: defaultPriority,
    note: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [success, setSuccess] = useState(false);
  const [orderCode] = useState(() => `NPP-${Date.now()}`);

  const minDate = todayPlusDays(3);
  const canSubmit = form.qty > 0 && form.ncc.trim() !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSuccess(true);
  }

  // Suppress unused warning — files tracked for future submission
  void files;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#024430] rounded-t-2xl px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-[#A3C4B0] font-medium mb-1">Lên đơn đặt hàng từ NCC</p>
            <p className="text-lg font-bold text-white leading-tight">{item.name}</p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                  status === "stockout"
                    ? "bg-red-500 text-white"
                    : status === "critical"
                    ? "bg-orange-500 text-white"
                    : "bg-amber-400 text-white"
                }`}
              >
                {meta.label}
              </span>
              <span className="text-xs text-[#A3C4B0]">
                Tồn kho hiện tại: {fmtNum(item.stockQty)} đơn vị (khả dụng: {fmtNum(item.availableQty)})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="text-white/70 hover:text-white text-2xl leading-none flex-shrink-0 mt-0.5"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {success ? (
            /* Success state */
            <div className="flex flex-col items-center gap-4 py-6">
              <svg className="w-16 h-16 text-[#024430]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl font-bold text-[#10231C]">Đơn đặt hàng đã được gửi!</p>
              <p className="text-sm font-mono text-[#024430] bg-[#F6F8F7] px-4 py-2 rounded-xl">
                Mã đơn: {orderCode}
              </p>
              <p className="text-sm text-[#6B7A73] text-center">
                NCC sẽ xác nhận trong 1-2 ngày làm việc
              </p>
              <Button color="primary" onClick={onClose} className="mt-2 w-full">
                Đóng
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* 1. NCC select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#10231C]">Nhà sản xuất</label>
                <select
                  aria-label="Nhà sản xuất"
                  value={form.ncc}
                  onChange={(e) => setForm((f) => ({ ...f, ncc: e.target.value }))}
                  className="border border-[#E4EAE7] rounded-xl bg-white px-3 h-10 text-sm text-[#10231C] outline-none focus:border-[#024430]"
                >
                  {allNccOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* 2. Qty */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#10231C]">Số lượng đặt</label>
                <input
                  type="number"
                  min={1}
                  value={form.qty}
                  onChange={(e) => setForm((f) => ({ ...f, qty: Number(e.target.value) }))}
                  className="border border-[#E4EAE7] rounded-xl bg-white px-3 h-10 text-sm text-[#10231C] outline-none focus:border-[#024430] w-full"
                />
                <p className="text-xs text-[#6B7A73]">
                  🤖 AI đề xuất: {fmtNum(recommendedQty)} đơn vị (đủ dùng ~2 tháng)
                </p>
              </div>

              {/* 3. Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#10231C]">Ngày giao dự kiến</label>
                <input
                  type="date"
                  min={minDate}
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="border border-[#E4EAE7] rounded-xl bg-white px-3 h-10 text-sm text-[#10231C] outline-none focus:border-[#024430] w-full"
                />
              </div>

              {/* 4. Priority */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#10231C]">Ưu tiên</label>
                <div className="flex gap-4">
                  {(["normal", "high", "urgent"] as const).map((p) => {
                    const labels: Record<typeof p, string> = { normal: "Thường", high: "Cao", urgent: "Khẩn cấp" };
                    return (
                      <label key={p} className="flex items-center gap-2 cursor-pointer text-sm text-[#10231C]">
                        <input
                          type="radio"
                          name="reorder-priority"
                          value={p}
                          checked={form.priority === p}
                          onChange={() => setForm((f) => ({ ...f, priority: p }))}
                          className="accent-[#024430]"
                        />
                        {labels[p]}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 5. Note */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#10231C]">
                  Ghi chú <span className="text-[#6B7A73] font-normal">(tuỳ chọn)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Yêu cầu đặc biệt về lô hàng, bao bì..."
                  className="border border-[#E4EAE7] rounded-xl bg-white px-3 py-2 text-sm text-[#10231C] outline-none focus:border-[#024430] resize-none w-full"
                />
              </div>

              {/* FileUpload */}
              <FileUpload
                label="Đính kèm tài liệu (nếu có)"
                accept=".pdf,.doc,.docx,image/*"
                maxFiles={3}
                accentColor="#024430"
                hint="PO, specs, hoặc ảnh mẫu hàng"
                onFilesChange={setFiles}
              />

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-[#E4EAE7] rounded-xl h-10 text-sm font-medium text-[#10231C] hover:bg-[#F6F8F7] transition-colors"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 bg-[#024430] text-white rounded-xl h-10 text-sm font-semibold hover:bg-[#013325] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Gửi đơn đặt hàng
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "ok" | "low" | "stockout";
type SortKey = "name" | "stock_asc" | "demand_desc";

export default function WarehouseInventoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reorderDrugId, setReorderDrugId] = useState<string | null>(null);
  const { isNPPLogistics, isNPPFinance } = useRole();

  const kpis = useKPIs(INVENTORY);

  const filtered = useMemo(() => {
    const list = INVENTORY.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.ingredient.toLowerCase().includes(q) ||
        item.manufacturer.toLowerCase().includes(q);
      if (!matchSearch) return false;

      const s = getStockStatus(item);
      if (statusFilter === "ok") return s === "ok" || s === "nearfull";
      if (statusFilter === "low") return s === "low" || s === "critical";
      if (statusFilter === "stockout") return s === "stockout";
      return true;
    });

    const sorted = [...list].sort((a, b) => {
      const pa = stockPriority(a), pb = stockPriority(b);
      if (pa !== pb) return pa - pb;   // stockout/critical always first
      if (sortKey === "name") return a.name.localeCompare(b.name, "vi");
      if (sortKey === "stock_asc") return a.availableQty - b.availableQty;
      if (sortKey === "demand_desc") return (b.hospitalDemand + b.pharmacyDemand) - (a.hospitalDemand + a.pharmacyDemand);
      return 0;
    });

    return sorted;
  }, [search, statusFilter, sortKey]);

  const selectedItem = selectedId ? INVENTORY.find((i) => i.id === selectedId) ?? null : null;
  const reorderItem = reorderDrugId ? INVENTORY.find((i) => i.id === reorderDrugId) ?? null : null;

  const statusPills: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "ok", label: "Đủ hàng" },
    { key: "low", label: "Sắp hết" },
    { key: "stockout", label: "Hết hàng" },
  ];

  // Total inventory value formatted
  const valueBillion = (kpis.totalValue / 1e9).toFixed(2);

  return (
    <div className="min-h-screen bg-[#F6F8F7]">
      <PageHeader
        title="Quản lý tồn kho"
        subtitle="Kho hàng PhytoPharma — Nhà phân phối (NPP)"
        actions={
          <Button color="primary" size="sm">
            + Nhập kho
          </Button>
        }
      />

      {/* ── Role banner ───────────────────────────────────────── */}
      {isNPPLogistics && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <span className="text-base leading-none">👤</span>
          <p className="text-sm text-green-800">
            Bạn đang đăng nhập với vai trò <strong>Kho vận</strong> · Bạn có thể xem tồn kho và lên đơn đặt hàng
          </p>
        </div>
      )}
      {isNPPFinance && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <span className="text-base leading-none">👤</span>
          <p className="text-sm text-blue-800">
            Bạn đang đăng nhập với vai trò <strong>Tài chính</strong> · Chế độ xem chỉ đọc — Liên hệ Kho vận để đặt hàng
          </p>
        </div>
      )}

      {/* ── KPI strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="py-4">
            <p className="text-xs text-[#6B7A73]">Tổng SKU</p>
            <p className="text-2xl font-black text-[#10231C] mt-1">{kpis.totalSKU}</p>
            <p className="text-xs text-[#6B7A73] mt-1">
              <span className="text-amber-600 font-medium">{kpis.needRestockSKU} loại</span> cần bổ sung
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="py-4">
            <p className="text-xs text-[#6B7A73]">Tổng tồn kho</p>
            <p className="text-2xl font-black text-[#10231C] mt-1">{fmtNum(kpis.totalStock)}</p>
            <p className="text-xs text-[#6B7A73] mt-1">
              Giá trị: <span className="text-[#024430] font-semibold">{valueBillion} tỷ ₫</span>
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="py-4">
            <p className="text-xs text-[#6B7A73]">Sắp hết hàng</p>
            <p className="text-2xl font-black text-red-600 mt-1">{kpis.needRestock}</p>
            <p className="text-xs text-red-500 mt-1 font-medium">Cần đặt ngay</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="py-4">
            <p className="text-xs text-[#6B7A73]">Đang chờ NCC giao</p>
            <p className="text-2xl font-black text-[#10231C] mt-1">{fmtNum(kpis.totalPending)}</p>
            <p className="text-xs text-[#6B7A73] mt-1">
              từ <span className="font-semibold">{kpis.nccCount}</span> nhà cung cấp
            </p>
          </CardBody>
        </Card>
      </div>

      {/* ── Alert banner ──────────────────────────────────────── */}
      <AlertBanner items={INVENTORY} />

      {/* ── Filter bar ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Tìm theo tên thuốc, hoạt chất, nhà sản xuất..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
          aria-label="Tìm kiếm thuốc"
          startContent={
            <svg className="w-4 h-4 text-[#6B7A73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />

        {/* Status pills */}
        <div className="flex gap-1 bg-white border border-[#E4EAE7] rounded-xl p-1 flex-shrink-0">
          {statusPills.map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => setStatusFilter(pill.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === pill.key
                  ? "bg-[#024430] text-white shadow-sm"
                  : "text-[#6B7A73] hover:text-[#10231C] hover:bg-[#F6F8F7]"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          aria-label="Sắp xếp"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="border border-[#E4EAE7] rounded-xl bg-white px-3 h-10 text-sm text-[#10231C] outline-none focus:border-[#024430] flex-shrink-0"
        >
          <option value="name">Tên A-Z</option>
          <option value="stock_asc">Tồn kho thấp nhất</option>
          <option value="demand_desc">Nhu cầu cao nhất</option>
        </select>
      </div>

      {/* ── Inventory table ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E4EAE7] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-[#F6F8F7] border-b border-[#E4EAE7]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Thuốc</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Dạng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Nhà SX</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7A73]">Tồn kho</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7A73]">Đặt trước</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7A73]">Khả dụng</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Nhu cầu (BV/NT)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#6B7A73]">
                    Không tìm thấy mặt hàng nào phù hợp.
                  </td>
                </tr>
              )}
              {filtered.map((item) => {
                const status = getStockStatus(item);
                const meta = getStatusMeta(status);
                const formColors = FORM_COLORS[item.form] ?? { bg: "bg-gray-100", text: "text-gray-700" };
                const stockPct = item.maxStock > 0 ? Math.min(100, (item.availableQty / item.maxStock) * 100) : 0;

                return (
                  <tr key={item.id} className="border-t border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors">
                    {/* Drug name */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#10231C]">{item.name}</p>
                      <p className="text-xs text-[#6B7A73]">{item.ingredient}</p>
                    </td>

                    {/* Form */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${formColors.bg} ${formColors.text}`}>
                        {item.form}
                      </span>
                    </td>

                    {/* Manufacturer */}
                    <td className="px-4 py-3 text-[#6B7A73] text-xs">{item.manufacturer}</td>

                    {/* Stock qty */}
                    <td className="px-4 py-3 text-right">
                      <p className="font-medium text-[#10231C]">{fmtNum(item.stockQty)}</p>
                      <p className="text-[10px] text-[#6B7A73]">{item.unit}</p>
                    </td>

                    {/* Reserved */}
                    <td className="px-4 py-3 text-right">
                      <p className="text-[#6B7A73]">{fmtNum(item.reservedQty)}</p>
                    </td>

                    {/* Available + mini bar */}
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-[#10231C]">{fmtNum(item.availableQty)}</p>
                      <div className="w-20 ml-auto">
                        <div className="w-full h-1.5 bg-[#E4EAE7] rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${stockPct}%`, background: meta.barColor }}
                          />
                        </div>
                        <p className="text-[10px] text-[#6B7A73] text-right mt-0.5">
                          min {fmtNum(item.minStock)}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <Chip color={meta.chipColor} variant="flat" size="sm">
                        {meta.label}
                      </Chip>
                    </td>

                    {/* Demand chips */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
                          BV: {fmtNum(item.hospitalDemand)}
                        </span>
                        <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 whitespace-nowrap">
                          NT: {fmtNum(item.pharmacyDemand)}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-center">
                        <Button
                          size="sm"
                          color="primary"
                          variant="solid"
                          className="text-xs px-2 py-1 h-7"
                          isDisabled={isNPPFinance}
                          onClick={() => setReorderDrugId(item.id)}
                        >
                          Đặt thêm
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          className="text-xs px-2 py-1 h-7"
                          onClick={() => setSelectedId(item.id)}
                        >
                          Chi tiết
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div className="px-4 py-2 border-t border-[#E4EAE7] bg-[#F6F8F7] text-xs text-[#6B7A73] flex items-center justify-between">
          <span>
            Hiển thị <strong className="text-[#10231C]">{filtered.length}</strong> / {INVENTORY.length} mặt hàng
          </span>
          <span>
            Tổng khả dụng:{" "}
            <strong className="text-[#10231C]">
              {fmtNum(filtered.reduce((s, i) => s + i.availableQty, 0))}
            </strong>
          </span>
        </div>
      </div>

      {/* ── Stock status visual summary ───────────────────────── */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {INVENTORY.filter((i) => {
          const s = getStockStatus(i);
          return s === "stockout" || s === "critical" || s === "low";
        })
          .slice(0, 4)
          .map((item) => {
            const status = getStockStatus(item);
            const meta = getStatusMeta(status);
            const pct2 = item.maxStock > 0 ? Math.min(100, (item.availableQty / item.maxStock) * 100) : 0;
            return (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" >
                <CardBody className="py-3 px-4" >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-[#10231C] truncate flex-1">{item.name}</p>
                    <Chip color={meta.chipColor} variant="flat" size="sm">{meta.label}</Chip>
                  </div>
                  <Progress
                    value={pct2}
                    size="sm"
                    classNames={{ indicator: "" }}
                    className="mb-1"
                  />
                  <div
                    className="h-1.5 w-full rounded-full overflow-hidden bg-[#E4EAE7]"
                    style={{ display: "none" }}
                  />
                  <div className="flex justify-between text-[10px] text-[#6B7A73] mt-1">
                    <span>Khả dụng: {fmtNum(item.availableQty)}</span>
                    <span>Min: {fmtNum(item.minStock)}</span>
                  </div>
                  {item.pendingFromNCC > 0 && (
                    <p className="text-[10px] text-[#024430] mt-1 font-medium">
                      Chờ NCC: {fmtNum(item.pendingFromNCC)} {item.unit}
                    </p>
                  )}
                </CardBody>
              </Card>
            );
          })}
      </div>

      {/* ── Drug detail modal ─────────────────────────────────── */}
      {selectedItem && (
        <DrugDetailModal item={selectedItem} onClose={() => setSelectedId(null)} />
      )}

      {/* ── Reorder modal ─────────────────────────────────────── */}
      {reorderItem && (
        <ReorderModal item={reorderItem} onClose={() => setReorderDrugId(null)} />
      )}
    </div>
  );
}
