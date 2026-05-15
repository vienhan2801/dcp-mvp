"use client";
import { AggregationItem } from "@/domain/models/aggregation";
import { fmtNum, fmtVND } from "@/lib/format";
import { Chip } from "@/components/ui";

interface Props {
  items: AggregationItem[];
  unitPriceMap: Record<string, number>;
}

export default function AggregationTable({ items, unitPriceMap }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#F6F8F7] text-[#6B7A73] text-xs">
            {["Sản phẩm", "Tổng yêu cầu", "Tổng xác nhận", "Chênh lệch", "Đã giao", "Tỷ lệ XN", "Trạng thái"].map((h) => (
              <th key={h} className="px-3 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const hasGap = item.gap > 0;
            const pct = Math.round(item.fulfillmentRate * 100);
            return (
              <tr key={item.productCode} className={`border-t border-[#E4EAE7] transition-colors ${hasGap ? "bg-amber-50/30" : "hover:bg-[#F6F8F7]"}`}>
                <td className="px-3 py-3">
                  <p className="font-semibold text-[#10231C]">{item.productName}</p>
                  <p className="text-xs text-[#6B7A73]">{item.productCode}</p>
                </td>
                <td className="px-3 py-3 text-right font-medium">{fmtNum(item.totalRequested)} {item.unit}</td>
                <td className="px-3 py-3 text-right">
                  <span className={`font-semibold ${pct < 100 ? "text-amber-600" : "text-[#138A5B]"}`}>
                    {fmtNum(item.totalConfirmed)} {item.unit}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  {hasGap ? (
                    <span className="font-bold text-[#D92D20]">-{fmtNum(item.gap)}</span>
                  ) : (
                    <span className="text-[#138A5B]">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right text-[#138A5B]">{fmtNum(item.totalDelivered)}</td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 bg-[#E4EAE7] rounded-full h-2">
                      <div className={`h-2 rounded-full ${pct >= 100 ? "bg-[#138A5B]" : pct >= 80 ? "bg-amber-500" : "bg-[#D92D20]"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-10 text-right ${pct >= 100 ? "text-[#138A5B]" : "text-amber-600"}`}>{pct}%</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  {hasGap ? (
                    <Chip color="warning" variant="flat" size="sm">Còn thiếu {fmtNum(item.gap)}</Chip>
                  ) : (
                    <Chip color="success" variant="flat" size="sm">Đủ hàng</Chip>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
