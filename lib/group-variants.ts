// lib/group-variants.ts

const VARIANT_MARKERS = new Set([
  "ساندويش",
  "ساندويجي",
  "وجبة",
  "عربي",
  "فرنجي",
]);

function normalizeBaseName(nameAr: string): string {
  return nameAr
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter((token) => token && !VARIANT_MARKERS.has(token))
    .join(" ")
    .trim();
}

export function groupProductsByVariant<
  T extends { id: string; nameAr: string; sortOrder: number },
>(products: T[]): T[] {
  const groups = new Map<string, T[]>();

  for (const product of products) {
    const key = normalizeBaseName(product.nameAr) || product.nameAr;

    const bucket = groups.get(key);

    if (bucket) {
      bucket.push(product);
    } else {
      groups.set(key, [product]);
    }
  }

  // Groups appear in the position of their earliest member,
  // so the overall menu order stays roughly the same.
  const orderedGroups = Array.from(groups.values()).sort(
    (a, b) =>
      Math.min(...a.map((p) => p.sortOrder)) -
      Math.min(...b.map((p) => p.sortOrder)),
  );

  // Within a group:
  // plain/sandwich variant first, "وجبة" variant after.
  for (const group of orderedGroups) {
    group.sort((a, b) => {
      const aIsMeal = a.nameAr.includes("وجبة");
      const bIsMeal = b.nameAr.includes("وجبة");

      if (aIsMeal !== bIsMeal) {
        return aIsMeal ? 1 : -1;
      }

      return a.sortOrder - b.sortOrder;
    });
  }

  return orderedGroups.flat();
}
