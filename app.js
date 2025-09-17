/**
 * عطارة فيفا - تطبيق الواجهة التفاعلية
 * تطوير: فريق عطارة فيفا - م. طارق عامر
 */

class FyfaApp {
    constructor() {
        this.data = null;
        this.init();
    }

    /**
     * تهيئة التطبيق
     */
    async init() {
        try {
            await this.loadData();
            this.renderSocialLinks();
            this.renderShoppingLinks();
            this.renderAppLinks();
            this.renderBranches();
            this.renderContactButtons();
            this.setupEventListeners();
            this.showToast('مرحباً بك في عطارة فيفا! 🌿', 'success');
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            this.showToast('حدث خطأ في تحميل البيانات', 'error');
        }
    }

    /**
     * تحميل البيانات من ملف JSON
     */
    async loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            throw error;
        }
    }

    /**
     * عرض روابط وسائل التواصل الاجتماعي
     */
    renderSocialLinks() {
        const container = document.getElementById('social-links');
        if (!container || !this.data?.socialMedia) return;

        container.innerHTML = this.data.socialMedia.map(social => `
            <a href="${social.url}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="social-icon w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
               title="${social.name}">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="${social.icon}"/>
                </svg>
            </a>
        `).join('');
    }

    /**
     * عرض روابط التسوق
     */
    renderShoppingLinks() {
        const container = document.getElementById('shopping-links');
        if (!container || !this.data?.shopping) return;

        container.innerHTML = this.data.shopping.map(shop => `
            <a href="${shop.url}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="btn-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 space-x-reverse hover:shadow-lg transition-all duration-300">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${shop.icon}"/>
                </svg>
                <span>${shop.name}</span>
            </a>
        `).join('');
    }

    /**
     * عرض روابط التطبيقات
     */
    renderAppLinks() {
        const container = document.getElementById('app-links');
        if (!container || !this.data?.apps) return;

        container.innerHTML = this.data.apps.map(app => `
            <a href="${app.url}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="btn-secondary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 space-x-reverse hover:shadow-lg transition-all duration-300">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="${app.icon}"/>
                </svg>
                <span>${app.name}</span>
            </a>
        `).join('');
    }

    /**
     * عرض الفروع مع Accordion
     */
    renderBranches() {
        const container = document.getElementById('branches-container');
        if (!container || !this.data?.branches) return;

        container.innerHTML = this.data.branches.map((branch, index) => `
            <div class="branch-card bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <button class="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                        onclick="fyfaApp.toggleBranch(${index})"
                        id="branch-btn-${index}">
                    <div class="flex items-center space-x-3 space-x-reverse">
                        <div class="w-3 h-3 bg-secondary rounded-full"></div>
                        <div>
                            <h3 class="text-lg font-semibold text-primary">${branch.name}</h3>
                            <p class="text-sm text-gray-600">${branch.address}</p>
                        </div>
                    </div>
                    <svg class="w-5 h-5 text-gray-400 transition-transform duration-300" 
                         id="branch-icon-${index}"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                
                <div class="accordion-content" id="branch-content-${index}">
                    <div class="px-6 pb-4 space-y-3">
                        <a href="tel:${branch.phone}" 
                           class="w-full bg-primary text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            <span>اتصال</span>
                        </a>
                        
                        <button onclick="fyfaApp.openMaps('${branch.coordinates.lat}', '${branch.coordinates.lng}', '${branch.name}')"
                                class="w-full bg-secondary text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span>الاتجاهات</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * عرض أزرار التواصل
     */
    renderContactButtons() {
        const container = document.getElementById('contact-buttons');
        if (!container || !this.data?.contact) return;

        container.innerHTML = `
            <a href="https://wa.me/${this.data.contact.whatsapp.number.replace('+', '')}?text=${encodeURIComponent(this.data.contact.whatsapp.message)}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="contact-button bg-contact-secondary hover-bg-contact-luxury-gold text-white px-6 py-4 rounded-xl saudi-bold text-center flex items-center justify-center space-x-3 space-x-reverse hover:shadow-lg">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>تواصل عبر WhatsApp</span>
            </a>
            
            <a href="tel:${this.data.contact.phone}" 
               class="contact-button bg-contact-primary hover-bg-contact-secondary text-white px-6 py-4 rounded-xl saudi-bold text-center flex items-center justify-center space-x-3 space-x-reverse hover:shadow-lg">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span>اتصال مباشر</span>
            </a>
        `;
    }

    /**
     * تبديل حالة الفرع (فتح/إغلاق)
     */
    toggleBranch(index) {
        const content = document.getElementById(`branch-content-${index}`);
        const icon = document.getElementById(`branch-icon-${index}`);
        
        if (!content || !icon) return;

        const isActive = content.classList.contains('active');
        
        // إغلاق جميع الفروع الأخرى
        document.querySelectorAll('.accordion-content.active').forEach(item => {
            if (item.id !== `branch-content-${index}`) {
                item.classList.remove('active');
                const otherIndex = item.id.split('-')[2];
                const otherIcon = document.getElementById(`branch-icon-${otherIndex}`);
                if (otherIcon) {
                    otherIcon.style.transform = 'rotate(0deg)';
                }
            }
        });

        // تبديل الفرع الحالي
        if (isActive) {
            content.classList.remove('active');
            icon.style.transform = 'rotate(0deg)';
        } else {
            content.classList.add('active');
            icon.style.transform = 'rotate(180deg)';
        }
    }

    /**
     * فتح خرائط جوجل
     */
    openMaps(lat, lng, branchName) {
        // البحث عن "عطارة فيفا" في خرائط جوجل
        const searchQuery = encodeURIComponent('عطارة فيفا');
        const url = `https://www.google.com/maps/search/${searchQuery}`;
        window.open(url, '_blank');
        this.showToast(`جاري فتح خرائط جوجل للبحث عن عطارة فيفا`, 'info');
    }

    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // إضافة تأثيرات hover للأزرار
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('a[href^="tel:"]')) {
                this.showToast('اضغط للاتصال', 'info');
            }
        });

        // إضافة تأثيرات للنقر على الروابط
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="http"]')) {
                this.showToast('جاري فتح الرابط...', 'info');
            }
        });
    }

    /**
     * تبديل قسم الشركة
     */
    toggleDepartment(departmentId) {
        const content = document.getElementById(`${departmentId}-content`);
        const icon = document.getElementById(`${departmentId}-icon`);
        
        if (!content || !icon) return;
        
        const isHidden = content.classList.contains('hidden');
        
        // إغلاق جميع الأقسام الأخرى أولاً
        const allContents = document.querySelectorAll('.department-content');
        const allIcons = document.querySelectorAll('[id$="-icon"]');
        
        allContents.forEach(c => {
            if (c.id !== `${departmentId}-content`) {
                c.classList.add('hidden');
                c.classList.remove('block');
            }
        });
        
        allIcons.forEach(i => {
            if (i.id !== `${departmentId}-icon`) {
                i.style.transform = 'rotate(0deg)';
            }
        });
        
        // تبديل القسم المحدد
        if (isHidden) {
            // إظهار المحتوى
            content.classList.remove('hidden');
            content.classList.add('block');
            icon.style.transform = 'rotate(180deg)';
        } else {
            // إخفاء المحتوى
            content.classList.add('hidden');
            content.classList.remove('block');
            icon.style.transform = 'rotate(0deg)';
        }
    }

    /**
     * عرض رسالة تنبيه
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        if (!toast || !toastMessage) return;

        // تحديد لون الرسالة حسب النوع
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };

        toast.className = `toast ${colors[type] || colors.info}`;
        toastMessage.textContent = message;
        toast.classList.add('show');

        // إخفاء الرسالة بعد 3 ثوان
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    /**
     * نسخ النص إلى الحافظة
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('تم نسخ الرابط!', 'success');
        } catch (error) {
            console.error('خطأ في النسخ:', error);
            this.showToast('فشل في نسخ الرابط', 'error');
        }
    }

    /**
     * تبديل قائمة المشاركة
     */
    toggleShareMenu() {
        const shareMenu = document.getElementById('shareMenu');
        if (shareMenu) {
            const isVisible = !shareMenu.classList.contains('opacity-0');
            
            if (isVisible) {
                // Hide menu
                shareMenu.classList.add('opacity-0', 'invisible', 'scale-95');
                shareMenu.classList.remove('opacity-100', 'visible', 'scale-100');
            } else {
                // Show menu
                shareMenu.classList.remove('opacity-0', 'invisible', 'scale-95');
                shareMenu.classList.add('opacity-100', 'visible', 'scale-100');
            }
        }
    }

    /**
     * تحسين الأداء - Lazy Loading للصور
     */
    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// تهيئة التطبيق عند تحميل الصفحة
let fyfaApp;
document.addEventListener('DOMContentLoaded', () => {
    fyfaApp = new FyfaApp();
    
    // إغلاق قائمة المشاركة عند النقر خارجها
    document.addEventListener('click', (event) => {
        const shareMenu = document.getElementById('shareMenu');
        const shareButton = event.target.closest('button[onclick*="toggleShareMenu"]');
        
        if (shareMenu && !shareButton && !shareMenu.contains(event.target)) {
            shareMenu.classList.add('opacity-0', 'invisible', 'scale-95');
            shareMenu.classList.remove('opacity-100', 'visible', 'scale-100');
        }
    });
});

// إضافة تأثيرات إضافية للصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تأثير التمرير السلس
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

    // تأثير الظل المتحرك للبطاقات
    const cards = document.querySelectorAll('.branch-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});

// إضافة دعم PWA (اختياري)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
