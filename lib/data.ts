/* ================================
   SANDWEEJI — Static Seed Data
   Replace with live Firestore data
   ================================ */
import type { Category, Product, Review, RestaurantSettings } from "./types";

export const WHATSAPP_NUMBER = "+96170206686";
export const INSTAGRAM_URL = "https://www.instagram.com/sandeweeji/";
export const FACEBOOK_URL = "https://www.facebook.com/612075731998703";

export const RESTAURANT_SETTINGS: RestaurantSettings = {
  nameEn: "Sandweeji",
  nameAr: "ساندويجي",
  whatsappNumber: WHATSAPP_NUMBER,
  instagramUrl: INSTAGRAM_URL,
  facebookUrl: FACEBOOK_URL,
  phone: "+96170206686",
  addressEn: "Abi Samra, Tripoli, Lebanon",
  addressAr: "أبي سمرا، طرابلس، لبنان",
  lat: 34.4425,
  lng: 35.8447,
  openingHours: [
    {
      day: "Monday",
      dayAr: "الإثنين",
      openTime: "1:00",
      closeTime: "1:00",
      closed: false,
    },
    {
      day: "Tuesday",
      dayAr: "الثلاثاء",
      openTime: "1:00",
      closeTime: "1:00",
      closed: false,
    },
    {
      day: "Wednesday",
      dayAr: "الأربعاء",
      openTime: "1:00",
      closeTime: "1:00",
      closed: false,
    },
    {
      day: "Thursday",
      dayAr: "الخميس",
      openTime: "1:00",
      closeTime: "1:00",
      closed: false,
    },
    {
      day: "Friday",
      dayAr: "الجمعة",
      openTime: "1:00",
      closeTime: "1:00",
      closed: false,
    },
    {
      day: "Saturday",
      dayAr: "السبت",
      openTime: "1:00",
      closeTime: "1:00",
      closed: false,
    },
    {
      day: "Sunday",
      dayAr: "الأحد",
      openTime: "1:00",
      closeTime: "1:00",
      closed: false,
    },
  ],
  heroSlides: [],
  seoTitle: "Sandweeji | Best Burgers & Shawarma in Tripoli, Lebanon",
  seoDescription:
    "Sandweeji — premium street food in Tripoli. Burgers, shawarma, crispy chicken & more. Order on WhatsApp.",
};

export const CATEGORIES: Category[] = [
  {
    id: "burgers",
    nameEn: "Burgers",
    nameAr: "برغر",
    emoji: "🍔",
    order: 1,
    visible: true,
  },
  {
    id: "shawarma",
    nameEn: "Shawarma",
    nameAr: "شاورما",
    emoji: "🌯",
    order: 2,
    visible: true,
  },
  {
    id: "chicken",
    nameEn: "Crispy Chicken",
    nameAr: "دجاج مقرمش",
    emoji: "🍗",
    order: 3,
    visible: true,
  },
  {
    id: "sides",
    nameEn: "Sides",
    nameAr: "مقبلات",
    emoji: "🍟",
    order: 4,
    visible: true,
  },
  {
    id: "drinks",
    nameEn: "Drinks",
    nameAr: "مشروبات",
    emoji: "🥤",
    order: 5,
    visible: true,
  },
  {
    id: "meals",
    nameEn: "Meal Deals",
    nameAr: "وجبات",
    emoji: "🎁",
    order: 6,
    visible: true,
  },
];

export const PRODUCTS: Product[] = [
  /* ---- BURGERS ---- */
  {
    id: "b1",
    categoryId: "burgers",
    nameEn: "Original Sandweeji Burger",
    nameAr: "برغر ساندويجي الأصلي",
    descriptionEn:
      "Double smash patty, special sauce, caramelized onions, pickles & cheese",
    descriptionAr: "باتي مضغوط مزدوج، صوص خاص، بصل كراميل، مخلل وجبنة",
    price: 14000,
    image: "/images/classic-burger.png",
    badges: ["popular", "bestseller"],
    available: true,
    featured: true,
    calories: 680,
    extras: [
      { id: "e1", nameEn: "Extra Patty", nameAr: "باتي إضافي", price: 5000 },
      { id: "e2", nameEn: "Extra Cheese", nameAr: "جبنة إضافية", price: 2000 },
      { id: "e3", nameEn: "Bacon", nameAr: "بيكون", price: 3000 },
    ],
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "b2",
    categoryId: "burgers",
    nameEn: "Spicy Fire Burger",
    nameAr: "برغر حار",
    descriptionEn:
      "Crispy chicken patty, jalapeños, spicy mayo, lettuce & tomato",
    descriptionAr: "باتي دجاج مقرمش، فلفل حار، مايونيز حار، خس وطماطم",
    price: 15000,
    image: "/images/classic-burger.png",
    badges: ["spicy", "new"],
    available: true,
    featured: false,
    calories: 720,
    extras: [
      { id: "e2", nameEn: "Extra Cheese", nameAr: "جبنة إضافية", price: 2000 },
    ],
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "b3",
    categoryId: "burgers",
    nameEn: "Classic Smash Burger",
    nameAr: "برغر كلاسيكي",
    descriptionEn:
      "Single smash patty, American cheese, mustard, ketchup & pickles",
    descriptionAr: "باتي مفرد، جبنة أمريكية، مسطردة، كاتشب ومخلل",
    price: 11000,
    image: "/images/classic-burger.png",
    badges: [],
    available: true,
    featured: false,
    calories: 540,
    order: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  /* ---- SHAWARMA ---- */
  {
    id: "s1",
    categoryId: "shawarma",
    nameEn: "Chicken Shawarma",
    nameAr: "شاورما دجاج",
    descriptionEn:
      "Marinated chicken, garlic sauce, pickles & fresh veggies in flatbread",
    descriptionAr: "دجاج متبل، صوص ثوم، مخلل وخضار طازج في خبز مرقوق",
    price: 13000,
    image: "/images/shawarma-wrap.png",
    badges: ["popular"],
    available: true,
    featured: true,
    calories: 580,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "s2",
    categoryId: "shawarma",
    nameEn: "Meat Shawarma",
    nameAr: "شاورما لحم",
    descriptionEn: "Seasoned beef & lamb mix, tahini sauce, tomatoes & parsley",
    descriptionAr: "لحم بقري وغنم متبل، طحينة، طماطم وبقدونس",
    price: 16000,
    image: "/images/shawarma-wrap.png",
    badges: ["bestseller"],
    available: true,
    featured: true,
    calories: 650,
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  /* ---- CRISPY CHICKEN ---- */
  {
    id: "c1",
    categoryId: "chicken",
    nameEn: "Crispy Chicken Sandwich",
    nameAr: "ساندويش دجاج مقرمش",
    descriptionEn:
      "Buttermilk fried chicken, pickles, coleslaw & house sauce on brioche",
    descriptionAr:
      "دجاج مقلي بالبطرميلك، مخلل، كول سلو وصوص البيت على خبز بريوش",
    price: 16000,
    image: "/images/crispy-chicken.png",
    badges: ["new", "popular"],
    available: true,
    featured: true,
    calories: 740,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "c2",
    categoryId: "chicken",
    nameEn: "Nashville Hot Chicken",
    nameAr: "دجاج ناشفيل الحار",
    descriptionEn:
      "Extra crispy chicken drenched in Nashville hot sauce, pickles & honey",
    descriptionAr: "دجاج مقرمش مغطى بصوص ناشفيل الحار، مخلل وعسل",
    price: 17000,
    image: "/images/crispy-chicken.png",
    badges: ["spicy", "new"],
    available: true,
    featured: false,
    calories: 810,
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  /* ---- SIDES ---- */
  {
    id: "sd1",
    categoryId: "sides",
    nameEn: "Loaded Fries",
    nameAr: "بطاطا محشية",
    descriptionEn:
      "Crispy fries topped with cheese sauce, crispy chicken bits & jalapeños",
    descriptionAr: "بطاطا مقرمشة مع صوص الجبنة، قطع دجاج مقرمش وجالابينو",
    price: 10000,
    image: "/images/loaded-fries.png",
    badges: ["popular"],
    available: true,
    featured: false,
    calories: 520,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sd2",
    categoryId: "sides",
    nameEn: "Classic Fries",
    nameAr: "بطاطا كلاسيك",
    descriptionEn: "Golden crispy fries seasoned with our house spice blend",
    descriptionAr: "بطاطا ذهبية مقرمشة متبلة بمزيجنا الخاص",
    price: 6000,
    image: "/images/loaded-fries.png",
    badges: [],
    available: true,
    featured: false,
    calories: 380,
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  /* ---- DRINKS ---- */
  {
    id: "d1",
    categoryId: "drinks",
    nameEn: "Fresh Lemonade",
    nameAr: "ليموناضة طازجة",
    descriptionEn: "House-squeezed lemonade with fresh mint & crushed ice",
    descriptionAr: "ليمون طازج مع نعناع وثلج مكسر",
    price: 5000,
    image: "/images/lemonade.png",
    badges: [],
    available: true,
    featured: false,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  /* ---- MEALS ---- */
  {
    id: "m1",
    categoryId: "meals",
    nameEn: "Original Burger Meal",
    nameAr: "وجبة البرغر الأصلي",
    descriptionEn:
      "Original Sandweeji Burger + Classic Fries + Drink of your choice",
    descriptionAr: "برغر ساندويجي الأصلي + بطاطا كلاسيك + مشروب من اختيارك",
    price: 22000,
    image: "/images/classic-burger.png",
    badges: ["meal", "popular"],
    available: true,
    featured: true,
    calories: 1060,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "m2",
    categoryId: "meals",
    nameEn: "Shawarma Meal",
    nameAr: "وجبة الشاورما",
    descriptionEn: "Chicken Shawarma + Classic Fries + Fresh Lemonade",
    descriptionAr: "شاورما دجاج + بطاطا كلاسيك + ليموناضة طازجة",
    price: 20000,
    image: "/images/shawarma-wrap.png",
    badges: ["meal"],
    available: true,
    featured: true,
    calories: 960,
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
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
      "مبارح طبلت الكرسبي بتجنن كتير بس الموزاريلا ستيك ما كتير حبيت ما فيها جبنة.. والله يعطيكن العافية وانتا هلق number one بأبو سمراء.",
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
