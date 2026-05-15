"use client";
import { use, useState } from "react";
import { useApp } from "@/lib/store";
import { fmtVND, fmtDate, fmtDateTime, fmtNum } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import {
  Card, CardBody, CardHeader, Button, Chip, Divider,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
  Input,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
} from "@/components/ui";
import {
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS,
  LINE_STATUS_LABELS, LINE_STATUS_COLORS,
  EVIDENCE_ACTION_LABELS, NEXT_DELIVERY_ACTION,
} from "@/lib/constants";
import { OrderStatus } from "@/domain/models/order";
import { EvidenceLog } from "@/domain/models/evidence";
import FileUpload from "@/components/FileUpload";

const DELIVERY_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "confirmed", label: "Đã xác nhận" },
  { status: "preparing", label: "Chuẩn bị" },
  { status: "shipping", label: "Vận chuyển" },
  { status: "delivered", label: "Đã giao" },
  { status: "received_confirmed", label: "Nghiệm thu" },
];

const STATUS_STEP_INDEX: Partial<Record<OrderStatus, number>> = {
  pending_confirmation: -1,
  partially_confirmed: -1,
  confirmed: 0,
  preparing: 1,
  shipping: 2,
  delivered: 3,
  received_confirmed: 4,
};

const ACTOR_NAMES: Record<string, string> = {
  supplier_admin: "Trần Văn Minh",
  supplier_logistics: "Lê Thị Lan",
  supplier_finance: "Phạm Thanh Tùng",
  hospital_buyer: "Nguyễn Thị Hương",
};

export default function SupplierOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const { currentRole } = state;
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const { isOpen: isDeliveryOpen, onOpen: onDeliveryOpen, onClose: onDeliveryClose } = useDisclosure();

  const order = state.orders.find((o) => o.id === id);
  const orderLogs = state.evidenceLogs.filter((l) => l.orderId === id);

  // Build timestamp map: DELIVERY_STEPS index → evidence log createdAt
  const stepTimestamps: Record<number, string> = {};
  const deliveryUpdateLogs = orderLogs.filter((l) => l.actionType === "delivery_updated");
  orderLogs.forEach((log) => {
    if (log.actionType === "order_confirmed" || log.actionType === "order_partially_confirmed") stepTimestamps[0] = log.createdAt;
    if (log.actionType === "receipt_confirmed") stepTimestamps[4] = log.createdAt;
  });
  deliveryUpdateLogs.forEach((log, i) => { if (i < 3) stepTimestamps[1 + i] = log.createdAt; });

  // Confirmation mode state
  const [confirmQtys, setConfirmQtys] = useState<Record<string, number>>({});
  const [confirmNotes, setConfirmNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Delivery proof files
  const [deliveryProofFiles, setDeliveryProofFiles] = useState<File[]>([]);

  if (!order) {
    return <div className="p-8 text-center text-[#6B7A73]">Không tìm thấy đơn hàng</div>;
  }

  // Initialize confirm qtys from order lines
  const getQty = (lineId: string, requestedQty: number) =>
    confirmQtys[lineId] !== undefined ? confirmQtys[lineId] : requestedQty;

  const totalConfirmedAmount = order.lines.reduce((sum, line) => {
    return sum + getQty(line.id, line.requestedQty) * line.unitPrice;
  }, 0);

  // Determine mode
  const canConfirm =
    currentRole === "supplier_admin" &&
    (order.status === "pending_confirmation" || order.status === "partially_confirmed");

  const canAdvanceDelivery =
    (currentRole === "supplier_logistics" || currentRole === "supplier_admin") &&
    (order.status === "confirmed" || order.status === "preparing" || order.status === "shipping");

  const awaitingReceipt = order.status === "delivered";

  const nextDeliveryLabel = NEXT_DELIVERY_ACTION[order.status];
  const currentStepIdx = STATUS_STEP_INDEX[order.status] ?? -1;

  function handleConfirmOrder() {
    setLoading(true);
    const confirmations = order!.lines.map((line) => ({
      lineId: line.id,
      contractItemId: line.contractItemId,
      confirmedQty: getQty(line.id, line.requestedQty),
      note: confirmNotes[line.id] || undefined,
    }));
    const allConfirmed = confirmations.every((c, i) => c.confirmedQty === order!.lines[i].requestedQty);
    const evidence: EvidenceLog = {
      id: `EVD-${Date.now()}`,
      contractId: order!.contractId,
      orderId: order!.id,
      actorRole: currentRole,
      actorName: ACTOR_NAMES[currentRole] || "Người dùng",
      actionType: allConfirmed ? "order_confirmed" : "order_partially_confirmed",
      title: allConfirmed
        ? `${order!.id}: Xác nhận toàn bộ đơn hàng`
        : `${order!.id}: Xác nhận một phần đơn hàng`,
      description: `Tổng giá trị xác nhận: ${fmtVND(totalConfirmedAmount)}`,
      createdAt: new Date().toISOString(),
    };
    setTimeout(() => {
      dispatch({ type: "CONFIRM_ORDER_LINES", payload: { orderId: order!.id, confirmations, evidence } });
      setLoading(false);
      onConfirmClose();
      setSuccessMsg("Đã xác nhận đơn hàng thành công!");
    }, 700);
  }

  function handleAdvanceDelivery() {
    setLoading(true);
    const evidence: EvidenceLog = {
      id: `EVD-${Date.now()}`,
      contractId: order!.contractId,
      orderId: order!.id,
      actorRole: currentRole,
      actorName: ACTOR_NAMES[currentRole] || "Người dùng",
      actionType: "delivery_updated",
      title: `${order!.id}: ${nextDeliveryLabel}`,
      description: `Cập nhật tiến độ giao hàng: ${nextDeliveryLabel}`,
      createdAt: new Date().toISOString(),
    };
    setTimeout(() => {
      dispatch({ type: "ADVANCE_DELIVERY", payload: { orderId: order!.id, evidence } });
      setLoading(false);
      onDeliveryClose();
      setSuccessMsg("Đã cập nhật trạng thái giao hàng!");
    }, 700);
  }

  return (
    <div>
      <PageHeader
        title={`Đơn hàng ${order.id}`}
        subtitle={`Hợp đồng: ${order.contractId} · ${order.hospitalName}`}
        actions={
          <StatusChip
            label={ORDER_STATUS_LABELS[order.status]}
            color={ORDER_STATUS_COLORS[order.status]}
            size="md"
          />
        }
      />

      {successMsg && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-semibold text-emerald-700">{successMsg}</p>
        </div>
      )}

      {/* ── MODE A: Supplier Admin — Confirm order ── */}
      {canConfirm && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Đây là đơn hàng từ bệnh viện. Vui lòng xem xét và nhập số lượng xác nhận cho từng dòng.</p>
              <p className="text-xs text-amber-700 mt-0.5">Số lượng xác nhận có thể nhỏ hơn số lượng yêu cầu nếu tồn kho không đủ.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── MODE B: Supplier Logistics — Advance delivery ── */}
      {canAdvanceDelivery && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-800">Đơn hàng đã được xác nhận. Cập nhật tiến độ giao hàng.</p>
              <p className="text-xs text-blue-700 mt-0.5">Hành động tiếp theo: <strong>{nextDeliveryLabel}</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* ── MODE C: Awaiting hospital receipt ── */}
      {awaitingReceipt && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-semibold text-emerald-800">Hàng đã được giao. Đang chờ bệnh viện xác nhận nghiệm thu.</p>
          </div>
        </div>
      )}

      {/* Order header info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Ngày đặt hàng", value: fmtDate(order.orderDate) },
          { label: "Ngày giao yêu cầu", value: fmtDate(order.requestedDeliveryDate) },
          { label: "Bệnh viện", value: order.hospitalName },
          { label: "Địa điểm giao hàng", value: order.deliveryLocation },
        ].map((r) => (
          <Card key={r.label} className="border border-[#E4EAE7]">
            <CardBody className="p-3">
              <p className="text-xs text-[#6B7A73]">{r.label}</p>
              <p className="text-sm font-medium text-[#10231C] mt-0.5">{r.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Delivery timeline (for in-delivery orders) */}
      {(canAdvanceDelivery || awaitingReceipt || order.status === "received_confirmed") && (
        <Card className="mb-6 border border-[#E4EAE7]">
          <CardHeader><h3 className="font-semibold text-[#10231C]">Tiến trình giao hàng</h3></CardHeader>
          <CardBody className="pt-2">
            <div className="flex items-start gap-0 overflow-x-auto pb-2">
              {DELIVERY_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const ts = stepTimestamps[idx];
                return (
                  <div key={step.status} className="flex items-start flex-shrink-0">
                    <div className="flex flex-col items-center w-24">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        isCurrent
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
                      <p className={`text-xs mt-1 text-center leading-tight ${isCurrent ? "text-[#024430] font-semibold" : isCompleted ? "text-emerald-600 font-medium" : "text-[#6B7A73]"}`}>
                        {step.label}
                      </p>
                      {ts && (
                        <p className="text-[10px] text-[#6B7A73] mt-0.5 text-center leading-tight">
                          {fmtDateTime(ts)}
                        </p>
                      )}
                    </div>
                    {idx < DELIVERY_STEPS.length - 1 && (
                      <div className={`h-0.5 w-8 mx-0.5 mt-4 flex-shrink-0 ${idx < currentStepIdx ? "bg-emerald-500" : "bg-[#E4EAE7]"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* MODE A: Confirmation form */}
      {canConfirm && (
        <Card className="mb-6 border border-[#E4EAE7]">
          <CardHeader>
            <h3 className="font-semibold text-[#10231C]">Xác nhận số lượng từng dòng thuốc</h3>
          </CardHeader>
          <CardBody className="pt-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F6F8F7] text-xs text-[#6B7A73]">
                    <th className="text-left p-3 rounded-tl-lg">Tên thuốc</th>
                    <th className="text-left p-3">Mã</th>
                    <th className="text-center p-3">ĐVT</th>
                    <th className="text-right p-3">Đơn giá</th>
                    <th className="text-right p-3">Yêu cầu</th>
                    <th className="text-center p-3">SL xác nhận</th>
                    <th className="text-left p-3 rounded-tr-lg">Ghi chú NPP</th>
                  </tr>
                </thead>
                <tbody>
                  {order.lines.map((line) => {
                    const qty = getQty(line.id, line.requestedQty);
                    const isPartial = qty < line.requestedQty;
                    return (
                      <tr key={line.id} className="border-t border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors">
                        <td className="p-3">
                          <p className="font-semibold text-sm text-[#10231C]">{line.productName}</p>
                        </td>
                        <td className="p-3 font-mono text-xs text-[#6B7A73]">{line.productCode}</td>
                        <td className="p-3 text-center text-sm">{line.unit}</td>
                        <td className="p-3 text-right text-sm">{fmtVND(line.unitPrice)}</td>
                        <td className="p-3 text-right font-medium">{fmtNum(line.requestedQty)}</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            value={qty}
                            min={0}
                            max={line.requestedQty}
                            onChange={(e) => {
                              const v = Math.max(0, Math.min(line.requestedQty, Number(e.target.value)));
                              setConfirmQtys((prev) => ({ ...prev, [line.id]: v }));
                            }}
                            className={`w-24 text-center border rounded-lg px-2 py-1 text-sm outline-none transition-colors ${
                              isPartial
                                ? "border-amber-400 bg-amber-50 text-amber-800"
                                : "border-[#E4EAE7] bg-white focus:border-[#024430]"
                            }`}
                          />
                          {isPartial && (
                            <p className="text-[10px] text-amber-600 mt-0.5">-{fmtNum(line.requestedQty - qty)}</p>
                          )}
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={confirmNotes[line.id] || ""}
                            onChange={(e) => setConfirmNotes((prev) => ({ ...prev, [line.id]: e.target.value }))}
                            placeholder="Lý do từ chối / ghi chú..."
                            className="w-full border border-[#E4EAE7] rounded-lg px-2 py-1 text-xs outline-none focus:border-[#024430] bg-[#F6F8F7]"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Divider className="my-4" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7A73]">Tổng giá trị xác nhận</p>
                <p className="text-xl font-bold text-[#024430]">{fmtVND(totalConfirmedAmount)}</p>
                <p className="text-xs text-[#6B7A73] mt-0.5">YC: {fmtVND(order.totalRequestedAmount)}</p>
              </div>
              <Button
                className="bg-[#024430] text-white font-semibold px-6"
                size="lg"
                onPress={onConfirmOpen}
              >
                Xác nhận đơn hàng
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Lines table (always shown) */}
      <Card className="mb-6 border border-[#E4EAE7]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#10231C]">Chi tiết dòng thuốc</h3>
          </div>
        </CardHeader>
        <CardBody className="pt-2 p-0">
          <Table aria-label="Dòng đơn hàng">
            <TableHeader>
              <TableColumn>Tên thuốc</TableColumn>
              <TableColumn>YC</TableColumn>
              <TableColumn>XN</TableColumn>
              <TableColumn>Từ chối</TableColumn>
              <TableColumn>Đã giao</TableColumn>
              <TableColumn>Thành tiền</TableColumn>
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
                  </TableCell>
                  <TableCell className="font-medium">{fmtNum(line.requestedQty)}</TableCell>
                  <TableCell>
                    {line.confirmedQty > 0 ? (
                      <span className="font-semibold text-[#024430]">{fmtNum(line.confirmedQty)}</span>
                    ) : (
                      <span className="text-[#6B7A73]">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {line.rejectedQty > 0 ? (
                      <span className="text-red-600 font-medium">{fmtNum(line.rejectedQty)}</span>
                    ) : (
                      <span className="text-[#6B7A73]">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {line.deliveredQty > 0 ? (
                      <span className="text-emerald-700 font-medium">{fmtNum(line.deliveredQty)}</span>
                    ) : (
                      <span className="text-[#6B7A73]">0</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">{fmtVND(line.lineAmount)}</TableCell>
                  <TableCell>
                    <Chip color={LINE_STATUS_COLORS[line.status]} variant="flat" size="sm">
                      {LINE_STATUS_LABELS[line.status]}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Delivery action button */}
      {canAdvanceDelivery && nextDeliveryLabel && (
        <Card className="mb-6 border border-[#024430]/20 bg-[#024430]/5">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#10231C]">Hành động giao hàng tiếp theo</p>
              <p className="text-xs text-[#6B7A73] mt-0.5">Cập nhật tiến trạng thái để bệnh viện theo dõi.</p>
            </div>
            <Button
              className="bg-[#024430] text-white font-semibold"
              size="lg"
              onPress={onDeliveryOpen}
            >
              {nextDeliveryLabel}
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Delivery proof upload */}
      <Card className="mb-6 border border-[#E4EAE7]">
        <CardBody className="p-5">
          <h3 className="font-semibold text-[#10231C] mb-4">Bằng chứng giao hàng</h3>
          <FileUpload
            label="Ảnh/file biên bản giao hàng"
            accept="image/*,application/pdf"
            maxFiles={3}
            accentColor="#024430"
            onFilesChange={setDeliveryProofFiles}
          />
          <div className="flex justify-end mt-4">
            <button
              type="button"
              disabled={deliveryProofFiles.length === 0}
              onClick={() => setSuccessMsg("Đã xác nhận giao hàng thành công!")}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#024430] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#024430]/90 transition-colors"
            >
              Xác nhận giao hàng
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Evidence logs for this order */}
      {orderLogs.length > 0 && (
        <Card className="border border-[#E4EAE7]">
          <CardHeader><h3 className="font-semibold text-[#10231C]">Nhật ký đơn hàng</h3></CardHeader>
          <CardBody className="pt-2">
            <div className="flex flex-col">
              {orderLogs.map((log, idx) => (
                <div key={log.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#024430]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#024430] text-xs font-bold">{orderLogs.length - idx}</span>
                    </div>
                    {idx < orderLogs.length - 1 && <div className="w-0.5 flex-1 bg-[#E4EAE7] mt-1 mb-1 min-h-[20px]" />}
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

      {/* Confirm order modal */}
      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
        <ModalContent>
          <ModalHeader>Xác nhận đơn hàng {order.id}</ModalHeader>
          <ModalBody>
            <p className="text-sm text-[#6B7A73] mb-3">
              Tổng giá trị xác nhận: <strong className="text-[#024430]">{fmtVND(totalConfirmedAmount)}</strong>
            </p>
            <div className="flex flex-col gap-2 text-sm">
              {order.lines.map((line) => {
                const qty = getQty(line.id, line.requestedQty);
                const isPartial = qty < line.requestedQty;
                return (
                  <div key={line.id} className={`flex justify-between p-2 rounded-lg ${isPartial ? "bg-amber-50" : "bg-[#F6F8F7]"}`}>
                    <span className="text-[#10231C]">{line.productName}</span>
                    <span className={`font-semibold ${isPartial ? "text-amber-700" : "text-[#024430]"}`}>
                      {fmtNum(qty)} / {fmtNum(line.requestedQty)} {line.unit}
                      {isPartial && " (một phần)"}
                    </span>
                  </div>
                );
              })}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onConfirmClose}>Hủy</Button>
            <Button className="bg-[#024430] text-white" isLoading={loading} onPress={handleConfirmOrder}>
              Xác nhận
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Advance delivery modal */}
      <Modal isOpen={isDeliveryOpen} onClose={onDeliveryClose}>
        <ModalContent>
          <ModalHeader>Cập nhật trạng thái giao hàng</ModalHeader>
          <ModalBody>
            <p className="text-sm text-[#6B7A73]">
              Xác nhận hành động: <strong className="text-[#10231C]">{nextDeliveryLabel}</strong>
            </p>
            <p className="text-sm text-[#6B7A73] mt-2">
              Đơn hàng: <strong>{order.id}</strong> · Trạng thái hiện tại: {ORDER_STATUS_LABELS[order.status]}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeliveryClose}>Hủy</Button>
            <Button className="bg-[#024430] text-white" isLoading={loading} onPress={handleAdvanceDelivery}>
              Xác nhận
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
