"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Card, CardBody, CardHeader,
  Chip,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button,
} from "@/components/ui";
import { BarChart } from "@/components/Charts";
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";

// ── Types ────────────────────────────────────────────────────
type InvoiceStatus = "unpaid" | "due" | "paid";

interface Invoice {
  id: string;
  npp: string;
  orderId: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
}

// ── Mock Data ────────────────────────────────────────────────
const INVOICES: Invoice[] = [
  {
    id: "INV-2026-0118",
    npp: "NPP PhytoPharma",
    orderId: "PO-2026-001",
    amount: 38_400_000,
    issueDate: "2026-05-01",
    dueDate: "2026-05-20",
    status: "unpaid",
  },
  {
    id: "INV-2026-0117",
    npp: "NPP MedDistrib Co.",
    orderId: "PO-2026-002",
    amount: 51_750_000,
    issueDate: "2026-04-28",
    dueDate: "2026-05-15",
    status: "due",
  },
  {
    id: "INV-2026-0115",
    npp: "NPP PhytoPharma",
    orderId: "PO-2026-003",
    amount: 42_400_000,
    issueDate: "2026-04-20",
    dueDate: "2026-05-10",
    status: "due",
  },
  {
    id: "INV-2026-0110",
    npp: "NPP MedDistrib Co.",
    orderId: "PO-2026-011",
    amount: 310_000_000,
    issueDate: "2026-04-10",
    dueDate: "2026-04-30",
    status: "paid",
  },
  {
    id: "INV-2026-0108",
    npp: "NPP PhytoPharma",
    orderId: "PO-2026-009",
    amount: 1_200_000_000,
    issueDate: "2026-04-05",
    dueDate: "2026-04-25",
    status: "paid",
  },
];

const STATUS_CFG: Record<InvoiceStatus, { label: string; color: "warning" | "danger" | "success" }> = {
  unpaid: { label: "Chưa TT",  color: "warning" },
  due:    { label: "Đến hạn",  color: "danger"  },
  paid:   { label: "Đã TT",    color: "success" },
};

type FilterTab = "all" | InvoiceStatus;
const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",    label: "Tất cả" },
  { key: "unpaid", label: "Chưa thanh toán" },
  { key: "due",    label: "Đến hạn" },
  { key: "paid",   label: "Đã thanh toán" },
];

// Monthly revenue T12/2025 → T5/2026
const MONTHLY_REVENUE = [
  { label: "T12",  value: 1_120_000_000 },
  { label: "T1",   value: 980_000_000  },
  { label: "T2",   value: 1_340_000_000 },
  { label: "T3",   value: 1_580_000_000 },
  { label: "T4",   value: 1_510_000_000 },
  { label: "T5",   value: 890_000_000  },
];

function fmt(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} tỷ ₫`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(0)}M ₫`;
  return `${n.toLocaleString("vi-VN")} ₫`;
}

export default function ManufacturerReceivablesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = INVOICES.filter((inv) => activeTab === "all" || inv.status === activeTab);

  return (
    <div>
      <PageHeader
        title="Công nợ phải thu"
        subtitle="Theo dõi thanh toán từ NPP"
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#6B7A73] font-medium mb-1">Tổng phải thu</p>
                <p className="text-2xl font-bold text-[#10231C]">890M ₫</p>
                <p className="text-xs text-[#6B7A73] mt-1">3 hóa đơn mở</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#6D28D9]/10 flex items-center justify-center text-[#6D28D9]">
                <TrendingUp size={18} />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#6B7A73] font-medium mb-1">Đến hạn trong 7 ngày</p>
                <p className="text-2xl font-bold text-amber-600">270M ₫</p>
                <p className="text-xs text-[#6B7A73] mt-1">2 hóa đơn</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock size={18} />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#6B7A73] font-medium mb-1">Quá hạn</p>
                <p className="text-2xl font-bold text-red-600">0 ₫</p>
                <p className="text-xs text-[#6B7A73] mt-1">Không có</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                <AlertCircle size={18} />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#6B7A73] font-medium mb-1">Đã thu tháng này</p>
                <p className="text-2xl font-bold text-emerald-700">1,51 tỷ ₫</p>
                <p className="text-xs text-emerald-600 mt-1">+12% so với T4</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-[#6D28D9] text-white"
                : "bg-white border border-[#E4EAE7] text-[#6B7A73] hover:bg-[#F6F8F7]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <Card className="mb-6">
        <Table aria-label="Bảng công nợ phải thu">
          <TableHeader>
            <TableColumn>Mã hóa đơn</TableColumn>
            <TableColumn>NPP</TableColumn>
            <TableColumn>Đơn hàng gốc</TableColumn>
            <TableColumn>Giá trị</TableColumn>
            <TableColumn>Ngày xuất HĐ</TableColumn>
            <TableColumn>Hạn TT</TableColumn>
            <TableColumn>Trạng thái</TableColumn>
            <TableColumn>Hành động</TableColumn>
          </TableHeader>
          <TableBody>
            {filtered.map((inv) => {
              const sc = STATUS_CFG[inv.status];
              return (
                <TableRow key={inv.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-semibold text-[#6D28D9]">{inv.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-[#10231C]">{inv.npp}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-[#6B7A73]">{inv.orderId}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-[#10231C]">{fmt(inv.amount)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-[#6B7A73]">{inv.issueDate}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium ${inv.status === "due" ? "text-red-600" : "text-[#6B7A73]"}`}>
                      {inv.dueDate}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Chip color={sc.color} variant="flat" size="sm">{sc.label}</Chip>
                  </TableCell>
                  <TableCell>
                    {inv.status !== "paid" ? (
                      <Button size="sm" variant="bordered" onClick={() => {}}>
                        Ghi nhận TT
                      </Button>
                    ) : (
                      <span className="text-xs text-[#6B7A73]">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader className="pb-2">
          <h3 className="font-semibold text-[#10231C]">Doanh thu thu về theo tháng (T12/2025 – T5/2026)</h3>
          <p className="text-xs text-[#6B7A73] mt-0.5">Giá trị hóa đơn đã thanh toán</p>
        </CardHeader>
        <CardBody className="pt-2">
          <BarChart
            data={MONTHLY_REVENUE}
            color="#6D28D9"
            height={160}
            formatValue={(v) => v >= 1e9 ? `${(v / 1e9).toFixed(2)}B` : `${(v / 1e6).toFixed(0)}M`}
          />
        </CardBody>
      </Card>
    </div>
  );
}
