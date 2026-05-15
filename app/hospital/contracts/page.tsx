"use client";
import { fmtVND, fmtDate, pct } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, Progress, Chip } from "@/components/ui";
import Link from "next/link";
import { mockContracts } from "@/domain/mock/contracts";
import { Contract } from "@/domain/models/contract";

const STATUS_CONFIG: Record<string, { label: string; color: string; badge: string }> = {
  active:  { label: "Đang hoạt động", color: "bg-emerald-100 text-emerald-800 border-emerald-200", badge: "bg-emerald-500" },
  expired: { label: "Đã hết hạn",     color: "bg-gray-100 text-gray-600 border-gray-200",          badge: "bg-gray-400"    },
  draft:   { label: "Nháp",           color: "bg-blue-100 text-blue-700 border-blue-200",           badge: "bg-blue-400"    },
};

function ContractCard({ contract }: { contract: Contract }) {
  const requestedPct = pct(contract.requestedValue, contract.totalContractValue);
  const deliveredPct = pct(contract.deliveredValue, contract.totalContractValue);
  const status = STATUS_CONFIG[contract.contractStatus] ?? STATUS_CONFIG.expired;
  const isActive = contract.contractStatus === "active";

  return (
    <Card className={`border-2 hover:shadow-md transition-shadow ${isActive ? "border-[#024430]/30" : "border-[#E4EAE7]"}`}>
      <CardBody className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>
                {status.label}
              </span>
              <span className="text-xs text-[#6B7A73] font-mono">{contract.contractCode}</span>
              <span className="text-xs text-[#6B7A73]">·</span>
              <span className="text-xs text-[#6B7A73]">Gói thầu: {contract.tenderCode}</span>
            </div>
            <h3 className="font-semibold text-[#10231C] text-base mb-1 leading-tight">{contract.contractName}</h3>
            <p className="text-sm text-[#6B7A73]">
              NPP: <strong className="text-[#10231C]">{contract.supplierName}</strong>
            </p>
            <p className="text-sm text-[#6B7A73] mt-0.5">
              Hiệu lực: {fmtDate(contract.startDate)} → {fmtDate(contract.endDate)}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold text-[#024430]">{fmtVND(contract.totalContractValue)}</p>
            <p className="text-xs text-[#6B7A73]">Tổng giá trị</p>
            <p className="text-sm font-semibold text-[#6B7A73] mt-1">Còn lại: {fmtVND(contract.remainingValue)}</p>
          </div>
        </div>

        {/* Progress bars */}
        <div className="mt-4 flex flex-col gap-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#6B7A73]">Đã sử dụng</span>
              <span className="font-semibold text-[#024430]">{requestedPct}%</span>
            </div>
            <Progress value={requestedPct} />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#6B7A73]">Đã giao hàng</span>
              <span className="font-semibold text-emerald-700">{deliveredPct}%</span>
            </div>
            <div className="w-full bg-[#E4EAE7] rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, deliveredPct)}%` }} />
            </div>
          </div>
        </div>

        {/* Product chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {contract.items.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5 bg-[#F6F8F7] border border-[#E4EAE7] rounded-lg px-2.5 py-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${status.badge}`} />
              <span className="text-xs font-medium text-[#10231C]">{item.productName}</span>
              <span className="text-[10px] text-[#6B7A73]">
                ({item.remainingQty.toLocaleString("vi-VN")} {item.unit} còn lại)
              </span>
            </div>
          ))}
        </div>

        {/* Financial summary */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "Đã đặt hàng", value: contract.requestedValue, color: "text-[#024430]" },
            { label: "Đã thanh toán", value: contract.paidValue, color: "text-emerald-700" },
            { label: "Còn nợ", value: contract.outstandingValue, color: contract.outstandingValue > 0 ? "text-orange-600" : "text-[#6B7A73]" },
          ].map((s) => (
            <div key={s.label} className="bg-[#F6F8F7] rounded-xl p-3 text-center">
              <p className={`text-sm font-bold ${s.color}`}>{fmtVND(s.value)}</p>
              <p className="text-[10px] text-[#6B7A73] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <Link href={`/hospital/contracts/${contract.id}`}>
            <span className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-xl cursor-pointer transition-colors ${
              isActive
                ? "bg-[#024430] text-white hover:bg-[#056246]"
                : "bg-[#F6F8F7] text-[#6B7A73] border border-[#E4EAE7] hover:bg-white"
            }`}>
              {isActive ? "Xem chi tiết & Đặt hàng →" : "Xem lịch sử hợp đồng →"}
            </span>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

export default function HospitalContractsPage() {
  const active = mockContracts.filter((c) => c.contractStatus === "active");
  const others = mockContracts.filter((c) => c.contractStatus !== "active");

  const totalValue = mockContracts.reduce((s, c) => s + c.totalContractValue, 0);
  const totalPaid  = mockContracts.reduce((s, c) => s + c.paidValue, 0);
  const outstanding = mockContracts.reduce((s, c) => s + c.outstandingValue, 0);

  return (
    <div>
      <PageHeader
        title="Hợp đồng của tôi"
        subtitle="Tất cả hợp đồng cung ứng thuốc theo đấu thầu"
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Tổng giá trị hợp đồng", value: fmtVND(totalValue), icon: "📋" },
          { label: "Tổng đã thanh toán",     value: fmtVND(totalPaid),  icon: "✅" },
          { label: "Còn công nợ",             value: fmtVND(outstanding), icon: "⏳" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-[#E4EAE7] rounded-2xl p-4 text-center">
            <p className="text-xl mb-1">{kpi.icon}</p>
            <p className="text-lg font-bold text-[#10231C]">{kpi.value}</p>
            <p className="text-xs text-[#6B7A73] mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Active contracts */}
      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#10231C] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Đang hoạt động ({active.length})
          </h2>
          <div className="flex flex-col gap-4">
            {active.map((c) => <ContractCard key={c.id} contract={c} />)}
          </div>
        </div>
      )}

      {/* Historical contracts */}
      {others.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#6B7A73] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block"></span>
            Lịch sử ({others.length})
          </h2>
          <div className="flex flex-col gap-4">
            {others.map((c) => <ContractCard key={c.id} contract={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}
