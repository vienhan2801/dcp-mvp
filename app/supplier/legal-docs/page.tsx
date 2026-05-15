"use client";
import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Chip, Button } from "@/components/ui";
import { fmtDate } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocType = "sdk" | "cocq" | "gmp" | "gsp" | "gdp";
type DocStatus = "valid" | "expiring" | "expired";

interface LegalDoc {
  id: string;
  docType: DocType;
  docNo: string;
  subject: string;      // drug name or scope
  issuingBody: string;
  issuedDate: string;
  expiryDate: string;
  status: DocStatus;
}

// ─── Reference date ────────────────────────────────────────────────────────────

const TODAY = new Date("2026-05-15");

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  return Math.round((d.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const DOCS: LegalDoc[] = [
  {
    id: "D001",
    docType: "sdk",
    docNo: "VN-18698-14",
    subject: "Paracetamol 500mg (Viên nén)",
    issuingBody: "Cục Quản lý Dược",
    issuedDate: "2014-06-01",
    expiryDate: "2029-06-01",
    status: "valid",
  },
  {
    id: "D002",
    docType: "sdk",
    docNo: "VN-22341-19",
    subject: "Amoxicillin 500mg (Viên nang)",
    issuingBody: "Cục Quản lý Dược",
    issuedDate: "2019-03-15",
    expiryDate: "2026-06-20",
    status: "expiring",
  },
  {
    id: "D003",
    docType: "sdk",
    docNo: "VN-25812-22",
    subject: "Ceftriaxone 1g (Bột pha tiêm)",
    issuingBody: "Cục Quản lý Dược",
    issuedDate: "2022-08-10",
    expiryDate: "2027-08-10",
    status: "valid",
  },
  {
    id: "D004",
    docType: "sdk",
    docNo: "VN-16203-11",
    subject: "Omeprazole 20mg (Viên nang)",
    issuingBody: "Cục Quản lý Dược",
    issuedDate: "2011-11-20",
    expiryDate: "2026-04-30",
    status: "expired",
  },
  {
    id: "D005",
    docType: "cocq",
    docNo: "CO-2024-PP-DE-001",
    subject: "Paracetamol 500mg — Xuất khẩu sang Đức",
    issuingBody: "Phòng Thương mại & Công nghiệp VN",
    issuedDate: "2024-01-10",
    expiryDate: "2026-01-10",
    status: "expired",
  },
  {
    id: "D006",
    docType: "cocq",
    docNo: "CQ-2025-PP-TH-003",
    subject: "Amoxicillin 500mg — Xuất khẩu sang Thái Lan",
    issuingBody: "Bộ Y tế",
    issuedDate: "2025-03-01",
    expiryDate: "2027-03-01",
    status: "valid",
  },
  {
    id: "D007",
    docType: "gmp",
    docNo: "GMP-WHO-2023-PP-01",
    subject: "Nhà máy sản xuất PhytoPharma — Toàn bộ dây chuyền",
    issuingBody: "WHO / Cục Quản lý Dược",
    issuedDate: "2023-07-01",
    expiryDate: "2026-07-01",
    status: "expiring",
  },
  {
    id: "D008",
    docType: "gsp",
    docNo: "GSP-2024-KBPP-01",
    subject: "Kho bảo quản PhytoPharma — Hà Nội",
    issuingBody: "Cục Quản lý Dược",
    issuedDate: "2024-02-15",
    expiryDate: "2027-02-15",
    status: "valid",
  },
  {
    id: "D009",
    docType: "gdp",
    docNo: "GDP-2024-PPDN-02",
    subject: "Phân phối dược phẩm — Miền Nam",
    issuingBody: "Sở Y tế TP.HCM",
    issuedDate: "2024-05-20",
    expiryDate: "2026-05-25",
    status: "expiring",
  },
  {
    id: "D010",
    docType: "gmp",
    docNo: "GMP-EU-2022-PP-02",
    subject: "Nhà máy sản xuất PhytoPharma — EU GMP Certificate",
    issuingBody: "EMA / Cơ quan dược châu Âu",
    issuedDate: "2022-09-01",
    expiryDate: "2025-09-01",
    status: "expired",
  },
];

// ─── Doc type meta ────────────────────────────────────────────────────────────

interface DocTypeMeta {
  label: string;
  fullLabel: string;
  bg: string;
  text: string;
}

function getDocTypeMeta(type: DocType): DocTypeMeta {
  switch (type) {
    case "sdk":
      return { label: "SĐK", fullLabel: "Số đăng ký",   bg: "bg-blue-100",   text: "text-blue-700" };
    case "cocq":
      return { label: "CO/CQ", fullLabel: "CO / CQ",     bg: "bg-teal-100",   text: "text-teal-700" };
    case "gmp":
      return { label: "GMP",  fullLabel: "GMP",           bg: "bg-purple-100", text: "text-purple-700" };
    case "gsp":
      return { label: "GSP",  fullLabel: "GSP",           bg: "bg-orange-100", text: "text-orange-700" };
    case "gdp":
      return { label: "GDP",  fullLabel: "GDP",           bg: "bg-indigo-100", text: "text-indigo-700" };
  }
}

function getStatusMeta(status: DocStatus): { label: string; color: "success" | "warning" | "danger" } {
  switch (status) {
    case "valid":    return { label: "Còn hiệu lực", color: "success" };
    case "expiring": return { label: "Sắp hết hạn",  color: "warning" };
    case "expired":  return { label: "Đã hết hạn",   color: "danger" };
  }
}

function daysTextColor(days: number): string {
  if (days <= 0)  return "text-red-600 font-bold";
  if (days < 30)  return "text-red-600 font-semibold";
  if (days < 90)  return "text-amber-600 font-semibold";
  return "text-green-700";
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterTab = "all" | DocType | "warning";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",     label: "Tất cả" },
  { key: "sdk",     label: "SĐK" },
  { key: "cocq",    label: "CO/CQ" },
  { key: "gmp",     label: "GMP/GSP/GDP" },
  { key: "warning", label: "Cảnh báo" },
];

// ─── Alert banners ────────────────────────────────────────────────────────────

function AlertBanners({ docs }: { docs: LegalDoc[] }) {
  const expired = docs.filter((d) => d.status === "expired");
  const expiring = docs.filter((d) => d.status === "expiring");

  return (
    <div className="flex flex-col gap-3 mb-6">
      {expired.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-700">
              {expired.length} tài liệu đã hết hạn — Cần gia hạn ngay
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {expired.map((d) => `${d.docNo} (${getDocTypeMeta(d.docType).label})`).join(" · ")}
            </p>
          </div>
        </div>
      )}
      {expiring.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-700">
              {expiring.length} tài liệu sắp hết hạn trong 90 ngày tới
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {expiring.map((d) => `${d.docNo} (${getDocTypeMeta(d.docType).label})`).join(" · ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LegalDocsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return DOCS;
    if (activeTab === "warning") return DOCS.filter((d) => d.status === "expired" || d.status === "expiring");
    if (activeTab === "gmp") return DOCS.filter((d) => d.docType === "gmp" || d.docType === "gsp" || d.docType === "gdp");
    return DOCS.filter((d) => d.docType === activeTab);
  }, [activeTab]);

  // KPI
  const totalDocs = DOCS.length;
  const validDocs = DOCS.filter((d) => d.status === "valid").length;
  const alertDocs = DOCS.filter((d) => d.status !== "valid").length;

  return (
    <div className="min-h-screen bg-[#F6F8F7]">
      <PageHeader
        title="Hồ sơ pháp lý"
        subtitle="Quản lý SĐK, CO, CQ, GMP, GSP, GDP và theo dõi hiệu lực"
        actions={
          <Button color="primary" size="sm">
            + Thêm tài liệu
          </Button>
        }
      />

      {/* Alert banners */}
      <AlertBanners docs={DOCS} />

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Tổng tài liệu",
            value: `${totalDocs}`,
            sub: "hồ sơ pháp lý",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
          },
          {
            label: "Còn hiệu lực",
            value: `${validDocs}`,
            sub: "tài liệu hợp lệ",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: "Hết hạn / Sắp hết hạn",
            value: `${alertDocs}`,
            sub: "cần xử lý",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ),
          },
        ].map((k, i) => (
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

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white border border-[#E4EAE7] rounded-xl p-1 mb-4 w-fit flex-wrap">
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

      {/* Documents table */}
      <div className="bg-white rounded-xl border border-[#E4EAE7] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead className="bg-[#F6F8F7] border-b border-[#E4EAE7]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Loại</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Số hiệu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Thuốc / Phạm vi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7A73]">Cơ quan cấp</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Ngày cấp</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Ngày hết hạn</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Ngày còn lại</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7A73]">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#6B7A73]">
                    Không có tài liệu nào phù hợp.
                  </td>
                </tr>
              )}
              {filtered.map((doc) => {
                const days = daysUntil(doc.expiryDate);
                const typeMeta = getDocTypeMeta(doc.docType);
                const statusMeta = getStatusMeta(doc.status);
                return (
                  <tr
                    key={doc.id}
                    className={`border-t border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors ${
                      doc.status === "expired" ? "bg-red-50/40" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${typeMeta.bg} ${typeMeta.text}`}>
                        {typeMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#10231C]">{doc.docNo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#10231C] text-sm max-w-xs">{doc.subject}</p>
                    </td>
                    <td className="px-4 py-3 text-[#6B7A73] text-xs">{doc.issuingBody}</td>
                    <td className="px-4 py-3 text-center text-xs text-[#6B7A73]">{fmtDate(doc.issuedDate)}</td>
                    <td className="px-4 py-3 text-center text-xs text-[#10231C]">{fmtDate(doc.expiryDate)}</td>
                    <td className={`px-4 py-3 text-center text-sm ${daysTextColor(days)}`}>
                      {days > 0 ? `${days} ngày` : `Hết hạn ${Math.abs(days)} ngày trước`}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Chip color={statusMeta.color} variant="flat" size="sm">
                        {statusMeta.label}
                      </Chip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-[#E4EAE7] bg-[#F6F8F7] text-xs text-[#6B7A73] flex items-center justify-between">
          <span>
            Hiển thị <strong className="text-[#10231C]">{filtered.length}</strong> / {DOCS.length} tài liệu
          </span>
          {activeTab === "warning" && (
            <span className="text-amber-600 font-medium">
              Chế độ xem cảnh báo — {filtered.length} tài liệu cần xử lý
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
