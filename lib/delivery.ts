import type { DeliveryDestination } from "@/lib/types";

export function getActiveSubDestinations(
  destination: DeliveryDestination | null,
) {
  return destination?.subDestinations.filter((s) => s.isActive) ?? [];
}

export function requiresSubDestination(
  destination: DeliveryDestination | null,
): boolean {
  return destination !== null;
}

export function getEffectiveDeliveryFee(
  destination: DeliveryDestination | null,
  subDestinationId: string | null,
): number {
  if (!destination || !subDestinationId) return 0;

  const activeSubs = getActiveSubDestinations(destination);

  const sub = activeSubs.find((s) => s.id === subDestinationId);

  return sub?.deliveryFee ?? 0;
}
