"use client";
import { use, useState } from "react";
import { useApp } from "@/lib/store";
import { fmtVND, fmtDate, fmtNum } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import {
  Card, CardBody, Button, Input, Textarea, Divider,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
} from "@/components/ui";
import { ALLOCATION_STATUS_LABELS, ALLOCATION_STATUS_COLORS } from "@/lib/constants";
import { Order, OrderLine } from "@/domain/models/order";
import { EvidenceLog } from "@/domain/models/evidence";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";

const ACTOR_NAMES: Record<string, string> = {
  hospital_buyer: "Nguyễn Thị Hương",
  supplier_admin: "Trần Văn Minh",
};

export default function HospitalContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { contract, currentRole } = state;

  const [requestedQtys, setRequestedQtys] = useState<Record<string, number>>({});
  const [deliveryDate, setDeliveryDate] = useState("");
  const [note, setNote] = useState("");
  const deliveryLocation = "Kho dược phẩm tầng 1, Tòa nhà A, 215 Hồng Bàng, Q.5, TP.HCM";
  const [formError, setFormError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (contract.id !== id) {
    return <div className="p-8 text-center text-[#6B7A73]">Không tìm thấy hợp đồng</div>;
  }

  const isHospitalBuyer = currentRole === "hospital_buyer";

  const getQty = (itemId: string) => requestedQtys[itemId] ?? 0;

  const totalAmount = contract.items.reduce((sum, item) => {
    return sum + getQty(item.id) * item.unitPrice;
  }, 0);

  const hasAnyQty = contract.items.some((item) => getQty(item.id) > 0);

  // Validation per item
  const errors: Record<string, string> = {};
  for (const item of contract.items) {
    const qty = getQty(item.id);
    if (qty > 0 && qty > item.remainingQty) {
      errors[item.id] = `Tối đa ${fmtNum(item.remainingQty)} ${item.unit}`;
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  function validateAndOpen() {
    if (!hasAnyQty) { setFormError("Vui lòng nhập số lượng cho ít nhất một loại thuốc."); return; }
    if (!deliveryDate) { setFormError("Vui lòng chọn ngày giao hàng yêu cầu."); return; }
    if (hasErrors) { setFormError("Số lượng đặt vượt quá hạn mức còn lại."); return; }
    setFormError("");
    onOpen();
  }

  function submitOrder() {
    setSubmitLoading(true);
    const orderId = `ORD-${Date.now()}`;
    const today = new Date().toISOString().split("T")[0];

    const lines: OrderLine[] = contract.items
      .filter((item) => getQty(item.id) > 0)
      .map((item) => {
        const qty = getQty(item.id);
        return {
          id: `LINE-${Date.now()}-${item.id}`,
          contractItemId: item.id,
          productName: item.productName,
          productCode: item.productCode,
          unit: item.unit,
          unitPrice: item.unitPrice,
          requestedQty: qty,
          confirmedQty: 0,
          rejectedQty: 0,
          deliveredQty: 0,
          lineAmount: qty * item.unitPrice,
          status: "pending_confirmation" as const,
          fulfillmentRecords: [],
        };
      });

    const order: Order = {
      id: orderId,
      contractId: contract.id,
      hospitalName: contract.hospitalName,
      supplierName: contract.supplierName,
      orderDate: today,
      requestedDeliveryDate: deliveryDate,
      deliveryLocation,
      note: note || undefined,
      status: "pending_confirmation",
      totalRequestedAmount: totalAmount,
      totalConfirmedAmount: 0,
      lines,
    };

    const evidence: EvidenceLog = {
      id: `EVD-${Date.now()}`,
      contractId: contract.id,
      orderId,
      actorRole: currentRole,
      actorName: ACTOR_NAMES[currentRole] || "Người dùng",
      actionType: "order_created",
      title: `Đơn hàng ${orderId} được tạo`,
      description: `Bệnh viện tạo đơn đặt hàng gồm ${lines.length} loại thuốc, tổng giá trị yêu cầu: ${fmtVND(totalAmount)}`,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      dispatch({ type: "CREATE_ORDER", payload: { order, evidence } });
      setSubmitLoading(false);
      setSubmitted(true);
      onClose();
      setTimeout(() => router.push("/hospital/orders"), 1000);
    }, 800);
  }

  return (
    <div>
      <PageHeader
        title={contract.contractName}
        subtitle={`${contract.contractCode} · NPP: ${contract.supplierName}`}
        actions={<StatusChip label="Đang hoạt động" color="success" size="md" />}
      />

      {submitted && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-semibold text-emerald-700">Đơn hàng đã được gửi! Đang chuyển hướng...</p>
        </div>
      )}

      {/* Info banner */}
      {isHospitalBuyer && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-800">Tạo đơn hàng mới từ hợp đồng này</p>
            <p className="text-xs text-blue-700 mt-0.5">Số lượng đặt không được vượt quá hạn mức còn lại của từng loại thuốc.</p>
          </div>
        </div>
      )}

      {!isHospitalBuyer && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">Chỉ vai trò <strong>Bệnh viện - Mua hàng</strong> mới có thể tạo đơn hàng.</p>
        </div>
      )}

      {/* Contract summary */}
      <Card className="mb-6 border border-[#E4EAE7]">
        <CardBody className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Tổng giá trị HĐ", value: fmtVND(contract.totalContractValue), highlight: true },
              { label: "Giá trị còn lại", value: fmtVND(contract.remainingValue), highlight: true },
              { label: "Hiệu lực đến", value: fmtDate(contract.endDate), highlight: false },
              { label: "Điều khoản TT", value: contract.paymentTerm, highlight: false },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 bg-[#F6F8F7] rounded-lg">
                <p className="text-xs text-[#6B7A73]">{s.label}</p>
                <p className={`text-sm font-bold mt-0.5 ${s.highlight ? "text-[#024430]" : "text-[#10231C]"}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items table */}
        <div className="lg:col-span-2">
          <Card className="border border-[#E4EAE7]">
            <CardBody className="p-5">
              <h3 className="font-semibold text-[#10231C] mb-4">Danh mục thuốc trong hợp đồng</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F6F8F7] text-[#6B7A73] text-xs">
                      <th className="text-left p-3 rounded-tl-lg">Tên thuốc</th>
                      <th className="text-center p-3">ĐVT</th>
                      <th className="text-right p-3">Đơn giá</th>
                      <th className="text-right p-3">Hợp đồng</th>
                      <th className="text-right p-3">Đã YC</th>
                      <th className="text-right p-3">Còn lại</th>
                      {isHospitalBuyer && <th className="text-center p-3">Số lượng đặt</th>}
                      {isHospitalBuyer && <th className="text-right p-3 rounded-tr-lg">Thành tiền</th>}
                      {!isHospitalBuyer && <th className="text-center p-3 rounded-tr-lg">Trạng thái</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {contract.items.map((item) => {
                      const qty = getQty(item.id);
                      const lineAmount = qty * item.unitPrice;
                      const itemError = errors[item.id];
                      const canOrder = item.remainingQty > 0;
                      return (
                        <tr key={item.id} className="border-t border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors">
                          <td className="p-3">
                            <p className="font-semibold text-[#10231C]">{item.productName}</p>
                            <p className="text-xs text-[#6B7A73]">{item.activeIngredient} · {item.dosageForm}</p>
                            <p className="text-xs text-[#6B7A73]">{item.specification}</p>
                            <p className="text-xs text-[#6B7A73]">HSD: {fmtDate(item.expiryDate)}</p>
                          </td>
                          <td className="p-3 text-center text-[#6B7A73]">{item.unit}</td>
                          <td className="p-3 text-right">{fmtVND(item.unitPrice)}</td>
                          <td className="p-3 text-right font-medium">{fmtNum(item.contractedQty)}</td>
                          <td className="p-3 text-right">{fmtNum(item.requestedQty)}</td>
                          <td className="p-3 text-right font-bold text-[#024430]">{fmtNum(item.remainingQty)}</td>
                          {isHospitalBuyer && (
                            <td className="p-3 text-center">
                              <div>
                                <input
                                  type="number"
                                  value={qty || ""}
                                  min={0}
                                  max={item.remainingQty}
                                  disabled={!canOrder}
                                  onChange={(e) => {
                                    const v = Math.max(0, Number(e.target.value));
                                    setRequestedQtys((prev) => ({ ...prev, [item.id]: v }));
                                  }}
                                  placeholder="0"
                                  className={`w-24 text-center border rounded-lg px-2 py-1 text-sm outline-none transition-colors ${
                                    itemError
                                      ? "border-red-400 bg-red-50 text-red-800"
                                      : qty > 0
                                      ? "border-[#024430] bg-[#024430]/5"
                                      : "border-[#E4EAE7] bg-[#F6F8F7]"
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                />
                                {itemError && <p className="text-[10px] text-red-600 mt-0.5">{itemError}</p>}
                                {!canOrder && <p className="text-[10px] text-[#6B7A73] mt-0.5">Hết hạn mức</p>}
                              </div>
                            </td>
                          )}
                          {isHospitalBuyer && (
                            <td className="p-3 text-right font-semibold text-[#024430]">
                              {qty > 0 ? fmtVND(lineAmount) : "—"}
                            </td>
                          )}
                          {!isHospitalBuyer && (
                            <td className="p-3 text-center">
                              <StatusChip
                                label={ALLOCATION_STATUS_LABELS[item.status]}
                                color={ALLOCATION_STATUS_COLORS[item.status]}
                              />
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Order form */}
        {isHospitalBuyer && (
          <div>
            <Card className="border border-[#E4EAE7] sticky top-6">
              <CardBody className="p-5">
                <h3 className="font-semibold text-[#10231C] mb-4">Thông tin đơn hàng</h3>

                <div className="flex flex-col gap-3 mb-4">
                  <Input
                    label="Ngày giao hàng yêu cầu *"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    max={contract.endDate}
                    size="sm"
                  />
                  <div>
                    <label className="text-xs font-medium text-[#6B7A73]">Địa điểm giao hàng</label>
                    <div className="mt-1 p-3 bg-[#F6F8F7] border border-[#E4EAE7] rounded-xl text-xs text-[#10231C]">
                      {deliveryLocation}
                    </div>
                  </div>
                  <Textarea
                    label="Ghi chú cho nhà cung cấp"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Ưu tiên giao trước giờ hành chính..."
                    minRows={2}
                  />
                </div>

                <Divider className="mb-4" />

                {/* Running total */}
                <div className="mb-4">
                  <p className="text-xs text-[#6B7A73] mb-2">Tóm tắt đơn hàng</p>
                  {contract.items.filter((item) => getQty(item.id) > 0).map((item) => (
                    <div key={item.id} className="flex justify-between text-xs py-1 border-b border-[#E4EAE7] last:border-0">
                      <span className="text-[#10231C] truncate flex-1 pr-2">{item.productName}</span>
                      <span className="text-[#6B7A73] flex-shrink-0">{fmtNum(getQty(item.id))} × {fmtVND(item.unitPrice)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-semibold text-[#10231C]">Tổng cộng</span>
                    <span className="font-bold text-[#024430] text-lg">{fmtVND(totalAmount)}</span>
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-red-600 mb-3">{formError}</p>
                )}

                <Button
                  className="w-full bg-[#024430] text-white font-semibold"
                  size="lg"
                  onPress={validateAndOpen}
                  isDisabled={!hasAnyQty || hasErrors}
                >
                  Tạo đơn hàng
                </Button>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* Contract documents */}
      <Card className="mt-6 border border-[#E4EAE7]">
        <CardBody className="p-5">
          <h3 className="font-semibold text-[#10231C] mb-4">Tài liệu hợp đồng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUpload
              label="Upload file hợp đồng"
              accept=".pdf,.doc,.docx"
              maxFiles={3}
              hint="File PDF hoặc Word"
              accentColor="#1D4ED8"
            />
            <FileUpload
              label="Biên bản nghiệm thu"
              accept="image/*,application/pdf"
              maxFiles={3}
              accentColor="#1D4ED8"
            />
          </div>
        </CardBody>
      </Card>

      {/* Confirmation modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>Xác nhận tạo đơn hàng</ModalHeader>
          <ModalBody>
            <p className="text-sm text-[#6B7A73] mb-4">Vui lòng kiểm tra lại thông tin trước khi gửi.</p>
            <div className="bg-[#F6F8F7] rounded-xl p-4 mb-4">
              {[
                { label: "Bệnh viện", value: contract.hospitalName },
                { label: "Nhà cung cấp", value: contract.supplierName },
                { label: "Ngày giao yêu cầu", value: fmtDate(deliveryDate) },
                { label: "Địa điểm", value: deliveryLocation },
              ].map((r) => (
                <div key={r.label} className="flex gap-2 text-sm py-1">
                  <span className="text-[#6B7A73] w-40 shrink-0">{r.label}:</span>
                  <span className="font-medium text-[#10231C]">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {contract.items.filter((item) => getQty(item.id) > 0).map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-[#E4EAE7]">
                  <div>
                    <p className="font-medium text-[#10231C]">{item.productName}</p>
                    <p className="text-xs text-[#6B7A73]">
                      {fmtNum(getQty(item.id))} {item.unit} × {fmtVND(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-bold text-[#024430]">{fmtVND(getQty(item.id) * item.unitPrice)}</p>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-[#10231C]">Tổng cộng</span>
                <span className="text-xl font-black text-[#024430]">{fmtVND(totalAmount)}</span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>Quay lại</Button>
            <Button className="bg-[#024430] text-white font-semibold" isLoading={submitLoading} onPress={submitOrder}>
              Xác nhận & Gửi đơn hàng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
