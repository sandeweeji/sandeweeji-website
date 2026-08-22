"use client";

import { useMemo, useState } from "react";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  X,
} from "lucide-react";

import { formatPrice } from "@/lib/utils";

import {
  getActiveSubDestinations,
  requiresSubDestination,
} from "@/lib/delivery";

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

  subDestinationErrorMessage?: string;
}

type PickerMode = "destinations" | "subDestinations";

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
  subDestinationErrorMessage,
}: DeliveryAreaPickerProps) {
  const [search, setSearch] = useState("");

  /**
   * Controls which screen the picker is showing.
   *
   * destinations:
   *   Main destination list
   *
   * subDestinations:
   *   Sub-destination list for the selected destination
   */
  const [mode, setMode] = useState<PickerMode>("destinations");

  /**
   * Destination currently being used for sub-destination selection.
   */
  const [drillDestination, setDrillDestination] =
    useState<DeliveryDestination | null>(null);

  /**
   * Currently selected destination.
   */
  const selectedDestination = useMemo(
    () =>
      destinations.find((destination) => destination.id === destinationId) ??
      null,
    [destinations, destinationId],
  );

  /**
   * Currently selected sub-destination.
   */
  const selectedSubDestination = useMemo(() => {
    if (!selectedDestination) return null;

    return (
      getActiveSubDestinations(selectedDestination).find(
        (sub) => sub.id === subDestinationId,
      ) ?? null
    );
  }, [selectedDestination, subDestinationId]);

  /**
   * Whether the currently selected destination still needs
   * a sub-destination.
   */
  const isChoosingArea = Boolean(
    !selectedDestination ||
    (requiresSubDestination(selectedDestination) && !selectedSubDestination),
  );

  /**
   * Active destination used by the sub-destination screen.
   */
  const activeDestination = drillDestination ?? selectedDestination;

  /**
   * ------------------------------------------------------------------
   * Destination filtering
   * ------------------------------------------------------------------
   */
  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();

    const activeDestinations = destinations.filter(
      (destination) => destination.isActive,
    );

    if (!query) {
      return activeDestinations;
    }

    return activeDestinations.filter(
      (destination) =>
        destination.nameAr.toLowerCase().includes(query) ||
        (destination.nameEn ?? "").toLowerCase().includes(query),
    );
  }, [destinations, search]);

  /**
   * ------------------------------------------------------------------
   * Sub-destination filtering
   * ------------------------------------------------------------------
   */
  const filteredSubDestinations = useMemo(() => {
    if (!activeDestination) {
      return [];
    }

    const subs = getActiveSubDestinations(activeDestination);

    const query = search.trim().toLowerCase();

    if (!query) {
      return subs;
    }

    return subs.filter(
      (sub) =>
        sub.nameAr.toLowerCase().includes(query) ||
        (sub.nameEn ?? "").toLowerCase().includes(query),
    );
  }, [activeDestination, search]);

  /**
   * ------------------------------------------------------------------
   * Open destination selection
   * ------------------------------------------------------------------
   */
  const handleChangeDestination = () => {
    setMode("destinations");
    setDrillDestination(null);
    setSearch("");
  };

  /**
   * ------------------------------------------------------------------
   * Open sub-destination selection for the current destination
   * ------------------------------------------------------------------
   */
  const handleChangeSubDestination = () => {
    if (!selectedDestination) {
      handleChangeDestination();
      return;
    }

    if (!requiresSubDestination(selectedDestination)) {
      handleChangeDestination();
      return;
    }

    setDrillDestination(selectedDestination);
    setMode("subDestinations");
    setSearch("");
  };

  /**
   * ------------------------------------------------------------------
   * Destination selected
   * ------------------------------------------------------------------
   */
  const handlePickDestination = (destination: DeliveryDestination) => {
    /**
     * Tell the parent about the destination immediately.
     *
     * The parent will clear the previous sub-destination if
     * the user switched to another destination.
     */
    onSelectDestination(destination);

    setSearch("");

    /**
     * If this destination requires a sub-destination,
     * immediately move the user to the next step.
     */
    if (requiresSubDestination(destination)) {
      setDrillDestination(destination);
      setMode("subDestinations");
      return;
    }

    /**
     * Destination has no sub-destinations.
     * Selection is complete.
     */
    setDrillDestination(null);
    setMode("destinations");
  };

  /**
   * ------------------------------------------------------------------
   * Sub-destination selected
   * ------------------------------------------------------------------
   */
  const handlePickSub = (sub: DeliverySubDestination) => {
    if (!drillDestination) {
      return;
    }

    /**
     * Destination was already selected when entering this screen,
     * but keeping this callback makes the component robust.
     */
    if (drillDestination.id !== destinationId) {
      onSelectDestination(drillDestination);
    }

    onSelectSubDestination(sub);

    /**
     * Selection is now complete.
     */
    setDrillDestination(null);
    setMode("destinations");
    setSearch("");
  };

  /**
   * ------------------------------------------------------------------
   * Back to destination list
   * ------------------------------------------------------------------
   */
  const handleBackToDestinations = () => {
    setDrillDestination(null);
    setMode("destinations");
    setSearch("");
  };

  /**
   * ------------------------------------------------------------------
   * Selected / collapsed state
   *
   * We only show this when the destination selection is complete.
   * ------------------------------------------------------------------
   */
  if (selectedDestination && !isChoosingArea && mode !== "subDestinations") {
    const destName = isRtl
      ? selectedDestination.nameAr
      : selectedDestination.nameEn || selectedDestination.nameAr;

    const subName = selectedSubDestination
      ? isRtl
        ? selectedSubDestination.nameAr
        : selectedSubDestination.nameEn || selectedSubDestination.nameAr
      : null;

    const fee = selectedSubDestination
      ? selectedSubDestination.deliveryFee
      : selectedDestination.deliveryFee;

    return (
      <div className="w-full rounded-xl bg-primary/10 border border-primary/30 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Selected location */}
          <button
            type="button"
            onClick={
              requiresSubDestination(selectedDestination)
                ? handleChangeSubDestination
                : handleChangeDestination
            }
            className="flex-1 min-w-0 flex items-center gap-2.5 text-left rtl:text-right rounded-lg hover:bg-primary/5 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-bold text-white truncate">
                {subName ? `${destName} — ${subName}` : destName}
              </span>

              <span className="block text-[11px] text-primary font-semibold">
                {Number(fee) > 0
                  ? `+${formatPrice(Number(fee))}`
                  : isRtl
                    ? "توصيل مجاني"
                    : "Free delivery"}
              </span>
            </span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Change destination */}
            {/* <button
              type="button"
              onClick={handleChangeDestination}
              className="text-[11px] font-semibold text-primary hover:bg-primary/10 rounded-lg px-2 py-1.5 transition-colors"
            >
              {isRtl ? "تغيير المنطقة" : "Change area"}
            </button> */}

            {/* Remove */}
            <button
              type="button"
              onClick={onClear}
              aria-label={
                isRtl ? "إزالة منطقة التوصيل" : "Remove delivery area"
              }
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* If this destination has sub-destinations, offer a direct way to change them */}
        {requiresSubDestination(selectedDestination) && (
          <button
            type="button"
            onClick={handleChangeSubDestination}
            className="mt-2 w-full flex items-center justify-between rounded-lg bg-white/[0.03] hover:bg-white/[0.06] px-2.5 py-2 transition-colors"
          >
            <span className="text-[11px] font-semibold text-white/45">
              {isRtl ? "تغيير المنطقة الفرعية" : "Change sub-area"}
            </span>

            {isRtl ? (
              <ChevronLeft className="w-3.5 h-3.5 text-white/30" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            )}
          </button>
        )}
      </div>
    );
  }

  /**
   * ------------------------------------------------------------------
   * Sub-destination selection
   * ------------------------------------------------------------------
   */
  if (mode === "subDestinations" && drillDestination) {
    const destName = isRtl
      ? drillDestination.nameAr
      : drillDestination.nameEn || drillDestination.nameAr;

    return (
      <div className="space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleBackToDestinations}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors"
          >
            {isRtl ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}

            {isRtl ? "كل المناطق" : "All areas"}
          </button>

          {/* Change destination directly */}
          <button
            type="button"
            onClick={handleChangeDestination}
            className="text-[11px] font-semibold text-primary hover:bg-primary/10 rounded-lg px-2 py-1.5 transition-colors"
          >
            {isRtl ? "تغيير المنطقة" : "Change area"}
          </button>
        </div>

        {/* Current destination */}
        <div className="rounded-xl bg-primary/10 border border-primary/20 px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </span>

            <div className="min-w-0">
              <p className="text-[10px] text-white/40">
                {isRtl ? "المنطقة الحالية" : "Current area"}
              </p>

              <p className="text-sm font-bold text-white truncate">
                {destName}
              </p>
            </div>
          </div>
        </div>

        {/* Instruction */}
        <p className="text-xs text-white/50 px-1">
          {isRtl
            ? `اختر المنطقة الفرعية ضمن ${destName}`
            : `Choose a specific area within ${destName}`}
        </p>

        {/* Validation error */}
        {subDestinationErrorMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-red-400/10 border border-red-400/20 px-3 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />

            <p className="text-xs font-semibold text-red-400">
              {subDestinationErrorMessage}
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search
            className={`absolute top-1/2 -translate-y-1/2 ${
              isRtl ? "right-3" : "left-3"
            } w-4 h-4 text-white/30 pointer-events-none`}
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              isRtl ? "ابحث عن المنطقة الفرعية..." : "Search sub-area..."
            }
            className={`w-full h-11 rounded-xl bg-[#292929] border-0 text-white text-sm outline-none placeholder:text-white/25 focus:ring-1 focus:ring-primary/50 transition-all ${
              isRtl ? "pr-10 pl-3" : "pl-10 pr-3"
            }`}
          />
        </div>

        {/* Sub-destination list */}
        {filteredSubDestinations.length === 0 ? (
          <div className="rounded-xl bg-[#242424] px-4 py-3 text-xs text-white/40">
            {isRtl ? "لا توجد مناطق فرعية مطابقة." : "No matching sub-areas."}
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
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-white/20"
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </span>

                    <span className="font-semibold truncate">{name}</span>
                  </span>

                  <span
                    className={`text-xs font-bold shrink-0 ${
                      isSelected ? "text-primary" : "text-white/40"
                    }`}
                  >
                    {Number(sub.deliveryFee) > 0
                      ? `+${formatPrice(Number(sub.deliveryFee))}`
                      : isRtl
                        ? "مجاني"
                        : "Free"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /**
   * ------------------------------------------------------------------
   * Destination selection
   * ------------------------------------------------------------------
   */
  return (
    <div className="space-y-2.5">
      {/* Header when changing destination */}
      {selectedDestination && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-primary shrink-0" />

            <div className="min-w-0">
              <p className="text-[10px] text-white/40">
                {isRtl ? "تغيير المنطقة" : "Change delivery area"}
              </p>

              <p className="text-xs font-bold text-white truncate">
                {isRtl
                  ? selectedDestination.nameAr
                  : selectedDestination.nameEn || selectedDestination.nameAr}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBackToDestinations}
            className="text-[11px] text-white/40 hover:text-white px-2 py-1"
          >
            {isRtl ? "إلغاء" : "Cancel"}
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          className={`absolute top-1/2 -translate-y-1/2 ${
            isRtl ? "right-3" : "left-3"
          } w-4 h-4 text-white/30 pointer-events-none`}
        />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={isRtl ? "ابحث عن منطقتك..." : "Search your area..."}
          className={`w-full h-11 rounded-xl bg-[#292929] border-0 text-white text-sm outline-none placeholder:text-white/25 focus:ring-1 focus:ring-primary/50 transition-all ${
            isRtl ? "pr-10 pl-3" : "pl-10 pr-3"
          }`}
        />
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={`dest-loading-${index}`}
              className="h-12 rounded-xl bg-[#242424] animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-xs text-red-400">
          {isRtl
            ? "تعذر تحميل مناطق التوصيل."
            : "Couldn't load delivery areas."}
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="rounded-xl bg-[#242424] px-4 py-3 text-xs text-white/40">
          {destinations.filter((destination) => destination.isActive).length ===
          0
            ? isRtl
              ? "لا توجد مناطق توصيل متاحة حالياً."
              : "No delivery areas available right now."
            : isRtl
              ? "لا توجد نتائج مطابقة."
              : "No matching areas."}
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[240px] overflow-y-auto scrollbar-hide pr-0.5">
          {filteredDestinations.map((destination) => {
            const hasSubs = requiresSubDestination(destination);

            const isSelected = destination.id === destinationId;

            const name = isRtl
              ? destination.nameAr
              : destination.nameEn || destination.nameAr;

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
                {/* Destination name */}
                <span className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-white/20"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </span>

                  <span className="font-semibold truncate">{name}</span>
                </span>

                {/* Destination info */}
                {hasSubs ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-white/40 shrink-0">
                    {isRtl ? "اختر منطقة فرعية" : "Choose sub-area"}

                    {isRtl ? (
                      <ChevronLeft className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </span>
                ) : (
                  <span
                    className={`text-xs font-bold shrink-0 ${
                      isSelected ? "text-primary" : "text-white/40"
                    }`}
                  >
                    {Number(fee) > 0
                      ? `+${formatPrice(Number(fee))}`
                      : isRtl
                        ? "مجاني"
                        : "Free"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main validation error */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-red-400/10 border border-red-400/20 px-3 py-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />

          <p className="text-xs font-semibold text-red-400">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
