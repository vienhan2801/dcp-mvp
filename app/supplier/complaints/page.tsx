"use client";
import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Button, Chip } from "@/components/ui";
import { AlertCircle, FileWarning, CheckCircle2 } from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────
type ComplaintStatus = "open" | "investigating" | "resolved";

interface Complaint {
  id: string;
  customer: string;
  orderId: string;
  drug: string;
  issue: string;
  quantity: string;
  reportedDate: string;
  status: ComplaintStatus;
}

const COMPLAINTS: Complaint[] = [
  {
    id: "CMP-001",
    customer: "BV Chợ Rẫy",
    orderId: "ORD-2026-001",
    drug: "Paracetamol 500mg",
    issue: "Thuốc bị ẩm, mốc",
    quantity: "500 viên",
    reportedDate: "2026-05-05",
    status: "resolved",
  },
  {
    id: "CMP-002",
    customer: "Nhà thuốc Phúc Khang",
    orderId: "ORD-2026-002",
    drug: "Amoxicillin",
    issue: "Thiếu số lô trên bao bì",
    quantity: "200 viên",
    reportedDate: "2026-05-10",
    status: "investigating",
  },
  {
    id: "CMP-003",
    customer: "BV Đại học Y Dược",
    orderId: "ORD-2026-003",
    drug: "Ceftriaxone 1g",
    issue: "Lọ bị vỡ khi nhận",
    quantity: "12 lọ",
    reportedDate: "2026-05-13",
    status: "open",
  },
  {
    id: "CMP-004",
    customer: "Nhà thuốc An Khang",
    orderId: "ORD-2026-004",
    drug: "Azithromycin",
    issue: "Hạn dùng còn 3 tháng",
    quantity: "300 viên",
    reportedDate: "2026-05-14",
    status: "open",
  },
];

// ─── Status Config ────────────────────────────────────────────
const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string; chipColor: "warning" | "primary" | "success" }> = {
  open:         { label: "Mới tiếp nhận", color: "text-orange-600",  chipColor: "warning" },
  investigating:{ label: "Đang xử lý",   color: "text-blue-600",    chipColor: "primary" },
  resolved:     { label: "Đã xử lý",     color: "text-green-700",   chipColor: "success" },
};

type FilterTab = "all" | "open" | "investigating" | "resolved";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all",          label: "Tất cả" },
  { key: "open",         label: "Mới" },
  { key: "investigating",label: "Đang xử lý" },
  { key: "resolved",     label: "Đã xử lý" },
];

export default function SupplierComplaintsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = activeTab === "all"
    ? COMPLAINTS
    : COMPLAINTS.filter((c) => c.status === activeTab);

  const totalOpen       = COMPLAINTS.filter((c) => c.status !== "resolved").length;
  const totalInvest     = COMPLAINTS.filter((c) => c.status === "investigating").length;
  const totalResolved   = COMPLAINTS.filter((c) => c.status === "resolved").length;

  return (
    <div>
      <PageHeader
        title="Khiếu nại & Trả hàng"
        subtitle="Quản lý sự cố chất lượng từ khách hàng"
      />

      {/* ─── KPI Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#024430]/10 flex items-center justify-center text-[#024430]">
              <FileWarning size={20} />
            </div>
            <div>
              <p className="text-xs text-[#6B7A73] font-medium">Tổng khiếu nại</p>
              <p className="text-2xl font-bold text-[#10231C]">{COMPLAINTS.length}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-[#6B7A73] font-medium">Đang xử lý</p>
              <p className="text-2xl font-bold text-[#10231C]">{totalOpen + totalInvest}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-700">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs text-[#6B7A73] font-medium">Đã giải quyết</p>
              <p className="text-2xl font-bold text-[#10231C]">{totalResolved}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ─── Filter Tabs ──────────────────────────────────────── */}
      <div className="flex gap-1 mb-4 bg-[#F6F8F7] border border-[#E4EAE7] rounded-xl p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-[#024430] text-white shadow-sm"
                : "text-[#6B7A73] hover:text-[#10231C] hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Table ───────────────────────────────────────────── */}
      <Card className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E4EAE7] bg-[#F6F8F7]">
                {["Mã KN", "Khách hàng", "Đơn hàng", "Sản phẩm", "Vấn đề", "SL", "Ngày báo", "Trạng thái", "Hành động"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7A73] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-[#6B7A73]">
                    Không có khiếu nại nào
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const cfg = STATUS_CONFIG[c.status];
                return (
                  <tr key={c.id} className="border-b border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#10231C] whitespace-nowrap">{c.id}</td>
                    <td className="px-4 py-3 text-[#10231C] whitespace-nowrap">{c.customer}</td>
                    <td className="px-4 py-3 text-[#6B7A73] whitespace-nowrap">{c.orderId}</td>
                    <td className="px-4 py-3 text-[#10231C]">{c.drug}</td>
                    <td className="px-4 py-3 text-[#6B7A73]">{c.issue}</td>
                    <td className="px-4 py-3 text-[#10231C] whitespace-nowrap">{c.quantity}</td>
                    <td className="px-4 py-3 text-[#6B7A73] whitespace-nowrap">{c.reportedDate}</td>
                    <td className="px-4 py-3">
                      <Chip color={cfg.chipColor} size="sm">{cfg.label}</Chip>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/supplier/complaints/${c.id}`}>
                        <Button
                          size="sm"
                          className="bg-[#024430] text-white whitespace-nowrap"
                          onClick={() => {}}
                        >
                          Xem chi tiết
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─── Summary Card ────────────────────────────────────── */}
      <Card className="border-green-200 bg-green-50">
        <CardBody className="p-5 flex items-center gap-3">
          <CheckCircle2 size={22} className="text-green-700 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Tỷ lệ giải quyết trong 48h: 85%</p>
            <p className="text-xs text-green-700 mt-0.5">
              Hiệu suất xử lý khiếu nại tốt — vượt mục tiêu 80%
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
