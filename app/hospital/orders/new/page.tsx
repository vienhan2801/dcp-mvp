"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { fmtVND, fmtNum, fmtDate } from "@/lib/format";
import { Order, OrderLine } from "@/domain/models/order";
import { EvidenceLog } from "@/domain/models/evidence";
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
} from "@/components/ui";
import { Contract, ContractItem } from "@/domain/models/contract";
import { mockContract2 } from "@/domain/mock/contracts";

// ─── Types ────────────────────────────────────────────────
interface SelectedLine {
  contractItemId: string;
  requestedQty: number;
}

// ─── Helpers ──────────────────────────────────────────────
function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Returns the set of productCodes that appear in BOTH contracts. */
function computeOverlappingCodes(c1: Contract, c2: Contract): Set<string> {
  const codes1 = new Set(c1.items.map((i) => i.productCode));
  return new Set(c2.items.filter((i) => codes1.has(i.productCode)).map((i) => i.productCode));
}

// ─── Step indicator ───────────────────────────────────────
const STEPS = ["Chọn hợp đồng", "Chọn thuốc", "Số lượng", "Giao hàng", "Xác nhận"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 no-print">
      {STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  isActive
                    ? "bg-[#024430] border-[#024430] text-white"
                    : isDone
                    ? "bg-[#024430] border-[#024430] text-white opacity-60"
                    : "bg-white border-[#E4EAE7] text-[#6B7A73]"
                }`}
              >
                {isDone ? "✓" : stepNum}
              </div>
              <span
                className={`text-xs mt-1 font-medium whitespace-nowrap ${
                  isActive ? "text-[#024430]" : "text-[#6B7A73]"
                }`}
              >
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-10 mx-1 mb-4 ${
                  stepNum < current ? "bg-[#024430]" : "bg-[#E4EAE7]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Drug image helper ────────────────────────────────────
function DrugImage({
  productName,
  drugMasters,
  className = "w-16 h-16 object-cover rounded-xl",
}: {
  productName: string;
  drugMasters: { drugName: string; images: string[] }[];
  className?: string;
}) {
  const master = drugMasters.find(
    (d) => d.drugName.toLowerCase() === productName.toLowerCase()
  );
  const src = master?.images?.[0];
  if (!src) {
    return (
      <div
        className={`bg-[#E4EAE7] flex items-center justify-center text-[#6B7A73] text-xs rounded-xl ${className}`}
        style={{ minWidth: 64, minHeight: 64 }}
      >
        Thuốc
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={productName} className={className} />
  );
}

// ─── Step 0: Contract Picker ──────────────────────────────
function Step0ContractPicker({
  contracts,
  selectedContractId,
  onSelect,
  onNext,
}: {
  contracts: Contract[];
  selectedContractId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  // Pre-compute overlapping productCodes between the two contracts
  const overlappingCodes = useMemo(() => {
    if (contracts.length < 2) return new Set<string>();
    return computeOverlappingCodes(contracts[0], contracts[1]);
  }, [contracts]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#10231C]">Chọn hợp đồng</h2>
        <p className="text-sm text-[#6B7A73] mt-0.5">
          Mỗi đơn hàng chỉ được đặt theo một hợp đồng. Chọn hợp đồng muốn sử dụng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {contracts.map((contract) => {
          const isSelected = selectedContractId === contract.id;
          const usedPct = contract.totalContractValue > 0
            ? Math.round(((contract.totalContractValue - contract.remainingValue) / contract.totalContractValue) * 100)
            : 0;
          const overlappingItems = contract.items.filter((i) => overlappingCodes.has(i.productCode));
          const otherContract = contracts.find((c) => c.id !== contract.id);

          return (
            <button
              key={contract.id}
              onClick={() => onSelect(contract.id)}
              className={`w-full text-left transition-all rounded-2xl border-2 p-5 focus:outline-none ${
                isSelected
                  ? "border-[#1D4ED8] bg-[#EFF6FF]"
                  : "border-[#E4EAE7] bg-white hover:border-[#1D4ED8]/40"
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-xs font-bold text-[#6B7A73] uppercase tracking-wide">
                    {contract.contractCode}
                  </p>
                  <p className="font-bold text-[#10231C] text-sm leading-snug mt-0.5">
                    {contract.contractName}
                  </p>
                </div>
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                    isSelected
                      ? "border-[#1D4ED8] bg-[#1D4ED8] text-white"
                      : "border-[#E4EAE7] text-transparent"
                  }`}
                >
                  ✓
                </div>
              </div>

              {/* Supplier + dates */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B7A73] mb-3">
                <span>🏭 {contract.supplierName}</span>
                <span>📅 {fmtDate(contract.startDate)} – {fmtDate(contract.endDate)}</span>
              </div>

              {/* Value + progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#6B7A73]">Giá trị còn lại</span>
                  <span className="font-semibold text-[#10231C]">
                    {fmtVND(contract.remainingValue)} / {fmtVND(contract.totalContractValue)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#E4EAE7] overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-[#1D4ED8] transition-all"
                    style={{ width: `${usedPct}%` }}
                  />
                </div>
                <p className="text-xs text-[#6B7A73] mt-0.5">{usedPct}% đã sử dụng</p>
              </div>

              {/* Drug chips */}
              <div className="flex flex-wrap gap-1.5">
                {contract.items.map((item) => {
                  const isOverlapping = overlappingCodes.has(item.productCode);
                  const otherItem = otherContract?.items.find(
                    (oi) => oi.productCode === item.productCode
                  );
                  return (
                    <span
                      key={item.id}
                      title={
                        isOverlapping && otherItem
                          ? `Cũng có trong ${otherContract?.contractCode} · giá: ${fmtVND(otherItem.unitPrice)}/${otherItem.unit}`
                          : item.productName
                      }
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        isOverlapping
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-[#F6F8F7] text-[#10231C]"
                      }`}
                    >
                      {isOverlapping && <span>⚠️</span>}
                      {item.productName}
                    </span>
                  );
                })}
              </div>

              {/* Overlap warning */}
              {overlappingItems.length > 0 && (
                <div className="mt-3 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <span className="text-amber-500 flex-shrink-0">⚠️</span>
                  <p className="text-xs text-amber-800">
                    {overlappingItems.length} thuốc trùng với HĐ khác — giá có thể khác
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end no-print">
        <Button
          className="bg-[#024430] text-white font-bold px-8 py-6 text-base rounded-xl disabled:opacity-40"
          isDisabled={selectedContractId === null}
          onClick={onNext}
        >
          Tiếp theo →
        </Button>
      </div>
    </div>
  );
}

// ─── Step 1: Drug Picker ──────────────────────────────────
function Step1DrugPicker({
  items,
  selected,
  onToggle,
  drugMasters,
  selectedContract,
  otherContract,
  overlappingCodes,
  onNext,
}: {
  items: ContractItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  drugMasters: { drugName: string; images: string[] }[];
  selectedContract: Contract;
  otherContract: Contract | null;
  overlappingCodes: Set<string>;
  onNext: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        item.productName.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  return (
    <div>
      {/* Active contract banner */}
      <div className="mb-4 flex items-start gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-3">
        <span className="text-[#1D4ED8] flex-shrink-0 mt-0.5">ℹ️</span>
        <p className="text-sm text-[#1D4ED8]">
          Đang đặt hàng theo <strong>{selectedContract.contractCode}</strong> —{" "}
          {selectedContract.contractName}. Giá và số lượng tối đa theo hợp đồng này.
        </p>
      </div>

      <div className="flex items-center justify-between mb-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-[#10231C]">Chọn thuốc cần đặt</h2>
          <p className="text-sm text-[#6B7A73] mt-0.5">
            Nhấn vào thuốc để chọn. Nhấn lại để bỏ chọn.
          </p>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 bg-[#024430] text-white text-sm font-bold px-4 py-2 rounded-full">
            <span>✓</span>
            <span>{selected.size} thuốc đã chọn</span>
          </div>
        )}
      </div>

      <div className="mb-4 no-print">
        <Input
          placeholder="Tìm theo tên thuốc..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startContent={
            <span className="text-[#6B7A73] text-sm">🔍</span>
          }
          classNames={{
            inputWrapper: "bg-white border border-[#E4EAE7] rounded-xl h-12",
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        {filtered.map((item) => {
          const isSelected = selected.has(item.id);
          const isOverlapping = overlappingCodes.has(item.productCode);
          const otherItem = otherContract?.items.find(
            (oi) => oi.productCode === item.productCode
          ) ?? null;
          const otherIsCheaper = otherItem !== null && otherItem.unitPrice < item.unitPrice;

          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`w-full text-left transition-all rounded-2xl border-2 p-4 focus:outline-none ${
                isSelected
                  ? "border-[#024430] bg-green-50"
                  : "border-[#E4EAE7] bg-white hover:border-[#024430]/40"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <DrugImage
                    productName={item.productName}
                    drugMasters={drugMasters}
                    className="w-16 h-16 object-cover rounded-xl"
                  />
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#024430] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      ✓
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-[#10231C] text-base leading-tight">
                      {item.productName}
                    </p>
                    {isOverlapping && otherItem && otherContract && (
                      <span className="text-xs text-[#6B7A73]">
                        · Cũng có trong {otherContract.contractCode}{" "}
                        <span className={otherIsCheaper ? "text-green-700 font-semibold" : "text-[#6B7A73]"}>
                          {fmtVND(otherItem.unitPrice)}/{otherItem.unit}
                          {otherIsCheaper ? " (rẻ hơn)" : ""}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#6B7A73] mt-0.5">
                    {item.dosageForm} · {item.specification}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs bg-[#F6F8F7] text-[#10231C] px-2 py-1 rounded-lg font-medium">
                      Còn lại: {fmtNum(item.remainingQty)} {item.unit}
                    </span>
                    <span className="text-sm font-bold text-[#024430]">
                      {fmtVND(item.unitPrice)}/{item.unit}
                    </span>
                  </div>
                </div>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all ${
                    isSelected
                      ? "border-[#024430] bg-[#024430] text-white"
                      : "border-[#E4EAE7] text-[#6B7A73]"
                  }`}
                >
                  {isSelected ? "−" : "+"}
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#6B7A73]">
            <p className="text-lg">Không tìm thấy thuốc</p>
            <p className="text-sm mt-1">Thử từ khoá khác</p>
          </div>
        )}
      </div>

      <div className="flex justify-end no-print">
        <Button
          className="bg-[#024430] text-white font-bold px-8 py-6 text-base rounded-xl disabled:opacity-40"
          isDisabled={selected.size === 0}
          onClick={onNext}
        >
          Tiếp theo →
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2: Quantity Input ───────────────────────────────
function Step2Quantity({
  items,
  selected,
  lines,
  onChangeQty,
  drugMasters,
  selectedContract,
  otherContract,
  overlappingCodes,
  onBack,
  onNext,
}: {
  items: ContractItem[];
  selected: Set<string>;
  lines: Record<string, SelectedLine>;
  onChangeQty: (contractItemId: string, qty: number) => void;
  drugMasters: { drugName: string; images: string[] }[];
  selectedContract: Contract;
  otherContract: Contract | null;
  overlappingCodes: Set<string>;
  onBack: () => void;
  onNext: () => void;
}) {
  const selectedItems = items.filter((i) => selected.has(i.id));
  const total = selectedItems.reduce((sum, item) => {
    const qty = lines[item.id]?.requestedQty ?? 1;
    return sum + qty * item.unitPrice;
  }, 0);

  const hasErrors = selectedItems.some((item) => {
    const qty = lines[item.id]?.requestedQty ?? 1;
    return qty <= 0 || qty > item.remainingQty;
  });

  return (
    <div>
      {/* Active contract banner */}
      <div className="mb-4 flex items-start gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-3">
        <span className="text-[#1D4ED8] flex-shrink-0 mt-0.5">ℹ️</span>
        <p className="text-sm text-[#1D4ED8]">
          Đang đặt hàng theo <strong>{selectedContract.contractCode}</strong> —{" "}
          {selectedContract.contractName}. Giá và số lượng tối đa theo hợp đồng này.
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#10231C]">Nhập số lượng</h2>
        <p className="text-sm text-[#6B7A73] mt-0.5">
          Nhập số lượng cần đặt cho từng loại thuốc.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        {selectedItems.map((item) => {
          const qty = lines[item.id]?.requestedQty ?? 1;
          const isValid = qty > 0 && qty <= item.remainingQty;
          const subtotal = qty * item.unitPrice;
          const isOverlapping = overlappingCodes.has(item.productCode);
          const otherItem = otherContract?.items.find(
            (oi) => oi.productCode === item.productCode
          ) ?? null;
          const otherIsCheaper = otherItem !== null && otherItem.unitPrice < item.unitPrice;

          return (
            <Card
              key={item.id}
              className={`border-2 ${isValid ? "border-[#E4EAE7]" : "border-red-300"}`}
            >
              <CardBody className="p-4">
                <div className="flex items-start gap-4">
                  <DrugImage
                    productName={item.productName}
                    drugMasters={drugMasters}
                    className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#10231C] text-base leading-tight">
                      {item.productName}
                    </p>
                    <p className="text-xs text-[#6B7A73] mt-0.5">
                      Còn lại: {fmtNum(item.remainingQty)} {item.unit} ·{" "}
                      {fmtVND(item.unitPrice)}/{item.unit}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border-2 border-[#E4EAE7] rounded-xl overflow-hidden">
                        <button
                          onClick={() => onChangeQty(item.id, Math.max(1, qty - 1))}
                          className="w-10 h-10 flex items-center justify-center text-xl font-bold text-[#024430] hover:bg-[#F6F8F7] transition-colors"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={item.remainingQty}
                          value={qty}
                          onChange={(e) =>
                            onChangeQty(item.id, parseInt(e.target.value) || 1)
                          }
                          className="w-20 text-center text-base font-bold text-[#10231C] border-x-2 border-[#E4EAE7] h-10 focus:outline-none"
                        />
                        <button
                          onClick={() =>
                            onChangeQty(item.id, Math.min(item.remainingQty, qty + 1))
                          }
                          className="w-10 h-10 flex items-center justify-center text-xl font-bold text-[#024430] hover:bg-[#F6F8F7] transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-[#6B7A73]">{item.unit}</span>
                    </div>
                    {!isValid && (
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        {qty <= 0
                          ? "Số lượng phải lớn hơn 0"
                          : `Không được vượt quá ${fmtNum(item.remainingQty)} ${item.unit}`}
                      </p>
                    )}
                    {/* Cross-contract cheaper callout */}
                    {isOverlapping && otherItem && otherContract && otherIsCheaper && (
                      <div className="mt-2 flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
                        <span className="text-blue-500 text-xs">💡</span>
                        <p className="text-xs text-blue-700">
                          Thuốc này rẻ hơn trong {otherContract.contractCode} (
                          {fmtVND(otherItem.unitPrice)}/{otherItem.unit})
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#6B7A73]">Thành tiền</p>
                    <p className="text-base font-bold text-[#024430]">
                      {fmtVND(subtotal)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Running total */}
      <div className="bg-[#024430] text-white rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">Tổng giá trị đơn hàng</p>
          <p className="text-2xl font-bold">{fmtVND(total)}</p>
        </div>
        <div className="text-right opacity-80 text-sm">
          <p>{selectedItems.length} loại thuốc</p>
          <p>
            {selectedItems.reduce((s, item) => s + (lines[item.id]?.requestedQty ?? 1), 0)}{" "}
            đơn vị
          </p>
        </div>
      </div>

      <div className="flex justify-between no-print">
        <Button
          variant="bordered"
          className="border-[#E4EAE7] text-[#6B7A73] font-bold px-6 py-6 text-base rounded-xl"
          onClick={onBack}
        >
          ← Quay lại
        </Button>
        <Button
          className="bg-[#024430] text-white font-bold px-8 py-6 text-base rounded-xl disabled:opacity-40"
          isDisabled={hasErrors}
          onClick={onNext}
        >
          Tiếp theo →
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Delivery Info ────────────────────────────────
function Step3DeliveryInfo({
  deliveryDate,
  setDeliveryDate,
  deliveryLocation,
  setDeliveryLocation,
  note,
  setNote,
  onBack,
  onNext,
}: {
  deliveryDate: string;
  setDeliveryDate: (v: string) => void;
  deliveryLocation: string;
  setDeliveryLocation: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const today = todayStr();
  const isDateValid = deliveryDate > today;
  const isLocationValid = deliveryLocation.trim().length > 0;
  const canProceed = isDateValid && isLocationValid;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#10231C]">Thông tin giao hàng</h2>
        <p className="text-sm text-[#6B7A73] mt-0.5">
          Điền thông tin giao nhận hàng hoá.
        </p>
      </div>

      <div className="flex flex-col gap-5 mb-8">
        <div>
          <label className="block text-sm font-semibold text-[#10231C] mb-2">
            Ngày giao hàng yêu cầu <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            min={today}
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className={`w-full h-12 px-4 rounded-xl border-2 text-base text-[#10231C] focus:outline-none focus:border-[#024430] transition-colors ${
              deliveryDate && !isDateValid
                ? "border-red-300 bg-red-50"
                : "border-[#E4EAE7] bg-white"
            }`}
          />
          {deliveryDate && !isDateValid && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              Ngày giao hàng phải là ngày trong tương lai
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#10231C] mb-2">
            Địa điểm giao hàng <span className="text-red-500">*</span>
          </label>
          <Input
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            placeholder="Nhập địa điểm giao hàng..."
            classNames={{
              inputWrapper: `border-2 ${
                !isLocationValid && deliveryLocation !== ""
                  ? "border-red-300 bg-red-50"
                  : "border-[#E4EAE7] bg-white"
              } rounded-xl h-12`,
              input: "text-base text-[#10231C]",
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#10231C] mb-2">
            Ghi chú <span className="text-[#6B7A73] font-normal">(tuỳ chọn)</span>
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú thêm cho nhà cung cấp..."
            minRows={3}
            classNames={{
              inputWrapper: "border-2 border-[#E4EAE7] bg-white rounded-xl",
            }}
          />
        </div>
      </div>

      <div className="flex justify-between no-print">
        <Button
          variant="bordered"
          className="border-[#E4EAE7] text-[#6B7A73] font-bold px-6 py-6 text-base rounded-xl"
          onClick={onBack}
        >
          ← Quay lại
        </Button>
        <Button
          className="bg-[#024430] text-white font-bold px-8 py-6 text-base rounded-xl disabled:opacity-40"
          isDisabled={!canProceed}
          onClick={onNext}
        >
          Xem lại đơn hàng →
        </Button>
      </div>
    </div>
  );
}

// ─── Step 4: Review + Submit ──────────────────────────────
function Step4Review({
  items,
  selected,
  lines,
  deliveryDate,
  deliveryLocation,
  note,
  contract,
  drugMasters,
  onBack,
  onSubmit,
}: {
  items: ContractItem[];
  selected: Set<string>;
  lines: Record<string, SelectedLine>;
  deliveryDate: string;
  deliveryLocation: string;
  note: string;
  contract: { id: string; contractCode: string; hospitalName: string; supplierName: string };
  drugMasters: { drugName: string; images: string[] }[];
  onBack: () => void;
  onSubmit: () => { orderId: string };
}) {
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const router = useRouter();

  const selectedItems = items.filter((i) => selected.has(i.id));
  const total = selectedItems.reduce((sum, item) => {
    const qty = lines[item.id]?.requestedQty ?? 1;
    return sum + qty * item.unitPrice;
  }, 0);

  const orderDate = todayStr();

  function handleSubmit() {
    const result = onSubmit();
    setOrderId(result.orderId);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-[#024430] mb-2">
          Đơn hàng đã được gửi!
        </h2>
        <p className="text-[#6B7A73] mb-2">
          Nhà cung cấp sẽ xác nhận trong vòng 1–2 ngày làm việc.
        </p>
        <div className="inline-block bg-[#F6F8F7] border border-[#E4EAE7] rounded-xl px-6 py-3 mb-6">
          <p className="text-xs text-[#6B7A73]">Mã đơn hàng</p>
          <p className="text-lg font-bold text-[#10231C]">{orderId}</p>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap no-print">
          <Button
            className="bg-[#024430] text-white font-bold px-6 py-5 text-base rounded-xl"
            onClick={() => router.push(`/hospital/orders/${orderId}`)}
          >
            Xem đơn hàng
          </Button>
          <Button
            variant="bordered"
            className="border-[#E4EAE7] text-[#10231C] font-bold px-6 py-5 text-base rounded-xl"
            onClick={() => window.print()}
          >
            Xuất PDF
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#10231C]">Xem lại & Gửi đơn hàng</h2>
        <p className="text-sm text-[#6B7A73] mt-0.5">
          Kiểm tra thông tin trước khi gửi.
        </p>
      </div>

      {/* Delivery info summary */}
      <Card className="border border-[#E4EAE7] mb-4">
        <CardBody className="p-4">
          <p className="text-xs font-semibold text-[#6B7A73] uppercase tracking-wide mb-3">
            Thông tin giao hàng
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[#6B7A73] text-xs">Bệnh viện</p>
              <p className="font-semibold text-[#10231C]">{contract.hospitalName}</p>
            </div>
            <div>
              <p className="text-[#6B7A73] text-xs">Nhà cung cấp</p>
              <p className="font-semibold text-[#10231C]">{contract.supplierName}</p>
            </div>
            <div>
              <p className="text-[#6B7A73] text-xs">Ngày đặt hàng</p>
              <p className="font-semibold text-[#10231C]">{fmtDate(orderDate)}</p>
            </div>
            <div>
              <p className="text-[#6B7A73] text-xs">Ngày giao yêu cầu</p>
              <p className="font-semibold text-[#024430]">{fmtDate(deliveryDate)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[#6B7A73] text-xs">Địa điểm giao hàng</p>
              <p className="font-semibold text-[#10231C]">{deliveryLocation}</p>
            </div>
            {note && (
              <div className="col-span-2">
                <p className="text-[#6B7A73] text-xs">Ghi chú</p>
                <p className="text-[#10231C]">{note}</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Drug list summary */}
      <Card className="border border-[#E4EAE7] mb-4">
        <CardBody className="p-4">
          <p className="text-xs font-semibold text-[#6B7A73] uppercase tracking-wide mb-3">
            Danh sách thuốc ({selectedItems.length} loại)
          </p>
          <div className="flex flex-col gap-3">
            {selectedItems.map((item, idx) => {
              const qty = lines[item.id]?.requestedQty ?? 1;
              const subtotal = qty * item.unitPrice;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 pb-3 border-b border-[#E4EAE7] last:border-0 last:pb-0"
                >
                  <span className="text-sm text-[#6B7A73] w-5">{idx + 1}.</span>
                  <DrugImage
                    productName={item.productName}
                    drugMasters={drugMasters}
                    className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#10231C] text-sm leading-tight">
                      {item.productName}
                    </p>
                    <p className="text-xs text-[#6B7A73]">
                      {fmtNum(qty)} {item.unit} × {fmtVND(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-bold text-[#024430] text-sm flex-shrink-0">
                    {fmtVND(subtotal)}
                  </p>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Grand total */}
      <div className="bg-[#024430] text-white rounded-2xl p-4 mb-6 flex items-center justify-between">
        <p className="font-semibold text-lg">Tổng cộng</p>
        <p className="text-2xl font-bold">{fmtVND(total)}</p>
      </div>

      <div className="flex justify-between no-print">
        <Button
          variant="bordered"
          className="border-[#E4EAE7] text-[#6B7A73] font-bold px-6 py-6 text-base rounded-xl"
          onClick={onBack}
        >
          ← Quay lại
        </Button>
        <div className="flex gap-3">
          <Button
            variant="bordered"
            className="border-[#E4EAE7] text-[#10231C] font-bold px-6 py-6 text-base rounded-xl"
            onClick={() => window.print()}
          >
            Xuất PDF
          </Button>
          <Button
            className="bg-[#024430] text-white font-bold px-8 py-6 text-base rounded-xl"
            onClick={handleSubmit}
          >
            Gửi đơn hàng
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Print Template ───────────────────────────────────────
function PrintTemplate({
  items,
  selected,
  lines,
  deliveryDate,
  deliveryLocation,
  note,
  contract,
  orderId,
  orderDate,
}: {
  items: ContractItem[];
  selected: Set<string>;
  lines: Record<string, SelectedLine>;
  deliveryDate: string;
  deliveryLocation: string;
  note: string;
  contract: { id: string; contractCode: string; hospitalName: string; supplierName: string };
  orderId: string;
  orderDate: string;
}) {
  const selectedItems = items.filter((i) => selected.has(i.id));
  const total = selectedItems.reduce((sum, item) => {
    const qty = lines[item.id]?.requestedQty ?? 1;
    return sum + qty * item.unitPrice;
  }, 0);

  return (
    <div id="print-order" style={{ display: "none" }}>
      <div style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#10231C", padding: "24px 32px", maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #024430", paddingBottom: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#024430", letterSpacing: -1 }}>DCP</div>
            <div style={{ fontSize: 11, color: "#6B7A73" }}>Nền tảng quản lý hợp đồng dược phẩm</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>ĐƠN ĐẶT HÀNG</div>
            <div style={{ fontSize: 11, color: "#6B7A73", marginTop: 4 }}>Mã HĐ: {contract.contractCode}</div>
            <div style={{ fontSize: 11, color: "#6B7A73" }}>Ngày đặt: {fmtDate(orderDate)}</div>
            {orderId && <div style={{ fontSize: 11, color: "#6B7A73" }}>Mã đơn: {orderId}</div>}
          </div>
        </div>

        {/* Parties */}
        <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
          <div style={{ flex: 1, background: "#F6F8F7", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: "#6B7A73", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Bên mua (Bệnh viện)</div>
            <div style={{ fontWeight: 700 }}>{contract.hospitalName}</div>
            <div style={{ fontSize: 11, color: "#6B7A73", marginTop: 2 }}>Người đặt: Nguyễn Thị Hương</div>
          </div>
          <div style={{ flex: 1, background: "#F6F8F7", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: "#6B7A73", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Bên bán (Nhà cung cấp)</div>
            <div style={{ fontWeight: 700 }}>{contract.supplierName}</div>
          </div>
        </div>

        {/* Delivery info */}
        <div style={{ background: "#F6F8F7", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <span style={{ fontSize: 10, color: "#6B7A73", textTransform: "uppercase", fontWeight: 700 }}>Ngày giao yêu cầu: </span>
              <span style={{ fontWeight: 700, color: "#024430" }}>{fmtDate(deliveryDate)}</span>
            </div>
            <div>
              <span style={{ fontSize: 10, color: "#6B7A73", textTransform: "uppercase", fontWeight: 700 }}>Địa điểm: </span>
              <span>{deliveryLocation}</span>
            </div>
          </div>
          {note && (
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 10, color: "#6B7A73", textTransform: "uppercase", fontWeight: 700 }}>Ghi chú: </span>
              <span>{note}</span>
            </div>
          )}
        </div>

        {/* Drug table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 16 }}>
          <thead>
            <tr style={{ background: "#024430", color: "white" }}>
              {["STT", "Tên thuốc", "ĐVT", "Số lượng", "Đơn giá", "Thành tiền"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "8px 10px",
                    textAlign: h === "STT" ? "center" : h === "Số lượng" || h === "Đơn giá" || h === "Thành tiền" ? "right" : "left",
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedItems.map((item, idx) => {
              const qty = lines[item.id]?.requestedQty ?? 1;
              const subtotal = qty * item.unitPrice;
              return (
                <tr key={item.id} style={{ background: idx % 2 === 0 ? "white" : "#F6F8F7" }}>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>{idx + 1}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <div style={{ fontWeight: 600 }}>{item.productName}</div>
                    <div style={{ fontSize: 10, color: "#6B7A73" }}>{item.dosageForm} · {item.specification}</div>
                  </td>
                  <td style={{ padding: "8px 10px" }}>{item.unit}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600 }}>{fmtNum(qty)}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>{fmtVND(item.unitPrice)}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#024430" }}>{fmtVND(subtotal)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "#024430", color: "white" }}>
              <td colSpan={5} style={{ padding: "10px", textAlign: "right", fontWeight: 700 }}>TỔNG CỘNG</td>
              <td style={{ padding: "10px", textAlign: "right", fontWeight: 900, fontSize: 14 }}>{fmtVND(total)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Signatures */}
        <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
          {["Người đặt hàng", "Giám đốc BV", "Người nhận đơn"].map((role) => (
            <div key={role} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 48 }}>{role}</div>
              <div style={{ borderTop: "1px solid #10231C", paddingTop: 6, fontSize: 11, color: "#6B7A73" }}>
                (Ký, ghi rõ họ tên)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function NewOrderWizardPage() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const { contract: storeContract, drugMasters } = state;

  // The two active contracts available for selection
  const availableContracts: Contract[] = useMemo(
    () => [storeContract, mockContract2],
    [storeContract]
  );

  const [step, setStep] = useState(1);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lines, setLines] = useState<Record<string, SelectedLine>>({});
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(
    "Kho dược phẩm tầng 1, Tòa nhà A, 215 Hồng Bàng, Q.5, TP.HCM"
  );
  const [note, setNote] = useState("");
  const [submittedOrderId, setSubmittedOrderId] = useState("");
  const orderDate = todayStr();

  // Resolve the currently selected contract object
  const selectedContract: Contract | null = useMemo(
    () => availableContracts.find((c) => c.id === selectedContractId) ?? null,
    [availableContracts, selectedContractId]
  );

  // The "other" contract (for cross-contract price comparisons)
  const otherContract: Contract | null = useMemo(
    () => availableContracts.find((c) => c.id !== selectedContractId) ?? null,
    [availableContracts, selectedContractId]
  );

  // Set of productCodes that appear in both contracts
  const overlappingCodes: Set<string> = useMemo(() => {
    if (availableContracts.length < 2) return new Set<string>();
    return computeOverlappingCodes(availableContracts[0], availableContracts[1]);
  }, [availableContracts]);

  const availableItems: ContractItem[] = useMemo(
    () =>
      (selectedContract?.items ?? []).filter(
        (item) => item.status !== "fully_allocated" && item.remainingQty > 0
      ),
    [selectedContract]
  );

  function handleSelectContract(id: string) {
    if (id !== selectedContractId) {
      // Reset drug selection when switching contracts
      setSelected(new Set());
      setLines({});
    }
    setSelectedContractId(id);
  }

  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (!lines[id]) {
          setLines((l) => ({ ...l, [id]: { contractItemId: id, requestedQty: 1 } }));
        }
      }
      return next;
    });
  }

  function setQty(contractItemId: string, qty: number) {
    setLines((prev) => ({
      ...prev,
      [contractItemId]: { ...prev[contractItemId], contractItemId, requestedQty: qty },
    }));
  }

  function handleSubmit(): { orderId: string } {
    if (!selectedContract) return { orderId: "" };

    const orderId = generateId("ORD");
    const now = new Date().toISOString();

    const orderLines: OrderLine[] = availableItems
      .filter((item) => selected.has(item.id))
      .map((item) => {
        const qty = lines[item.id]?.requestedQty ?? 1;
        return {
          id: generateId("LINE"),
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
          status: "pending_confirmation",
          fulfillmentRecords: [],
          supplierNote: "",
        };
      });

    const totalRequested = orderLines.reduce((s, l) => s + l.lineAmount, 0);

    const order: Order = {
      id: orderId,
      contractId: selectedContract.id,
      hospitalName: selectedContract.hospitalName,
      supplierName: selectedContract.supplierName,
      orderDate,
      requestedDeliveryDate: deliveryDate,
      deliveryLocation,
      note,
      status: "pending_confirmation",
      totalRequestedAmount: totalRequested,
      totalConfirmedAmount: 0,
      lines: orderLines,
    };

    const evidence: EvidenceLog = {
      id: generateId("EVD"),
      contractId: selectedContract.id,
      orderId,
      actorRole: "hospital_buyer",
      actorName: "Nguyễn Thị Hương",
      actionType: "order_created",
      title: "Tạo đơn hàng mới",
      description: `Đơn hàng ${orderId} được tạo với ${orderLines.length} loại thuốc, tổng giá trị ${fmtVND(totalRequested)}.`,
      metadata: {
        totalLines: orderLines.length,
        totalAmount: totalRequested,
        deliveryDate,
      },
      createdAt: now,
    };

    dispatch({ type: "CREATE_ORDER", payload: { order, evidence } });
    setSubmittedOrderId(orderId);
    return { orderId };
  }

  // Fallback contract info for print (uses storeContract if nothing selected)
  const printContract = selectedContract ?? storeContract;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #print-order { display: block !important; }
          body > * { display: none; }
          #print-order { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>

      <PrintTemplate
        items={availableItems}
        selected={selected}
        lines={lines}
        deliveryDate={deliveryDate}
        deliveryLocation={deliveryLocation}
        note={note}
        contract={printContract}
        orderId={submittedOrderId}
        orderDate={orderDate}
      />

      <div className="max-w-2xl mx-auto px-4 py-6 no-print">
        {/* Back link */}
        <button
          onClick={() => router.push("/hospital/orders")}
          className="flex items-center gap-2 text-sm text-[#6B7A73] hover:text-[#024430] mb-6 transition-colors"
        >
          ← Quay lại danh sách đơn hàng
        </button>

        <h1 className="text-2xl font-bold text-[#10231C] mb-6">Tạo đơn hàng mới</h1>

        <StepIndicator current={step} />

        <div className="bg-white rounded-2xl border border-[#E4EAE7] p-6 shadow-sm">
          {step === 1 && (
            <Step0ContractPicker
              contracts={availableContracts}
              selectedContractId={selectedContractId}
              onSelect={handleSelectContract}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && selectedContract && (
            <Step1DrugPicker
              items={availableItems}
              selected={selected}
              onToggle={toggleItem}
              drugMasters={drugMasters}
              selectedContract={selectedContract}
              otherContract={otherContract}
              overlappingCodes={overlappingCodes}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && selectedContract && (
            <Step2Quantity
              items={availableItems}
              selected={selected}
              lines={lines}
              onChangeQty={setQty}
              drugMasters={drugMasters}
              selectedContract={selectedContract}
              otherContract={otherContract}
              overlappingCodes={overlappingCodes}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <Step3DeliveryInfo
              deliveryDate={deliveryDate}
              setDeliveryDate={setDeliveryDate}
              deliveryLocation={deliveryLocation}
              setDeliveryLocation={setDeliveryLocation}
              note={note}
              setNote={setNote}
              onBack={() => setStep(3)}
              onNext={() => setStep(5)}
            />
          )}
          {step === 5 && selectedContract && (
            <Step4Review
              items={availableItems}
              selected={selected}
              lines={lines}
              deliveryDate={deliveryDate}
              deliveryLocation={deliveryLocation}
              note={note}
              contract={selectedContract}
              drugMasters={drugMasters}
              onBack={() => setStep(4)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </>
  );
}
