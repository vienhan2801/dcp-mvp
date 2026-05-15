"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { fmtVND, fmtDate } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@/components/ui";
import Link from "next/link";

const ACCENT = "#1D4ED8";

type TabKey = "all" | "pending" | "shipping" | "done";

const TABS: { key: TabKey; label: string; statuses: string[] }[] = [
  { key: "all",      label: "Tất cả",         statuses: [] },
  { key: "pending",  label: "Chờ xác nhận",   statuses: ["pending_confirmation", "partially_confirmed"] },
  { key: "shipping", label: "Đang giao",       statuses: ["confirmed", "preparing", "shipping", "delivered"] },
  { key: "done",     label: "Hoàn thành",      statuses: ["received_confirmed"] },
];

const STATUS_LABELS: Record<string, string> = {
  pending_confirmation:  "Chờ xác nhận",
  partially_confirmed:   "XN một phần",
  confirmed:             "Đã xác nhận",
  preparing:             "Chuẩn bị",
  shipping:              "Đang giao",
  delivered:             "Đã giao",
  received_confirmed:    "Hoàn thành",
  cancelled:             "Đã hủy",
};

const STATUS_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  pending_confirmation: "warning",
  partially_confirmed:  "warning",
  confirmed:            "primary",
  preparing:            "primary",
  shipping:             "primary",
  delivered:            "success",
  received_confirmed:   "success",
  cancelled:            "danger",
};

export default function CustomerOrdersPage() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const orders = [...state.orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  const filtered = orders.filter((o) => {
    const tab = TABS.find((t) => t.key === activeTab);
    if (!tab || tab.statuses.length === 0) return true;
    return tab.statuses.includes(o.status);
  });

  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  return (
    <div>
      <PageHeader
        title="Đơn hàng"
        subtitle="Theo dõi tất cả đơn hàng của bạn"
        actions={
          <Link href="/customer/orders/new">
            <span className="inline-flex items-center px-4 py-2 text-white text-sm font-semibold rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: ACCENT }}>
              + Tạo đơn hàng mới
            </span>
          </Link>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? "text-white"
                : "bg-white border border-[#E4EAE7] text-[#6B7A73] hover:bg-[#F6F8F7]"
            }`}
            style={activeTab === tab.key ? { backgroundColor: ACCENT } : {}}>
            {tab.label}
            {tab.key === "shipping" && deliveredCount > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {deliveredCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <Card className="border border-[#E4EAE7]">
        <CardBody className="p-0">
          <Table aria-label="Đơn hàng khách hàng">
            <TableHeader>
              <TableColumn>Mã đơn</TableColumn>
              <TableColumn>Ngày đặt</TableColumn>
              <TableColumn>NPP</TableColumn>
              <TableColumn>Giá trị</TableColumn>
              <TableColumn>Trạng thái</TableColumn>
              <TableColumn>Thao tác</TableColumn>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-[#6B7A73] py-8">
                    Không có đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => {
                  const isDelivered = order.status === "delivered";
                  return (
                    <TableRow key={order.id} className={isDelivered ? "bg-emerald-50/50" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#10231C]">{order.id}</span>
                          {isDelivered && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-300 px-1.5 py-0.5 rounded-full font-semibold">
                              Cần nghiệm thu
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6B7A73] mt-0.5">Giao: {fmtDate(order.requestedDeliveryDate)}</p>
                      </TableCell>
                      <TableCell>{fmtDate(order.orderDate)}</TableCell>
                      <TableCell>
                        <p className="text-sm text-[#10231C]">{order.supplierName}</p>
                        <p className="text-xs text-[#6B7A73]">{order.lines.length} dòng thuốc</p>
                      </TableCell>
                      <TableCell className="font-medium">{fmtVND(order.totalRequestedAmount)}</TableCell>
                      <TableCell>
                        <Chip color={STATUS_COLORS[order.status] ?? "default"} variant="flat" size="sm">
                          {STATUS_LABELS[order.status] ?? order.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {isDelivered && (
                            <Link href={`/customer/orders/${order.id}`}>
                              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-lg cursor-pointer hover:opacity-90"
                                style={{ backgroundColor: ACCENT }}>
                                Nghiệm thu
                              </span>
                            </Link>
                          )}
                          <Link href={`/customer/orders/${order.id}`}>
                            <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#10231C] border border-[#E4EAE7] bg-white rounded-lg cursor-pointer hover:bg-[#F6F8F7]">
                              Chi tiết
                            </span>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
