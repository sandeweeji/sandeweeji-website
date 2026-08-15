import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CartDrawer from "@/components/cart/cart-drawer";
import LocaleHtmlWrapper from "@/components/layout/locale-html-wrapper";
import QueryProvider from "@/components/providers/query-provider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

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
    locale: "en_US",
    siteName: "Sandweeji",
  },
  // icons: {
  //   icon: [
  //     { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
  //     { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)' },
  //     { url: '/icon.svg', type: 'image/svg+xml' },
  //   ],
  //   apple: '/apple-icon.png',
  // },
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
    <html lang="en" className={`${plusJakarta.variable} bg-background dark`}>
      <body className="antialiased font-sans bg-background text-foreground">
        <LocaleHtmlWrapper />
        <Navbar />
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
        {/* <Footer /> */}
        <CartDrawer />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
