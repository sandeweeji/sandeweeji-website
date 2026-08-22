import type { DeliveryDestination } from "@/lib/types";

export function getActiveSubDestinations(
  destination: DeliveryDestination | null,
) {
  return destination?.subDestinations.filter((s) => s.isActive) ?? [];
}

export function requiresSubDestination(
  destination: DeliveryDestination | null,
): boolean {
  return getActiveSubDestinations(destination).length > 0;
}

export function getEffectiveDeliveryFee(
  destination: DeliveryDestination | null,
  subDestinationId: string | null,
): number {
  if (!destination) return 0;

  const activeSubs = getActiveSubDestinations(destination);
  if (activeSubs.length === 0) return destination.deliveryFee;

  const sub = activeSubs.find((s) => s.id === subDestinationId);
  return sub ? sub.deliveryFee : 0;
}
