"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Share2,
  ExternalLink,
  Phone,
  MapPin,
  Clock,
  ChefHat,
  MessageCircle,
} from "lucide-react";
import { useLocaleStore } from "@/lib/locale-store";
import { t } from "@/lib/i18n";
import { RESTAURANT_SETTINGS } from "@/lib/data";

export default function Footer() {
  const { locale } = useLocaleStore();
  const isRtl = locale === "ar";
  const waSuffix = encodeURIComponent(
    `Hello Sandweeji! 👋\n\nI'd like to place an order.`,
  );
  const waUrl = `https://wa.me/${RESTAURANT_SETTINGS.whatsappNumber.replace(/\+/g, "")}?text=${waSuffix}`;

  return (
    <footer
      className="bg-[oklch(0.08_0.008_45)] border-t border-white/5"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold text-foreground">Sandweeji</p>
                <p
                  className="text-xs text-primary"
                  style={{ fontFamily: "serif" }}
                >
                  ساندويجي
                </p>
              </div>
            </div>
            {/* <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {isRtl
                ? "أفضل برغر وشاورما ودجاج مقرمش في طرابلس. طعام الشارع بتجربة فاخرة."
                : "Best burgers, shawarma & crispy chicken in Tripoli. Street food with a premium experience."}
            </p> */}
            <div className="flex gap-3">
              {[
                {
                  icon: Share2,
                  href: RESTAURANT_SETTINGS.instagramUrl,
                  label: "Instagram",
                },
                {
                  icon: ExternalLink,
                  href: RESTAURANT_SETTINGS.facebookUrl,
                  label: "Facebook",
                },
                { icon: MessageCircle, href: waUrl, label: "WhatsApp" },
              ].map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-lg bg-surface border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              {isRtl ? "روابط سريعة" : "Quick Links"}
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/menu", label: isRtl ? "القائمة" : "Menu" },
                { href: "/about", label: isRtl ? "من نحن" : "About Us" },
                { href: "/contact", label: isRtl ? "اتصل بنا" : "Contact" },
                //     { href: '/profile', label: isRtl ? 'حسابي' : 'My Account' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              {t("getInTouch", locale)}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${RESTAURANT_SETTINGS.phone}`}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary/60 group-hover:text-primary" />
                  {RESTAURANT_SETTINGS.phone}
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary/60" />
                  <span>
                    {isRtl
                      ? RESTAURANT_SETTINGS.addressAr
                      : RESTAURANT_SETTINGS.addressEn}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              {t("openingHours", locale)}
            </h3>
            <ul className="space-y-2">
              {RESTAURANT_SETTINGS.openingHours.slice(0, 4).map((hour) => (
                <li
                  key={hour.day}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-muted-foreground">
                    {isRtl ? hour.dayAr : hour.day.slice(0, 3)}
                  </span>
                  <span
                    className={
                      hour.closed ? "text-destructive" : "text-foreground"
                    }
                  >
                    {hour.closed
                      ? t("closed", locale)
                      : `${hour.openTime} – ${hour.closeTime}`}
                  </span>
                </li>
              ))}
              <li className="text-xs text-muted-foreground pt-1">
                {isRtl
                  ? "الخميس–السبت حتى الساعة 1 صباحاً"
                  : "Thu–Sat open until 1 AM"}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Sandweeji. {t("rights", locale)}
          </p>
          <p>{t("madeWith", locale)}</p>
        </div>
      </div>
    </footer>
  );
}
