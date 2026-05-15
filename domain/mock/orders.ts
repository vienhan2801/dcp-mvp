import { Order } from "@/domain/models/order";

// ─────────────────────────────────────────────────────────────
// MOCK ORDER DATA
// ORD-001: completed (received_confirmed) — demonstrates full flow
// ORD-002: partially_confirmed — DEMO: supplier confirmed partial qty
// ORD-003: pending_confirmation — freshly submitted, awaiting supplier
// ─────────────────────────────────────────────────────────────

export const mockOrders: Order[] = [

  // ── ORDER 1: Completed ──────────────────────────────────
  {
    id: "ORD-2026-001",
    contractId: "CTR-2026-001",
    hospitalName: "Bệnh viện Đại học Y Dược TP.HCM",
    supplierName: "PhytoPharma",
    orderDate: "2026-03-10",
    requestedDeliveryDate: "2026-03-17",
    deliveryLocation: "Kho dược phẩm tầng 1, Tòa nhà A, 215 Hồng Bàng, Q.5, TP.HCM",
    note: "Giao hàng trong giờ hành chính, liên hệ trước 30 phút",
    status: "received_confirmed",
    totalRequestedAmount: 877_500_000, // 9000×18k + 9000×42k + 5000×135k
    totalConfirmedAmount: 877_500_000,
    lines: [
      {
        id: "LINE-001-1",
        contractItemId: "ITEM-001",
        productName: "Paracetamol 500mg",
        productCode: "MED-PARA-500",
        unit: "Hộp",
        unitPrice: 18_000,
        requestedQty: 9_000,
        confirmedQty: 9_000,
        rejectedQty: 0,
        deliveredQty: 9_000,
        lineAmount: 162_000_000,
        status: "fulfilled",
        fulfillmentRecords: [
          { id: "FUL-001-1", orderLineId: "LINE-001-1", source: "warehouse", quantity: 9000, status: "delivered", deliveredAt: "2026-03-17" },
        ],
      },
      {
        id: "LINE-001-2",
        contractItemId: "ITEM-002",
        productName: "Amoxicillin 500mg",
        productCode: "MED-AMOX-500",
        unit: "Hộp",
        unitPrice: 42_000,
        requestedQty: 9_000,
        confirmedQty: 9_000,
        rejectedQty: 0,
        deliveredQty: 9_000,
        lineAmount: 378_000_000,
        status: "fulfilled",
        fulfillmentRecords: [
          { id: "FUL-001-2", orderLineId: "LINE-001-2", source: "warehouse", quantity: 9000, status: "delivered", deliveredAt: "2026-03-17" },
        ],
      },
      {
        id: "LINE-001-3",
        contractItemId: "ITEM-003",
        productName: "Ceftriaxone 1g",
        productCode: "MED-CEF-1G",
        unit: "Hộp",
        unitPrice: 135_000,
        requestedQty: 5_000,
        confirmedQty: 5_000,
        rejectedQty: 0,
        deliveredQty: 5_000,
        lineAmount: 675_000_000,
        status: "fulfilled",
        fulfillmentRecords: [
          { id: "FUL-001-3", orderLineId: "LINE-001-3", source: "manufacturer", quantity: 5000, status: "delivered", deliveredAt: "2026-03-17" },
        ],
      },
    ],
  },

  // ── ORDER 2: Partially confirmed (KEY DEMO ORDER) ────────
  // Supplier confirmed LESS than requested on 2 lines
  {
    id: "ORD-2026-002",
    contractId: "CTR-2026-001",
    hospitalName: "Bệnh viện Đại học Y Dược TP.HCM",
    supplierName: "PhytoPharma",
    orderDate: "2026-04-15",
    requestedDeliveryDate: "2026-04-22",
    deliveryLocation: "Kho dược phẩm tầng 1, Tòa nhà A, 215 Hồng Bàng, Q.5, TP.HCM",
    note: "",
    status: "partially_confirmed",
    totalRequestedAmount: 82_470_000, // 3000×18k + 1000×42k + 222×135k
    totalConfirmedAmount: 72_000_000, // 2000×18k + 1000×42k + 200×135k
    lines: [
      {
        id: "LINE-002-1",
        contractItemId: "ITEM-001",
        productName: "Paracetamol 500mg",
        productCode: "MED-PARA-500",
        unit: "Hộp",
        unitPrice: 18_000,
        requestedQty: 3_000,
        confirmedQty: 2_000, // ← PARTIAL: 1000 short
        rejectedQty: 1_000,
        deliveredQty: 0,
        lineAmount: 54_000_000,
        status: "partially_confirmed",
        fulfillmentRecords: [],
        supplierNote: "Kho hiện chỉ còn 2.000 hộp, sẽ bổ sung trong đợt sau",
      },
      {
        id: "LINE-002-2",
        contractItemId: "ITEM-002",
        productName: "Amoxicillin 500mg",
        productCode: "MED-AMOX-500",
        unit: "Hộp",
        unitPrice: 42_000,
        requestedQty: 1_000,
        confirmedQty: 1_000, // ← FULL
        rejectedQty: 0,
        deliveredQty: 0,
        lineAmount: 42_000_000,
        status: "confirmed",
        fulfillmentRecords: [],
      },
      {
        id: "LINE-002-3",
        contractItemId: "ITEM-003",
        productName: "Ceftriaxone 1g",
        productCode: "MED-CEF-1G",
        unit: "Hộp",
        unitPrice: 135_000,
        requestedQty: 222,
        confirmedQty: 200, // ← PARTIAL: 22 short
        rejectedQty: 22,
        deliveredQty: 0,
        lineAmount: 29_970_000,
        status: "partially_confirmed",
        fulfillmentRecords: [],
        supplierNote: "Hàng từ nhà sản xuất, dự kiến bổ sung sau 2 tuần",
      },
    ],
  },

  // ── ORDER 3: Pending confirmation ────────────────────────
  {
    id: "ORD-2026-003",
    contractId: "CTR-2026-001",
    hospitalName: "Bệnh viện Đại học Y Dược TP.HCM",
    supplierName: "PhytoPharma",
    orderDate: "2026-05-01",
    requestedDeliveryDate: "2026-05-08",
    deliveryLocation: "Kho dược phẩm tầng 1, Tòa nhà A, 215 Hồng Bàng, Q.5, TP.HCM",
    note: "Ưu tiên giao Paracetamol trước",
    status: "pending_confirmation",
    totalRequestedAmount: 9_000_000,
    totalConfirmedAmount: 0,
    lines: [
      {
        id: "LINE-003-1",
        contractItemId: "ITEM-001",
        productName: "Paracetamol 500mg",
        productCode: "MED-PARA-500",
        unit: "Hộp",
        unitPrice: 18_000,
        requestedQty: 500,
        confirmedQty: 0,
        rejectedQty: 0,
        deliveredQty: 0,
        lineAmount: 9_000_000,
        status: "pending_confirmation",
        fulfillmentRecords: [],
      },
    ],
  },
];
