"use client";
import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Card,
  CardBody,
  Chip,
  Button,
} from "@/components/ui";
import { fmtVND, fmtDate } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

type TenderStatus = "active" | "normalized" | "pending" | "expired";

interface Tender {
  id: string;
  code: string;
  name: string;
  openingUnit: string;
  year: number;
  value: number;
  status: TenderStatus;
  endDate: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const TENDERS: Tender[] = [
  {
    id: "T001",
    code: "GT-BV-HCM-2024-001",
    name: "Gói thầu cung cấp thuốc kháng sinh nhóm Beta-lactam",
    openingUnit: "BV Chợ Rẫy",
    year: 2024,
    value: 820_000_000,
    status: "active",
    endDate: "2026-12-31",
  },
  {
    id: "T002",
    code: "GT-BV-HN-2024-018",
    name: "Gói thầu cung cấp thuốc tim mạch và huyết áp",
    openingUnit: "BV Bạch Mai",
    year: 2024,
    value: 650_000_000,
    status: "normalized",
    endDate: "2026-09-30",
  },
  {
    id: "T003",
    code: "GT-SO-CT-2025-003",
    name: "Gói thầu cung cấp thuốc thiết yếu tuyến huyện",
    openingUnit: "Sở Y tế Cần Thơ",
    year: 2025,
    value: 1_200_000_000,
    status: "active",
    endDate: "2027-06-30",
  },
  {
    id: "T004",
    code: "GT-BV-DN-2023-007",
    name: "Gói thầu vắc-xin và sinh phẩm y tế",
    openingUnit: "BV Đà Nẵng",
    year: 2023,
    value: 430_000_000,
    status: "expired",
    endDate: "2025-12-31",
  },
  {
    id: "T005",
    code: "GT-BV-BD-2025-012",
    name: "Gói thầu cung cấp thuốc tiêu hóa và gan mật",
    openingUnit: "BV Bình Dương",
    year: 2025,
    value: 780_000_000,
    status: "pending",
    endDate: "2027-03-31",
  },
  {
    id: "T006",
    code: "GT-SO-AG-2025-005",
    name: "Gói thầu thuốc kháng viêm và giảm đau",
    openingUnit: "Sở Y tế An Giang",
    year: 2025,
    value: 340_000_000,
    status: "normalized",
    endDate: "2026-11-30",
  },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

interface StatusMeta {
  label: string;
  color: "success" | "primary" | "warning" | "default";
}

function getStatusMeta(status: TenderStatus): StatusMeta {
  switch (status) {
    case "active":     return { label: "Đang hiệu lực",   color: "success" };
    case "normalized": return { label: "Chuẩn hóa xong",  color: "primary" };
    case "pending":    return { label: "Chờ chuẩn hóa",   color: "warning" };
    case "expired":    return { label: "Hết hiệu lực",    color: "default" };
  }
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterTab = "all" | "active" | "normalized" | "expired";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",        label: "Tất cả" },
  { key: "active",     label: "Đang hiệu lực" },
  { key: "normalized", label: "Chuẩn hóa xong" },
  { key: "expired",    label: "Hết hiệu lực" },
];

// ─── KPI cards ────────────────────────────────────────────────────────────────

function KpiStrip({ tenders }: { tenders: Tender[] }) {
  const total = tenders.length;
  const totalValue = tenders.reduce((s, t) => s + t.value, 0);
  const active = tenders.filter((t) => t.status === "active").length;

  const kpis = [
    {
      label: "Tổng gói thầu",
      value: `${total}`,
      sub: "gói thầu đã trúng",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: "Tổng giá trị",
      value: `${(totalValue / 1e9).toFixed(2)} tỷ ₫`,
      sub: "giá trị các gói thầu",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Đang hiệu lực",
      value: `${active}`,
      sub: "gói thầu đang hoạt động",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {kpis.map((k) => (
        <Card key={k.label} className="bg-white border border-[#E4EAE7] shadow-sm">
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
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TenderLibraryPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return TENDERS;
    if (activeTab === "active") return TENDERS.filter((t) => t.status === "active");
    if (activeTab === "normalized") return TENDERS.filter((t) => t.status === "normalized");
    if (activeTab === "expired") return TENDERS.filter((t) => t.status === "expired");
    return TENDERS;
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#F6F8F7]">
      <PageHeader
        title="Thư viện Gói thầu"
        subtitle="Danh sách gói thầu trúng thầu và đang quản lý"
        actions={
          <Button color="primary" size="sm">
            + Thêm gói thầu
          </Button>
        }
      />

      <KpiStrip tenders={TENDERS} />

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

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E4EAE7] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead className="bg-[#F6F8F7] border-b border-[#E4EAE7]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Mã gói thầu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Tên gói thầu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Đơn vị mở thầu</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Năm</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7A73]">Giá trị</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#6B7A73]">
                    Không có gói thầu nào phù hợp.
                  </td>
                </tr>
              )}
              {filtered.map((tender) => {
                const meta = getStatusMeta(tender.status);
                return (
                  <tr key={tender.id} className="border-t border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#024430] bg-[#024430]/8 px-2 py-0.5 rounded">
                        {tender.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#10231C] max-w-xs">{tender.name}</p>
                      <p className="text-xs text-[#6B7A73] mt-0.5">Hết hạn: {fmtDate(tender.endDate)}</p>
                    </td>
                    <td className="px-4 py-3 text-[#6B7A73] text-sm">{tender.openingUnit}</td>
                    <td className="px-4 py-3 text-center text-[#10231C] font-medium">{tender.year}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#024430]">
                      {fmtVND(tender.value)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Chip color={meta.color} variant="flat" size="sm">
                        {meta.label}
                      </Chip>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <Button size="sm" variant="flat" className="text-xs h-7 px-2">
                          Xem chi tiết
                        </Button>
                        {tender.status === "pending" && (
                          <Button size="sm" color="primary" className="text-xs h-7 px-2">
                            Chuẩn hóa
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-[#E4EAE7] bg-[#F6F8F7] text-xs text-[#6B7A73] flex items-center justify-between">
          <span>
            Hiển thị <strong className="text-[#10231C]">{filtered.length}</strong> / {TENDERS.length} gói thầu
          </span>
          <span>
            Tổng giá trị lọc:{" "}
            <strong className="text-[#024430]">
              {fmtVND(filtered.reduce((s, t) => s + t.value, 0))}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
