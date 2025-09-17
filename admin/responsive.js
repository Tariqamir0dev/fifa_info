/**
 * ملف التوافق مع الأجهزة المختلفة - لوحة تحكم عطارة فيفا
 * يضمن التوافق مع جميع أحجام الشاشات والأجهزة
 */

class ResponsiveManager {
    constructor() {
        this.breakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1280
        };
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.init();
    }

    /**
     * تهيئة مدير الاستجابة
     */
    init() {
        this.setupResizeListener();
        this.setupTouchSupport();
        this.setupKeyboardNavigation();
        this.optimizeForDevice();
    }

    /**
     * الحصول على نقطة التوقف الحالية
     */
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width < this.breakpoints.mobile) return 'mobile';
        if (width < this.breakpoints.tablet) return 'tablet';
        if (width < this.breakpoints.desktop) return 'desktop';
        return 'large';
    }

    /**
     * إعداد مستمع تغيير حجم الشاشة
     */
    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newBreakpoint = this.getCurrentBreakpoint();
                if (newBreakpoint !== this.currentBreakpoint) {
                    this.currentBreakpoint = newBreakpoint;
                    this.handleBreakpointChange();
                }
            }, 250);
        });
    }

    /**
     * التعامل مع تغيير نقطة التوقف
     */
    handleBreakpointChange() {
        this.updateLayout();
        this.updateNavigation();
        this.updateModals();
        this.updateTables();
    }

    /**
     * تحديث التخطيط
     */
    updateLayout() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.flex-1');

        if (this.currentBreakpoint === 'mobile') {
            // في الشاشات الصغيرة، إخفاء الشريط الجانبي افتراضياً
            if (sidebar) {
                sidebar.classList.remove('lg:translate-x-0');
                sidebar.classList.add('-translate-x-full');
            }
        } else {
            // في الشاشات الكبيرة، إظهار الشريط الجانبي
            if (sidebar) {
                sidebar.classList.add('lg:translate-x-0');
                sidebar.classList.remove('-translate-x-full');
            }
        }
    }

    /**
     * تحديث التنقل
     */
    updateNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            if (this.currentBreakpoint === 'mobile') {
                // في الشاشات الصغيرة، إضافة مساحة أكبر للنقر
                item.classList.add('py-4');
            } else {
                item.classList.remove('py-4');
            }
        });
    }

    /**
     * تحديث النوافذ المنبثقة
     */
    updateModals() {
        const modal = document.getElementById('modal-overlay');
        if (!modal) return;

        if (this.currentBreakpoint === 'mobile') {
            // في الشاشات الصغيرة، جعل النافذة المنبثقة تأخذ كامل الشاشة
            modal.classList.add('p-0');
            const modalContent = document.getElementById('modal-content');
            if (modalContent) {
                modalContent.classList.add('rounded-none', 'h-full', 'max-h-screen');
            }
        } else {
            modal.classList.remove('p-0');
            const modalContent = document.getElementById('modal-content');
            if (modalContent) {
                modalContent.classList.remove('rounded-none', 'h-full', 'max-h-screen');
            }
        }
    }

    /**
     * تحديث الجداول
     */
    updateTables() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            if (this.currentBreakpoint === 'mobile') {
                // في الشاشات الصغيرة، تحويل الجداول إلى بطاقات
                this.convertTableToCards(table);
            }
        });
    }

    /**
     * تحويل الجدول إلى بطاقات
     */
    convertTableToCards(table) {
        if (table.dataset.converted === 'true') return;

        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'space-y-4';

        rows.forEach(row => {
            const card = document.createElement('div');
            card.className = 'bg-white border border-gray-200 rounded-lg p-4';

            const cells = Array.from(row.querySelectorAll('td'));
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    const field = document.createElement('div');
                    field.className = 'mb-2';
                    field.innerHTML = `
                        <span class="text-sm font-bold text-gray-600 saudi-bold">${headers[index]}:</span>
                        <span class="text-sm text-gray-800 saudi-regular mr-2">${cell.textContent}</span>
                    `;
                    card.appendChild(field);
                }
            });

            // إضافة أزرار الإجراءات
            const actions = row.querySelector('.actions');
            if (actions) {
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'flex justify-end space-x-2 space-x-reverse mt-3 pt-3 border-t border-gray-100';
                actionsDiv.innerHTML = actions.innerHTML;
                card.appendChild(actionsDiv);
            }

            cardsContainer.appendChild(card);
        });

        table.parentNode.replaceChild(cardsContainer, table);
        table.dataset.converted = 'true';
    }

    /**
     * إعداد دعم اللمس
     */
    setupTouchSupport() {
        // تحسين تجربة اللمس للأجهزة المحمولة
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
            
            // إضافة تأثيرات اللمس
            const touchElements = document.querySelectorAll('button, .nav-item, .card');
            touchElements.forEach(element => {
                element.addEventListener('touchstart', () => {
                    element.classList.add('touch-active');
                });
                
                element.addEventListener('touchend', () => {
                    setTimeout(() => {
                        element.classList.remove('touch-active');
                    }, 150);
                });
            });
        }
    }

    /**
     * إعداد التنقل بالكيبورد
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // التنقل بين الأقسام باستخدام الأسهم
            if (e.altKey) {
                switch (e.key) {
                    case 'ArrowRight':
                        e.preventDefault();
                        this.navigateToNextSection();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.navigateToPreviousSection();
                        break;
                }
            }

            // إغلاق النوافذ المنبثقة بالضغط على Escape
            if (e.key === 'Escape') {
                const modal = document.getElementById('modal-overlay');
                if (modal && !modal.classList.contains('hidden')) {
                    adminApp.hideModal();
                }
            }
        });
    }

    /**
     * التنقل إلى القسم التالي
     */
    navigateToNextSection() {
        const sections = ['dashboard', 'content', 'branches', 'social', 'settings', 'preview'];
        const currentIndex = sections.indexOf(adminApp.currentSection);
        const nextIndex = (currentIndex + 1) % sections.length;
        adminApp.showSection(sections[nextIndex]);
    }

    /**
     * التنقل إلى القسم السابق
     */
    navigateToPreviousSection() {
        const sections = ['dashboard', 'content', 'branches', 'social', 'settings', 'preview'];
        const currentIndex = sections.indexOf(adminApp.currentSection);
        const prevIndex = currentIndex === 0 ? sections.length - 1 : currentIndex - 1;
        adminApp.showSection(sections[prevIndex]);
    }

    /**
     * تحسين الأداء للأجهزة المختلفة
     */
    optimizeForDevice() {
        // تقليل الرسوم المتحركة للأجهزة البطيئة
        if (this.isLowEndDevice()) {
            document.body.classList.add('reduced-motion');
        }

        // تحسين الخطوط للأجهزة المختلفة
        this.optimizeFonts();
    }

    /**
     * التحقق من كون الجهاز منخفض الأداء
     */
    isLowEndDevice() {
        // فحص ذاكرة الجهاز
        if (navigator.deviceMemory && navigator.deviceMemory <= 2) {
            return true;
        }

        // فحص عدد المعالجات
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
            return true;
        }

        return false;
    }

    /**
     * تحسين الخطوط
     */
    optimizeFonts() {
        const isRetina = window.devicePixelRatio > 1;
        
        if (isRetina) {
            // استخدام خطوط عالية الجودة للشاشات عالية الدقة
            document.body.classList.add('high-dpi');
        }

        // تحسين الخطوط العربية
        if (this.currentBreakpoint === 'mobile') {
            document.body.classList.add('mobile-fonts');
        }
    }

    /**
     * إعداد التمرير السلس
     */
    setupSmoothScrolling() {
        // إضافة التمرير السلس للروابط الداخلية
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * إعداد التحميل التدريجي للصور
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    /**
     * إعداد التخزين المحلي
     */
    setupLocalStorage() {
        // حفظ تفضيلات المستخدم
        const userPreferences = {
            sidebarCollapsed: false,
            theme: 'light',
            language: 'ar'
        };

        // تحميل التفضيلات المحفوظة
        const savedPreferences = localStorage.getItem('fyfa-admin-preferences');
        if (savedPreferences) {
            Object.assign(userPreferences, JSON.parse(savedPreferences));
        }

        // تطبيق التفضيلات
        this.applyUserPreferences(userPreferences);
    }

    /**
     * تطبيق تفضيلات المستخدم
     */
    applyUserPreferences(preferences) {
        if (preferences.sidebarCollapsed) {
            document.getElementById('sidebar')?.classList.add('collapsed');
        }

        if (preferences.theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    /**
     * إعداد إشعارات المتصفح
     */

    setupNotifications() {
        if ('Notification' in window && Notification.permission === 'default') {
            // طلب إذن الإشعارات
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('تم منح إذن الإشعارات');
                }
            });
        }
    }

    /**
     * إعداد خدمة العامل (Service Worker)
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/admin/sw.js')
                    .then(registration => {
                        console.log('تم تسجيل Service Worker:', registration);
                    })
                    .catch(error => {
                        console.log('فشل في تسجيل Service Worker:', error);
                    });
            });
        }
    }
}

// تهيئة مدير الاستجابة
let responsiveManager;
document.addEventListener('DOMContentLoaded', () => {
    responsiveManager = new ResponsiveManager();
});

// إضافة أنماط CSS للاستجابة
const responsiveStyles = `
    /* أنماط الأجهزة المحمولة */
    @media (max-width: 768px) {
        .touch-device button:active,
        .touch-device .nav-item:active,
        .touch-device .card:active {
            transform: scale(0.95);
            transition: transform 0.1s ease;
        }

        .mobile-fonts {
            font-size: 16px;
            line-height: 1.6;
        }

        .modal-mobile {
            padding: 0;
        }

        .modal-mobile .modal-content {
            border-radius: 0;
            height: 100vh;
            max-height: 100vh;
        }
    }

    /* أنماط الشاشات عالية الدقة */
    .high-dpi {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    /* تقليل الحركة للأجهزة البطيئة */
    .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }

    /* أنماط الوضع المظلم */
    .dark-theme {
        background-color: #1f2937;
        color: #f9fafb;
    }

    .dark-theme .card {
        background-color: #374151;
        border-color: #4b5563;
    }

    /* أنماط التمرير المخصص */
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
`;

// إضافة الأنماط إلى الصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = responsiveStyles;
document.head.appendChild(styleSheet);
