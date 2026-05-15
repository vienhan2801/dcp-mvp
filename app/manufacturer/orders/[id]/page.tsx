"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import {
  Card, CardBody, CardHeader,
  Chip,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button,
} from "@/components/ui";
import { ArrowLeft } from "lucide-react";

// ── Types ────────────────────────────────────────────────────
type OrderStatus = "pending" | "processing" | "shipped" | "completed";

interface OrderLine {
  product: string;
  qtyRequested: number;
  qtyAvailable: number;
  unit: string;
  unitPrice: number;
}

interface OrderDetail {
  id: string;
  npp: string;
  orderDate: string;
  requiredDate: string;
  address: string;
  status: OrderStatus;
  lines: OrderLine[];
}

interface Lot {
  lotId: string;
  mfgDate: string;
  expDate: string;
  qtyAvailable: number;
}

// ── Status Config ────────────────────────────────────────────
const STATUS_CFG: Record<OrderStatus, { label: string; color: "warning" | "primary" | "secondary" | "success" }> = {
  pending:    { label: "Chờ xử lý",   color: "warning"   },
  processing: { label: "Đang xử lý",  color: "primary"   },
  shipped:    { label: "Đã giao vận", color: "secondary" },
  completed:  { label: "Hoàn thành",  color: "success"   },
};

// ── Mock Orders ──────────────────────────────────────────────
const ORDERS: Record<string, OrderDetail> = {
  "PO-2026-001": {
    id: "PO-2026-001",
    npp: "NPP PhytoPharma",
    orderDate: "2026-05-01",
    requiredDate: "2026-05-15",
    address: "123 Nguyễn Văn Linh, Q.7, TP.HCM",
    status: "processing",
    lines: [
      { product: "Amoxicillin 500mg", qtyRequested: 12000, qtyAvailable: 12000, unit: "Viên", unitPrice: 1_200 },
      { product: "Paracetamol 500mg", qtyRequested: 30000, qtyAvailable: 28000, unit: "Viên", unitPrice: 800  },
    ],
  },
  "PO-2026-002": {
    id: "PO-2026-002",
    npp: "NPP MedDistrib Co.",
    orderDate: "2026-04-28",
    requiredDate: "2026-05-12",
    address: "45 Điện Biên Phủ, Q.3, TP.HCM",
    status: "shipped",
    lines: [
      { product: "Ceftriaxone 1g",     qtyRequested: 800,  qtyAvailable: 800,  unit: "Lọ",   unitPrice: 45_000 },
      { product: "Azithromycin 500mg", qtyRequested: 4500, qtyAvailable: 4500, unit: "Viên", unitPrice: 3_500  },
    ],
  },
  "PO-2026-003": {
    id: "PO-2026-003",
    npp: "NPP PhytoPharma",
    orderDate: "2026-04-20",
    requiredDate: "2026-05-05",
    address: "123 Nguyễn Văn Linh, Q.7, TP.HCM",
    status: "completed",
    lines: [
      { product: "Paracetamol 500mg", qtyRequested: 25000, qtyAvailable: 25000, unit: "Viên", unitPrice: 800   },
      { product: "Omeprazole 20mg",   qtyRequested: 8000,  qtyAvailable: 8000,  unit: "Viên", unitPrice: 2_800 },
    ],
  },
};

const DEFAULT_ORDER: OrderDetail = ORDERS["PO-2026-001"];

// ── Mock Lots (FEFO: nearest expiry first) ───────────────────
const AVAILABLE_LOTS: Lot[] = [
  { lotId: "LOT-2026-A03", mfgDate: "2026-01-10", expDate: "2028-01-10", qtyAvailable: 15000 },
  { lotId: "LOT-2026-A01", mfgDate: "2025-11-05", expDate: "2027-11-05", qtyAvailable: 8000  },
  { lotId: "LOT-2026-A05", mfgDate: "2026-03-20", expDate: "2028-03-20", qtyAvailable: 22000 },
  { lotId: "LOT-2025-B12", mfgDate: "2025-09-01", expDate: "2027-09-01", qtyAvailable: 5000  },
].sort((a, b) => new Date(a.expDate).getTime() - new Date(b.expDate).getTime());

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₫`;
  return `${n.toLocaleString("vi-VN")} ₫`;
}
function fmtNum(n: number) {
  return n.toLocaleString("vi-VN");
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const order = ORDERS[id] ?? DEFAULT_ORDER;

  const [status, setStatus] = useState<OrderStatus>(order.status);

  const total = order.lines.reduce((sum, l) => sum + l.qtyRequested * l.unitPrice, 0);
  const sc = STATUS_CFG[status];

  return (
    <div>
      {/* Back */}
      <div className="mb-4">
        <Link
          href="/manufacturer/orders"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7A73] hover:text-[#10231C] transition-colors"
        >
          <ArrowLeft size={15} />
          Quay lại danh sách đơn hàng
        </Link>
      </div>

      <PageHeader
        title={order.id}
        subtitle={`NPP: ${order.npp}`}
        actions={<Chip color={sc.color} variant="flat">{sc.label}</Chip>}
      />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Left — Order Lines (2/3) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-[#10231C]">Chi tiết sản phẩm</h3>
            </CardHeader>
            <CardBody className="pt-0">
              <Table aria-label="Chi tiết dòng đơn hàng">
                <TableHeader>
                  <TableColumn>Sản phẩm</TableColumn>
                  <TableColumn>SL yêu cầu</TableColumn>
                  <TableColumn>SL có thể giao</TableColumn>
                  <TableColumn>Đơn vị</TableColumn>
                  <TableColumn>Đơn giá</TableColumn>
                  <TableColumn>Thành tiền</TableColumn>
                </TableHeader>
                <TableBody>
                  {order.lines.map((line, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <span className="font-medium text-[#10231C]">{line.product}</span>
                      </TableCell>
                      <TableCell>{fmtNum(line.qtyRequested)}</TableCell>
                      <TableCell>
                        <span className={line.qtyAvailable < line.qtyRequested ? "text-amber-600 font-medium" : "text-emerald-700 font-medium"}>
                          {fmtNum(line.qtyAvailable)}
                        </span>
                      </TableCell>
                      <TableCell>{line.unit}</TableCell>
                      <TableCell>{fmtMoney(line.unitPrice)}</TableCell>
                      <TableCell>
                        <span className="font-semibold">{fmtMoney(line.qtyRequested * line.unitPrice)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Total row */}
                  <TableRow className="bg-[#F6F8F7] font-bold">
                    <TableCell className="font-bold text-[#10231C]">Tổng cộng</TableCell>
                    <TableCell>{fmtNum(order.lines.reduce((s, l) => s + l.qtyRequested, 0))}</TableCell>
                    <TableCell>{fmtNum(order.lines.reduce((s, l) => s + l.qtyAvailable, 0))}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>
                      <span className="font-bold text-[#6D28D9]">{fmtMoney(total)}</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>

        {/* Right — Order Info (1/3) */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-[#10231C]">Thông tin đơn hàng</h3>
            </CardHeader>
            <CardBody className="pt-0 flex flex-col gap-4">
              <div>
                <p className="text-xs text-[#6B7A73] mb-1">Nhà phân phối</p>
                <p className="text-sm font-semibold text-[#10231C]">{order.npp}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7A73] mb-1">Ngày đặt hàng</p>
                <p className="text-sm text-[#10231C]">{order.orderDate}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7A73] mb-1">Ngày giao yêu cầu</p>
                <p className="text-sm font-medium text-amber-700">{order.requiredDate}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7A73] mb-1">Địa chỉ giao hàng</p>
                <p className="text-sm text-[#10231C]">{order.address}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7A73] mb-1">Giá trị đơn hàng</p>
                <p className="text-base font-bold text-[#6D28D9]">{fmtMoney(total)}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Status Action Panel */}
      {status === "processing" && (
        <Card className="mb-6 border-[#6D28D9]/20 bg-violet-50/30">
          <CardBody>
            <h3 className="font-semibold text-[#10231C] mb-1">Hành động xử lý</h3>
            <p className="text-xs text-[#6B7A73] mb-4">Đơn hàng đang trong trạng thái xử lý — xác nhận xuất kho khi đã chuẩn bị xong</p>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => setStatus("shipped")}
                className="bg-[#6D28D9] text-white hover:bg-violet-800"
              >
                Xác nhận xuất kho
              </Button>
              <Button
                variant="bordered"
                onClick={() => setStatus("completed")}
              >
                Đã giao hàng
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Lot / Batch Assignment */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="font-semibold text-[#10231C]">Phân bổ lô sản xuất</h3>
          <p className="text-xs text-[#6B7A73] mt-0.5">Sắp xếp theo FEFO (hạn dùng gần nhất xuất trước)</p>
        </CardHeader>
        <CardBody className="pt-0">
          <Table aria-label="Bảng lô hàng khả dụng">
            <TableHeader>
              <TableColumn>Lô SX</TableColumn>
              <TableColumn>Ngày SX</TableColumn>
              <TableColumn>Hạn dùng</TableColumn>
              <TableColumn>SL khả dụng</TableColumn>
            </TableHeader>
            <TableBody>
              {AVAILABLE_LOTS.map((lot, i) => {
                const expMs = new Date(lot.expDate).getTime() - Date.now();
                const expMonths = Math.floor(expMs / (1000 * 60 * 60 * 24 * 30));
                const isNearExp = expMonths < 18;
                return (
                  <TableRow key={lot.lotId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {i === 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">FEFO</span>
                        )}
                        <span className="font-mono text-xs font-semibold text-[#10231C]">{lot.lotId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[#6B7A73]">{lot.mfgDate}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium ${isNearExp ? "text-amber-600" : "text-emerald-700"}`}>
                        {lot.expDate}
                        <span className="ml-1 text-[#6B7A73] font-normal">({expMonths}T)</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-[#10231C]">{fmtNum(lot.qtyAvailable)}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
