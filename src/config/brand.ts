// Edit this single file to customize the entire site.
// Replace the default values with your own brand, content, and links.

export const site = {
  title: "AI Video Landing Page",
  description:
    "Ready-to-use landing page template for showcasing AI-powered video production services — featuring modern layouts, responsive design, and clear conversion.",
  author: "Lovable",
  lang: "en",
  url: "",
  ogImage: "",
} as const

export const brand = {
  name: "MOJJU",
  logoText: "MOJJU",
  tagline:
    "Revolutionizing video production with intelligent AI that understands creativity, storytelling, and human emotion.",
  cta: "Book a Call",
  ctaAction: () => {
    const contactSection = document.getElementById("contact")
    contactSection?.scrollIntoView({ behavior: "smooth" })
  },
} as const

export const navigation = {
  links: [
    { label: "Work", href: "#portfolio" },
    { label: "Process", href: "#about" },
    { label: "Capabilities", href: "#services" },
    { label: "Team", href: "#team" },
    { label: "Contact", href: "#contact" },
  ],
} as const

export const hero = {
  videoSrc: "https://mojli.s3.us-east-2.amazonaws.com/Mojli+Website+upscaled+(12mb).webm",
  headline: [
    "AI FILM",
    "PRODUCTION",
    "WITHOUT LIMITS",
  ],
  soundOnLabel: "Sound On",
} as const

export const portfolio = {
  eyebrow: "Featured Work",
  title: "Creative Productions",
  description:
    "Our latest commercial for Hampton - exploring the lonely journey of startup founders and the power of community.",
  video: {
    src: "https://www.youtube.com/embed/fIbDWDh6aYw?rel=0&showinfo=0&modestbranding=1",
    title: "Hampton Commercial - The Lonely Journey",
  },
  badge: "Latest Project",
  project: {
    category: "Commercial",
    client: "Hampton",
    title: "The Lonely Journey",
    description:
      "A powerful commercial exploring the isolation that startup founders face and how joining Hampton's community can transform that journey. This piece captures the emotional weight of entrepreneurship and the relief that comes with finding your tribe.",
    details: [
      { label: "Industry", value: "Community Platform" },
      { label: "Style", value: "Narrative Drama" },
      { label: "Tone", value: "Emotional Journey" },
      { label: "Format", value: "Digital Commercial" },
    ],
  },
} as const

export const awards = {
  eyebrow: "Recognition & Achievement",
  title: "Awards & Recognition",
  description: "Celebrated excellence in AI-powered film production",
} as const

export const about = {
  eyebrow: "Behind the Scenes",
  title: "How We Create Magic",
  subtitle: "Watch our process unfold frame by frame",
  processSteps: [
    {
      number: "01",
      title: "Concept & Script",
      description: "Scene-by-scene draft with dialogues and time-codes",
      color: "accent-blue",
    },
    {
      number: "02",
      title: "Look & Storyboard",
      description: "AI engine selection and visual testing",
      color: "accent-emerald",
    },
    {
      number: "03",
      title: "AI Production",
      description: "Motion tests and multi-variant generation",
      color: "accent-purple",
    },
    {
      number: "04",
      title: "Post-production",
      description: "VFX, color grading, and audio mixing",
      color: "accent-blue",
    },
    {
      number: "05",
      title: "Master Delivery",
      description: "Multi-format export and secure transfer",
      color: "accent-purple",
    },
  ],
  stats: {
    fps: "24 FPS",
    duration: "5-7 Days",
    quality: "Cinema Quality",
  },
  galleryCaption: "A glimpse into our storyboard development process",
  galleryQuote:
    "Diverse scenarios, characters, and styles — all generated through our AI pipeline",
} as const

export const services = {
  eyebrow: "Fresh from the Darkroom",
  title: "What We Develop",
  subtitle: "Developed with precision, delivered with passion",
  labName: "MOJJU LAB",
  footerNote:
    "Each piece is carefully developed in our creative darkroom, ensuring every detail captures the essence of your vision with precision and artistic flair.",
  items: [
    {
      id: "campaigns",
      title: "Campaign & Ad Content",
      description:
        "Multi-platform video campaigns ready for every channel—YouTube, TikTok, Instagram, and beyond.",
      color: "accent-emerald",
      rotation: "rotate-2",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&auto=format",
    },
    {
      id: "brand-films",
      title: "Brand Films & Stories",
      description:
        "Cinematic brand videos that capture your essence and connect with audiences on an emotional level.",
      color: "accent-blue",
      rotation: "-rotate-1",
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=300&fit=crop&auto=format",
    },
    {
      id: "trailers",
      title: "Trailers & Promos",
      description:
        "High-impact teasers that hook viewers instantly—perfect for launches, events, and announcements.",
      color: "accent-purple",
      rotation: "rotate-1",
      image: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=300&fit=crop&auto=format",
    },
    {
      id: "short-films",
      title: "Short-Form Films",
      description:
        "Festival-ready mini-movies up to 5 minutes—ideal for investors, events, and premium content.",
      color: "accent-emerald",
      rotation: "-rotate-2",
      image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=300&fit=crop&auto=format",
    },
    {
      id: "animation",
      title: "Animation & Motion",
      description:
        "Stylized animated content that explains complex ideas without needing live actors.",
      color: "accent-blue",
      rotation: "rotate-3",
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop&auto=format",
    },
    {
      id: "social",
      title: "Social Content",
      description:
        "Thumb-stopping vertical videos delivered in batches to keep your feed consistently engaging.",
      color: "accent-purple",
      rotation: "-rotate-1",
      image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&h=300&fit=crop&auto=format",
    },
  ],
} as const

export const team = {
  eyebrow: "Meet the Outlaws",
  title: "These people are",
  titleAccent: "WANTED",
  subtitle: "Highly skilled and creatively dangerous",
  members: [
    {
      name: "Marcus 'The Pixel Bandit'",
      crime: "ARMED CREATIVE ROBBERY",
      bounty: "$8,500",
      description:
        "Notorious for stealing ordinary footage and transforming it into extraordinary visual experiences. Approach with caution - carries dangerous levels of creative vision and technical expertise.",
      image: "team-member-1",
      rotation: "rotate-3",
      mustacheStyle: "artistic",
    },
    {
      name: "Sofia 'The Frame Thief'",
      crime: "GRAND THEFT OF IMAGINATION",
      bounty: "$6,200",
      description:
        "Wanted for stealing impossible creative briefs and turning them into award-winning masterpieces. Armed with strategic thinking and dangerous levels of project management skills.",
      image: "team-member-2",
      rotation: "rotate-2",
      mustacheStyle: "handlebar",
    },
    {
      name: "Jake 'The Render Rogue'",
      crime: "MASTERMINDING TECHNICAL HEISTS",
      bounty: "$11,800",
      description:
        "Ringleader of rendering crimes, orchestrating elaborate computational operations. Wanted for leading sophisticated processing schemes that push hardware beyond its limits.",
      image: "team-member-3",
      rotation: "rotate-2",
      mustacheStyle: "thick",
    },
    {
      name: "Maya 'The Code Crusher'",
      crime: "DIGITAL WIZARDRY & ALGORITHM SORCERY",
      bounty: "$9,300",
      description:
        "Wanted for conjuring flawless code from chaotic requirements using forbidden programming magic. Known to transform complex problems into elegant solutions with mysterious technical powers.",
      image: "team-member-4",
      rotation: "-rotate-2",
      mustacheStyle: "curly",
    },
    {
      name: "Connor 'The Digital Desperado'",
      crime: "PRODUCTION WITH INTENT TO AMAZE",
      bounty: "$13,700",
      description:
        "Mastermind behind revolutionary content creation operations. Wanted for disrupting traditional production methods and making competitors question their entire approach.",
      image: "team-member-5",
      rotation: "rotate-1",
      mustacheStyle: "villainous",
    },
    {
      name: "Zara 'The Motion Maverick'",
      crime: "ANIMATION MANIPULATION & EFFECT FORGERY",
      bounty: "$7,900",
      description:
        "Notorious for crafting motion graphics so smooth they defy the laws of physics. Armed with After Effects mastery and a dangerous eye for kinetic perfection.",
      image: "team-member-6",
      rotation: "-rotate-1",
      mustacheStyle: "artistic",
    },
    {
      name: "Leo 'The Effect Enforcer'",
      crime: "WANDERING VFX SYNTHESIS SCHEMES",
      bounty: "$10,400",
      description:
        "A nomadic visual effects outlaw who drifts from project to project, leaving behind a trail of jaw-dropping composites and impossible cinematic magic. Master of the digital realm.",
      image: "team-member-7",
      rotation: "rotate-3",
      mustacheStyle: "handlebar",
    },
  ],
} as const

export const contact = {
  eyebrow: "Let's Create Together",
  title: "Ready to Light Up the Screen?",
  subtitle:
    "Tell us about your project and we'll get back to you with a plan to bring your vision to cinematic reality",
  cardTitle: "Get In Touch",
  cardDescription: "Fill out the form and we'll respond within 24 hours",
  availability: "Available now",
  form: {
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    messageLabel: "Message",
    messagePlaceholder: "Tell us about your project...",
    submitButton: "Send Message",
    submittingText: "Sending...",
    successTitle: "Message sent!",
    successDescription: "We'll get back to you soon.",
    errorTitle: "Please fill in all fields",
  },
  infoCards: [
    {
      title: "Project Discussion",
      description: "Share your vision and requirements with our team",
      color: "accent-blue",
    },
    {
      title: "Custom Strategy",
      description: "Get a tailored approach for your unique project",
      color: "accent-emerald",
    },
    {
      title: "Next Steps",
      description: "Clear timeline and roadmap to bring your idea to life",
      color: "accent-purple",
    },
  ],
} as const

export const footer = {
  tools: {
    title: "TOOLS WE USE",
    description:
      "We leverage the latest AI technology to deliver cutting-edge video production. Our toolkit combines the best generative AI models for video, audio, and visual content creation.",
    items: [
      "Runway Gen-4",
      "Kling 2",
      "Veo 3",
      "Higgsfield AI",
      "Hailuo Minimax 2",
      "Midjourney",
      "Leonardo AI",
      "Krea AI",
      "Runway",
      "Suno AI",
      "ElevenLabs",
    ],
  },
  social: {
    x: "https://x.com/Mojjuai",
    tiktok: "https://www.tiktok.com/@mojju.ai",
    instagram: "https://www.instagram.com/mojju.ai",
    linkedin: "https://linkedin.com/company/mojju",
  },
  copyright: "© 2025 MOJJU. All rights reserved.",
  address: "2847 HIGHLAND AVE. SUITE 310 BIRMINGHAM 35205, AL, USA",
} as const

export const video = {
  autoplay: true,
  muted: true,
  loop: true,
  playsInline: true,
} as const
