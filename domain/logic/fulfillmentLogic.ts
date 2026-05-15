import { OrderLine, FulfillmentRecord } from "@/domain/models/order";

export function updateDelivery(
  line: OrderLine,
  deliveredQty: number
): OrderLine {
  const newDelivered = line.deliveredQty + deliveredQty;
  let status = line.status;
  if (newDelivered > 0 && newDelivered < line.confirmedQty) {
    status = "partially_fulfilled";
  } else if (newDelivered >= line.confirmedQty) {
    status = "fulfilled";
  }
  return { ...line, deliveredQty: newDelivered, status };
}

export function createFulfillmentRecord(
  orderLineId: string,
  source: "warehouse" | "manufacturer",
  quantity: number
): FulfillmentRecord {
  return {
    id: `FUL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    orderLineId,
    source,
    quantity,
    status: "pending",
  };
}

export function getTotalFulfilledQty(records: FulfillmentRecord[]): number {
  return records
    .filter((r) => r.status === "delivered")
    .reduce((s, r) => s + r.quantity, 0);
}
