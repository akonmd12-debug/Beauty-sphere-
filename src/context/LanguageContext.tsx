import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  isBangla: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Top bar & announcements
    'announcement.text': 'Complimentary White-Glove Delivery on orders over ৳1,500 • Authentic Seoul & Hangzhou Luxury Imports • Code: KBEAUTY15',
    'nav.door': '3-Step Door',
    'nav.search.placeholder': 'Search Ginseng, Snail Mucin, Cica, Florasis, Pearl...',
    'nav.wishlist': 'Wishlist',
    'nav.account': 'Account',
    'nav.cart': 'Cart List',
    'nav.all_collections': 'All Collections',
    'nav.k_beauty': '🇰🇷 K-Beauty (Korea)',
    'nav.c_beauty': '🇨🇳 C-Beauty (China)',
    'nav.essences': 'Essences & Serums',
    'nav.creams': 'Moisture Creams',
    'nav.cleansers': 'Cleansers & Balms',
    'nav.suncare': 'Sun Care & Cushions',
    'nav.masks': 'Sheet Masks',
    'nav.producers': 'Artisan Houses',

    // Language
    'lang.en': 'English',
    'lang.bn': 'বাংলা',
    'lang.switch': 'Language',

    // User Account Modal
    'account.title': 'Customer Account',
    'account.badge': 'Boutique Client',
    'account.tab.profile': 'My Details & Address',
    'account.tab.orders': 'My Orders',
    'account.tab.tracking': 'Track Specific Order',
    'account.tab.wishlist': 'Saved Wishlist',
    'account.tab.share': 'Store Link & Share',

    'account.header.profile': 'Customer Profile & Shipping',
    'account.sub.profile': 'Fast Checkout Profile',
    'account.header.orders': 'Client Order Center',
    'account.sub.orders': 'Your Past Order Status & Items',
    'account.header.tracking': 'Live Delivery Tracking',
    'account.sub.tracking': 'Order Status Tracking',
    'account.header.wishlist': 'Saved Formulations',
    'account.sub.wishlist': 'Your Saved Asian Formulations',

    // Orders tab
    'orders.title': 'My Orders & Purchase History',
    'orders.description': 'Review your past order status, purchased items, and total amounts fetched from your live orders.',
    'orders.empty.title': 'No Orders Placed Yet',
    'orders.empty.desc': 'Customer orders placed through our checkout will appear here with live tracking, item breakdown, and status.',
    'orders.lookup_btn': 'Lookup by Tracking #',
    'orders.track_order_btn': 'Track Order by Number',
    'orders.reference': 'Tracking Reference',
    'orders.total': 'Total Amount',
    'orders.subtotal': 'Subtotal',
    'orders.shipping': 'Shipping',
    'orders.discount': 'Discount Applied',
    'orders.items_count': 'Items in Parcel',
    'orders.status': 'Order Status',
    'orders.destination': 'Destination',
    'orders.payment': 'Payment Method',
    'orders.track_status': 'Track Status',
    'orders.copy_ref': 'Copy Reference',
    'orders.view_all': 'All Orders',
    'orders.my_only': 'My Placed Orders',
    'orders.carrier': 'Courier Partner',
    'orders.waybill': 'Waybill / Tracking #',

    // Statuses
    'status.pending': 'Pending',
    'status.confirmed': 'Confirmed',
    'status.shipped': 'Shipped',
    'status.dispatched': 'Dispatched',
    'status.delivered': 'Delivered',

    // Sakura Bloom
    'sakura.title': 'Sakura Bloom',
    'sakura.atmosphere': 'Sakura Atmosphere',
    'sakura.gentle': 'Gentle Breeze',
    'sakura.gentle_desc': 'Ethereal soft petal drift',
    'sakura.shower': 'Blossom Shower',
    'sakura.shower_desc': 'Full spring bloom rain',
    'sakura.off': 'Turn Off Petals',
    'sakura.off_desc': 'Pause floral atmosphere',

    // Product Card & Cart
    'product.add_bag': 'Add to Bag',
    'product.buy_now': 'Buy Now',
    'product.in_stock': 'In Stock',
    'product.out_of_stock': 'Sold Out',
    'product.rating': 'Rating',
    'product.ml': 'Volume',
  },
  bn: {
    // Top bar & announcements
    'announcement.text': '৳১,৫০০ এর বেশি অর্ডারে বিনামূল্যে স্পেশাল ডেলিভারি • খাঁটি সিউল ও হাংঝু প্রিমিয়াম রূপচর্চা • কোড: KBEAUTY15',
    'nav.door': '৩-ধাপ পোর্টাল',
    'nav.search.placeholder': 'জিনসেং, স্নেল মিউসিন, সিকা, ফ্লোরাসিস, পার্ল খুঁজুন...',
    'nav.wishlist': 'পছন্দের তালিকা',
    'nav.account': 'অ্যাকাউন্ট',
    'nav.cart': 'কার্ট তালিকা',
    'nav.all_collections': 'সকল কালেকশন',
    'nav.k_beauty': '🇰🇷 কে-বিউটি (কোরিয়া)',
    'nav.c_beauty': '🇨🇳 সি-বিউটি (চীন)',
    'nav.essences': 'এসেন্স ও সিরাম',
    'nav.creams': 'ময়েশ্চারাইজিং ক্রিম',
    'nav.cleansers': 'ক্লিনজার ও বাম',
    'nav.suncare': 'সান কেয়ার ও কুশন',
    'nav.masks': 'শিট মাস্ক ও ট্রিটমেন্ট',
    'nav.producers': 'অভিজাত ব্র‍্যান্ডসমূহ',

    // Language
    'lang.en': 'English',
    'lang.bn': 'বাংলা',
    'lang.switch': 'ভাষা',

    // User Account Modal
    'account.title': 'গ্রাহক অ্যাকাউন্ট',
    'account.badge': 'সম্মানিত ক্লায়েন্ট',
    'account.tab.profile': 'আমার বিবরণ ও ঠিকানা',
    'account.tab.orders': 'আমার অর্ডারসমূহ',
    'account.tab.tracking': 'নির্দিষ্ট অর্ডার ট্র্যাক',
    'account.tab.wishlist': 'সংরক্ষিত তালিকা',
    'account.tab.share': 'স্টোর লিংক ও শেয়ার',

    'account.header.profile': 'গ্রাহক প্রোফাইল ও শিপিং',
    'account.sub.profile': 'দ্রুত চেকআউট প্রোফাইল',
    'account.header.orders': 'অর্ডার ব্যবস্থাপনা কেন্দ্র',
    'account.sub.orders': 'আপনার পূর্ববর্তী অর্ডারের অবস্থা ও পণ্যসমূহ',
    'account.header.tracking': 'লাইভ ডেলিভারি ট্র্যাকিং',
    'account.sub.tracking': 'অর্ডার স্ট্যাটাস সন্ধান',
    'account.header.wishlist': 'সংরক্ষিত রূপচর্চা পণ্য',
    'account.sub.wishlist': 'আপনার পছন্দের এশিয়ান ফর্মুলেশন',

    // Orders tab
    'orders.title': 'আমার পূর্ববর্তী অর্ডার ও ইতিহাস',
    'orders.description': 'আপনার পূর্ববর্তী সকল অর্ডারের বর্তমান অবস্থা, পণ্যসমূহের তালিকা এবং মোট মূল্য দেখুন।',
    'orders.empty.title': 'এখনও কোনো অর্ডার করা হয়নি',
    'orders.empty.desc': 'আমাদের চেকআউটের মাধ্যমে সম্পন্ন হওয়া সকল অর্ডার লাইভ ট্র্যাকিং ও আইটেমসহ এখানে প্রদর্শিত হবে।',
    'orders.lookup_btn': 'ট্র্যাকিং নম্বর দিয়ে খুঁজুন',
    'orders.track_order_btn': 'অর্ডার নম্বর দিয়ে ট্র্যাক করুন',
    'orders.reference': 'অর্ডার রেফারেন্স',
    'orders.total': 'মোট প্রদেয় মূল্য',
    'orders.subtotal': 'সাবটোটাল',
    'orders.shipping': 'শিপিং চার্জ',
    'orders.discount': 'ডিসকাউন্ট ছাড়',
    'orders.items_count': 'অর্ডারের পণ্যসমূহ',
    'orders.status': 'অর্ডারের বর্তমান অবস্থা',
    'orders.destination': 'ডেলিভারি গন্তব্য',
    'orders.payment': 'পরিশোধের মাধ্যম',
    'orders.track_status': 'স্ট্যাটাস দেখুন',
    'orders.copy_ref': 'রেফারেন্স কপি',
    'orders.view_all': 'সকল অর্ডার',
    'orders.my_only': 'আমার প্রদত্ত অর্ডার',
    'orders.carrier': 'কুরিয়ার পার্টনার',
    'orders.waybill': 'ওয়েবিল / ট্র্যাকিং #',

    // Statuses
    'status.pending': 'অপেক্ষারত (Pending)',
    'status.confirmed': 'নিশ্চিতকৃত (Confirmed)',
    'status.shipped': 'প্রেরিত (Shipped)',
    'status.dispatched': 'পথে রয়েছে (Dispatched)',
    'status.delivered': 'ডেলিভারি সম্পন্ন (Delivered)',

    // Sakura Bloom
    'sakura.title': 'সাকুরা ব্লুম',
    'sakura.atmosphere': 'সাকুরা আবহ',
    'sakura.gentle': 'হালকা বাতাস',
    'sakura.gentle_desc': 'কোমল পাপড়ির মৃদু প্রবাহ',
    'sakura.shower': 'বসন্তের ঝাপটা',
    'sakura.shower_desc': 'প্রস্ফুটিত সাকুরা পাপড়ির বর্ষণ',
    'sakura.off': 'পাপড়ি বন্ধ করুন',
    'sakura.off_desc': 'ফ্লোরাল অ্যানিমেশন সাময়িক স্থগিত',

    // Product Card & Cart
    'product.add_bag': 'ব্যাগে যোগ করুন',
    'product.buy_now': 'এখনই কিনুন',
    'product.in_stock': 'স্টকে রয়েছে',
    'product.out_of_stock': 'স্টক শেষ',
    'product.rating': 'রেটিং',
    'product.ml': 'পরিমাণ',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  isBangla: false,
});

const STORAGE_KEY = 'beautysphere_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'bn' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations.en;
    if (langDict[key]) return langDict[key];
    const enDict = translations.en;
    if (enDict[key]) return enDict[key];
    return fallback || key;
  };

  const isBangla = language === 'bn';

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isBangla }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
