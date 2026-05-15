import { Order, OrderLine, OrderLineStatus, OrderStatus } from "@/domain/models/order";

// ──────────────────────────────────────────────────────────────
// ORDER BUSINESS LOGIC
// All calculations at ORDER LINE level
// ──────────────────────────────────────────────────────────────

export function deriveLineStatus(line: OrderLine): OrderLineStatus {
  if (line.confirmedQty === 0 && line.requestedQty > 0) return "pending_confirmation";
  if (line.confirmedQty > 0 && line.confirmedQty < line.requestedQty) return "partially_confirmed";
  if (line.confirmedQty >= line.requestedQty) {
    if (line.deliveredQty === 0) return "confirmed";
    if (line.deliveredQty < line.confirmedQty) return "partially_fulfilled";
    return "fulfilled";
  }
  return "pending_confirmation";
}

export function deriveOrderStatus(order: Order): OrderStatus {
  if (order.status === "received_confirmed") return "received_confirmed";
  if (order.status === "delivered") return "delivered";
  if (order.status === "shipping") return "shipping";
  if (order.status === "preparing") return "preparing";
  if (order.status === "cancelled") return "cancelled";

  const lines = order.lines;
  if (lines.every((l) => l.status === "fulfilled")) return "delivered";
  if (lines.every((l) => l.status === "confirmed")) return "confirmed";
  if (lines.some((l) => l.status === "partially_confirmed" || l.status === "confirmed")) {
    return "partially_confirmed";
  }
  return "pending_confirmation";
}

/** Supplier confirms each line with a specific qty (supports partial) */
export function confirmOrderLines(
  order: Order,
  confirmations: { lineId: string; confirmedQty: number; note?: string }[]
): Order {
  const updatedLines = order.lines.map((line) => {
    const conf = confirmations.find((c) => c.lineId === line.id);
    if (!conf) return line;

    const confirmedQty = Math.min(conf.confirmedQty, line.requestedQty);
    const rejectedQty = line.requestedQty - confirmedQty;
    const updatedLine: OrderLine = {
      ...line,
      confirmedQty,
      rejectedQty,
      supplierNote: conf.note,
      status: deriveLineStatus({ ...line, confirmedQty }),
    };
    return updatedLine;
  });

  const totalConfirmed = updatedLines.reduce(
    (s, l) => s + l.confirmedQty * l.unitPrice,
    0
  );

  const updatedOrder: Order = {
    ...order,
    lines: updatedLines,
    totalConfirmedAmount: totalConfirmed,
    status: deriveOrderStatus({ ...order, lines: updatedLines }),
  };

  return updatedOrder;
}

/** Advance delivery status for an entire order */
export function advanceDeliveryStatus(order: Order): Order {
  const flow: OrderStatus[] = ["confirmed", "partially_confirmed", "preparing", "shipping", "delivered"];
  // If already confirmed/partially_confirmed, go to preparing
  if (order.status === "confirmed" || order.status === "partially_confirmed") {
    return { ...order, status: "preparing" };
  }
  if (order.status === "preparing") return { ...order, status: "shipping" };
  if (order.status === "shipping") return { ...order, status: "delivered" };
  return order;
}

/** Hospital confirms receipt — finalises delivered quantities */
export function confirmReceipt(order: Order): Order {
  const updatedLines = order.lines.map((line) => ({
    ...line,
    deliveredQty: line.confirmedQty, // delivered = confirmed on receipt
    status: "fulfilled" as OrderLineStatus,
  }));
  return {
    ...order,
    lines: updatedLines,
    status: "received_confirmed",
  };
}

/** Calculate order summary stats */
export function getOrderSummary(order: Order) {
  const totalRequested = order.lines.reduce((s, l) => s + l.requestedQty * l.unitPrice, 0);
  const totalConfirmed = order.lines.reduce((s, l) => s + l.confirmedQty * l.unitPrice, 0);
  const totalDelivered = order.lines.reduce((s, l) => s + l.deliveredQty * l.unitPrice, 0);
  const totalRejected = order.lines.reduce((s, l) => s + l.rejectedQty * l.unitPrice, 0);
  const hasPartial = order.lines.some((l) => l.status === "partially_confirmed");
  return { totalRequested, totalConfirmed, totalDelivered, totalRejected, hasPartial };
}

/** Check if order has any partial confirmation */
export function isPartiallyConfirmed(order: Order): boolean {
  return order.lines.some((l) => l.status === "partially_confirmed");
}
