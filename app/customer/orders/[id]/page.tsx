"use client";
import { use, useState } from "react";
import { useApp } from "@/lib/store";
import { fmtVND, fmtDate, fmtDateTime, fmtNum } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import {
  Card, CardBody, CardHeader, Button, Chip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
} from "@/components/ui";
import { EvidenceLog } from "@/domain/models/evidence";
import { OrderStatus } from "@/domain/models/order";
import Link from "next/link";

const ACCENT = "#1D4ED8";

const STATUS_LABELS: Record<string, string> = {
  pending_confirmation: "Chờ xác nhận",
  partially_confirmed:  "XN một phần",
  confirmed:            "Đã xác nhận",
  preparing:            "Chuẩn bị",
  shipping:             "Đang giao",
  delivered:            "Đã giao",
  received_confirmed:   "Hoàn thành",
  cancelled:            "Đã hủy",
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

const LINE_STATUS_LABELS: Record<string, string> = {
  pending_confirmation: "Chờ xác nhận",
  confirmed:            "Đã xác nhận",
  partially_confirmed:  "XN một phần",
  rejected:             "Từ chối",
  delivered:            "Đã giao",
};

const LINE_STATUS_COLORS: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  pending_confirmation: "warning",
  confirmed:            "primary",
  partially_confirmed:  "warning",
  rejected:             "danger",
  delivered:            "success",
};

const STATUS_TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: "pending_confirmation", label: "Tạo đơn" },
  { status: "confirmed",            label: "NPP xác nhận" },
  { status: "preparing",            label: "Chuẩn bị" },
  { status: "shipping",             label: "Vận chuyển" },
  { status: "delivered",            label: "Đã giao" },
  { status: "received_confirmed",   label: "Nghiệm thu" },
];

function getStepIndex(status: string): number {
  const order: string[] = ["pending_confirmation", "confirmed", "preparing", "shipping", "delivered", "received_confirmed"];
  if (status === "partially_confirmed") return 1;
  return order.indexOf(status);
}

export default function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const order = state.orders.find((o) => o.id === id);
  const orderLogs = state.evidenceLogs.filter((l) => l.orderId === id);

  if (!order) {
    return (
      <div className="p-8 text-center text-[#6B7A73]">
        <p className="text-lg mb-4">Không tìm thấy đơn hàng</p>
        <Link href="/customer/orders">
          <span className="text-sm font-medium hover:underline cursor-pointer" style={{ color: ACCENT }}>
            ← Quay lại danh sách đơn hàng
          </span>
        </Link>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(order.status);
  const isDelivered = order.status === "delivered";
  const isReceived = order.status === "received_confirmed";
  const isCancelled = order.status === "cancelled";

  function handleConfirmReceipt() {
    setLoading(true);
    const evidence: EvidenceLog = {
      id: `EVD-${Date.now()}`,
      contractId: order!.contractId,
      orderId: order!.id,
      actorRole: "customer_buyer",
      actorName: "Người dùng",
      actionType: "receipt_confirmed",
      title: `Khách hàng xác nhận nghiệm thu ${order!.id}`,
      description: `Đã kiểm tra và xác nhận nhận đủ hàng. Tổng giá trị: ${fmtVND(order!.totalConfirmedAmount || order!.totalRequestedAmount)}.`,
      createdAt: new Date().toISOString(),
    };
    setTimeout(() => {
      dispatch({ type: "CONFIRM_RECEIPT", payload: { orderId: order!.id, evidence } });
      setLoading(false);
      setConfirmed(true);
      onClose();
    }, 800);
  }

  return (
    <div>
      <div className="mb-4">
        <Link href="/customer/orders">
          <span className="text-sm text-[#6B7A73] hover:text-[#10231C] cursor-pointer transition-colors">
            ← Quay lại đơn hàng
          </span>
        </Link>
      </div>

      <PageHeader
        title={`Đơn hàng ${order.id}`}
        subtitle={`Hợp đồng: ${order.contractId} · NPP: ${order.supplierName}`}
        actions={
          <Chip color={STATUS_COLORS[order.status] ?? "default"} variant="flat" size="lg">
            {STATUS_LABELS[order.status] ?? order.status}
          </Chip>
        }
      />

      {/* Success banner */}
      {(confirmed || isReceived) && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-semibold text-emerald-700">
            Đã xác nhận nghiệm thu thành công! Hóa đơn thanh toán đã được tạo.
          </p>
        </div>
      )}

      {isCancelled && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <p className="text-sm font-semibold text-red-700">Đơn hàng đã bị hủy.</p>
        </div>
      )}

      {/* Status timeline */}
      <Card className="mb-6 border border-[#E4EAE7]">
        <CardBody className="p-5">
          <div className="flex items-start gap-0 overflow-x-auto pb-2">
            {STATUS_TIMELINE.map((step, idx) => {
              const isCompleted = !isCancelled && idx <= currentStepIdx;
              const isCurrent = !isCancelled && idx === currentStepIdx;
              return (
                <div key={step.status} className="flex items-start flex-shrink-0">
                  <div className="flex flex-col items-center w-24">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isCancelled
                        ? "border-[#E4EAE7] bg-white text-[#6B7A73]"
                        : isCurrent
                        ? "text-white"
                        : isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-[#E4EAE7] bg-white text-[#6B7A73]"
                    }`} style={isCurrent ? { backgroundColor: ACCENT, borderColor: ACCENT } : {}}>
                      {isCompleted && !isCurrent ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : idx + 1}
                    </div>
                    <p className={`text-xs mt-1 text-center leading-tight ${
                      isCancelled ? "text-[#6B7A73]" : isCurrent ? "font-semibold" : isCompleted ? "text-emerald-600 font-medium" : "text-[#6B7A73]"
                    }`} style={isCurrent ? { color: ACCENT } : {}}>
                      {step.label}
                    </p>
                  </div>
                  {idx < STATUS_TIMELINE.length - 1 && (
                    <div className={`h-0.5 w-8 mx-0.5 mt-4 flex-shrink-0 ${!isCancelled && idx < currentStepIdx ? "bg-emerald-500" : "bg-[#E4EAE7]"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lines table */}
        <div className="lg:col-span-2">
          <Card className="border border-[#E4EAE7]">
            <CardHeader><h3 className="font-semibold text-[#10231C]">Chi tiết dòng thuốc</h3></CardHeader>
            <CardBody className="p-0 pt-2">
              <Table aria-label="Dòng đơn hàng">
                <TableHeader>
                  <TableColumn>Tên thuốc</TableColumn>
                  <TableColumn>YC</TableColumn>
                  <TableColumn>XN</TableColumn>
                  <TableColumn>Đã giao</TableColumn>
                  <TableColumn>Trạng thái</TableColumn>
                </TableHeader>
                <TableBody>
                  {order.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <p className="font-semibold text-[#10231C]">{line.productName}</p>
                        <p className="text-xs text-[#6B7A73]">{line.productCode} · {line.unit}</p>
                      </TableCell>
                      <TableCell className="font-medium">{fmtNum(line.requestedQty)}</TableCell>
                      <TableCell>
                        {line.confirmedQty > 0 ? (
                          <span className={`font-semibold ${line.confirmedQty < line.requestedQty ? "text-amber-700" : "text-[#024430]"}`}>
                            {fmtNum(line.confirmedQty)}
                          </span>
                        ) : <span className="text-[#6B7A73]">—</span>}
                      </TableCell>
                      <TableCell>
                        {line.deliveredQty > 0 ? (
                          <span className="text-emerald-700 font-medium">{fmtNum(line.deliveredQty)}</span>
                        ) : <span className="text-[#6B7A73]">0</span>}
                      </TableCell>
                      <TableCell>
                        <Chip color={LINE_STATUS_COLORS[line.status] ?? "default"} variant="flat" size="sm">
                          {LINE_STATUS_LABELS[line.status] ?? line.status}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t border-[#E4EAE7] flex justify-between items-center">
                <span className="font-semibold text-[#10231C]">Tổng giá trị yêu cầu</span>
                <span className="text-xl font-bold" style={{ color: ACCENT }}>{fmtVND(order.totalRequestedAmount)}</span>
              </div>
              {order.totalConfirmedAmount > 0 && (
                <div className="px-4 pb-4 flex justify-between items-center">
                  <span className="text-sm text-[#6B7A73]">Tổng giá trị xác nhận</span>
                  <span className="text-lg font-bold text-emerald-700">{fmtVND(order.totalConfirmedAmount)}</span>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          <Card className="border border-[#E4EAE7]">
            <CardBody className="p-5">
              <h3 className="font-semibold text-[#10231C] mb-3">Thông tin giao hàng</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Ngày đặt hàng",   value: fmtDate(order.orderDate) },
                  { label: "Ngày giao yêu cầu", value: fmtDate(order.requestedDeliveryDate) },
                  { label: "Địa điểm",         value: order.deliveryLocation },
                  { label: "Ghi chú",          value: order.note || "—" },
                ].map((r) => (
                  <div key={r.label}>
                    <p className="text-xs text-[#6B7A73]">{r.label}</p>
                    <p className="text-sm font-medium text-[#10231C] mt-0.5">{r.value}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Receipt confirmation */}
          {isDelivered && !confirmed && (
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardBody className="p-5">
                <h3 className="font-semibold text-[#10231C] mb-2">Xác nhận nhận hàng</h3>
                <p className="text-xs text-[#6B7A73] mb-4">
                  Hàng đã được giao đến. Sau khi xác nhận, hệ thống sẽ tạo hóa đơn thanh toán.
                </p>
                <Button className="w-full font-semibold text-white bg-blue-700" size="lg" onClick={onOpen}>
                  Xác nhận nhận hàng
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Evidence logs */}
      {orderLogs.length > 0 && (
        <Card className="mt-6 border border-[#E4EAE7]">
          <CardHeader><h3 className="font-semibold text-[#10231C]">Nhật ký đơn hàng</h3></CardHeader>
          <CardBody className="pt-2">
            <div className="flex flex-col">
              {orderLogs.map((log, idx) => (
                <div key={log.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${ACCENT}1A` }}>
                      <span className="text-xs font-bold" style={{ color: ACCENT }}>{orderLogs.length - idx}</span>
                    </div>
                    {idx < orderLogs.length - 1 && <div className="w-0.5 flex-1 bg-[#E4EAE7] my-1 min-h-[16px]" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Chip color="default" variant="flat" size="sm">{log.actionType}</Chip>
                      <span className="text-xs text-[#6B7A73]">{fmtDateTime(log.createdAt)}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#10231C]">{log.title}</p>
                    <p className="text-xs text-[#6B7A73] mt-0.5">{log.description}</p>
                    <p className="text-xs text-[#6B7A73] mt-0.5">Bởi: {log.actorName}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Confirm receipt modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Xác nhận nhận hàng</ModalHeader>
          <ModalBody>
            <p className="text-sm text-[#6B7A73]">
              Bạn xác nhận đã nhận và kiểm tra đầy đủ hàng hóa cho đơn <strong>{order.id}</strong>?
            </p>
            <p className="text-sm text-[#6B7A73] mt-2">
              Tổng giá trị: <strong className="text-blue-700">{fmtVND(order.totalConfirmedAmount || order.totalRequestedAmount)}</strong>
            </p>
            <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-700">
                Sau khi xác nhận, hệ thống sẽ tự động tạo hóa đơn thanh toán.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onClose}>Hủy</Button>
            <Button className="text-white bg-blue-700" isLoading={loading} onClick={handleConfirmReceipt}>
              Xác nhận nhận hàng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
