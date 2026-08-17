"use client";

import HeroSection from "@/components/landing/hero-section";
import FeaturedSection from "@/components/landing/featured-section";
import ReviewsSection from "@/components/landing/reviews-section";
import ScrollToTop from "@/components/ui/scroll-to-top";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedSection />
      <ReviewsSection />
      {/* <CtaSection /> */}

      <ScrollToTop />
    </main>
  );
}
