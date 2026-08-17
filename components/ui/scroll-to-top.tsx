"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.75, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.75, y: 20 }}
          transition={{
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{
            scale: 1.08,
            y: -2,
          }}
          whileTap={{
            scale: 0.92,
          }}
          className="
            group
            fixed
            bottom-6
            right-5
            z-50
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            border
            border-amber-600
            bg-black/80
            text-white
            shadow-[0_8px_30px_rgba(0,0,0,0.3)]
            backdrop-blur-xl
            transition-colors
            duration-200
            hover:border-red-500/40
            hover:bg-red-600
            sm:bottom-8
            sm:right-8
          "
        >
          <ArrowUp
            className="
              h-5
              w-5
              transition-transform
              duration-200
              group-hover:-translate-y-0.5
            "
            strokeWidth={2.2}
          />

          {/* Red accent */}
          <span
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-full
              ring-1
              ring-inset
              ring-white/5
              group-hover:ring-red-400/30
            "
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
