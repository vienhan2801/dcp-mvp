// ─────────────────────────────────────────────────────────
// CONTRACT DOMAIN MODEL
// Source of truth for pharmaceutical supply allocation
// ─────────────────────────────────────────────────────────

export type AllocationStatus =
  | "available"
  | "low_remaining"
  | "fully_allocated"
  | "near_expiry"
  | "overallocated";

export interface ContractItem {
  id: string;
  productCode: string;
  productName: string;
  activeIngredient: string;
  dosageForm: string;
  specification: string;
  unit: string;

  // ── Quantity hierarchy (contractedQty >= requestedQty >= confirmedQty >= deliveredQty) ──
  contractedQty: number;   // from awarded tender
  requestedQty: number;    // sum of all order lines
  confirmedQty: number;    // supplier confirmed
  fulfilledQty: number;    // dispatched from warehouse/manufacturer
  deliveredQty: number;    // physically received at hospital
  remainingQty: number;    // contractedQty - requestedQty

  unitPrice: number;
  expiryDate: string;
  batchNo: string;
  status: AllocationStatus;
}

export interface Contract {
  id: string;
  tenderCode: string;
  contractCode: string;
  contractName: string;
  supplierName: string;
  hospitalName: string;
  startDate: string;
  endDate: string;
  contractStatus: "active" | "expired" | "suspended";
  paymentTerm: string;
  deliveryTerm: string;

  // ── Financial summary ──
  totalContractValue: number;
  requestedValue: number;
  confirmedValue: number;
  deliveredValue: number;
  paidValue: number;
  outstandingValue: number;
  remainingValue: number;

  items: ContractItem[];
}
