// src/i18n/en.js — English translations
const en = {
  // Navigation labels
  nav: {
    home:         'Home',
    projects:     'Projects',
    network:      'Network',
    reports:      'Reports',
    verify:       'Verify',
    messages:     'Messages',
    notifications:'Notifications',
    createProject:'+ Create Project',
    admin:        'ADMIN',
    myProfile:    'My Profile',
    signOut:      'Sign Out',
  },

  // Left Sidebar
  sidebar: {
    connections:  'Connections',
    projects:     'Projects',
    mySkills:     'My Skills',
    noBio:        'No bio provided. Update your profile.',
    noSkills:     'No skills added',
    moreSkills:   (n) => `+${n} more`,
  },

  // Right Sidebar Widgets
  widgets: {
    suggestedProjects:    'Suggested Projects',
    suggestedConnections: 'Suggested Connections',
    noProjectSuggestions: 'No project suggestions yet.',
    noUserSuggestions:    'No user suggestions yet.',
    loadingSuggestions:   'Loading suggestions...',
    matchPercent:         (n) => `${n}% Match`,
    connect:              'Connect',
  },

  // Roles
  roles: {
    admin:     'Admin',
    moderator: 'Moderator',
    user:      'Regular User',
  },

  // Common
  common: {
    loading:    'Loading...',
    save:       'Save',
    cancel:     'Cancel',
    confirm:    'Confirm',
    delete:     'Delete',
    edit:       'Edit',
    apply:      'Apply',
    submit:     'Submit',
    back:       'Back',
    search:     'Search',
    filter:     'Filter',
    seeAll:     'See All',
    noResults:  'No results found.',
    error:      'Something went wrong. Please try again.',
  },

  // Landing Page
  landing: {
    navWhy: 'Why CoFound',
    navFeatures: 'Features',
    navAbout: 'About Us',
    signIn: 'Sign In',
    getStarted: 'Get Started',
    heroTitle: 'Where innovators meet, build, and launch.',
    heroSubtitle: 'Connecting entrepreneurs, developers, and creators to build startups together using advanced AI assistance.',
    exploreProjects: 'Explore Projects',
    trustedBy: 'TRUSTED BY INNOVATIVE TEAMS WORLDWIDE',
    
    // Why CoFound
    whyTitle: 'Why CoFound',
    challengeTitle: 'The Challenge',
    challengeDesc: 'Finding qualified co-founders is difficult, communication is often fragmented across multiple apps, and early-stage startups lack structured guidance.',
    solutionTitle: 'The CoFound Solution',
    solutionDesc: 'We unite team formation, secure real-time collaboration, and powerful AI validation tools under one unified, premium dashboard.',

    // How It Works
    howItWorksTitle: 'How It Works',
    step1Title: 'Create Profile',
    step1Desc: 'Build your profile and showcase your core skills and vision.',
    step2Title: 'Match & Connect',
    step2Desc: 'Smart match with ideal partners or utilize our AI Assistants.',
    step3Title: 'Launch Workspace',
    step3Desc: 'Launch and manage your project in a secure, unified workspace.',

    // Features Grid
    features: 'Features',
    feature1Title: 'Co-Founder Matchmaking',
    feature1Desc: 'Smart matching based on complementary skills, shared vision, and AI-driven startup evaluation to find the perfect partners.',
    feature2Title: 'Advanced Chat & Messaging',
    feature2Desc: 'Real-time chat channels, group messaging for teams, and direct context sharing directly integrated into your project.',
    feature3Title: 'AI Startup Assistants',
    feature3Desc: 'Leverage integrated AI agents to assist with brainstorming, code reviews, business planning, and technical documentation.',
    feature4Title: 'Unified Project Workspace',
    feature4Desc: 'A centralized hub for team formation, video calls, file sharing, and agile task management in a premium dashboard.',

    // Footer
    footerProduct: 'Product',
    footerIntegrations: 'Integrations',
    footerSolutions: 'Solutions',
    footerCompany: 'Company',
    footerAboutUs: 'About Us',
    footerCareers: 'Careers',
    footerContact: 'Contact',
    footerResources: 'Resources',
    footerDocs: 'Documentation',
    footerHelp: 'Help Center',
    footerCommunity: 'Community',
    footerCopyright: '© 2026 CoFound. All rights reserved.',
  },

  // Register Page
  register: {
    heroTitle: 'Build the future, together.',
    heroSubtitle: 'Create your CoFound account today. Connect with qualified partners, form elite teams, and transform projects into real-world startups.',
  },

  // Stage 1 — Unverified Email Gate
  verifyEmail: {
    title:          'Verify Your Email',
    subtitle:       'We sent a confirmation link to your inbox.',
    instruction:    "Click the link in the email to activate your account. If you don't see it, check your spam folder.",
    resendBtn:      'Resend Verification Email',
    resendCooldown: (s) => `Resend in ${s}s`,
    resendSuccess:  'A new verification email has been sent!',
    resendError:    'Failed to resend. Please try again.',
    logoutBtn:      'Sign Out',
    checkEmail:     'Check Your Inbox',
    noEmail:        "Didn't receive an email?",
  },

  // Stage 2 — Guest Identity Verification Gate
  verifyIdentity: {
    title:       'Identity Verification',
    subtitle:    'One last step before you unlock the full platform.',
    instruction: 'Upload a clear photo of the front and back of your national ID. Our team will review and activate your account.',
    pending:     'Your verification is under review. We\'ll notify you once approved.',
    approved:    'Verification approved! Redirecting...',
  },
}

export default en
