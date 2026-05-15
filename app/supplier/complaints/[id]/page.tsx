"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardHeader, Button, Chip, Textarea } from "@/components/ui";
import { ArrowLeft, CheckCircle2, Clock, FileText, Paperclip } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
type ComplaintStatus = "open" | "investigating" | "resolved";

interface ComplaintDetail {
  id: string;
  customer: string;
  orderId: string;
  drug: string;
  lotNumber: string;
  issue: string;
  description: string;
  quantity: string;
  reportedDate: string;
  status: ComplaintStatus;
  attachmentCount: number;
  resolution?: string;
  resolvedDate?: string;
}

// ─── Mock Data ────────────────────────────────────────────────
const COMPLAINTS: Record<string, ComplaintDetail> = {
  "CMP-001": {
    id: "CMP-001",
    customer: "BV Chợ Rẫy",
    orderId: "ORD-2026-001",
    drug: "Paracetamol 500mg",
    lotNumber: "L2026-001",
    issue: "Thuốc bị ẩm, mốc",
    description:
      "Lô thuốc Paracetamol 500mg nhận ngày 2026-05-04 có dấu hiệu ẩm mốc trên bề mặt viên nén. Bao bì ngoài không bị hư hỏng, tuy nhiên khi mở ra phát hiện khoảng 30% số viên có màu sắc thay đổi và mùi lạ. Bệnh viện đã ngừng phát thuốc lô này ngay lập tức.",
    quantity: "500 viên",
    reportedDate: "2026-05-05",
    status: "resolved",
    attachmentCount: 3,
    resolution:
      "Đã kiểm tra lô hàng L2026-001, xác nhận độ ẩm vượt ngưỡng. Thu hồi 500 viên, bồi thường 400.000₫. Đã cải thiện điều kiện bảo quản kho.",
    resolvedDate: "2026-05-08",
  },
  "CMP-002": {
    id: "CMP-002",
    customer: "Nhà thuốc Phúc Khang",
    orderId: "ORD-2026-002",
    drug: "Amoxicillin",
    lotNumber: "L2026-002",
    issue: "Thiếu số lô trên bao bì",
    description:
      "Lô hàng Amoxicillin 250mg/5ml giao ngày 2026-05-09 bị thiếu thông tin số lô sản xuất trên một phần nhãn. Khoảng 40 hộp trong tổng số 200 viên không có số lô in rõ ràng, ảnh hưởng đến truy xuất nguồn gốc.",
    quantity: "200 viên",
    reportedDate: "2026-05-10",
    status: "investigating",
    attachmentCount: 2,
  },
  "CMP-003": {
    id: "CMP-003",
    customer: "BV Đại học Y Dược",
    orderId: "ORD-2026-003",
    drug: "Ceftriaxone 1g",
    lotNumber: "L2026-003",
    issue: "Lọ bị vỡ khi nhận",
    description:
      "Khi nhận hàng giao ngày 2026-05-12, phát hiện 12 lọ Ceftriaxone 1g bị vỡ hoặc nứt. Các lọ này nằm ở góc thùng carton, có dấu hiệu va đập mạnh trong quá trình vận chuyển. Đề nghị kiểm tra quy trình đóng gói và vận chuyển.",
    quantity: "12 lọ",
    reportedDate: "2026-05-13",
    status: "open",
    attachmentCount: 4,
  },
  "CMP-004": {
    id: "CMP-004",
    customer: "Nhà thuốc An Khang",
    orderId: "ORD-2026-004",
    drug: "Azithromycin",
    lotNumber: "L2026-004",
    issue: "Hạn dùng còn 3 tháng",
    description:
      "Lô hàng Azithromycin 500mg giao ngày 2026-05-13 có hạn dùng đến tháng 8/2026, tức chỉ còn khoảng 3 tháng. Theo hợp đồng, thuốc giao phải có hạn dùng tối thiểu 12 tháng kể từ ngày nhận. Đề nghị đổi lô hàng mới hoặc hoàn tiền.",
    quantity: "300 viên",
    reportedDate: "2026-05-14",
    status: "open",
    attachmentCount: 1,
  },
};

// ─── Status Config ────────────────────────────────────────────
const STATUS_CONFIG: Record<ComplaintStatus, { label: string; chipColor: "warning" | "primary" | "success" }> = {
  open:          { label: "Mới tiếp nhận", chipColor: "warning" },
  investigating: { label: "Đang xử lý",   chipColor: "primary" },
  resolved:      { label: "Đã xử lý",     chipColor: "success" },
};

// ─── Attachment placeholder names ────────────────────────────
function getAttachmentNames(count: number): string[] {
  const all = [
    "anh_lo_hang_01.jpg",
    "video_su_co.mp4",
    "bien_ban_giao_hang.pdf",
    "anh_lo_hang_02.jpg",
    "phieu_kiem_tra.pdf",
  ];
  return all.slice(0, count);
}

// ─── Timeline Step ────────────────────────────────────────────
function TimelineStep({
  label,
  date,
  done,
  last,
}: {
  label: string;
  date?: string;
  done: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
            done ? "bg-[#024430] text-white" : "bg-[#E4EAE7] text-[#6B7A73]"
          }`}
        >
          {done ? <CheckCircle2 size={14} /> : <Clock size={14} />}
        </div>
        {!last && (
          <div className={`w-0.5 h-8 mt-1 ${done ? "bg-[#024430]" : "bg-[#E4EAE7]"}`} />
        )}
      </div>
      <div className="pb-4">
        <p className={`text-sm font-medium ${done ? "text-[#10231C]" : "text-[#6B7A73]"}`}>
          {label}
        </p>
        {date && <p className="text-xs text-[#6B7A73] mt-0.5">{date}</p>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function ComplaintDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "CMP-001";
  const base = COMPLAINTS[id] ?? COMPLAINTS["CMP-001"];

  const [status, setStatus] = useState<ComplaintStatus>(base.status);
  const [resolutionText, setResolutionText] = useState("");

  const cfg = STATUS_CONFIG[status];
  const attachments = getAttachmentNames(base.attachmentCount);

  const isOpen         = status === "open";
  const isInvestigating = status === "investigating";
  const isResolved     = status === "resolved";

  const resolvedDate = base.resolvedDate ?? "2026-05-15";

  return (
    <div>
      {/* Back link */}
      <Link
        href="/supplier/complaints"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B7A73] hover:text-[#10231C] mb-4 transition-colors"
      >
        <ArrowLeft size={15} />
        Quay lại danh sách khiếu nại
      </Link>

      {/* Page Header */}
      <PageHeader
        title={base.id}
        subtitle={`${base.drug} · ${base.customer}`}
        actions={<Chip color={cfg.chipColor} size="sm">{cfg.label}</Chip>}
      />

      {/* ─── Two-column layout ──────────────────────────────── */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* Left column (2/3) */}
        <div className="col-span-2 flex flex-col gap-5">
          {/* Mô tả sự cố */}
          <Card>
            <CardHeader>
              <p className="font-semibold text-[#10231C]">Mô tả sự cố</p>
            </CardHeader>
            <CardBody className="pt-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                <div>
                  <p className="text-xs text-[#6B7A73] font-medium">Khách hàng</p>
                  <p className="text-sm text-[#10231C] mt-0.5">{base.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7A73] font-medium">Đơn hàng</p>
                  <p className="text-sm text-[#10231C] mt-0.5">{base.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7A73] font-medium">Sản phẩm</p>
                  <p className="text-sm text-[#10231C] mt-0.5">{base.drug}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7A73] font-medium">Số lượng</p>
                  <p className="text-sm text-[#10231C] mt-0.5">{base.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7A73] font-medium">Vấn đề</p>
                  <p className="text-sm text-[#10231C] mt-0.5">{base.issue}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7A73] font-medium">Ngày báo cáo</p>
                  <p className="text-sm text-[#10231C] mt-0.5">{base.reportedDate}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#6B7A73] font-medium mb-1">Chi tiết</p>
                <p className="text-sm text-[#10231C] leading-relaxed">{base.description}</p>
              </div>
            </CardBody>
          </Card>

          {/* Tài liệu đính kèm */}
          <Card>
            <CardHeader>
              <p className="font-semibold text-[#10231C]">Tài liệu đính kèm</p>
            </CardHeader>
            <CardBody className="pt-3">
              {attachments.length === 0 ? (
                <p className="text-sm text-[#6B7A73]">Không có tài liệu đính kèm</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {attachments.map((name) => (
                    <div
                      key={name}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[#E4EAE7] bg-[#F6F8F7] hover:bg-white transition-colors cursor-pointer"
                    >
                      <Paperclip size={14} className="text-[#6B7A73] flex-shrink-0" />
                      <span className="text-sm text-[#10231C]">{name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Kết quả xử lý (only if resolved) */}
          {isResolved && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-700" />
                  <p className="font-semibold text-green-800">Kết quả xử lý</p>
                </div>
              </CardHeader>
              <CardBody className="pt-3">
                <p className="text-sm text-green-800 leading-relaxed mb-3">
                  {base.resolution}
                </p>
                <p className="text-xs text-green-700">
                  Ngày xử lý: <span className="font-medium">{resolvedDate}</span>
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right column (1/3) */}
        <div className="col-span-1 flex flex-col gap-5">
          {/* Thông tin đơn hàng */}
          <Card>
            <CardHeader>
              <p className="font-semibold text-[#10231C]">Thông tin đơn hàng</p>
            </CardHeader>
            <CardBody className="pt-3 flex flex-col gap-3">
              <div>
                <p className="text-xs text-[#6B7A73] font-medium">Mã đơn hàng</p>
                <Link
                  href={`/supplier/orders/${base.orderId}`}
                  className="text-sm text-[#024430] font-medium hover:underline mt-0.5 block"
                >
                  {base.orderId}
                </Link>
              </div>
              <div>
                <p className="text-xs text-[#6B7A73] font-medium">Khách hàng</p>
                <p className="text-sm text-[#10231C] mt-0.5">{base.customer}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7A73] font-medium">Sản phẩm</p>
                <p className="text-sm text-[#10231C] mt-0.5">{base.drug}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7A73] font-medium">Số lô</p>
                <p className="text-sm text-[#10231C] mt-0.5 font-mono">{base.lotNumber}</p>
              </div>
            </CardBody>
          </Card>

          {/* Timeline xử lý */}
          <Card>
            <CardHeader>
              <p className="font-semibold text-[#10231C]">Timeline xử lý</p>
            </CardHeader>
            <CardBody className="pt-4">
              <TimelineStep
                label="Tiếp nhận khiếu nại"
                date={base.reportedDate}
                done={true}
              />
              <TimelineStep
                label="Đang điều tra"
                date={isInvestigating || isResolved ? "Đang tiến hành" : undefined}
                done={isInvestigating || isResolved}
              />
              <TimelineStep
                label="Đã xử lý"
                date={isResolved ? resolvedDate : undefined}
                done={isResolved}
                last
              />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ─── Action Panel ───────────────────────────────────── */}
      <Card>
        <CardBody className="p-5">
          {isOpen && (
            <div className="flex items-center gap-3">
              <Button
                className="bg-[#024430] text-white"
                onClick={() => setStatus("investigating")}
              >
                Bắt đầu điều tra
              </Button>
              <Button
                className="bg-red-600 text-white"
                onClick={() => {}}
              >
                Từ chối / Không hợp lệ
              </Button>
            </div>
          )}

          {isInvestigating && (
            <div className="flex flex-col gap-3">
              <Textarea
                label="Nhập kết quả xử lý..."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                minRows={4}
              />
              <div>
                <Button
                  className="bg-[#024430] text-white"
                  onClick={() => setStatus("resolved")}
                >
                  Đánh dấu đã giải quyết
                </Button>
              </div>
            </div>
          )}

          {isResolved && (
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 size={18} className="text-green-700 flex-shrink-0" />
              <p className="text-sm font-semibold text-green-800">Đã xử lý thành công</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
