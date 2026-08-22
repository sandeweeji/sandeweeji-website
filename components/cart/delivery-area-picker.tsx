"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, MapPin, Search, X } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { getActiveSubDestinations, requiresSubDestination } from "@/lib/delivery";
import type { DeliveryDestination, DeliverySubDestination } from "@/lib/types";

interface DeliveryAreaPickerProps {
  isRtl: boolean;
  destinations: DeliveryDestination[];
  isLoading: boolean;
  isError: boolean;
  destinationId: string | null;
  subDestinationId: string | null;
  onSelectDestination: (destination: DeliveryDestination) => void;
  onSelectSubDestination: (sub: DeliverySubDestination) => void;
  onClear: () => void;
  errorMessage?: string;
}

/**
 * Two-step picker:
 *  1) pick the destination (e.g. "Hamra")
 *  2) if that destination has active sub-destinations, pick one of those
 *     (e.g. "Near AUB" vs "Near Barbir") — each with its own fee.
 * Destinations with no sub-destinations skip straight to "selected".
 */
export function DeliveryAreaPicker({
  isRtl,
  destinations,
  isLoading,
  isError,
  destinationId,
  subDestinationId,
  onSelectDestination,
  onSelectSubDestination,
  onClear,
  errorMessage,
}: DeliveryAreaPickerProps) {
  const [search, setSearch] = useState("");
  // Which destination is being drilled into for sub-area selection.
  // Defaults to the already-selected destination (if any) so re-opening
  // the picker on a destination that needs a sub-area goes straight there.
  const [drillDestination, setDrillDestination] = useState<DeliveryDestination | null>(null);

  const selectedDestination = useMemo(
    () => destinations.find((d) => d.id === destinationId) ?? null,
    [destinations, destinationId],
  );

  const selectedSubDestination = useMemo(() => {
    if (!selectedDestination) return null;
    return (
      getActiveSubDestinations(selectedDestination).find((s) => s.id === subDestinationId) ?? null
    );
  }, [selectedDestination, subDestinationId]);

  const activeDestination = drillDestination ?? selectedDestination;
  const isChoosingArea = !selectedDestination || (requiresSubDestination(selectedDestination) && !selectedSubDestination);

  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();
    const active = destinations.filter((d) => d.isActive);
    if (!query) return active;

    return active.filter(
      (d) => d.nameAr.toLowerCase().includes(query) || (d.nameEn ?? "").toLowerCase().includes(query),
    );
  }, [destinations, search]);

  const filteredSubDestinations = useMemo(() => {
    if (!activeDestination) return [];
    const subs = getActiveSubDestinations(activeDestination);
    const query = search.trim().toLowerCase();
    if (!query) return subs;

    return subs.filter(
      (s) => s.nameAr.toLowerCase().includes(query) || (s.nameEn ?? "").toLowerCase().includes(query),
    );
  }, [activeDestination, search]);

  const handlePickDestination = (destination: DeliveryDestination) => {
    if (requiresSubDestination(destination)) {
      setDrillDestination(destination);
      setSearch("");
      return;
    }

    onSelectDestination(destination);
    setSearch("");
    setDrillDestination(null);
  };

  const handlePickSub = (sub: DeliverySubDestination) => {
    if (!activeDestination) return;
    onSelectDestination(activeDestination);
    onSelectSubDestination(sub);
    setDrillDestination(null);
    setSearch("");
  };

  const handleBackToDestinations = () => {
    setDrillDestination(null);
    setSearch("");
  };

  /* ---------------------------------------------------------------------- */
  /* Collapsed / selected state                                             */
  /* ---------------------------------------------------------------------- */

  if (selectedDestination && !isChoosingArea && !drillDestination) {
    const destName = isRtl
      ? selectedDestination.nameAr
      : selectedDestination.nameEn || selectedDestination.nameAr;

    const subName = selectedSubDestination
      ? isRtl
        ? selectedSubDestination.nameAr
        : selectedSubDestination.nameEn || selectedSubDestination.nameAr
      : null;

    const fee = selectedSubDestination ? selectedSubDestination.deliveryFee : selectedDestination.deliveryFee;

    return (
      <div className="w-full flex items-center justify-between gap-2 rounded-xl bg-primary/10 border border-primary/30 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setDrillDestination(selectedDestination)}
          className="flex-1 min-w-0 flex items-center gap-2.5 text-left rtl:text-right"
        >
          <span className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-primary" />
          </span>

          <span className="min-w-0">
            <span className="block text-sm font-bold text-white truncate">
              {subName ? `${destName} — ${subName}` : destName}
            </span>
            <span className="block text-[11px] text-primary font-semibold">
              {fee > 0 ? `+${formatPrice(fee)}` : isRtl ? "توصيل مجاني" : "Free delivery"}
            </span>
          </span>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setDrillDestination(selectedDestination)}
            className="text-[11px] font-semibold text-primary hover:underline px-1.5 py-1"
          >
            {isRtl ? "تغيير" : "Change"}
          </button>

          <button
            type="button"
            onClick={onClear}
            aria-label={isRtl ? "إزالة منطقة التوصيل" : "Remove delivery area"}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Sub-destination drill-down                                             */
  /* ---------------------------------------------------------------------- */

  if (drillDestination) {
    const destName = isRtl
      ? drillDestination.nameAr
      : drillDestination.nameEn || drillDestination.nameAr;

    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleBackToDestinations}
          className="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors"
        >
          {isRtl ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          {isRtl ? "كل المناطق" : "All areas"}
        </button>

        <p className="text-xs text-white/40 px-1">
          {isRtl ? `اختر منطقة فرعية ضمن ${destName}` : `Choose a specific area within ${destName}`}
        </p>

        <div className="relative">
          <Search
            className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "right-3" : "left-3"} w-4 h-4 text-white/30 pointer-events-none`}
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={isRtl ? "ابحث..." : "Search..."}
            className={`w-full h-11 rounded-xl bg-[#292929] border-0 text-white text-sm outline-none placeholder:text-white/25 focus:ring-1 focus:ring-primary/50 transition-all ${isRtl ? "pr-10 pl-3" : "pl-10 pr-3"}`}
          />
        </div>

        {filteredSubDestinations.length === 0 ? (
          <div className="rounded-xl bg-[#242424] px-4 py-3 text-xs text-white/40">
            {isRtl ? "لا توجد نتائج مطابقة." : "No matching areas."}
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto scrollbar-hide pr-0.5">
            {filteredSubDestinations.map((sub) => {
              const isSelected = sub.id === subDestinationId;
              const name = isRtl ? sub.nameAr : sub.nameEn || sub.nameAr;

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handlePickSub(sub)}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-sm border transition-all ${
                    isSelected
                      ? "bg-primary/10 border-primary text-white"
                      : "bg-[#242424] border-transparent text-white/70 hover:bg-[#282828]"
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-primary bg-primary" : "border-white/20"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </span>
                    <span className="font-semibold truncate">{name}</span>
                  </span>

                  <span className={`text-xs font-bold shrink-0 ${isSelected ? "text-primary" : "text-white/40"}`}>
                    {sub.deliveryFee > 0 ? `+${formatPrice(sub.deliveryFee)}` : isRtl ? "مجاني" : "Free"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Destination selection                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "right-3" : "left-3"} w-4 h-4 text-white/30 pointer-events-none`}
        />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={isRtl ? "ابحث عن منطقتك..." : "Search your area..."}
          className={`w-full h-11 rounded-xl bg-[#292929] border-0 text-white text-sm outline-none placeholder:text-white/25 focus:ring-1 focus:ring-primary/50 transition-all ${isRtl ? "pr-10 pl-3" : "pl-10 pr-3"}`}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`dest-loading-${index}`} className="h-12 rounded-xl bg-[#242424] animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-xs text-red-400">
          {isRtl ? "تعذر تحميل مناطق التوصيل." : "Couldn't load delivery areas."}
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="rounded-xl bg-[#242424] px-4 py-3 text-xs text-white/40">
          {destinations.filter((d) => d.isActive).length === 0
            ? isRtl
              ? "لا توجد مناطق توصيل متاحة حالياً."
              : "No delivery areas available right now."
            : isRtl
              ? "لا توجد نتائج مطابقة."
              : "No matching areas."}
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-hide pr-0.5">
          {filteredDestinations.map((destination) => {
            const isSelected = destination.id === destinationId && !requiresSubDestination(destination);
            const name = isRtl ? destination.nameAr : destination.nameEn || destination.nameAr;
            const hasSubs = requiresSubDestination(destination);
            const fee = destination.deliveryFee;

            return (
              <button
                key={destination.id}
                type="button"
                onClick={() => handlePickDestination(destination)}
                className={`w-full flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-sm border transition-all ${
                  isSelected
                    ? "bg-primary/10 border-primary text-white"
                    : "bg-[#242424] border-transparent text-white/70 hover:bg-[#282828]"
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-primary bg-primary" : "border-white/20"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </span>
                  <span className="font-semibold truncate">{name}</span>
                </span>

                {hasSubs ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-white/40 shrink-0">
                    {isRtl ? "اختر منطقة فرعية" : "Choose sub-area"}
                    {isRtl ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </span>
                ) : (
                  <span className={`text-xs font-bold shrink-0 ${isSelected ? "text-primary" : "text-white/40"}`}>
                    {fee > 0 ? `+${formatPrice(fee)}` : isRtl ? "مجاني" : "Free"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {errorMessage && (
        <p className="text-xs font-semibold text-red-400 mt-1.5 px-1">{errorMessage}</p>
      )}
    </div>
  );
}
