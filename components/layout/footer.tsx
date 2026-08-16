"use client";

import { motion } from "framer-motion";
import { useLocaleStore } from "@/lib/locale-store";
import { RESTAURANT_SETTINGS } from "@/lib/data";
import whatsapp from "@/public/whatsapp.png";
import linkedin from "@/public/linkedin.png";
import Image from "next/image";

export default function Footer() {
  const { locale } = useLocaleStore();
  const isRtl = locale === "ar";

  const waSuffix = encodeURIComponent(
    `Hello! 👋\n\nI'd like to get in touch with the developer.`,
  );

  const waUrl = `https://wa.me/0096170860161`;

  const linkedinUrl = "https://www.linkedin.com/in/youssef-mariam-7a3b4a249";

  return (
    <footer
      className="bg-[oklch(0.08_0.008_45)] border-t border-white/5"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-muted-foreground">
          <span>{isRtl ? "تم تطوير هذا الموقع بواسطة" : "Developed by"}</span>

          <span className="font-semibold text-foreground">Youssef Mariam</span>

          <div className="flex items-center gap-2">
            <motion.a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg bg-surface border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
            >
              <Image
                src={linkedin}
                alt="LinkedIn"
                className="w-5 h-5 sm:w-6 sm:h-6 shrink-0"
              />{" "}
            </motion.a>

            <motion.a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg bg-surface border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
            >
              <Image
                src={whatsapp}
                alt="WhatsApp"
                className="w-5 h-5 sm:w-6 sm:h-6 shrink-0"
              />{" "}
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}
