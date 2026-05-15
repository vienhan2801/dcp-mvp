"use client";
import { use, useState } from "react";
import { useApp } from "@/lib/store";
import { fmtVND, fmtDate, fmtDateTime, fmtNum } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import {
  Card, CardBody, CardHeader, Button, Chip, Divider,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
} from "@/components/ui";
import {
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS,
  LINE_STATUS_LABELS, LINE_STATUS_COLORS,
  EVIDENCE_ACTION_LABELS,
} from "@/lib/constants";
import { OrderStatus } from "@/domain/models/order";
import { EvidenceLog } from "@/domain/models/evidence";
import FileUpload from "@/components/FileUpload";

const STATUS_TIMELINE: { status: OrderStatus; label: string; icon?: string }[] = [
  { status: "pending_confirmation", label: "Tạo đơn" },
  { status: "confirmed", label: "NPP xác nhận" },
  { status: "preparing", label: "Chuẩn bị" },
  { status: "shipping", label: "Vận chuyển" },
  { status: "delivered", label: "Đã giao" },
  { status: "received_confirmed", label: "Nghiệm thu" },
];

const STATUS_ORDER: OrderStatus[] = [
  "pending_confirmation",
  "partially_confirmed",
  "confirmed",
  "preparing",
  "shipping",
  "delivered",
  "received_confirmed",
];

function getStepIndex(status: OrderStatus): number {
  const simplified: OrderStatus[] = [
    "pending_confirmation",
    "confirmed",
    "preparing",
    "shipping",
    "delivered",
    "received_confirmed",
  ];
  if (status === "partially_confirmed") return 1; // same as confirmed
  return simplified.indexOf(status);
}

const ACTOR_NAMES: Record<string, string> = {
  hospital_buyer: "Nguyễn Thị Hương",
};

export default function HospitalOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const order = state.orders.find((o) => o.id === id);
  const orderLogs = state.evidenceLogs.filter((l) => l.orderId === id);

  if (!order) {
    return <div className="p-8 text-center text-[#6B7A73]">Không tìm thấy đơn hàng</div>;
  }

  const currentStepIdx = getStepIndex(order.status);
  const isPartiallyConfirmed = order.status === "partially_confirmed";
  const isDelivered = order.status === "delivered";
  const isReceived = order.status === "received_confirmed";
  const isCancelled = order.status === "cancelled";

  // Build timestamp map: stepIdx → evidence log createdAt
  const stepTimestamps: Record<number, string> = {};
  const deliveryLogs = orderLogs.filter((l) => l.actionType === "delivery_updated");
  orderLogs.forEach((log) => {
    if (log.actionType === "order_created") stepTimestamps[0] = log.createdAt;
    else if (log.actionType === "order_confirmed" || log.actionType === "order_partially_confirmed") stepTimestamps[1] = log.createdAt;
    else if (log.actionType === "receipt_confirmed") stepTimestamps[5] = log.createdAt;
  });
  deliveryLogs.forEach((log, i) => { if (i < 3) stepTimestamps[2 + i] = log.createdAt; });

  function handleConfirmReceipt() {
    setLoading(true);
    const evidence: EvidenceLog = {
      id: `EVD-${Date.now()}`,
      contractId: order!.contractId,
      orderId: order!.id,
      actorRole: state.currentRole,
      actorName: ACTOR_NAMES[state.currentRole] || "Người dùng",
      actionType: "receipt_confirmed",
      title: `Bệnh viện xác nhận nghiệm thu ${order!.id}`,
      description: `Đã kiểm tra và xác nhận nhận đủ hàng. Tổng giá trị xác nhận: ${fmtVND(order!.totalConfirmedAmount)}. Hóa đơn thanh toán sẽ được tạo.`,
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
      <PageHeader
        title={`Đơn hàng ${order.id}`}
        subtitle={`Hợp đồng: ${order.contractId} · NPP: ${order.supplierName}`}
        actions={
          <StatusChip
            label={ORDER_STATUS_LABELS[order.status]}
            color={ORDER_STATUS_COLORS[order.status]}
            size="md"
          />
        }
      />

      {/* Success banner after receipt */}
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

      {/* Partial confirmation warning */}
      {isPartiallyConfirmed && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Đơn hàng được xác nhận một phần</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Nhà cung cấp không thể đáp ứng đầy đủ số lượng yêu cầu. Xem ghi chú từng dòng bên dưới.
            </p>
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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
              const ts = stepTimestamps[idx];
              return (
                <div key={step.status} className="flex items-start flex-shrink-0">
                  <div className="flex flex-col items-center w-24">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isCancelled
                        ? "border-[#E4EAE7] bg-white text-[#6B7A73]"
                        : isCurrent
                        ? "border-[#024430] bg-[#024430] text-white"
                        : isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-[#E4EAE7] bg-white text-[#6B7A73]"
                    }`}>
                      {isCompleted && !isCurrent ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <p className={`text-xs mt-1 text-center leading-tight ${
                      isCancelled ? "text-[#6B7A73]" : isCurrent ? "text-[#024430] font-semibold" : isCompleted ? "text-emerald-600 font-medium" : "text-[#6B7A73]"
                    }`}>
                      {step.label}
                    </p>
                    {ts && (
                      <p className="text-[10px] text-[#6B7A73] mt-0.5 text-center leading-tight">
                        {fmtDateTime(ts)}
                      </p>
                    )}
                  </div>
                  {idx < STATUS_TIMELINE.length - 1 && (
                    <div className={`h-0.5 w-8 mx-0.5 mt-4 flex-shrink-0 ${!isCancelled && idx < currentStepIdx ? "bg-emerald-500" : "bg-[#E4EAE7]"}`} />
                  )}
                </div>
              );
            })}
            {isCancelled && (
              <div className="flex items-start flex-shrink-0 ml-2">
                <div className="w-0.5 bg-[#E4EAE7] h-8 mx-2 mt-0" />
                <div className="flex flex-col items-center w-20">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-red-400 bg-red-50">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-xs mt-1 text-center text-red-600 font-semibold">Đã hủy</p>
                </div>
              </div>
            )}
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
                        {line.supplierNote && (
                          <p className="text-xs text-amber-700 mt-0.5 bg-amber-50 px-2 py-0.5 rounded">
                            NPP: {line.supplierNote}
                          </p>
                        )}
                        {line.rejectedQty > 0 && (
                          <p className="text-xs text-red-600 mt-0.5">
                            Từ chối: {fmtNum(line.rejectedQty)} {line.unit}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{fmtNum(line.requestedQty)}</TableCell>
                      <TableCell>
                        {line.confirmedQty > 0 ? (
                          <span className={`font-semibold ${line.confirmedQty < line.requestedQty ? "text-amber-700" : "text-[#024430]"}`}>
                            {fmtNum(line.confirmedQty)}
                          </span>
                        ) : (
                          <span className="text-[#6B7A73]">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {line.deliveredQty > 0 ? (
                          <span className="text-emerald-700 font-medium">{fmtNum(line.deliveredQty)}</span>
                        ) : (
                          <span className="text-[#6B7A73]">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip color={LINE_STATUS_COLORS[line.status]} variant="flat" size="sm">
                          {LINE_STATUS_LABELS[line.status]}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t border-[#E4EAE7] flex justify-between items-center">
                <span className="font-semibold text-[#10231C]">Tổng giá trị yêu cầu</span>
                <span className="text-xl font-bold text-[#024430]">{fmtVND(order.totalRequestedAmount)}</span>
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

        {/* Info + action */}
        <div className="flex flex-col gap-4">
          <Card className="border border-[#E4EAE7]">
            <CardBody className="p-5">
              <h3 className="font-semibold text-[#10231C] mb-3">Thông tin giao hàng</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Ngày đặt hàng", value: fmtDate(order.orderDate) },
                  { label: "Ngày giao yêu cầu", value: fmtDate(order.requestedDeliveryDate) },
                  { label: "Địa điểm", value: order.deliveryLocation },
                  { label: "Ghi chú", value: order.note || "—" },
                ].map((r) => (
                  <div key={r.label}>
                    <p className="text-xs text-[#6B7A73]">{r.label}</p>
                    <p className="text-sm font-medium text-[#10231C] mt-0.5">{r.value}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Receipt confirmation action */}
          {isDelivered && !confirmed && (
            <Card className="border border-[#1D4ED8]/30 bg-blue-50">
              <CardBody className="p-5">
                <h3 className="font-semibold text-[#10231C] mb-2">Xác nhận nghiệm thu</h3>
                <p className="text-xs text-[#6B7A73] mb-4">
                  Hàng đã được giao đến kho. Sau khi xác nhận, hệ thống sẽ cập nhật số lượng đã giao và tạo hóa đơn thanh toán.
                </p>
                <div className="mb-4">
                  <FileUpload
                    label="Bằng chứng nghiệm thu"
                    hint="Biên bản nghiệm thu, ảnh hàng nhận được"
                    accentColor="#1D4ED8"
                  />
                </div>
                <Button
                  className="w-full bg-[#024430] text-white font-semibold"
                  size="lg"
                  onPress={onOpen}
                >
                  Xác nhận nghiệm thu
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
                    <div className="w-8 h-8 rounded-full bg-[#024430]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#024430] text-xs font-bold">{orderLogs.length - idx}</span>
                    </div>
                    {idx < orderLogs.length - 1 && <div className="w-0.5 flex-1 bg-[#E4EAE7] my-1 min-h-[16px]" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Chip color="default" variant="flat" size="sm">{EVIDENCE_ACTION_LABELS[log.actionType]}</Chip>
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
          <ModalHeader>Xác nhận nghiệm thu hàng</ModalHeader>
          <ModalBody>
            <p className="text-sm text-[#6B7A73]">
              Bạn xác nhận đã nhận và kiểm tra đầy đủ hàng hóa cho đơn <strong>{order.id}</strong>?
            </p>
            <p className="text-sm text-[#6B7A73] mt-2">
              Tổng giá trị: <strong className="text-[#024430]">{fmtVND(order.totalConfirmedAmount || order.totalRequestedAmount)}</strong>
            </p>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                Sau khi xác nhận, hệ thống sẽ tự động tạo hóa đơn thanh toán và cập nhật số lượng đã giao trong hợp đồng.
              </p>
            </div>
            <div className="mt-4">
              <FileUpload
                label="Bằng chứng nghiệm thu"
                hint="Biên bản nghiệm thu, ảnh hàng nhận được"
                accentColor="#1D4ED8"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Hủy</Button>
            <Button className="bg-[#024430] text-white" isLoading={loading} onPress={handleConfirmReceipt}>
              Xác nhận nghiệm thu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
