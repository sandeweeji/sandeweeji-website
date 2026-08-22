import { formatPrice } from "@/lib/utils";
import type {
  CartItem,
  DeliveryDestination,
  DeliverySubDestination,
} from "@/lib/types";
import { getEffectiveDeliveryFee } from "@/lib/delivery";

interface BuildOrderMessageParams {
  items: CartItem[];
  locale: string;
  total: number;
  destination: DeliveryDestination | null;
  subDestination: DeliverySubDestination | null;
  address: string;
  name: string;
  phone: string;
  orderNotes: string;
}

export function buildOrderMessage({
  items,
  locale,
  total,
  destination,
  subDestination,
  address,
  name,
  phone,
  orderNotes,
}: BuildOrderMessageParams): string {
  const isAr = locale === "ar";
  const deliveryFee = getEffectiveDeliveryFee(
    destination,
    subDestination?.id ?? null,
  );
  const grandTotal = total + deliveryFee;

  let message = isAr
    ? "مرحباً، أريد طلب:\n"
    : "Hello, I would like to place an order:\n";

  items.forEach((item) => {
    const itemName = isAr ? item.nameAr : item.nameEn || item.nameAr;
    const addedExtras = item.extras.filter((e) => e.type === "ADD");
    const removedExtras = item.extras.filter((e) => e.type === "REMOVE");

    message += `\n• ${item.quantity}x ${itemName}`;

    if (addedExtras.length > 0) {
      message += isAr ? "\n  الإضافات:" : "\n  Add-ons:";
      addedExtras.forEach((e) => {
        message += `\n  + ${isAr ? e.nameAr : e.nameEn || e.nameAr}`;
      });
    }

    if (removedExtras.length > 0) {
      message += isAr ? "\n  بدون:" : "\n  Without:";
      removedExtras.forEach((e) => {
        message += `\n  - ${isAr ? e.nameAr : e.nameEn || e.nameAr}`;
      });
    }

    if (item.notes?.trim()) {
      message += isAr
        ? `\n  ملاحظات: ${item.notes.trim()}`
        : `\n  Notes: ${item.notes.trim()}`;
    }

    message += "\n";
  });

  message += isAr
    ? `\nالمجموع الفرعي: ${formatPrice(total)}`
    : `\nSubtotal: ${formatPrice(total)}`;

  if (destination) {
    const destName = isAr
      ? destination.nameAr
      : destination.nameEn || destination.nameAr;
    const subName = subDestination
      ? isAr
        ? subDestination.nameAr
        : subDestination.nameEn || subDestination.nameAr
      : null;

    const areaLabel = subName ? `${destName} - ${subName}` : destName;
    const feeText =
      deliveryFee > 0 ? formatPrice(deliveryFee) : isAr ? "مجاني" : "Free";

    message += isAr
      ? `\nمنطقة التوصيل: ${areaLabel} (${feeText})`
      : `\nDelivery area: ${areaLabel} (${feeText})`;
  }

  message += isAr
    ? `\nالمجموع الكلي: ${formatPrice(grandTotal)}`
    : `\nTotal: ${formatPrice(grandTotal)}`;
  message += isAr
    ? `\nتفاصيل العنوان: ${address}`
    : `\nAddress details: ${address}`;
  message += isAr ? `\nالاسم: ${name}` : `\nName: ${name}`;
  message += isAr ? `\nرقم الهاتف: ${phone}` : `\nPhone: ${phone}`;

  if (orderNotes.trim()) {
    message += isAr
      ? `\nملاحظات إضافية: ${orderNotes.trim()}`
      : `\nOrder notes: ${orderNotes.trim()}`;
  }

  message += isAr ? "\n\nشكراً!" : "\n\nThank you!";

  return message;
}
