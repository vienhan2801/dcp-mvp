"use client";
import { useState, useRef, useEffect, FormEvent } from "react";
import { useApp } from "@/lib/store";
import { fmtVND, fmtDate, fmtNum } from "@/lib/format";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  cards?: CardData[];
}

interface CardData {
  type: "drug" | "order" | "report" | "payment";
  title: string;
  lines: { label: string; value: string }[];
  badge?: { label: string; color: string };
  link?: string;
}

// ──────────────────────────────────────────────
// AI engine — pattern matching on Vietnamese input
// ──────────────────────────────────────────────
function useAI() {
  const { state } = useApp();

  function respond(query: string): { text: string; cards?: CardData[] } {
    const q = query.toLowerCase().trim();

    // ── Tìm thuốc ──────────────────────────────
    if (q.includes("tìm") || q.includes("thuốc") || q.includes("tra cứu")) {
      // Extract drug name keywords
      const keywords = q
        .replace(/tìm|thuốc|tra cứu|thông tin|về|cho tôi|giá/g, "")
        .trim();
      const matched = state.drugMasters.filter((d) => {
        if (!keywords) return true;
        return (
          d.drugName.toLowerCase().includes(keywords) ||
          d.activeIngredient.toLowerCase().includes(keywords) ||
          d.dosageForm.toLowerCase().includes(keywords)
        );
      });
      if (matched.length === 0) {
        return { text: `Không tìm thấy thuốc nào phù hợp với "${query}". Thử tìm theo tên hoạt chất hoặc dạng bào chế.` };
      }
      return {
        text: `Tìm thấy **${matched.length}** thuốc phù hợp:`,
        cards: matched.map((d) => {
          const prices = d.priceHistory?.map((p) => p.unitPrice) ?? [];
          const priceStr =
            prices.length === 0
              ? "Chưa có giá"
              : prices.length === 1
              ? fmtVND(prices[0])
              : `${fmtVND(Math.min(...prices))} – ${fmtVND(Math.max(...prices))}`;
          return {
            type: "drug" as const,
            title: d.drugName,
            badge: { label: d.dosageForm, color: "blue" },
            lines: [
              { label: "Hoạt chất", value: d.activeIngredient },
              { label: "Hàm lượng", value: d.strength },
              { label: "Nhà SX", value: d.manufacturer },
              { label: "Khoảng giá", value: priceStr + `/${d.unit}` },
            ],
            link: `/supplier/drugs/${d.id}`,
          };
        }),
      };
    }

    // ── Giá thuốc ───────────────────────────────
    if (q.includes("giá")) {
      const keywords = q.replace(/giá|thuốc|của|hỏi|bao nhiêu|đồng/g, "").trim();
      const matched = state.drugMasters.find(
        (d) =>
          d.drugName.toLowerCase().includes(keywords) ||
          d.activeIngredient.toLowerCase().includes(keywords)
      );
      if (!matched) {
        return { text: "Vui lòng cung cấp tên thuốc cụ thể để tra giá. Ví dụ: *giá Paracetamol*" };
      }
      const prices = matched.priceHistory?.map((p) => p.unitPrice) ?? [];
      const cards: CardData[] = matched.priceHistory?.map((p) => ({
        type: "payment" as const,
        title: p.contractName,
        badge: { label: fmtVND(p.unitPrice) + `/${matched.unit}`, color: "green" },
        lines: [
          { label: "Bệnh viện", value: p.hospitalName },
          { label: "Hợp đồng", value: p.contractCode },
          { label: "Hiệu lực", value: `${fmtDate(p.effectiveDate)} – ${fmtDate(p.expiryDate)}` },
        ],
      })) ?? [];
      return {
        text: `💊 **${matched.drugName}** — Khoảng giá: **${fmtVND(Math.min(...prices))} – ${fmtVND(Math.max(...prices))}**/${matched.unit}`,
        cards,
      };
    }

    // ── Báo cáo tháng ───────────────────────────
    if (q.includes("báo cáo") || q.includes("tổng hợp") || q.includes("thống kê")) {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const monthOrders = state.orders.filter((o) => {
        const d = new Date(o.orderDate);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });
      const totalRequested = monthOrders.reduce((s, o) => s + o.totalRequestedAmount, 0);
      const totalConfirmed = monthOrders.reduce((s, o) => s + o.totalConfirmedAmount, 0);
      const done = monthOrders.filter((o) => o.status === "received_confirmed").length;
      const pending = monthOrders.filter((o) =>
        ["pending_confirmation", "partially_confirmed"].includes(o.status)
      ).length;
      const inTransit = monthOrders.filter((o) =>
        ["confirmed", "preparing", "shipping", "delivered"].includes(o.status)
      ).length;
      const payments = state.payments ?? [];
      const paidAmt = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.paidAmount, 0);
      return {
        text: `📊 **Báo cáo tháng ${month}/${year}**`,
        cards: [
          {
            type: "report" as const,
            title: `Đơn hàng tháng ${month}/${year}`,
            badge: { label: `${monthOrders.length} đơn`, color: "green" },
            lines: [
              { label: "✅ Hoàn thành", value: `${done} đơn` },
              { label: "⏳ Chờ/Xác nhận", value: `${pending} đơn` },
              { label: "🚚 Đang giao", value: `${inTransit} đơn` },
              { label: "Giá trị YC", value: fmtVND(totalRequested) },
              { label: "Giá trị XN", value: fmtVND(totalConfirmed) },
            ],
          },
          {
            type: "payment" as const,
            title: "Thanh toán tích lũy",
            badge: { label: fmtVND(paidAmt), color: "blue" },
            lines: [
              { label: "Đã thanh toán", value: fmtVND(paidAmt) },
              { label: "Số hóa đơn", value: `${payments.length} hóa đơn` },
            ],
          },
        ],
      };
    }

    // ── Đơn hàng chờ xác nhận ───────────────────
    if (q.includes("chờ xác nhận") || q.includes("pending") || (q.includes("đơn") && q.includes("chờ"))) {
      const pending = state.orders.filter((o) =>
        ["pending_confirmation", "partially_confirmed"].includes(o.status)
      );
      if (pending.length === 0) {
        return { text: "✅ Hiện không có đơn hàng nào đang chờ xác nhận." };
      }
      return {
        text: `⚠️ Có **${pending.length}** đơn hàng đang chờ xác nhận:`,
        cards: pending.map((o) => ({
          type: "order" as const,
          title: o.id,
          badge: { label: o.status === "partially_confirmed" ? "XN một phần" : "Chờ XN", color: "amber" },
          lines: [
            { label: "Bệnh viện", value: o.hospitalName },
            { label: "Ngày đặt", value: fmtDate(o.orderDate) },
            { label: "Giá trị", value: fmtVND(o.totalRequestedAmount) },
            { label: "Số dòng", value: `${o.lines.length} dòng` },
          ],
          link: `/supplier/orders/${o.id}`,
        })),
      };
    }

    // ── Đơn hàng đang giao ──────────────────────
    if ((q.includes("đơn") && q.includes("giao")) || q.includes("đang giao") || q.includes("vận chuyển")) {
      const inTransit = state.orders.filter((o) =>
        ["confirmed", "preparing", "shipping", "delivered"].includes(o.status)
      );
      if (inTransit.length === 0) {
        return { text: "Hiện không có đơn hàng nào đang trong quá trình giao." };
      }
      return {
        text: `🚚 **${inTransit.length}** đơn hàng đang giao:`,
        cards: inTransit.map((o) => ({
          type: "order" as const,
          title: o.id,
          badge: { label: o.status === "delivered" ? "Đã giao – chờ NThu" : "Đang giao", color: "blue" },
          lines: [
            { label: "Bệnh viện", value: o.hospitalName },
            { label: "Trạng thái", value: o.status },
            { label: "Giao yêu cầu", value: fmtDate(o.requestedDeliveryDate) },
            { label: "Giá trị XN", value: fmtVND(o.totalConfirmedAmount) },
          ],
          link: `/supplier/orders/${o.id}`,
        })),
      };
    }

    // ── Thanh toán ──────────────────────────────
    if (q.includes("thanh toán") || q.includes("hóa đơn") || q.includes("công nợ")) {
      const payments = state.payments ?? [];
      const total = payments.reduce((s, p) => s + p.invoiceAmount, 0);
      const paid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.paidAmount, 0);
      const unpaid = total - paid;
      return {
        text: `💰 **Tình hình thanh toán:**`,
        cards: [
          {
            type: "payment" as const,
            title: "Tổng quan công nợ",
            badge: { label: `${payments.length} hóa đơn`, color: "green" },
            lines: [
              { label: "Tổng giá trị HĐ", value: fmtVND(total) },
              { label: "Đã thanh toán", value: fmtVND(paid) },
              { label: "Còn lại", value: fmtVND(unpaid) },
              { label: "Đã TT / Tổng", value: `${total > 0 ? Math.round((paid / total) * 100) : 0}%` },
            ],
          },
        ],
      };
    }

    // ── Hợp đồng ────────────────────────────────
    if (q.includes("hợp đồng")) {
      const c = state.contract;
      return {
        text: `📄 **Hợp đồng hiện hành:**`,
        cards: [
          {
            type: "report" as const,
            title: c.contractCode ?? c.id,
            badge: { label: c.contractStatus ?? "active", color: "green" },
            lines: [
              { label: "Bệnh viện", value: c.hospitalName },
              { label: "Nhà cung cấp", value: c.supplierName },
              { label: "Hiệu lực", value: `${fmtDate(c.startDate)} – ${fmtDate(c.endDate)}` },
              { label: "Giá trị HĐ", value: fmtVND(c.totalContractValue) },
            ],
            link: `/supplier/contracts/${c.id}`,
          },
        ],
      };
    }

    // ── Help ────────────────────────────────────
    return {
      text: `Tôi có thể giúp bạn:\n\n• **Tìm thuốc**: *tìm paracetamol*, *tra thuốc kháng sinh*\n• **Giá thuốc**: *giá ceftriaxone*\n• **Đơn hàng**: *đơn hàng chờ xác nhận*, *đơn đang giao*\n• **Báo cáo**: *báo cáo tháng*, *thống kê*\n• **Thanh toán**: *thanh toán*, *công nợ*\n• **Hợp đồng**: *hợp đồng*`,
    };
  }

  return { respond };
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────
const BADGE_COLORS: Record<string, string> = {
  blue:   "bg-blue-100 text-blue-700",
  green:  "bg-emerald-100 text-emerald-700",
  amber:  "bg-amber-100 text-amber-700",
  red:    "bg-red-100 text-red-600",
};

function ResultCard({ card }: { card: CardData }) {
  const badgeClass = BADGE_COLORS[card.badge?.color ?? "blue"] ?? BADGE_COLORS.blue;
  return (
    <div className="rounded-xl border border-[#E4EAE7] bg-white p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-[#10231C] leading-tight">{card.title}</p>
        {card.badge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeClass}`}>
            {card.badge.label}
          </span>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
        {card.lines.map((l) => (
          <div key={l.label}>
            <dt className="text-[10px] text-[#6B7A73]">{l.label}</dt>
            <dd className="text-[11px] font-semibold text-[#10231C] leading-tight">{l.value}</dd>
          </div>
        ))}
      </dl>
      {card.link && (
        <a href={card.link} className="text-[10px] text-[#024430] font-semibold hover:underline mt-1">
          Xem chi tiết →
        </a>
      )}
    </div>
  );
}

function renderText(text: string) {
  // Bold **text** support
  return text.split("\n").map((line, i) => {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <span key={i} className="block">
        {parts.map((p, j) =>
          j % 2 === 1 ? <strong key={j}>{p}</strong> : p
        )}
      </span>
    );
  });
}

// ──────────────────────────────────────────────
// Quick action chips
// ──────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: "📊", label: "Báo cáo tháng này", query: "báo cáo tháng" },
  { icon: "💊", label: "Tìm thuốc", query: "tìm thuốc" },
  { icon: "⏳", label: "Đơn chờ xác nhận", query: "đơn hàng chờ xác nhận" },
  { icon: "🚚", label: "Đơn đang giao", query: "đơn đang giao" },
  { icon: "💰", label: "Thanh toán", query: "thanh toán" },
];

// ──────────────────────────────────────────────
// Main CopilotBar component
// ──────────────────────────────────────────────
export default function CopilotBar() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: "Xin chào! Tôi là **DCP Copilot** 🤖\n\nTôi có thể giúp bạn tìm kiếm thuốc, tra giá, xem đơn hàng và tạo báo cáo nhanh. Hãy thử một trong các gợi ý bên dưới hoặc nhập câu hỏi của bạn.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { respond } = useAI();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 120);
    }
  }, [open, messages]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const result = respond(text);
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "ai",
        text: result.text,
        cards: result.cards,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 500);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-200 ${
          open
            ? "bg-[#024430] scale-95"
            : "bg-[#024430] hover:bg-[#056246] hover:scale-105"
        }`}
        aria-label="DCP Copilot"
      >
        {open ? (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        )}
        {/* Badge showing pending orders */}
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[75vh] flex flex-col rounded-2xl shadow-2xl border border-[#E4EAE7] bg-white overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#024430] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">DCP Copilot</p>
              <p className="text-white/60 text-[11px] mt-0.5">Tra cứu · Báo cáo · Phân tích</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick actions */}
          <div className="px-3 py-2 border-b border-[#E4EAE7] flex gap-1.5 overflow-x-auto flex-shrink-0">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => sendMessage(a.query)}
                className="flex-shrink-0 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-[#F6F8F7] hover:bg-[#024430]/10 text-[#10231C] transition-colors whitespace-nowrap"
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 min-h-0">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {/* Bubble */}
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#024430] text-white rounded-tr-sm"
                      : "bg-[#F6F8F7] text-[#10231C] rounded-tl-sm"
                  }`}
                >
                  {renderText(msg.text)}
                </div>
                {/* Cards */}
                {msg.cards && msg.cards.length > 0 && (
                  <div className="w-full flex flex-col gap-2">
                    {msg.cards.map((card, i) => (
                      <ResultCard key={i} card={card} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-start">
                <div className="bg-[#F6F8F7] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#6B7A73] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#6B7A73] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#6B7A73] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-[#E4EAE7] p-3 flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi gì đó... (VD: tìm paracetamol)"
              className="flex-1 text-sm border border-[#E4EAE7] rounded-xl px-3 py-2 outline-none focus:border-[#024430] bg-[#F6F8F7] text-[#10231C] placeholder:text-[#6B7A73] transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-[#024430] flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#056246] transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
