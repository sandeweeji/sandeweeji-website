import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CartDrawer from "@/components/cart/cart-drawer";
import LocaleHtmlWrapper from "@/components/layout/locale-html-wrapper";
import QueryProvider from "@/components/providers/query-provider";

// Keep your existing Google font
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

// FIX: Changed '@/' to relative './' paths
const cairo = localFont({
  src: [
    { path: "./fonts/Cairo-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Cairo-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-cairo",
  display: "swap",
});

// FIX: Changed '@/' to relative './' paths
// const tajawal = localFont({
//   src: [
//     { path: "./fonts/Tajawal-Regular.ttf", weight: "400", style: "normal" },
//     { path: "./fonts/Tajawal-Bold.ttf", weight: "700", style: "normal" },
//   ],
//   variable: "--font-tajawal",
//   display: "swap",
// });

// FIX: Changed '@/' to relative './' paths
// const inter = localFont({
//   src: "./fonts/Inter-Variable.ttf",
//   variable: "--font-inter",
//   display: "swap",
// });

export const metadata: Metadata = {
  title: "Sandweeji | Best Burgers & Shawarma in Tripoli, Lebanon",
  description:
    "Sandweeji — premium street food in Tripoli. Handcrafted burgers, shawarma, crispy chicken & more. Order via WhatsApp in under 30 seconds.",
  keywords: [
    "sandweeji",
    "burger",
    "shawarma",
    "tripoli",
    "lebanon",
    "طرابلس",
    "ساندويجي",
  ],
  openGraph: {
    title: "Sandweeji | Best Burgers & Shawarma in Tripoli",
    description: "Premium street food in the heart of Tripoli, Lebanon.",
    type: "website",
    locale: "ar_AR",
    siteName: "Sandweeji",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#1a1208",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${plusJakarta.variable} ${cairo.variable} bg-background dark`}
    >
      <body className="antialiased font-sans bg-background text-foreground">
        <QueryProvider>
          <LocaleHtmlWrapper />
          <Navbar />
          {children}
          <Footer />
          <CartDrawer />
        </QueryProvider>

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
