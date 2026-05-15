"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { fmtVND, fmtDate } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@/components/ui";
import Link from "next/link";

const ACCENT = "#1D4ED8";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  not_invoiced:    "Chưa xuất HĐ",
  invoiced:        "Đã xuất HĐ",
  partially_paid:  "TT một phần",
  paid:            "Đã thanh toán",
  overdue:         "Quá hạn",
};

const PAYMENT_STATUS_COLORS: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  not_invoiced:   "default",
  invoiced:       "primary",
  partially_paid: "warning",
  paid:           "success",
  overdue:        "danger",
};

export default function CustomerPaymentsPage() {
  const { state } = useApp();

  const payments = state.payments;

  const totalInvoice     = payments.reduce((s, p) => s + p.invoiceAmount, 0);
  const totalPaid        = payments.reduce((s, p) => s + p.paidAmount, 0);
  const totalOutstanding = payments.reduce((s, p) => s + p.outstandingAmount, 0);
  const totalOverdue     = payments.filter((p) => p.status === "overdue").reduce((s, p) => s + p.outstandingAmount, 0);

  return (
    <div>
      <PageHeader
        title="Công nợ"
        subtitle="Theo dõi tình hình thanh toán và công nợ"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng công nợ",       value: fmtVND(totalInvoice),     icon: "📋", color: "text-[#10231C]",  bg: "bg-white",      border: "border-[#E4EAE7]"  },
          { label: "Đã thanh toán",       value: fmtVND(totalPaid),        icon: "✅", color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200"   },
          { label: "Chưa thanh toán",     value: fmtVND(totalOutstanding), icon: "⏳", color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200"  },
          { label: "Quá hạn",             value: fmtVND(totalOverdue),     icon: "⚠️", color: totalOverdue > 0 ? "text-red-700" : "text-green-700", bg: totalOverdue > 0 ? "bg-red-50" : "bg-green-50", border: totalOverdue > 0 ? "border-red-200" : "border-green-200" },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-2xl border p-5 text-center ${kpi.bg} ${kpi.border}`}>
            <p className="text-xl mb-1">{kpi.icon}</p>
            <p className={`text-base font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <p className="text-sm" style={{ color: ACCENT }}>
          Sau khi chuyển khoản, vui lòng liên hệ bộ phận tài chính để xác nhận thanh toán.
          Hotline: <strong>0901 234 567</strong>.
        </p>
      </div>

      {payments.length === 0 ? (
        <Card className="border border-[#E4EAE7]">
          <CardBody className="p-10 text-center">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-[#10231C] font-semibold">Chưa có hóa đơn nào</p>
            <p className="text-sm text-[#6B7A73] mt-1">
              Xác nhận nghiệm thu đơn hàng để tạo hóa đơn thanh toán.
            </p>
            <Link href="/customer/orders">
              <span className="inline-flex items-center mt-4 px-6 py-2.5 text-white font-bold rounded-xl cursor-pointer hover:opacity-90"
                style={{ backgroundColor: ACCENT }}>
                Xem đơn hàng
              </span>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <Card className="border border-[#E4EAE7]">
          <CardBody className="p-0">
            <Table aria-label="Công nợ khách hàng">
              <TableHeader>
                <TableColumn>Hóa đơn</TableColumn>
                <TableColumn>Đơn hàng</TableColumn>
                <TableColumn>Giá trị</TableColumn>
                <TableColumn>Đã TT</TableColumn>
                <TableColumn>Còn lại</TableColumn>
                <TableColumn>Hạn TT</TableColumn>
                <TableColumn>Trạng thái</TableColumn>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  const isOverdue = p.status === "overdue";
                  return (
                    <TableRow key={p.id} className={isOverdue ? "bg-red-50/50" : ""}>
                      <TableCell>
                        <p className="font-semibold text-[#10231C] text-sm">{p.invoiceNo}</p>
                        <p className="text-xs text-[#6B7A73] mt-0.5">Xuất: {fmtDate(p.invoiceDate)}</p>
                      </TableCell>
                      <TableCell>
                        <Link href={`/customer/orders/${p.orderId}`}>
                          <span className="text-xs font-mono font-bold hover:underline cursor-pointer" style={{ color: ACCENT }}>
                            {p.orderId}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{fmtVND(p.invoiceAmount)}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-700">{fmtVND(p.paidAmount)}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${p.outstandingAmount > 0 ? "text-orange-700" : "text-green-700"}`}>
                          {fmtVND(p.outstandingAmount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className={`text-sm ${isOverdue ? "text-red-600 font-semibold" : "text-[#6B7A73]"}`}>
                          {fmtDate(p.dueDate)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Chip color={PAYMENT_STATUS_COLORS[p.status] ?? "default"} variant="flat" size="sm">
                          {PAYMENT_STATUS_LABELS[p.status] ?? p.status}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
