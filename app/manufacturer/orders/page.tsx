"use client";
import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Chip } from "@/components/ui";

// ── Mock Data ────────────────────────────────────────────────
type OrderStatus = "pending" | "processing" | "shipped" | "completed";

interface OrderItem {
  name: string;
  qty: number;
  unit: string;
}

interface DistributorOrder {
  id: string;
  distributor: string;
  distributorCode: string;
  date: string;
  items: OrderItem[];
  totalQty: number;
  status: OrderStatus;
  note?: string;
}

const MOCK_ORDERS: DistributorOrder[] = [
  {
    id: "DPO-2026-041",
    distributor: "Công ty TNHH Dược Minh Long",
    distributorCode: "NP-ML-001",
    date: "2026-05-06",
    items: [
      { name: "Amoxicillin 500mg", qty: 10000, unit: "Viên" },
      { name: "Paracetamol 650mg", qty: 8000, unit: "Viên" },
      { name: "Metformin 850mg", qty: 5000, unit: "Viên" },
    ],
    totalQty: 23000,
    status: "pending",
    note: "Giao hàng trước 10/05/2026",
  },
  {
    id: "DPO-2026-040",
    distributor: "Dược phẩm Bình Minh",
    distributorCode: "NP-BM-002",
    date: "2026-05-05",
    items: [
      { name: "Omeprazole 20mg", qty: 6000, unit: "Viên" },
      { name: "Atorvastatin 20mg", qty: 4000, unit: "Viên" },
    ],
    totalQty: 10000,
    status: "pending",
  },
  {
    id: "DPO-2026-038",
    distributor: "Công ty CP Dược Hà Nội",
    distributorCode: "NP-HN-003",
    date: "2026-05-04",
    items: [
      { name: "Cetirizine 10mg", qty: 12000, unit: "Viên" },
      { name: "Azithromycin 250mg", qty: 6000, unit: "Viên" },
    ],
    totalQty: 18000,
    status: "processing",
  },
  {
    id: "DPO-2026-035",
    distributor: "Dược phẩm Sài Gòn",
    distributorCode: "NP-SG-004",
    date: "2026-05-01",
    items: [
      { name: "Amoxicillin 500mg", qty: 20000, unit: "Viên" },
      { name: "Paracetamol 650mg", qty: 15000, unit: "Viên" },
      { name: "Metformin 850mg", qty: 8000, unit: "Viên" },
      { name: "Omeprazole 20mg", qty: 5000, unit: "Viên" },
      { name: "Atorvastatin 20mg", qty: 3000, unit: "Viên" },
    ],
    totalQty: 51000,
    status: "shipped",
  },
  {
    id: "DPO-2026-031",
    distributor: "Công ty TNHH Dược Minh Long",
    distributorCode: "NP-ML-001",
    date: "2026-04-28",
    items: [
      { name: "Salbutamol 2mg/5ml", qty: 2000, unit: "Chai" },
      { name: "Cetirizine 10mg", qty: 8000, unit: "Viên" },
    ],
    totalQty: 10000,
    status: "completed",
  },
  {
    id: "DPO-2026-028",
    distributor: "Dược phẩm Bình Minh",
    distributorCode: "NP-BM-002",
    date: "2026-04-22",
    items: [
      { name: "Amoxicillin 500mg", qty: 15000, unit: "Viên" },
    ],
    totalQty: 15000,
    status: "completed",
  },
];

type FilterTab = "all" | "pending" | "processing" | "shipped" | "completed";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xử lý" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipped", label: "Đã giao vận" },
  { key: "completed", label: "Hoàn thành" },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; chipColor: "warning" | "primary" | "secondary" | "success" | "default" }> = {
  pending:    { label: "Chờ xử lý", chipColor: "warning" },
  processing: { label: "Đang xử lý", chipColor: "primary" },
  shipped:    { label: "Đã giao vận", chipColor: "secondary" },
  completed:  { label: "Hoàn thành", chipColor: "success" },
};

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  pending:    "processing",
  processing: "shipped",
  shipped:    "completed",
  completed:  null,
};

const STATUS_ACTION: Record<OrderStatus, string | null> = {
  pending:    "Xác nhận",
  processing: "Đánh dấu giao vận",
  shipped:    "Hoàn thành",
  completed:  null,
};

function fmtNum(n: number) {
  return n.toLocaleString("vi-VN");
}

export default function ManufacturerOrdersPage() {
  const [orders, setOrders] = useState<DistributorOrder[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = orders.filter((o) => activeTab === "all" || o.status === activeTab);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  function advanceStatus(orderId: string) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const next = STATUS_FLOW[o.status];
        return next ? { ...o, status: next } : o;
      })
    );
  }

  return (
    <div>
      <PageHeader
        title="Đơn từ nhà phân phối"
        subtitle="Quản lý đơn đặt hàng từ các nhà phân phối"
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-[#024430] text-white"
                : "bg-white border border-[#E4EAE7] text-[#6B7A73] hover:bg-[#F6F8F7]"
            }`}
          >
            {tab.label}
            {tab.key === "pending" && pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Status flow legend */}
      <div className="flex items-center gap-2 mb-5 text-xs text-[#6B7A73] bg-white border border-[#E4EAE7] rounded-xl px-4 py-2.5 w-fit">
        {(["pending", "processing", "shipped", "completed"] as OrderStatus[]).map((s, i, arr) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`font-medium ${s === "pending" ? "text-amber-600" : s === "processing" ? "text-blue-600" : s === "shipped" ? "text-purple-600" : "text-emerald-600"}`}>
              {STATUS_CONFIG[s].label}
            </span>
            {i < arr.length - 1 && <span className="text-[#E4EAE7]">→</span>}
          </div>
        ))}
      </div>

      <p className="text-xs text-[#6B7A73] mb-4">{filtered.length} đơn hàng</p>

      <div className="flex flex-col gap-4">
        {filtered.length === 0 && (
          <Card>
            <CardBody className="py-12 text-center text-[#6B7A73]">
              Không có đơn hàng nào trong danh mục này.
            </CardBody>
          </Card>
        )}
        {filtered.map((order) => {
          const sc = STATUS_CONFIG[order.status];
          const actionLabel = STATUS_ACTION[order.status];
          return (
            <Card key={order.id} className={order.status === "pending" ? "border-amber-200 bg-amber-50/30" : ""}>
              <CardBody>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-[#10231C]">{order.id}</span>
                      <Chip color={sc.chipColor} variant="flat" size="sm">{sc.label}</Chip>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#6B7A73]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-semibold text-[#10231C]">{order.distributor}</span>
                      </div>
                      <span className="text-[#6B7A73] text-xs">{order.distributorCode}</span>
                      <span className="text-[#6B7A73] text-xs">{order.date}</span>
                    </div>

                    {/* Items */}
                    <div className="bg-[#F6F8F7] rounded-xl p-3 mb-3">
                      <p className="text-xs font-semibold text-[#6B7A73] mb-2">Danh sách sản phẩm ({order.items.length})</p>
                      <div className="flex flex-col gap-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#024430] flex-shrink-0" />
                              <span className="text-[#10231C]">{item.name}</span>
                            </div>
                            <span className="font-semibold text-[#024430]">{fmtNum(item.qty)} {item.unit}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-[#E4EAE7] mt-2 pt-2 flex justify-between text-sm">
                        <span className="font-semibold text-[#6B7A73]">Tổng số lượng</span>
                        <span className="font-bold text-[#10231C]">{fmtNum(order.totalQty)} đơn vị</span>
                      </div>
                    </div>

                    {order.note && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {order.note}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 sm:min-w-[140px]">
                    {actionLabel && (
                      <button
                        onClick={() => advanceStatus(order.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          order.status === "pending"
                            ? "bg-[#024430] text-white hover:bg-[#056246]"
                            : "bg-[#F6F8F7] border border-[#E4EAE7] text-[#10231C] hover:bg-[#E4EAE7]"
                        }`}
                      >
                        {actionLabel}
                      </button>
                    )}
                    <Link href={`/manufacturer/orders/${order.id}`}>
                      <span className="block px-4 py-2 rounded-xl text-sm font-medium border border-[#E4EAE7] text-[#6B7A73] hover:bg-[#F6F8F7] transition-colors cursor-pointer">
                        Chi tiết
                      </span>
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
