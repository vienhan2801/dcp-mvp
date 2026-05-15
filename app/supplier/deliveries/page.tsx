"use client";
import { useApp } from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { fmtVND, fmtDate } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, NEXT_DELIVERY_ACTION } from "@/lib/constants";
import PageHeader from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import FileUpload from "@/components/FileUpload";
import { Card, CardBody, Button } from "@/components/ui";
import { Truck } from "lucide-react";
import Link from "next/link";

export default function SupplierDeliveriesPage() {
  const { state } = useApp();
  const { isNPPFinance, canUploadDispatchProof } = useRole();
  const canAct = canUploadDispatchProof;
  const deliveryOrders = state.orders.filter((o) =>
    ["confirmed", "partially_confirmed", "preparing", "shipping", "delivered"].includes(o.status)
  );

  const statusStep: Record<string, number> = {
    confirmed: 1, partially_confirmed: 1, preparing: 2, shipping: 3, delivered: 4,
  };

  return (
    <div>
      <PageHeader title="Quản lý giao hàng" subtitle="Theo dõi tiến độ vận chuyển đơn hàng" />
      {isNPPFinance && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <span className="text-base leading-none">👤</span>
          <p className="text-sm text-blue-800">
            Vai trò <strong>Tài chính</strong> — Chỉ xem · Cập nhật giao hàng thuộc phạm vi Kho vận
          </p>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {deliveryOrders.length === 0 && (
          <Card>
            <CardBody className="p-8 text-center text-[#6B7A73]">Không có đơn hàng đang trong quá trình giao hàng</CardBody>
          </Card>
        )}
        {deliveryOrders.map((order) => {
          const step = statusStep[order.status] || 0;
          const steps = ["Đã xác nhận", "Chuẩn bị hàng", "Vận chuyển", "Đã giao"];
          return (
            <Card key={order.id}>
              <CardBody className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[#10231C]">{order.id}</p>
                      <StatusChip label={ORDER_STATUS_LABELS[order.status]} color={ORDER_STATUS_COLORS[order.status]} />
                    </div>
                    <p className="text-sm text-[#6B7A73]">{order.deliveryLocation}</p>
                    <p className="text-xs text-[#6B7A73]">Giao ngày: {fmtDate(order.requestedDeliveryDate)}</p>

                    {/* Timeline */}
                    <div className="mt-4 flex items-center gap-0">
                      {steps.map((s, i) => (
                        <div key={s} className="flex items-center">
                          <div className={`flex flex-col items-center`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < step ? "bg-[#024430] text-white" : i === step ? "bg-[#024430]/20 text-[#024430] border-2 border-[#024430]" : "bg-[#E4EAE7] text-[#6B7A73]"}`}>
                              {i < step ? "✓" : i + 1}
                            </div>
                            <span className={`text-xs mt-1 whitespace-nowrap ${i < step ? "text-[#024430] font-medium" : "text-[#6B7A73]"}`}>{s}</span>
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`h-0.5 w-10 mx-1 mb-4 ${i < step - 1 ? "bg-[#024430]" : "bg-[#E4EAE7]"}`} />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Dispatch proof upload — logistics/admin only when delivery is active */}
                    {canAct && NEXT_DELIVERY_ACTION[order.status] && (
                      <div className="mt-4 p-4 bg-[#F6F8F7] border border-[#E4EAE7] rounded-xl">
                        <FileUpload
                          label="Phiếu xuất kho / biên bản giao hàng"
                          hint="Ảnh biên bản, phiếu giao hàng ký xác nhận"
                          accentColor="#024430"
                          maxFiles={3}
                        />
                      </div>
                    )}
                    {isNPPFinance && NEXT_DELIVERY_ACTION[order.status] && (
                      <div className="mt-4 p-3 rounded-xl border border-amber-200 bg-amber-50 flex items-center gap-2">
                        <span className="text-sm text-amber-800">Kho vận phụ trách phần này</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-[#024430]">{fmtVND(order.totalConfirmedAmount)}</p>
                    <Link href={`/supplier/orders/${order.id}`}>
                      <Button size="sm" className="mt-2 bg-[#024430] text-white flex items-center gap-1" isDisabled={!canAct}>
                        <Truck size={14} />
                        {NEXT_DELIVERY_ACTION[order.status] ? "Cập nhật" : "Xem chi tiết"}
                      </Button>
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
