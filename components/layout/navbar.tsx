"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, ChefHat } from "lucide-react";

import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", keyEn: "Home", keyAr: "الرئيسية" },
  { href: "/menu", keyEn: "Menu", keyAr: "القائمة" },
  { href: "/about", keyEn: "About", keyAr: "من نحن" },
  { href: "/contact", keyEn: "Contact", keyAr: "اتصل بنا" },
];

export default function Navbar() {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 20);
    };

    handler();

    window.addEventListener("scroll", handler, { passive: true });

    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* =========================
          NAVBAR
      ========================== */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={cn(
          "fixed top-0 inset-x-0 z-50",
          "transition-all duration-300",
          "border-b",
          scrolled
            ? [
                "bg-background/85",
                "backdrop-blur-xl",
                "border-primary/20",
                "shadow-[0_10px_35px_rgba(0,0,0,0.18)]",
              ]
            : ["bg-background/55", "backdrop-blur-md", "border-white/10"],
        )}
        dir="rtl"
      >
        {/* Bottom gradient accent */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-[1px]",
            "bg-gradient-to-r",
            "from-transparent",
            "via-primary/70",
            "to-transparent",
            "transition-opacity duration-300",
            scrolled ? "opacity-100" : "opacity-50",
          )}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* =========================
                LOGO
            ========================== */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group flex-shrink-0"
            >
              <motion.div
                whileHover={{
                  rotate: 8,
                  scale: 1.04,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
                className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg"
              >
                {/* Restaurant gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-500 to-red-600" />

                <ChefHat className="relative z-10 w-5 h-5 text-white" />

                {/* Shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
              </motion.div>

              <div className="flex flex-col leading-none">
                <span className="font-bold text-lg lg:text-xl text-foreground tracking-tight">
                  ساندويجي
                </span>

                <span className="text-[9px] lg:text-[10px] text-primary/80 font-medium tracking-[0.2em] mt-1">
                  SANDWEEJI
                </span>
              </div>
            </Link>

            {/* =========================
                DESKTOP NAVIGATION
            ========================== */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2.5",
                      "text-sm",
                      "transition-colors duration-200",
                      isActive
                        ? "text-primary font-bold"
                        : "text-foreground/65 hover:text-foreground font-bold",
                    )}
                  >
                    <span className="relative z-10">{link.keyAr}</span>

                    {/* Active underline */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 font-bold"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* =========================
                ACTIONS
            ========================== */}
            <div className="flex items-center gap-2">
              {/* =========================
                  CART
              ========================== */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleCart}
                aria-label="فتح السلة"
                className={cn(
                  "relative",
                  "w-10 h-10 lg:w-11 lg:h-11",
                  "rounded-xl",
                  "flex items-center justify-center",
                  "overflow-visible",
                  "shadow-lg",
                  "transition-all duration-300",
                  "hover:shadow-primary/30",
                  "group",
                )}
              >
                {/* Cart gradient */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-orange-500 to-red-600" />

                {/* Inner highlight */}
                <div className="absolute inset-[1px] rounded-[11px] bg-gradient-to-br from-white/15 via-transparent to-black/10" />

                <ShoppingCart className="relative z-10 w-5 h-5 text-white transition-transform duration-300 group-hover:-rotate-3" />

                {/* Cart badge */}
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="badge"
                      initial={{
                        scale: 0,
                        opacity: 0,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      exit={{
                        scale: 0,
                        opacity: 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                      }}
                      className={cn(
                        "absolute",
                        "-top-2",
                        "-right-2",
                        "min-w-[20px]",
                        "h-5",
                        "px-1",
                        "flex items-center justify-center",
                        "rounded-full",
                        "bg-red-600",
                        "border-2 border-background",
                        "text-white",
                        "text-[10px]",
                        "font-bold",
                        "shadow-md",
                      )}
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* =========================
                  MOBILE MENU BUTTON
                  Only exists when drawer
                  is CLOSED.
              ========================== */}
              <AnimatePresence mode="wait" initial={false}>
                {!mobileOpen && (
                  <motion.button
                    key="menu-button"
                    initial={{
                      opacity: 0,
                      scale: 0.85,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.85,
                    }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setMobileOpen(true)}
                    aria-label="فتح القائمة"
                    aria-expanded={false}
                    className={cn(
                      "lg:hidden",
                      "w-10 h-10",
                      "rounded-xl",
                      "flex items-center justify-center",
                      "text-foreground/70",
                      "hover:text-foreground",
                      "hover:bg-white/5",
                      "transition-colors",
                    )}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* =========================
          MOBILE DRAWER
      ========================== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{
                x: "100%",
                opacity: 0.8,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: "100%",
                opacity: 0.8,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 35,
              }}
              className={cn(
                "fixed",
                "right-0",
                "top-0",
                "bottom-0",
                "z-50",
                "w-[86vw]",
                "max-w-[360px]",
                "bg-[#111111]",
                "border-l border-white/10",
                "shadow-[-12px_0_40px_rgba(0,0,0,0.35)]",
                "lg:hidden",
                "flex flex-col",
                "overflow-hidden",
              )}
              dir="rtl"
            >
              {/* =========================
                  DRAWER HEADER
              ========================== */}
              <div className="relative p-5 border-b border-white/10 shrink-0">
                {/* Header bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                <div className="flex items-center justify-between">
                  {/* Logo */}
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-500 to-red-600" />

                      <ChefHat className="relative z-10 w-5 h-5 text-white" />
                    </div>

                    <div className="flex flex-col leading-none">
                      <span className="text-lg font-bold text-white">
                        ساندويجي
                      </span>

                      <span className="text-[9px] tracking-[0.2em] text-primary mt-1">
                        SANDWEEJI
                      </span>
                    </div>
                  </Link>

                  {/* ONLY MOBILE CLOSE BUTTON */}
                  <button
                    onClick={() => setMobileOpen(false)}
                    aria-label="إغلاق القائمة"
                    className={cn(
                      "w-10 h-10",
                      "rounded-xl",
                      "flex items-center justify-center",
                      "text-white/60",
                      "hover:text-white",
                      "hover:bg-white/10",
                      "transition-colors",
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* =========================
                  MOBILE NAV
              ========================== */}
              <nav className="flex-1 p-5 flex flex-col gap-2 overflow-y-auto">
                {NAV_LINKS.map((link, index) => {
                  const isActive = pathname === link.href;

                  return (
                    <motion.div
                      key={link.href}
                      initial={{
                        x: 20,
                        opacity: 0,
                      }}
                      animate={{
                        x: 0,
                        opacity: 1,
                      }}
                      transition={{
                        delay: index * 0.05,
                      }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "relative",
                          "flex items-center",
                          "px-4 py-3.5",
                          "rounded-xl",
                          "text-base",
                          "transition-all duration-200",
                          isActive
                            ? "text-primary bg-primary/10 font-bold"
                            : "text-white/70 font-medium hover:text-white hover:bg-white/5",
                        )}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <span className="absolute right-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-primary to-orange-500" />
                        )}

                        <span>{link.keyAr}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* =========================
                  MOBILE CART BUTTON
              ========================== */}
              <div className="relative p-5 border-t border-white/10 shrink-0">
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    toggleCart();
                  }}
                  className={cn(
                    "relative",
                    "w-full",
                    "h-12",
                    "rounded-xl",
                    "overflow-hidden",
                    "flex items-center justify-center",
                    "gap-2",
                    "text-white",
                    "font-bold",
                    "shadow-lg",
                    "hover:shadow-primary/30",
                    "transition-shadow",
                  )}
                >
                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-orange-500 to-red-600" />

                  {/* Highlight */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-transparent" />

                  <ShoppingCart className="relative z-10 w-5 h-5" />

                  <span className="relative z-10">السلة</span>

                  {totalItems > 0 && (
                    <span className="relative z-10 min-w-5 h-5 px-1 rounded-full bg-white/20 text-xs flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
