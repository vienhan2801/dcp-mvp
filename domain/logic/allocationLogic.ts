import { ContractItem, Contract, AllocationStatus } from "@/domain/models/contract";

// ──────────────────────────────────────────────────────────────
// RULE: contracted >= requested >= confirmed >= delivered
// remaining = contracted - requested
// ──────────────────────────────────────────────────────────────

export function calculateRemainingQty(item: ContractItem): number {
  return item.contractedQty - item.requestedQty;
}

export function calculateContractValue(item: ContractItem): number {
  return item.contractedQty * item.unitPrice;
}

export function calculateRequestedValue(item: ContractItem): number {
  return item.requestedQty * item.unitPrice;
}

export function calculateConfirmedValue(item: ContractItem): number {
  return item.confirmedQty * item.unitPrice;
}

export function calculateDeliveredValue(item: ContractItem): number {
  return item.deliveredQty * item.unitPrice;
}

export function calculateRemainingValue(item: ContractItem): number {
  return item.remainingQty * item.unitPrice;
}

export function deriveAllocationStatus(item: ContractItem): AllocationStatus {
  if (item.remainingQty <= 0) return "fully_allocated";
  const ratio = item.remainingQty / item.contractedQty;
  if (ratio < 0.1) return "low_remaining";
  const expiryDate = new Date(item.expiryDate);
  const now = new Date();
  const monthsToExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (monthsToExpiry < 3) return "near_expiry";
  return "available";
}

/** Apply an order to contract items — increase requestedQty */
export function applyOrderToContract(
  contract: Contract,
  lines: { contractItemId: string; requestedQty: number }[]
): Contract {
  const updatedItems = contract.items.map((item) => {
    const line = lines.find((l) => l.contractItemId === item.id);
    if (!line) return item;
    const newRequested = item.requestedQty + line.requestedQty;
    const newRemaining = item.contractedQty - newRequested;
    return {
      ...item,
      requestedQty: newRequested,
      remainingQty: newRemaining,
      status: deriveAllocationStatus({ ...item, requestedQty: newRequested, remainingQty: newRemaining }),
    };
  });

  return recalculateContractFinancials({ ...contract, items: updatedItems });
}

/** Apply confirmed quantities to contract items */
export function applyConfirmationToContract(
  contract: Contract,
  confirmations: { contractItemId: string; confirmedQty: number }[]
): Contract {
  const updatedItems = contract.items.map((item) => {
    const conf = confirmations.find((c) => c.contractItemId === item.id);
    if (!conf) return item;
    return { ...item, confirmedQty: item.confirmedQty + conf.confirmedQty };
  });
  return recalculateContractFinancials({ ...contract, items: updatedItems });
}

/** Apply delivered quantities to contract items */
export function applyDeliveryToContract(
  contract: Contract,
  deliveries: { contractItemId: string; deliveredQty: number }[]
): Contract {
  const updatedItems = contract.items.map((item) => {
    const del = deliveries.find((d) => d.contractItemId === item.id);
    if (!del) return item;
    return { ...item, deliveredQty: item.deliveredQty + del.deliveredQty };
  });
  return recalculateContractFinancials({ ...contract, items: updatedItems });
}

export function recalculateContractFinancials(contract: Contract): Contract {
  const totalContract = contract.items.reduce((s, i) => s + calculateContractValue(i), 0);
  const requested = contract.items.reduce((s, i) => s + calculateRequestedValue(i), 0);
  const confirmed = contract.items.reduce((s, i) => s + calculateConfirmedValue(i), 0);
  const delivered = contract.items.reduce((s, i) => s + calculateDeliveredValue(i), 0);
  return {
    ...contract,
    totalContractValue: totalContract,
    requestedValue: requested,
    confirmedValue: confirmed,
    deliveredValue: delivered,
    outstandingValue: delivered - contract.paidValue,
    remainingValue: totalContract - requested,
  };
}

/** Validate that requested qty doesn't exceed remaining */
export function validateOrderLine(
  item: ContractItem,
  requestedQty: number
): { valid: boolean; message?: string } {
  if (requestedQty <= 0) return { valid: false, message: "Số lượng phải lớn hơn 0" };
  if (requestedQty > item.remainingQty) {
    return {
      valid: false,
      message: `Vượt quá số lượng còn lại (tối đa: ${item.remainingQty.toLocaleString("vi-VN")} ${item.unit})`,
    };
  }
  return { valid: true };
}
