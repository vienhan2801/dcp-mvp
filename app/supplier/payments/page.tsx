"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { fmtVND, fmtDate, pct } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import FileUpload from "@/components/FileUpload";
import {
  Card, CardBody, Button, Progress,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
  Input, Select, SelectItem,
} from "@/components/ui";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from "@/lib/constants";
import { PaymentStatus } from "@/domain/models/payment";
import { EvidenceLog } from "@/domain/models/evidence";

const ACTOR_NAMES: Record<string, string> = {
  supplier_finance: "Phạm Thanh Tùng",
  supplier_admin: "Trần Văn Minh",
};

export default function SupplierPaymentsPage() {
  const { state, dispatch } = useApp();
  const { currentRole, payments } = state;
  const { isNPPFinance, isNPPAdmin, isNPPLogistics } = useRole();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [paidAmountInput, setPaidAmountInput] = useState("");
  const [newStatus, setNewStatus] = useState<PaymentStatus>("partially_paid");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isFinance = currentRole === "supplier_finance";
  const canManage = isNPPFinance || isNPPAdmin;
  const selectedPayment = payments.find((p) => p.id === selectedPaymentId);

  const totalInvoice = payments.reduce((s, p) => s + p.invoiceAmount, 0);
  const totalPaid = payments.reduce((s, p) => s + p.paidAmount, 0);
  const totalOutstanding = payments.reduce((s, p) => s + p.outstandingAmount, 0);

  function openUpdateModal(id: string) {
    const p = payments.find((x) => x.id === id);
    if (!p) return;
    setSelectedPaymentId(id);
    setPaidAmountInput(String(p.paidAmount));
    setNewStatus(p.status);
    onOpen();
  }

  function handleUpdate() {
    if (!selectedPaymentId || !selectedPayment) return;
    setLoading(true);
    const amount = Number(paidAmountInput);
    const evidence: EvidenceLog = {
      id: `EVD-${Date.now()}`,
      contractId: selectedPayment.contractId,
      orderId: selectedPayment.orderId,
      actorRole: currentRole,
      actorName: ACTOR_NAMES[currentRole] || "Người dùng",
      actionType: "payment_updated",
      title: `Cập nhật thanh toán ${selectedPayment.invoiceNo}`,
      description: `Đã nhận: ${fmtVND(amount)} / ${fmtVND(selectedPayment.invoiceAmount)}. Trạng thái: ${PAYMENT_STATUS_LABELS[newStatus]}`,
      createdAt: new Date().toISOString(),
    };
    setTimeout(() => {
      dispatch({
        type: "UPDATE_PAYMENT",
        payload: { paymentId: selectedPaymentId, paidAmount: amount, status: newStatus, evidence },
      });
      setLoading(false);
      onClose();
      setSuccessMsg(`Đã cập nhật thanh toán ${selectedPayment.invoiceNo}`);
    }, 700);
  }

  return (
    <div>
      <PageHeader
        title="Quản lý thanh toán"
        subtitle="Theo dõi hóa đơn và trạng thái thanh toán"
      />

      {successMsg && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-semibold text-emerald-700">{successMsg}</p>
        </div>
      )}

      {isNPPLogistics && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <span className="text-base leading-none">👤</span>
          <p className="text-sm text-amber-800">
            Vai trò <strong>Kho vận</strong> — Chỉ xem · Quản lý thanh toán thuộc phạm vi Tài chính
          </p>
        </div>
      )}
      {!isFinance && !isNPPLogistics && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-700">Chỉ vai trò <strong>Nhà phân phối - Tài chính</strong> mới có thể ghi nhận thanh toán.</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Tổng hóa đơn", value: fmtVND(totalInvoice), color: "text-[#10231C]" },
          { label: "Đã thu", value: fmtVND(totalPaid), color: "text-emerald-700" },
          { label: "Còn phải thu", value: fmtVND(totalOutstanding), color: "text-orange-700" },
        ].map((s) => (
          <Card key={s.label} className="border border-[#E4EAE7]">
            <CardBody className="p-5 text-center">
              <p className="text-xs text-[#6B7A73]">{s.label}</p>
              <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Payment records */}
      {payments.length === 0 ? (
        <Card className="border border-[#E4EAE7]">
          <CardBody className="p-8 text-center text-[#6B7A73]">
            Chưa có hóa đơn nào. Bệnh viện cần xác nhận nhận hàng để tạo hóa đơn.
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {payments.map((p) => {
            const paidP = pct(p.paidAmount, p.invoiceAmount);
            return (
              <Card key={p.id} className="border border-[#E4EAE7]">
                <CardBody className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-[#10231C]">{p.invoiceNo}</p>
                        <StatusChip
                          label={PAYMENT_STATUS_LABELS[p.status]}
                          color={PAYMENT_STATUS_COLORS[p.status]}
                        />
                      </div>
                      <p className="text-xs text-[#6B7A73]">
                        Đơn hàng: {p.orderId} · Xuất ngày: {fmtDate(p.invoiceDate)} · Đến hạn: {fmtDate(p.dueDate)}
                      </p>
                      {p.notes && <p className="text-xs text-[#6B7A73] mt-0.5">Ghi chú: {p.notes}</p>}

                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#6B7A73]">Tiến độ thanh toán</span>
                          <span className="font-semibold text-[#024430]">{paidP}%</span>
                        </div>
                        <Progress value={paidP} size="sm" />
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="bg-[#F6F8F7] rounded-lg p-3 text-center">
                          <p className="text-[10px] text-[#6B7A73]">Giá trị HĐ</p>
                          <p className="text-xs font-bold text-[#10231C]">{fmtVND(p.invoiceAmount)}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <p className="text-[10px] text-[#6B7A73]">Đã thu</p>
                          <p className="text-xs font-bold text-emerald-700">{fmtVND(p.paidAmount)}</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3 text-center">
                          <p className="text-[10px] text-[#6B7A73]">Còn lại</p>
                          <p className="text-xs font-bold text-orange-600">{fmtVND(p.outstandingAmount)}</p>
                        </div>
                      </div>
                    </div>

                    {canManage && (
                      <Button
                        size="sm"
                        className="bg-[#024430] text-white"
                        onPress={() => openUpdateModal(p.id)}
                        isDisabled={p.status === "paid"}
                      >
                        Ghi nhận thanh toán
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Update payment modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Ghi nhận thanh toán</ModalHeader>
          <ModalBody>
            <p className="text-sm text-[#6B7A73] mb-4">
              Hóa đơn: <strong>{selectedPayment?.invoiceNo}</strong> ·
              Tổng: <strong>{fmtVND(selectedPayment?.invoiceAmount || 0)}</strong>
            </p>
            <Input
              label="Tổng số tiền đã thu (VNĐ)"
              value={paidAmountInput}
              onChange={(e) => setPaidAmountInput(e.target.value)}
              type="number"
              placeholder="Nhập số tiền..."
            />
            <Select
              label="Trạng thái thanh toán"
              selectedKeys={[newStatus]}
              onChange={(e) => setNewStatus(e.target.value as PaymentStatus)}
              className="mt-3"
            >
              <SelectItem key="partially_paid" value="partially_paid">Thanh toán một phần</SelectItem>
              <SelectItem key="paid" value="paid">Đã thanh toán đầy đủ</SelectItem>
              <SelectItem key="overdue" value="overdue">Quá hạn</SelectItem>
            </Select>
            <div className="mt-4">
              <FileUpload
                label="Bằng chứng thanh toán"
                hint="Biên lai, ủy nhiệm chi, screenshot ngân hàng"
                accentColor="#024430"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Hủy</Button>
            <Button className="bg-[#024430] text-white" isLoading={loading} onPress={handleUpdate}>
              Lưu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
