# MAWJA — وثيقة المرحلة الخامسة: محرك الدفع اليدوي والتحقق الإداري (PHASE 05)

## 1. نظرة عامة والمعمارية (Overview & Architecture)

تم في هذه المرحلة بناء وتأمين محرك الدفع اليدوي الكامل لمنصة **MAWJA التعليمية** وفق نموذج التحويل الخارجي (Off-Platform Manual Payment) المناسب للسوق الجزائري (BaridiMob، CCP، Virement Bancaire، والدفع نقداً في المقر).

المنصة لا تعالج المعاملات المالية إلكترونياً أو تلقائياً (Zero Payment Gateway)، وإنما تدير دورة حياة الطلبات، لقطات الأسعار غير القابلة للتلاعب، إثباتات الدفع في وسائط التخزين الخاصة، التحقق الإداري الذري، وتفعيل التسجيلات فور الاعتماد مع التوثيق الكامل في سجلات العمليات.

---

## 2. دورة حياة الطلب وإثبات الدفع (State Machines)

### دورة حياة الطلب (Order State Machine)
```
[Course Catalog]
      │
      ▼
 student_create_manual_order()
      │
      ▼
PENDING_PAYMENT ── (student_cancel_order) ──► CANCELLED
      │
      ▼ (student_submit_payment_proof)
PROOF_SUBMITTED ◄───────────────────────────────┐
      │                                         │ (Re-submit Proof)
      ├── (admin_approve_payment) ──► APPROVED  │
      │                                         │
      └── (admin_reject_payment)  ──► REJECTED ─┘
```

### دورة حياة إثبات الدفع (Payment Proof State Machine)
```
[Upload to private-proofs]
      │
      ▼
   PENDING
      │
      ├── (admin_approve_payment) ──► APPROVED (Active Enrollment Granted)
      │
      └── (admin_reject_payment)  ──► REJECTED (With Mandatory Reason)
```

---

## 3. المكونات البرمجية المنفذة (Implemented Components)

### أ. طبقة قاعدة البيانات والدوال الأمنية (PostgreSQL & Database Layer)
- **ملف الترحيل**: `supabase/migrations/00006_manual_payment_functions.sql`
- **دالة `student_create_manual_order` (SECURITY DEFINER)**:
  - التحقق الصارم من المستخدم والدور (`STUDENT`).
  - أخذ لقطة السعر الحقيقية والموثوقة مباشرة من `courses.price` وتثبيتها في `orders.total_amount` و `order_items.unit_price`.
  - الحماية من الطلبات المكررة: إرجاع الطلب السابق المعلق بدلاً من إنشاء طلب مكرر لنفس الدورة.
- **دالة `student_cancel_order` (SECURITY DEFINER)**:
  - التحقق من ملكية الطالب للطلب وعدم إمكانية الإلغاء إلا إذا كانت الحالة `PENDING_PAYMENT`.
- **دالة `student_submit_payment_proof` (SECURITY DEFINER)**:
  - التحقق من ملكية الطالب للطلب، إنشاء سجل الإثبات بحالة `PENDING`، وتحويل حالة الطلب وطلب الدفع إلى `PROOF_SUBMITTED`.
- **إجراءات الاعتماد والرفض الإدارية الذرية (`admin_approve_payment` و `admin_reject_payment`)**:
  - فحص رتبة المدير (`is_admin()`).
  - الاعتماد الذري الشامل: تحديث الإثبات، تحديث طلب الدفع، تحديث الطلب، وتفعيل التسجيل `ACTIVE` عبر `ON CONFLICT (student_id, course_id) DO UPDATE` لمنع أي ازدواجية نهائياً.
  - التوثيق التلقائي في جدول `admin_audit_logs`.

### ب. طبقة التهيئة والأمان (Configuration & Validation)
- `src/lib/payment-methods.ts`: طبقة مركزية لتهيئة وسائل الدفع الجزائرية مع قراءة المعرفات الحساسة (RIP، CCP، RIB) من المتغيرات البيئية بأمان ومنع تسريبها للكلاينت.
- `src/lib/validations/payment.ts`: مخططات Zod للتحقق الصارم من المدخلات وصيغ الملفات وحجمها وأسباب الرفض.
- `src/lib/payments.ts`: مكتبة استعلامات قاعدة البيانات المكتوبة بأنماط TypeScript صارمة خالية من أي `any`، وتوليد روابط المعاينة المؤقتة المشفرة ذات الصلاحية المحدودة (60 دقيقة) من حاوية `private-proofs`.

### ج. واجهات المستخدم والصفحات (UI & Pages)
1. **كتالوج وتفاصيل الدورة (`src/app/courses/[slug]/page.tsx` & `EnrollButton`)**:
   - زر "سجل الآن في الدورة" تفاعلي يفتح نافذة اختيار وسيلة الدفع وإنشاء الطلب، أو يوجه للدخول إذا لم يكن مسجلاً، أو يعرض وصولاً مباشراً لمساحة التعلّم إذا كان مسجلاً بالفعل.
2. **سجل طلبات ومدفوعات الطالب (`src/app/student/orders/page.tsx`)**:
   - متابعة حالات كافة الطلبات، بطاقات الإحصائيات، شارات الحالات باللغة العربية، وأزرار الانتقال لرفع الإثبات أو إلغاء الطلب.
3. **صفحة تعليمات الدفع ورفع الوصل (`src/app/student/orders/[orderId]/payment/page.tsx`)**:
   - عرض المبلغ المالي الدقيق، معلومات الحساب المستلم، خطوات التحويل، نموذج رفع صورة الوصل الآمن مع حماية الحجم (<= 10MB) والصيغ، وتتبع تقدم المراجعة.
4. **مساحة تعلّم الطالب ودوراتي (`src/app/student/my-courses/page.tsx`)**:
   - عرض الدورات المعتمدة والمفتوحة فقط مع بطاقات تقدم الدروس.
5. **مشغل الدروس المحمي (`src/app/student/my-courses/[courseId]/learn/page.tsx`)**:
   - فحص أمني صارم للتسجيل النشط (`ACTIVE enrollment`) ومنع أي وصول غير مصرح به.
6. **لوحة مراجعة وتدقيق المدفوعات للإدارة (`src/app/admin/payments/page.tsx`)**:
   - لوحة إشرافية متكاملة لفرز الإثباتات المعلقة، المعتمدة، والمرفوضة مع إحصائيات دقيقة.
7. **معاينة الإثبات والقرار الإداري (`src/app/admin/payments/[paymentProofId]/page.tsx`)**:
   - معاينة آمنة لوصل التحويل، فحص بيانات المرسل ورقم العملية، واعتماد الدفع أو رفضه مع كتابة سبب إلزامي.

---

## 4. نتائج الفحص البرمجي (Verification Results)
- `npm run typecheck`: **PASS (0 errors)**.
- `npm run lint`: **PASS (0 warnings, 0 errors)**.
- `npm run build`: **PASS (100% Production Build, 27 routes compiled successfully)**.
