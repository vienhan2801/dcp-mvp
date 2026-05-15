"use client";
import { useApp } from "@/lib/store";
import { fmtVND, fmtDate, pct } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import { Card, CardBody, Progress } from "@/components/ui";
import Link from "next/link";

export default function SupplierContractsPage() {
  const { state } = useApp();
  const { contract } = state;
  const requestedPct = pct(contract.requestedValue, contract.totalContractValue);
  const deliveredPct = pct(contract.deliveredValue, contract.totalContractValue);
  const paidPct = pct(contract.paidValue, contract.deliveredValue || 1);

  return (
    <div>
      <PageHeader
        title="Danh sách hợp đồng"
        subtitle="Các hợp đồng cung ứng dược phẩm đang thực hiện"
      />
      <div className="flex flex-col gap-4">
        <Card className="bg-white border border-[#E4EAE7] shadow-sm hover:shadow-md transition-shadow">
          <CardBody className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <StatusChip label="Đang hoạt động" color="success" />
                  <span className="text-xs text-[#6B7A73]">{contract.contractCode}</span>
                  <span className="text-xs text-[#6B7A73]">·</span>
                  <span className="text-xs text-[#6B7A73]">Gói thầu: {contract.tenderCode}</span>
                </div>
                <h3 className="font-semibold text-[#10231C] text-base mb-1">{contract.contractName}</h3>
                <p className="text-sm text-[#6B7A73]">
                  Bệnh viện: <span className="text-[#10231C] font-medium">{contract.hospitalName}</span>
                </p>
                <p className="text-sm text-[#6B7A73] mt-0.5">
                  Hiệu lực: {fmtDate(contract.startDate)} → {fmtDate(contract.endDate)}
                </p>
                <p className="text-sm text-[#6B7A73] mt-0.5">
                  Điều khoản TT: {contract.paymentTerm}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#024430]">{fmtVND(contract.totalContractValue)}</p>
                <p className="text-xs text-[#6B7A73]">Tổng giá trị hợp đồng</p>
                <p className="text-sm font-semibold text-[#6B7A73] mt-1">Còn lại: {fmtVND(contract.remainingValue)}</p>
              </div>
            </div>

            {/* Progress bars */}
            <div className="mt-5 flex flex-col gap-3">
              {[
                { label: "Yêu cầu / Hợp đồng", p: requestedPct, color: "bg-blue-400" },
                { label: "Đã giao / Hợp đồng", p: deliveredPct, color: "bg-[#024430]" },
                { label: "Đã thanh toán / Đã giao", p: paidPct, color: "bg-purple-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#6B7A73]">{item.label}</span>
                    <span className="font-semibold text-[#10231C]">{item.p}%</span>
                  </div>
                  <div className="w-full bg-[#E4EAE7] rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${item.color}`}
                      style={{ width: `${Math.min(100, item.p)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary row */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Đã yêu cầu", value: fmtVND(contract.requestedValue) },
                { label: "Đã xác nhận", value: fmtVND(contract.confirmedValue) },
                { label: "Đã giao", value: fmtVND(contract.deliveredValue) },
                { label: "Đã thanh toán", value: fmtVND(contract.paidValue) },
              ].map((s) => (
                <div key={s.label} className="bg-[#F6F8F7] rounded-lg p-2 text-center">
                  <p className="text-[10px] text-[#6B7A73]">{s.label}</p>
                  <p className="text-xs font-bold text-[#10231C] mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <Link href={`/supplier/contracts/${contract.id}`}>
                <span className="inline-flex items-center gap-1 px-4 py-2 bg-[#024430] text-white text-sm font-medium rounded-xl cursor-pointer hover:bg-[#056246] transition-colors">
                  Xem chi tiết hợp đồng →
                </span>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
