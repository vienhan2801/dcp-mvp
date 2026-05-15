"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { fmtVND, fmtDate, fmtNum } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import {
  Card, CardBody, Chip,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
} from "@/components/ui";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { OrderStatus } from "@/domain/models/order";
import Link from "next/link";

type FilterTab = "all" | "pending_confirmation" | "in_transit" | "done";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending_confirmation", label: "Chờ xác nhận" },
  { key: "in_transit", label: "Đang giao" },
  { key: "done", label: "Hoàn thành" },
];

const IN_TRANSIT_STATUSES: OrderStatus[] = ["confirmed", "preparing", "shipping", "delivered"];
const DONE_STATUSES: OrderStatus[] = ["received_confirmed"];

export default function SupplierOrdersPage() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const sortedOrders = [...state.orders].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );

  const filtered = sortedOrders.filter((o) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending_confirmation") return o.status === "pending_confirmation" || o.status === "partially_confirmed";
    if (activeTab === "in_transit") return IN_TRANSIT_STATUSES.includes(o.status);
    if (activeTab === "done") return DONE_STATUSES.includes(o.status);
    return true;
  });

  const pendingCount = state.orders.filter((o) => o.status === "pending_confirmation").length;

  return (
    <div>
      <PageHeader
        title="Quản lý đơn hàng"
        subtitle="Tất cả đơn hàng từ bệnh viện"
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-[#024430] text-white"
                : "bg-white border border-[#E4EAE7] text-[#6B7A73] hover:bg-[#F6F8F7]"
            }`}
          >
            {tab.label}
            {tab.key === "pending_confirmation" && pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <Card>
        <CardBody className="p-0">
          <Table aria-label="Danh sách đơn hàng">
            <TableHeader>
              <TableColumn>Mã đơn</TableColumn>
              <TableColumn>Ngày đặt</TableColumn>
              <TableColumn>Bệnh viện</TableColumn>
              <TableColumn>Số dòng</TableColumn>
              <TableColumn>Giá trị YC</TableColumn>
              <TableColumn>Giá trị XN</TableColumn>
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
                  const isUrgent = order.status === "pending_confirmation";
                  return (
                    <TableRow key={order.id} className={isUrgent ? "bg-amber-50/50" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#10231C]">{order.id}</span>
                          {isUrgent && (
                            <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded-full font-semibold">
                              Khẩn
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{fmtDate(order.orderDate)}</TableCell>
                      <TableCell>
                        <p className="text-sm text-[#10231C]">{order.hospitalName}</p>
                        <p className="text-xs text-[#6B7A73]">Giao: {fmtDate(order.requestedDeliveryDate)}</p>
                      </TableCell>
                      <TableCell>{fmtNum(order.lines.length)} dòng</TableCell>
                      <TableCell className="font-medium">{fmtVND(order.totalRequestedAmount)}</TableCell>
                      <TableCell>
                        {order.totalConfirmedAmount > 0 ? (
                          <span className="font-semibold text-[#024430]">{fmtVND(order.totalConfirmedAmount)}</span>
                        ) : (
                          <span className="text-[#6B7A73]">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip color={ORDER_STATUS_COLORS[order.status]} variant="flat" size="sm">
                          {ORDER_STATUS_LABELS[order.status]}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Link href={`/supplier/orders/${order.id}`}>
                          <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#024430] rounded-lg cursor-pointer hover:bg-[#056246] transition-colors">
                            {order.status === "pending_confirmation" || order.status === "partially_confirmed"
                              ? "Xác nhận"
                              : "Xem chi tiết"}
                          </span>
                        </Link>
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
