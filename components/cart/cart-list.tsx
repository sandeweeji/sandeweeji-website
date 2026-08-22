"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { CartItemRow } from "@/components/cart/cart-item-row";
import type { CartItem } from "@/lib/types";

interface CartListProps {
  items: CartItem[];
  locale: string;
  isRtl: boolean;
  onBrowseMenu: () => void;
}

export function CartList({ items, locale, isRtl, onBrowseMenu }: CartListProps) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-full gap-4 py-16 text-center"
      >
        <div className="w-24 h-24 rounded-[28px] bg-[#242424] flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-white/15" />
        </div>

        <div>
          <p className="text-base font-extrabold text-white">{t("cartEmpty", locale)}</p>
          <p className="text-sm text-white/35 mt-1 max-w-xs">{t("cartEmptyDesc", locale)}</p>
        </div>

        <Button
          type="button"
          onClick={onBrowseMenu}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 h-11 font-bold"
        >
          {t("browseMenu", locale)}
          <ArrowRight className={`w-4 h-4 ${isRtl ? "mr-2 rotate-180" : "ml-2"}`} />
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      {items.map((item) => (
        <CartItemRow key={item.id} item={item} />
      ))}
    </AnimatePresence>
  );
}
