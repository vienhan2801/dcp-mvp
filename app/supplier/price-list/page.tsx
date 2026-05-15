"use client";
import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Chip, Button } from "@/components/ui";
import { fmtVND, fmtDate } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

type PriceScope = "standard" | "region" | "customer" | "contract";

interface PriceEntry {
  id: string;
  drugName: string;
  unit: string;
  scope: PriceScope;
  scopeDetail: string;  // e.g., "BV Chợ Rẫy" or "Miền Nam" or "HĐ-2024-001"
  price: number;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const PRICES: PriceEntry[] = [
  {
    id: "P001",
    drugName: "Paracetamol 500mg",
    unit: "Hộp 100 viên",
    scope: "standard",
    scopeDetail: "Toàn quốc",
    price: 18_000,
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    isActive: true,
  },
  {
    id: "P002",
    drugName: "Paracetamol 500mg",
    unit: "Hộp 100 viên",
    scope: "region",
    scopeDetail: "Miền Nam",
    price: 17_200,
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    isActive: true,
  },
  {
    id: "P003",
    drugName: "Paracetamol 500mg",
    unit: "Hộp 100 viên",
    scope: "customer",
    scopeDetail: "BV Chợ Rẫy",
    price: 16_500,
    effectiveFrom: "2026-03-01",
    effectiveTo: "2026-12-31",
    isActive: true,
  },
  {
    id: "P004",
    drugName: "Paracetamol 500mg",
    unit: "Hộp 100 viên",
    scope: "contract",
    scopeDetail: "HĐ-BV-HCM-2024-001",
    price: 15_800,
    effectiveFrom: "2024-07-01",
    effectiveTo: "2026-06-30",
    isActive: true,
  },
  {
    id: "P005",
    drugName: "Amoxicillin 500mg",
    unit: "Hộp 20 viên",
    scope: "standard",
    scopeDetail: "Toàn quốc",
    price: 42_000,
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    isActive: true,
  },
  {
    id: "P006",
    drugName: "Amoxicillin 500mg",
    unit: "Hộp 20 viên",
    scope: "contract",
    scopeDetail: "HĐ-BV-HN-2024-018",
    price: 38_500,
    effectiveFrom: "2024-10-01",
    effectiveTo: "2026-09-30",
    isActive: true,
  },
  {
    id: "P007",
    drugName: "Omeprazole 20mg",
    unit: "Hộp 28 viên",
    scope: "standard",
    scopeDetail: "Toàn quốc",
    price: 38_000,
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    isActive: true,
  },
  {
    id: "P008",
    drugName: "Omeprazole 20mg",
    unit: "Hộp 28 viên",
    scope: "region",
    scopeDetail: "Miền Trung",
    price: 36_500,
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    isActive: true,
  },
  {
    id: "P009",
    drugName: "Ceftriaxone 1g",
    unit: "Lọ",
    scope: "customer",
    scopeDetail: "BV Bạch Mai",
    price: 92_000,
    effectiveFrom: "2026-02-01",
    effectiveTo: "2027-01-31",
    isActive: true,
  },
  {
    id: "P010",
    drugName: "Insulin Glargine 100U/mL",
    unit: "Lọ 10mL",
    scope: "contract",
    scopeDetail: "HĐ-SO-CT-2025-003",
    price: 320_000,
    effectiveFrom: "2025-07-01",
    effectiveTo: "2027-06-30",
    isActive: true,
  },
];

// ─── Scope meta ───────────────────────────────────────────────────────────────

interface ScopeMeta {
  label: string;
  priority: number;
  chipColor: "default" | "secondary" | "primary" | "success";
  bg: string;
  text: string;
}

function getScopeMeta(scope: PriceScope): ScopeMeta {
  switch (scope) {
    case "contract":
      return { label: "Hợp đồng",   priority: 1, chipColor: "success",   bg: "bg-green-100",  text: "text-green-700" };
    case "customer":
      return { label: "Khách hàng", priority: 2, chipColor: "primary",   bg: "bg-blue-100",   text: "text-blue-700" };
    case "region":
      return { label: "Khu vực",    priority: 3, chipColor: "secondary", bg: "bg-purple-100", text: "text-purple-700" };
    case "standard":
      return { label: "Tiêu chuẩn", priority: 4, chipColor: "default",   bg: "bg-gray-100",   text: "text-gray-600" };
  }
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterTab = "all" | PriceScope;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",      label: "Tất cả" },
  { key: "contract", label: "Hợp đồng" },
  { key: "customer", label: "Khách hàng" },
  { key: "region",   label: "Khu vực" },
  { key: "standard", label: "Tiêu chuẩn" },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PriceListPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return PRICES;
    return PRICES.filter((p) => p.scope === activeTab);
  }, [activeTab]);

  // Count by scope for tab badges
  const countByScope = useMemo(() => {
    const counts: Record<PriceScope, number> = { contract: 0, customer: 0, region: 0, standard: 0 };
    PRICES.forEach((p) => counts[p.scope]++);
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F8F7]">
      <PageHeader
        title="Bảng giá"
        subtitle="Quản lý giá theo 4 cấp độ ưu tiên: HĐ > KH > Khu vực > Tiêu chuẩn"
        actions={
          <Button color="primary" size="sm">
            + Thêm giá
          </Button>
        }
      />

      {/* Priority info banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-blue-800 mb-2">Thứ tự ưu tiên áp giá</p>
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full text-xs">
              1. HĐ (Hợp đồng)
            </span>
            <span className="text-blue-500 font-bold">›</span>
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full text-xs">
              2. Khách hàng
            </span>
            <span className="text-blue-500 font-bold">›</span>
            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-full text-xs">
              3. Khu vực
            </span>
            <span className="text-blue-500 font-bold">›</span>
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 font-semibold px-3 py-1 rounded-full text-xs">
              4. Tiêu chuẩn
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Hệ thống tự động chọn giá có ưu tiên cao nhất khi lập đơn hàng. Giá Hợp đồng luôn được áp dụng trước.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(["contract", "customer", "region", "standard"] as PriceScope[]).map((scope) => {
          const meta = getScopeMeta(scope);
          return (
            <div key={scope} className="bg-white border border-[#E4EAE7] rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab(scope)}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                    P{meta.priority}
                  </span>
                  <span className="text-xs text-[#6B7A73]">{meta.label}</span>
                </div>
                <p className="text-2xl font-bold text-[#10231C]">{countByScope[scope]}</p>
                <p className="text-xs text-[#6B7A73] mt-0.5">mức giá</p>
              </div>
            </div>
          );
        })}
      </div>

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

      {/* Price table */}
      <div className="bg-white rounded-xl border border-[#E4EAE7] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead className="bg-[#F6F8F7] border-b border-[#E4EAE7]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Thuốc</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Đơn vị</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Phạm vi</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7A73]">Giá (VNĐ)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Hiệu lực</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#6B7A73]">
                    Không có mức giá nào phù hợp.
                  </td>
                </tr>
              )}
              {filtered.map((entry) => {
                const meta = getScopeMeta(entry.scope);
                return (
                  <tr key={entry.id} className="border-t border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#10231C]">{entry.drugName}</p>
                    </td>
                    <td className="px-4 py-3 text-[#6B7A73] text-xs">{entry.unit}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Chip color={meta.chipColor} variant="flat" size="sm">
                          {meta.label}
                        </Chip>
                        <span className="text-xs text-[#6B7A73]">{entry.scopeDetail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-lg font-bold text-[#024430]">{fmtVND(entry.price)}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-[#6B7A73]">
                      {fmtDate(entry.effectiveFrom)} → {fmtDate(entry.effectiveTo)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Chip color={entry.isActive ? "success" : "default"} variant="flat" size="sm">
                        {entry.isActive ? "Đang áp dụng" : "Hết hiệu lực"}
                      </Chip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-[#E4EAE7] bg-[#F6F8F7] text-xs text-[#6B7A73]">
          Hiển thị <strong className="text-[#10231C]">{filtered.length}</strong> / {PRICES.length} mức giá
        </div>
      </div>
    </div>
  );
}
