export type Locale = "en" | "ar";
export const locales: Locale[] = ["en", "ar"];
export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);

const en = {
  dir: "ltr",
  nav: { home: "Home", about: "About", services: "Services", industries: "Industries", work: "Our Work", process: "Our Process", insights: "Insights", contact: "Contact", cta: "Start a project", language: "العربية" },
  footer: { blurb: "We build thoughtful digital products for businesses ready to move forward.", explore: "Explore", services: "Services", connect: "Connect", rights: "All rights reserved.", privacy: "Privacy policy", terms: "Terms & conditions", contact: "Let’s talk about what you’re building." },
  common: { learn: "Explore service", view: "View case study", concept: "Concept project", start: "Start a project", discuss: "Discuss your project", back: "Back to our work", selected: "Selected work", noResults: "No projects in this category yet.", all: "All work", read: "Explore our approach", deliverables: "What you can expect", involvement: "Your involvement", example: "Internal concept demonstration. This is not a client deployment or a verified business result." },
  home: {
    eyebrow: "Digital products, made practical",
    title: "Building digital products that move businesses forward.",
    intro: "From custom websites and software systems to scalable SaaS platforms, NextGinX transforms ambitious ideas into powerful digital solutions.",
    primary: "Start your project", secondary: "Explore our work", visual: "One clear direction. Built to grow.", visualSub: "Thoughtful engineering, from first sketch to launch.",
    trustTitle: "Built around what your business needs next.", trustIntro: "The right technology should make the next step clearer, not harder.",
    strengths: ["Business-focused solutions", "Scalable architecture", "Modern technology", "Quality-driven development", "Reliable delivery"],
    servicesEyebrow: "What we do", servicesTitle: "The expertise to take your idea further.", servicesIntro: "From first concept to a product your customers rely on, the right disciplines come together around your goals.",
    workEyebrow: "Selected concepts", workTitle: "A look at what we can build together.", workIntro: "These internal demonstrations show our approach to product thinking and engineering. They are concepts, not client deployments.",
    whyEyebrow: "Why NextGinX", whyTitle: "A thoughtful technology partner, at every step.", whyIntro: "Good software comes from understanding the people and the business behind it.",
    why: ["One connected team", "Business before buzzwords", "A complete product journey", "Quality that holds up", "A way of working that fits"],
    whyText: ["Design, engineering, and product thinking move together from day one.", "We start with the challenge you need to solve, then choose the tools that fit.", "From early discovery and design through launch and ongoing support.", "We build for clarity, maintainability, and the real conditions your product will face.", "Choose a scoped project, an ongoing retainer, or a SaaS subscription."],
    processEyebrow: "How we work", processTitle: "A clear path from idea to impact.", processIntro: "Each stage brings structure to the work and keeps decisions visible.",
    engagementEyebrow: "Flexible by design", engagementTitle: "A working model that fits your plans.",
    engagement: ["Fixed-price projects", "SaaS subscriptions", "Dedicated development & retainers"],
    engagementText: ["Defined scope, milestones, deliverables, and agreed pricing.", "Recurring monthly or annual plans based on the product and selected tier.", "Ongoing engineering capacity and technical services on agreed terms."],
    finalTitle: "Have an idea? Let’s build it together.", finalText: "Tell us what you’re working toward. We’ll help you find a practical way to get there.",
  },
  about: {
    eyebrow: "A partner for what’s next", title: "Technology with a clear purpose.", intro: "NextGinX helps businesses turn ideas into reliable digital products through custom software development, web applications, and scalable SaaS solutions.",
    mission: "Our mission", missionText: "To empower businesses with reliable, scalable, and innovative digital solutions that create measurable business value.",
    vision: "Our vision", visionText: "To become a trusted technology partner for businesses building the next generation of digital products.",
    valuesTitle: "The principles behind the product.", values: ["Innovation", "Quality", "Transparency", "Collaboration", "Ownership", "Continuous improvement"],
    approachTitle: "Engineering that starts with listening.", approachText: "We bring product, design, and engineering into the same conversation early. That helps us agree what matters, reduce uncertainty, and make deliberate technical choices that support the business over time.",
    capabilitiesTitle: "A connected set of capabilities.", capabilities: ["Product strategy & discovery", "UI/UX and product design", "Frontend and backend engineering", "Cloud infrastructure & DevOps", "Quality assurance & ongoing care"],
  },
  services: {
    eyebrow: "Capabilities", title: "The right tools for the work ahead.", intro: "A considered mix of design, engineering, and ongoing support for the products and systems your business depends on.",
    detailLabel: "Our services", detailTitle: "Build with confidence, from the first decision onward.", detailIntro: "Each engagement is shaped around your product, users, constraints, and next milestone.",
  },
  industries: {
    eyebrow: "Industries we can support", title: "Technology that adapts to your world.", intro: "Every industry has different workflows, pressures, and opportunities. We shape digital solutions around the details of your business.",
    note: "The examples below describe possible areas of work, not a claim of prior client deployments.", problem: "Common challenge", solution: "Possible digital response",
  },
  work: {
    eyebrow: "Our work", title: "Ideas brought to life with intention.", intro: "Explore concept demonstrations that show how we think about product experience, useful workflows, and robust foundations.",
    note: "All projects shown are internal concept demonstrations, created to illustrate capabilities. No client relationships or business outcomes are implied.", challenge: "The challenge", solution: "Our approach", features: "Key features", stack: "Technology direction", results: "Outcome", resultsText: "This internal concept has no client deployment or verified business results to report.",
  },
  process: {
    eyebrow: "Our process", title: "Clear decisions at every stage.", intro: "A collaborative journey that turns an open-ended idea into a product your team can own and grow.", deliverables: "Deliverables", involvement: "Your role",
  },
  insights: { eyebrow: "Insights", title: "Ideas for building better software.", intro: "Notes and perspectives on software engineering, SaaS, digital transformation, and business automation.", emptyTitle: "Thoughtful writing is on the way.", emptyText: "There are no published articles yet. Check back soon for practical ideas from the NextGinX team.", badge: "Publishing soon" },
  contact: {
    eyebrow: "Start a conversation", title: "Tell us what you’re building.", intro: "Share a little about your idea or challenge. We’ll use it to understand where a conversation could start.", formTitle: "Project details", name: "Your name", company: "Company name", email: "Work email", phone: "Phone / WhatsApp", country: "Country", service: "Service required", budget: "Estimated budget", description: "Tell us about your project", preferred: "Preferred contact method", send: "Send project enquiry", sending: "Sending…", required: "Required", select: "Choose an option", optional: "Optional", success: "Thanks, we received your enquiry. Our team will review it and follow up.", error: "We couldn’t submit your enquiry. Please try again in a moment.", notConfigured: "The contact form is not connected yet. Please check back after the company email and delivery settings are configured.", privacy: "We use your details to review and respond to your enquiry.", emailLabel: "Email", whatsappLabel: "WhatsApp", budgetOptions: ["Under $5,000", "$5,000–$15,000", "$15,000–$50,000", "$50,000+", "Not sure yet"], serviceOptions: ["Website development", "Custom software", "SaaS development", "UI/UX design", "Cloud & DevOps", "API integration", "Maintenance & support", "E-commerce development", "Other"], contactOptions: ["Email", "Phone", "WhatsApp"]
  },
  legal: { privacyTitle: "Privacy policy", termsTitle: "Terms & conditions", placeholder: "This page is a content placeholder and must be reviewed and completed by NextGinX before publication. It is not legal advice.", edited: "Content owner: NextGinX. Review date: to be set." },
  formErrors: { name: "Enter your name.", email: "Enter a valid email address.", service: "Choose a service.", description: "Add a short project description.", tooLong: "This field is too long.", generic: "Please check the form and try again." },
};

const ar: typeof en = {
  dir: "rtl",
  nav: { home: "الرئيسية", about: "من نحن", services: "خدماتنا", industries: "القطاعات", work: "أعمالنا", process: "آلية العمل", insights: "المقالات", contact: "تواصل معنا", cta: "ابدأ مشروعك", language: "English" },
  footer: { blurb: "نطوّر منتجات رقمية مدروسة للشركات التي تستعد للخطوة التالية.", explore: "استكشف", services: "الخدمات", connect: "تواصل", rights: "جميع الحقوق محفوظة.", privacy: "سياسة الخصوصية", terms: "الشروط والأحكام", contact: "لنتحدث عمّا تعمل على بنائه." },
  common: { learn: "اكتشف الخدمة", view: "عرض دراسة الحالة", concept: "مشروع تصوري", start: "ابدأ مشروعك", discuss: "ناقش مشروعك", back: "العودة إلى أعمالنا", selected: "نماذج مختارة", noResults: "لا توجد مشاريع في هذا التصنيف حاليًا.", all: "كل الأعمال", read: "اكتشف منهجيتنا", deliverables: "ما ستحصل عليه", involvement: "مشاركتك", example: "عرض توضيحي داخلي. ليس مشروعًا منفذًا لعميل أو نتيجة تجارية مؤكدة." },
  home: {
    eyebrow: "منتجات رقمية برؤية عملية", title: "نبني منتجات رقمية تدفع أعمالك إلى الأمام.", intro: "من المواقع المخصصة وأنظمة البرمجيات إلى منصات SaaS القابلة للتوسع، تحوّل NextGinX الأفكار الطموحة إلى حلول رقمية فعّالة.", primary: "ابدأ مشروعك", secondary: "استكشف أعمالنا", visual: "اتجاه واضح. مصمم للنمو.", visualSub: "هندسة مدروسة، من الفكرة الأولى حتى الإطلاق.",
    trustTitle: "نبدأ بما يحتاجه عملك في خطوته القادمة.", trustIntro: "التقنية المناسبة تجعل خطوتك التالية أوضح وأسهل.", strengths: ["حلول تركز على الأعمال", "بنية قابلة للتوسع", "تقنيات حديثة", "تطوير يضع الجودة أولًا", "تسليم يمكن الاعتماد عليه"],
    servicesEyebrow: "ماذا نقدم", servicesTitle: "خبرات تساعد فكرتك على التقدم.", servicesIntro: "من الفكرة الأولى إلى منتج يعتمد عليه عملاؤك، نجمع التخصصات المناسبة حول أهدافك.",
    workEyebrow: "نماذج تصورية", workTitle: "لمحة عمّا يمكننا بناؤه معًا.", workIntro: "تعرض هذه النماذج الداخلية أسلوبنا في التفكير بالمنتجات والهندسة. وهي تصورات وليست مشاريع منفذة لعملاء.",
    whyEyebrow: "لماذا NextGinX", whyTitle: "شريك تقني مدروس في كل خطوة.", whyIntro: "البرمجيات الجيدة تبدأ بفهم الأشخاص والعمل الذي تقف وراءه.",
    why: ["فريق متكامل", "الأعمال قبل المصطلحات الرنانة", "رحلة متكاملة للمنتج", "جودة تدوم", "أسلوب عمل يناسبك"], whyText: ["يتعاون التصميم والهندسة والتفكير بالمنتج منذ اليوم الأول.", "نبدأ بالتحدي الذي تريد حله، ثم نختار التقنية المناسبة.", "من الاستكشاف والتصميم إلى الإطلاق والدعم المستمر.", "نبني حلولًا واضحة وسهلة الصيانة وتلائم ظروف منتجك الفعلية.", "اختر مشروعًا محدد النطاق أو تعاونًا مستمرًا أو اشتراكًا برمجيًا."],
    processEyebrow: "كيف نعمل", processTitle: "طريق واضح من الفكرة إلى الأثر.", processIntro: "تمنح كل مرحلة العمل هيكلًا واضحًا وتجعل القرارات مرئية.",
    engagementEyebrow: "مرونة في التعاون", engagementTitle: "نموذج عمل يلائم خططك.", engagement: ["مشاريع بسعر ثابت", "اشتراكات SaaS", "فريق تطوير مخصص واتفاقيات مستمرة"], engagementText: ["نطاق ومراحل ومخرجات محددة بسعر متفق عليه.", "اشتراكات شهرية أو سنوية بحسب المنتج والخطة المختارة.", "قدرات هندسية وخدمات تقنية مستمرة وفق اتفاق محدد."],
    finalTitle: "لديك فكرة؟ لنبنها معًا.", finalText: "أخبرنا بما تسعى إلى تحقيقه، وسنساعدك في إيجاد طريق عملي للوصول إليه.",
  },
  about: { eyebrow: "شريك لخطوتك القادمة", title: "تقنية ذات هدف واضح.", intro: "تساعد NextGinX الشركات على تحويل الأفكار إلى منتجات رقمية موثوقة من خلال تطوير البرمجيات المخصصة وتطبيقات الويب ومنصات SaaS القابلة للتوسع.", mission: "رسالتنا", missionText: "تمكين الشركات من خلال حلول رقمية موثوقة وقابلة للتوسع ومبتكرة تحقق قيمة ملموسة للأعمال.", vision: "رؤيتنا", visionText: "أن نصبح شريكًا تقنيًا موثوقًا للشركات التي تبني الجيل القادم من المنتجات الرقمية.", valuesTitle: "مبادئ توجه عملنا.", values: ["الابتكار", "الجودة", "الشفافية", "التعاون", "تحمل المسؤولية", "التطوير المستمر"], approachTitle: "هندسة تبدأ بالإنصات.", approachText: "نجمع بين المنتج والتصميم والهندسة في نقاش واحد منذ البداية. يساعدنا ذلك على تحديد الأولويات وتقليل الغموض واتخاذ قرارات تقنية مدروسة تدعم العمل على المدى الطويل.", capabilitiesTitle: "خبرات مترابطة.", capabilities: ["استراتيجية المنتج والاستكشاف", "تصميم تجربة وواجهة المستخدم", "هندسة الواجهات والأنظمة الخلفية", "البنية السحابية وDevOps", "ضمان الجودة والدعم المستمر"] },
  services: { eyebrow: "قدراتنا", title: "الأدوات المناسبة لما ينتظرك.", intro: "مزيج مدروس من التصميم والهندسة والدعم المستمر للمنتجات والأنظمة التي يعتمد عليها عملك.", detailLabel: "خدماتنا", detailTitle: "ابنِ بثقة، من أول قرار حتى الإطلاق.", detailIntro: "نصمم كل تعاون بما يناسب منتجك ومستخدميك وقيودك ومحطتك القادمة." },
  industries: { eyebrow: "قطاعات يمكننا دعمها", title: "تقنية تتكيف مع عالمك.", intro: "لكل قطاع مسارات عمل وضغوط وفرص مختلفة. نصمم الحلول الرقمية بما يناسب تفاصيل عملك.", note: "تصف الأمثلة التالية مجالات عمل محتملة ولا تدّعي وجود مشاريع سابقة منشورة.", problem: "تحدٍ شائع", solution: "حل رقمي محتمل" },
  work: { eyebrow: "أعمالنا", title: "أفكار تنبض بالحياة عن قصد.", intro: "استكشف نماذج تصورية توضّح تفكيرنا في تجربة المنتج ومسارات العمل المفيدة والبنية القوية.", note: "كل المشاريع المعروضة نماذج داخلية لتوضيح قدراتنا. لا تشير إلى علاقات مع عملاء أو نتائج تجارية.", challenge: "التحدي", solution: "منهجيتنا", features: "الميزات الرئيسية", stack: "التوجه التقني", results: "النتائج", resultsText: "هذا النموذج الداخلي ليس له نشر لدى عميل أو نتائج تجارية مؤكدة." },
  process: { eyebrow: "آلية العمل", title: "قرارات واضحة في كل مرحلة.", intro: "رحلة تعاونية تحول الفكرة إلى منتج يستطيع فريقك امتلاكه وتطويره.", deliverables: "المخرجات", involvement: "دورك" },
  insights: { eyebrow: "مقالات ورؤى", title: "أفكار لبناء برمجيات أفضل.", intro: "رؤى حول هندسة البرمجيات وSaaS والتحول الرقمي وأتمتة الأعمال.", emptyTitle: "محتوى مدروس قريبًا.", emptyText: "لا توجد مقالات منشورة حتى الآن. تابعنا قريبًا لأفكار عملية من فريق NextGinX.", badge: "قريبًا" },
  contact: { eyebrow: "لنبدأ حوارًا", title: "أخبرنا عمّا تعمل على بنائه.", intro: "شاركنا بعض التفاصيل عن فكرتك أو التحدي الذي تواجهه، لنفهم كيف يمكن أن نبدأ الحديث.", formTitle: "تفاصيل المشروع", name: "اسمك", company: "اسم الشركة", email: "البريد الإلكتروني للعمل", phone: "الهاتف / واتساب", country: "الدولة", service: "الخدمة المطلوبة", budget: "الميزانية التقديرية", description: "أخبرنا عن مشروعك", preferred: "طريقة التواصل المفضلة", send: "إرسال استفسار المشروع", sending: "جارٍ الإرسال…", required: "مطلوب", select: "اختر خيارًا", optional: "اختياري", success: "شكرًا، استلمنا استفسارك. سيراجعه فريقنا وسيتواصل معك.", error: "تعذر إرسال استفسارك. حاول مرة أخرى بعد قليل.", notConfigured: "نموذج التواصل غير متصل بعد. يرجى العودة بعد إعداد بريد الشركة وخدمة الإرسال.", privacy: "نستخدم بياناتك لمراجعة استفسارك والرد عليك.", emailLabel: "البريد الإلكتروني", whatsappLabel: "واتساب", budgetOptions: ["أقل من ٥٬٠٠٠ دولار", "٥٬٠٠٠–١٥٬٠٠٠ دولار", "١٥٬٠٠٠–٥٠٬٠٠٠ دولار", "أكثر من ٥٠٬٠٠٠ دولار", "لم أحدد بعد"], serviceOptions: ["تطوير المواقع", "برمجيات مخصصة", "تطوير SaaS", "تصميم تجربة وواجهة المستخدم", "الحوسبة السحابية وDevOps", "تكامل API", "الصيانة والدعم", "تطوير التجارة الإلكترونية", "أخرى"], contactOptions: ["البريد الإلكتروني", "الهاتف", "واتساب"] },
  legal: { privacyTitle: "سياسة الخصوصية", termsTitle: "الشروط والأحكام", placeholder: "هذه الصفحة قالب للمحتوى، ويجب أن تراجعها NextGinX وتكملها قبل النشر. لا تعد استشارة قانونية.", edited: "مالك المحتوى: NextGinX. تاريخ المراجعة: يحدد لاحقًا." },
  formErrors: { name: "أدخل اسمك.", email: "أدخل بريدًا إلكترونيًا صحيحًا.", service: "اختر خدمة.", description: "أضف وصفًا موجزًا للمشروع.", tooLong: "هذا الحقل طويل جدًا.", generic: "راجع النموذج وحاول مرة أخرى." },
};

export const copy = (locale: Locale) => locale === "ar" ? ar : en;
