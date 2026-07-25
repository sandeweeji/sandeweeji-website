"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, Globe, User, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Badge } from '@/components/ui/badge'
import { useCartStore } from "@/lib/cart-store";
import { useLocaleStore } from "@/lib/locale-store";
import { t } from "@/lib/i18n";
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
  const { locale, toggleLocale } = useLocaleStore();
  const isRtl = locale === "ar";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "glass-strong border-b border-white/5 shadow-2xl"
            : "bg-transparent",
        )}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group flex-shrink-0"
            >
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg glow-brand-sm"
              >
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-lg text-foreground tracking-tight">
                  Sandweeji
                </span>
                <span
                  className="text-xs text-primary font-medium tracking-widest"
                  style={{ fontFamily: "serif" }}
                >
                  ساندويجي
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const label = isRtl ? link.keyAr : link.keyEn;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                      isActive
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground hover:bg-white/5",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={toggleLocale}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{locale === "en" ? "AR" : "EN"}</span>
              </motion.button>

              {/* Profile 
              <Link href="/profile">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  className="hidden sm:flex p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <User className="w-5 h-5" />
                </motion.button>
              </Link> */}

              {/* Cart */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={toggleCart}
                className="relative p-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors glow-brand-sm"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-destructive text-white text-xs font-bold"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 glass-strong border-l border-white/5 lg:hidden flex flex-col"
              dir={isRtl ? "rtl" : "ltr"}
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">
                    Sandweeji
                  </span>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-foreground/60"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <nav className="flex-1 p-6 flex flex-col gap-2">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  const label = isRtl ? link.keyAr : link.keyEn;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "px-4 py-3 rounded-xl text-base font-medium transition-colors",
                        isActive
                          ? "bg-primary/15 text-primary border border-primary/20"
                          : "text-foreground/70 hover:text-foreground hover:bg-white/5",
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-6 border-t border-white/10 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLocale}
                  className="flex-1 border-white/10 text-foreground/70"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {locale === "en" ? "عربي" : "English"}
                </Button>
                {/* <Link href="/profile" className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-white/10 text-foreground/70"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {t("profile", locale)}
                  </Button>
                </Link> */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
