"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { fmtVND, fmtDate } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import FileUpload from "@/components/FileUpload";
import { Card, CardBody, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@/components/ui";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { OrderStatus } from "@/domain/models/order";
import Link from "next/link";

// ─── Receipt Upload Inline Expansion ─────────────────────
function ReceiptUploadPanel({ orderId, accentColor, onConfirmed }: { orderId: string; accentColor: string; onConfirmed: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="mt-3 p-4 bg-[#F6F8F7] border border-[#E4EAE7] rounded-xl flex flex-col gap-3">
      <FileUpload
        label="Biên bản nghiệm thu / nhập kho"
        hint="Biên bản ký xác nhận, ảnh hàng nhận được"
        accentColor={accentColor}
        maxFiles={3}
        onFilesChange={setFiles}
      />
      <div className="flex justify-end">
        <button
          type="button"
          disabled={files.length === 0}
          onClick={onConfirmed}
          className="px-4 py-2 text-sm font-semibold text-white rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Xác nhận đã nhận hàng
        </button>
      </div>
      <p className="text-xs text-[#6B7A73]">Mã đơn: {orderId}</p>
    </div>
  );
}

type FilterTab = "all" | "pending" | "confirmed" | "in_transit" | "done";

const FILTER_TABS: { key: FilterTab; label: string; statuses: OrderStatus[] }[] = [
  { key: "all", label: "Tất cả", statuses: [] },
  { key: "pending", label: "Chờ xác nhận", statuses: ["pending_confirmation", "partially_confirmed"] },
  { key: "confirmed", label: "Đã xác nhận", statuses: ["confirmed"] },
  { key: "in_transit", label: "Đang giao", statuses: ["preparing", "shipping", "delivered"] },
  { key: "done", label: "Hoàn thành", statuses: ["received_confirmed"] },
];

export default function HospitalOrdersPage() {
  const { state } = useApp();
  const { canUploadReceiptProof } = useRole();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);
  const [confirmedOrders, setConfirmedOrders] = useState<Set<string>>(new Set());

  const myOrders = [...state.orders.filter((o) => o.contractId === state.contract.id)]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  const filtered = myOrders.filter((o) => {
    const tab = FILTER_TABS.find((t) => t.key === activeTab);
    if (!tab || tab.statuses.length === 0) return true;
    return tab.statuses.includes(o.status);
  });

  const deliveredCount = myOrders.filter((o) => o.status === "delivered").length;

  return (
    <div>
      <PageHeader
        title="Đơn hàng của tôi"
        subtitle="Theo dõi trạng thái tất cả đơn hàng"
        actions={
          <Link href={`/hospital/contracts/${state.contract.id}`}>
            <span className="inline-flex items-center px-3 py-2 bg-[#024430] text-white text-sm font-medium rounded-xl cursor-pointer hover:bg-[#056246]">
              + Tạo đơn hàng mới
            </span>
          </Link>
        }
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
            {tab.key === "in_transit" && deliveredCount > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {deliveredCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <Card className="border border-[#E4EAE7]">
        <CardBody className="p-0">
          <Table aria-label="Đơn hàng bệnh viện">
            <TableHeader>
              <TableColumn>Mã đơn</TableColumn>
              <TableColumn>Ngày đặt</TableColumn>
              <TableColumn>Nhà cung cấp</TableColumn>
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
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            {isDelivered && canUploadReceiptProof && !confirmedOrders.has(order.id) && (
                              <button
                                type="button"
                                onClick={() => setExpandedReceipt(expandedReceipt === order.id ? null : order.id)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#024430] rounded-lg cursor-pointer hover:bg-[#056246]"
                              >
                                Xác nhận nhận hàng &amp; Tải biên bản
                              </button>
                            )}
                            {confirmedOrders.has(order.id) && (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg">
                                ✓ Đã xác nhận nhập kho
                              </span>
                            )}
                            {isDelivered && !canUploadReceiptProof && (
                              <Link href={`/hospital/orders/${order.id}`}>
                                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#024430] rounded-lg cursor-pointer hover:bg-[#056246]">
                                  Nghiệm thu
                                </span>
                              </Link>
                            )}
                            <Link href={`/hospital/orders/${order.id}`}>
                              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#10231C] border border-[#E4EAE7] bg-white rounded-lg cursor-pointer hover:bg-[#F6F8F7]">
                                Chi tiết
                              </span>
                            </Link>
                          </div>
                          {expandedReceipt === order.id && canUploadReceiptProof && (
                            <ReceiptUploadPanel
                              orderId={order.id}
                              accentColor="#1D4ED8"
                              onConfirmed={() => {
                                setConfirmedOrders((prev) => new Set([...prev, order.id]));
                                setExpandedReceipt(null);
                              }}
                            />
                          )}
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
