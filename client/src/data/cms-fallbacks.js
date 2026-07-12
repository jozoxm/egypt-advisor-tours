export const fallbackNavigation = {
  logoText: 'Egypt Advisor Tours',
  primaryLinks: [
    { label: 'Home', href: '/', type: 'route' },
    { label: 'Tours', href: '/tours', type: 'route' },
    { label: 'Blogs', href: '/blogs', type: 'route' },
    { label: 'Destinations', href: '/destinations', type: 'route' },
    { label: 'Special Offers', href: '/special-offers', type: 'route' },
    { label: 'About', href: '/about', type: 'route' },
    { label: 'FAQ', href: '/faq', type: 'route' },
  ],
  secondaryLinks: [],
  cta: {
    label: 'Trip Tailor',
    action: 'open-tailor-trip-modal',
  },
  mobileMenu: {
    enabled: true,
    ctaLabel: '✨ Tailor My Trip',
  },
};

export const fallbackFooter = {
  companyBlurb: 'Your trusted partner in discovering the wonders of Ancient Egypt',
  quickLinks: [
    { label: 'Tours', href: '/tours', type: 'route' },
    { label: 'Blogs', href: '/blogs', type: 'route' },
    { label: 'Destinations', href: '/destinations', type: 'route' },
    { label: 'Special Offers', href: '/special-offers', type: 'route' },
    { label: 'About Us', href: '/about', type: 'route' },
    { label: 'FAQ', href: '/faq', type: 'route' },
  ],
  legalLinks: [],
  copyright: `© ${new Date().getFullYear()} Egypt Advisor Tours. All rights reserved. | Privacy Policy | Terms of Service`,
};

export const fallbackHomepage = {
  hero: {
    badge: '🌟 Premium Travel Experiences',
    title: 'Discover the Wonders of Ancient Egypt',
    subtitle:
      'Embark on an unforgettable journey through millennia of history, culture, and breathtaking landscapes with expert local guides',
    primaryButtonText: 'Explore Tours',
    primaryButtonHref: '#tours',
    secondaryButtonText: 'Plan My Trip',
    secondaryButtonAction: 'open-tailor-trip-modal',
    backgroundImage: '',
  },
  highlights: [
    { value: '5000+', label: 'Happy Travelers' },
    { value: '25+', label: 'Unique Tours' },
    { value: '15+', label: 'Years Experience' },
    { value: '4.9★', label: 'Average Rating' },
  ],
  featuredSectionTitle: 'Signature Experiences',
};

export const fallbackAbout = {
  pageTitle: 'Why Egypt Advisor?',
  intro: "We're not just a tour company – we're your gateway to authentic Egyptian experiences",
  sections: [
    {
      icon: '🎓',
      title: 'Expert Guides',
      body: 'Certified Egyptologists with decades of combined experience sharing their passion for ancient history',
    },
    {
      icon: '🛡️',
      title: 'Safety & Comfort',
      body: 'Your safety is paramount. Climate-controlled vehicles and premium accommodations included',
    },
    {
      icon: '💎',
      title: 'Exclusive Access',
      body: 'Private viewings and special permits to explore off-the-beaten-path archaeological sites',
    },
    {
      icon: '🌍',
      title: 'Personalized Service',
      body: 'Custom itineraries tailored to your interests, pace, and travel style',
    },
    {
      icon: '⭐',
      title: 'Best Value',
      body: 'Transparent pricing with no hidden fees. Premium experiences at competitive rates',
    },
    {
      icon: '🤝',
      title: '24/7 Support',
      body: 'Round-the-clock customer support before, during, and after your journey',
    },
  ],
};

export const fallbackFaq = {
  pageTitle: 'Frequently Asked Questions',
  pageIntro: 'Everything you need to know before you travel with us.',
  categories: [
    {
      title: 'Planning & Booking',
      items: [
        {
          question: 'How far in advance should I book?',
          answer: 'We recommend booking 2–6 weeks in advance to secure your preferred dates.',
        },
        {
          question: 'Can you customize private tours?',
          answer: 'Yes. We can tailor itinerary pace, destinations, and activities to your preferences.',
        },
      ],
    },
    {
      title: 'Before You Travel',
      items: [
        {
          question: 'Do you help with airport pickup and transport?',
          answer: 'Yes, airport pickup and all local transport can be included in your itinerary.',
        },
        {
          question: 'Can dietary needs be accommodated?',
          answer: 'Absolutely. Share your requirements and we will plan suitable meal options.',
        },
      ],
    },
  ],
  contactCta: {
    title: 'Still have questions?',
    description: 'Our team is here to help you plan with confidence.',
    actionLabel: 'Tailor My Trip',
    action: 'open-tailor-trip-modal',
  },
};

export const fallbackTailorTrip = {
  hero: {
    title: 'Tailor Your Egypt Journey',
    subtitle:
      "Share your dream experiences and we'll craft a bespoke itinerary with expert Egyptologists, luxury stays, and seamless logistics.",
  },
  highlights: [
    '✔️ Private guides & skip-the-line access',
    '✔️ Handpicked stays in Cairo, Luxor, Aswan & the Red Sea',
    '✔️ Flexible pace with cultural, culinary, and family-friendly options',
  ],
  form: {
    title: 'Tell us your travel preferences',
    submitLabel: 'Tailor my trip',
    successMessage: "✓ Thank you! We've received your enquiry and will be in touch within 24 hours.",
    fields: {
      fullName: {
        label: 'Full Name',
        placeholder: 'Full Name',
      },
      email: {
        label: 'Email Address',
        placeholder: 'Email Address',
      },
      phone: {
        label: 'Phone number (international format)',
        placeholder: '+20 123 456 7890 (WhatsApp)',
      },
      whatsapp: {
        label: 'WhatsApp',
      },
      travelDates: {
        label: 'Preferred travel dates or month',
        placeholder: 'Preferred travel dates or month (e.g., Oct 2026)',
      },
      travelers: {
        label: 'Number of travelers',
        placeholder: 'Number of travelers',
      },
      travelStyle: {
        label: 'Travel style',
        placeholder: 'Travel style',
        options: [
          { value: 'luxury', label: 'Luxury & private' },
          { value: 'cultural', label: 'Cultural immersion' },
          { value: 'adventure', label: 'Adventure & outdoors' },
          { value: 'family', label: 'Family friendly' },
        ],
      },
      accommodation: {
        label: 'Accommodation preference',
        placeholder: 'Accommodation preference',
        options: [
          { value: 'boutique', label: 'Boutique & character stays' },
          { value: 'luxury-hotels', label: 'Luxury hotels & resorts' },
          { value: 'heritage', label: 'Heritage stays & eco-lodges' },
          { value: 'budget', label: 'Comfort/budget friendly' },
        ],
      },
      interests: {
        label: 'Travel interests (select all that apply)',
        options: [
          { value: 'history', label: 'Ancient history & temples' },
          { value: 'nile', label: 'Nile cruise experiences' },
          { value: 'red-sea', label: 'Red Sea beaches & diving' },
          { value: 'food', label: 'Food & culinary tours' },
          { value: 'desert', label: 'Desert adventures & oases' },
          { value: 'family', label: 'Family-friendly activities' },
        ],
      },
      pace: {
        label: 'Preferred trip pace',
        placeholder: 'Preferred pace',
        options: [
          { value: 'relaxed', label: 'Relaxed (more downtime)' },
          { value: 'balanced', label: 'Balanced (mix of sights & rest)' },
          { value: 'packed', label: 'See-it-all (full days)' },
        ],
      },
      budget: {
        label: 'Budget range',
        placeholder: 'Budget range',
        options: [
          { value: 'premium', label: 'Premium (top-tier)' },
          { value: 'mid', label: 'Mid-range' },
          { value: 'value', label: 'Value-focused' },
        ],
      },
      destinations: {
        label: 'Must-see sites (optional)',
        placeholder: 'Must-see sites (optional, e.g., Giza, Abu Simbel, Nile cruise)',
      },
      language: {
        label: 'Guiding language preference',
        placeholder: 'Guiding language (optional)',
        options: [
          { value: 'english', label: 'English' },
          { value: 'arabic', label: 'Arabic' },
          { value: 'french', label: 'French' },
          { value: 'spanish', label: 'Spanish' },
          { value: 'german', label: 'German' },
          { value: 'other', label: 'Other (share in notes)' },
        ],
      },
      notes: {
        label: 'Trip notes',
        placeholder: 'Tell us about your ideal Egypt trip, interests, and pace.',
      },
    },
  },
  contactBlock: {
    title: 'Need help right now?',
    description: 'You can also reach us directly:',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
  },
};
