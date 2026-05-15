"use client";
import { use, useState } from "react";
import Link from "next/link";
import {
  Card, CardBody, CardHeader, Button, Chip, Divider, Tabs, Tab,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
  Textarea, Progress,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
} from "@/components/ui";
import PageHeader from "@/components/PageHeader";
import { useApp } from "@/lib/store";
import { DrugMaster, DrugMatchStatus, DrugSourceType, SupplierDrugProfile } from "@/domain/models/drug";
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
        {/* Image */}
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

        {/* Status badges */}
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

/* ─── SVG Line Chart ──────────────────────────────────────── */
function PriceLineChart({ history }: { drug: DrugMaster; history: { contractCode: string; hospitalName: string; unitPrice: number; effectiveDate: string; expiryDate: string }[] }) {
  if (history.length < 1) return null;
  const sorted = [...history].sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());
  const W = 580, H = 180, PAD = { top: 20, right: 20, bottom: 48, left: 72 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const prices = sorted.map((e) => e.unitPrice);
  const minP = Math.min(...prices) * 0.95;
  const maxP = Math.max(...prices) * 1.02;
  const xStep = sorted.length < 2 ? chartW : chartW / (sorted.length - 1);
  const toX = (i: number) => PAD.left + (sorted.length < 2 ? chartW / 2 : i * xStep);
  const toY = (p: number) => PAD.top + chartH - ((p - minP) / (maxP - minP || 1)) * chartH;
  const pts = sorted.map((e, i) => `${toX(i)},${toY(e.unitPrice)}`).join(" ");
  const fillPts = `${toX(0)},${PAD.top + chartH} ${pts} ${toX(sorted.length - 1)},${PAD.top + chartH}`;
  const yTicks = 4;
  const HOSP_COLORS: Record<string, string> = {};
  const colors = ["#024430","#3b82f6","#f59e0b","#ef4444","#8b5cf6"];
  sorted.forEach((e) => { if (!HOSP_COLORS[e.hospitalName]) HOSP_COLORS[e.hospitalName] = colors[Object.keys(HOSP_COLORS).length % colors.length]; });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minHeight: H }}>
      {/* Grid */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const p = minP + ((maxP - minP) * i) / yTicks;
        const y = toY(p);
        return (
          <g key={i}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#E4EAE7" strokeWidth={1} />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#6B7A73">
              {(p / 1000).toFixed(0)}k
            </text>
          </g>
        );
      })}
      {/* Axes */}
      <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={PAD.top + chartH} stroke="#E4EAE7" strokeWidth={1} />
      <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + chartH} y2={PAD.top + chartH} stroke="#E4EAE7" strokeWidth={1} />
      {/* Area fill */}
      <polygon points={fillPts} fill="#024430" fillOpacity={0.06} />
      {/* Line */}
      <polyline points={pts} fill="none" stroke="#024430" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* Data points */}
      {sorted.map((e, i) => {
        const cx = toX(i), cy = toY(e.unitPrice);
        const color = HOSP_COLORS[e.hospitalName];
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={6} fill={color} stroke="white" strokeWidth={2} />
            <text x={cx} y={cy - 10} textAnchor="middle" fontSize={10} fill="#10231C" fontWeight="600">
              {(e.unitPrice / 1000).toFixed(1)}k
            </text>
          </g>
        );
      })}
      {/* X-axis labels */}
      {sorted.map((e, i) => (
        <text key={i} x={toX(i)} y={PAD.top + chartH + 16} textAnchor="middle" fontSize={9} fill="#6B7A73">
          {e.effectiveDate.slice(0, 7)}
        </text>
      ))}
      {sorted.map((e, i) => (
        <text key={`h${i}`} x={toX(i)} y={PAD.top + chartH + 28} textAnchor="middle" fontSize={8} fill="#6B7A73">
          {e.hospitalName.replace("Bệnh viện ", "BV ").replace("TP.HCM", "").trim().slice(0, 18)}
        </text>
      ))}
    </svg>
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

  const prices = history.map((h) => h.unitPrice);
  const minP = Math.min(...prices), maxP = Math.max(...prices);

  return (
    <div className="pt-6 flex flex-col gap-6">
      {/* SVG Line Chart */}
      <Card>
        <CardHeader>
          <div>
            <h3 className="font-semibold text-[#10231C]">Biểu đồ xu hướng giá</h3>
            <p className="text-xs text-[#6B7A73] mt-0.5">
              Khoảng giá: <span className="font-semibold text-[#024430]">{fmtVND(minP)}</span>
              {minP !== maxP && <> – <span className="font-semibold text-[#024430]">{fmtVND(maxP)}</span></>}
              &nbsp;/{drug.unit}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <PriceLineChart drug={drug} history={history} />
        </CardBody>
      </Card>

      {/* Table */}
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

/* ─── Tab 5: Supplier Profile ─────────────────────────────── */
function SupplierProfileTab({ drug, canEdit }: { drug: DrugMaster; canEdit: boolean }) {
  const { state, dispatch } = useApp();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const profile = state.supplierProfiles.find((p) => p.drugMasterId === drug.id);

  const [editForm, setEditForm] = useState({
    fullDescription: profile?.fullDescription ?? "",
    indications: profile?.indications ?? "",
    contraindications: profile?.contraindications ?? "",
    dosageUsage: profile?.dosageUsage ?? "",
    storageCondition: profile?.storageCondition ?? "",
  });

  function handleSave() {
    if (!profile) return;
    dispatch({
      type: "UPDATE_SUPPLIER_PROFILE",
      payload: { drugMasterId: drug.id, profile: editForm },
    });
    onClose();
  }

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
      {/* Header with edit button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#6B7A73]">
            Cập nhật bởi: <span className="font-medium text-[#10231C]">{profile.updatedBySupplier}</span>
            {" · "}{fmtDateTime(profile.updatedAt)}
          </p>
        </div>
        {canEdit && (
          <Button onClick={onOpen} variant="bordered" size="sm">
            Cập nhật thông tin
          </Button>
        )}
      </div>

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

      {/* Edit modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>Cập nhật thông tin nhà cung cấp</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Textarea
                label="Mô tả đầy đủ"
                value={editForm.fullDescription}
                onChange={(e) => setEditForm({ ...editForm, fullDescription: e.target.value })}
                minRows={4}
              />
              <Textarea
                label="Chỉ định"
                value={editForm.indications}
                onChange={(e) => setEditForm({ ...editForm, indications: e.target.value })}
                minRows={2}
              />
              <Textarea
                label="Chống chỉ định"
                value={editForm.contraindications}
                onChange={(e) => setEditForm({ ...editForm, contraindications: e.target.value })}
                minRows={2}
              />
              <Textarea
                label="Liều dùng"
                value={editForm.dosageUsage}
                onChange={(e) => setEditForm({ ...editForm, dosageUsage: e.target.value })}
                minRows={2}
              />
              <Textarea
                label="Bảo quản"
                value={editForm.storageCondition}
                onChange={(e) => setEditForm({ ...editForm, storageCondition: e.target.value })}
                minRows={2}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={onClose}>Hủy</Button>
            <Button onClick={handleSave}>Lưu thay đổi</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function SupplierDrugDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state } = useApp();

  const drug = state.drugMasters.find((d) => d.id === id);

  if (!drug) {
    return (
      <div>
        <div className="text-center py-20 text-[#6B7A73]">
          <p className="text-lg font-semibold mb-2">Không tìm thấy thuốc</p>
          <Link href="/supplier/drugs">
            <Button variant="flat">← Quay lại danh mục</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canEdit = state.currentRole === "supplier_admin";

  return (
    <div>
      <div className="mb-1">
        <Link href="/supplier/drugs" className="text-sm text-[#6B7A73] hover:text-[#024430] transition-colors">
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
        <Tab key="supplier" title="Thông tin Nhà phân phối">
          <SupplierProfileTab drug={drug} canEdit={canEdit} />
        </Tab>
      </Tabs>
    </div>
  );
}
