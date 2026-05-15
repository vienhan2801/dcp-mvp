"use client";
import { useState } from "react";
import { fmtVND } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@/components/ui";
import Link from "next/link";

const ACCENT = "#1D4ED8";

interface ReceiptItem {
  id: string;
  orderId: string;
  supplier: string;
  deliveryDate: string;
  items: string;
  value: number;
  status: "pending" | "confirmed";
}

const MOCK_RECEIPTS: ReceiptItem[] = [
  {
    id: "RCP-001",
    orderId: "ORD-2026-079",
    supplier: "MedPharma",
    deliveryDate: "12/05/2026",
    items: "Metformin 500mg × 200 hộp, Amlodipine 5mg × 100 hộp",
    value: 52_000_000,
    status: "pending",
  },
  {
    id: "RCP-002",
    orderId: "ORD-2026-081",
    supplier: "PhytoPharma",
    deliveryDate: "10/05/2026",
    items: "Paracetamol 500mg × 500 hộp, Ibuprofen 400mg × 200 hộp",
    value: 85_000_000,
    status: "pending",
  },
  {
    id: "RCP-003",
    orderId: "ORD-2026-075",
    supplier: "PhytoPharma",
    deliveryDate: "02/05/2026",
    items: "Amoxicillin 500mg × 300 hộp, Omeprazole 20mg × 200 hộp",
    value: 120_000_000,
    status: "confirmed",
  },
];

export default function CustomerReceiptsPage() {
  const [receipts, setReceipts] = useState(MOCK_RECEIPTS);
  const [confirming, setConfirming] = useState<string | null>(null);

  const pendingCount = receipts.filter((r) => r.status === "pending").length;

  function handleConfirm(id: string) {
    setConfirming(id);
    setTimeout(() => {
      setReceipts((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "confirmed" as const } : r))
      );
      setConfirming(null);
    }, 800);
  }

  return (
    <div>
      <PageHeader
        title="Nhận hàng"
        subtitle="Xác nhận nghiệm thu các đơn hàng đã được giao"
      />

      {/* Alert banner */}
      {pendingCount > 0 && (
        <div className="mb-4 p-4 rounded-xl border flex items-center gap-3"
          style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }}>
          <span className="text-lg">📦</span>
          <p className="text-sm font-medium" style={{ color: ACCENT }}>
            Có <strong>{pendingCount}</strong> lô hàng đang chờ xác nhận nghiệm thu
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Chờ nghiệm thu", value: receipts.filter((r) => r.status === "pending").length.toString(),   icon: "⏳", color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200" },
          { label: "Đã nghiệm thu",  value: receipts.filter((r) => r.status === "confirmed").length.toString(), icon: "✅", color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200"  },
          { label: "Tổng giá trị",   value: fmtVND(receipts.filter((r) => r.status === "pending").reduce((s, r) => s + r.value, 0)), icon: "💰", color: "text-[#10231C]", bg: "bg-white", border: "border-[#E4EAE7]" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 text-center ${s.bg} ${s.border}`}>
            <p className="text-xl mb-1">{s.icon}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <Card className="border border-[#E4EAE7]">
        <CardBody className="p-0">
          <Table aria-label="Danh sách nghiệm thu">
            <TableHeader>
              <TableColumn>Đơn hàng</TableColumn>
              <TableColumn>NPP</TableColumn>
              <TableColumn>Ngày giao</TableColumn>
              <TableColumn>Mặt hàng</TableColumn>
              <TableColumn>Giá trị</TableColumn>
              <TableColumn>Hành động</TableColumn>
            </TableHeader>
            <TableBody>
              {receipts.map((r) => (
                <TableRow key={r.id} className={r.status === "confirmed" ? "opacity-60" : ""}>
                  <TableCell>
                    <Link href={`/customer/orders/${r.orderId}`}>
                      <span className="font-mono text-xs font-bold hover:underline cursor-pointer" style={{ color: ACCENT }}>
                        {r.orderId}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-[#10231C] font-medium">{r.supplier}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-[#10231C]">{r.deliveryDate}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-[#6B7A73] max-w-[200px]">{r.items}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold text-[#10231C]">{fmtVND(r.value)}</p>
                  </TableCell>
                  <TableCell>
                    {r.status === "confirmed" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg">
                        ✓ Đã nghiệm thu
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={confirming === r.id}
                        onClick={() => handleConfirm(r.id)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-lg cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                        style={{ backgroundColor: ACCENT }}>
                        {confirming === r.id ? "Đang xử lý..." : "Nghiệm thu"}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {receipts.filter((r) => r.status === "pending").length === 0 && (
        <div className="text-center py-8 text-[#6B7A73]">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-semibold text-[#10231C]">Tất cả lô hàng đã được nghiệm thu</p>
          <p className="text-sm mt-1">Không còn lô hàng nào chờ xác nhận</p>
        </div>
      )}
    </div>
  );
}
