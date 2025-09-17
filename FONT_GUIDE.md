# دليل الخط السعودي - Saudi Font

## 📝 الخط المُطبق

تم تطبيق الخط السعودي (Saudi Font) على جميع عناصر الصفحة:

### 🔤 أنواع الخطوط المتاحة:
- **Saudi-Regular.ttf** - للاستخدام العادي (font-weight: 400)
- **Saudi-Bold.ttf** - للعناوين والنصوص المهمة (font-weight: 700)

### 📁 مسار الملفات:
```
assest/font/
├── Saudi-Regular.ttf
└── Saudi-Bold.ttf
```

## 🎨 التطبيق في الكود

### 1. تعريف الخطوط (Font Face):
```css
@font-face {
    font-family: 'Saudi';
    src: url('assest/font/Saudi-Regular.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Saudi';
    src: url('assest/font/Saudi-Bold.ttf') format('truetype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}
```

### 2. إعدادات Tailwind:
```javascript
fontFamily: {
    'saudi': ['Saudi', 'Tajawal', 'sans-serif'],
    'tajawal': ['Tajawal', 'sans-serif'],
}
```

### 3. الفئات المخصصة:
```css
.saudi-bold {
    font-family: 'Saudi', 'Tajawal', sans-serif;
    font-weight: 700;
}

.saudi-regular {
    font-family: 'Saudi', 'Tajawal', sans-serif;
    font-weight: 400;
}
```

## 📋 العناصر المُطبقة عليها الخط:

### ✅ العناوين الرئيسية:
- عنوان الشركة الرئيسي
- جميع العناوين الفرعية (تابعنا، تسوق معنا، إلخ)

### ✅ النصوص:
- النص الوصفي للشركة
- نصوص الأزرار
- نصوص الفوتر

### ✅ الأزرار:
- أزرار مواقع التواصل الاجتماعي
- أزرار التطبيقات
- أزرار الخدمات

## 🔧 كيفية التعديل:

### تغيير الخط:
```html
<!-- للعناوين -->
<h1 class="saudi-bold text-2xl">عنوان</h1>

<!-- للنصوص العادية -->
<p class="saudi-regular text-base">نص عادي</p>
```

### إضافة خط جديد:
1. ضع ملف الخط في `assest/font/`
2. أضف `@font-face` في CSS
3. أضف الفئة في Tailwind config
4. طبق الفئة على العناصر المطلوبة

## 🎯 المميزات:

- ✅ **خط عربي أصيل**: مصمم خصيصاً للعربية
- ✅ **وضوح عالي**: يظهر بوضوح على جميع الأجهزة
- ✅ **تحسين الأداء**: `font-display: swap` للتحميل السريع
- ✅ **دعم متعدد الأوزان**: Regular و Bold
- ✅ **احتياطي آمن**: Tajawal كخط احتياطي

## 📱 التوافق:

- ✅ **جميع المتصفحات**: Chrome, Firefox, Safari, Edge
- ✅ **جميع الأجهزة**: كمبيوتر، تابلت، جوال
- ✅ **جميع أنظمة التشغيل**: Windows, macOS, Linux, iOS, Android

---

**تم التطوير بـ ❤️ لفريق عطارة فيفا**
