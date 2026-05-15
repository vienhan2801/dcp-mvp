"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { fmtDateTime } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Chip } from "@/components/ui";
import { EVIDENCE_ACTION_LABELS, ROLE_LABELS } from "@/lib/constants";
import { EvidenceActionType } from "@/domain/models/evidence";

const ACTION_ICON_COLORS: Record<EvidenceActionType, string> = {
  order_created: "bg-blue-100 text-blue-700",
  order_confirmed: "bg-[#024430]/10 text-[#024430]",
  order_partially_confirmed: "bg-amber-100 text-amber-700",
  delivery_updated: "bg-purple-100 text-purple-700",
  receipt_confirmed: "bg-emerald-100 text-emerald-700",
  issue_reported: "bg-red-100 text-red-700",
  payment_updated: "bg-indigo-100 text-indigo-700",
  message_sent: "bg-gray-100 text-gray-700",
};

const ACTION_ICONS: Record<EvidenceActionType, string> = {
  order_created: "📋",
  order_confirmed: "✅",
  order_partially_confirmed: "⚠️",
  delivery_updated: "🚚",
  receipt_confirmed: "🏥",
  issue_reported: "🚨",
  payment_updated: "💰",
  message_sent: "💬",
};

export default function SupplierEvidenceLogPage() {
  const { state } = useApp();
  const { evidenceLogs } = state;
  const [filterOrderId, setFilterOrderId] = useState<string>("all");

  const orderIds = Array.from(new Set(evidenceLogs.map((l) => l.orderId).filter(Boolean))) as string[];

  const filtered = filterOrderId === "all"
    ? evidenceLogs
    : evidenceLogs.filter((l) => l.orderId === filterOrderId);

  return (
    <div>
      <PageHeader
        title="Nhật ký hoạt động"
        subtitle="Toàn bộ sự kiện được ghi nhận trong hệ thống"
      />

      {/* Read-only audit trail notice */}
      <div className="mb-6 p-3 rounded-xl border border-[#E4EAE7] bg-[#F6F8F7] flex items-start gap-2 text-sm text-[#6B7A73]">
        <span className="flex-shrink-0">📋</span>
        <span>
          Nhật ký hoạt động — Tự động ghi nhận mọi thao tác trong hệ thống · Tải lên bằng chứng được thực hiện tại các trang tương ứng (Thanh toán, Giao hàng, Đơn hàng)
        </span>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm text-[#6B7A73] font-medium whitespace-nowrap">Lọc theo đơn hàng:</label>
        <select
          value={filterOrderId}
          onChange={(e) => setFilterOrderId(e.target.value)}
          className="border border-[#E4EAE7] rounded-xl bg-[#F6F8F7] px-3 h-10 text-sm text-[#10231C] outline-none focus:border-[#024430]"
        >
          <option value="all">Tất cả đơn hàng</option>
          {orderIds.map((oid) => (
            <option key={oid} value={oid}>{oid}</option>
          ))}
        </select>
        <span className="text-xs text-[#6B7A73]">{filtered.length} sự kiện</span>
      </div>

      <Card className="border border-[#E4EAE7]">
        <CardBody className="p-5">
          {filtered.length === 0 ? (
            <p className="text-sm text-[#6B7A73] text-center py-8">Không có nhật ký nào</p>
          ) : (
            <div className="flex flex-col">
              {filtered.map((log, idx) => (
                <div key={log.id} className="flex gap-4">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${ACTION_ICON_COLORS[log.actionType]}`}>
                      {ACTION_ICONS[log.actionType]}
                    </div>
                    {idx < filtered.length - 1 && (
                      <div className="w-0.5 flex-1 bg-[#E4EAE7] my-1 min-h-[20px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Chip color="default" variant="flat" size="sm">
                        {EVIDENCE_ACTION_LABELS[log.actionType]}
                      </Chip>
                      {log.orderId && (
                        <Chip color="primary" variant="flat" size="sm">
                          {log.orderId}
                        </Chip>
                      )}
                      <span className="text-xs text-[#6B7A73]">{fmtDateTime(log.createdAt)}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#10231C]">{log.title}</p>
                    <p className="text-xs text-[#6B7A73] mt-0.5 leading-relaxed">{log.description}</p>
                    <p className="text-xs text-[#6B7A73] mt-1">
                      <span className="font-medium">{log.actorName}</span>
                      <span className="mx-1">·</span>
                      <span>{ROLE_LABELS[log.actorRole]}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
