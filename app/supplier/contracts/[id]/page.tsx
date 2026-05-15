"use client";
import { use } from "react";
import { useApp } from "@/lib/store";
import { fmtVND, fmtDate, fmtDateTime, fmtNum, pct } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import {
  Tabs, Tab, Card, CardBody, CardHeader, Progress, Chip, Divider,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
} from "@/components/ui";
import {
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS,
  ALLOCATION_STATUS_LABELS, ALLOCATION_STATUS_COLORS,
  EVIDENCE_ACTION_LABELS,
} from "@/lib/constants";
import Link from "next/link";

export default function SupplierContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state } = useApp();
  const { contract, orders, payments, evidenceLogs } = state;

  if (contract.id !== id) {
    return <div className="p-8 text-center text-[#6B7A73]">Không tìm thấy hợp đồng</div>;
  }

  const contractOrders = orders.filter((o) => o.contractId === id);
  const contractPayments = payments.filter((p) => p.contractId === id);
  const contractLogs = evidenceLogs.filter((l) => l.contractId === id);

  const requestedPct = pct(contract.requestedValue, contract.totalContractValue);
  const confirmedPct = pct(contract.confirmedValue, contract.totalContractValue);
  const deliveredPct = pct(contract.deliveredValue, contract.totalContractValue);
  const paidPct = pct(contract.paidValue, contract.deliveredValue || 1);

  return (
    <div>
      <PageHeader
        title={contract.contractName}
        subtitle={`Mã HĐ: ${contract.contractCode} · Gói thầu: ${contract.tenderCode}`}
        actions={<StatusChip label="Đang hoạt động" color="success" size="md" />}
      />

      <Tabs aria-label="Chi tiết hợp đồng">
        {/* ── Tab 1: Tổng quan ── */}
        <Tab key="summary" title="Tổng quan">
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Financial summary cards */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Tổng giá trị HĐ", value: contract.totalContractValue, color: "text-[#024430]", bg: "bg-[#024430]/5" },
                { label: "Đã yêu cầu", value: contract.requestedValue, color: "text-blue-700", bg: "bg-blue-50" },
                { label: "Đã xác nhận", value: contract.confirmedValue, color: "text-purple-700", bg: "bg-purple-50" },
                { label: "Đã giao hàng", value: contract.deliveredValue, color: "text-emerald-700", bg: "bg-emerald-50" },
                { label: "Đã thanh toán", value: contract.paidValue, color: "text-[#024430]", bg: "bg-[#024430]/5" },
                { label: "Công nợ", value: contract.outstandingValue, color: "text-orange-700", bg: "bg-orange-50" },
              ].map((s) => (
                <Card key={s.label} className={`border border-[#E4EAE7] ${s.bg}`}>
                  <CardBody className="p-4 text-center">
                    <p className="text-[10px] text-[#6B7A73] font-medium">{s.label}</p>
                    <p className={`text-sm font-bold mt-1 ${s.color}`}>{fmtVND(s.value)}</p>
                  </CardBody>
                </Card>
              ))}
              {/* Progress bars */}
              <Card className="col-span-2 sm:col-span-3 border border-[#E4EAE7]">
                <CardBody className="p-4 flex flex-col gap-3">
                  {[
                    { label: "Yêu cầu / HĐ", p: requestedPct, color: "bg-blue-400" },
                    { label: "Xác nhận / HĐ", p: confirmedPct, color: "bg-[#024430]" },
                    { label: "Đã giao / HĐ", p: deliveredPct, color: "bg-emerald-500" },
                    { label: "Đã TT / Đã giao", p: paidPct, color: "bg-purple-500" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#6B7A73]">{item.label}</span>
                        <span className="font-semibold">{item.p}%</span>
                      </div>
                      <div className="w-full bg-[#E4EAE7] rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${Math.min(100, item.p)}%` }} />
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>

            {/* Contract info */}
            <Card className="border border-[#E4EAE7]">
              <CardHeader><h3 className="font-semibold text-[#10231C]">Thông tin hợp đồng</h3></CardHeader>
              <CardBody className="pt-2 flex flex-col gap-3">
                {[
                  { label: "Mã hợp đồng", value: contract.contractCode },
                  { label: "Mã gói thầu", value: contract.tenderCode },
                  { label: "Bệnh viện", value: contract.hospitalName },
                  { label: "Nhà cung cấp", value: contract.supplierName },
                  { label: "Ngày bắt đầu", value: fmtDate(contract.startDate) },
                  { label: "Ngày kết thúc", value: fmtDate(contract.endDate) },
                  { label: "Giao hàng", value: contract.deliveryTerm },
                  { label: "Thanh toán", value: contract.paymentTerm },
                ].map((row) => (
                  <div key={row.label}>
                    <p className="text-xs text-[#6B7A73]">{row.label}</p>
                    <p className="text-sm font-medium text-[#10231C]">{row.value}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* ── Tab 2: Phân bổ hàng hóa ── */}
        <Tab key="allocation" title="Phân bổ hàng hóa">
          <div className="mt-4">
            <Table aria-label="Phân bổ hàng hóa">
              <TableHeader>
                <TableColumn>Mã</TableColumn>
                <TableColumn>Tên thuốc</TableColumn>
                <TableColumn>Hợp đồng</TableColumn>
                <TableColumn>Yêu cầu</TableColumn>
                <TableColumn>Xác nhận</TableColumn>
                <TableColumn>Đã giao</TableColumn>
                <TableColumn>Còn lại</TableColumn>
                <TableColumn>Đơn giá</TableColumn>
                <TableColumn>Thành tiền</TableColumn>
                <TableColumn>Trạng thái</TableColumn>
              </TableHeader>
              <TableBody>
                {contract.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.productCode}</TableCell>
                    <TableCell>
                      <p className="font-semibold text-[#10231C]">{item.productName}</p>
                      <p className="text-xs text-[#6B7A73]">{item.specification}</p>
                    </TableCell>
                    <TableCell className="text-right font-medium">{fmtNum(item.contractedQty)} {item.unit}</TableCell>
                    <TableCell className="text-right">{fmtNum(item.requestedQty)}</TableCell>
                    <TableCell className="text-right">{fmtNum(item.confirmedQty)}</TableCell>
                    <TableCell className="text-right text-emerald-700 font-medium">{fmtNum(item.deliveredQty)}</TableCell>
                    <TableCell className="text-right font-bold text-[#024430]">{fmtNum(item.remainingQty)}</TableCell>
                    <TableCell className="text-right">{fmtVND(item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-semibold">{fmtVND(item.contractedQty * item.unitPrice)}</TableCell>
                    <TableCell>
                      <StatusChip
                        label={ALLOCATION_STATUS_LABELS[item.status]}
                        color={ALLOCATION_STATUS_COLORS[item.status]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Tab>

        {/* ── Tab 3: Đơn hàng ── */}
        <Tab key="orders" title={`Đơn hàng (${contractOrders.length})`}>
          <div className="mt-4 flex flex-col gap-4">
            {contractOrders.length === 0 ? (
              <Card><CardBody className="p-8 text-center text-[#6B7A73]">Chưa có đơn hàng nào</CardBody></Card>
            ) : (
              contractOrders.map((order) => (
                <Card key={order.id} className="border border-[#E4EAE7]">
                  <CardBody className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-[#10231C]">{order.id}</p>
                          <Chip color={ORDER_STATUS_COLORS[order.status]} variant="flat" size="sm">
                            {ORDER_STATUS_LABELS[order.status]}
                          </Chip>
                        </div>
                        <p className="text-xs text-[#6B7A73]">Ngày đặt: {fmtDate(order.orderDate)} · Giao: {fmtDate(order.requestedDeliveryDate)}</p>
                        <p className="text-xs text-[#6B7A73] mt-0.5">{order.lines.length} dòng thuốc</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#024430]">{fmtVND(order.totalRequestedAmount)}</p>
                        <p className="text-xs text-[#6B7A73]">Giá trị yêu cầu</p>
                        <Link href={`/supplier/orders/${order.id}`}>
                          <span className="inline-block mt-2 px-3 py-1.5 bg-[#024430] text-white text-xs font-medium rounded-lg cursor-pointer hover:bg-[#056246]">
                            Xem chi tiết
                          </span>
                        </Link>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </Tab>

        {/* ── Tab 4: Thanh toán ── */}
        <Tab key="payments" title="Thanh toán">
          <div className="mt-4">
            {contractPayments.length === 0 ? (
              <Card><CardBody className="p-8 text-center text-[#6B7A73]">Chưa có hóa đơn nào</CardBody></Card>
            ) : (
              <div className="flex flex-col gap-4">
                {contractPayments.map((p) => {
                  const paidP = pct(p.paidAmount, p.invoiceAmount);
                  return (
                    <Card key={p.id} className="border border-[#E4EAE7]">
                      <CardBody className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-[#10231C]">{p.invoiceNo}</p>
                            <p className="text-xs text-[#6B7A73]">Đơn hàng: {p.orderId}</p>
                            <p className="text-xs text-[#6B7A73]">Xuất: {fmtDate(p.invoiceDate)} · Đến hạn: {fmtDate(p.dueDate)}</p>
                          </div>
                          <StatusChip label={PAYMENT_STATUS_LABELS[p.status]} color={PAYMENT_STATUS_COLORS[p.status]} />
                        </div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#6B7A73]">Tiến độ thanh toán</span>
                          <span className="font-semibold">{paidP}%</span>
                        </div>
                        <Progress value={paidP} size="sm" />
                        <div className="grid grid-cols-3 gap-3 mt-3">
                          <div className="bg-[#F6F8F7] rounded-lg p-2 text-center">
                            <p className="text-[10px] text-[#6B7A73]">Giá trị HĐ</p>
                            <p className="text-xs font-bold">{fmtVND(p.invoiceAmount)}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-[#6B7A73]">Đã thu</p>
                            <p className="text-xs font-bold text-emerald-700">{fmtVND(p.paidAmount)}</p>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-[#6B7A73]">Còn lại</p>
                            <p className="text-xs font-bold text-orange-600">{fmtVND(p.outstandingAmount)}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </Tab>

        {/* ── Tab 5: Nhật ký ── */}
        <Tab key="evidence" title="Nhật ký">
          <div className="mt-4">
            <Card className="border border-[#E4EAE7]">
              <CardBody className="p-5">
                <h3 className="font-semibold text-[#10231C] mb-5">Nhật ký hoạt động hợp đồng</h3>
                {contractLogs.length === 0 ? (
                  <p className="text-sm text-[#6B7A73] text-center py-4">Chưa có nhật ký</p>
                ) : (
                  <div className="flex flex-col">
                    {contractLogs.map((log, idx) => (
                      <div key={log.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-[#024430]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[#024430] text-xs font-bold">{idx + 1}</span>
                          </div>
                          {idx < contractLogs.length - 1 && <div className="w-0.5 flex-1 bg-[#E4EAE7] mt-1 mb-1 min-h-[20px]" />}
                        </div>
                        <div className="pb-5 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Chip color="default" variant="flat" size="sm">{EVIDENCE_ACTION_LABELS[log.actionType]}</Chip>
                            <span className="text-xs text-[#6B7A73]">{fmtDateTime(log.createdAt)}</span>
                          </div>
                          <p className="text-sm font-semibold text-[#10231C]">{log.title}</p>
                          <p className="text-xs text-[#6B7A73] mt-0.5">{log.description}</p>
                          <p className="text-xs text-[#6B7A73] mt-0.5">Bởi: {log.actorName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* ── Tab 6: Tổng hợp nhu cầu ── */}
        <Tab key="aggregation" title="Tổng hợp nhu cầu">
          <div className="mt-4">
            {/* Summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Tổng YC (tất cả đơn)", value: fmtVND(contract.requestedValue) },
                { label: "Tổng XN", value: fmtVND(contract.confirmedValue) },
                { label: "Tổng đã giao", value: fmtVND(contract.deliveredValue) },
                { label: "Tỉ lệ thực hiện", value: `${pct(contract.deliveredValue, contract.requestedValue || 1)}%` },
              ].map((s) => (
                <Card key={s.label} className="border border-[#E4EAE7]">
                  <CardBody className="p-4 text-center">
                    <p className="text-[10px] text-[#6B7A73]">{s.label}</p>
                    <p className="text-sm font-bold text-[#024430] mt-1">{s.value}</p>
                  </CardBody>
                </Card>
              ))}
            </div>

            <Table aria-label="Tổng hợp nhu cầu">
              <TableHeader>
                <TableColumn>Tên thuốc</TableColumn>
                <TableColumn>ĐVT</TableColumn>
                <TableColumn>Hợp đồng</TableColumn>
                <TableColumn>Tổng YC</TableColumn>
                <TableColumn>Tổng XN</TableColumn>
                <TableColumn>Chênh lệch</TableColumn>
                <TableColumn>Đã giao</TableColumn>
                <TableColumn>% Thực hiện</TableColumn>
                <TableColumn>Còn lại HĐ</TableColumn>
              </TableHeader>
              <TableBody>
                {contract.items.map((item) => {
                  const gap = item.requestedQty - item.confirmedQty;
                  const fulfillPct = pct(item.deliveredQty, item.requestedQty || 1);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-semibold text-[#10231C]">{item.productName}</p>
                        <p className="text-xs text-[#6B7A73]">{item.productCode}</p>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="font-medium">{fmtNum(item.contractedQty)}</TableCell>
                      <TableCell>{fmtNum(item.requestedQty)}</TableCell>
                      <TableCell>{fmtNum(item.confirmedQty)}</TableCell>
                      <TableCell>
                        {gap > 0 ? (
                          <span className="text-orange-600 font-semibold">-{fmtNum(gap)}</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-emerald-700 font-medium">{fmtNum(item.deliveredQty)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[#E4EAE7] rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full bg-[#024430]"
                                style={{ width: `${Math.min(100, fulfillPct)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold w-8 text-right">{fulfillPct}%</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-[#024430]">{fmtNum(item.remainingQty)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
