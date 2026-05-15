"use client";
import { use } from "react";
import Link from "next/link";
import {
  Card, CardBody, CardHeader, Chip, Divider, Tabs, Tab, Progress,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
} from "@/components/ui";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui";
import { useApp } from "@/lib/store";
import { DrugMaster, DrugMatchStatus, DrugSourceType } from "@/domain/models/drug";
import { OrderStatus } from "@/domain/models/order";
import { PaymentStatus } from "@/domain/models/payment";
import { mockContractDrugItems } from "@/domain/mock/drugs";
import { fmtVND, fmtNum, fmtDate, fmtDateTime } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from "@/lib/constants";

const SOURCE_LABELS: Record<DrugSourceType, string> = {
  contract_derived: "Từ hợp đồng",
  supplier_created: "Nhà cung cấp tạo",
};

const MATCH_LABELS: Record<DrugMatchStatus, string> = {
  exact_match: "Trùng khớp chính xác",
  possible_match: "Có thể trùng",
  no_match: "Không trùng",
};

const MATCH_COLORS: Record<DrugMatchStatus, "success" | "warning" | "default"> = {
  exact_match: "success",
  possible_match: "warning",
  no_match: "default",
};

/* ─── Tab 1: Overview ─────────────────────────────────────── */
function OverviewTab({ drug }: { drug: DrugMaster }) {
  const fields = [
    { label: "Tên thuốc", value: drug.drugName },
    { label: "Hoạt chất", value: drug.activeIngredient },
    { label: "Dạng bào chế", value: drug.dosageForm },
    { label: "Hàm lượng", value: drug.strength },
    { label: "Quy cách", value: drug.specification },
    { label: "Đơn vị", value: drug.unit },
    { label: "Nhà sản xuất", value: drug.manufacturer },
    { label: "Xuất xứ", value: drug.origin },
    { label: "Số đăng ký", value: drug.registrationNumber ?? "—" },
    { label: "Ngày cập nhật", value: fmtDateTime(drug.updatedAt) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
      {/* Left: info grid */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader><h3 className="font-semibold text-[#10231C]">Thông tin cơ bản</h3></CardHeader>
          <CardBody>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {fields.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs text-[#6B7A73] mb-0.5">{f.label}</dt>
                  <dd className="text-sm font-medium text-[#10231C]">{f.value}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>

        {drug.description && (
          <Card className="mt-4">
            <CardHeader><h3 className="font-semibold text-[#10231C]">Mô tả</h3></CardHeader>
            <CardBody>
              <p className="text-sm text-[#10231C] leading-relaxed">{drug.description}</p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Right */}
      <div className="flex flex-col gap-4">
        {drug.images?.[0] ? (
          <div className="w-full rounded-xl overflow-hidden" style={{ height: 200 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={drug.images[0]}
              alt={drug.drugName}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="w-full rounded-xl flex items-center justify-center text-white font-semibold text-center px-4 text-sm"
            style={{ height: 200, background: "linear-gradient(135deg, #024430, #056246)" }}
          >
            {drug.drugName}
          </div>
        )}

        {/* Price range */}
        {drug.priceHistory && drug.priceHistory.length > 0 && (() => {
          const prices = drug.priceHistory.map((p) => p.unitPrice);
          const minP = Math.min(...prices);
          const maxP = Math.max(...prices);
          return (
            <Card className="border border-[#024430]/20 bg-[#024430]/5">
              <CardBody>
                <p className="text-xs text-[#6B7A73] mb-1">Khoảng giá hợp đồng</p>
                {minP === maxP ? (
                  <p className="text-xl font-bold text-[#024430]">{fmtVND(minP)}</p>
                ) : (
                  <>
                    <p className="text-xl font-bold text-[#024430]">{fmtVND(minP)}</p>
                    <p className="text-sm text-[#6B7A73]">đến {fmtVND(maxP)}</p>
                  </>
                )}
                <p className="text-xs text-[#6B7A73] mt-1">/{drug.unit} · {drug.priceHistory.length} hợp đồng</p>
              </CardBody>
            </Card>
          );
        })()}

        <Card>
          <CardBody className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-[#6B7A73] mb-1">Nguồn gốc</p>
              <Chip color={drug.sourceType === "contract_derived" ? "primary" : "secondary"} variant="flat">
                {SOURCE_LABELS[drug.sourceType]}
              </Chip>
            </div>
            <Divider />
            <div>
              <p className="text-xs text-[#6B7A73] mb-1">Trạng thái đối chiếu</p>
              <Chip color={MATCH_COLORS[drug.matchStatus]} variant="flat">
                {MATCH_LABELS[drug.matchStatus]}
              </Chip>
            </div>
            <Divider />
            <div>
              <p className="text-xs text-[#6B7A73] mb-1">Số hợp đồng liên kết</p>
              <p className="text-base font-bold text-[#10231C]">{drug.linkedContractItemIds.length}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

/* ─── Tab 2: Contract References ──────────────────────────── */
function ContractsTab({ drug }: { drug: DrugMaster }) {
  const items = mockContractDrugItems.filter((item) =>
    drug.linkedContractItemIds.includes(item.contractItemId)
  );

  if (items.length === 0) {
    return <div className="py-10 text-center text-[#6B7A73]">Chưa có hợp đồng nào liên kết.</div>;
  }

  return (
    <div className="pt-6">
      <Table aria-label="Hợp đồng liên kết">
        <TableHeader>
          <TableColumn>Mã HĐ</TableColumn>
          <TableColumn>Gói thầu</TableColumn>
          <TableColumn>Bệnh viện</TableColumn>
          <TableColumn>Đơn giá</TableColumn>
          <TableColumn>HĐ</TableColumn>
          <TableColumn>Đã YC</TableColumn>
          <TableColumn>Đã XN</TableColumn>
          <TableColumn>Đã giao</TableColumn>
          <TableColumn>Còn lại</TableColumn>
          <TableColumn>Tiến độ</TableColumn>
          <TableColumn>Hiệu lực đến</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const deliveredPct = item.contractedQty > 0 ? Math.round((item.deliveredQty / item.contractedQty) * 100) : 0;
            return (
              <TableRow key={item.contractItemId}>
                <TableCell className="font-mono text-xs">{item.contractCode}</TableCell>
                <TableCell className="text-xs">{item.tenderPackageId}</TableCell>
                <TableCell>{item.hospitalName}</TableCell>
                <TableCell>{fmtVND(item.unitPrice)}</TableCell>
                <TableCell className="font-semibold">{fmtNum(item.contractedQty)}</TableCell>
                <TableCell>{fmtNum(item.requestedQty)}</TableCell>
                <TableCell>{fmtNum(item.confirmedQty)}</TableCell>
                <TableCell>{fmtNum(item.deliveredQty)}</TableCell>
                <TableCell>
                  <span className="font-semibold text-green-700">{fmtNum(item.remainingQty)}</span>
                </TableCell>
                <TableCell className="min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <Progress value={deliveredPct} size="sm" className="flex-1" />
                    <span className="text-xs text-[#6B7A73] w-8">{deliveredPct}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{fmtDate(item.contractValidity)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/* ─── Tab 3: Price History ────────────────────────────────── */
function PriceHistoryTab({ drug }: { drug: DrugMaster }) {
  const history = [...drug.priceHistory].sort(
    (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  );

  if (history.length === 0) {
    return <div className="py-10 text-center text-[#6B7A73]">Chưa có lịch sử giá.</div>;
  }

  const maxPrice = Math.max(...history.map((h) => h.unitPrice));

  return (
    <div className="pt-6 flex flex-col gap-6">
      <Card>
        <CardHeader><h3 className="font-semibold text-[#10231C]">Biểu đồ xu hướng giá</h3></CardHeader>
        <CardBody>
          <div className="flex items-end gap-3 h-32">
            {[...history].reverse().map((entry, idx) => {
              const barHeight = maxPrice > 0 ? Math.round((entry.unitPrice / maxPrice) * 100) : 100;
              return (
                <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-[#6B7A73] font-medium">{fmtVND(entry.unitPrice)}</span>
                  <div
                    className="w-full rounded-t-lg bg-[#024430] transition-all"
                    style={{ height: `${barHeight}%` }}
                  />
                  <span className="text-[10px] text-[#6B7A73] text-center leading-tight">
                    {fmtDate(entry.effectiveDate)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <Table aria-label="Lịch sử giá">
        <TableHeader>
          <TableColumn>Số HĐ</TableColumn>
          <TableColumn>Tên hợp đồng</TableColumn>
          <TableColumn>Bệnh viện</TableColumn>
          <TableColumn>Đơn giá</TableColumn>
          <TableColumn>Xu hướng</TableColumn>
          <TableColumn>Hiệu lực từ</TableColumn>
          <TableColumn>Đến</TableColumn>
        </TableHeader>
        <TableBody>
          {history.map((entry, idx) => {
            const nextEntry = history[idx + 1];
            let trendEl = null;
            if (nextEntry) {
              if (entry.unitPrice > nextEntry.unitPrice) {
                trendEl = <span className="text-red-500 font-bold">↑</span>;
              } else if (entry.unitPrice < nextEntry.unitPrice) {
                trendEl = <span className="text-green-600 font-bold">↓</span>;
              } else {
                trendEl = <span className="text-[#6B7A73]">—</span>;
              }
            }
            return (
              <TableRow key={entry.contractId + idx}>
                <TableCell className="font-mono text-xs">{entry.contractCode}</TableCell>
                <TableCell className="max-w-[200px] truncate text-xs">{entry.contractName}</TableCell>
                <TableCell>{entry.hospitalName}</TableCell>
                <TableCell className="font-semibold">{fmtVND(entry.unitPrice)}</TableCell>
                <TableCell>{trendEl ?? <span className="text-[#6B7A73] text-xs">—</span>}</TableCell>
                <TableCell className="text-xs">{fmtDate(entry.effectiveDate)}</TableCell>
                <TableCell className="text-xs">{fmtDate(entry.expiryDate)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/* ─── Tab 4: Transaction History ─────────────────────────── */
function TransactionHistoryTab({ drug }: { drug: DrugMaster }) {
  const history = drug.transactionHistory;

  if (history.length === 0) {
    return <div className="py-10 text-center text-[#6B7A73]">Chưa có lịch sử giao dịch.</div>;
  }

  return (
    <div className="pt-6">
      <Table aria-label="Lịch sử giao dịch">
        <TableHeader>
          <TableColumn>Mã đơn</TableColumn>
          <TableColumn>Bệnh viện</TableColumn>
          <TableColumn>Ngày đặt</TableColumn>
          <TableColumn>YC</TableColumn>
          <TableColumn>XN</TableColumn>
          <TableColumn>Đã giao</TableColumn>
          <TableColumn>Thành tiền</TableColumn>
          <TableColumn>Trạng thái đơn</TableColumn>
          <TableColumn>Trạng thái TT</TableColumn>
        </TableHeader>
        <TableBody>
          {history.map((entry) => {
            const orderLabel = ORDER_STATUS_LABELS[entry.orderStatus as OrderStatus] ?? entry.orderStatus;
            const orderColor = ORDER_STATUS_COLORS[entry.orderStatus as OrderStatus] ?? "default";
            const payLabel = PAYMENT_STATUS_LABELS[entry.paymentStatus as PaymentStatus] ?? entry.paymentStatus;
            const payColor = PAYMENT_STATUS_COLORS[entry.paymentStatus as PaymentStatus] ?? "default";
            return (
              <TableRow key={entry.orderId}>
                <TableCell className="font-mono text-xs">{entry.orderId}</TableCell>
                <TableCell>{entry.hospitalName}</TableCell>
                <TableCell className="text-xs">{fmtDate(entry.orderDate)}</TableCell>
                <TableCell>{fmtNum(entry.requestedQty)}</TableCell>
                <TableCell>{fmtNum(entry.confirmedQty)}</TableCell>
                <TableCell>{fmtNum(entry.deliveredQty)}</TableCell>
                <TableCell className="font-semibold">{fmtVND(entry.lineAmount)}</TableCell>
                <TableCell>
                  <Chip color={orderColor} variant="flat" size="sm">{orderLabel}</Chip>
                </TableCell>
                <TableCell>
                  <Chip color={payColor} variant="flat" size="sm">{payLabel}</Chip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/* ─── Tab 5: Supplier Profile (read-only) ─────────────────── */
function SupplierProfileTab({ drug }: { drug: DrugMaster }) {
  const { state } = useApp();
  const profile = state.supplierProfiles.find((p) => p.drugMasterId === drug.id);

  if (!profile) {
    return (
      <div className="py-10 text-center text-[#6B7A73]">
        Chưa có thông tin nhà cung cấp cho thuốc này.
      </div>
    );
  }

  const sectionFields = [
    { label: "Chỉ định", value: profile.indications },
    { label: "Chống chỉ định", value: profile.contraindications },
    { label: "Liều dùng", value: profile.dosageUsage },
    { label: "Bảo quản", value: profile.storageCondition },
  ];

  return (
    <div className="pt-6 flex flex-col gap-6">
      {/* Meta */}
      <p className="text-xs text-[#6B7A73]">
        Cập nhật bởi: <span className="font-medium text-[#10231C]">{profile.updatedBySupplier}</span>
        {" · "}{fmtDateTime(profile.updatedAt)}
      </p>

      {/* Full description */}
      <Card>
        <CardHeader><h3 className="font-semibold text-[#10231C]">Mô tả đầy đủ</h3></CardHeader>
        <CardBody>
          <p className="text-sm text-[#10231C] leading-relaxed">{profile.fullDescription}</p>
        </CardBody>
      </Card>

      {/* 4-field grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sectionFields.map((f) => (
          <Card key={f.label}>
            <CardHeader><h3 className="font-semibold text-[#10231C] text-sm">{f.label}</h3></CardHeader>
            <CardBody className="pt-0">
              <p className="text-sm text-[#10231C] leading-relaxed">{f.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Certificates */}
      {profile.certificates.length > 0 && (
        <Card>
          <CardHeader><h3 className="font-semibold text-[#10231C]">Chứng chỉ</h3></CardHeader>
          <CardBody className="pt-0">
            <div className="flex flex-wrap gap-2">
              {profile.certificates.map((cert, i) => (
                <Chip key={i} color="primary" variant="bordered">{cert}</Chip>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Documents */}
      {profile.documents.length > 0 && (
        <Card>
          <CardHeader><h3 className="font-semibold text-[#10231C]">Tài liệu</h3></CardHeader>
          <CardBody className="pt-0">
            <ul className="flex flex-col gap-2">
              {profile.documents.map((doc, i) => (
                <li key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#F6F8F7] border border-[#E4EAE7]">
                  <svg className="w-4 h-4 text-[#024430] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-[#10231C]">{doc}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Images placeholder */}
      <Card>
        <CardHeader><h3 className="font-semibold text-[#10231C]">Hình ảnh sản phẩm</h3></CardHeader>
        <CardBody className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {profile.productImages.map((src, i) => (
              <div
                key={i}
                className="rounded-xl aspect-square flex items-center justify-center text-xs text-white font-medium"
                style={{ background: "linear-gradient(135deg, #024430, #056246)" }}
              >
                Ảnh {i + 1}
              </div>
            ))}
            {profile.productImages.length === 0 && (
              <div className="col-span-4 py-6 text-center text-[#6B7A73] text-sm">
                Chưa có hình ảnh.
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function HospitalDrugDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state } = useApp();

  const drug = state.drugMasters.find((d) => d.id === id);

  if (!drug) {
    return (
      <div>
        <div className="text-center py-20 text-[#6B7A73]">
          <p className="text-lg font-semibold mb-2">Không tìm thấy thuốc</p>
          <Link href="/hospital/drugs">
            <Button variant="flat">← Quay lại danh mục</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-1">
        <Link href="/hospital/drugs" className="text-sm text-[#6B7A73] hover:text-[#024430] transition-colors">
          ← Danh mục thuốc
        </Link>
      </div>
      <PageHeader
        title={drug.drugName}
        subtitle={`${drug.activeIngredient} · ${drug.dosageForm} · ${drug.strength}`}
      />

      <Tabs aria-label="Chi tiết thuốc" defaultSelectedKey="overview">
        <Tab key="overview" title="Tổng quan">
          <OverviewTab drug={drug} />
        </Tab>
        <Tab key="contracts" title="Hợp đồng">
          <ContractsTab drug={drug} />
        </Tab>
        <Tab key="price-history" title="Lịch sử giá">
          <PriceHistoryTab drug={drug} />
        </Tab>
        <Tab key="transactions" title="Lịch sử giao dịch">
          <TransactionHistoryTab drug={drug} />
        </Tab>
        <Tab key="supplier" title="Thông tin NPP">
          <SupplierProfileTab drug={drug} />
        </Tab>
      </Tabs>
    </div>
  );
}
