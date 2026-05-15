"use client";
import { ContractItem } from "@/lib/types";
import { formatVND, formatNumber, formatDate, allocationStatusLabel, allocationStatusColor } from "@/lib/utils";
import StatusChip from "./StatusChip";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@/components/ui";

interface Props {
  items: ContractItem[];
}

export default function AllocationLedgerTable({ items }: Props) {
  return (
    <div className="overflow-x-auto">
      <Table
        aria-label="Bảng phân bổ hợp đồng"
        classNames={{
          wrapper: "shadow-none border border-[#E4EAE7] rounded-xl",
          th: "bg-[#F6F8F7] text-[#6B7A73] text-xs font-semibold",
          td: "text-sm text-[#10231C] py-3",
        }}
      >
        <TableHeader>
          <TableColumn>Thuốc</TableColumn>
          <TableColumn>Hoạt chất</TableColumn>
          <TableColumn>Quy cách</TableColumn>
          <TableColumn className="text-right">SL hợp đồng</TableColumn>
          <TableColumn className="text-right">Đơn giá</TableColumn>
          <TableColumn className="text-right">GT hợp đồng</TableColumn>
          <TableColumn className="text-right">Đã đặt</TableColumn>
          <TableColumn className="text-right">Đang chuẩn bị</TableColumn>
          <TableColumn className="text-right">Đang vận chuyển</TableColumn>
          <TableColumn className="text-right">Đã giao</TableColumn>
          <TableColumn className="text-right">Còn lại</TableColumn>
          <TableColumn className="text-right">GT còn lại</TableColumn>
          <TableColumn>Hạn dùng</TableColumn>
          <TableColumn>Số lô</TableColumn>
          <TableColumn>Trạng thái</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const contractValue = item.contractedQuantity * item.unitPrice;
            const remainingValue = item.remainingQuantity * item.unitPrice;
            return (
              <TableRow key={item.id} className="hover:bg-[#F6F8F7] transition-colors">
                <TableCell>
                  <div>
                    <p className="font-semibold text-[#10231C]">{item.productName}</p>
                    <p className="text-xs text-[#6B7A73]">{item.productCode}</p>
                  </div>
                </TableCell>
                <TableCell className="text-[#6B7A73]">{item.activeIngredient}</TableCell>
                <TableCell className="text-[#6B7A73] text-xs">{item.specification}</TableCell>
                <TableCell className="text-right font-semibold">{formatNumber(item.contractedQuantity)}</TableCell>
                <TableCell className="text-right">{formatVND(item.unitPrice)}</TableCell>
                <TableCell className="text-right font-semibold text-[#024430]">{formatVND(contractValue)}</TableCell>
                <TableCell className="text-right">{formatNumber(item.orderedQuantity)}</TableCell>
                <TableCell className="text-right text-amber-600">{formatNumber(item.preparingQuantity)}</TableCell>
                <TableCell className="text-right text-blue-600">{formatNumber(item.shippingQuantity)}</TableCell>
                <TableCell className="text-right text-[#138A5B]">{formatNumber(item.deliveredQuantity)}</TableCell>
                <TableCell className="text-right font-bold">{formatNumber(item.remainingQuantity)}</TableCell>
                <TableCell className="text-right font-bold text-[#024430]">{formatVND(remainingValue)}</TableCell>
                <TableCell className="text-xs">{formatDate(item.expiryDate)}</TableCell>
                <TableCell className="text-xs font-mono text-[#6B7A73]">{item.batchNo}</TableCell>
                <TableCell>
                  <StatusChip label={allocationStatusLabel(item.status)} color={allocationStatusColor(item.status)} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
