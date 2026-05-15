"use client";
import { useState } from "react";
import { fmtVND, fmtDate } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody } from "@/components/ui";
import Link from "next/link";

const ACCENT = "#1D4ED8";

type FilterKey = "all" | "active" | "expired";

interface MockContract {
  id: string;
  code: string;
  name: string;
  supplier: string;
  value: number;
  remaining: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired";
}

const MOCK_CONTRACTS: MockContract[] = [
  {
    id: "CTR-2026-001",
    code: "CTR-2026-001",
    name: "Hợp đồng cung ứng thuốc kháng sinh & giảm đau",
    supplier: "PhytoPharma",
    value: 8_500_000_000,
    remaining: 5_900_000_000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "active",
  },
  {
    id: "CTR-2026-002",
    code: "CTR-2026-002",
    name: "Hợp đồng cung ứng thuốc tim mạch & tiểu đường",
    supplier: "MedPharma",
    value: 4_200_000_000,
    remaining: 3_100_000_000,
    startDate: "2026-03-01",
    endDate: "2026-12-31",
    status: "active",
  },
  {
    id: "CTR-2025-015",
    code: "CTR-2025-015",
    name: "Hợp đồng cung ứng thuốc kháng viêm 2025",
    supplier: "PhytoPharma",
    value: 3_000_000_000,
    remaining: 0,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "expired",
  },
];

const STATUS_CONFIG = {
  active:  { label: "Đang hiệu lực", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  expired: { label: "Hết hạn",       cls: "bg-gray-100 text-gray-600 border-gray-200"          },
};

export default function CustomerContractsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = MOCK_CONTRACTS.filter((c) =>
    filter === "all" ? true : c.status === filter
  );

  const totalValue   = MOCK_CONTRACTS.filter((c) => c.status === "active").reduce((s, c) => s + c.value, 0);
  const totalRemain  = MOCK_CONTRACTS.filter((c) => c.status === "active").reduce((s, c) => s + c.remaining, 0);

  return (
    <div>
      <PageHeader
        title="Hợp đồng"
        subtitle="Danh sách hợp đồng cung ứng thuốc đang hiệu lực"
      />

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Hợp đồng đang HĐ", value: MOCK_CONTRACTS.filter((c) => c.status === "active").length.toString(), icon: "📋" },
          { label: "Tổng giá trị HĐ",  value: fmtVND(totalValue),  icon: "💰" },
          { label: "Giá trị còn lại",   value: fmtVND(totalRemain), icon: "📊" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-[#E4EAE7] rounded-2xl p-4 text-center">
            <p className="text-xl mb-1">{kpi.icon}</p>
            <p className="text-lg font-bold text-[#10231C]">{kpi.value}</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {([["all", "Tất cả"], ["active", "Hiệu lực"], ["expired", "Hết hạn"]] as [FilterKey, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === key ? "text-white" : "bg-white border border-[#E4EAE7] text-[#6B7A73] hover:bg-[#F6F8F7]"
            }`}
            style={filter === key ? { backgroundColor: ACCENT } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contract cards */}
      <div className="flex flex-col gap-4">
        {filtered.map((contract) => {
          const status = STATUS_CONFIG[contract.status];
          const usedPct = contract.value > 0
            ? Math.round(((contract.value - contract.remaining) / contract.value) * 100)
            : 100;
          const isActive = contract.status === "active";

          return (
            <Card key={contract.id} className={`border-2 hover:shadow-md transition-shadow ${isActive ? "border-[#1D4ED8]/30" : "border-[#E4EAE7]"}`}>
              <CardBody className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${status.cls}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-[#6B7A73] font-mono">{contract.code}</span>
                    </div>
                    <h3 className="font-semibold text-[#10231C] text-base mb-1 leading-tight">{contract.name}</h3>
                    <p className="text-sm text-[#6B7A73]">
                      NPP: <strong className="text-[#10231C]">{contract.supplier}</strong>
                    </p>
                    <p className="text-sm text-[#6B7A73] mt-0.5">
                      Hiệu lực: {fmtDate(contract.startDate)} → {fmtDate(contract.endDate)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold" style={{ color: ACCENT }}>{fmtVND(contract.value)}</p>
                    <p className="text-xs text-[#6B7A73]">Tổng giá trị</p>
                    {isActive && (
                      <p className="text-sm font-semibold text-[#6B7A73] mt-1">Còn lại: {fmtVND(contract.remaining)}</p>
                    )}
                  </div>
                </div>

                {/* Progress */}
                {isActive && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#6B7A73]">Đã sử dụng</span>
                      <span className="font-semibold" style={{ color: ACCENT }}>{usedPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E4EAE7] overflow-hidden">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${usedPct}%`, backgroundColor: ACCENT }} />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  {isActive && (
                    <Link href={`/customer/orders/new?contractId=${contract.id}`}>
                      <span className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white rounded-xl cursor-pointer transition-colors hover:opacity-90"
                        style={{ backgroundColor: ACCENT }}>
                        🛒 Tạo đơn hàng
                      </span>
                    </Link>
                  )}
                  <Link href={`/customer/contracts/${contract.id}`}>
                    <span className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#6B7A73] bg-[#F6F8F7] border border-[#E4EAE7] rounded-xl cursor-pointer hover:bg-white transition-colors">
                      Xem chi tiết →
                    </span>
                  </Link>
                </div>
              </CardBody>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#6B7A73]">
            <p className="text-lg">Không có hợp đồng nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
