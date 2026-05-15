"use client";
import { useState } from "react";
import Link from "next/link";
import { useRole } from "@/lib/useRole";
import PageHeader from "@/components/PageHeader";
import FileUpload from "@/components/FileUpload";
import { Card, CardBody, Chip } from "@/components/ui";

// ─── Mock data ────────────────────────────────────────────────────────────────
type OrderStatus = "pending" | "confirmed" | "shipping" | "completed" | "cancelled";

interface OrderLine {
  name: string;
  qty: number;
  unit: string;
}

interface Order {
  id: string;
  date: string;
  contract: string;
  lines: OrderLine[];
  total: number;
  status: OrderStatus;
  deliveryDate?: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: "DH-NT-00023",
    date: "2026-05-05",
    contract: "HĐ-NT-2026-002",
    lines: [
      { name: "Amoxicillin 500mg", qty: 500, unit: "Viên" },
      { name: "Paracetamol 500mg", qty: 1000, unit: "Viên" },
    ],
    total: 2_200_000,
    status: "shipping",
    deliveryDate: "2026-05-09",
  },
  {
    id: "DH-NT-00022",
    date: "2026-04-28",
    contract: "HĐ-NT-2026-002",
    lines: [
      { name: "Omeprazole 20mg",  qty: 300, unit: "Viên" },
      { name: "Vitamin C 1000mg", qty: 200, unit: "Viên" },
    ],
    total: 2_990_000,
    status: "completed",
    deliveryDate: "2026-05-02",
  },
  {
    id: "DH-NT-00021",
    date: "2026-04-15",
    contract: "HĐ-NT-2026-002",
    lines: [
      { name: "Amoxicillin 500mg", qty: 700, unit: "Viên" },
    ],
    total: 1_960_000,
    status: "completed",
    deliveryDate: "2026-04-18",
  },
  {
    id: "DH-NT-00020",
    date: "2026-04-02",
    contract: "HĐ-NT-2026-002",
    lines: [
      { name: "Paracetamol 500mg", qty: 2000, unit: "Viên" },
      { name: "Vitamin C 1000mg",  qty: 500,  unit: "Viên" },
    ],
    total: 5_700_000,
    status: "pending",
  },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: "default" | "primary" | "success" | "warning" | "danger" }> = {
  pending:   { label: "Chờ xác nhận", color: "warning" },
  confirmed: { label: "Đã xác nhận",  color: "primary" },
  shipping:  { label: "Đang giao",    color: "primary" },
  completed: { label: "Hoàn thành",   color: "success" },
  cancelled: { label: "Đã huỷ",       color: "danger" },
};

const TABS: { key: string; label: string; statuses: OrderStatus[] | null }[] = [
  { key: "all",       label: "Tất cả",           statuses: null },
  { key: "pending",   label: "Chờ xác nhận",     statuses: ["pending"] },
  { key: "shipping",  label: "Đang giao",         statuses: ["confirmed", "shipping"] },
  { key: "completed", label: "Đã hoàn thành",    statuses: ["completed"] },
];

function fmtVND(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} triệu ₫`;
  return v.toLocaleString("vi-VN") + " ₫";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN");
}

// ─── Receipt Upload Panel ────────────────────────────────
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

function OrderCard({ order, canUploadReceiptProof, isExpanded, onToggleExpand, isConfirmed, onConfirmed }: {
  order: Order;
  canUploadReceiptProof: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isConfirmed: boolean;
  onConfirmed: () => void;
}) {
  const cfg = STATUS_CONFIG[order.status];
  return (
    <Card className="border border-[#E4EAE7] hover:shadow-md transition-shadow">
      <CardBody className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-[#10231C] text-base">{order.id}</p>
              <Chip color={cfg.color} variant="flat" size="sm">{cfg.label}</Chip>
            </div>
            <p className="text-xs text-[#6B7A73]">
              Đặt ngày: {fmtDate(order.date)} · HĐ: {order.contract}
            </p>
            {order.deliveryDate && (
              <p className="text-xs text-[#6B7A73] mt-0.5">
                Giao dự kiến: {fmtDate(order.deliveryDate)}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[#0F766E]">{fmtVND(order.total)}</p>
            <p className="text-xs text-[#6B7A73]">{order.lines.length} mặt hàng</p>
          </div>
        </div>

        {/* Items summary */}
        <div className="flex flex-wrap gap-2 mb-4">
          {order.lines.map((line, idx) => (
            <span key={idx} className="text-xs px-2.5 py-1 bg-[#F6F8F7] border border-[#E4EAE7] rounded-full text-[#10231C]">
              {line.name} × {line.qty.toLocaleString("vi-VN")} {line.unit}
            </span>
          ))}
        </div>

        {/* Status indicator */}
        {order.status === "shipping" && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586" />
            </svg>
            <p className="text-xs font-medium text-blue-800">Đơn hàng đang được vận chuyển đến nhà thuốc.</p>
          </div>
        )}

        {/* Receipt upload — warehouse/admin only, for shipping orders */}
        {order.status === "shipping" && canUploadReceiptProof && !isConfirmed && (
          <div className="mb-3">
            <button
              type="button"
              onClick={onToggleExpand}
              className="text-xs font-semibold text-white bg-[#0F766E] px-3 py-2 rounded-lg hover:bg-[#0d6460] transition-colors"
            >
              {isExpanded ? "Ẩn biên bản" : "Xác nhận nhận hàng & Tải biên bản"}
            </button>
            {isExpanded && (
              <ReceiptUploadPanel
                orderId={order.id}
                accentColor="#0F766E"
                onConfirmed={onConfirmed}
              />
            )}
          </div>
        )}
        {isConfirmed && (
          <div className="mb-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-green-700">Đã xác nhận nhập kho</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#E4EAE7]">
          <div className="flex gap-2">
            {order.status === "shipping" && !canUploadReceiptProof && (
              <span className="text-xs font-medium text-blue-600">
                Kiểm tra hàng khi nhận
              </span>
            )}
          </div>
          <Link href={`/pharmacy/orders/${order.id}`}>
            <span className="text-xs text-[#0F766E] font-medium cursor-pointer hover:underline">Xem chi tiết →</span>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

export default function PharmacyOrdersPage() {
  const { canUploadReceiptProof } = useRole();
  const [activeTab, setActiveTab] = useState("all");
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);
  const [confirmedOrders, setConfirmedOrders] = useState<Set<string>>(new Set());

  const filtered = MOCK_ORDERS.filter((o) => {
    const tab = TABS.find((t) => t.key === activeTab);
    if (!tab || !tab.statuses) return true;
    return tab.statuses.includes(o.status);
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <PageHeader
        title="Đơn hàng"
        subtitle="Theo dõi toàn bộ đơn hàng của nhà thuốc"
        actions={
          <Link href="/pharmacy/orders/new">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] text-white text-sm font-medium rounded-xl cursor-pointer hover:bg-[#0d6460]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo đơn hàng
            </span>
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#E4EAE7] rounded-xl p-1 mb-6 flex-wrap">
        {TABS.map((tab) => {
          const count =
            tab.statuses === null
              ? MOCK_ORDERS.length
              : MOCK_ORDERS.filter((o) => (tab.statuses as OrderStatus[]).includes(o.status)).length;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[#0F766E] text-white shadow-sm"
                  : "text-[#6B7A73] hover:text-[#10231C] hover:bg-[#F6F8F7]"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-[#E4EAE7] text-[#6B7A73]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card className="border border-[#E4EAE7]">
          <CardBody className="p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-semibold text-[#10231C]">Không có đơn hàng nào</p>
            <p className="text-sm text-[#6B7A73] mt-1">Tạo đơn hàng mới để bắt đầu.</p>
            <Link href="/pharmacy/orders/new">
              <span className="inline-flex mt-4 px-5 py-2.5 bg-[#0F766E] text-white text-sm font-medium rounded-xl cursor-pointer hover:bg-[#0d6460]">
                Tạo đơn hàng
              </span>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              canUploadReceiptProof={canUploadReceiptProof}
              isExpanded={expandedReceipt === order.id}
              onToggleExpand={() => setExpandedReceipt(expandedReceipt === order.id ? null : order.id)}
              isConfirmed={confirmedOrders.has(order.id)}
              onConfirmed={() => {
                setConfirmedOrders((prev) => new Set([...prev, order.id]));
                setExpandedReceipt(null);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
