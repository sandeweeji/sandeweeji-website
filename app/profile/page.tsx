import React from "react";

const page = () => {
  return <div></div>;
};

export default page;

// 'use client'
// import { useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   User, Heart, Clock, MapPin, Trophy, Settings,
//   Star, Gift, Globe, LogOut, ChevronRight, Flame,
//   ShoppingBag, Edit2, Copy, Check
// } from 'lucide-react'
// import { useLocaleStore } from '@/lib/locale-store'
// import { useCartStore } from '@/lib/cart-store'
// import { t } from '@/lib/i18n'
// import { formatPrice } from '@/lib/utils'
// import { PRODUCTS } from '@/lib/data'
// import { cn } from '@/lib/utils'

// /* ---------- Mock user state (replace with real auth) ---------- */
// const MOCK_USER = {
//   displayName: 'Ahmad Karimi',
//   email: 'ahmad@example.com',
//   loyaltyPoints: 1240,
//   referralCode: 'SANDW-AHK7',
//   favoriteProductIds: ['b1', 's1', 'c1'],
//   orders: [
//     { id: 'o1', date: '2024-12-15', items: 'Original Burger + Loaded Fries', total: 24000 },
//     { id: 'o2', date: '2024-12-10', items: 'Chicken Shawarma Meal', total: 20000 },
//     { id: 'o3', date: '2024-12-05', items: 'Nashville Hot Chicken + Classic Fries', total: 23000 },
//   ],
//   achievements: [
//     { id: 'a1', icon: '🔥', titleEn: 'First Order',       titleAr: 'أول طلب',        unlocked: true },
//     { id: 'a2', icon: '⭐', titleEn: '5-Star Fan',        titleAr: 'مشجع 5 نجوم',    unlocked: true },
//     { id: 'a3', icon: '🏆', titleEn: 'Loyal Customer',    titleAr: 'زبون وفي',        unlocked: true },
//     { id: 'a4', icon: '🌶', titleEn: 'Spice Lover',       titleAr: 'محب الحار',       unlocked: false },
//     { id: 'a5', icon: '🎁', titleEn: 'Referral Master',   titleAr: 'خبير الإحالة',    unlocked: false },
//     { id: 'a6', icon: '👑', titleEn: 'VIP Member',        titleAr: 'عضو VIP',         unlocked: false },
//   ],
// }

// type Tab = 'overview' | 'favorites' | 'orders' | 'achievements' | 'settings'

// const TABS: { id: Tab; labelEn: string; labelAr: string; icon: React.ElementType }[] = [
//   { id: 'overview',     labelEn: 'Overview',      labelAr: 'نظرة عامة',    icon: User },
//   { id: 'favorites',    labelEn: 'Favorites',     labelAr: 'المفضلة',       icon: Heart },
//   { id: 'orders',       labelEn: 'Orders',        labelAr: 'الطلبات',       icon: Clock },
//   { id: 'achievements', labelEn: 'Achievements',  labelAr: 'الإنجازات',     icon: Trophy },
//   { id: 'settings',     labelEn: 'Settings',      labelAr: 'الإعدادات',     icon: Settings },
// ]

// export default function ProfilePage() {
//   const { locale, toggleLocale } = useLocaleStore()
//   const openCart = useCartStore(s => s.openCart)
//   const [activeTab, setActiveTab] = useState<Tab>('overview')
//   const [copied, setCopied] = useState(false)
//   const isRtl = locale === 'ar'

//   const favoriteProducts = PRODUCTS.filter(p => MOCK_USER.favoriteProductIds.includes(p.id))
//   const initials = MOCK_USER.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)

//   const loyaltyLevel = MOCK_USER.loyaltyPoints >= 1000 ? 'Gold' : MOCK_USER.loyaltyPoints >= 500 ? 'Silver' : 'Bronze'
//   const loyaltyLevelLabel = isRtl
//     ? (loyaltyLevel === 'Gold' ? 'ذهبي' : loyaltyLevel === 'Silver' ? 'فضي' : 'برونزي')
//     : loyaltyLevel
//   const loyaltyColor = loyaltyLevel === 'Gold' ? 'text-amber-400' : loyaltyLevel === 'Silver' ? 'text-slate-300' : 'text-orange-600'
//   const loyaltyNext  = loyaltyLevel === 'Gold' ? 2000 : loyaltyLevel === 'Silver' ? 1000 : 500
//   const loyaltyPct   = Math.min((MOCK_USER.loyaltyPoints / loyaltyNext) * 100, 100)

//   const copyReferral = () => {
//     navigator.clipboard.writeText(MOCK_USER.referralCode).catch(() => {})
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2000)
//   }

//   return (
//     <main className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
//       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

//         {/* Profile Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-card border border-white/5 rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden"
//           style={{
//             backgroundImage: 'radial-gradient(ellipse at 80% 0%, oklch(0.75 0.18 52 / 0.08) 0%, transparent 60%)',
//           }}
//         >
//           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
//             {/* Avatar */}
//             <div className="relative">
//               <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-2xl font-extrabold text-primary">
//                 {initials}
//               </div>
//               <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-bold ${loyaltyLevel === 'Gold' ? 'bg-amber-400 text-amber-900' : 'bg-slate-300 text-slate-800'}`}>
//                 {loyaltyLevelLabel[0]}
//               </div>
//             </div>

//             {/* Info */}
//             <div className="flex-1 min-w-0">
//               <h1 className="text-2xl font-extrabold text-foreground">{MOCK_USER.displayName}</h1>
//               <p className="text-sm text-muted-foreground mt-0.5">{MOCK_USER.email}</p>
//               <div className="flex flex-wrap items-center gap-3 mt-3">
//                 <span className={`text-sm font-semibold ${loyaltyColor}`}>
//                   {loyaltyLevelLabel} {isRtl ? 'عضو' : 'Member'}
//                 </span>
//                 <span className="text-muted-foreground text-xs">·</span>
//                 <span className="text-sm text-foreground font-medium flex items-center gap-1">
//                   <Star className="w-3.5 h-3.5 text-primary fill-primary" />
//                   {MOCK_USER.loyaltyPoints.toLocaleString()} {t('loyaltyPoints', locale)}
//                 </span>
//               </div>
//             </div>

//             {/* Edit button */}
//             <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
//               <Edit2 className="w-3.5 h-3.5" />
//               {isRtl ? 'تعديل الملف' : 'Edit Profile'}
//             </button>
//           </div>

//           {/* Loyalty bar */}
//           <div className="mt-6 space-y-2">
//             <div className="flex items-center justify-between text-xs">
//               <span className="text-muted-foreground">
//                 {isRtl ? `${loyaltyNext - MOCK_USER.loyaltyPoints} نقطة للمستوى التالي` : `${loyaltyNext - MOCK_USER.loyaltyPoints} pts to next level`}
//               </span>
//               <span className={`font-semibold ${loyaltyColor}`}>{loyaltyLevelLabel}</span>
//             </div>
//             <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
//               <motion.div
//                 initial={{ width: 0 }}
//                 animate={{ width: `${loyaltyPct}%` }}
//                 transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
//                 className="h-full rounded-full bg-primary"
//               />
//             </div>
//           </div>
//         </motion.div>

//         {/* Quick Stats */}
//         <motion.div
//           initial={{ opacity: 0, y: 16 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
//         >
//           {[
//             { icon: ShoppingBag, labelEn: 'Total Orders',  labelAr: 'إجمالي الطلبات', value: MOCK_USER.orders.length },
//             { icon: Heart,       labelEn: 'Favorites',     labelAr: 'المفضلة',          value: favoriteProducts.length },
//             { icon: Trophy,      labelEn: 'Achievements',  labelAr: 'الإنجازات',        value: `${MOCK_USER.achievements.filter(a => a.unlocked).length}/${MOCK_USER.achievements.length}` },
//             { icon: Star,        labelEn: 'Loyalty Pts',   labelAr: 'نقاط الولاء',      value: MOCK_USER.loyaltyPoints.toLocaleString() },
//           ].map(({ icon: Icon, labelEn, labelAr, value }, i) => (
//             <div key={i} className="bg-card border border-white/5 rounded-2xl p-4 flex items-center gap-3">
//               <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
//                 <Icon className="w-4 h-4 text-primary" />
//               </div>
//               <div>
//                 <p className="text-lg font-extrabold text-foreground">{value}</p>
//                 <p className="text-xs text-muted-foreground">{isRtl ? labelAr : labelEn}</p>
//               </div>
//             </div>
//           ))}
//         </motion.div>

//         {/* Tab Navigation */}
//         <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
//           {TABS.map(tab => {
//             const Icon = tab.icon
//             return (
//               <motion.button
//                 key={tab.id}
//                 whileTap={{ scale: 0.93 }}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={cn(
//                   'flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
//                   activeTab === tab.id
//                     ? 'bg-primary text-primary-foreground'
//                     : 'bg-card border border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/30'
//                 )}
//               >
//                 <Icon className="w-4 h-4" />
//                 {isRtl ? tab.labelAr : tab.labelEn}
//               </motion.button>
//             )
//           })}
//         </div>

//         {/* Tab Content */}
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={activeTab}
//             initial={{ opacity: 0, y: 16 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -8 }}
//             transition={{ duration: 0.2 }}
//           >
//             {/* OVERVIEW */}
//             {activeTab === 'overview' && (
//               <div className="grid sm:grid-cols-2 gap-6">
//                 {/* Referral card */}
//                 <div className="bg-card border border-white/5 rounded-2xl p-6 space-y-4">
//                   <div className="flex items-center gap-2">
//                     <Gift className="w-5 h-5 text-primary" />
//                     <h3 className="font-bold text-foreground">{t('referral', locale)}</h3>
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     {isRtl ? 'شارك كودك وارن 500 نقطة لكل صديق' : 'Share your code and earn 500 pts per referral'}
//                   </p>
//                   <div className="flex items-center gap-2">
//                     <div className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-semibold text-primary tracking-widest">
//                       {MOCK_USER.referralCode}
//                     </div>
//                     <motion.button
//                       whileTap={{ scale: 0.9 }}
//                       onClick={copyReferral}
//                       className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/25 transition-colors"
//                     >
//                       {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
//                     </motion.button>
//                   </div>
//                 </div>

//                 {/* Recent order */}
//                 <div className="bg-card border border-white/5 rounded-2xl p-6 space-y-4">
//                   <div className="flex items-center gap-2">
//                     <Clock className="w-5 h-5 text-primary" />
//                     <h3 className="font-bold text-foreground">
//                       {isRtl ? 'آخر طلب' : 'Last Order'}
//                     </h3>
//                   </div>
//                   {MOCK_USER.orders[0] && (
//                     <div className="space-y-2">
//                       <p className="text-sm font-semibold text-foreground">{MOCK_USER.orders[0].items}</p>
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs text-muted-foreground">{MOCK_USER.orders[0].date}</span>
//                         <span className="text-sm font-bold text-primary">{formatPrice(MOCK_USER.orders[0].total)}</span>
//                       </div>
//                     </div>
//                   )}
//                   <button
//                     onClick={() => setActiveTab('orders')}
//                     className="text-sm text-primary hover:underline flex items-center gap-1"
//                   >
//                     {isRtl ? 'كل الطلبات' : 'View all orders'}
//                     <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
//                   </button>
//                 </div>

//                 {/* Loyalty rewards hint */}
//                 <div className="sm:col-span-2 bg-card border border-primary/15 rounded-2xl p-6 flex items-center gap-5"
//                   style={{ backgroundImage: 'radial-gradient(ellipse at 100% 50%, oklch(0.75 0.18 52 / 0.06) 0%, transparent 60%)' }}
//                 >
//                   <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
//                     <Flame className="w-6 h-6 text-primary" />
//                   </div>
//                   <div className="flex-1">
//                     <p className="font-bold text-foreground">
//                       {isRtl ? `أنت على بعد ${loyaltyNext - MOCK_USER.loyaltyPoints} نقطة من ${loyaltyLevel === 'Silver' ? 'الذهب' : 'VIP'}`
//                         : `You're ${loyaltyNext - MOCK_USER.loyaltyPoints} pts away from ${loyaltyLevel === 'Silver' ? 'Gold' : 'VIP'}`}
//                     </p>
//                     <p className="text-sm text-muted-foreground mt-0.5">
//                       {isRtl ? 'كل طلب عبر واتساب يكسبك نقاط' : 'Every WhatsApp order earns you points'}
//                     </p>
//                   </div>
//                   <button
//                     onClick={openCart}
//                     className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors flex-shrink-0"
//                   >
//                     {isRtl ? 'اطلب الآن' : 'Order Now'}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* FAVORITES */}
//             {activeTab === 'favorites' && (
//               <div>
//                 {favoriteProducts.length === 0 ? (
//                   <div className="text-center py-20 text-muted-foreground">
//                     <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
//                     <p className="font-semibold">{isRtl ? 'لا يوجد مفضلات بعد' : 'No favorites yet'}</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {favoriteProducts.map(product => {
//                       const name = locale === 'ar' ? product.nameAr : product.nameEn
//                       const desc = locale === 'ar' ? product.descriptionAr : product.descriptionEn
//                       return (
//                         <motion.div
//                           key={product.id}
//                           whileHover={{ y: -3 }}
//                           className="bg-card border border-white/5 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors"
//                         >
//                           <div className="relative h-36 bg-surface">
//                             <img src={product.image} alt={name} className="w-full h-full object-cover" />
//                             <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
//                           </div>
//                           <div className="p-4 space-y-2">
//                             <h3 className="font-bold text-sm text-foreground">{name}</h3>
//                             <p className="text-xs text-muted-foreground line-clamp-2">{desc}</p>
//                             <div className="flex items-center justify-between">
//                               <span className="font-bold text-primary">{formatPrice(product.price)}</span>
//                               <Heart className="w-4 h-4 fill-red-400 text-red-400" />
//                             </div>
//                           </div>
//                         </motion.div>
//                       )
//                     })}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ORDERS */}
//             {activeTab === 'orders' && (
//               <div className="space-y-3">
//                 {MOCK_USER.orders.map(order => (
//                   <motion.div
//                     key={order.id}
//                     initial={{ opacity: 0, x: -10 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     className="bg-card border border-white/5 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-primary/20 transition-colors"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
//                         <ShoppingBag className="w-5 h-5 text-primary" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-semibold text-foreground">{order.items}</p>
//                         <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
//                       </div>
//                     </div>
//                     <div className="text-right flex-shrink-0">
//                       <p className="font-bold text-primary">{formatPrice(order.total)}</p>
//                       <span className="text-xs text-emerald-400 font-medium">{isRtl ? 'تم التوصيل' : 'Delivered'}</span>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             )}

//             {/* ACHIEVEMENTS */}
//             {activeTab === 'achievements' && (
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//                 {MOCK_USER.achievements.map(achievement => (
//                   <motion.div
//                     key={achievement.id}
//                     whileHover={achievement.unlocked ? { y: -3 } : undefined}
//                     className={cn(
//                       'bg-card border rounded-2xl p-5 flex flex-col items-center gap-3 text-center transition-all',
//                       achievement.unlocked
//                         ? 'border-primary/20 hover:border-primary/40'
//                         : 'border-white/5 opacity-40 grayscale'
//                     )}
//                   >
//                     <span className="text-4xl">{achievement.icon}</span>
//                     <div>
//                       <p className="text-sm font-bold text-foreground">
//                         {isRtl ? achievement.titleAr : achievement.titleEn}
//                       </p>
//                       {achievement.unlocked && (
//                         <p className="text-xs text-primary mt-0.5">{isRtl ? 'تم فتحه' : 'Unlocked'}</p>
//                       )}
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             )}

//             {/* SETTINGS */}
//             {activeTab === 'settings' && (
//               <div className="space-y-3">
//                 {[
//                   {
//                     icon: Globe,
//                     labelEn: 'Language',
//                     labelAr: 'اللغة',
//                     valueEn: locale === 'en' ? 'English' : 'Arabic',
//                     valueAr: locale === 'ar' ? 'عربي' : 'إنجليزي',
//                     action: toggleLocale,
//                     actionLabelEn: 'Switch',
//                     actionLabelAr: 'تغيير',
//                   },
//                 ].map(({ icon: Icon, labelEn, labelAr, valueEn, valueAr, action, actionLabelEn, actionLabelAr }, i) => (
//                   <div key={i} className="bg-card border border-white/5 rounded-2xl p-5 flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                       <div className="w-10 h-10 rounded-xl bg-surface border border-white/10 flex items-center justify-center">
//                         <Icon className="w-5 h-5 text-primary" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-semibold text-foreground">{isRtl ? labelAr : labelEn}</p>
//                         <p className="text-xs text-muted-foreground">{isRtl ? valueAr : valueEn}</p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={action}
//                       className="px-4 py-2 rounded-xl bg-surface border border-white/10 text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors"
//                     >
//                       {isRtl ? actionLabelAr : actionLabelEn}
//                     </button>
//                   </div>
//                 ))}

//                 {/* Sign out placeholder */}
//                 <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-destructive/20 text-destructive/70 hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-all text-sm font-medium mt-2">
//                   <LogOut className="w-4 h-4" />
//                   {t('logout', locale)}
//                 </button>
//               </div>
//             )}
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     </main>
//   )
// }
