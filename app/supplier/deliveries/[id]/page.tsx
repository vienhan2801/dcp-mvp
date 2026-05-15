"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader, Chip, Button } from "@/components/ui";
import { fmtVND, fmtDate } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryStatus = "preparing" | "shipping" | "delivered";

interface DeliveryLine {
  drug: string;
  lot: string;
  mfgDate: string;
  expDate: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

interface Delivery {
  orderId: string;
  customer: string;
  createdAt: string;
  deliveryDate: string;
  status: DeliveryStatus;
  driver: string;
  vehicle: string;
  address: string;
  lines: DeliveryLine[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const DELIVERIES: Record<string, Delivery> = {
  "DEL-2026-001": {
    orderId: "ORD-2026-001",
    customer: "BV Chợ Rẫy",
    createdAt: "2026-05-01",
    deliveryDate: "2026-05-10",
    status: "delivered",
    driver: "Nguyễn Văn Hùng",
    vehicle: "51B-12345",
    address: "201B Nguyễn Chí Thanh, Q5, TP.HCM",
    lines: [
      {
        drug: "Paracetamol 500mg",
        lot: "L2026-001",
        mfgDate: "2026-01-15",
        expDate: "2028-01-14",
        qty: 5000,
        unit: "Viên",
        unitPrice: 800,
      },
      {
        drug: "Amoxicillin 500mg",
        lot: "L2026-003",
        mfgDate: "2026-02-20",
        expDate: "2027-02-19",
        qty: 2000,
        unit: "Viên",
        unitPrice: 1200,
      },
    ],
  },
  "DEL-2026-002": {
    orderId: "ORD-2026-002",
    customer: "Nhà thuốc Phúc Khang",
    createdAt: "2026-05-05",
    deliveryDate: "2026-05-12",
    status: "shipping",
    driver: "Trần Minh Đức",
    vehicle: "51C-98765",
    address: "45 Lê Văn Sỹ, Q3, TP.HCM",
    lines: [
      {
        drug: "Azithromycin 500mg",
        lot: "L2026-007",
        mfgDate: "2026-03-01",
        expDate: "2028-02-28",
        qty: 500,
        unit: "Viên",
        unitPrice: 3500,
      },
    ],
  },
};

const FALLBACK_ID = "DEL-2026-001";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isExpiryWithin12Months(expDate: string): boolean {
  const exp = new Date(expDate);
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() + 12);
  return exp <= threshold;
}

function StatusBadge({ status }: { status: DeliveryStatus }) {
  if (status === "preparing") {
    return (
      <Chip color="warning" variant="flat" size="md">
        Đang chuẩn bị
      </Chip>
    );
  }
  if (status === "shipping") {
    return (
      <Chip color="primary" variant="flat" size="md">
        Đang vận chuyển
      </Chip>
    );
  }
  return (
    <Chip color="success" variant="flat" size="md">
      Đã giao
    </Chip>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DeliveryDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : FALLBACK_ID;
  const data = DELIVERIES[id] ?? DELIVERIES[FALLBACK_ID];

  const [status, setStatus] = useState<DeliveryStatus>(data.status);
  const [deliveredAt] = useState<string>(
    data.status === "delivered" ? new Date().toISOString() : ""
  );
  const [confirmedAt, setConfirmedAt] = useState<string>(
    data.status === "delivered" ? new Date().toLocaleString("vi-VN") : ""
  );

  const total = data.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);

  function handleStartShipping() {
    setStatus("shipping");
  }

  function handleConfirmDelivered() {
    setStatus("delivered");
    setConfirmedAt(new Date().toLocaleString("vi-VN"));
  }

  return (
    <div className="bg-[#F6F8F7] min-h-screen -m-6 p-6">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/supplier/deliveries">
          <Button variant="flat" size="sm" className="text-[#6B7A73]">
            ← Quay lại danh sách giao hàng
          </Button>
        </Link>
      </div>

      {/* Page header with status badge */}
      <div className="flex items-start gap-3 mb-6">
        <div className="flex-1">
          <PageHeader
            title={id}
            subtitle="Chi tiết lô giao hàng"
          />
        </div>
        <div className="mt-1">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Left — Order lines table (2/3) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-[#10231C] pb-3">Danh sách sản phẩm</p>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4EAE7] bg-[#F6F8F7]">
                      {[
                        "Sản phẩm",
                        "Số lô",
                        "Ngày SX",
                        "Hạn dùng",
                        "SL",
                        "Đơn vị",
                        "Đơn giá",
                        "Thành tiền",
                      ].map((col) => (
                        <th
                          key={col}
                          className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73] whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.lines.map((line) => {
                      const expWarn = isExpiryWithin12Months(line.expDate);
                      return (
                        <tr
                          key={line.lot}
                          className="border-b border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors"
                        >
                          <td className="px-3 py-3 text-sm font-medium text-[#10231C] whitespace-nowrap">
                            {line.drug}
                          </td>
                          <td className="px-3 py-3 text-sm text-[#6B7A73] whitespace-nowrap font-mono">
                            {line.lot}
                          </td>
                          <td className="px-3 py-3 text-sm text-[#6B7A73] whitespace-nowrap">
                            {fmtDate(line.mfgDate)}
                          </td>
                          <td className="px-3 py-3 text-sm whitespace-nowrap">
                            <span
                              className={
                                expWarn
                                  ? "text-amber-600 font-semibold"
                                  : "text-[#6B7A73]"
                              }
                            >
                              {fmtDate(line.expDate)}
                              {expWarn && (
                                <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                  Gần hết HSD
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-sm text-[#10231C] text-right whitespace-nowrap">
                            {new Intl.NumberFormat("vi-VN").format(line.qty)}
                          </td>
                          <td className="px-3 py-3 text-sm text-[#6B7A73] whitespace-nowrap">
                            {line.unit}
                          </td>
                          <td className="px-3 py-3 text-sm text-[#10231C] text-right whitespace-nowrap">
                            {new Intl.NumberFormat("vi-VN").format(line.unitPrice)} ₫
                          </td>
                          <td className="px-3 py-3 text-sm font-semibold text-[#10231C] text-right whitespace-nowrap">
                            {fmtVND(line.qty * line.unitPrice)}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Total row */}
                    <tr className="border-t-2 border-[#E4EAE7] bg-[#F6F8F7]">
                      <td
                        colSpan={7}
                        className="px-3 py-3 text-sm font-semibold text-[#10231C] text-right"
                      >
                        Tổng cộng
                      </td>
                      <td className="px-3 py-3 text-sm font-bold text-[#024430] text-right whitespace-nowrap">
                        {fmtVND(total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right — Info card (1/3) */}
        <div>
          <Card>
            <CardHeader>
              <p className="text-sm font-semibold text-[#10231C] pb-3">Thông tin giao hàng</p>
            </CardHeader>
            <CardBody className="pt-0 space-y-3">
              <div>
                <p className="text-xs text-[#6B7A73] mb-0.5">Đơn hàng gốc</p>
                <Link
                  href={`/supplier/orders/${data.orderId}`}
                  className="text-sm font-semibold text-[#024430] hover:underline"
                >
                  {data.orderId}
                </Link>
              </div>
              <div>
                <p className="text-xs text-[#6B7A73] mb-0.5">Khách hàng</p>
                <p className="text-sm font-medium text-[#10231C]">{data.customer}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7A73] mb-0.5">Địa chỉ giao</p>
                <p className="text-sm text-[#10231C] leading-snug">{data.address}</p>
              </div>
              <div className="border-t border-[#E4EAE7] pt-3">
                <p className="text-xs text-[#6B7A73] mb-0.5">Ngày tạo phiếu</p>
                <p className="text-sm text-[#10231C]">{fmtDate(data.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7A73] mb-0.5">Ngày giao dự kiến</p>
                <p className="text-sm font-medium text-[#10231C]">{fmtDate(data.deliveryDate)}</p>
              </div>
              <div className="border-t border-[#E4EAE7] pt-3">
                <p className="text-xs text-[#6B7A73] mb-0.5">Tài xế</p>
                <p className="text-sm font-medium text-[#10231C]">{data.driver}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7A73] mb-0.5">Biển số xe</p>
                <p className="text-sm font-mono font-semibold text-[#10231C]">{data.vehicle}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Action panel */}
      <Card className="mb-4">
        <CardBody>
          {status === "preparing" && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#10231C]">Lô hàng đang được chuẩn bị</p>
                <p className="text-xs text-[#6B7A73] mt-0.5">
                  Xác nhận để bắt đầu quá trình vận chuyển
                </p>
              </div>
              <Button color="primary" onClick={handleStartShipping}>
                Bắt đầu vận chuyển
              </Button>
            </div>
          )}

          {status === "shipping" && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#10231C]">Lô hàng đang trên đường giao</p>
                <p className="text-xs text-[#6B7A73] mt-0.5">
                  Xác nhận sau khi khách hàng đã nhận hàng
                </p>
              </div>
              <Button color="success" onClick={handleConfirmDelivered}>
                Xác nhận đã giao
              </Button>
            </div>
          )}

          {status === "delivered" && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-700">Đã giao hàng thành công</p>
                {confirmedAt && (
                  <p className="text-xs text-green-600 mt-0.5">Xác nhận lúc: {confirmedAt}</p>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Biên bản giao nhận */}
      <Card>
        <CardHeader>
          <p className="text-sm font-semibold text-[#10231C] pb-3">Biên bản giao nhận</p>
        </CardHeader>
        <CardBody className="pt-0">
          {status === "delivered" ? (
            <div>
              <div className="overflow-x-auto mb-4">
                <table className="w-full min-w-[480px] border-collapse border border-[#E4EAE7] rounded-xl">
                  <thead>
                    <tr className="bg-[#F6F8F7] border-b border-[#E4EAE7]">
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">
                        Sản phẩm
                      </th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">
                        Số lô
                      </th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">
                        Số lượng
                      </th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">
                        Đơn vị
                      </th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-[#6B7A73]">
                        Tình trạng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lines.map((line) => (
                      <tr
                        key={line.lot}
                        className="border-b border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors"
                      >
                        <td className="px-3 py-3 text-sm font-medium text-[#10231C]">
                          {line.drug}
                        </td>
                        <td className="px-3 py-3 text-sm text-[#6B7A73] font-mono">{line.lot}</td>
                        <td className="px-3 py-3 text-sm text-[#10231C] text-right">
                          {new Intl.NumberFormat("vi-VN").format(line.qty)}
                        </td>
                        <td className="px-3 py-3 text-sm text-[#6B7A73]">{line.unit}</td>
                        <td className="px-3 py-3 text-center">
                          <Chip color="success" variant="flat" size="sm">
                            Đã nhận đủ
                          </Chip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-start justify-between pt-4 border-t border-[#E4EAE7]">
                <div>
                  <p className="text-xs text-[#6B7A73] mb-1">Người giao hàng</p>
                  <p className="text-sm font-medium text-[#10231C]">{data.driver}</p>
                  <p className="text-xs text-[#6B7A73] mt-3 mb-1">Chữ ký NV giao hàng:</p>
                  <p className="text-sm text-[#6B7A73] border-b border-[#10231C] w-40 pb-1 mt-4">
                    &nbsp;
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#6B7A73] mb-1">Người nhận hàng</p>
                  <p className="text-sm font-medium text-[#10231C]">{data.customer}</p>
                  <p className="text-xs text-[#6B7A73] mt-3 mb-1">Chữ ký KH: _______</p>
                  <p className="text-sm text-[#6B7A73] border-b border-[#10231C] w-40 pb-1 mt-4">
                    &nbsp;
                  </p>
                </div>
              </div>

              {confirmedAt && (
                <p className="text-xs text-[#6B7A73] mt-4">
                  Thời gian giao nhận: {confirmedAt}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 text-center">
              <div>
                <div className="w-12 h-12 rounded-full bg-[#F6F8F7] flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-[#6B7A73]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#6B7A73]">
                  Biên bản sẽ được tạo sau khi giao hàng
                </p>
                <p className="text-xs text-[#6B7A73] mt-1">
                  Hoàn tất quá trình giao hàng để xem biên bản giao nhận
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
