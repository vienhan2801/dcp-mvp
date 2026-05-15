import { Order } from "@/domain/models/order";
import { Contract } from "@/domain/models/contract";
import { AggregationItem, AggregationSummary } from "@/domain/models/aggregation";

// ──────────────────────────────────────────────────────────────
// AGGREGATION LOGIC
// Aggregate demand across all orders for supply planning
// ──────────────────────────────────────────────────────────────

export function aggregateOrders(
  orders: Order[],
  contract: Contract
): AggregationSummary {
  const map: Record<
    string,
    {
      productName: string;
      productCode: string;
      unit: string;
      contractedQty: number;
      unitPrice: number;
      totalRequested: number;
      totalConfirmed: number;
      totalDelivered: number;
    }
  > = {};

  // Build lookup from contract items
  const itemLookup: Record<string, (typeof contract.items)[0]> = {};
  contract.items.forEach((item) => { itemLookup[item.id] = item; });

  // Aggregate across all non-cancelled orders
  orders
    .filter((o) => o.status !== "cancelled")
    .forEach((order) => {
      order.lines
        .filter((l) => l.status !== "cancelled")
        .forEach((line) => {
          const key = line.contractItemId;
          if (!map[key]) {
            const contractItem = itemLookup[key];
            map[key] = {
              productName: line.productName,
              productCode: line.productCode,
              unit: line.unit,
              contractedQty: contractItem?.contractedQty ?? 0,
              unitPrice: line.unitPrice,
              totalRequested: 0,
              totalConfirmed: 0,
              totalDelivered: 0,
            };
          }
          map[key].totalRequested += line.requestedQty;
          map[key].totalConfirmed += line.confirmedQty;
          map[key].totalDelivered += line.deliveredQty;
        });
    });

  const items: AggregationItem[] = Object.values(map).map((v) => ({
    productName: v.productName,
    productCode: v.productCode,
    unit: v.unit,
    contractedQty: v.contractedQty,
    totalRequested: v.totalRequested,
    totalConfirmed: v.totalConfirmed,
    totalDelivered: v.totalDelivered,
    gap: v.totalRequested - v.totalConfirmed,
    fulfillmentRate: v.totalRequested > 0 ? v.totalConfirmed / v.totalRequested : 0,
  }));

  const totalRequestedValue = items.reduce((s, i) => s + i.totalRequested * (contract.items.find(ci => ci.productName === i.productName)?.unitPrice ?? 0), 0);
  const totalConfirmedValue = items.reduce((s, i) => s + i.totalConfirmed * (contract.items.find(ci => ci.productName === i.productName)?.unitPrice ?? 0), 0);

  return {
    items,
    totalRequestedValue,
    totalConfirmedValue,
    totalGapValue: totalRequestedValue - totalConfirmedValue,
    orderCount: orders.filter((o) => o.status !== "cancelled").length,
  };
}

/** Quick check: is there any unfulfilled demand gap? */
export function hasDemandGap(summary: AggregationSummary): boolean {
  return summary.items.some((i) => i.gap > 0);
}
