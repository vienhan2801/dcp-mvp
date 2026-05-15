"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { fmtVND, fmtDate, pct } from "@/lib/format";
import { BarChart, PieChart, LineChart } from "@/components/Charts";
import { Card, CardBody, CardHeader, Chip } from "@/components/ui";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import type { Contract, ContractItem } from "@/domain/models/contract";

// ── Inline contract data (3 contracts) ───────────────────────────────────────

const ALL_CONTRACTS: Contract[] = [
  {
    id: "ctr-2026-001",
    tenderCode: "TDR-2026-001",
    contractCode: "CTR-2026-001",
    contractName: "Thuốc generic nhóm 1",
    supplierName: "PhytoPharma",
    hospitalName: "BV Chợ Rẫy",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    contractStatus: "active",
    paymentTerm: "30 ngày",
    deliveryTerm: "FOB kho",
    totalContractValue: 12_700_000_000,
    requestedValue:      9_800_000_000,
    confirmedValue:      9_500_000_000,
    deliveredValue:      9_144_000_000,
    paidValue:           7_000_000_000,
    outstandingValue:    2_144_000_000,
    remainingValue:      3_556_000_000,
    items: [
      {
        id: "item-001-1",
        productCode: "PC-001",
        productName: "Paracetamol 500mg",
        activeIngredient: "Paracetamol",
        dosageForm: "Viên nén",
        specification: "500mg",
        unit: "Hộp",
        contractedQty: 10000,
        requestedQty:   8000,
        confirmedQty:   7800,
        fulfilledQty:   7500,
        deliveredQty:   7200,
        remainingQty:   2800,
        unitPrice: 45_000,
        expiryDate: "2027-06-30",
        batchNo: "BT-2026-001",
        status: "available",
      },
      {
        id: "item-001-2",
        productCode: "PC-002",
        productName: "Ibuprofen 400mg",
        activeIngredient: "Ibuprofen",
        dosageForm: "Viên nén",
        specification: "400mg",
        unit: "Hộp",
        contractedQty: 5000,
        requestedQty:  4200,
        confirmedQty:  4000,
        fulfilledQty:  3900,
        deliveredQty:  3800,
        remainingQty:  1200,
        unitPrice: 62_000,
        expiryDate: "2027-03-31",
        batchNo: "BT-2026-002",
        status: "available",
      },
      {
        id: "item-001-3",
        productCode: "PC-003",
        productName: "Metformin 500mg",
        activeIngredient: "Metformin HCl",
        dosageForm: "Viên nén",
        specification: "500mg",
        unit: "Hộp",
        contractedQty: 8000,
        requestedQty:  5500,
        confirmedQty:  5300,
        fulfilledQty:  5000,
        deliveredQty:  4900,
        remainingQty:  3100,
        unitPrice: 38_000,
        expiryDate: "2027-09-30",
        batchNo: "BT-2026-003",
        status: "low_remaining",
      },
      {
        id: "item-001-4",
        productCode: "PC-004",
        productName: "Amlodipine 5mg",
        activeIngredient: "Amlodipine besylate",
        dosageForm: "Viên nén",
        specification: "5mg",
        unit: "Hộp",
        contractedQty: 6000,
        requestedQty:  4800,
        confirmedQty:  4600,
        fulfilledQty:  4400,
        deliveredQty:  4200,
        remainingQty:  1800,
        unitPrice: 55_000,
        expiryDate: "2027-05-31",
        batchNo: "BT-2026-004",
        status: "available",
      },
      {
        id: "item-001-5",
        productCode: "PC-005",
        productName: "Omeprazole 20mg",
        activeIngredient: "Omeprazole",
        dosageForm: "Viên nang",
        specification: "20mg",
        unit: "Hộp",
        contractedQty: 4000,
        requestedQty:  2800,
        confirmedQty:  2700,
        fulfilledQty:  2600,
        deliveredQty:  2500,
        remainingQty:  1500,
        unitPrice: 72_000,
        expiryDate: "2027-01-31",
        batchNo: "BT-2026-005",
        status: "available",
      },
      {
        id: "item-001-6",
        productCode: "PC-006",
        productName: "Atorvastatin 10mg",
        activeIngredient: "Atorvastatin calcium",
        dosageForm: "Viên nén",
        specification: "10mg",
        unit: "Hộp",
        contractedQty: 3000,
        requestedQty:  1800,
        confirmedQty:  1700,
        fulfilledQty:  1650,
        deliveredQty:  1544,
        remainingQty:  1456,
        unitPrice: 95_000,
        expiryDate: "2027-04-30",
        batchNo: "BT-2026-006",
        status: "available",
      },
    ],
  },
  {
    id: "ctr-2026-002",
    tenderCode: "TDR-2026-002",
    contractCode: "CTR-2026-002",
    contractName: "Kháng sinh & đặc trị",
    supplierName: "PhytoPharma",
    hospitalName: "BV Nhân dân 115",
    startDate: "2026-02-01",
    endDate: "2026-12-31",
    contractStatus: "active",
    paymentTerm: "45 ngày",
    deliveryTerm: "CIF kho bệnh viện",
    totalContractValue: 8_200_000_000,
    requestedValue:     4_000_000_000,
    confirmedValue:     3_800_000_000,
    deliveredValue:     3_362_000_000,
    paidValue:          2_500_000_000,
    outstandingValue:     862_000_000,
    remainingValue:     4_838_000_000,
    items: [
      {
        id: "item-002-1",
        productCode: "AB-001",
        productName: "Amoxicillin 500mg",
        activeIngredient: "Amoxicillin trihydrate",
        dosageForm: "Viên nang",
        specification: "500mg",
        unit: "Hộp",
        contractedQty: 6000,
        requestedQty:  3000,
        confirmedQty:  2900,
        fulfilledQty:  2700,
        deliveredQty:  2460,
        remainingQty:  3540,
        unitPrice: 85_000,
        expiryDate: "2027-08-31",
        batchNo: "BT-2026-AB1",
        status: "available",
      },
      {
        id: "item-002-2",
        productCode: "AB-002",
        productName: "Cefuroxime 500mg",
        activeIngredient: "Cefuroxime axetil",
        dosageForm: "Viên nén",
        specification: "500mg",
        unit: "Hộp",
        contractedQty: 3000,
        requestedQty:  1100,
        confirmedQty:  1000,
        fulfilledQty:   950,
        deliveredQty:   870,
        remainingQty:  2130,
        unitPrice: 220_000,
        expiryDate: "2027-07-31",
        batchNo: "BT-2026-AB2",
        status: "available",
      },
      {
        id: "item-002-3",
        productCode: "AB-003",
        productName: "Azithromycin 500mg",
        activeIngredient: "Azithromycin dihydrate",
        dosageForm: "Viên nén",
        specification: "500mg",
        unit: "Hộp",
        contractedQty: 2000,
        requestedQty:   750,
        confirmedQty:   700,
        fulfilledQty:   650,
        deliveredQty:   580,
        remainingQty:  1420,
        unitPrice: 180_000,
        expiryDate: "2027-06-30",
        batchNo: "BT-2026-AB3",
        status: "available",
      },
      {
        id: "item-002-4",
        productCode: "SP-001",
        productName: "Vancomycin 500mg IV",
        activeIngredient: "Vancomycin HCl",
        dosageForm: "Bột pha tiêm",
        specification: "500mg/lọ",
        unit: "Lọ",
        contractedQty: 1500,
        requestedQty:   400,
        confirmedQty:   380,
        fulfilledQty:   360,
        deliveredQty:   292,
        remainingQty:  1208,
        unitPrice: 750_000,
        expiryDate: "2027-02-28",
        batchNo: "BT-2026-SP1",
        status: "available",
      },
    ],
  },
  {
    id: "ctr-2025-010",
    tenderCode: "TDR-2025-010",
    contractCode: "CTR-2025-010",
    contractName: "Thuốc nhóm 2 (BV Bình Dân)",
    supplierName: "PhytoPharma",
    hospitalName: "BV Bình Dân",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    contractStatus: "expired",
    paymentTerm: "30 ngày",
    deliveryTerm: "FOB kho",
    totalContractValue: 5_600_000_000,
    requestedValue:     5_500_000_000,
    confirmedValue:     5_480_000_000,
    deliveredValue:     5_488_000_000,
    paidValue:          5_488_000_000,
    outstandingValue:             0,
    remainingValue:       112_000_000,
    items: [
      {
        id: "item-010-1",
        productCode: "G2-001",
        productName: "Captopril 25mg",
        activeIngredient: "Captopril",
        dosageForm: "Viên nén",
        specification: "25mg",
        unit: "Hộp",
        contractedQty: 4000,
        requestedQty:  3960,
        confirmedQty:  3950,
        fulfilledQty:  3940,
        deliveredQty:  3920,
        remainingQty:    80,
        unitPrice: 28_000,
        expiryDate: "2026-12-31",
        batchNo: "BT-2025-G01",
        status: "fully_allocated",
      },
      {
        id: "item-010-2",
        productCode: "G2-002",
        productName: "Furosemide 40mg",
        activeIngredient: "Furosemide",
        dosageForm: "Viên nén",
        specification: "40mg",
        unit: "Hộp",
        contractedQty: 3000,
        requestedQty:  2980,
        confirmedQty:  2970,
        fulfilledQty:  2960,
        deliveredQty:  2940,
        remainingQty:    60,
        unitPrice: 22_000,
        expiryDate: "2026-10-31",
        batchNo: "BT-2025-G02",
        status: "fully_allocated",
      },
      {
        id: "item-010-3",
        productCode: "G2-003",
        productName: "Digoxin 0.25mg",
        activeIngredient: "Digoxin",
        dosageForm: "Viên nén",
        specification: "0.25mg",
        unit: "Hộp",
        contractedQty: 2000,
        requestedQty:  1990,
        confirmedQty:  1985,
        fulfilledQty:  1980,
        deliveredQty:  1960,
        remainingQty:    40,
        unitPrice: 35_000,
        expiryDate: "2026-11-30",
        batchNo: "BT-2025-G03",
        status: "fully_allocated",
      },
      {
        id: "item-010-4",
        productCode: "G2-004",
        productName: "Spironolactone 25mg",
        activeIngredient: "Spironolactone",
        dosageForm: "Viên nén",
        specification: "25mg",
        unit: "Hộp",
        contractedQty: 2500,
        requestedQty:  2480,
        confirmedQty:  2475,
        fulfilledQty:  2465,
        deliveredQty:  2450,
        remainingQty:    50,
        unitPrice: 42_000,
        expiryDate: "2026-09-30",
        batchNo: "BT-2025-G04",
        status: "fully_allocated",
      },
      {
        id: "item-010-5",
        productCode: "G2-005",
        productName: "Bisoprolol 5mg",
        activeIngredient: "Bisoprolol fumarate",
        dosageForm: "Viên nén",
        specification: "5mg",
        unit: "Hộp",
        contractedQty: 3000,
        requestedQty:  2970,
        confirmedQty:  2960,
        fulfilledQty:  2950,
        deliveredQty:  2940,
        remainingQty:    60,
        unitPrice: 58_000,
        expiryDate: "2026-08-31",
        batchNo: "BT-2025-G05",
        status: "fully_allocated",
      },
    ],
  },
];

// ── Shared sub-components ────────────────────────────────────────────────────

function PipelineCard({
  count, label, color, dotColor, href,
}: { count: number; label: string; color: string; dotColor: string; href: string }) {
  return (
    <div className={`flex-1 rounded-2xl border-2 ${color} bg-white p-5 flex flex-col gap-2 min-w-0`}>
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
        <span className="text-xs font-medium text-[#6B7A73] leading-tight">{label}</span>
      </div>
      <p className="text-4xl font-extrabold text-[#10231C] leading-none">{count}</p>
      <Link href={href}>
        <span className="text-xs font-semibold text-[#024430] hover:underline cursor-pointer">Xem →</span>
      </Link>
    </div>
  );
}

function NavTile({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-[#E4EAE7] hover:bg-[#F0FDF4] hover:border-[#024430] transition-all cursor-pointer group">
        <span className="text-2xl">{icon}</span>
        <span className="text-[11px] font-semibold text-[#10231C] text-center group-hover:text-[#024430]">{label}</span>
      </div>
    </Link>
  );
}

function ContractSelectorCard({
  contract,
  selected,
  onClick,
}: {
  contract: Contract;
  selected: boolean;
  onClick: () => void;
}) {
  const fulfillPct = pct(contract.deliveredValue, contract.totalContractValue);
  const isActive = contract.contractStatus === "active";
  const tyBillion = (contract.totalContractValue / 1_000_000_000).toFixed(1);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex flex-col gap-1.5 p-3 rounded-xl border text-left transition-all cursor-pointer min-w-[160px]",
        selected
          ? "border-[#024430] bg-white shadow-md shadow-green-100 ring-1 ring-[#024430]/20"
          : "border-[#D1D5DB] bg-[#F6F8F7] hover:border-[#024430]/40",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-bold text-[#6B7A73]">{contract.contractCode}</span>
        <span
          className={[
            "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
            isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500",
          ].join(" ")}
        >
          {isActive ? "Đang HĐ" : "Hết hạn"}
        </span>
      </div>
      <p className="text-xs font-semibold text-[#10231C] truncate leading-tight">{contract.hospitalName}</p>
      <p className="text-[10px] text-[#6B7A73]">{tyBillion} tỷ ₫</p>
      <div className="flex items-center gap-1.5">
        <div className="flex-1 bg-[#E4EAE7] rounded-full h-[3px]">
          <div
            className={[
              "h-[3px] rounded-full",
              fulfillPct >= 70 ? "bg-[#024430]" : fulfillPct >= 30 ? "bg-amber-500" : "bg-red-400",
            ].join(" ")}
            style={{ width: `${Math.min(100, fulfillPct)}%` }}
          />
        </div>
        <span className="text-[9px] font-bold text-[#6B7A73]">{fulfillPct}%</span>
      </div>
    </button>
  );
}

function DrugProgressRow({ item }: { item: ContractItem }) {
  const deliveredPct = pct(item.deliveredQty, item.contractedQty);
  const isRed   = deliveredPct < 30;
  const isAmber = deliveredPct >= 30 && deliveredPct < 70;
  const barColor  = isRed ? "bg-red-500"   : isAmber ? "bg-amber-500"  : "bg-[#024430]";
  const textColor = isRed ? "text-red-600" : isAmber ? "text-amber-600" : "text-[#024430]";

  return (
    <div className="border border-[#E4EAE7] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[#10231C]">{item.productName}</span>
        <span className={`text-xs font-bold ${textColor}`}>{deliveredPct}%</span>
      </div>
      <div className="grid grid-cols-4 gap-1 text-xs text-[#6B7A73] mb-2">
        <div>
          <p className="text-[10px]">HĐ</p>
          <p className="font-semibold text-[#10231C]">{item.contractedQty}<span className="font-normal"> {item.unit}</span></p>
        </div>
        <div>
          <p className="text-[10px]">Đã giao</p>
          <p className="font-semibold text-[#10231C]">{item.deliveredQty}<span className="font-normal"> {item.unit}</span></p>
        </div>
        <div>
          <p className="text-[10px]">Còn lại</p>
          <p className={`font-semibold ${item.remainingQty > 0 ? textColor : "text-[#10231C]"}`}>
            {item.remainingQty}<span className={`font-normal ${item.remainingQty > 0 ? textColor : "text-[#6B7A73]"}`}> {item.unit}</span>
          </p>
        </div>
        <div>
          <p className="text-[10px]">% xong</p>
          <p className={`font-bold ${textColor}`}>{deliveredPct}%</p>
        </div>
      </div>
      <div className="w-full bg-[#E4EAE7] rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${Math.min(100, deliveredPct)}%` }} />
      </div>
    </div>
  );
}

// ── SupplierLogisticsDashboard ────────────────────────────────────────────────

const LOGISTICS_PENDING_ORDERS = [
  { id: "ORD-2026-041", customer: "BV Chợ Rẫy",       type: "Thuốc generic", qty: "1.200 hộp", dueDate: "10/05/2026" },
  { id: "ORD-2026-042", customer: "BV Nhân dân 115",   type: "Kháng sinh",    qty: "800 hộp",  dueDate: "11/05/2026" },
  { id: "ORD-2026-043", customer: "NT Minh Phúc",      type: "Vitamin",       qty: "300 lọ",   dueDate: "12/05/2026" },
  { id: "ORD-2026-044", customer: "BV Bình Dân",       type: "Tim mạch",      qty: "500 hộp",  dueDate: "13/05/2026" },
];

function SupplierLogisticsDashboard() {
  const ACCENT = "#024430";
  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title="Dashboard Kho vận — PhytoPharma" subtitle="NPP · Kho vận" />

      {/* Alert strip */}
      <Link href="/supplier/drugs">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-300 cursor-pointer hover:bg-red-100 transition-colors">
          <span className="text-sm font-semibold text-red-800 flex-1">
            ⚠️ 2 mặt hàng cần bổ sung: Azithromycin 250mg, Dexamethasone 0.5mg
          </span>
          <span className="text-xs font-bold text-red-700 underline whitespace-nowrap">Xem kho →</span>
        </div>
      </Link>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/supplier/orders">
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-orange-400 transition-colors">
            <p className="text-xs font-medium text-orange-700">Đơn cần xử lý hôm nay</p>
            <p className="text-4xl font-extrabold text-orange-800 leading-none">7</p>
            <p className="text-xs text-orange-600">đơn</p>
          </div>
        </Link>
        <Link href="/supplier/deliveries">
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-blue-400 transition-colors">
            <p className="text-xs font-medium text-blue-700">Lô hàng đang vận chuyển</p>
            <p className="text-4xl font-extrabold text-blue-800 leading-none">4</p>
            <p className="text-xs text-blue-600">lô</p>
          </div>
        </Link>
        <Link href="/supplier/drugs">
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-red-400 transition-colors">
            <p className="text-xs font-medium text-red-700">Mặt hàng tồn kho thấp</p>
            <p className="text-4xl font-extrabold text-red-800 leading-none">3</p>
            <p className="text-xs text-red-600">SKU</p>
          </div>
        </Link>
      </div>

      {/* Đơn chờ xuất kho */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="font-semibold text-[#10231C]">Đơn chờ xuất kho</h3>
          <Link href="/supplier/orders">
            <span className="text-xs font-medium hover:underline cursor-pointer" style={{ color: ACCENT }}>Xem tất cả →</span>
          </Link>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4EAE7]">
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Mã đơn</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Khách hàng</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Loại</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Số lượng</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Ngày cần giao</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {LOGISTICS_PENDING_ORDERS.map((row) => (
                  <tr key={row.id} className="border-b border-[#F3F4F6] last:border-0">
                    <td className="py-2.5 pr-4 font-mono text-xs font-semibold text-[#10231C]">{row.id}</td>
                    <td className="py-2.5 pr-4 text-xs text-[#10231C]">{row.customer}</td>
                    <td className="py-2.5 pr-4 text-xs text-[#6B7A73]">{row.type}</td>
                    <td className="py-2.5 pr-4 text-xs text-[#10231C]">{row.qty}</td>
                    <td className="py-2.5 pr-4 text-xs text-[#6B7A73]">{row.dueDate}</td>
                    <td className="py-2.5">
                      <Link href={`/supplier/orders/${row.id}`}>
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: ACCENT }}>
                          Xuất kho
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

      {/* Quick links */}
      <div className="grid grid-cols-4 gap-3">
        <NavTile icon="📦" label="Tồn kho"   href="/supplier/drugs" />
        <NavTile icon="📋" label="Đơn hàng"  href="/supplier/orders" />
        <NavTile icon="🚚" label="Giao hàng" href="/supplier/deliveries" />
        <NavTile icon="📝" label="Nhật ký"   href="/supplier/orders" />
      </div>
    </div>
  );
}

// ── SupplierFinanceDashboard ──────────────────────────────────────────────────

const FINANCE_COLLECTION_DATA = [
  { label: "T12", value: 1.2 },
  { label: "T1",  value: 1.5 },
  { label: "T2",  value: 1.8 },
  { label: "T3",  value: 2.1 },
  { label: "T4",  value: 1.6 },
  { label: "T5",  value: 1.8 },
];

const FINANCE_RECENT_PAYMENTS = [
  { customer: "BV Chợ Rẫy",     amount: 450_000_000, date: "02/05/2026", status: "paid"    },
  { customer: "BV Nhân dân 115", amount: 320_000_000, date: "28/04/2026", status: "paid"    },
  { customer: "NT Minh Phúc",    amount:  22_000_000, date: "25/04/2026", status: "paid"    },
  { customer: "BV Bình Dân",     amount: 320_000_000, date: "15/06/2026", status: "pending" },
  { customer: "BV Chợ Rẫy",     amount: 160_000_000, date: "30/06/2026", status: "pending" },
];

const FINANCE_DUE_SOON = [
  { name: "BV Bình Dân",   amount: 320_000_000, dueDate: "15/06/2026" },
  { name: "BV Chợ Rẫy",   amount: 160_000_000, dueDate: "30/06/2026" },
];

function SupplierFinanceDashboard() {
  const ACCENT = "#024430";
  const statusCls: Record<string, string> = {
    paid:    "bg-green-100 text-green-700",
    pending: "bg-orange-100 text-orange-700",
  };
  const statusLabel: Record<string, string> = {
    paid:    "Đã thu",
    pending: "Chờ thu",
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title="Dashboard Tài chính — PhytoPharma" subtitle="NPP · Tài chính" />

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <Link href="/supplier/payments">
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-orange-400 transition-colors">
            <p className="text-xs font-medium text-orange-700">Công nợ phải thu</p>
            <p className="text-2xl font-extrabold text-orange-800 leading-none">3,2 tỷ ₫</p>
            <p className="text-[10px] text-orange-600">từ BV / nhà thuốc</p>
          </div>
        </Link>
        <Link href="/supplier/payments">
          <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-green-400 transition-colors">
            <p className="text-xs font-medium text-green-700">Thu trong tháng</p>
            <p className="text-2xl font-extrabold text-green-800 leading-none">1,8 tỷ ₫</p>
            <p className="text-[10px] text-green-600">tháng 5/2026</p>
          </div>
        </Link>
        <Link href="/supplier/payments">
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 flex flex-col gap-1 cursor-pointer hover:border-red-400 transition-colors">
            <p className="text-xs font-medium text-red-700">Quá hạn thanh toán</p>
            <p className="text-2xl font-extrabold text-red-800 leading-none">480 triệu ₫</p>
            <p className="text-[10px] text-red-600">cần xử lý ngay</p>
          </div>
        </Link>
        <Link href="/supplier/contracts">
          <div className="rounded-2xl border-2 border-[#D1FAE5] bg-[#F0FDF4] p-5 flex flex-col gap-1 cursor-pointer hover:border-[#024430] transition-colors">
            <p className="text-xs font-medium" style={{ color: ACCENT }}>Hợp đồng đang HĐ</p>
            <p className="text-2xl font-extrabold leading-none" style={{ color: ACCENT }}>3</p>
            <p className="text-[10px] text-[#6B7A73]">HĐ đang hoạt động</p>
          </div>
        </Link>
      </div>

      {/* Line chart */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#10231C]">Thu tiền 6 tháng gần nhất</h3>
          <p className="text-xs text-[#6B7A73] mt-0.5">Đơn vị: tỷ ₫</p>
        </CardHeader>
        <CardBody>
          <LineChart
            data={FINANCE_COLLECTION_DATA}
            height={160}
            color={ACCENT}
            formatValue={(v) => `${v.toFixed(1)}B`}
          />
        </CardBody>
      </Card>

      {/* Thanh toán gần đây */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="font-semibold text-[#10231C]">Thanh toán gần đây</h3>
          <Link href="/supplier/payments">
            <span className="text-xs font-medium hover:underline cursor-pointer" style={{ color: ACCENT }}>Xem tất cả →</span>
          </Link>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4EAE7]">
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Bệnh viện / NT</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Số tiền</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2 pr-4">Ngày</th>
                  <th className="text-left text-xs font-semibold text-[#6B7A73] pb-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {FINANCE_RECENT_PAYMENTS.map((row, i) => (
                  <tr key={i} className="border-b border-[#F3F4F6] last:border-0">
                    <td className="py-2.5 pr-4 text-xs font-semibold text-[#10231C]">{row.customer}</td>
                    <td className="py-2.5 pr-4 text-xs text-[#10231C]">{fmtVND(row.amount)}</td>
                    <td className="py-2.5 pr-4 text-xs text-[#6B7A73]">{row.date}</td>
                    <td className="py-2.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCls[row.status]}`}>
                        {statusLabel[row.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Sắp đến hạn */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#10231C]">Sắp đến hạn thanh toán</h3>
        </CardHeader>
        <CardBody className="pt-0 flex flex-col gap-2">
          {FINANCE_DUE_SOON.map((item, i) => (
            <Link href="/supplier/payments" key={i}>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-orange-900">{item.name}</p>
                  <p className="text-xs text-orange-700">đến hạn {item.dueDate}</p>
                </div>
                <p className="text-sm font-bold text-orange-800">{fmtVND(item.amount)}</p>
              </div>
            </Link>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

// ── SupplierAdminDashboard (existing content) ────────────────────────────────

function SupplierAdminDashboard() {
  const { state } = useApp();
  const { contract, orders } = state;

  const [selectedContractId, setSelectedContractId] = useState<string>(ALL_CONTRACTS[0].id);
  const selectedContract = ALL_CONTRACTS.find((c) => c.id === selectedContractId) ?? ALL_CONTRACTS[0];

  const avgPct = selectedContract.items.length > 0
    ? Math.round(
        selectedContract.items.reduce(
          (sum, item) => sum + pct(item.deliveredQty, item.contractedQty),
          0,
        ) / selectedContract.items.length,
      )
    : 0;

  const pendingOrders   = orders.filter((o) => o.status === "pending_confirmation").length;
  const preparingOrders = orders.filter((o) => o.status === "preparing").length;
  const shippingOrders  = orders.filter((o) => o.status === "shipping").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  const monthMap: Record<string, number> = {};
  for (let m = 1; m <= 5; m++) {
    monthMap[`2026-${String(m).padStart(2, "0")}`] = 0;
  }
  orders.forEach((o) => {
    const k = o.orderDate.slice(0, 7);
    if (k in monthMap) monthMap[k] += o.totalRequestedAmount;
  });
  const barData = Object.entries(monthMap).map(([, v], i) => ({
    label: `T${i + 1}`,
    value: v,
  }));

  const paid        = contract.paidValue;
  const outstanding = contract.outstandingValue;
  const notDue      = Math.max(0, contract.deliveredValue - paid - outstanding);
  const paySlices = [
    { label: "Đã thanh toán", value: paid,        color: "#22C55E" },
    { label: "Còn nợ",        value: outstanding,  color: "#F97316" },
    { label: "Chưa đến hạn",  value: notDue,       color: "#D1D5DB" },
  ].filter((s) => s.value > 0);

  const recentOrders = [...orders].sort((a, b) =>
    new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  ).slice(0, 3);

  const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const remainingTy    = (selectedContract.remainingValue / 1_000_000_000).toFixed(2);
  const deliveryPct    = pct(selectedContract.deliveredValue, selectedContract.totalContractValue);
  const outstandingAmt = selectedContract.outstandingValue;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Bảng điều khiển" subtitle="PhytoPharma · Nhà phân phối" />
        <span className="text-xs text-[#6B7A73] whitespace-nowrap mt-1 pt-1">{today}</span>
      </div>

      <div className="flex gap-3 items-stretch">
        <PipelineCard count={pendingOrders}   label="Chờ xác nhận"    color="border-orange-300" dotColor="bg-orange-400" href="/supplier/orders?status=pending_confirmation" />
        <div className="flex items-center text-[#CBD5E1] font-light text-xl select-none">›</div>
        <PipelineCard count={preparingOrders} label="Đang chuẩn bị"   color="border-blue-300"   dotColor="bg-blue-400"   href="/supplier/orders?status=preparing" />
        <div className="flex items-center text-[#CBD5E1] font-light text-xl select-none">›</div>
        <PipelineCard count={shippingOrders}  label="Đang vận chuyển" color="border-indigo-300"  dotColor="bg-indigo-500" href="/supplier/deliveries" />
        <div className="flex items-center text-[#CBD5E1] font-light text-xl select-none">›</div>
        <PipelineCard count={deliveredOrders} label="Đã giao"          color="border-green-300"  dotColor="bg-green-500"  href="/supplier/deliveries?status=delivered" />
      </div>

      {(pendingOrders > 0 || deliveredOrders > 0) && (
        <div className="flex flex-wrap gap-3">
          {pendingOrders > 0 && (
            <Link href="/supplier/orders?status=pending_confirmation">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors">
                <span className="text-sm">🔔</span>
                <span className="text-xs font-semibold text-orange-700">{pendingOrders} đơn chờ xác nhận</span>
              </div>
            </Link>
          )}
          {deliveredOrders > 0 && (
            <Link href="/supplier/deliveries?status=delivered">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                <span className="text-sm">✅</span>
                <span className="text-xs font-semibold text-green-700">{deliveredOrders} đơn chờ nghiệm thu từ bệnh viện</span>
              </div>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Doanh thu theo tháng</h3>
              <p className="text-xs text-[#6B7A73] mt-0.5">T1–T5 / 2026</p>
            </CardHeader>
            <CardBody>
              <BarChart
                data={barData}
                height={150}
                color="#024430"
                showValues
                formatValue={(v) => v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : "0"}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#10231C]">Tiến độ hợp đồng</h3>
                <p className="text-xs text-[#6B7A73] mt-0.5">{ALL_CONTRACTS.length} hợp đồng</p>
              </div>
              <Link href="/supplier/aggregation">
                <span className="text-xs text-[#024430] font-medium hover:underline cursor-pointer">Xem chi tiết →</span>
              </Link>
            </CardHeader>
            <CardBody className="flex flex-col gap-4 pt-0">
              <div className="flex flex-wrap gap-2">
                {ALL_CONTRACTS.map((c) => (
                  <ContractSelectorCard
                    key={c.id}
                    contract={c}
                    selected={c.id === selectedContractId}
                    onClick={() => setSelectedContractId(c.id)}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#10231C]">{selectedContract.contractName}</p>
                    <p className="text-[10px] text-[#6B7A73]">
                      {selectedContract.hospitalName} · {fmtDate(selectedContract.startDate)} – {fmtDate(selectedContract.endDate)}
                    </p>
                  </div>
                  <Link href="/supplier/aggregation">
                    <span className="text-[10px] text-[#024430] font-medium hover:underline cursor-pointer whitespace-nowrap">Xem HĐ →</span>
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#F6F8F7] border border-[#E4EAE7] rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-[#6B7A73]">Giá trị còn lại</p>
                    <p className="text-xs font-bold text-[#10231C] mt-0.5">{remainingTy} tỷ ₫</p>
                  </div>
                  <div className="bg-[#F6F8F7] border border-[#E4EAE7] rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-[#6B7A73]">Tiến độ giao hàng</p>
                    <p className="text-xs font-bold text-[#024430] mt-0.5">{deliveryPct}%</p>
                  </div>
                  <div className={[
                    "border rounded-xl p-2.5 text-center",
                    outstandingAmt > 0 ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200",
                  ].join(" ")}>
                    <p className={`text-[10px] ${outstandingAmt > 0 ? "text-orange-600" : "text-green-600"}`}>Còn nợ</p>
                    <p className={`text-xs font-bold mt-0.5 ${outstandingAmt > 0 ? "text-orange-700" : "text-green-700"}`}>
                      {outstandingAmt > 0 ? fmtVND(outstandingAmt) : "Đã TT đủ"}
                    </p>
                  </div>
                </div>
                {selectedContract.items.map((item) => (
                  <DrugProgressRow key={item.id} item={item} />
                ))}
                <div className="border border-[#E4EAE7] rounded-xl p-3 bg-[#F6F8F7]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#10231C]">Tiến độ trung bình</span>
                    <span className="text-sm font-extrabold text-[#024430]">{avgPct}%</span>
                  </div>
                  <div className="w-full bg-[#E4EAE7] rounded-full h-2.5">
                    <div
                      className={[
                        "h-2.5 rounded-full",
                        avgPct >= 70 ? "bg-[#024430]" : avgPct >= 30 ? "bg-amber-500" : "bg-red-400",
                      ].join(" ")}
                      style={{ width: `${Math.min(100, avgPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Tình hình thanh toán</h3>
              <p className="text-xs text-[#6B7A73] mt-0.5">Tổng đã giao: {fmtVND(contract.deliveredValue)}</p>
            </CardHeader>
            <CardBody>
              {paySlices.length > 0
                ? <PieChart slices={paySlices} size={120} />
                : <p className="text-xs text-[#6B7A73]">Chưa có dữ liệu thanh toán</p>
              }
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-green-700">Đã thanh toán</p>
                  <p className="text-xs font-bold text-green-800">{fmtVND(paid)}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-orange-700">Còn nợ</p>
                  <p className="text-xs font-bold text-orange-800">{fmtVND(outstanding)}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#10231C]">Truy cập nhanh</h3>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <NavTile icon="📋" label="Đơn hàng"         href="/supplier/orders" />
                <NavTile icon="🚚" label="Giao hàng"         href="/supplier/deliveries" />
                <NavTile icon="💰" label="Thanh toán"        href="/supplier/payments" />
                <NavTile icon="📊" label="Tổng hợp nhu cầu" href="/supplier/aggregation" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-semibold text-[#10231C]">Đơn hàng gần đây</h3>
              <Link href="/supplier/orders">
                <span className="text-xs text-[#024430] font-medium hover:underline cursor-pointer">Tất cả →</span>
              </Link>
            </CardHeader>
            <CardBody className="flex flex-col gap-2 pt-0">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/supplier/orders/${order.id}`}>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E4EAE7] hover:bg-[#F0FDF4] transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#10231C] truncate">{order.id}</p>
                      <p className="text-[10px] text-[#6B7A73] truncate">{order.hospitalName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Chip color={ORDER_STATUS_COLORS[order.status]} variant="flat" size="sm">
                        {ORDER_STATUS_LABELS[order.status]}
                      </Chip>
                      <span className="text-[10px] text-[#6B7A73]">{fmtDate(order.orderDate)} · {fmtVND(order.totalRequestedAmount)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Entry point ───────────────────────────────────────────────────────────────

export default function SupplierDashboard() {
  const role = useRole();
  if (role.isNPPLogistics) return <SupplierLogisticsDashboard />;
  if (role.isNPPFinance)   return <SupplierFinanceDashboard />;
  return <SupplierAdminDashboard />;
}
