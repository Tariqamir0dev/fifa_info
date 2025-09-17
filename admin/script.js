/**
 * لوحة تحكم عطارة فيفا - ملف JavaScript
 * تطوير: فريق عطارة فيفا
 */

class AdminPanel {
    constructor() {
        this.data = null;
        this.currentSection = 'dashboard';
        this.hasUnsavedChanges = false;
        this.init();
    }

    /**
     * تهيئة لوحة التحكم
     */
    async init() {
        try {
            // التحقق من تسجيل الدخول أولاً
            if (!this.checkAuthentication()) {
                return;
            }
            
            await this.loadData();
            this.setupEventListeners();
            this.updateStats();
            this.hideLoadingScreen();
            
            // تحميل مخطط لوحة التحكم
            setTimeout(() => {
                this.loadDashboardChart();
            }, 100);
            this.showToast('تم تحميل لوحة التحكم بنجاح!', 'success');
        } catch (error) {
            console.error('خطأ في تحميل لوحة التحكم:', error);
            this.showToast('حدث خطأ في تحميل لوحة التحكم', 'error');
        }
    }

    /**
     * التحقق من تسجيل الدخول
     */
    checkAuthentication() {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        const currentUser = sessionStorage.getItem('adminUser');
        
        if (!isLoggedIn || !currentUser) {
            // إعادة توجيه لصفحة تسجيل الدخول
            window.location.href = 'login.html';
            return false;
        }
        
        // عرض معلومات المستخدم في الرأس
        this.displayUserInfo(currentUser);
        return true;
    }

    /**
     * عرض معلومات المستخدم
     */
    displayUserInfo(username) {
        // تحديث معلومات المستخدم في الشريط الجانبي فقط
        const sidebarUsername = document.getElementById('sidebar-username');
        if (sidebarUsername) {
            // تحسين عرض اسم المستخدم
            const displayName = this.getDisplayName(username);
            sidebarUsername.textContent = displayName;
            
            // إضافة تأثير ظهور
            sidebarUsername.style.opacity = '0';
            sidebarUsername.style.transform = 'translateY(10px)';
            setTimeout(() => {
                sidebarUsername.style.transition = 'all 0.3s ease';
                sidebarUsername.style.opacity = '1';
                sidebarUsername.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    /**
     * الحصول على اسم العرض المناسب للمستخدم
     */
    getDisplayName(username) {
        const displayNames = {
            'admin': 'المدير العام',
            'fyfa': 'عطارة فيفا',
            'manager': 'المدير',
            'user': 'المستخدم',
            'editor': 'المحرر'
        };
        
        return displayNames[username] || username;
    }

    /**
     * تسجيل الخروج
     */
    logout() {
        // إنشاء نافذة تأكيد مخصصة
        const confirmDialog = this.createLogoutConfirmDialog();
        document.body.appendChild(confirmDialog);
    }

    /**
     * إنشاء نافذة تأكيد تسجيل الخروج
     */
    createLogoutConfirmDialog() {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        overlay.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl p-6 mx-4 max-w-sm w-full">
                <div class="text-center">
                    <!-- أيقونة التحذير -->
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"/>
                        </svg>
                    </div>
                    
                    <!-- النص -->
                    <h3 class="text-lg saudi-bold text-gray-900 mb-2">تأكيد تسجيل الخروج</h3>
                    <p class="text-sm text-gray-600 saudi-regular mb-6">هل أنت متأكد من تسجيل الخروج؟ سيتم حفظ جميع التغييرات المحفوظة.</p>
                    
                    <!-- الأزرار -->
                    <div class="flex space-x-3 space-x-reverse">
                        <button id="cancelLogout" 
                                class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg saudi-regular hover:bg-gray-200 transition-colors duration-200">
                            إلغاء
                        </button>
                        <button id="confirmLogout" 
                                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg saudi-bold hover:bg-red-700 transition-colors duration-200">
                            تسجيل الخروج
                        </button>
                    </div>
                </div>
            </div>
        `;

        // إضافة مستمعي الأحداث
        const cancelBtn = overlay.querySelector('#cancelLogout');
        const confirmBtn = overlay.querySelector('#confirmLogout');

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        confirmBtn.addEventListener('click', () => {
            this.performLogout();
            document.body.removeChild(overlay);
        });

        // إغلاق عند النقر خارج النافذة
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });

        // إغلاق بمفتاح Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        return overlay;
    }

    /**
     * تنفيذ تسجيل الخروج
     */
    performLogout() {
        // حفظ التغييرات قبل الخروج (إذا كان هناك تغييرات غير محفوظة)
        if (this.hasUnsavedChanges) {
            this.showToast('جاري حفظ التغييرات...', 'info');
            this.saveChanges();
        }

        // إظهار رسالة التحميل
        this.showToast('جاري تسجيل الخروج...', 'info');

        // مسح بيانات الجلسة
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminData');
        sessionStorage.removeItem('adminChanges');

        // إظهار رسالة النجاح
        this.showToast('تم تسجيل الخروج بنجاح', 'success');

        // إعادة التوجيه بعد تأخير قصير
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }

    /**
     * تحميل البيانات من ملف JSON
     */
    async loadData() {
        try {
            const response = await fetch('../data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            // استخدام بيانات افتراضية في حالة فشل التحميل
            this.data = this.getDefaultData();
        }
    }

    /**
     * الحصول على بيانات افتراضية
     */
    getDefaultData() {
        return {
            company: {
                name: "شركة عطارة فيفا التجارية",
                description: "عطارة فيفا - أكثر من 45 عامًا من الخبرة في تقديم أفضل الأعشاب، البهارات، والمنتجات الغذائية."
            },
            branches: [],
            socialMedia: [],
            contact: {
                phone: "+966501234567",
                whatsapp: {
                    number: "+966501234567",
                    message: "مرحباً، أريد الاستفسار عن منتجات عطارة فيفا"
                }
            }
        };
    }

    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // إغلاق الشريط الجانبي عند النقر خارجه
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuButton = e.target.closest('button[onclick*="toggleSidebar"]');
            
            if (sidebar && !menuButton && !sidebar.contains(e.target) && window.innerWidth < 1024) {
                sidebar.classList.remove('mobile-open');
            }
        });

        // حفظ التغييرات عند الضغط على Ctrl+S
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveChanges();
            }
        });

        // تحذير عند مغادرة الصفحة مع تغييرات غير محفوظة
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'لديك تغييرات غير محفوظة. هل تريد المغادرة؟';
            }
        });

        // تحديث الإحصائيات عند تغيير البيانات
        this.setupDataChangeListeners();

        // إعداد مستمعي الأحداث للهواتف
        this.setupMobileEventListeners();

        // إعداد مستمعي تغيير حجم الشاشة
        this.setupResizeListeners();
    }

    /**
     * إعداد مستمعي الأحداث للهواتف
     */
    setupMobileEventListeners() {
        // تحسين تجربة اللمس
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
            
            // إضافة تأثيرات اللمس للأزرار
            const touchElements = document.querySelectorAll('.mobile-nav-tab, .mobile-actions button');
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

        // تحسين التنقل باللمس
        this.setupTouchNavigation();
    }

    /**
     * إعداد التنقل باللمس
     */
    setupTouchNavigation() {
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            // تجاهل الحركات الصغيرة
            if (Math.abs(diffX) < 50 && Math.abs(diffY) < 50) return;

            // الحركة الأفقية (تغيير الأقسام)
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    // مسح لليسار - القسم التالي
                    this.navigateToNextSection();
                } else {
                    // مسح لليمين - القسم السابق
                    this.navigateToPreviousSection();
                }
            }

            touchStartX = 0;
            touchStartY = 0;
        });
    }

    /**
     * إعداد مستمعي تغيير حجم الشاشة
     */
    setupResizeListeners() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    /**
     * التعامل مع تغيير حجم الشاشة
     */
    handleResize() {
        const sidebar = document.getElementById('sidebar');
        
        if (window.innerWidth >= 1024) {
            // شاشة كبيرة - إظهار الشريط الجانبي
            sidebar.classList.remove('mobile-open');
            sidebar.classList.add('lg:translate-x-0');
        } else {
            // شاشة صغيرة - إخفاء الشريط الجانبي
            sidebar.classList.remove('lg:translate-x-0');
        }

        // تحديث عرض التبويبات المحمولة
        this.updateMobileNavTabsVisibility();
    }

    /**
     * تحديث عرض التبويبات المحمولة
     */
    updateMobileNavTabsVisibility() {
        const mobileNavTabs = document.querySelectorAll('.mobile-nav-tab');
        const container = document.querySelector('.mobile-nav-tabs');
        
        if (!container || window.innerWidth >= 1024) return;

        // إخفاء التبويبات التي لا تتناسب مع العرض
        let totalWidth = 0;
        const containerWidth = container.offsetWidth;
        
        mobileNavTabs.forEach((tab, index) => {
            const tabWidth = tab.offsetWidth;
            totalWidth += tabWidth;
            
            if (totalWidth > containerWidth && index > 0) {
                tab.style.display = 'none';
            } else {
                tab.style.display = 'block';
            }
        });
    }

    /**
     * التنقل إلى القسم التالي
     */
    navigateToNextSection() {
        const sections = ['dashboard', 'content', 'shopping', 'branches', 'social', 'company-info', 'company-settings', 'settings'];
        const currentIndex = sections.indexOf(this.currentSection);
        const nextIndex = (currentIndex + 1) % sections.length;
        this.showSection(sections[nextIndex]);
    }

    /**
     * التنقل إلى القسم السابق
     */
    navigateToPreviousSection() {
        const sections = ['dashboard', 'content', 'shopping', 'branches', 'social', 'company-info', 'company-settings', 'settings'];
        const currentIndex = sections.indexOf(this.currentSection);
        const prevIndex = currentIndex === 0 ? sections.length - 1 : currentIndex - 1;
        this.showSection(sections[prevIndex]);
    }

    /**
     * إعداد مستمعي تغيير البيانات
     */
    setupDataChangeListeners() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.hasUnsavedChanges = true;
                this.updateSaveButton();
            });
        });
    }

    /**
     * تبديل الشريط الجانبي
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('mobile-open');
    }

    /**
     * إغلاق الشريط الجانبي
     */
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('mobile-open');
    }

    /**
     * عرض قسم معين
     */
    showSection(sectionName) {
        // إخفاء جميع الأقسام
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });

        // إزالة التفعيل من جميع عناصر التنقل
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // عرض القسم المحدد
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');
        }

        // تفعيل عنصر التنقل المقابل
        const navItem = document.querySelector(`[onclick*="showSection('${sectionName}')"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // تحديث عنوان الصفحة
        this.updatePageTitle(sectionName);

        // تحديث المحتوى حسب القسم
        this.loadSectionContent(sectionName);

        this.currentSection = sectionName;
    }

    /**
     * تحديث عنوان الصفحة
     */
    updatePageTitle(sectionName) {
        const titles = {
            dashboard: { title: 'لوحة المعلومات', subtitle: 'نظرة عامة على إحصائيات الموقع' },
            content: { title: 'إدارة المحتوى', subtitle: 'تعديل نصوص ووصف الشركة' },
            branches: { title: 'إدارة الفروع', subtitle: 'إضافة أو تعديل فروع الشركة' },
            social: { title: 'وسائل التواصل', subtitle: 'تعديل روابط وسائل التواصل' },
            settings: { title: 'الإعدادات', subtitle: 'الإعدادات العامة للموقع' },
            preview: { title: 'معاينة الموقع', subtitle: 'معاينة التغييرات قبل النشر' }
        };

        // تحديث عنوان سطح المكتب
        const pageTitle = document.getElementById('page-title');
        const pageSubtitle = document.getElementById('page-subtitle');
        
        // تحديث عنوان الهاتف
        const pageTitleMobile = document.getElementById('page-title-mobile');

        if (titles[sectionName]) {
            if (pageTitle) pageTitle.textContent = titles[sectionName].title;
            if (pageSubtitle) pageSubtitle.textContent = titles[sectionName].subtitle;
            if (pageTitleMobile) pageTitleMobile.textContent = titles[sectionName].title;
        }

        // تحديث التبويبات المحمولة
        this.updateMobileNavTabs(sectionName);
    }

    /**
     * تحديث تبويبات التنقل المحمولة
     */
    updateMobileNavTabs(activeSection) {
        const mobileNavTabs = document.querySelectorAll('.mobile-nav-tab');
        
        mobileNavTabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // تحديد التبويب النشط حسب القسم
        const sectionToTab = {
            dashboard: 0,
            content: 1,
            branches: 2
        };

        const activeTabIndex = sectionToTab[activeSection];
        if (activeTabIndex !== undefined && mobileNavTabs[activeTabIndex]) {
            mobileNavTabs[activeTabIndex].classList.add('active');
        }
    }

    /**
     * تحميل محتوى القسم
     */
    loadSectionContent(sectionName) {
        switch (sectionName) {
            case 'content':
                this.loadContentSection();
                break;
            case 'shopping':
                this.loadShoppingSection();
                break;
            case 'branches':
                this.loadBranchesSection();
                break;
            case 'social':
                this.loadSocialSection();
                break;
            case 'company-info':
                this.loadCompanyInfoSection();
                break;
            case 'visits-stats':
                this.loadVisitsStatsSection();
                break;
            case 'company-settings':
                this.loadCompanySettingsSection();
                break;
            case 'settings':
                this.loadSettingsSection();
                break;
        }
    }

    /**
     * تحميل قسم المحتوى
     */
    loadContentSection() {
        if (!this.data) return;

        const companyName = document.getElementById('company-name');
        const companyDescription = document.getElementById('company-description');

        if (companyName && this.data.company?.name) {
            companyName.value = this.data.company.name;
        }

        if (companyDescription && this.data.company?.description) {
            companyDescription.value = this.data.company.description;
        }

        // تحميل بيانات المميزات
        const experienceText = document.getElementById('experience-text');
        const qualityText = document.getElementById('quality-text');
        const satisfactionText = document.getElementById('satisfaction-text');
        const paymentText = document.getElementById('payment-text');

        if (experienceText && this.data.content?.features?.experience) {
            experienceText.value = this.data.content.features.experience;
        } else if (experienceText) {
            experienceText.value = '45+ سنة خبرة';
        }

        if (qualityText && this.data.content?.features?.quality) {
            qualityText.value = this.data.content.features.quality;
        } else if (qualityText) {
            qualityText.value = 'جودة مضمونة';
        }

        if (satisfactionText && this.data.content?.features?.satisfaction) {
            satisfactionText.value = this.data.content.features.satisfaction;
        } else if (satisfactionText) {
            satisfactionText.value = 'رضا العملاء';
        }

        if (paymentText && this.data.content?.features?.payment) {
            paymentText.value = this.data.content.features.payment;
        } else if (paymentText) {
            paymentText.value = 'دفع آمن';
        }
    }

    /**
     * تحميل قسم التسوق
     */
    loadShoppingSection() {
        if (!this.data) return;

        // تحميل بيانات المتجر الإلكتروني
        const websiteText = document.getElementById('website-text');
        const websiteUrl = document.getElementById('website-url');
        const websiteIcon = document.getElementById('website-icon');

        if (websiteText && this.data.content?.shopping?.website?.text) {
            websiteText.value = this.data.content.shopping.website.text;
        } else if (websiteText) {
            websiteText.value = 'تسوق عبر متجرنا (ويب سايت)';
        }

        if (websiteUrl && this.data.content?.shopping?.website?.url) {
            websiteUrl.value = this.data.content.shopping.website.url;
        }

        if (websiteIcon && this.data.content?.shopping?.website?.icon) {
            websiteIcon.value = this.data.content.shopping.website.icon;
        }

        // تحميل بيانات App Store
        const appstoreText = document.getElementById('appstore-text');
        const appstoreUrl = document.getElementById('appstore-url');
        const appstoreIcon = document.getElementById('appstore-icon');

        if (appstoreText && this.data.content?.shopping?.appstore?.text) {
            appstoreText.value = this.data.content.shopping.appstore.text;
        } else if (appstoreText) {
            appstoreText.value = 'تسوق عبر متجرنا تطبيقنا على App Store';
        }

        if (appstoreUrl && this.data.content?.shopping?.appstore?.url) {
            appstoreUrl.value = this.data.content.shopping.appstore.url;
        }

        if (appstoreIcon && this.data.content?.shopping?.appstore?.icon) {
            appstoreIcon.value = this.data.content.shopping.appstore.icon;
        }

        // تحميل بيانات Google Play
        const googleplayText = document.getElementById('googleplay-text');
        const googleplayUrl = document.getElementById('googleplay-url');
        const googleplayIcon = document.getElementById('googleplay-icon');

        if (googleplayText && this.data.content?.shopping?.googleplay?.text) {
            googleplayText.value = this.data.content.shopping.googleplay.text;
        } else if (googleplayText) {
            googleplayText.value = 'تسوق عبر متجرنا تطبيقنا على Google Play';
        }

        if (googleplayUrl && this.data.content?.shopping?.googleplay?.url) {
            googleplayUrl.value = this.data.content.shopping.googleplay.url;
        }

        if (googleplayIcon && this.data.content?.shopping?.googleplay?.icon) {
            googleplayIcon.value = this.data.content.shopping.googleplay.icon;
        }
    }

    /**
     * تحميل قسم الفروع
     */
    loadBranchesSection() {
        if (!this.data) return;

        // تحميل بيانات محتوى الفروع
        const branchesDescription = document.getElementById('branches-description');
        const branchesCount = document.getElementById('branches-count');

        if (branchesDescription && this.data.content?.branches?.description) {
            branchesDescription.value = this.data.content.branches.description;
        } else if (branchesDescription) {
            branchesDescription.value = 'وجهتك الأقرب لتجربة تسوّق غير عادية بانتظارك! نحن موجودون في جميع أنحاء المملكة لخدمتكم بأفضل المنتجات العشبية';
        }

        if (branchesCount && this.data.content?.branches?.count) {
            branchesCount.value = this.data.content.branches.count;
        } else if (branchesCount) {
            branchesCount.value = '9 فروع موزعة في جميع أنحاء المملكة';
        }

        // تحميل قائمة الفروع
        const branchesList = document.getElementById('branches-list');
        if (!branchesList || !this.data?.branches) return;

        branchesList.innerHTML = this.data.branches.map((branch, index) => `
            <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <h4 class="saudi-bold text-lg text-gray-800">${branch.name}</h4>
                        <p class="text-sm text-gray-600 saudi-regular">${branch.address}</p>
                    </div>
                    <div class="flex items-center space-x-2 space-x-reverse">
                        <button onclick="adminApp.editBranch(${index})" 
                                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button onclick="adminApp.deleteBranch(${index})" 
                                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="text-sm text-gray-500 saudi-regular space-y-1">
                    <p><span class="saudi-bold text-gray-700">الهاتف:</span> ${branch.phone}</p>
                    ${branch.googleMaps ? `
                        <p><span class="saudi-bold text-gray-700">جوجل ماب:</span> 
                            <a href="${branch.googleMaps}" target="_blank" 
                               class="text-blue-600 hover:text-blue-800 underline">
                                عرض على الخريطة
                            </a>
                        </p>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    /**
     * تحميل قسم وسائل التواصل
     */
    loadSocialSection() {
        const socialList = document.getElementById('social-links-list');
        if (!socialList || !this.data?.socialMedia) return;

        socialList.innerHTML = this.data.socialMedia.map((social, index) => `
            <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3 space-x-reverse">
                        <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="${social.icon}"/>
                            </svg>
                        </div>
                        <div>
                            <h4 class="saudi-bold text-lg text-gray-800">${social.name}</h4>
                            <p class="text-sm text-gray-600 saudi-regular">${social.url}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 space-x-reverse">
                        <button onclick="adminApp.editSocialLink(${index})" 
                                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button onclick="adminApp.deleteSocialLink(${index})" 
                                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * تحميل قسم الإعدادات
     */
    loadSettingsSection() {
        if (!this.data) return;

        const mainPhone = document.getElementById('main-phone');
        const whatsappNumber = document.getElementById('whatsapp-number');
        const websiteUrl = document.getElementById('website-url');
        const appStoreUrl = document.getElementById('app-store-url');

        if (mainPhone && this.data.contact?.phone) {
            mainPhone.value = this.data.contact.phone;
        }

        if (whatsappNumber && this.data.contact?.whatsapp?.number) {
            whatsappNumber.value = this.data.contact.whatsapp.number;
        }

        // يمكن إضافة المزيد من الحقول حسب الحاجة
    }

    /**
     * تحديث الإحصائيات
     */
    updateStats() {
        if (!this.data) return;

        const totalBranches = document.getElementById('total-branches');
        const totalSocial = document.getElementById('total-social');
        const totalApps = document.getElementById('total-apps');

        if (totalBranches) {
            totalBranches.textContent = this.data.branches?.length || 0;
        }

        if (totalSocial) {
            totalSocial.textContent = this.data.socialMedia?.length || 0;
        }

        if (totalApps) {
            totalApps.textContent = this.data.apps?.length || 0;
        }
    }

    /**
     * تحميل قسم إعدادات الشركة
     */
    loadCompanyInfoSection() {
        if (!this.data) return;

        // تحميل معلومات الشركة
        const companyDescription = document.getElementById('company-description');
        const companyRegistration = document.getElementById('company-registration');

        if (companyDescription && this.data.content?.company?.description) {
            companyDescription.value = this.data.content.company.description;
        } else if (companyDescription) {
            companyDescription.value = 'نحن هنا للإجابة على استفساراتكم وتقديم أفضل الخدمات';
        }

        if (companyRegistration && this.data.content?.company?.registration) {
            companyRegistration.value = this.data.content.company.registration;
        } else if (companyRegistration) {
            companyRegistration.value = 'شركة مسجلة ومعتمدة في المملكة العربية السعودية';
        }

        // تحميل طرق التواصل
        const contactTitle = document.getElementById('contact-title');
        const contactText = document.getElementById('contact-text');
        const contactPhone = document.getElementById('contact-phone');
        const contactWhatsappText = document.getElementById('contact-whatsapp-text');
        const contactWhatsappLink = document.getElementById('contact-whatsapp-link');

        if (contactTitle && this.data.content?.company?.contactTitle) {
            contactTitle.value = this.data.content.company.contactTitle;
        } else if (contactTitle) {
            contactTitle.value = 'طرق التواصل';
        }

        if (contactText && this.data.content?.company?.contactText) {
            contactText.value = this.data.content.company.contactText;
        } else if (contactText) {
            contactText.value = 'اتصال مباشر';
        }

        if (contactPhone && this.data.content?.company?.contactPhone) {
            contactPhone.value = this.data.content.company.contactPhone;
        } else if (contactPhone) {
            contactPhone.value = '+966501234567';
        }

        if (contactWhatsappText && this.data.content?.company?.contactWhatsappText) {
            contactWhatsappText.value = this.data.content.company.contactWhatsappText;
        } else if (contactWhatsappText) {
            contactWhatsappText.value = 'واتساب';
        }

        if (contactWhatsappLink && this.data.content?.company?.contactWhatsappLink) {
            contactWhatsappLink.value = this.data.content.company.contactWhatsappLink;
        } else if (contactWhatsappLink) {
            contactWhatsappLink.value = 'https://wa.me/966501234567';
        }

        // تحميل قسم الجملة
        const wholesaleTitle = document.getElementById('wholesale-title');
        const wholesaleContactText = document.getElementById('wholesale-contact-text');
        const wholesalePhone = document.getElementById('wholesale-phone');
        const wholesaleWhatsappText = document.getElementById('wholesale-whatsapp-text');
        const wholesaleWhatsappLink = document.getElementById('wholesale-whatsapp-link');

        if (wholesaleTitle && this.data.content?.company?.wholesaleTitle) {
            wholesaleTitle.value = this.data.content.company.wholesaleTitle;
        } else if (wholesaleTitle) {
            wholesaleTitle.value = 'منتجات عطارة فيفا بالجملة';
        }

        if (wholesaleContactText && this.data.content?.company?.wholesaleContactText) {
            wholesaleContactText.value = this.data.content.company.wholesaleContactText;
        } else if (wholesaleContactText) {
            wholesaleContactText.value = 'اتصال';
        }

        if (wholesalePhone && this.data.content?.company?.wholesalePhone) {
            wholesalePhone.value = this.data.content.company.wholesalePhone;
        } else if (wholesalePhone) {
            wholesalePhone.value = '+966501234567';
        }

        if (wholesaleWhatsappText && this.data.content?.company?.wholesaleWhatsappText) {
            wholesaleWhatsappText.value = this.data.content.company.wholesaleWhatsappText;
        } else if (wholesaleWhatsappText) {
            wholesaleWhatsappText.value = 'واتساب';
        }

        if (wholesaleWhatsappLink && this.data.content?.company?.wholesaleWhatsappLink) {
            wholesaleWhatsappLink.value = this.data.content.company.wholesaleWhatsappLink;
        } else if (wholesaleWhatsappLink) {
            wholesaleWhatsappLink.value = 'https://wa.me/966501234567';
        }

        // تحميل التسويق الإعلامي
        const marketingTitle = document.getElementById('marketing-title');
        const marketingContactText = document.getElementById('marketing-contact-text');
        const marketingPhone = document.getElementById('marketing-phone');
        const marketingWhatsappText = document.getElementById('marketing-whatsapp-text');
        const marketingWhatsappLink = document.getElementById('marketing-whatsapp-link');

        if (marketingTitle && this.data.content?.company?.marketingTitle) {
            marketingTitle.value = this.data.content.company.marketingTitle;
        } else if (marketingTitle) {
            marketingTitle.value = 'التسويق والعلاقات العامة';
        }

        if (marketingContactText && this.data.content?.company?.marketingContactText) {
            marketingContactText.value = this.data.content.company.marketingContactText;
        } else if (marketingContactText) {
            marketingContactText.value = 'اتصال';
        }

        if (marketingPhone && this.data.content?.company?.marketingPhone) {
            marketingPhone.value = this.data.content.company.marketingPhone;
        } else if (marketingPhone) {
            marketingPhone.value = '+966501234567';
        }

        if (marketingWhatsappText && this.data.content?.company?.marketingWhatsappText) {
            marketingWhatsappText.value = this.data.content.company.marketingWhatsappText;
        } else if (marketingWhatsappText) {
            marketingWhatsappText.value = 'واتساب';
        }

        if (marketingWhatsappLink && this.data.content?.company?.marketingWhatsappLink) {
            marketingWhatsappLink.value = this.data.content.company.marketingWhatsappLink;
        } else if (marketingWhatsappLink) {
            marketingWhatsappLink.value = 'https://wa.me/966501234567';
        }

        // تحميل قسم المشتريات
        const purchasingTitle = document.getElementById('purchasing-title');
        const purchasingContactText = document.getElementById('purchasing-contact-text');
        const purchasingPhone = document.getElementById('purchasing-phone');
        const purchasingWhatsappText = document.getElementById('purchasing-whatsapp-text');
        const purchasingWhatsappLink = document.getElementById('purchasing-whatsapp-link');

        if (purchasingTitle && this.data.content?.company?.purchasingTitle) {
            purchasingTitle.value = this.data.content.company.purchasingTitle;
        } else if (purchasingTitle) {
            purchasingTitle.value = 'لاستقبال عروض المنتجات';
        }

        if (purchasingContactText && this.data.content?.company?.purchasingContactText) {
            purchasingContactText.value = this.data.content.company.purchasingContactText;
        } else if (purchasingContactText) {
            purchasingContactText.value = 'اتصال';
        }

        if (purchasingPhone && this.data.content?.company?.purchasingPhone) {
            purchasingPhone.value = this.data.content.company.purchasingPhone;
        } else if (purchasingPhone) {
            purchasingPhone.value = '+966501234567';
        }

        if (purchasingWhatsappText && this.data.content?.company?.purchasingWhatsappText) {
            purchasingWhatsappText.value = this.data.content.company.purchasingWhatsappText;
        } else if (purchasingWhatsappText) {
            purchasingWhatsappText.value = 'واتساب';
        }

        if (purchasingWhatsappLink && this.data.content?.company?.purchasingWhatsappLink) {
            purchasingWhatsappLink.value = this.data.content.company.purchasingWhatsappLink;
        } else if (purchasingWhatsappLink) {
            purchasingWhatsappLink.value = 'https://wa.me/966501234567';
        }

        // تحميل طلب المنتجات
        const productOrderTitle = document.getElementById('product-order-title');
        const productOrderContactText = document.getElementById('product-order-contact-text');
        const productOrderPhone = document.getElementById('product-order-phone');
        const productOrderWhatsappText = document.getElementById('product-order-whatsapp-text');
        const productOrderWhatsappLink = document.getElementById('product-order-whatsapp-link');

        if (productOrderTitle && this.data.content?.company?.productOrderTitle) {
            productOrderTitle.value = this.data.content.company.productOrderTitle;
        } else if (productOrderTitle) {
            productOrderTitle.value = 'طلب المنتجات';
        }

        if (productOrderContactText && this.data.content?.company?.productOrderContactText) {
            productOrderContactText.value = this.data.content.company.productOrderContactText;
        } else if (productOrderContactText) {
            productOrderContactText.value = 'اتصال';
        }

        if (productOrderPhone && this.data.content?.company?.productOrderPhone) {
            productOrderPhone.value = this.data.content.company.productOrderPhone;
        } else if (productOrderPhone) {
            productOrderPhone.value = '+966501234567';
        }

        if (productOrderWhatsappText && this.data.content?.company?.productOrderWhatsappText) {
            productOrderWhatsappText.value = this.data.content.company.productOrderWhatsappText;
        } else if (productOrderWhatsappText) {
            productOrderWhatsappText.value = 'واتساب';
        }

        if (productOrderWhatsappLink && this.data.content?.company?.productOrderWhatsappLink) {
            productOrderWhatsappLink.value = this.data.content.company.productOrderWhatsappLink;
        } else if (productOrderWhatsappLink) {
            productOrderWhatsappLink.value = 'https://wa.me/966501234567';
        }
    }

    /**
     * تحميل قسم إحصائيات الزيارات
     */
    loadVisitsStatsSection() {
        // تحميل الإحصائيات من البيانات المحفوظة أو استخدام البيانات الافتراضية
        const stats = this.data.visitsStats || {
            todayVisits: 156,
            citiesCount: 24,
            devicesCount: 3,
            osCount: 4,
            continentsCount: 3,
            dailyData: [45, 52, 38, 67, 89, 76, 95, 82, 71, 58, 63, 78, 85, 92, 88, 74, 69, 81, 94, 87, 73, 66, 79, 91, 84, 77, 68, 83, 96, 89],
            recentActivity: [
                { location: 'الرياض', time: 'منذ دقيقتين', type: 'new' },
                { location: 'جدة', time: 'منذ 5 دقائق', type: 'return' },
                { location: 'الدمام', time: 'منذ 10 دقائق', type: 'new' },
                { location: 'مكة المكرمة', time: 'منذ 15 دقيقة', type: 'return' }
            ]
        };

        // تحديث الأرقام
        document.getElementById('today-visits').textContent = stats.todayVisits.toLocaleString();
        document.getElementById('cities-count').textContent = stats.citiesCount.toLocaleString();
        document.getElementById('devices-count').textContent = stats.devicesCount.toLocaleString();
        document.getElementById('os-count').textContent = stats.osCount.toLocaleString();
        document.getElementById('continents-count').textContent = stats.continentsCount.toLocaleString();

        // تحديث الرسم البياني اليومي
        this.updateDailyChart(stats.dailyData, 'daily-visits-chart');

        // تحديث النشاط الأخير
        this.updateRecentActivity(stats.recentActivity);
    }

    /**
     * تحديث الرسم البياني اليومي
     */
    updateDailyChart(dailyData, containerId) {
        const chartContainer = document.getElementById(containerId);
        if (!chartContainer) return;

        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-yellow-500', 'bg-teal-500', 'bg-cyan-500'];
        
        chartContainer.innerHTML = '';
        
        dailyData.forEach((height, index) => {
            const dayElement = document.createElement('div');
            dayElement.className = 'flex flex-col items-center space-y-1';
            dayElement.innerHTML = `
                <div class="w-3 ${colors[index % colors.length]} rounded-t transition-all duration-500 hover:opacity-80" style="height: ${height}%" title="اليوم ${index + 1}: ${height} زيارة"></div>
                <span class="text-xs saudi-regular text-gray-600">${index + 1}</span>
            `;
            chartContainer.appendChild(dayElement);
        });
    }


    /**
     * تحديث النشاط الأخير
     */
    updateRecentActivity(activities) {
        const activityContainer = document.querySelector('#visits-stats-section .space-y-3');
        if (!activityContainer) return;

        const colors = {
            new: 'bg-green-500',
            return: 'bg-blue-500'
        };

        activityContainer.innerHTML = '';
        
        activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
            activityElement.innerHTML = `
                <div class="flex items-center space-x-3 space-x-reverse">
                    <div class="w-2 h-2 ${colors[activity.type]} rounded-full"></div>
                    <span class="text-sm saudi-regular text-gray-700">زيارة ${activity.type === 'new' ? 'جديدة' : ''} من ${activity.location}</span>
                </div>
                <span class="text-xs saudi-regular text-gray-500">${activity.time}</span>
            `;
            activityContainer.appendChild(activityElement);
        });
    }

    /**
     * تحديث الإحصائيات
     */
    async refreshStats() {
        const refreshBtn = document.querySelector('button[onclick="adminApp.refreshStats()"]');
        const originalContent = refreshBtn.innerHTML;
        
        // عرض حالة التحديث
        refreshBtn.innerHTML = `
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>جاري التحديث...</span>
        `;
        refreshBtn.disabled = true;

        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 2000));

        // توليد بيانات جديدة عشوائية
        const newStats = {
            todayVisits: Math.floor(Math.random() * 50) + 100,
            citiesCount: Math.floor(Math.random() * 10) + 20,
            devicesCount: 3,
            osCount: 4,
            continentsCount: Math.floor(Math.random() * 2) + 3,
            dailyData: Array.from({length: 30}, () => Math.floor(Math.random() * 60) + 30),
            recentActivity: [
                { location: 'الرياض', time: 'الآن', type: 'new' },
                { location: 'جدة', time: 'منذ دقيقة', type: 'return' },
                { location: 'الدمام', time: 'منذ 3 دقائق', type: 'new' },
                { location: 'مكة المكرمة', time: 'منذ 7 دقائق', type: 'return' }
            ]
        };

        // حفظ البيانات الجديدة
        this.data.visitsStats = newStats;
        localStorage.setItem('adminData', JSON.stringify(this.data));

        // تحديث الواجهة
        this.loadVisitsStatsSection();

        // استعادة الزر
        refreshBtn.innerHTML = originalContent;
        refreshBtn.disabled = false;

        // عرض رسالة نجاح
        this.showToast('تم تحديث الإحصائيات بنجاح', 'success');
    }

    /**
     * تحميل مخطط لوحة التحكم
     */
    loadDashboardChart() {
        const stats = this.data.visitsStats || {
            dailyData: [45, 52, 38, 67, 89, 76, 95, 82, 71, 58, 63, 78, 85, 92, 88, 74, 69, 81, 94, 87, 73, 66, 79, 91, 84, 77, 68, 83, 96, 89]
        };
        
        this.updateDailyChart(stats.dailyData, 'dashboard-daily-chart');
    }

    /**
     * تحميل قسم إعدادات الحساب
     */
    loadCompanySettingsSection() {
        // تحميل اسم المستخدم الحالي
        const currentUsername = document.getElementById('current-username');
        const newUsername = document.getElementById('new-username');
        const currentPassword = document.getElementById('current-password');
        const newPassword = document.getElementById('new-password');
        const confirmPassword = document.getElementById('confirm-password');

        // عرض اسم المستخدم الحالي
        if (currentUsername) {
            const sessionData = JSON.parse(sessionStorage.getItem('fyfa-admin-session') || '{}');
            currentUsername.value = sessionData.username || 'مدير';
        }

        // مسح الحقول الجديدة
        if (newUsername) {
            newUsername.value = '';
        }
        if (currentPassword) {
            currentPassword.value = '';
        }
        if (newPassword) {
            newPassword.value = '';
        }
        if (confirmPassword) {
            confirmPassword.value = '';
        }
    }

    /**
     * حفظ إعدادات التسوق
     */
    async saveShopping() {
        try {
            const saveButton = document.getElementById('save-shopping-btn');
            const saveStatus = document.getElementById('save-shopping-status');
            
            // إظهار حالة التحميل
            saveButton.disabled = true;
            saveButton.innerHTML = `
                <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span>جاري الحفظ...</span>
            `;

            // جمع بيانات التسوق
            const shoppingData = {
                website: {
                    text: document.getElementById('website-text').value,
                    url: document.getElementById('website-url').value,
                    icon: document.getElementById('website-icon').value
                },
                appstore: {
                    text: document.getElementById('appstore-text').value,
                    url: document.getElementById('appstore-url').value,
                    icon: document.getElementById('appstore-icon').value
                },
                googleplay: {
                    text: document.getElementById('googleplay-text').value,
                    url: document.getElementById('googleplay-url').value,
                    icon: document.getElementById('googleplay-icon').value
                }
            };

            // محاكاة تأخير الشبكة
            await new Promise(resolve => setTimeout(resolve, 1500));

            // حفظ البيانات
            if (!this.data.content) {
                this.data.content = {};
            }
            this.data.content.shopping = shoppingData;
            localStorage.setItem('fyfa-admin-data', JSON.stringify(this.data));
            
            // إظهار رسالة النجاح
            saveStatus.classList.remove('hidden');
            saveStatus.innerHTML = `
                <div class="flex items-center space-x-2 space-x-reverse p-3 rounded-lg bg-green-50 border border-green-200">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-sm saudi-regular text-green-700">تم حفظ إعدادات التسوق بنجاح</span>
                </div>
            `;

            // إخفاء رسالة النجاح بعد 3 ثوان
            setTimeout(() => {
                saveStatus.classList.add('hidden');
            }, 3000);

            this.hasUnsavedChanges = false;
            this.showToast('تم حفظ إعدادات التسوق بنجاح!', 'success');

        } catch (error) {
            console.error('خطأ في حفظ إعدادات التسوق:', error);
            this.showToast('حدث خطأ في حفظ إعدادات التسوق', 'error');
        } finally {
            // استعادة الزر
            saveButton.disabled = false;
            saveButton.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                </svg>
                <span>حفظ إعدادات التسوق</span>
            `;
        }
    }

    /**
     * حفظ إعدادات الفروع
     */
    async saveBranches() {
        try {
            const saveButton = document.getElementById('save-branches-btn');
            const saveStatus = document.getElementById('save-branches-status');
            
            // إظهار حالة التحميل
            saveButton.disabled = true;
            saveButton.innerHTML = `
                <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span>جاري الحفظ...</span>
            `;

            // جمع بيانات الفروع
            const branchesData = {
                description: document.getElementById('branches-description').value,
                count: document.getElementById('branches-count').value
            };

            // محاكاة تأخير الشبكة
            await new Promise(resolve => setTimeout(resolve, 1500));

            // حفظ البيانات
            if (!this.data.content) {
                this.data.content = {};
            }
            this.data.content.branches = branchesData;
            localStorage.setItem('fyfa-admin-data', JSON.stringify(this.data));
            
            // إظهار رسالة النجاح
            saveStatus.classList.remove('hidden');
            saveStatus.innerHTML = `
                <div class="flex items-center space-x-2 space-x-reverse p-3 rounded-lg bg-green-50 border border-green-200">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-sm saudi-regular text-green-700">تم حفظ إعدادات الفروع بنجاح</span>
                </div>
            `;

            // إخفاء رسالة النجاح بعد 3 ثوان
            setTimeout(() => {
                saveStatus.classList.add('hidden');
            }, 3000);

            this.hasUnsavedChanges = false;
            this.showToast('تم حفظ إعدادات الفروع بنجاح!', 'success');

        } catch (error) {
            console.error('خطأ في حفظ إعدادات الفروع:', error);
            this.showToast('حدث خطأ في حفظ إعدادات الفروع', 'error');
        } finally {
            // استعادة الزر
            saveButton.disabled = false;
            saveButton.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                </svg>
                <span>حفظ إعدادات الفروع</span>
            `;
        }
    }

    /**
     * حفظ إعدادات الحساب
     */
    async saveAccountSettings() {
        try {
            const saveButton = document.getElementById('save-account-settings-btn');
            const saveStatus = document.getElementById('save-account-settings-status');
            
            // التحقق من صحة البيانات
            const newUsername = document.getElementById('new-username').value.trim();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // التحقق من وجود تغييرات
            if (!newUsername && !newPassword) {
                this.showToast('يرجى إدخال اسم مستخدم جديد أو كلمة سر جديدة', 'warning');
                return;
            }

            // التحقق من كلمة السر الجديدة
            if (newPassword && newPassword !== confirmPassword) {
                this.showToast('كلمة السر الجديدة وتأكيدها غير متطابقتين', 'error');
                return;
            }

            // التحقق من قوة كلمة السر
            if (newPassword && newPassword.length < 6) {
                this.showToast('كلمة السر يجب أن تكون 6 أحرف على الأقل', 'error');
                return;
            }

            // إظهار حالة التحميل
            saveButton.disabled = true;
            saveButton.innerHTML = `
                <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span>جاري الحفظ...</span>
            `;

            // محاكاة تأخير الشبكة
            await new Promise(resolve => setTimeout(resolve, 1500));

            // تحديث بيانات الجلسة
            const sessionData = JSON.parse(sessionStorage.getItem('fyfa-admin-session') || '{}');
            
            if (newUsername) {
                sessionData.username = newUsername;
                // تحديث اسم المستخدم في الواجهة
                this.displayUserInfo();
            }

            if (newPassword) {
                // في التطبيق الحقيقي، يجب تشفير كلمة السر
                sessionData.password = newPassword;
            }

            sessionStorage.setItem('fyfa-admin-session', JSON.stringify(sessionData));
            
            // إظهار رسالة النجاح
            saveStatus.classList.remove('hidden');
            saveStatus.innerHTML = `
                <div class="flex items-center space-x-2 space-x-reverse p-3 rounded-lg bg-green-50 border border-green-200">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-sm saudi-regular text-green-700">تم حفظ إعدادات الحساب بنجاح</span>
                </div>
            `;

            // إخفاء رسالة النجاح بعد 3 ثوان
            setTimeout(() => {
                saveStatus.classList.add('hidden');
            }, 3000);

            // مسح الحقول
            document.getElementById('new-username').value = '';
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';

            this.hasUnsavedChanges = false;
            this.showToast('تم حفظ إعدادات الحساب بنجاح!', 'success');

        } catch (error) {
            console.error('خطأ في حفظ إعدادات الحساب:', error);
            this.showToast('حدث خطأ في حفظ إعدادات الحساب', 'error');
        } finally {
            // استعادة الزر
            saveButton.disabled = false;
            saveButton.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                </svg>
                <span>حفظ إعدادات الحساب</span>
            `;
        }
    }

    /**
     * حفظ إعدادات الشركة
     */
    async saveCompanyInfo() {
        try {
            const saveButton = document.getElementById('save-company-info-btn');
            const saveStatus = document.getElementById('save-company-info-status');
            
            // إظهار حالة التحميل
            saveButton.disabled = true;
            saveButton.innerHTML = `
                <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span>جاري الحفظ...</span>
            `;

            // جمع بيانات الشركة
            const companyData = {
                description: document.getElementById('company-description').value,
                registration: document.getElementById('company-registration').value,
                contactTitle: document.getElementById('contact-title').value,
                contactText: document.getElementById('contact-text').value,
                contactPhone: document.getElementById('contact-phone').value,
                contactWhatsappText: document.getElementById('contact-whatsapp-text').value,
                contactWhatsappLink: document.getElementById('contact-whatsapp-link').value,
                wholesaleTitle: document.getElementById('wholesale-title').value,
                wholesaleContactText: document.getElementById('wholesale-contact-text').value,
                wholesalePhone: document.getElementById('wholesale-phone').value,
                wholesaleWhatsappText: document.getElementById('wholesale-whatsapp-text').value,
                wholesaleWhatsappLink: document.getElementById('wholesale-whatsapp-link').value,
                marketingTitle: document.getElementById('marketing-title').value,
                marketingContactText: document.getElementById('marketing-contact-text').value,
                marketingPhone: document.getElementById('marketing-phone').value,
                marketingWhatsappText: document.getElementById('marketing-whatsapp-text').value,
                marketingWhatsappLink: document.getElementById('marketing-whatsapp-link').value,
                purchasingTitle: document.getElementById('purchasing-title').value,
                purchasingContactText: document.getElementById('purchasing-contact-text').value,
                purchasingPhone: document.getElementById('purchasing-phone').value,
                purchasingWhatsappText: document.getElementById('purchasing-whatsapp-text').value,
                purchasingWhatsappLink: document.getElementById('purchasing-whatsapp-link').value,
                productOrderTitle: document.getElementById('product-order-title').value,
                productOrderContactText: document.getElementById('product-order-contact-text').value,
                productOrderPhone: document.getElementById('product-order-phone').value,
                productOrderWhatsappText: document.getElementById('product-order-whatsapp-text').value,
                productOrderWhatsappLink: document.getElementById('product-order-whatsapp-link').value
            };

            // محاكاة تأخير الشبكة
            await new Promise(resolve => setTimeout(resolve, 1500));

            // حفظ البيانات
            if (!this.data.content) {
                this.data.content = {};
            }
            this.data.content.company = companyData;
            localStorage.setItem('fyfa-admin-data', JSON.stringify(this.data));
            
            // إظهار رسالة النجاح
            saveStatus.classList.remove('hidden');
            saveStatus.innerHTML = `
                <div class="flex items-center space-x-2 space-x-reverse p-3 rounded-lg bg-green-50 border border-green-200">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-sm saudi-regular text-green-700">تم حفظ إعدادات الشركة بنجاح</span>
                </div>
            `;

            // إخفاء رسالة النجاح بعد 3 ثوان
            setTimeout(() => {
                saveStatus.classList.add('hidden');
            }, 3000);

            this.hasUnsavedChanges = false;
            this.showToast('تم حفظ إعدادات الشركة بنجاح!', 'success');

        } catch (error) {
            console.error('خطأ في حفظ إعدادات الشركة:', error);
            this.showToast('حدث خطأ في حفظ إعدادات الشركة', 'error');
        } finally {
            // استعادة الزر
            saveButton.disabled = false;
            saveButton.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                </svg>
                <span>حفظ إعدادات الشركة</span>
            `;
        }
    }

    /**
     * إضافة فرع جديد
     */
    addBranch() {
        this.showModal('إضافة فرع جديد', this.getBranchFormHTML());
    }

    /**
     * تعديل فرع
     */
    editBranch(index) {
        const branch = this.data.branches[index];
        this.showModal('تعديل الفرع', this.getBranchFormHTML(branch, index));
    }

    /**
     * حذف فرع
     */
    deleteBranch(index) {
        if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
            this.data.branches.splice(index, 1);
            this.loadBranchesSection();
            this.updateStats();
            this.hasUnsavedChanges = true;
            this.showToast('تم حذف الفرع بنجاح', 'success');
        }
    }

    /**
     * إضافة رابط وسائل تواصل جديد
     */
    addSocialLink() {
        this.showModal('إضافة رابط وسائل تواصل', this.getSocialFormHTML());
    }

    /**
     * تعديل رابط وسائل تواصل
     */
    editSocialLink(index) {
        const social = this.data.socialMedia[index];
        this.showModal('تعديل رابط وسائل تواصل', this.getSocialFormHTML(social, index));
    }

    /**
     * حذف رابط وسائل تواصل
     */
    deleteSocialLink(index) {
        if (confirm('هل أنت متأكد من حذف هذا الرابط؟')) {
            this.data.socialMedia.splice(index, 1);
            this.loadSocialSection();
            this.updateStats();
            this.hasUnsavedChanges = true;
            this.showToast('تم حذف الرابط بنجاح', 'success');
        }
    }

    /**
     * الحصول على HTML نموذج الفرع
     */
    getBranchFormHTML(branch = null, index = null) {
        return `
            <form id="branch-form" class="space-y-4">
                <div>
                    <label class="block text-sm saudi-bold text-gray-700 mb-2">اسم الفرع</label>
                    <input type="text" id="branch-name" value="${branch?.name || ''}" 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent saudi-regular"
                           placeholder="أدخل اسم الفرع"
                           required>
                </div>
                <div>
                    <label class="block text-sm saudi-bold text-gray-700 mb-2">العنوان</label>
                    <textarea id="branch-address" rows="3"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent saudi-regular"
                              placeholder="أدخل العنوان الكامل للفرع"
                              required>${branch?.address || ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm saudi-bold text-gray-700 mb-2">رقم الهاتف</label>
                    <input type="tel" id="branch-phone" value="${branch?.phone || ''}" 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent saudi-regular"
                           placeholder="أدخل رقم الهاتف"
                           required>
                </div>
                <div>
                    <label class="block text-sm saudi-bold text-gray-700 mb-2">رابط جوجل ماب</label>
                    <input type="url" id="branch-google-maps" value="${branch?.googleMaps || ''}" 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent saudi-regular"
                           placeholder="https://maps.google.com/...">
                    <p class="text-xs text-gray-500 mt-1 saudi-regular">رابط جوجل ماب للفرع (اختياري)</p>
                </div>
                <div class="flex justify-end space-x-3 space-x-reverse pt-4">
                    <button type="button" onclick="adminApp.hideModal()" 
                            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 saudi-regular">
                        إلغاء
                    </button>
                    <button type="submit" 
                            class="bg-primary text-white px-4 py-2 rounded-lg saudi-bold hover:bg-primary/90 transition-colors duration-200">
                        ${branch ? 'تحديث' : 'إضافة'}
                    </button>
                </div>
            </form>
        `;
    }

    /**
     * الحصول على HTML نموذج وسائل التواصل
     */
    getSocialFormHTML(social = null, index = null) {
        return `
            <form id="social-form" class="space-y-4">
                <div>
                    <label class="block text-sm saudi-bold text-gray-700 mb-2">اسم المنصة</label>
                    <input type="text" id="social-name" value="${social?.name || ''}" 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent saudi-regular"
                           required>
                </div>
                <div>
                    <label class="block text-sm saudi-bold text-gray-700 mb-2">الرابط</label>
                    <input type="url" id="social-url" value="${social?.url || ''}" 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent saudi-regular"
                           required>
                </div>
                <div>
                    <label class="block text-sm saudi-bold text-gray-700 mb-2">رمز الأيقونة (SVG Path)</label>
                    <textarea id="social-icon" rows="3" 
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent saudi-regular"
                              placeholder="M12 2.163c3.204 0 3.584.012 4.85.07...">${social?.icon || ''}</textarea>
                </div>
                <div class="flex justify-end space-x-3 space-x-reverse pt-4">
                    <button type="button" onclick="adminApp.hideModal()" 
                            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 saudi-regular">
                        إلغاء
                    </button>
                    <button type="submit" 
                            class="bg-primary text-white px-4 py-2 rounded-lg saudi-bold hover:bg-primary/90 transition-colors duration-200">
                        ${social ? 'تحديث' : 'إضافة'}
                    </button>
                </div>
            </form>
        `;
    }

    /**
     * عرض النافذة المنبثقة
     */
    showModal(title, content) {
        const modalOverlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');

        modalContent.innerHTML = `
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="saudi-bold text-lg text-gray-800">${title}</h3>
                    <button onclick="adminApp.hideModal()" 
                            class="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                ${content}
            </div>
        `;

        modalOverlay.classList.remove('hidden');

        // إعداد مستمعي النماذج
        this.setupModalFormListeners();
    }

    /**
     * إخفاء النافذة المنبثقة
     */
    hideModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        modalOverlay.classList.add('hidden');
    }

    /**
     * إعداد مستمعي نماذج النوافذ المنبثقة
     */
    setupModalFormListeners() {
        const branchForm = document.getElementById('branch-form');
        const socialForm = document.getElementById('social-form');

        if (branchForm) {
            branchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveBranch();
            });
        }

        if (socialForm) {
            socialForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSocialLink();
            });
        }
    }

    /**
     * حفظ الفرع
     */
    saveBranch() {
        const name = document.getElementById('branch-name').value;
        const address = document.getElementById('branch-address').value;
        const phone = document.getElementById('branch-phone').value;
        const googleMaps = document.getElementById('branch-google-maps').value;

        if (!name || !address || !phone) {
            this.showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        const branchData = {
            name,
            address,
            phone,
            googleMaps: googleMaps || null
        };

        // تحديد ما إذا كان تعديل أو إضافة
        const form = document.getElementById('branch-form');
        const isEdit = form.dataset.index !== undefined;
        
        if (isEdit) {
            const index = parseInt(form.dataset.index);
            this.data.branches[index] = branchData;
            this.showToast('تم تحديث الفرع بنجاح', 'success');
        } else {
            this.data.branches.push(branchData);
            this.showToast('تم إضافة الفرع بنجاح', 'success');
        }

        this.hideModal();
        this.loadBranchesSection();
        this.updateStats();
        this.hasUnsavedChanges = true;
    }

    /**
     * حفظ رابط وسائل التواصل
     */
    saveSocialLink() {
        const name = document.getElementById('social-name').value;
        const url = document.getElementById('social-url').value;
        const icon = document.getElementById('social-icon').value;

        if (!name || !url) {
            this.showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        const socialData = {
            name,
            url,
            icon: icon || 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'
        };

        // تحديد ما إذا كان تعديل أو إضافة
        const form = document.getElementById('social-form');
        const isEdit = form.dataset.index !== undefined;
        
        if (isEdit) {
            const index = parseInt(form.dataset.index);
            this.data.socialMedia[index] = socialData;
            this.showToast('تم تحديث الرابط بنجاح', 'success');
        } else {
            this.data.socialMedia.push(socialData);
            this.showToast('تم إضافة الرابط بنجاح', 'success');
        }

        this.hideModal();
        this.loadSocialSection();
        this.updateStats();
        this.hasUnsavedChanges = true;
    }

    /**
     * حفظ التغييرات
     */
    async saveChanges() {
        try {
            // جمع البيانات من النماذج
            this.collectFormData();

            // حفظ البيانات (في التطبيق الحقيقي، سيتم إرسالها للخادم)
            localStorage.setItem('fyfa-admin-data', JSON.stringify(this.data));
            
            this.hasUnsavedChanges = false;
            this.updateSaveButton();
            this.showToast('تم حفظ التغييرات بنجاح!', 'success');
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            this.showToast('حدث خطأ في حفظ البيانات', 'error');
        }
    }

    /**
     * حفظ المحتوى
     */
    async saveContent() {
        try {
            const saveButton = document.getElementById('save-content-btn');
            const saveStatus = document.getElementById('save-status');
            
            // إظهار حالة التحميل
            saveButton.disabled = true;
            saveButton.innerHTML = `
                <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span>جاري الحفظ...</span>
            `;

            // جمع بيانات المحتوى
            const contentData = {
                companyName: document.getElementById('company-name').value,
                companyDescription: document.getElementById('company-description').value,
                bannerImage: document.getElementById('banner-image').files[0] || null,
                features: {
                    experience: document.getElementById('experience-text').value,
                    quality: document.getElementById('quality-text').value,
                    satisfaction: document.getElementById('satisfaction-text').value,
                    payment: document.getElementById('payment-text').value
                }
            };

            // محاكاة تأخير الشبكة
            await new Promise(resolve => setTimeout(resolve, 1500));

            // حفظ البيانات
            this.data.content = contentData;
            localStorage.setItem('fyfa-admin-data', JSON.stringify(this.data));
            
            // إظهار رسالة النجاح
            saveStatus.classList.remove('hidden');
            saveStatus.innerHTML = `
                <div class="flex items-center space-x-2 space-x-reverse p-3 rounded-lg bg-green-50 border border-green-200">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-sm saudi-regular text-green-700">تم حفظ المحتوى بنجاح</span>
                </div>
            `;

            // إخفاء رسالة النجاح بعد 3 ثوان
            setTimeout(() => {
                saveStatus.classList.add('hidden');
            }, 3000);

            this.hasUnsavedChanges = false;
            this.showToast('تم حفظ المحتوى بنجاح!', 'success');

        } catch (error) {
            console.error('خطأ في حفظ المحتوى:', error);
            this.showToast('حدث خطأ في حفظ المحتوى', 'error');
        } finally {
            // استعادة الزر
            saveButton.disabled = false;
            saveButton.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                </svg>
                <span>حفظ المحتوى</span>
            `;
        }
    }

    /**
     * جمع البيانات من النماذج
     */
    collectFormData() {
        // جمع بيانات المحتوى
        const companyName = document.getElementById('company-name');
        const companyDescription = document.getElementById('company-description');

        if (companyName) {
            this.data.company.name = companyName.value;
        }

        if (companyDescription) {
            this.data.company.description = companyDescription.value;
        }

        // جمع بيانات الإعدادات
        const mainPhone = document.getElementById('main-phone');
        const whatsappNumber = document.getElementById('whatsapp-number');

        if (mainPhone) {
            this.data.contact.phone = mainPhone.value;
        }

        if (whatsappNumber) {
            this.data.contact.whatsapp.number = whatsappNumber.value;
        }
    }

    /**
     * تحديث زر الحفظ
     */
    updateSaveButton() {
        const saveButton = document.querySelector('button[onclick*="saveChanges"]');
        if (saveButton) {
            if (this.hasUnsavedChanges) {
                saveButton.classList.add('bg-orange-500', 'hover:bg-orange-600');
                saveButton.classList.remove('bg-primary', 'hover:bg-primary/90');
            } else {
                saveButton.classList.remove('bg-orange-500', 'hover:bg-orange-600');
                saveButton.classList.add('bg-primary', 'hover:bg-primary/90');
            }
        }
    }

    /**
     * إخفاء شاشة التحميل
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }

    /**
     * عرض رسالة تنبيه
     */
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type} text-white px-6 py-4 rounded-lg shadow-lg saudi-regular flex items-center space-x-3 space-x-reverse max-w-sm`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            ${icon}
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // إزالة التنبيه بعد 3 ثوان
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * الحصول على أيقونة التنبيه
     */
    getToastIcon(type) {
        const icons = {
            success: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
            error: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
            warning: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
            info: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
        };
        return icons[type] || icons.info;
    }

    /**
     * تبديل إظهار/إخفاء تفاصيل الإحصائيات
     */
    toggleStatsDetails(statType) {
        const detailsElement = document.getElementById(`${statType}-details`);
        if (!detailsElement) return;

        // إخفاء جميع التفاصيل الأخرى أولاً
        document.querySelectorAll('[id$="-details"]').forEach(detail => {
            if (detail.id !== `${statType}-details`) {
                detail.classList.add('hidden');
            }
        });

        // تبديل حالة التفاصيل الحالية
        detailsElement.classList.toggle('hidden');
        
        // إضافة تأثير سلس
        if (!detailsElement.classList.contains('hidden')) {
            detailsElement.style.opacity = '0';
            detailsElement.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                detailsElement.style.transition = 'all 0.3s ease';
                detailsElement.style.opacity = '1';
                detailsElement.style.transform = 'translateY(0)';
            }, 10);
        }
    }
}

// تهيئة لوحة التحكم عند تحميل الصفحة
let adminApp;
document.addEventListener('DOMContentLoaded', () => {
    adminApp = new AdminPanel();
});
