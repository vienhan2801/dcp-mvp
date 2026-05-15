export interface AggregationItem {
  productName: string;
  productCode: string;
  unit: string;
  contractedQty: number;
  totalRequested: number;
  totalConfirmed: number;
  totalDelivered: number;
  gap: number;          // totalRequested - totalConfirmed
  fulfillmentRate: number; // totalConfirmed / totalRequested (0-1)
}

export interface AggregationSummary {
  items: AggregationItem[];
  totalRequestedValue: number;
  totalConfirmedValue: number;
  totalGapValue: number;
  orderCount: number;
}
