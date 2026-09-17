import type { PaymentMethod } from "@/types/database.types";

export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  nameEn: string;
  badge: string;
  enabled: boolean;
  accountHolder: string;
  accountIdentifier: string; // RIP, CCP number, RIB, etc.
  extraDetails?: Record<string, string>;
  instructions: string[];
  tips: string[];
}

/**
 * Centralized configuration for Algerian manual payment methods.
 * Sensitive identifiers can be configured via environment variables with safe defaults.
 */
export const PAYMENT_METHODS_CONFIG: Record<PaymentMethod, PaymentMethodConfig> = {
  BARIDIMOB: {
    id: "BARIDIMOB",
    name: "بريدي موب (BaridiMob)",
    nameEn: "BaridiMob Transfer",
    badge: "الأسرع والأسهل",
    enabled: true,
    accountHolder: process.env.MAWJA_BARIDIMOB_HOLDER || "MAWJA EDUCATION SARL",
    accountIdentifier: process.env.MAWJA_BARIDIMOB_RIP || "00799999002345678901",
    extraDetails: {
      "نوع الحساب": "حساب بريدي موب للمؤسسة",
    },
    instructions: [
      "افتح تطبيق بريدي موب (BaridiMob) على هاتفك.",
      "اختر تحويل الأموال (Virement)، ثم اختر التحويل عبر رقم الحساب البريدي (RIP).",
      "أدخل رقم الـ RIP الموضح بالأعلى وتأكد من مطابقة اسم المستفيد.",
      "أدخل المبلغ المحدد للدورة بدقة دون زيادة أو نقصان.",
      "أتمم التحويل واحتفظ بلقطة الشاشة (Screenshot) أو وصل العملية متضمناً رقم التحويل.",
      "عد إلى هذه الصفحة وارفع صورة الوصل وأدخل رقم العملية.",
    ],
    tips: [
      "تأكد من ظهور رقم العملية (N° de transaction) بوضوح في الوصل.",
      "يتم التحقق من التحويل وتفعيل الدورة يدوياً من طرف الإدارة خلال وقت قصير.",
    ],
  },
  CCP: {
    id: "CCP",
    name: "الحساب البريدي الجاري (CCP)",
    nameEn: "CCP Post Office",
    badge: "متاح في كل مكاتب البريد",
    enabled: true,
    accountHolder: process.env.MAWJA_CCP_HOLDER || "MAWJA EDUCATION SARL",
    accountIdentifier: process.env.MAWJA_CCP_ACCOUNT || "0023456789 Clé 45",
    extraDetails: {
      "رقم الحساب": process.env.MAWJA_CCP_NUMBER || "0023456789",
      "المفتاح (Clé)": process.env.MAWJA_CCP_KEY || "45",
    },
    instructions: [
      "توجه إلى أقرب مكتب بريد (Algérie Poste).",
      "املأ صك التحويل أو استمارة الدفع البريدي بمعلومات حساب MAWJA الموضحة بالأعلى.",
      "ادفع المبلغ المحدد للدورة لدى شباك البريد.",
      "احتفظ بالوصل الورقي المختوم من مكتب البريد.",
      "التقط صورة واضحة ومقروءة للوصل المختوم.",
      "ارفع صورة الوصل هنا في المنصة مع إدخال اسم المرسل ورقم العملية.",
    ],
    tips: [
      "احرص على أن يكون ختم مكتب البريد وتاريخ العملية واضحين تماماً في الصورة.",
      "تجنب استخدام الفلاش المباشر الذي قد يحجب أرقام الوصل.",
    ],
  },
  BANK_TRANSFER: {
    id: "BANK_TRANSFER",
    name: "تحويل بنكي (Virement Bancaire)",
    nameEn: "Bank Transfer",
    badge: "للشركات والتحويلات البنكية",
    enabled: true,
    accountHolder: process.env.MAWJA_BANK_HOLDER || "MAWJA EDUCATION SARL",
    accountIdentifier: process.env.MAWJA_BANK_RIB || "002 00099 9999999999 44",
    extraDetails: {
      "البنك": process.env.MAWJA_BANK_NAME || "Banque Nationale d'Algérie (BNA)",
      "اسم الوكالة": process.env.MAWJA_BANK_AGENCY || "Agence Alger Centre (00099)",
    },
    instructions: [
      "قم بإجراء تحويل بنكي عبر تطبيق بنكك الإلكتروني أو من خلال التوجه لوكالتك البنكية.",
      "استخدم رقم الحساب البنكي (RIB) الموضح بالأعلى لصالح مؤسسة MAWJA.",
      "في خانة البيان/الغرض (Motif)، اكتب رقم الطلب الخاص بك.",
      "احتفظ بإشعار التحويل البنكي (Avis d'opération).",
      "ارفع نسخة الإشعار بصيغة صورة أو ملف PDF في النموذج أدناه.",
    ],
    tips: [
      "قد تستغرق التحويلات البنكية بين البنوك المختلفة من 24 إلى 48 ساعة عمل لتظهر في كشف الحساب.",
    ],
  },
  CASH: {
    id: "CASH",
    name: "الدفع نقداً في المقر",
    nameEn: "Cash at Office",
    badge: "في مقر المنصة",
    enabled: process.env.MAWJA_ENABLE_CASH === "true",
    accountHolder: "مقر منصة موجة للتعليم",
    accountIdentifier: process.env.MAWJA_OFFICE_ADDRESS || "الجزائر العاصمة، الجزائر",
    extraDetails: {
      "أوقات الاستقبال": "من الأحد إلى الخميس، من 09:00 إلى 16:30",
      "الهاتف للتنسيق": process.env.MAWJA_CONTACT_PHONE || "0550 00 00 00",
    },
    instructions: [
      "توجه إلى مقر منصة موجة مصحوباً برقم الطلب الخاص بك.",
      "ادفع المبلغ نقداً لدى مكتب الاستقبال واحصل على وصل استلام رسمي ومختوم.",
      "ارفع صورة الوصل الرسمي لتأكيد الطلب فوراً من طرف الإدارة.",
    ],
    tips: [
      "يرجى إحضار رقم الطلب مطبوعاً أو على هاتفك لتسريع عملية الاستلام.",
    ],
  },
};

/**
 * Returns list of all enabled payment methods for public student selection
 */
export function getAvailablePaymentMethods(): PaymentMethodConfig[] {
  return Object.values(PAYMENT_METHODS_CONFIG).filter((method) => method.enabled);
}

/**
 * Returns configuration details for a specific payment method
 */
export function getPaymentMethodConfig(method: PaymentMethod): PaymentMethodConfig {
  return PAYMENT_METHODS_CONFIG[method] || PAYMENT_METHODS_CONFIG.BARIDIMOB;
}
