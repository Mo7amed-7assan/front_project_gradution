// src/i18n/ar.js — Arabic translations (العربية)
const ar = {
  // Navigation labels
  nav: {
    home:         'الرئيسية',
    projects:     'المشاريع',
    network:      'الشبكة',
    reports:      'التقارير',
    verify:       'التحقق',
    messages:     'الرسائل',
    notifications:'الإشعارات',
    createProject:'+ إنشاء مشروع',
    admin:        'الإدارة',
    myProfile:    'ملفي الشخصي',
    signOut:      'تسجيل الخروج',
  },

  // Left Sidebar
  sidebar: {
    connections:  'التواصل',
    projects:     'المشاريع',
    mySkills:     'مهاراتي',
    noBio:        'لا توجد نبذة. قم بتحديث ملفك الشخصي.',
    noSkills:     'لم تُضف مهارات بعد',
    moreSkills:   (n) => `+${n} أخرى`,
  },

  // Right Sidebar Widgets
  widgets: {
    suggestedProjects:    'مشاريع مقترحة',
    suggestedConnections: 'اتصالات مقترحة',
    noProjectSuggestions: 'لا توجد مشاريع مقترحة بعد.',
    noUserSuggestions:    'لا توجد اقتراحات بعد.',
    loadingSuggestions:   'جاري تحميل الاقتراحات...',
    matchPercent:         (n) => `${n}% تطابق`,
    connect:              'تواصل',
  },

  // Roles
  roles: {
    admin:     'مدير',
    moderator: 'مشرف',
    user:      'مستخدم عادي',
  },

  // Common
  common: {
    loading:    'جاري التحميل...',
    save:       'حفظ',
    cancel:     'إلغاء',
    confirm:    'تأكيد',
    delete:     'حذف',
    edit:       'تعديل',
    apply:      'تقدم',
    submit:     'إرسال',
    back:       'رجوع',
    search:     'بحث',
    filter:     'تصفية',
    seeAll:     'عرض الكل',
    noResults:  'لا توجد نتائج.',
    error:      'حدث خطأ. يرجى المحاولة مرة أخرى.',
  },

  // Landing Page
  landing: {
    navWhy: 'لماذا CoFound',
    navFeatures: 'الميزات',
    navAbout: 'معلومات عنا',
    signIn: 'تسجيل الدخول',
    getStarted: 'ابدأ الآن',
    heroTitle: 'حيث يلتقي المبتكرون، يبنون، ويطلقون.',
    heroSubtitle: 'نربط رواد الأعمال والمطورين والمبدعين لبناء شركات ناشئة معاً باستخدام المساعدة المتقدمة للذكاء الاصطناعي.',
    exploreProjects: 'استكشف المشاريع',
    trustedBy: 'موثوق من قبل فرق مبتكرة حول العالم',
    
    // Why CoFound
    whyTitle: 'لماذا CoFound',
    challengeTitle: 'التحدي',
    challengeDesc: 'من الصعب العثور على شركاء مؤسسين مؤهلين، التواصل مشتت بين تطبيقات متعددة، والشركات الناشئة تفتقر إلى التوجيه الهيكلي.',
    solutionTitle: 'حل CoFound',
    solutionDesc: 'نجمع بين تكوين الفِرَق، التعاون الآمن في الوقت الفعلي، وأدوات التحقق القوية للذكاء الاصطناعي تحت لوحة تحكم واحدة مميزة.',

    // How It Works
    howItWorksTitle: 'كيف يعمل',
    step1Title: 'إنشاء الملف الشخصي',
    step1Desc: 'قم ببناء ملفك الشخصي واعرض مهاراتك ورؤيتك الأساسية.',
    step2Title: 'التطابق والتواصل',
    step2Desc: 'تطابق ذكي مع شركاء مثاليين أو استخدم مساعدي الذكاء الاصطناعي.',
    step3Title: 'إطلاق مساحة العمل',
    step3Desc: 'قم بإطلاق وإدارة مشروعك في مساحة عمل موحدة وآمنة.',

    // Features Grid
    features: 'الميزات',
    feature1Title: 'التوفيق بين الشركاء',
    feature1Desc: 'تطابق ذكي يعتمد على المهارات التكميلية والرؤية المشتركة وتقييم الذكاء الاصطناعي للشركات الناشئة.',
    feature2Title: 'محادثات ومراسلة متقدمة',
    feature2Desc: 'قنوات محادثة في الوقت الفعلي، مراسلة جماعية للفرق، ومشاركة السياق المباشر المدمج في مشروعك.',
    feature3Title: 'مساعدو الذكاء الاصطناعي',
    feature3Desc: 'استفد من وكلاء الذكاء الاصطناعي المدمجين للمساعدة في العصف الذهني، مراجعة الكود، تخطيط الأعمال، والتوثيق التقني.',
    feature4Title: 'مساحة عمل موحدة',
    feature4Desc: 'مركز موحد لتكوين الفِرَق، مكالمات الفيديو، مشاركة الملفات، وإدارة المهام الرشيقة في لوحة تحكم متميزة.',

    // Footer
    footerProduct: 'المنتج',
    footerIntegrations: 'التكاملات',
    footerSolutions: 'الحلول',
    footerCompany: 'الشركة',
    footerAboutUs: 'معلومات عنا',
    footerCareers: 'الوظائف',
    footerContact: 'اتصل بنا',
    footerResources: 'الموارد',
    footerDocs: 'التوثيق',
    footerHelp: 'مركز المساعدة',
    footerCommunity: 'المجتمع',
    footerCopyright: '© 2026 CoFound. جميع الحقوق محفوظة.',
  },

  // Register Page
  register: {
    heroTitle: 'ابنِ المستقبل، معاً.',
    heroSubtitle: 'أنشئ حساب CoFound الخاص بك اليوم. تواصل مع شركاء مؤهلين، كوّن فرق نخبة، وحوّل المشاريع إلى شركات ناشئة على أرض الواقع.',
  },

  // Project Form (Create & Edit)
  projectForm: {
    createTitle: 'إنشاء مشروع',
    editTitle: 'تعديل المشروع',
    createSubtitle: 'حدد تفاصيل فكرة مشروعك الناشئ، الأدوار المطلوبة، والجدول الزمني.',
    editSubtitle: 'تحديث تفاصيل مشروعك الناشئ، المتطلبات، والتواريخ النهائية.',
    steps: {
      basicInfo: 'المعلومات الأساسية',
      rolesSkills: 'الأدوار والمهارات',
      timeline: 'الجدول الزمني'
    },
    labels: {
      projectTitle: 'العنوان',
      category: 'التصنيف',
      status: 'حالة المشروع',
      visibility: 'الظهور',
      shortDescription: 'وصف قصير',
      fullDescription: 'الوصف الكامل',
      goals: 'أهداف المشروع',
      goalsPlaceholder: 'صف أهداف المشروع والأثر المتوقع...',
      roles: 'الأدوار المطلوبة',
      roleTitle: 'المسمى الوظيفي للدور',
      positionsNeeded: 'الشواغر المطلوبة',
      description: 'الوصف',
      skillRequirements: 'المهارات المطلوبة',
      skillName: 'اسم المهارة',
      proficiency: 'مستوى الإتقان',
      required: 'مطلوب',
      minTeamSize: 'الحد الأدنى لحجم الفريق',
      maxTeamSize: 'الحد الأقصى لحجم الفريق',
      acceptingApplications: 'قبول طلبات الانضمام',
      startDate: 'تاريخ البدء',
      targetCompletionDate: 'تاريخ الانتهاء المستهدف',
      applicationDeadline: 'الموعد النهائي للتقديم',
      reviewTitle: 'مراجعة وتأكيد',
      reviewText: 'يرجى التحقق من تصنيف المشروع، الأهداف، حجم الفريق، والتواريخ النهائية قبل النشر.',
      reviewTextEdit: 'تأكيد التغييرات على الجدول الزمني للمشروع وإعدادات الملكية قبل الحفظ.'
    },
    statuses: {
      planning: 'تخطيط',
      active: 'نشط'
    },
    visibilities: {
      public: 'عام',
      private: 'خاص',
      unlisted: 'غير مدرج'
    },
    proficiencyNames: {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      expert: 'خبير'
    },
    buttons: {
      addRole: '+ إضافة دور',
      addSkill: '+ إضافة مهارة',
      remove: 'حذف',
      back: 'رجوع',
      continue: 'متابعة',
      creating: 'جاري الإنشاء...',
      createProject: 'إنشاء المشروع',
      saving: 'جاري الحفظ...',
      saveChanges: 'حفظ التغييرات'
    }
  }
}

export default ar
