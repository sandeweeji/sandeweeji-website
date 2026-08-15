"use client";
import HeroSection from "@/components/landing/hero-section";
import FeaturedSection from "@/components/landing/featured-section";
import ReviewsSection from "@/components/landing/reviews-section";
import CtaSection from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedSection />
      <ReviewsSection />
      {/* <CtaSection /> */}
    </main>
  );
}
