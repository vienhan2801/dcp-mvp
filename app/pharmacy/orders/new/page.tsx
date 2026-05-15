"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Button, Input } from "@/components/ui";
import { fmtVND, fmtNum } from "@/lib/format";

// ─── NPP Warehouse inventory (inline mock) ────────────────────────────────────
const NPP_WAREHOUSE = [
  { id: "W001", name: "Paracetamol 500mg",  form: "Viên nén",  unit: "Hộp", stock: 8_500, price: 22_000, manufacturer: "PhytoPharma",    description: "Hộp 10 vỉ × 10 viên", category: "Hạ sốt, giảm đau" },
  { id: "W002", name: "Amoxicillin 500mg",  form: "Viên nang", unit: "Hộp", stock: 3_200, price: 48_000, manufacturer: "Stada VN",       description: "Hộp 10 vỉ × 10 viên", category: "Kháng sinh" },
  { id: "W003", name: "Vitamin C 500mg",    form: "Viên nén",  unit: "Lọ",  stock: 5_400, price: 35_000, manufacturer: "Hana Pharma",    description: "Lọ 100 viên",           category: "Vitamin & khoáng chất" },
  { id: "W004", name: "Cetirizine 10mg",    form: "Viên nén",  unit: "Hộp", stock: 1_800, price: 32_000, manufacturer: "Pymepharco",     description: "Hộp 3 vỉ × 10 viên",  category: "Dị ứng" },
  { id: "W005", name: "Omeprazole 20mg",    form: "Viên nang", unit: "Hộp", stock:   350, price: 58_000, manufacturer: "OPV",            description: "Hộp 3 vỉ × 10 viên",  category: "Tiêu hóa" },
  { id: "W006", name: "Ibuprofen 400mg",    form: "Viên nén",  unit: "Hộp", stock: 2_600, price: 28_000, manufacturer: "Dược Hậu Giang", description: "Hộp 10 vỉ × 10 viên", category: "Hạ sốt, giảm đau" },
  { id: "W007", name: "Metformin 500mg",    form: "Viên nén",  unit: "Hộp", stock: 4_100, price: 42_000, manufacturer: "Traphaco",       description: "Hộp 10 vỉ × 10 viên", category: "Tiểu đường" },
  { id: "W008", name: "Azithromycin 500mg", form: "Viên nén",  unit: "Hộp", stock:   800, price: 95_000, manufacturer: "Sanofi",         description: "Hộp 1 vỉ × 3 viên",   category: "Kháng sinh" },
];
const CATEGORIES = ["Tất cả", "Kháng sinh", "Hạ sốt, giảm đau", "Vitamin & khoáng chất", "Tiêu hóa", "Dị ứng", "Tiểu đường"];

type WarehouseItem = (typeof NPP_WAREHOUSE)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function generateOrderId() {
  return `NT-ORD-${Date.now()}`;
}

function stockBadge(stock: number, unit: string) {
  if (stock > 1000) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
        Còn {fmtNum(stock)} {unit}
      </span>
    );
  }
  if (stock >= 100) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
        Còn {fmtNum(stock)} {unit}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
      Còn {fmtNum(stock)} {unit}
    </span>
  );
}

function formBadge(form: string) {
  const map: Record<string, string> = {
    "Viên nang": "bg-purple-100 text-purple-700",
    "Viên nén":  "bg-blue-100 text-blue-700",
    "Viên sủi":  "bg-cyan-100 text-cyan-700",
  };
  const cls = map[form] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cls}`}>
      {form}
    </span>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = ["Chọn sản phẩm", "Giỏ hàng", "Giao hàng & Xác nhận"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, idx) => {
        const num = idx + 1;
        const isActive = num === current;
        const isDone = num < current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  isActive
                    ? "bg-[#0F766E] border-[#0F766E] text-white"
                    : isDone
                    ? "bg-[#0F766E] border-[#0F766E] text-white opacity-70"
                    : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                {isDone ? "✓" : num}
              </div>
              <span
                className={`text-xs mt-1 font-medium whitespace-nowrap max-w-[90px] text-center leading-tight ${
                  isActive ? "text-[#0F766E]" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-16 mx-1 mb-5 ${num < current ? "bg-[#0F766E]" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Qty stepper (inline in card) ─────────────────────────────────────────────
function QtyStepper({
  qty,
  stock,
  onInc,
  onDec,
  onChange,
}: {
  qty: number;
  stock: number;
  onInc: () => void;
  onDec: () => void;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center border border-[#99F6E4] rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={onDec}
        className="px-2.5 py-1.5 text-[#0F766E] hover:bg-[#F0FDFA] font-bold text-base leading-none transition-colors"
      >
        −
      </button>
      <input
        type="number"
        min={1}
        max={stock}
        value={qty}
        onChange={(e) => onChange(parseInt(e.target.value) || 1)}
        className="w-14 text-center text-sm font-bold text-[#0F766E] border-x border-[#99F6E4] py-1.5 outline-none bg-transparent"
      />
      <button
        type="button"
        onClick={onInc}
        className="px-2.5 py-1.5 text-[#0F766E] hover:bg-[#F0FDFA] font-bold text-base leading-none transition-colors"
      >
        +
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PharmacyOrderNewPage() {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  // cart: { [warehouseId]: qty }
  const [cart, setCart] = useState<Record<string, number>>({});
  const [deliveryDate, setDeliveryDate] = useState(todayStr());
  const [address, setAddress] = useState("123 Lê Lợi, Q.1, TP.HCM");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [orderId] = useState(generateOrderId);

  // ── derived ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return NPP_WAREHOUSE.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "Tất cả" || item.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory]);

  const cartItems = useMemo(
    () => NPP_WAREHOUSE.filter((w) => cart[w.id] !== undefined),
    [cart]
  );

  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * (cart[item.id] ?? 0), 0);

  // ── cart helpers ──────────────────────────────────────────────────────────────
  function addToCart(item: WarehouseItem) {
    setCart((prev) => ({ ...prev, [item.id]: 1 }));
  }

  function removeFromCart(id: string) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function setQty(id: string, val: number) {
    const item = NPP_WAREHOUSE.find((w) => w.id === id);
    if (!item) return;
    const clamped = Math.max(1, Math.min(item.stock, val));
    setCart((prev) => ({ ...prev, [id]: clamped }));
  }

  function incQty(id: string) {
    const item = NPP_WAREHOUSE.find((w) => w.id === id);
    if (!item) return;
    setCart((prev) => ({ ...prev, [id]: Math.min(item.stock, (prev[id] ?? 1) + 1) }));
  }

  function decQty(id: string) {
    setCart((prev) => {
      const next = Math.max(1, (prev[id] ?? 1) - 1);
      return { ...prev, [id]: next };
    });
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  // ── Success state ─────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-[#0F766E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đơn hàng đã được gửi!</h2>
        <p className="text-gray-500 mb-1">Mã đơn hàng:</p>
        <p className="text-lg font-mono font-bold text-[#0F766E] mb-3">{orderId}</p>
        <p className="text-sm text-gray-500 mb-6">
          NPP sẽ xác nhận trong 1-2 giờ làm việc.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/pharmacy/orders">
            <span className="inline-flex px-5 py-2.5 bg-[#0F766E] text-white text-sm font-semibold rounded-xl cursor-pointer hover:bg-[#0d6b63] transition-colors">
              Xem đơn hàng
            </span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setCart({});
              setSearch("");
              setActiveCategory("Tất cả");
              setDeliveryDate(todayStr());
              setNote("");
              setSubmitted(false);
            }}
            className="inline-flex px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Đặt thêm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-28">
      <PageHeader
        title="Đặt hàng từ kho PhytoPharma"
        subtitle="Chọn sản phẩm có sẵn để đặt hàng"
      />

      <StepIndicator current={step} />

      {/* ─── Step 1: Browse & Add to Cart ────────────────────────────────────── */}
      {step === 1 && (
        <div>
          {/* Search + category filter */}
          <div className="mb-5 flex flex-col gap-3">
            <Input
              placeholder="Tìm tên thuốc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startContent={
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              }
              classNames={{ inputWrapper: "bg-white border-[#99F6E4]" }}
            />
            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    activeCategory === cat
                      ? "bg-[#0F766E] text-white border-[#0F766E]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#0F766E] hover:text-[#0F766E]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">Không tìm thấy sản phẩm phù hợp.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((item) => {
                const inCart = cart[item.id] !== undefined;
                const qty = cart[item.id] ?? 0;
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border-2 transition-all flex flex-col p-4 ${
                      inCart
                        ? "border-[#0F766E] shadow-md shadow-teal-100"
                        : "border-gray-100 hover:border-[#99F6E4] hover:shadow-sm"
                    }`}
                  >
                    {/* Top: name + form badge */}
                    <div className="mb-2 flex-1">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <p className="font-bold text-gray-900 text-sm leading-tight">{item.name}</p>
                        {inCart && (
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0F766E] flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{item.manufacturer}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {formBadge(item.form)}
                        {stockBadge(item.stock, item.unit)}
                      </div>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mt-2 mb-3">
                      <span className="text-base font-bold text-[#0F766E]">{fmtVND(item.price)}</span>
                      <span className="text-xs text-gray-400"> / {item.unit}</span>
                    </div>

                    {/* Add to cart or stepper */}
                    {!inCart ? (
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="w-full py-2 bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] text-sm font-semibold rounded-xl hover:bg-[#0F766E] hover:text-white hover:border-[#0F766E] transition-all"
                      >
                        + Thêm vào giỏ
                      </button>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <QtyStepper
                          qty={qty}
                          stock={item.stock}
                          onInc={() => incQty(item.id)}
                          onDec={() => decQty(item.id)}
                          onChange={(v) => setQty(item.id, v)}
                        />
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors text-center"
                        >
                          Xoá khỏi giỏ
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Step 2: Review Cart ─────────────────────────────────────────────── */}
      {step === 2 && (
        <Card className="border border-[#99F6E4]">
          <CardBody>
            <h3 className="font-semibold text-gray-900 mb-4">Giỏ hàng ({cartCount} sản phẩm)</h3>

            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Giỏ hàng trống.</p>
            ) : (
              <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-[#F0FDFA]">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Sản phẩm</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">Số lượng</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Đơn giá</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Thành tiền</th>
                      <th className="px-2 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => {
                      const qty = cart[item.id] ?? 1;
                      return (
                        <tr key={item.id} className="border-t border-gray-100">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.form} · {item.unit}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <QtyStepper
                                qty={qty}
                                stock={item.stock}
                                onInc={() => incQty(item.id)}
                                onDec={() => decQty(item.id)}
                                onChange={(v) => setQty(item.id, v)}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                            {fmtVND(item.price)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[#0F766E] whitespace-nowrap">
                            {fmtVND(item.price * qty)}
                          </td>
                          <td className="px-2 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                              aria-label="Xoá"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-[#F0FDFA]">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-700">Tổng cộng</td>
                      <td className="px-4 py-3 text-right font-bold text-[#0F766E] text-base">{fmtVND(cartTotal)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div className="flex justify-between mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                ← Tiếp tục chọn
              </button>
              <button
                type="button"
                disabled={cartItems.length === 0}
                onClick={() => setStep(3)}
                className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  cartItems.length === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#0F766E] text-white hover:bg-[#0d6b63] cursor-pointer"
                }`}
              >
                Xác nhận đặt hàng →
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ─── Step 3: Delivery info + Confirm ─────────────────────────────────── */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          {/* Delivery info */}
          <Card className="border border-[#99F6E4]">
            <CardBody>
              <h3 className="font-semibold text-gray-900 mb-4">Thông tin giao hàng</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ngày giao hàng yêu cầu</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    min={todayStr()}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full border border-[#99F6E4] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0F766E] bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Địa chỉ nhận hàng</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-[#99F6E4] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0F766E] bg-white transition-colors"
                    placeholder="Nhập địa chỉ giao hàng..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ghi chú (tuỳ chọn)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="w-full border border-[#99F6E4] rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#0F766E] bg-white resize-none transition-colors"
                    placeholder="Yêu cầu đặc biệt, ghi chú giao hàng..."
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Order summary */}
          <Card className="border border-[#99F6E4]">
            <CardBody>
              <h3 className="font-semibold text-gray-900 mb-4">Xác nhận đơn hàng</h3>

              <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-[#F0FDFA]">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Sản phẩm</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">SL</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Đơn giá</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => {
                      const qty = cart[item.id] ?? 1;
                      return (
                        <tr key={item.id} className="border-t border-gray-100">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.form}</p>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {fmtNum(qty)} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">{fmtVND(item.price)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtVND(item.price * qty)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-[#F0FDFA]">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-700">Tổng cộng</td>
                      <td className="px-4 py-3 text-right font-bold text-[#0F766E] text-base">{fmtVND(cartTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Delivery summary */}
              <div className="p-3 bg-[#F0FDFA] border border-[#99F6E4] rounded-xl text-sm flex flex-col gap-1.5 mb-4">
                <div className="flex gap-2">
                  <span className="text-gray-400 w-36 flex-shrink-0">Ngày giao dự kiến:</span>
                  <span className="font-medium text-gray-800">{new Date(deliveryDate).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 w-36 flex-shrink-0">Địa chỉ:</span>
                  <span className="font-medium text-gray-800">{address}</span>
                </div>
                {note && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-36 flex-shrink-0">Ghi chú:</span>
                    <span className="font-medium text-gray-800">{note}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  ← Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-[#0F766E] text-white text-sm font-semibold rounded-xl cursor-pointer hover:bg-[#0d6b63] transition-colors"
                >
                  Gửi đơn hàng
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ─── Floating cart bar (Step 1 only) — always in DOM, slides in from bottom ── */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 ml-56 transition-transform duration-300 ease-in-out ${
        cartCount > 0 && step === 1 ? "translate-y-0" : "translate-y-full"
      }`}>
        <div className="bg-white border-t border-[#99F6E4] shadow-lg px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0F766E] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 19a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {cartCount} sản phẩm
              </p>
              <p className="text-xs text-gray-400">
                Tổng: <span className="font-bold text-[#0F766E]">{fmtVND(cartTotal)}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="px-5 py-2.5 bg-[#0F766E] text-white text-sm font-semibold rounded-xl hover:bg-[#0d6b63] transition-colors cursor-pointer"
          >
            Xem giỏ hàng →
          </button>
        </div>
      </div>
    </div>
  );
}
