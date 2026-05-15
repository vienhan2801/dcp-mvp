"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { fmtVND, fmtNum } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Button, Input } from "@/components/ui";
import Link from "next/link";

const ACCENT = "#1D4ED8";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

interface MockContract {
  id: string;
  code: string;
  name: string;
  supplier: string;
  items: { id: string; name: string; unit: string; unitPrice: number; remaining: number }[];
}

const CONTRACTS: MockContract[] = [
  {
    id: "CTR-2026-001",
    code: "CTR-2026-001",
    name: "HĐ cung ứng kháng sinh & giảm đau",
    supplier: "PhytoPharma",
    items: [
      { id: "ITEM-001", name: "Paracetamol 500mg", unit: "hộp", unitPrice: 35_000, remaining: 850 },
      { id: "ITEM-002", name: "Ibuprofen 400mg",   unit: "hộp", unitPrice: 48_000, remaining: 320 },
      { id: "ITEM-003", name: "Amoxicillin 500mg", unit: "hộp", unitPrice: 65_000, remaining: 120 },
      { id: "ITEM-007", name: "Azithromycin 250mg",unit: "hộp", unitPrice: 89_000, remaining: 95  },
      { id: "ITEM-008", name: "Omeprazole 20mg",   unit: "hộp", unitPrice: 42_000, remaining: 460 },
    ],
  },
  {
    id: "CTR-2026-002",
    code: "CTR-2026-002",
    name: "HĐ cung ứng tim mạch & tiểu đường",
    supplier: "MedPharma",
    items: [
      { id: "ITEM-004", name: "Metformin 500mg",   unit: "hộp", unitPrice: 28_000, remaining: 540 },
      { id: "ITEM-005", name: "Amlodipine 5mg",    unit: "hộp", unitPrice: 55_000, remaining: 200 },
      { id: "ITEM-006", name: "Atorvastatin 20mg", unit: "hộp", unitPrice: 72_000, remaining: 180 },
    ],
  },
];

type Step = 1 | 2 | 3 | 4;
const STEPS = ["Chọn hợp đồng", "Chọn thuốc", "Số lượng", "Xác nhận"];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                isActive || isDone ? "text-white border-[#1D4ED8]" : "bg-white border-[#E4EAE7] text-[#6B7A73]"
              }`} style={isActive || isDone ? { backgroundColor: ACCENT, borderColor: ACCENT } : {}}>
                {isDone ? "✓" : stepNum}
              </div>
              <span className={`text-xs mt-1 font-medium whitespace-nowrap ${isActive ? "text-[#1D4ED8]" : "text-[#6B7A73]"}`}>
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 w-10 mx-1 mb-4 ${stepNum < current ? "bg-[#1D4ED8]" : "bg-[#E4EAE7]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CustomerNewOrderPage() {
  const { dispatch } = useApp();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("Kho dược phẩm, Tòa nhà A, 215 Hồng Bàng, Q.5, TP.HCM");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");

  const selectedContract = CONTRACTS.find((c) => c.id === selectedContractId) ?? null;

  const total = useMemo(() => {
    if (!selectedContract) return 0;
    return selectedContract.items
      .filter((i) => selectedItems.has(i.id))
      .reduce((s, i) => s + (quantities[i.id] ?? 1) * i.unitPrice, 0);
  }, [selectedContract, selectedItems, quantities]);

  function toggleItem(id: string) {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        if (!quantities[id]) setQuantities((q) => ({ ...q, [id]: 1 }));
      }
      return next;
    });
  }

  function handleSubmit() {
    const orderId = generateId("ORD");
    dispatch({
      type: "CREATE_ORDER",
      payload: {
        order: {
          id: orderId,
          contractId: selectedContractId!,
          hospitalName: "Khách hàng",
          supplierName: selectedContract?.supplier ?? "",
          orderDate: todayStr(),
          requestedDeliveryDate: deliveryDate,
          deliveryLocation,
          note,
          status: "pending_confirmation",
          totalRequestedAmount: total,
          totalConfirmedAmount: 0,
          lines: (selectedContract?.items ?? [])
            .filter((i) => selectedItems.has(i.id))
            .map((i) => ({
              id: generateId("LINE"),
              contractItemId: i.id,
              productName: i.name,
              productCode: i.id,
              unit: i.unit,
              unitPrice: i.unitPrice,
              requestedQty: quantities[i.id] ?? 1,
              confirmedQty: 0,
              rejectedQty: 0,
              deliveredQty: 0,
              lineAmount: (quantities[i.id] ?? 1) * i.unitPrice,
              status: "pending_confirmation" as const,
              fulfillmentRecords: [],
              supplierNote: "",
            })),
        } as any,
        evidence: {
          id: generateId("EVD"),
          contractId: selectedContractId!,
          orderId,
          actorRole: "customer_buyer" as const,
          actorName: "Người dùng",
          actionType: "order_created" as const,
          title: `Tạo đơn hàng mới ${orderId}`,
          description: `Đơn hàng ${orderId} được tạo với ${selectedItems.size} loại thuốc.`,
          createdAt: new Date().toISOString(),
        },
      },
    });
    setSubmittedId(orderId);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-100">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: ACCENT }}>Đơn hàng đã được gửi!</h2>
          <p className="text-[#6B7A73] mb-2">Nhà cung cấp sẽ xác nhận trong vòng 1–2 ngày làm việc.</p>
          <div className="inline-block bg-[#F6F8F7] border border-[#E4EAE7] rounded-xl px-6 py-3 mb-6">
            <p className="text-xs text-[#6B7A73]">Mã đơn hàng</p>
            <p className="text-lg font-bold text-[#10231C]">{submittedId}</p>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button className="text-white font-bold px-6 py-5 text-base rounded-xl bg-blue-700"
              onClick={() => router.push(`/customer/orders/${submittedId}`)}>
              Xem đơn hàng
            </Button>
            <Button variant="bordered"
              className="border-[#E4EAE7] text-[#10231C] font-bold px-6 py-5 text-base rounded-xl"
              onClick={() => router.push("/customer/orders")}>
              Danh sách đơn hàng
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => router.push("/customer/orders")}
        className="flex items-center gap-2 text-sm text-[#6B7A73] hover:text-[#10231C] mb-6 transition-colors">
        ← Quay lại danh sách đơn hàng
      </button>

      <h1 className="text-2xl font-bold text-[#10231C] mb-6">Tạo đơn hàng mới</h1>
      <StepIndicator current={step} />

      <div className="bg-white rounded-2xl border border-[#E4EAE7] p-6 shadow-sm">
        {/* Step 1: Contract */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-[#10231C] mb-1">Chọn hợp đồng</h2>
            <p className="text-sm text-[#6B7A73] mb-6">Mỗi đơn hàng chỉ được đặt theo một hợp đồng.</p>
            <div className="flex flex-col gap-4 mb-6">
              {CONTRACTS.map((c) => {
                const isSelected = selectedContractId === c.id;
                return (
                  <button key={c.id} onClick={() => setSelectedContractId(c.id)}
                    className={`w-full text-left rounded-2xl border-2 p-5 transition-all focus:outline-none ${
                      isSelected ? "border-[#1D4ED8] bg-[#EFF6FF]" : "border-[#E4EAE7] bg-white hover:border-[#1D4ED8]/40"
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold text-[#6B7A73] uppercase">{c.code}</p>
                        <p className="font-bold text-[#10231C] text-sm mt-0.5">{c.name}</p>
                        <p className="text-xs text-[#6B7A73] mt-1">NPP: {c.supplier} · {c.items.length} loại thuốc</p>
                      </div>
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                        isSelected ? "text-white border-[#1D4ED8]" : "border-[#E4EAE7] text-transparent"
                      }`} style={isSelected ? { backgroundColor: ACCENT, borderColor: ACCENT } : {}}>
                        ✓
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {c.items.map((i) => (
                        <span key={i.id} className="text-xs px-2 py-0.5 rounded-full bg-[#F6F8F7] text-[#10231C]">
                          {i.name}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end">
              <Button className="text-white font-bold px-8 py-6 text-base rounded-xl disabled:opacity-40 bg-blue-700"
                isDisabled={selectedContractId === null}
                onClick={() => setStep(2)}>
                Tiếp theo →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Drug picker */}
        {step === 2 && selectedContract && (
          <div>
            <div className="mb-4 flex items-start gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-3">
              <span className="flex-shrink-0 mt-0.5" style={{ color: ACCENT }}>ℹ️</span>
              <p className="text-sm" style={{ color: ACCENT }}>
                Đang đặt theo <strong>{selectedContract.code}</strong> — {selectedContract.name}
              </p>
            </div>
            <h2 className="text-xl font-bold text-[#10231C] mb-1">Chọn thuốc</h2>
            <p className="text-sm text-[#6B7A73] mb-4">Nhấn vào thuốc để chọn. Nhấn lại để bỏ chọn.</p>
            <div className="flex flex-col gap-3 mb-6">
              {selectedContract.items.map((item) => {
                const isSelected = selectedItems.has(item.id);
                return (
                  <button key={item.id} onClick={() => toggleItem(item.id)}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all focus:outline-none ${
                      isSelected ? "border-[#1D4ED8] bg-[#EFF6FF]" : "border-[#E4EAE7] bg-white hover:border-[#1D4ED8]/40"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#10231C] text-base">{item.name}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs bg-[#F6F8F7] text-[#10231C] px-2 py-1 rounded-lg">
                            Còn lại: {fmtNum(item.remaining)} {item.unit}
                          </span>
                          <span className="text-sm font-bold" style={{ color: ACCENT }}>
                            {fmtVND(item.unitPrice)}/{item.unit}
                          </span>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all flex-shrink-0 ${
                        isSelected ? "text-white" : "border-[#E4EAE7] text-[#6B7A73]"
                      }`} style={isSelected ? { backgroundColor: ACCENT, borderColor: ACCENT } : {}}>
                        {isSelected ? "−" : "+"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between">
              <Button variant="bordered" className="border-[#E4EAE7] text-[#6B7A73] font-bold px-6 py-6 text-base rounded-xl"
                onClick={() => setStep(1)}>← Quay lại</Button>
              <Button className="text-white font-bold px-8 py-6 text-base rounded-xl disabled:opacity-40 bg-blue-700"
                isDisabled={selectedItems.size === 0}
                onClick={() => setStep(3)}>Tiếp theo →</Button>
            </div>
          </div>
        )}

        {/* Step 3: Quantity + delivery */}
        {step === 3 && selectedContract && (
          <div>
            <h2 className="text-xl font-bold text-[#10231C] mb-1">Nhập số lượng & giao hàng</h2>
            <p className="text-sm text-[#6B7A73] mb-4">Nhập số lượng và thông tin giao hàng.</p>

            <div className="flex flex-col gap-3 mb-5">
              {selectedContract.items.filter((i) => selectedItems.has(i.id)).map((item) => {
                const qty = quantities[item.id] ?? 1;
                const subtotal = qty * item.unitPrice;
                return (
                  <Card key={item.id} className="border border-[#E4EAE7]">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#10231C]">{item.name}</p>
                          <p className="text-xs text-[#6B7A73] mt-0.5">{fmtVND(item.unitPrice)}/{item.unit}</p>
                          <div className="flex items-center border-2 border-[#E4EAE7] rounded-xl overflow-hidden mt-2 w-fit">
                            <button onClick={() => setQuantities((q) => ({ ...q, [item.id]: Math.max(1, qty - 1) }))}
                              className="w-10 h-10 flex items-center justify-center text-xl font-bold text-[#10231C] hover:bg-[#F6F8F7]">−</button>
                            <input type="number" min={1} max={item.remaining} value={qty}
                              onChange={(e) => setQuantities((q) => ({ ...q, [item.id]: parseInt(e.target.value) || 1 }))}
                              className="w-20 text-center text-base font-bold text-[#10231C] border-x-2 border-[#E4EAE7] h-10 focus:outline-none" />
                            <button onClick={() => setQuantities((q) => ({ ...q, [item.id]: Math.min(item.remaining, qty + 1) }))}
                              className="w-10 h-10 flex items-center justify-center text-xl font-bold text-[#10231C] hover:bg-[#F6F8F7]">+</button>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-[#6B7A73]">Thành tiền</p>
                          <p className="text-base font-bold" style={{ color: ACCENT }}>{fmtVND(subtotal)}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            {/* Total */}
            <div className="rounded-2xl p-4 mb-5 flex items-center justify-between text-white bg-blue-700">
              <div>
                <p className="text-sm opacity-80">Tổng giá trị</p>
                <p className="text-2xl font-bold">{fmtVND(total)}</p>
              </div>
              <div className="text-right opacity-80 text-sm">
                <p>{selectedItems.size} loại thuốc</p>
              </div>
            </div>

            {/* Delivery info */}
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-[#10231C] mb-2">
                  Ngày giao hàng yêu cầu <span className="text-red-500">*</span>
                </label>
                <input type="date" min={todayStr()} value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#E4EAE7] bg-white text-base text-[#10231C] focus:outline-none focus:border-[#1D4ED8] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#10231C] mb-2">
                  Địa điểm giao hàng <span className="text-red-500">*</span>
                </label>
                <Input value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="Nhập địa điểm giao hàng..."
                  classNames={{ inputWrapper: "border-2 border-[#E4EAE7] bg-white rounded-xl h-12", input: "text-base text-[#10231C]" }} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#10231C] mb-2">
                  Ghi chú <span className="text-[#6B7A73] font-normal">(tùy chọn)</span>
                </label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú thêm cho nhà cung cấp..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#E4EAE7] bg-white text-sm text-[#10231C] focus:outline-none focus:border-[#1D4ED8] transition-colors resize-none" />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="bordered" className="border-[#E4EAE7] text-[#6B7A73] font-bold px-6 py-6 text-base rounded-xl"
                onClick={() => setStep(2)}>← Quay lại</Button>
              <Button className="text-white font-bold px-8 py-6 text-base rounded-xl disabled:opacity-40 bg-blue-700"
                isDisabled={!deliveryDate || !deliveryLocation.trim()}
                onClick={() => setStep(4)}>Xem lại →</Button>
            </div>
          </div>
        )}

        {/* Step 4: Review + submit */}
        {step === 4 && selectedContract && (
          <div>
            <h2 className="text-xl font-bold text-[#10231C] mb-1">Xem lại & Gửi đơn hàng</h2>
            <p className="text-sm text-[#6B7A73] mb-4">Kiểm tra thông tin trước khi gửi.</p>

            {/* Summary */}
            <Card className="border border-[#E4EAE7] mb-4">
              <CardBody className="p-4">
                <p className="text-xs font-semibold text-[#6B7A73] uppercase tracking-wide mb-3">Thông tin đơn hàng</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-[#6B7A73] text-xs">Hợp đồng</p><p className="font-semibold">{selectedContract.code}</p></div>
                  <div><p className="text-[#6B7A73] text-xs">Nhà cung cấp</p><p className="font-semibold">{selectedContract.supplier}</p></div>
                  <div><p className="text-[#6B7A73] text-xs">Ngày giao yêu cầu</p><p className="font-semibold" style={{ color: ACCENT }}>{deliveryDate}</p></div>
                  <div><p className="text-[#6B7A73] text-xs">Địa điểm</p><p className="font-semibold">{deliveryLocation}</p></div>
                  {note && <div className="col-span-2"><p className="text-[#6B7A73] text-xs">Ghi chú</p><p>{note}</p></div>}
                </div>
              </CardBody>
            </Card>

            <Card className="border border-[#E4EAE7] mb-4">
              <CardBody className="p-4">
                <p className="text-xs font-semibold text-[#6B7A73] uppercase tracking-wide mb-3">
                  Danh sách thuốc ({selectedItems.size} loại)
                </p>
                <div className="flex flex-col gap-3">
                  {selectedContract.items.filter((i) => selectedItems.has(i.id)).map((item, idx) => {
                    const qty = quantities[item.id] ?? 1;
                    return (
                      <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-[#E4EAE7] last:border-0 last:pb-0">
                        <span className="text-sm text-[#6B7A73] w-5">{idx + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#10231C] text-sm">{item.name}</p>
                          <p className="text-xs text-[#6B7A73]">{fmtNum(qty)} {item.unit} × {fmtVND(item.unitPrice)}</p>
                        </div>
                        <p className="font-bold text-sm flex-shrink-0" style={{ color: ACCENT }}>{fmtVND(qty * item.unitPrice)}</p>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            <div className="rounded-2xl p-4 mb-6 flex items-center justify-between text-white bg-blue-700">
              <p className="font-semibold text-lg">Tổng cộng</p>
              <p className="text-2xl font-bold">{fmtVND(total)}</p>
            </div>

            <div className="flex justify-between">
              <Button variant="bordered" className="border-[#E4EAE7] text-[#6B7A73] font-bold px-6 py-6 text-base rounded-xl"
                onClick={() => setStep(3)}>← Quay lại</Button>
              <Button className="text-white font-bold px-8 py-6 text-base rounded-xl bg-blue-700"
                onClick={handleSubmit}>
                Gửi đơn hàng
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
