/* ================================
   SANDWEEJI — Static Seed Data
   Replace with live Firestore data
   ================================ */
import type { Category, Product, Review } from "./types";

export const WHATSAPP_NUMBER = "+96170206686";
export const INSTAGRAM_URL = "https://www.instagram.com/sandeweeji/";
export const FACEBOOK_URL = "https://www.facebook.com/612075731998703";
export const waUrl = `https://wa.me/${WHATSAPP_NUMBER}`;
export const mapsUrl = "https://maps.app.goo.gl/QmL3uyg5kTbuKqHFA";

export const RESTAURANT_SETTINGS = {
  nameEn: "Sandweeji",
  nameAr: "ساندويجي",
  whatsappNumber: "+961 70 206 686",
  instagramUrl:
    "https://www.instagram.com/sandeweeji?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  facebookUrl: "https://www.facebook.com/share/19GVAwVqtw/?mibextid=wwXIfr",
  phone: "+96170206686",
  addressEn: "Abi Samra, Tripoli, Lebanon",
  addressAr: "أبي سمرا، طرابلس، لبنان",
  lat: 34.4425,
  lng: 35.8447,
  openingHours: [
    {
      day: "Monday",
      dayAr: "الإثنين",
      openTime: "1:00 AM",
      closeTime: "1:00 PM",
      closed: false,
    },
    {
      day: "Tuesday",
      dayAr: "الثلاثاء",
      openTime: "1:00 AM",
      closeTime: "1:00 PM",
      closed: false,
    },
    {
      day: "Wednesday",
      dayAr: "الأربعاء",
      openTime: "1:00 AM",
      closeTime: "1:00 PM",
      closed: false,
    },
    {
      day: "Thursday",
      dayAr: "الخميس",
      openTime: "1:00 AM",
      closeTime: "1:00 PM",
      closed: false,
    },
    {
      day: "Friday",
      dayAr: "الجمعة",
      openTime: "1:00 AM",
      closeTime: "1:00 PM",
      closed: false,
    },
    {
      day: "Saturday",
      dayAr: "السبت",
      openTime: "1:00 AM",
      closeTime: "1:00 PM",
      closed: false,
    },
    {
      day: "Sunday",
      dayAr: "الأحد",
      openTime: "1:00 AM",
      closeTime: "1:00 PM",
      closed: false,
    },
  ],
  heroSlides: [],
  seoTitle: "Sandweeji | Best Burgers & Shawarma in Tripoli, Lebanon",
  seoDescription:
    "Sandweeji — premium street food in Tripoli. Burgers, shawarma, crispy chicken & more. Order on WhatsApp.",
};

export const REVIEWS: Review[] = [
  {
    id: "r1",
    authorName: "Abdallah M.",
    rating: 5,
    textEn:
      "Firas is part of the best people around, and good upbringing and mannerisms are key.",
    textAr: "فراس أحلى عالم وأحلى ناس... والتربية والأخلاق هي الأساس.",
    date: "2026-08-15",
  },
  {
    id: "r2",
    authorName: "Zako W.",
    rating: 5,
    textEn:
      "Yesterday the crispy meal was amazing, but I did not like the mozzarella sticks much. God give you wellness, you are now number one in Abu Samra!",
    textAr:
      "مبارح طلبت الكرسبي بتجنن كتير بس الموزاريلا ستيك ما كتير حبيت ما فيها جبنة.. والله يعطيكن العافية وانتا هلق number one بأبو سمراء.",
    date: "2026-08-15",
  },
  {
    id: "r3",
    authorName: "Malek A.",
    rating: 5,
    textEn:
      "No wallah, everything was delicious! We tried 3 meals and everything was cleaner and tastier than before. Very polite treatment, you feel like you are visiting family.",
    textAr:
      "لا والله كتير كتير طيب جربنا 3 وجبات عنجد كل حدا أطيب من لي قبلا وكتير نضيف ومعاملة كتير حلوة بتحس حالك رايح عند حدا بتعرفو للأمانة.",
    date: "2026-08-15",
  },
  {
    id: "r4",
    authorName: "Hisham K.",
    rating: 5,
    textEn:
      "May God grant you success and benefit from supporting the sandwiches, O people of generosity. You deserve all the best, good luck!",
    textAr:
      "إن شاء الله ماتتغيد ولا يتغيد دعم السندويش يا أهل الكرم بتستاهل كل خير بالتوفيق يارب.",
    date: "2026-08-15",
  },
  {
    id: "r5",
    authorName: "Ali A.",
    rating: 5,
    textEn:
      "The most luxurious, organized, delicious, and cleanest bite in the world!",
    textAr: "أفخم و أرتب و أطيب و أنظف لقمة بالعالم.",
    date: "2026-08-15",
  },
  {
    id: "r6",
    authorName: "Mayez E.",
    rating: 5,
    textEn:
      "I want to apologize and block you, because I gained weight and you are the reason for this guilt! 😂",
    textAr:
      "بس بدي اعتذر منكن واعمل بلوك لان الوزن صار زايد وانتو سبب هيدا الذنب 😂",
    date: "2026-08-15",
  },
  {
    id: "r7",
    authorName: "Ahmad M.",
    rating: 5,
    textEn:
      "May God grant you sustenance! The food, Mashallah, is amazing. God bless.",
    textAr: "Allah yerz2li yek ya rab l akl mashalla bjanen Allah yberk",
    date: "2026-08-15",
  },
  {
    id: "r8",
    authorName: "Khaled B.",
    rating: 5,
    textEn:
      "May God grant you sustenance and bless you. We ordered yesterday, the Soujouk was amazing! I am a fan of Soujouk and for years I haven't tasted delicious Soujouk like this.",
    textAr:
      "الله يرزقكم ويباركلكم مبارح طلبنا من عندكم السجق عندكم كتيييير روعة.. انا من عشاق السجق ومن سنين طويلة ما كنت لاقي لقمة سجق هيك طيبة.",
    date: "2026-08-15",
  },
  {
    id: "r9",
    authorName: "Abu Z.",
    rating: 5,
    textEn:
      "May God forgive you! My friend from Beirut kept bothering us about Beirut's food, but after eating your fajita, he doesn't want to go back to Beirut anymore! Now he wants to keep coming back here.",
    textAr:
      "الله يسامحك.. الزلمة بيروتي صرعنا بفلان الفلاني ببيروت.. بعد ما اكل الفاهيتا ما عاد بده يروح على بيروت بليتني فيه.. هلا صار بده يضل ييجي!",
    date: "2026-08-15",
  },
  {
    id: "r10",
    authorName: "Tariq S.",
    rating: 5,
    textEn:
      "Honestly, the best Fajita and Quesadilla sandwiches in town. Always hot and super fresh.",
    textAr:
      "صراحة أطيب سندويش فاهيتا وكاساديا بالمنطقة كلها. أكل دايماً ساخن وطازج.",
    date: "2026-08-14",
  },
  {
    id: "r11",
    authorName: "Nour K.",
    rating: 5,
    textEn:
      "Extremely polite customer service and fast delivery! Sandweeji is officially my favorite spot.",
    textAr:
      "معاملة راقية جداً وتوصيل سريع! ساندويجي صار مكاني المفضل بدون منازع.",
    date: "2026-08-13",
  },
  {
    id: "r12",
    authorName: "Hassan R.",
    rating: 5,
    textEn:
      "The portions are very generous and the flavors are spot on every single time. High quality!",
    textAr: "الكمية سخية والنكهة ممتازة ومضبوطة كل مرة. جودة عالية جداً!",
    date: "2026-08-12",
  },
];

export const BADGE_MAP: Record<
  string,
  { labelEn: string; labelAr: string; cls: string }
> = {
  popular: {
    labelEn: "Popular",
    labelAr: "شعبي",
    cls: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  new: {
    labelEn: "New",
    labelAr: "جديد",
    cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  spicy: {
    labelEn: "🌶 Spicy",
    labelAr: "🌶 حار",
    cls: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  meal: {
    labelEn: "Meal Deal",
    labelAr: "وجبة",
    cls: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  bestseller: {
    labelEn: "Bestseller",
    labelAr: "الأكثر مبيعاً",
    cls: "bg-primary/20 text-primary border-primary/30",
  },
  featured: {
    labelEn: "Featured",
    labelAr: "مميز",
    cls: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  },
};
