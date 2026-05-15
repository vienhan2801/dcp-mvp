"use client";
import { OrderStatus } from "@/lib/types";
import { CheckCircle, Clock, Package, Truck, PackageCheck, XCircle } from "lucide-react";

const steps: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: "pending_supplier_confirmation", label: "Chờ xác nhận", icon: <Clock size={16} /> },
  { status: "confirmed", label: "Đã xác nhận", icon: <CheckCircle size={16} /> },
  { status: "preparing", label: "Đang chuẩn bị", icon: <Package size={16} /> },
  { status: "shipping", label: "Đang vận chuyển", icon: <Truck size={16} /> },
  { status: "delivered", label: "Đã giao", icon: <PackageCheck size={16} /> },
  { status: "received_confirmed", label: "Đã nghiệm thu", icon: <CheckCircle size={16} /> },
];

const statusOrder: OrderStatus[] = [
  "pending_supplier_confirmation",
  "confirmed",
  "preparing",
  "shipping",
  "delivered",
  "received_confirmed",
];

export default function OrderStatusTimeline({ currentStatus }: { currentStatus: OrderStatus }) {
  if (currentStatus === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <XCircle size={20} />
        <span className="font-semibold">Đơn hàng đã bị hủy</span>
      </div>
    );
  }
  const currentIdx = statusOrder.indexOf(currentStatus);
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step.status} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              active ? "bg-[#024430] text-white" : done ? "bg-[#024430]/10 text-[#024430]" : "bg-[#F6F8F7] text-[#6B7A73]"
            }`}>
              {step.icon}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-px w-4 ${done || active ? "bg-[#024430]" : "bg-[#E4EAE7]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
