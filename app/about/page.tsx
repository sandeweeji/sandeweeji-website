"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Leaf,
  Zap,
  Star,
  ChefHat,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { useLocaleStore } from "@/lib/locale-store";
import { t } from "@/lib/i18n";
import { RESTAURANT_SETTINGS } from "@/lib/data";
import whatsapp from "@/public/whatsapp.png";

const PILLARS = [
  {
    icon: Leaf,
    titleKey: "freshDaily",
    descKey: "freshDailyDesc",
    emoji: "🌿",
  },
  {
    icon: Zap,
    titleKey: "fastDelivery",
    descKey: "fastDeliveryDesc",
    emoji: "⚡",
  },
  {
    icon: Star,
    titleKey: "qualityFirst",
    descKey: "qualityFirstDesc",
    emoji: "⭐",
  },
  { icon: ChefHat, titleKey: "ourStory", descKey: "ourStory", emoji: "👨‍🍳" },
] as const;

export default function AboutPage() {
  const { locale } = useLocaleStore();
  const isRtl = locale === "ar";
  const phone = RESTAURANT_SETTINGS.whatsappNumber.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent("Hello Sandweeji! 👋")}`;

  return (
    <main className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* Hero */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, oklch(0.75 0.18 52 / 0.3) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 md:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/25 text-primary text-sm font-semibold"
          >
            <ChefHat className="w-4 h-4" />
            {isRtl ? "من نحن" : "About Us"}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground text-balance"
          >
            {isRtl ? "قصة ساندويجي" : "The Sandweeji Story"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {isRtl
              ? "ولدنا في أبي سمرا، طرابلس، من شغف حقيقي بالطعام الجيد. هدفنا بسيط: تقديم أفضل برغر وشاورما في لبنان."
              : "Born in Abi Samra, Tripoli, from a real passion for great food. Our goal is simple: serve the best burgers and shawarma in Lebanon."}
          </motion.p>
        </div>
      </section>

      {/* Food image */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative h-52 sm:h-72 md:h-96 rounded-2xl sm:rounded-3xl overflow-hidden"
        >
          <Image
            src="/images/classic-burger.png"
            alt="Sandweeji food"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 960px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8">
            <span className="text-2xl sm:text-4xl font-extrabold text-white text-shadow">
              {isRtl ? "ساندويجي | طرابلس" : "Sandweeji | Tripoli"}
            </span>
          </div>
        </motion.div>
      </section>

      {/* Story */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 md:space-y-5"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              {t("ourStory", locale)}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
              {isRtl
                ? "في ساندويجي، نؤمن بأن التميّز لا يُصنع بالصدفة، بل يُبنى على الجودة، والدقة، والشغف بالتفاصيل. بدأت رحلتنا برؤية واضحة: أن نقدّم تجربة طعام استثنائية، تجمع بين النكهة الأصيلة، والمكونات المختارة بعناية، والمعايير التي تليق بضيوفنا."
                : "Sandweeji started with a simple dream: serve authentic food with premium standards. In the heart of Tripoli, we created a place that blends authentic flavor with a modern experience."}
            </p>
            <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
              {isRtl
                ? "نحن لا نقدّم الطعام فحسب، بل نصنع تجربة متكاملة؛ تبدأ من جودة المكونات، وتمرّ بطريقة التحضير والتقديم، وتنتهي بطعمٍ يبقى في الذاكرة. نضع ثقة ضيوفنا في مقدمة أولوياتنا، ولذلك نحرص على أن يكون كل طبق يحمل اسم ساندويجي انعكاسًا لمعاييرنا وشغفنا بما نقدّمه. ساندويجي — شغفٌ بالتفاصيل، وثقةٌ تُبنى مع كل لقمة."
                : "Every ingredient is carefully chosen, every recipe crafted with passion, every order prepared with love. This is not just food — it's an experience that brings you back again and again."}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-60 sm:h-72 md:h-full min-h-[260px] rounded-2xl sm:rounded-3xl overflow-hidden"
          >
            <Image
              src="/images/shawarma-wrap.png"
              alt="Sandweeji shawarma"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-[oklch(0.08_0.008_45)] py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold text-foreground text-center mb-8 md:mb-12"
          >
            {t("whyUs", locale)}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Leaf,
                title: t("freshDaily", locale),
                desc: t("freshDailyDesc", locale),
                emoji: "🌿",
              },
              {
                icon: Zap,
                title: t("fastDelivery", locale),
                desc: t("fastDeliveryDesc", locale),
                emoji: "⚡",
              },
              {
                icon: Star,
                title: t("qualityFirst", locale),
                desc: t("qualityFirstDesc", locale),
                emoji: "⭐",
              },
            ].map(({ icon: Icon, title, desc, emoji }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-white/5 rounded-2xl p-5 sm:p-7 space-y-3 sm:space-y-4 hover:border-primary/20 transition-colors text-center"
              >
                <div className="text-3xl sm:text-4xl">{emoji}</div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4 sm:space-y-6"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            {isRtl ? "جرب الفرق بنفسك" : "Experience the Difference"}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isRtl
              ? "اطلب الآن وتذوق ما يجعل ساندويجي مميزاً"
              : "Order now and taste what makes Sandweeji special"}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link href="/menu" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-primary text-primary-foreground font-bold glow-brand"
              >
                {t("viewMenu", locale)}
                <ArrowRight
                  className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
                />
              </motion.button>
            </Link>
            <motion.a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] font-bold"
            >
              <Image src={whatsapp} alt="WhatsApp" className="w-6 h-6" />
              {t("orderWhatsApp", locale)}
            </motion.a>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
