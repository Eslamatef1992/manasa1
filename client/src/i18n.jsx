import { createContext, useContext, useEffect, useState } from 'react';

export const T = {
  en: {
    nav: { features: 'Features', integrations: 'Integrations', apps: 'Apps', templates: 'Templates', pricing: 'Pricing', faq: 'FAQ', contact: 'Contact' },
    langSwitch: 'العربية',
    cta: 'Book a free demo',
    hero: {
      title: 'Your online store, live in days.',
      sub: 'Manasa is the e-commerce platform built for Kuwait and the GCC. One yearly plan, every feature unlimited: products, orders, staff, payments and templates.',
      primary: 'Book a free demo',
      secondary: 'See templates',
      priceA: 'a year',
      priceB: 'Everything unlimited',
    },
    clients: 'Stores running on Manasa',
    integrations: {
      title: 'Connected to the services your customers already use',
      sub: 'Payments, delivery, marketing and your back office plug straight into your store. Pick a group to see what is included.',
      groups: { payments: 'Payments', shipping: 'Delivery', marketing: 'Marketing', operations: 'Back office' },
      core: 'Your store',
    },
    features: {
      title: 'Everything included. Nothing metered.',
      unlimitedTitle: 'Unlimited, on every store',
      unlimited: ['Products and variants', 'Orders', 'Staff accounts', 'Branches and warehouses', 'Storage and bandwidth'],
      list: [
        ['lang', 'Arabic and English', 'A full right-to-left Arabic storefront, switched by each customer.'],
        ['card', 'KNET, cards and Apple Pay', 'Accept local and international payments through the gateway you choose.'],
        ['truck', 'Delivery areas and time slots', 'Set prices per area and let customers pick a delivery window.'],
        ['tag', 'Coupons, bundles and offers', 'Run discounts, free-shipping thresholds and bundle deals.'],
        ['globe', 'Your own domain', 'Connect your domain with SSL included.'],
        ['chart', 'Pixels and reports', 'Meta, TikTok, Snapchat and Google tracking plus sales reports.'],
        ['box', 'Stock that stays right', 'Inventory per branch, low-stock alerts and Teknulugy ERP sync.'],
        ['coins', 'Multi-currency checkout', 'Show prices in KWD, SAR, AED and more.'],
      ],
    },
    apps: {
      title: 'One platform, three ways to run it',
      sub: 'Every Manasa store comes with the same three tools.',
      items: [
        ['Dashboard', 'Sales, orders, stock and accounting at a glance, with reports you can export.'],
        ['Admin panel', 'Add products, process orders, manage customers, coupons and staff permissions.'],
        ['Mobile app', 'Your store on iPhone and Android, with instant order notifications for your team.'],
      ],
      notif: ['New order', 'Paid with KNET', 'Out for delivery'],
    },
    steps: {
      title: 'From sign-up to first order',
      items: [
        ['Choose a template', 'Start from a design made for your kind of store and make it yours.'],
        ['Add products and payments', 'Upload your catalogue and connect KNET or your gateway. Our team helps you set up.'],
        ['Go live', 'Launch on your domain and start taking orders the same week.'],
      ],
    },
    templates: { title: 'Start from a template built for your trade', sub: 'Every template works in Arabic and English and is included in the plan.', view: 'View demo' },
    pricing: {
      title: 'One plan. One price.',
      lead: 'The price stays the same whether you sell ten products or ten thousand. No tiers to outgrow and no paid add-ons.',
      per: 'per year',
      note: 'Billed yearly. Payment gateways charge their own transaction fees.',
      items: ['Unlimited products, orders and staff', 'All templates and integrations', 'Arabic and English storefront', 'Dashboard, admin panel and mobile app', 'Custom domain and SSL', 'Setup help from the Teknulugy team'],
      cta: 'Start with Manasa',
    },
    faq: {
      title: 'Questions merchants ask us',
      items: [
        ['Are there any extra fees?', 'The yearly plan covers the platform and every feature. The only other cost is the transaction fee your payment gateway charges.'],
        ['Can I use my own domain?', 'Yes. Connect any domain you own and we set up SSL for you.'],
        ['Which payment methods can I accept?', 'KNET, Visa and Mastercard, Apple Pay and Google Pay, plus buy-now-pay-later through Tabby, Tamara and Deema, depending on the gateway you choose.'],
        ['I already have a store. Can I move to Manasa?', 'Yes. Talk to us and we will help you move your products and customers.'],
        ['How long does it take to launch?', 'Most stores go live within days once products and the payment gateway are ready.'],
      ],
    },
    contact: {
      title: 'Tell us about your store',
      sub: 'We reply within one working day, in Arabic or English.',
      name: 'Your name', namePh: 'e.g. Sarah Al-Ali',
      phone: 'Phone or WhatsApp', phonePh: '9xxxxxxx',
      email: 'Email (optional)', emailPh: 'name@company.com',
      business: 'What do you sell?', businessPh: 'Perfumes, food, electronics…',
      message: 'Anything else?', messagePh: 'Your current website, number of products, launch date…',
      send: 'Send message', sending: 'Sending…',
      done: 'Thanks. We received your message and will contact you soon.',
      err: { name: 'Please enter your name.', contact: 'Add a phone number or an email so we can reach you.', email: 'Check the email address.', rate: 'Too many messages. Please try again in a few minutes.', other: 'The message did not send. Check your connection and try again.' },
      direct: 'Prefer to talk now?',
      whatsapp: 'Chat on WhatsApp',
      emailUs: 'Email us',
      waText: 'Hello, I would like to know more about Manasa.',
    },
    footer: { by: 'by Teknulugy', rights: 'All rights reserved.' },
  },
  ar: {
    nav: { features: 'المزايا', integrations: 'الربط', apps: 'التطبيقات', templates: 'القوالب', pricing: 'الأسعار', faq: 'الأسئلة', contact: 'تواصل' },
    langSwitch: 'English',
    cta: 'احجز عرضًا مجانيًا',
    hero: {
      title: 'متجرك الإلكتروني جاهز خلال أيام.',
      sub: 'منصّة هي منصة التجارة الإلكترونية المصممة للكويت والخليج. اشتراك سنوي واحد وكل المزايا بلا حدود: المنتجات، الطلبات، الموظفين، الدفع والقوالب.',
      primary: 'احجز عرضًا مجانيًا',
      secondary: 'شاهد القوالب',
      priceA: 'سنويًا',
      priceB: 'كل شيء بلا حدود',
    },
    clients: 'متاجر تعمل على منصّة',
    integrations: {
      title: 'مربوطة بالخدمات التي يستخدمها عملاؤك',
      sub: 'الدفع والتوصيل والتسويق وأنظمة الإدارة تتصل بمتجرك مباشرة. اختر مجموعة لترى ما تشمله.',
      groups: { payments: 'الدفع', shipping: 'التوصيل', marketing: 'التسويق', operations: 'الإدارة' },
      core: 'متجرك',
    },
    features: {
      title: 'كل شيء مشمول. بدون أي حدود.',
      unlimitedTitle: 'بلا حدود في كل متجر',
      unlimited: ['المنتجات وخياراتها', 'الطلبات', 'حسابات الموظفين', 'الفروع والمخازن', 'التخزين والبيانات'],
      list: [
        ['lang', 'عربي وإنجليزي', 'واجهة عربية كاملة من اليمين لليسار، يختارها كل عميل.'],
        ['card', 'كي نت والبطاقات وApple Pay', 'استقبل المدفوعات المحلية والدولية عبر بوابة الدفع التي تختارها.'],
        ['truck', 'مناطق ومواعيد التوصيل', 'حدد سعر التوصيل لكل منطقة ودع العميل يختار الموعد.'],
        ['tag', 'كوبونات وعروض وباقات', 'خصومات، توصيل مجاني فوق مبلغ معين، وعروض الباقات.'],
        ['globe', 'نطاقك الخاص', 'اربط اسم النطاق الخاص بك مع شهادة SSL.'],
        ['chart', 'البكسلات والتقارير', 'تتبع Meta وTikTok وSnapchat وGoogle مع تقارير المبيعات.'],
        ['box', 'مخزون دقيق دائمًا', 'مخزون لكل فرع، تنبيهات نقص الكمية وربط مع Teknulugy ERP.'],
        ['coins', 'الدفع بعدة عملات', 'اعرض الأسعار بالدينار والريال والدرهم وغيرها.'],
      ],
    },
    apps: {
      title: 'منصة واحدة وثلاث أدوات لإدارتها',
      sub: 'كل متجر على منصّة يحصل على الأدوات الثلاث.',
      items: [
        ['لوحة التحكم', 'المبيعات والطلبات والمخزون والحسابات في مكان واحد، مع تقارير قابلة للتصدير.'],
        ['لوحة الإدارة', 'أضف المنتجات، جهّز الطلبات، وأدر العملاء والكوبونات وصلاحيات الموظفين.'],
        ['تطبيق الجوال', 'متجرك على iPhone وAndroid مع إشعارات فورية بالطلبات لفريقك.'],
      ],
      notif: ['طلب جديد', 'تم الدفع عبر كي نت', 'خرج للتوصيل'],
    },
    steps: {
      title: 'من التسجيل إلى أول طلب',
      items: [
        ['اختر قالبًا', 'ابدأ بتصميم مناسب لنوع متجرك وعدّله كما تحب.'],
        ['أضف المنتجات والدفع', 'ارفع منتجاتك واربط كي نت أو بوابة الدفع. فريقنا يساعدك في الإعداد.'],
        ['أطلق متجرك', 'انطلق على نطاقك وابدأ باستقبال الطلبات في نفس الأسبوع.'],
      ],
    },
    templates: { title: 'ابدأ بقالب مصمم لنشاطك', sub: 'كل القوالب تعمل بالعربي والإنجليزي ومشمولة في الاشتراك.', view: 'شاهد العرض' },
    pricing: {
      title: 'باقة واحدة. سعر واحد.',
      lead: 'السعر نفسه سواء بعت عشرة منتجات أو عشرة آلاف. لا باقات تتجاوزها ولا إضافات مدفوعة.',
      per: 'سنويًا',
      note: 'يُدفع سنويًا. بوابات الدفع تحتسب رسوم المعاملات الخاصة بها.',
      items: ['منتجات وطلبات وموظفين بلا حدود', 'كل القوالب والربط مع الخدمات', 'واجهة متجر بالعربي والإنجليزي', 'لوحة التحكم ولوحة الإدارة وتطبيق الجوال', 'نطاق خاص وشهادة SSL', 'مساعدة في الإعداد من فريق Teknulugy'],
      cta: 'ابدأ مع منصّة',
    },
    faq: {
      title: 'أسئلة يطرحها التجار علينا',
      items: [
        ['هل توجد رسوم إضافية؟', 'الاشتراك السنوي يشمل المنصة وكل المزايا. التكلفة الأخرى الوحيدة هي رسوم المعاملات التي تحتسبها بوابة الدفع.'],
        ['هل أستطيع استخدام نطاقي الخاص؟', 'نعم. اربط أي نطاق تملكه ونحن نجهّز شهادة SSL.'],
        ['ما طرق الدفع المتاحة؟', 'كي نت، فيزا وماستركارد، Apple Pay وGoogle Pay، والدفع لاحقًا عبر تابي وتمارا وديمة حسب بوابة الدفع التي تختارها.'],
        ['لدي متجر حاليًا، هل أستطيع الانتقال إلى منصّة؟', 'نعم. تواصل معنا وسنساعدك في نقل منتجاتك وعملائك.'],
        ['كم يستغرق إطلاق المتجر؟', 'أغلب المتاجر تنطلق خلال أيام بعد تجهيز المنتجات وبوابة الدفع.'],
      ],
    },
    contact: {
      title: 'أخبرنا عن متجرك',
      sub: 'نرد خلال يوم عمل واحد، بالعربي أو الإنجليزي.',
      name: 'الاسم', namePh: 'مثال: سارة العلي',
      phone: 'الهاتف أو واتساب', phonePh: '9xxxxxxx',
      email: 'البريد الإلكتروني (اختياري)', emailPh: 'name@company.com',
      business: 'ماذا تبيع؟', businessPh: 'عطور، أغذية، إلكترونيات…',
      message: 'تفاصيل أخرى؟', messagePh: 'موقعك الحالي، عدد المنتجات، موعد الإطلاق…',
      send: 'أرسل الرسالة', sending: 'جارٍ الإرسال…',
      done: 'شكرًا لك. استلمنا رسالتك وسنتواصل معك قريبًا.',
      err: { name: 'الرجاء كتابة الاسم.', contact: 'أضف رقم هاتف أو بريدًا إلكترونيًا لنتواصل معك.', email: 'تأكد من البريد الإلكتروني.', rate: 'رسائل كثيرة. حاول مرة أخرى بعد دقائق.', other: 'لم تُرسل الرسالة. تحقق من الاتصال وحاول مرة أخرى.' },
      direct: 'تفضّل التواصل مباشرة؟',
      whatsapp: 'تواصل عبر واتساب',
      emailUs: 'راسلنا بالبريد',
      waText: 'مرحبًا، أود معرفة المزيد عن منصّة.',
    },
    footer: { by: 'من Teknulugy', rights: 'جميع الحقوق محفوظة.' },
  },
};

const LangCtx = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('manasa_lang');
      if (saved) return saved;
    } catch { /* storage blocked */ }
    return (navigator.language || 'en').startsWith('ar') ? 'ar' : 'en';
  });
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try { localStorage.setItem('manasa_lang', lang); } catch { /* ignore */ }
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: T[lang] }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
