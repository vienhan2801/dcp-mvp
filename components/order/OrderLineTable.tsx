"use client";
import { OrderLine } from "@/domain/models/order";
import { fmtVND, fmtNum } from "@/lib/format";
import { LINE_STATUS_LABELS, LINE_STATUS_COLORS } from "@/lib/constants";
import { Chip } from "@/components/ui";

interface Props {
  lines: OrderLine[];
  showConfirmInput?: boolean;
  confirmValues?: Record<string, number>;
  confirmNotes?: Record<string, string>;
  onConfirmChange?: (lineId: string, qty: number) => void;
  onNoteChange?: (lineId: string, note: string) => void;
}

export default function OrderLineTable({
  lines,
  showConfirmInput = false,
  confirmValues = {},
  confirmNotes = {},
  onConfirmChange,
  onNoteChange,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#F6F8F7] text-[#6B7A73] text-xs">
            <th className="px-3 py-3 text-left font-semibold">Sản phẩm</th>
            <th className="px-3 py-3 text-right font-semibold">Yêu cầu</th>
            <th className="px-3 py-3 text-right font-semibold">Xác nhận</th>
            {showConfirmInput && <th className="px-3 py-3 text-right font-semibold">SL xác nhận (nhập)</th>}
            <th className="px-3 py-3 text-right font-semibold">Đã giao</th>
            <th className="px-3 py-3 text-right font-semibold">Đơn giá</th>
            <th className="px-3 py-3 text-right font-semibold">Giá trị YC</th>
            <th className="px-3 py-3 text-center font-semibold">Trạng thái</th>
            {showConfirmInput && <th className="px-3 py-3 text-left font-semibold">Ghi chú NCC</th>}
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const confirmedVal = confirmValues[line.id] ?? line.confirmedQty;
            const isPartial = line.confirmedQty > 0 && line.confirmedQty < line.requestedQty;
            return (
              <tr key={line.id} className={`border-t border-[#E4EAE7] transition-colors ${isPartial ? "bg-amber-50/40" : "hover:bg-[#F6F8F7]"}`}>
                <td className="px-3 py-3">
                  <p className="font-semibold">{line.productName}</p>
                  <p className="text-xs text-[#6B7A73]">{line.productCode} · {line.unit}</p>
                </td>
                <td className="px-3 py-3 text-right font-medium">{fmtNum(line.requestedQty)}</td>
                <td className="px-3 py-3 text-right">
                  {!showConfirmInput ? (
                    <span className={`font-semibold ${isPartial ? "text-amber-600" : "text-[#024430]"}`}>
                      {fmtNum(line.confirmedQty)}
                      {isPartial && <span className="text-xs ml-1 text-amber-500">(-{fmtNum(line.rejectedQty)})</span>}
                    </span>
                  ) : (
                    <span className="text-[#6B7A73]">{fmtNum(line.confirmedQty)}</span>
                  )}
                </td>
                {showConfirmInput && (
                  <td className="px-3 py-3 text-right">
                    <input
                      type="number"
                      value={confirmedVal || ""}
                      min={0}
                      max={line.requestedQty}
                      onChange={(e) => onConfirmChange?.(line.id, Number(e.target.value))}
                      className="w-24 text-right border border-[#E4EAE7] rounded-lg px-2 py-1 text-sm focus:border-[#024430] outline-none bg-white"
                      placeholder={String(line.requestedQty)}
                    />
                  </td>
                )}
                <td className="px-3 py-3 text-right text-[#138A5B]">{fmtNum(line.deliveredQty)}</td>
                <td className="px-3 py-3 text-right">{fmtVND(line.unitPrice)}</td>
                <td className="px-3 py-3 text-right font-medium">{fmtVND(line.lineAmount)}</td>
                <td className="px-3 py-3 text-center">
                  <Chip color={LINE_STATUS_COLORS[line.status]} variant="flat" size="sm">
                    {LINE_STATUS_LABELS[line.status]}
                  </Chip>
                </td>
                {showConfirmInput && (
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={confirmNotes[line.id] || ""}
                      onChange={(e) => onNoteChange?.(line.id, e.target.value)}
                      placeholder="Lý do xác nhận một phần..."
                      className="w-full border border-[#E4EAE7] rounded-lg px-2 py-1 text-xs focus:border-[#024430] outline-none"
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {lines.some((l) => l.supplierNote) && (
        <div className="mt-3 flex flex-col gap-1">
          {lines.filter((l) => l.supplierNote).map((l) => (
            <div key={l.id} className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="font-semibold">{l.productName}:</span> {l.supplierNote}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
