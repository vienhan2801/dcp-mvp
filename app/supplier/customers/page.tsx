"use client";
import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Button, Input, Chip } from "@/components/ui";
import { fmtVND } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────
type Rank = "Platinum" | "Gold" | "Silver" | "Bronze";
type CustomerStatus = "active" | "suspended";

interface Customer {
  id: string;
  name: string;
  type: string;
  city: string;
  creditLimit: number;
  usedCredit: number;
  activeContracts: number;
  totalOrders: number;
  rank: Rank;
  status: CustomerStatus;
}

// ─── Mock data ────────────────────────────────────────────────
const CUSTOMERS: Customer[] = [
  { id: "KH-001", name: "BV Chợ Rẫy", type: "Bệnh viện công", city: "TP.HCM", creditLimit: 5_000_000_000, usedCredit: 1_800_000_000, activeContracts: 2, totalOrders: 48, rank: "Platinum", status: "active" },
  { id: "KH-002", name: "BV Đại học Y Dược TP.HCM", type: "Bệnh viện công", city: "TP.HCM", creditLimit: 3_000_000_000, usedCredit: 780_000_000, activeContracts: 1, totalOrders: 31, rank: "Gold", status: "active" },
  { id: "KH-003", name: "Nhà thuốc Phúc Khang", type: "Nhà thuốc", city: "TP.HCM", creditLimit: 500_000_000, usedCredit: 120_000_000, activeContracts: 1, totalOrders: 15, rank: "Silver", status: "active" },
  { id: "KH-004", name: "Nhà thuốc An Khang", type: "Nhà thuốc", city: "TP.HCM", creditLimit: 400_000_000, usedCredit: 310_000_000, activeContracts: 1, totalOrders: 12, rank: "Silver", status: "active" },
  { id: "KH-005", name: "Phòng khám Đa khoa Bình Thạnh", type: "Phòng khám", city: "TP.HCM", creditLimit: 300_000_000, usedCredit: 50_000_000, activeContracts: 1, totalOrders: 8, rank: "Bronze", status: "active" },
  { id: "KH-006", name: "BV Nhân dân 115", type: "Bệnh viện công", city: "TP.HCM", creditLimit: 4_000_000_000, usedCredit: 920_000_000, activeContracts: 1, totalOrders: 35, rank: "Gold", status: "active" },
  { id: "KH-007", name: "BV Tân Phú", type: "Bệnh viện công", city: "TP.HCM", creditLimit: 2_000_000_000, usedCredit: 650_000_000, activeContracts: 1, totalOrders: 22, rank: "Gold", status: "active" },
  { id: "KH-008", name: "Chuỗi nhà thuốc Pharmacity", type: "Chuỗi nhà thuốc", city: "Toàn quốc", creditLimit: 1_500_000_000, usedCredit: 480_000_000, activeContracts: 2, totalOrders: 28, rank: "Gold", status: "active" },
  { id: "KH-009", name: "BV Mắt TP.HCM", type: "Bệnh viện chuyên khoa", city: "TP.HCM", creditLimit: 800_000_000, usedCredit: 120_000_000, activeContracts: 1, totalOrders: 9, rank: "Bronze", status: "active" },
  { id: "KH-010", name: "Phòng khám FV", type: "Bệnh viện tư", city: "TP.HCM", creditLimit: 2_500_000_000, usedCredit: 1_900_000_000, activeContracts: 1, totalOrders: 19, rank: "Gold", status: "suspended" },
];

// ─── Helpers ──────────────────────────────────────────────────
const RANK_CONFIG: Record<Rank, { label: string; className: string }> = {
  Platinum: { label: "Platinum", className: "bg-purple-100 text-purple-700" },
  Gold:     { label: "Gold",     className: "bg-amber-100 text-amber-700" },
  Silver:   { label: "Silver",   className: "bg-slate-100 text-slate-600" },
  Bronze:   { label: "Bronze",   className: "bg-orange-100 text-orange-700" },
};

function RankBadge({ rank }: { rank: Rank }) {
  const cfg = RANK_CONFIG[rank];
  return (
    <span className={`inline-flex items-center rounded-full text-xs font-semibold px-2 py-0.5 ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function UsagePct({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const barColor = pct >= 80 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-[#024430]";
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 bg-[#E4EAE7] rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-[#10231C] w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────
const FILTER_TABS = [
  { key: "all",       label: "Tất cả" },
  { key: "hospital",  label: "Bệnh viện" },
  { key: "pharmacy",  label: "Nhà thuốc" },
  { key: "clinic",    label: "Phòng khám" },
] as const;

type FilterKey = (typeof FILTER_TABS)[number]["key"];

function matchesFilter(c: Customer, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "hospital") return c.type.toLowerCase().includes("bệnh viện");
  if (filter === "pharmacy") return c.type.toLowerCase().includes("nhà thuốc") || c.type.toLowerCase().includes("chuỗi nhà thuốc");
  if (filter === "clinic") return c.type.toLowerCase().includes("phòng khám");
  return true;
}

// ─── KPI card ─────────────────────────────────────────────────
function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardBody className="p-5">
        <p className="text-xs text-[#6B7A73] font-medium">{label}</p>
        <p className="text-2xl font-bold text-[#10231C] mt-1">{value}</p>
        {sub && <p className="text-xs text-[#6B7A73] mt-0.5">{sub}</p>}
      </CardBody>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function SupplierCustomersPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const totalCredit = CUSTOMERS.reduce((s, c) => s + c.creditLimit, 0);
  const totalUsed   = CUSTOMERS.reduce((s, c) => s + c.usedCredit, 0);
  const activeCount = CUSTOMERS.filter((c) => c.status === "active").length;

  const filtered = CUSTOMERS.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase());
    return matchSearch && matchesFilter(c, activeFilter);
  });

  return (
    <div>
      <PageHeader
        title="Quản lý Khách hàng"
        subtitle="Danh sách bệnh viện, nhà thuốc và đối tác"
        actions={
          <Button variant="bordered" onClick={() => {}}>
            + Thêm khách hàng
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Tổng khách hàng" value="10" />
        <KpiCard label="Đang hoạt động" value={String(activeCount)} />
        <KpiCard label="Tổng hạn mức" value="20 tỷ ₫" sub={fmtVND(totalCredit)} />
        <KpiCard label="Công nợ đang dư" value="7.1 tỷ ₫" sub={fmtVND(totalUsed)} />
      </div>

      {/* Search + filter tabs */}
      <Card className="mb-4">
        <CardBody className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Input
            placeholder="Tìm kiếm khách hàng, mã, loại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-xs"
            aria-label="Tìm kiếm khách hàng"
            startContent={
              <svg className="w-4 h-4 text-[#6B7A73]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            }
          />
          <div className="flex gap-1 flex-wrap">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === tab.key
                    ? "bg-[#024430] text-white"
                    : "text-[#6B7A73] hover:text-[#10231C] hover:bg-[#F6F8F7]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Khách hàng", "Loại", "Phân hạng", "HĐ", "Tổng đơn", "Hạn mức", "% Sử dụng", "Trạng thái", ""].map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-xs font-semibold text-[#6B7A73] bg-[#F6F8F7] whitespace-nowrap border-b border-[#E4EAE7]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-[#6B7A73]">
                    Không tìm thấy khách hàng phù hợp
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={`border-t border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors ${c.status === "suspended" ? "bg-red-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#10231C] text-sm">{c.name}</p>
                    <p className="text-xs text-[#6B7A73]">{c.id} · {c.city}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7A73] whitespace-nowrap">{c.type}</td>
                  <td className="px-4 py-3">
                    <RankBadge rank={c.rank} />
                  </td>
                  <td className="px-4 py-3 text-sm text-[#10231C] text-center">{c.activeContracts}</td>
                  <td className="px-4 py-3 text-sm text-[#10231C] text-center">{c.totalOrders}</td>
                  <td className="px-4 py-3 text-sm text-[#10231C] whitespace-nowrap">{fmtVND(c.creditLimit)}</td>
                  <td className="px-4 py-3">
                    <UsagePct used={c.usedCredit} limit={c.creditLimit} />
                  </td>
                  <td className="px-4 py-3">
                    {c.status === "active" ? (
                      <span className="inline-flex items-center rounded-full text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700">Hoạt động</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-700">Tạm dừng</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/supplier/customers/${c.id}`}>
                      <span className="text-[#024430] hover:text-[#056246] font-semibold text-sm cursor-pointer">→</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
