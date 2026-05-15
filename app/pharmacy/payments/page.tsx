"use client";
import { useState } from "react";
import Link from "next/link";
import { useRole } from "@/lib/useRole";
import PageHeader from "@/components/PageHeader";
import FileUpload from "@/components/FileUpload";
import { Card, CardBody } from "@/components/ui";

// ─── Mock data ────────────────────────────────────────────────────────────────
type PaymentStatus = "not_invoiced" | "invoiced" | "partially_paid" | "paid";

interface PaymentRecord {
  id: string;
  invoiceNo: string;
  orderId: string;
  invoiceDate: string;
  dueDate: string;
  invoiceAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: PaymentStatus;
  notes?: string;
}

const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: "pmt1",
    invoiceNo: "HDT-NT-2026-005",
    orderId: "DH-NT-00022",
    invoiceDate: "2026-05-03",
    dueDate: "2026-06-03",
    invoiceAmount: 2_990_000,
    paidAmount: 2_990_000,
    outstandingAmount: 0,
    status: "paid",
    notes: "Thanh toán đầy đủ, đúng hạn.",
  },
  {
    id: "pmt2",
    invoiceNo: "HDT-NT-2026-006",
    orderId: "DH-NT-00021",
    invoiceDate: "2026-04-19",
    dueDate: "2026-05-19",
    invoiceAmount: 1_960_000,
    paidAmount: 1_000_000,
    outstandingAmount: 960_000,
    status: "partially_paid",
    notes: "Đã thanh toán một phần, phần còn lại đang xử lý.",
  },
  {
    id: "pmt3",
    invoiceNo: "HDT-NT-2026-007",
    orderId: "DH-NT-00023",
    invoiceDate: "2026-05-06",
    dueDate: "2026-06-06",
    invoiceAmount: 2_200_000,
    paidAmount: 0,
    outstandingAmount: 2_200_000,
    status: "invoiced",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtVND(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} triệu ₫`;
  return v.toLocaleString("vi-VN") + " ₫";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("vi-VN");
}

function pct(a: number, b: number) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
const TIMELINE_STEPS: { key: PaymentStatus; label: string }[] = [
  { key: "not_invoiced",   label: "Chưa xuất HĐ" },
  { key: "invoiced",       label: "Đã xuất HĐ" },
  { key: "partially_paid", label: "TT một phần" },
  { key: "paid",           label: "Đã thanh toán" },
];

const STATUS_ORDER: PaymentStatus[] = ["not_invoiced", "invoiced", "partially_paid", "paid"];

function statusIndex(status: PaymentStatus) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

function PaymentTimeline({ status }: { status: PaymentStatus }) {
  const currentIdx = statusIndex(status);
  return (
    <div>
      <p className="text-xs font-semibold text-[#6B7A73] uppercase tracking-wide mb-2">Tiến trình thanh toán</p>
      <div className="flex items-start gap-0">
        {TIMELINE_STEPS.map((step, idx) => {
          const isDone = idx <= currentIdx;
          const isActive = idx === currentIdx;
          return (
            <div key={step.key} className="flex items-start flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    isDone
                      ? "bg-[#024430] border-[#024430] text-white"
                      : "bg-white border-[#E4EAE7] text-[#6B7A73]"
                  } ${isActive ? "ring-2 ring-[#024430]/30 ring-offset-1" : ""}`}
                >
                  {isDone && !isActive ? "✓" : idx + 1}
                </div>
                <span
                  className={`text-[9px] mt-1 text-center leading-tight max-w-[56px] ${
                    isActive ? "text-[#024430] font-bold" : isDone ? "text-[#024430] opacity-60" : "text-[#6B7A73]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < TIMELINE_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mt-3.5 mx-1 ${idx < currentIdx ? "bg-[#024430]" : "bg-[#E4EAE7]"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Document checklist ───────────────────────────────────────────────────────
function DocumentChecklist({ payment }: { payment: PaymentRecord }) {
  const idx = statusIndex(payment.status);
  const hasInvoice = idx >= 1;
  const docs = [
    { name: "Hóa đơn VAT",         submitted: hasInvoice },
    { name: "Biên bản nghiệm thu",  submitted: hasInvoice },
    { name: "Phiếu giao hàng",      submitted: hasInvoice },
  ];
  return (
    <div>
      <p className="text-xs font-semibold text-[#6B7A73] uppercase tracking-wide mb-2">Hồ sơ thanh toán</p>
      <div className="flex flex-col gap-1.5">
        {docs.map((doc) => (
          <div key={doc.name} className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                doc.submitted ? "bg-green-100 text-green-700" : "bg-[#F6F8F7] text-[#6B7A73]"
              }`}
            >
              {doc.submitted ? "✓" : "○"}
            </div>
            <span className={`text-sm ${doc.submitted ? "text-[#10231C]" : "text-[#6B7A73]"}`}>{doc.name}</span>
            {doc.submitted ? (
              <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">Đã nộp</span>
            ) : (
              <span className="text-[10px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full font-medium">Chờ nộp</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Payment Proof Upload ─────────────────────────────────────────────────────
function PaymentProofUpload({ accentColor }: { accentColor: string }) {
  const [confirmed, setConfirmed] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  if (confirmed) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-semibold text-green-700">Đã ghi nhận bằng chứng thanh toán</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-[#F6F8F7] border border-[#E4EAE7] rounded-xl flex flex-col gap-3">
      <FileUpload
        label="Bằng chứng thanh toán"
        hint="Biên lai, ủy nhiệm chi, hình chụp màn hình ngân hàng"
        accentColor={accentColor}
        maxFiles={3}
        onFilesChange={setFiles}
      />
      <div className="flex justify-end">
        <button
          type="button"
          disabled={files.length === 0}
          onClick={() => setConfirmed(true)}
          className="px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ backgroundColor: accentColor }}
        >
          Xác nhận đã thanh toán
        </button>
      </div>
    </div>
  );
}

// ─── Bank info modal (inline) ─────────────────────────────────────────────────
function BankInfoPanel({ payment, onClose }: { payment: PaymentRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#10231C] text-lg">Hướng dẫn chuyển khoản</h3>
          <button type="button" onClick={onClose} className="text-[#6B7A73] hover:text-[#10231C]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-[#F6F8F7] rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-[#6B7A73] uppercase tracking-wide mb-3">Tài khoản nhận</p>
          <div className="flex flex-col gap-2 text-sm">
            {[
              { label: "Ngân hàng",       value: "Vietcombank (VCB)" },
              { label: "Số tài khoản",    value: "0071000654321" },
              { label: "Chủ tài khoản",   value: "CÔNG TY TNHH PHÂN PHỐI DCP" },
              { label: "Chi nhánh",        value: "TP. Hồ Chí Minh" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between">
                <span className="text-[#6B7A73]">{row.label}</span>
                <span className="font-bold text-[#10231C] font-mono">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-3">Chi tiết thanh toán</p>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B7A73]">Số tiền</span>
              <span className="font-bold text-orange-700 text-base">{fmtVND(payment.outstandingAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7A73]">Nội dung CK</span>
              <span className="font-bold text-[#10231C]">{payment.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7A73]">Đến hạn</span>
              <span className="font-bold text-[#10231C]">{fmtDate(payment.dueDate)}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#024430]/5 border border-[#024430]/20 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-[#024430] mb-1">Lưu ý quan trọng</p>
          <ul className="text-xs text-[#6B7A73] space-y-1">
            <li>• Ghi đúng nội dung chuyển khoản để đối soát nhanh</li>
            <li>• Liên hệ nhà phân phối sau khi chuyển khoản</li>
            <li>• Hotline: <span className="font-semibold text-[#10231C]">0901 234 567</span></li>
          </ul>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-[#024430] text-white text-sm font-semibold rounded-xl hover:bg-[#056246] cursor-pointer"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
}

// ─── Payment card ─────────────────────────────────────────────────────────────
function PaymentCard({ payment, canUploadPaymentProof }: { payment: PaymentRecord; canUploadPaymentProof: boolean }) {
  const [showBank, setShowBank] = useState(false);
  const paidP = pct(payment.paidAmount, payment.invoiceAmount);
  const isPaid = payment.status === "paid";
  const hasOutstanding = payment.outstandingAmount > 0;

  return (
    <>
      <Card className={`border-2 ${isPaid ? "border-green-200" : "border-[#E4EAE7]"}`}>
        <CardBody className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-bold text-[#10231C] text-base">{payment.invoiceNo}</p>
                {isPaid ? (
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">✓ Đã hoàn thành</span>
                ) : payment.status === "partially_paid" ? (
                  <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">Thanh toán một phần</span>
                ) : (
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">Đã xuất hóa đơn</span>
                )}
              </div>
              <p className="text-xs text-[#6B7A73]">
                Đơn hàng: <span className="font-semibold text-[#10231C]">{payment.orderId}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#6B7A73]">Xuất ngày {fmtDate(payment.invoiceDate)}</p>
              <p className="text-xs font-semibold text-[#6B7A73]">Đến hạn: {fmtDate(payment.dueDate)}</p>
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-[#F6F8F7] rounded-xl p-3 text-center">
              <p className="text-[10px] text-[#6B7A73] mb-1">Tổng HĐ</p>
              <p className="text-sm font-bold text-[#10231C]">{fmtVND(payment.invoiceAmount)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-[#6B7A73] mb-1">Đã thanh toán</p>
              <p className="text-sm font-bold text-green-700">{fmtVND(payment.paidAmount)}</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${hasOutstanding ? "bg-orange-50" : "bg-green-50"}`}>
              <p className="text-[10px] text-[#6B7A73] mb-1">Còn lại</p>
              <p className={`text-sm font-bold ${hasOutstanding ? "text-orange-700" : "text-green-700"}`}>
                {fmtVND(payment.outstandingAmount)}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#6B7A73]">Tiến độ thanh toán</span>
              <span className={`font-bold ${isPaid ? "text-green-700" : "text-[#024430]"}`}>{paidP}%</span>
            </div>
            <div className="h-3 bg-[#E4EAE7] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isPaid ? "bg-green-500" : "bg-[#024430]"}`}
                style={{ width: `${paidP}%` }}
              />
            </div>
          </div>

          {/* Bank info */}
          <div className="bg-[#F6F8F7] rounded-xl p-3 mb-5">
            <p className="text-[10px] font-semibold text-[#6B7A73] uppercase tracking-wide mb-2">Phương thức thanh toán</p>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#024430] rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">VCB</div>
              <div>
                <p className="text-sm font-semibold text-[#10231C]">Chuyển khoản ngân hàng</p>
                <p className="text-xs text-[#6B7A73]">Vietcombank · STK 0071000654321</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-5">
            <PaymentTimeline status={payment.status} />
          </div>

          {/* Documents */}
          <div className="mb-4">
            <DocumentChecklist payment={payment} />
          </div>

          {/* Notes */}
          {payment.notes && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Ghi chú:</span> {payment.notes}
              </p>
            </div>
          )}

          {/* Payment proof upload — finance/admin only */}
          {canUploadPaymentProof && !isPaid && (
            <PaymentProofUpload accentColor="#0F766E" />
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap mt-4">
            {!isPaid && (
              <button
                type="button"
                onClick={() => setShowBank(true)}
                className="flex-1 py-2.5 bg-[#024430] text-white text-sm font-semibold rounded-xl cursor-pointer hover:bg-[#056246]"
              >
                Xem hướng dẫn chuyển khoản
              </button>
            )}
            <Link href={`/pharmacy/orders/${payment.orderId}`} className="flex-1">
              <button
                type="button"
                className="w-full py-2.5 border border-[#E4EAE7] text-[#10231C] text-sm font-semibold rounded-xl cursor-pointer hover:bg-[#F6F8F7]"
              >
                Xem đơn hàng
              </button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {showBank && (
        <BankInfoPanel payment={payment} onClose={() => setShowBank(false)} />
      )}
    </>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function PharmacyPaymentsPage() {
  const { canUploadPaymentProof, isPharmacyWarehouse, isPharmacyBuyer } = useRole();
  const totalInvoice = MOCK_PAYMENTS.reduce((s, p) => s + p.invoiceAmount, 0);
  const totalPaid = MOCK_PAYMENTS.reduce((s, p) => s + p.paidAmount, 0);
  const totalOutstanding = MOCK_PAYMENTS.reduce((s, p) => s + p.outstandingAmount, 0);

  return (
    <div>
      <PageHeader
        title="Thanh toán"
        subtitle="Theo dõi tình hình thanh toán hóa đơn với nhà phân phối"
      />

      {/* Role banners */}
      {isPharmacyWarehouse && (
        <div className="mb-4 p-3 rounded-xl border flex items-center gap-2 text-sm bg-amber-50 border-amber-200 text-amber-800">
          <span>⚠</span>
          <span>Trang thanh toán chỉ dành cho Kế toán — vai trò Kho vận không cần thao tác tại đây</span>
        </div>
      )}
      {isPharmacyBuyer && (
        <div className="mb-4 p-3 rounded-xl border flex items-center gap-2 text-sm bg-[#F6F8F7] border-[#E4EAE7] text-[#6B7A73]">
          <span>ℹ</span>
          <span>Trang thanh toán được xử lý bởi bộ phận Kế toán — vai trò Đặt hàng chỉ cần theo dõi trạng thái</span>
        </div>
      )}

      {/* Info note */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          Ghi nhận thanh toán được xử lý bởi bộ phận kế toán của{" "}
          <strong>Công ty TNHH Phân phối DCP</strong>. Sau khi chuyển khoản, vui lòng liên hệ xác nhận qua hotline:{" "}
          <span className="font-bold">0901 234 567</span>.
        </p>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Tổng phải trả",   value: fmtVND(totalInvoice),     color: "text-[#10231C]",  bg: "bg-white" },
          { label: "Đã thanh toán",   value: fmtVND(totalPaid),         color: "text-green-700",  bg: "bg-green-50" },
          { label: "Còn phải trả",    value: fmtVND(totalOutstanding),  color: "text-orange-700", bg: "bg-orange-50" },
        ].map((s) => (
          <Card key={s.label} className={`border border-[#E4EAE7] ${s.bg}`}>
            <CardBody className="p-5 text-center">
              <p className="text-xs text-[#6B7A73]">{s.label}</p>
              <p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Payment cards */}
      <div className="flex flex-col gap-4">
        {MOCK_PAYMENTS.map((p) => (
          <PaymentCard key={p.id} payment={p} canUploadPaymentProof={canUploadPaymentProof} />
        ))}
      </div>
    </div>
  );
}
