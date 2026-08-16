"use client";

import { motion } from "framer-motion";
import { useLocaleStore } from "@/lib/locale-store";
import { MapPin } from "lucide-react";
import whatsapp from "@/public/whatsapp.png";
import linkedin from "@/public/linkedin.png";
import instagram from "@/public/instagram.png";
import facebook from "@/public/facebook.png";
import Image from "next/image";
import { INSTAGRAM_URL, FACEBOOK_URL, waUrl, mapsUrl } from "@/lib/data";

export default function Footer() {
  const { locale } = useLocaleStore();
  const isRtl = locale === "ar";

  // Developer WhatsApp
  const developerWaUrl = "https://wa.me/96170860161";

  // Developer LinkedIn
  const linkedinUrl = "https://www.linkedin.com/in/youssef-mariam-7a3b4a249";

  // Restaurant WhatsApp
  const restaurantWaUrl = waUrl;

  // Restaurant social media
  const instagramUrl = INSTAGRAM_URL;
  const facebookUrl = FACEBOOK_URL;

  return (
    <footer
      className="relative bg-[oklch(0.08_0.008_45)] border-t border-white/10 overflow-hidden"
      dir="ltr"
    >
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-24 bg-primary/10 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-4">
          {/* =========================
              DEVELOPER
          ========================== */}
          <div
            className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-2 text-sm text-muted-foreground"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <span>{isRtl ? "تم تطوير هذا الموقع بواسطة" : "Developed by"}</span>

            <span className="font-bold text-foreground">Youssef Mariam</span>

            <div className="flex items-center gap-2 sm:ml-1">
              {/* Developer LinkedIn */}
              <motion.a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                whileHover={{
                  scale: 1.08,
                  y: -2,
                }}
                whileTap={{ scale: 0.94 }}
                className="
                  w-8 h-8
                  rounded-lg
                  bg-white/[0.04]
                  border border-white/10
                  flex items-center justify-center
                  hover:bg-white/[0.08]
                  hover:border-primary/30
                  transition-all duration-200
                "
              >
                <Image
                  src={linkedin}
                  alt="LinkedIn"
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                />
              </motion.a>

              {/* Developer WhatsApp */}
              <motion.a
                href={developerWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Developer WhatsApp"
                whileHover={{
                  scale: 1.08,
                  y: -2,
                }}
                whileTap={{ scale: 0.94 }}
                className="
                  w-8 h-8
                  rounded-lg
                  bg-white/[0.04]
                  border border-white/10
                  flex items-center justify-center
                  hover:bg-white/[0.08]
                  hover:border-primary/30
                  transition-all duration-200
                "
              >
                <Image
                  src={whatsapp}
                  alt="WhatsApp"
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                />
              </motion.a>
            </div>
          </div>

          {/* =========================
              RESTAURANT SOCIALS
          ========================== */}
          <div
            className="flex items-center gap-2"
            dir="ltr"
            aria-label="Restaurant social media"
          >
            {/* Location */}
            <motion.a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Restaurant Location"
              whileHover={{
                scale: 1.08,
                y: -2,
              }}
              whileTap={{ scale: 0.94 }}
              className="
                w-9 h-9
                rounded-lg
                bg-white/[0.04]
                border border-white/10
                flex items-center justify-center
                text-muted-foreground
                hover:text-primary
                hover:bg-primary/5
                hover:border-primary/30
                transition-all duration-200
              "
            >
              <MapPin className="w-[18px] h-[18px]" />
            </motion.a>

            {/* Restaurant WhatsApp */}
            <motion.a
              href={restaurantWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Restaurant WhatsApp"
              whileHover={{
                scale: 1.08,
                y: -2,
              }}
              whileTap={{ scale: 0.94 }}
              className="
                w-9 h-9
                rounded-lg
                bg-white/[0.04]
                border border-white/10
                flex items-center justify-center
                hover:bg-white/[0.08]
                hover:border-primary/30
                transition-all duration-200
              "
            >
              <Image
                src={whatsapp}
                alt="WhatsApp"
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
            </motion.a>

            {/* Facebook */}
            <motion.a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              whileHover={{
                scale: 1.08,
                y: -2,
              }}
              whileTap={{ scale: 0.94 }}
              className="
                w-9 h-9
                rounded-lg
                bg-white/[0.04]
                border border-white/10
                flex items-center justify-center
                text-muted-foreground
                hover:text-primary
                hover:bg-primary/5
                hover:border-primary/30
                transition-all duration-200
              "
            >
              <Image
                src={facebook}
                alt="Facebook"
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
            </motion.a>

            {/* Instagram */}
            <motion.a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              whileHover={{
                scale: 1.08,
                y: -2,
              }}
              whileTap={{ scale: 0.94 }}
              className="
                w-9 h-9
                rounded-lg
                bg-white/[0.04]
                border border-white/10
                flex items-center justify-center
                text-muted-foreground
                hover:text-primary
                hover:bg-primary/5
                hover:border-primary/30
                transition-all duration-200
              "
            >
              <Image
                src={instagram}
                alt="Instagram"
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
            </motion.a>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </footer>
  );
}
