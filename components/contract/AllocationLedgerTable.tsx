"use client";
import { ContractItem } from "@/domain/models/contract";
import { fmtVND, fmtNum, fmtDate } from "@/lib/format";
import { ALLOCATION_STATUS_LABELS, ALLOCATION_STATUS_COLORS } from "@/lib/constants";
import { Chip } from "@/components/ui";

interface Props { items: ContractItem[] }

export default function AllocationLedgerTable({ items }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#F6F8F7] text-[#6B7A73] text-xs">
            {["Thuốc", "Hoạt chất", "Quy cách", "SL HĐ", "Đơn giá", "GT HĐ", "Đã yêu cầu", "Đã xác nhận", "Đã giao", "Còn lại", "GT còn lại", "Hạn dùng", "Số lô", "Trạng thái"].map((h) => (
              <th key={h} className="px-3 py-3 text-left font-semibold whitespace-nowrap first:rounded-tl-lg last:rounded-tr-lg">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const contractValue = item.contractedQty * item.unitPrice;
            const remainingValue = item.remainingQty * item.unitPrice;
            const confirmPct = item.requestedQty > 0 ? Math.round((item.confirmedQty / item.requestedQty) * 100) : 0;
            return (
              <tr key={item.id} className="border-t border-[#E4EAE7] hover:bg-[#F6F8F7] transition-colors">
                <td className="px-3 py-3">
                  <p className="font-semibold text-[#10231C]">{item.productName}</p>
                  <p className="text-xs text-[#6B7A73]">{item.productCode}</p>
                </td>
                <td className="px-3 py-3 text-[#6B7A73] text-xs">{item.activeIngredient}</td>
                <td className="px-3 py-3 text-[#6B7A73] text-xs whitespace-nowrap">{item.specification}</td>
                <td className="px-3 py-3 text-right font-semibold">{fmtNum(item.contractedQty)}</td>
                <td className="px-3 py-3 text-right">{fmtVND(item.unitPrice)}</td>
                <td className="px-3 py-3 text-right font-semibold text-[#024430]">{fmtVND(contractValue)}</td>
                <td className="px-3 py-3 text-right">{fmtNum(item.requestedQty)}</td>
                <td className="px-3 py-3 text-right">
                  <span className="font-semibold text-[#024430]">{fmtNum(item.confirmedQty)}</span>
                  {item.requestedQty > 0 && item.confirmedQty < item.requestedQty && (
                    <span className="text-xs text-amber-600 ml-1">({confirmPct}%)</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right text-[#138A5B]">{fmtNum(item.deliveredQty)}</td>
                <td className="px-3 py-3 text-right font-bold">{fmtNum(item.remainingQty)}</td>
                <td className="px-3 py-3 text-right font-bold text-[#024430]">{fmtVND(remainingValue)}</td>
                <td className="px-3 py-3 text-xs whitespace-nowrap">{fmtDate(item.expiryDate)}</td>
                <td className="px-3 py-3 text-xs font-mono text-[#6B7A73] whitespace-nowrap">{item.batchNo}</td>
                <td className="px-3 py-3">
                  <Chip color={ALLOCATION_STATUS_COLORS[item.status]} variant="flat" size="sm">
                    {ALLOCATION_STATUS_LABELS[item.status]}
                  </Chip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
