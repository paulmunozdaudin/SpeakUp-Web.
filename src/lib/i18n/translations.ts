/**
 * UI dictionaries. `en` is the source of truth for the shape;
 * `es` must implement the exact same structure (enforced by the type).
 * Add a new language by adding a new Dictionary and registering it in index.ts.
 */

export const en = {
  common: {
    logIn: "Log in",
    signUp: "Sign up",
    logOut: "Log out",
    startPracticing: "Start practicing",
    start: "Start",
    seeDemo: "See demo",
    cancel: "Cancel",
    delete: "Delete",
    home: "Home",
    comingSoon: "Coming soon",
  },
  nav: {
    features: "Features",
    howItWorks: "How it works",
    pricing: "Pricing",
    faq: "FAQ",
    dashboard: "Dashboard",
    practice: "Practice",
    history: "History",
    profile: "Profile",
  },
  landing: {
    heroBadge: "Your personal speaking coach, available 24/7",
    heroTitle: "Practice presentations with AI.",
    heroSubtitle:
      "Get instant feedback on your clarity, confidence, pacing and delivery.",
    previewTitle: "Startup pitch — take 3",
    previewSubtitle: "Analyzed just now",
    previewMetrics: {
      clarity: "Clarity",
      confidence: "Confidence",
      pacing: "Pacing",
      structure: "Structure",
    },
    featuresEyebrow: "Features",
    featuresTitle: "Everything you need to become a better speaker",
    featuresDescription:
      "One focused workflow: practice, analyze, improve. Designed to make progress visible.",
    features: [
      {
        title: "Record anywhere",
        description:
          "Practice straight from your browser or upload an existing recording. No setup, no downloads.",
      },
      {
        title: "AI-powered analysis",
        description:
          "Advanced speech AI evaluates clarity, confidence, structure, vocabulary and persuasiveness.",
      },
      {
        title: "Pacing & filler words",
        description:
          "Know exactly when you rush, drag, or lean on “um” and “like” — down to the word.",
      },
      {
        title: "Actionable feedback",
        description:
          "Not just scores: concrete strengths, weaknesses and personalized tips after every session.",
      },
      {
        title: "Track your progress",
        description:
          "Every practice is saved. Watch your scores climb week after week, like a fitness app for speaking.",
      },
      {
        title: "Practice modes",
        description:
          "Interviews, startup pitches, school presentations, TED-style talks and more — each with tailored criteria.",
      },
    ],
    howEyebrow: "How it works",
    howTitle: "Three steps to a stronger delivery",
    howSteps: [
      {
        title: "Practice",
        description:
          "Pick a mode, hit record and deliver your presentation as if the room were full.",
      },
      {
        title: "Analyze",
        description:
          "Our AI listens like a coach: pacing, clarity, structure, filler words, confidence.",
      },
      {
        title: "Improve",
        description:
          "Get a detailed report with personalized tips and exercises. Repeat and watch your score rise.",
      },
    ],
    testimonialsEyebrow: "Testimonials",
    testimonialsTitle: "Loved by speakers at every level",
    testimonials: [
      {
        quote:
          "I rehearsed my seed round pitch 14 times with Orato AI. By demo day I wasn't nervous — I was ready.",
        name: "Sofia M.",
        role: "Startup founder",
      },
      {
        quote:
          "My filler-word count dropped from 42 to 6 in three weeks. My students noticed before I did.",
        name: "Daniel R.",
        role: "University lecturer",
      },
      {
        quote:
          "It's like having a speaking coach in my pocket. I practice on my commute before every client meeting.",
        name: "Amara K.",
        role: "Sales lead",
      },
    ],
    pricingEyebrow: "Pricing",
    pricingTitle: "Simple pricing that scales with you",
    pricingDescription: "Start free. Upgrade when practice becomes a habit.",
    mostPopular: "Most popular",
    plans: [
      {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for trying Orato AI.",
        features: [
          "3 practice sessions per month",
          "Core AI feedback",
          "Session history",
        ],
        cta: "Start for free",
      },
      {
        name: "Pro",
        price: "$12",
        period: "per month",
        description: "For serious speakers who practice weekly.",
        features: [
          "Unlimited practice sessions",
          "Full AI analysis & tips",
          "Progress tracking & trends",
          "All practice modes",
          "Downloadable reports",
        ],
        cta: "Go Pro",
      },
      {
        name: "Teams",
        price: "Custom",
        period: "per seat",
        description: "For schools, bootcamps and sales teams.",
        features: [
          "Everything in Pro",
          "Team dashboards",
          "Shared exercises",
          "Priority support",
        ],
        cta: "Contact us",
      },
    ],
    faqEyebrow: "FAQ",
    faqTitle: "Frequently asked questions",
    faqs: [
      {
        question: "How does the AI feedback work?",
        answer:
          "Your recording is transcribed and analyzed by speech AI models that evaluate clarity, pacing, structure, vocabulary, confidence and filler words. You get scores plus concrete, personalized suggestions.",
      },
      {
        question: "Is my audio private?",
        answer:
          "Yes. Your recordings belong to you, are stored securely, and are never used to train models or shared with anyone. You can delete any session at any time.",
      },
      {
        question: "What can I practice?",
        answer:
          "Anything spoken: class presentations, thesis defenses, startup pitches, job interviews, sales calls, conference talks, wedding speeches — pick a mode and start.",
      },
      {
        question: "Do I need special equipment?",
        answer:
          "No. Any laptop or phone microphone works. You can also upload audio files recorded elsewhere.",
      },
      {
        question: "Will there be video analysis?",
        answer:
          "It's on the roadmap. Eye contact and body language analysis are coming — your account will be ready for it the day it ships.",
      },
    ],
    ctaTitle: "Your next presentation starts here.",
    ctaSubtitle:
      "Join thousands of speakers practicing smarter. Free to start — no credit card required.",
    footerTagline:
      "Your personal public speaking coach, available 24/7. Practice, analyze, improve.",
    footerProduct: "Product",
    footerCompany: "Company",
    footerLegal: "Legal",
    footerAbout: "About",
    footerBlog: "Blog",
    footerContact: "Contact",
    footerPrivacy: "Privacy",
    footerTerms: "Terms",
    footerRights: "All rights reserved.",
  },
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Log in to continue practicing.",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    signupTitle: "Create your account",
    signupSubtitle: "Start practicing in less than a minute.",
    fullName: "Full name",
    passwordPlaceholder: "At least 8 characters",
    createAccount: "Create account",
    haveAccount: "Already have an account?",
    checkInbox: "Check your inbox",
    confirmationSent:
      "We sent you a confirmation link. Click it to activate your account, then log in.",
    backToLogin: "Back to login",
    forgotTitle: "Reset your password",
    forgotSubtitle: "Enter your email and we'll send you a reset link.",
    sendResetLink: "Send reset link",
    resetSent:
      "If an account exists for that email, you'll receive a link to reset your password.",
    rememberedIt: "Remembered it?",
    resetTitle: "Choose a new password",
    resetSubtitle: "Set a new password for your account.",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    confirmPasswordPlaceholder: "Repeat your password",
    updatePassword: "Update password",
    passwordsDontMatch: "Passwords don't match.",
    genericError: "Something went wrong.",
    supabaseNotice:
      "Accounts aren't set up yet, but you don't need one — you can record and get AI feedback right now from",
    supabaseNoticeLink: "practice",
  },
  dashboard: {
    welcome: "Welcome back",
    readyFirst: "Ready for your first practice?",
    evolving: "Here's how your speaking is evolving.",
    startNewPractice: "Start new practice",
    improvementPrefix: "points",
    improvementSuffix:
      "— your last practice beat your previous average. Keep going!",
    totalPractices: "Total practices",
    startFirst: "Start your first one",
    keepItUp: "Keep it up",
    averageScore: "Average score",
    noSessionsYet: "No sessions yet",
    currentStreak: "Current streak",
    day: "day",
    days: "days",
    practiceToday: "Practice today to start one",
    dontBreakChain: "Don't break the chain",
    progress: "Progress",
    progressEmpty: "Complete at least two practices to see your progress curve.",
    recentSessions: "Recent sessions",
    viewAll: "View all",
    emptyTitle: "No sessions yet",
    emptyDescription:
      "Record your first presentation and get instant AI feedback.",
  },
  practice: {
    // Step 1: setup
    setupTitle: "New practice",
    setupSubtitle: "Set the stage before you press record.",
    modeLabel: "Choose a mode",
    titleLabel: "Title",
    titlePlaceholder: "e.g. Q3 results, thesis defense, seed pitch…",
    topicLabel: "Topic",
    topicPlaceholder: "What's it about? (optional, sharpens the feedback)",
    durationLabel: "Target duration",
    durationMinutes: "min",
    languageLabel: "Language",
    continueToRecording: "Continue",
    titleRequired: "Give your practice a title to continue.",
    // Step 2: recording
    backToSetup: "Back",
    pressStartToBegin: "Press start when you're ready",
    requestingMic: "Requesting microphone access…",
    recording: "Recording",
    paused: "Paused",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    liveTranscript: "Live transcript",
    liveTranscriptEmpty: "Your words will appear here as you speak.",
    targetReached: "You've reached your target duration.",
    notSupportedTitle: "Speech recognition isn't available",
    notSupportedBody:
      "Your browser doesn't support live transcription. Try the latest Chrome or Edge, on desktop or Android.",
    micDenied:
      "Microphone access was denied. Allow it in your browser settings and try again.",
    micUnavailable:
      "Could not start recording. Check that a microphone is connected.",
    networkError:
      "Lost connection to the speech recognition service. Check your internet connection and try again.",
    stillListening:
      "Still listening… if you keep seeing this, check that the right microphone is selected and unmuted.",
    tooShort: "Speak for a bit longer so there's enough to analyze.",
    // Analyzing overlay
    analyzing: "Analyzing your delivery…",
    analyzingSteps: [
      "Reading your transcript…",
      "Scoring clarity, confidence and structure…",
      "Counting filler words and pacing…",
      "Writing your personalized coaching report…",
    ],
  },
  results: {
    overall: "Overall score",
    practiceAgain: "Practice again",
    backToDashboard: "Back to dashboard",
    notFoundTitle: "Report not found",
    notFoundDescription: "This practice session doesn't exist or was deleted.",
    wordsPerMin: "words / min",
    words: "words",
    paceSlow: "Too slow",
    paceIdeal: "Ideal pace",
    paceFast: "Too fast",
    tabOverview: "Overview",
    tabMetrics: "Metrics",
    tabTranscript: "Transcript",
    tabImproved: "Improved version",
    tabQuestions: "Questions",
    metricsTitle: "The 13 dimensions",
    fillerWordsTitle: "Filler words",
    noFillers: "No filler words detected — impressive delivery.",
    fillerTotal: "total",
    fillerPerMinute: "per minute",
    structureTitle: "Structure",
    structureIntro: "Introduction",
    structureBody: "Body",
    structureConclusion: "Conclusion",
    present: "Present",
    missing: "Missing",
    summaryTitle: "Executive summary",
    highlightsTitle: "What's working",
    weaknessesTitle: "Where it loses strength",
    recommendationsTitle: "5 concrete actions",
    transcriptTitle: "What you actually said",
    transcriptCopy: "Copy",
    transcriptCopied: "Copied",
    improvedTitle: "Rewritten by your coach",
    improvedSubtitle:
      "Same idea, sharper delivery — study the differences and re-record.",
    improvedCopy: "Copy",
    questionsTitle: "Questions you should be ready for",
    questionsSubtitle: {
      presentation: "What your audience is likely to ask",
      "startup-pitch": "What investors are likely to ask",
      interview: "What the interviewer is likely to ask",
      "oral-exam": "What the panel is likely to ask",
      "project-defense": "What the committee is likely to ask",
    },
    poweredByAi: "Analyzed by AI coach",
    poweredByHeuristic: "Analyzed by the built-in coaching engine",
  },
  history: {
    title: "History",
    subtitle: "Every practice, every score — your journey so far.",
    searchPlaceholder: "Search by title…",
    all: "All",
    emptyTitle: "No practices yet",
    emptyDescription: "Your reports will appear here after your first session.",
    noResultsTitle: "No results",
    noResultsDescription: "No sessions match your search or filters.",
    deleteAria: "Delete",
    openReport: "Open report",
  },
  profile: {
    title: "Profile",
    subtitle: "Your account and speaking journey at a glance.",
    guestName: "Guest",
    guestBadge: "Not logged in",
    guestExplainer:
      "Your practices are saved on this device. Log in to sync them across devices.",
    freePlan: "Free plan",
    totalPractices: "Total practices",
    averageScore: "Average score",
    currentStreak: "Current streak",
    achievements: "Achievements",
    achievementsList: [
      { name: "First Words", description: "Complete your first practice" },
      { name: "On Fire", description: "Practice 7 days in a row" },
      { name: "Smooth Talker", description: "Score 90+ on clarity" },
      { name: "Marathon Speaker", description: "Complete 50 practices" },
    ],
  },
  modes: {
    presentation: "Presentation",
    "startup-pitch": "Startup Pitch",
    interview: "Job Interview",
    "oral-exam": "Oral Exam",
    "project-defense": "Project Defense",
  },
  modeDescriptions: {
    presentation: "Any topic, any audience",
    "startup-pitch": "Convince investors",
    interview: "Land the job",
    "oral-exam": "Defend your knowledge",
    "project-defense": "Present your work",
  },
  metrics: {
    clarity: "Clarity",
    confidence: "Confidence",
    structure: "Structure",
    pace: "Pace",
    fluency: "Fluency",
    fillerUsage: "Filler control",
    sentenceLength: "Sentence length",
    organization: "Organization",
    persuasion: "Persuasion",
    naturalness: "Naturalness",
    precision: "Language precision",
    openingStrength: "Opening strength",
    closingQuality: "Closing quality",
  },
  scoreLabels: {
    excellent: "Excellent",
    great: "Great",
    good: "Good",
    fair: "Fair",
    needsWork: "Needs work",
  },
};

export type Dictionary = typeof en;

export const es: Dictionary = {
  common: {
    logIn: "Iniciar sesión",
    signUp: "Registrarse",
    logOut: "Cerrar sesión",
    startPracticing: "Empieza a practicar",
    start: "Empezar",
    seeDemo: "Ver demo",
    cancel: "Cancelar",
    delete: "Eliminar",
    home: "Inicio",
    comingSoon: "Próximamente",
  },
  nav: {
    features: "Funciones",
    howItWorks: "Cómo funciona",
    pricing: "Precios",
    faq: "FAQ",
    dashboard: "Panel",
    practice: "Practicar",
    history: "Historial",
    profile: "Perfil",
  },
  landing: {
    heroBadge: "Tu coach personal de oratoria, disponible 24/7",
    heroTitle: "Practica presentaciones con IA.",
    heroSubtitle:
      "Recibe feedback instantáneo sobre tu claridad, confianza, ritmo y puesta en escena.",
    previewTitle: "Pitch de startup — toma 3",
    previewSubtitle: "Analizado ahora mismo",
    previewMetrics: {
      clarity: "Claridad",
      confidence: "Confianza",
      pacing: "Ritmo",
      structure: "Estructura",
    },
    featuresEyebrow: "Funciones",
    featuresTitle: "Todo lo que necesitas para hablar mejor en público",
    featuresDescription:
      "Un único flujo de trabajo: practica, analiza, mejora. Diseñado para que el progreso se vea.",
    features: [
      {
        title: "Graba donde quieras",
        description:
          "Practica directamente desde el navegador o sube una grabación existente. Sin instalar nada.",
      },
      {
        title: "Análisis con IA",
        description:
          "Una IA de voz avanzada evalúa claridad, confianza, estructura, vocabulario y persuasión.",
      },
      {
        title: "Ritmo y muletillas",
        description:
          "Sabrás exactamente cuándo te aceleras, te frenas o abusas de “eh” y “o sea” — palabra por palabra.",
      },
      {
        title: "Feedback accionable",
        description:
          "No solo puntuaciones: fortalezas concretas, puntos débiles y consejos personalizados tras cada sesión.",
      },
      {
        title: "Sigue tu progreso",
        description:
          "Cada práctica queda guardada. Mira cómo suben tus puntuaciones semana a semana, como una app de fitness para hablar.",
      },
      {
        title: "Modos de práctica",
        description:
          "Entrevistas, pitches de startup, presentaciones escolares, charlas estilo TED y más — cada uno con sus criterios.",
      },
    ],
    howEyebrow: "Cómo funciona",
    howTitle: "Tres pasos hacia una entrega más sólida",
    howSteps: [
      {
        title: "Practica",
        description:
          "Elige un modo, pulsa grabar y presenta como si la sala estuviera llena.",
      },
      {
        title: "Analiza",
        description:
          "Nuestra IA escucha como un coach: ritmo, claridad, estructura, muletillas, confianza.",
      },
      {
        title: "Mejora",
        description:
          "Recibe un informe detallado con consejos y ejercicios personalizados. Repite y mira subir tu puntuación.",
      },
    ],
    testimonialsEyebrow: "Testimonios",
    testimonialsTitle: "Oradores de todos los niveles lo adoran",
    testimonials: [
      {
        quote:
          "Ensayé mi pitch de ronda semilla 14 veces con Orato AI. El día del demo day no estaba nervioso: estaba listo.",
        name: "Sofía M.",
        role: "Fundadora de startup",
      },
      {
        quote:
          "Mis muletillas bajaron de 42 a 6 en tres semanas. Mis alumnos lo notaron antes que yo.",
        name: "Daniel R.",
        role: "Profesor universitario",
      },
      {
        quote:
          "Es como llevar un coach de oratoria en el bolsillo. Practico de camino a cada reunión con clientes.",
        name: "Amara K.",
        role: "Responsable de ventas",
      },
    ],
    pricingEyebrow: "Precios",
    pricingTitle: "Precios simples que crecen contigo",
    pricingDescription:
      "Empieza gratis. Mejora cuando practicar se convierta en hábito.",
    mostPopular: "Más popular",
    plans: [
      {
        name: "Gratis",
        price: "0 €",
        period: "para siempre",
        description: "Perfecto para probar Orato AI.",
        features: [
          "3 sesiones de práctica al mes",
          "Feedback esencial de IA",
          "Historial de sesiones",
        ],
        cta: "Empieza gratis",
      },
      {
        name: "Pro",
        price: "12 €",
        period: "al mes",
        description: "Para quienes se toman en serio practicar cada semana.",
        features: [
          "Sesiones de práctica ilimitadas",
          "Análisis completo de IA y consejos",
          "Seguimiento de progreso y tendencias",
          "Todos los modos de práctica",
          "Informes descargables",
        ],
        cta: "Hazte Pro",
      },
      {
        name: "Equipos",
        price: "A medida",
        period: "por puesto",
        description: "Para escuelas, bootcamps y equipos de ventas.",
        features: [
          "Todo lo de Pro",
          "Paneles de equipo",
          "Ejercicios compartidos",
          "Soporte prioritario",
        ],
        cta: "Contáctanos",
      },
    ],
    faqEyebrow: "FAQ",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      {
        question: "¿Cómo funciona el feedback de la IA?",
        answer:
          "Tu grabación se transcribe y la analizan modelos de IA de voz que evalúan claridad, ritmo, estructura, vocabulario, confianza y muletillas. Recibes puntuaciones y sugerencias concretas y personalizadas.",
      },
      {
        question: "¿Mi audio es privado?",
        answer:
          "Sí. Tus grabaciones son tuyas, se guardan de forma segura y nunca se usan para entrenar modelos ni se comparten con nadie. Puedes borrar cualquier sesión cuando quieras.",
      },
      {
        question: "¿Qué puedo practicar?",
        answer:
          "Cualquier cosa hablada: presentaciones de clase, defensas de tesis, pitches de startup, entrevistas de trabajo, llamadas de ventas, charlas, discursos de boda — elige un modo y empieza.",
      },
      {
        question: "¿Necesito equipo especial?",
        answer:
          "No. Sirve el micrófono de cualquier portátil o móvil. También puedes subir archivos de audio grabados en otro sitio.",
      },
      {
        question: "¿Habrá análisis de vídeo?",
        answer:
          "Está en la hoja de ruta. El análisis de contacto visual y lenguaje corporal llegará pronto — tu cuenta estará lista desde el primer día.",
      },
    ],
    ctaTitle: "Tu próxima presentación empieza aquí.",
    ctaSubtitle:
      "Únete a miles de oradores que practican de forma más inteligente. Gratis para empezar — sin tarjeta.",
    footerTagline:
      "Tu coach personal de oratoria, disponible 24/7. Practica, analiza, mejora.",
    footerProduct: "Producto",
    footerCompany: "Compañía",
    footerLegal: "Legal",
    footerAbout: "Sobre nosotros",
    footerBlog: "Blog",
    footerContact: "Contacto",
    footerPrivacy: "Privacidad",
    footerTerms: "Términos",
    footerRights: "Todos los derechos reservados.",
  },
  auth: {
    loginTitle: "Hola de nuevo",
    loginSubtitle: "Inicia sesión para seguir practicando.",
    email: "Email",
    password: "Contraseña",
    forgotPassword: "¿Olvidaste la contraseña?",
    noAccount: "¿No tienes cuenta?",
    signupTitle: "Crea tu cuenta",
    signupSubtitle: "Empieza a practicar en menos de un minuto.",
    fullName: "Nombre completo",
    passwordPlaceholder: "Mínimo 8 caracteres",
    createAccount: "Crear cuenta",
    haveAccount: "¿Ya tienes cuenta?",
    checkInbox: "Revisa tu bandeja de entrada",
    confirmationSent:
      "Te hemos enviado un enlace de confirmación. Haz clic para activar tu cuenta y luego inicia sesión.",
    backToLogin: "Volver a iniciar sesión",
    forgotTitle: "Restablece tu contraseña",
    forgotSubtitle: "Escribe tu email y te enviaremos un enlace.",
    sendResetLink: "Enviar enlace",
    resetSent:
      "Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.",
    rememberedIt: "¿La recordaste?",
    resetTitle: "Elige una nueva contraseña",
    resetSubtitle: "Establece una nueva contraseña para tu cuenta.",
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña",
    confirmPasswordPlaceholder: "Repite tu contraseña",
    updatePassword: "Actualizar contraseña",
    passwordsDontMatch: "Las contraseñas no coinciden.",
    genericError: "Algo salió mal.",
    supabaseNotice:
      "Las cuentas aún no están activadas, pero no las necesitas — puedes grabarte y recibir feedback de la IA ahora mismo desde",
    supabaseNoticeLink: "practicar",
  },
  dashboard: {
    welcome: "Hola de nuevo",
    readyFirst: "¿Lista tu primera práctica?",
    evolving: "Así está evolucionando tu forma de hablar.",
    startNewPractice: "Nueva práctica",
    improvementPrefix: "puntos",
    improvementSuffix:
      "— tu última práctica superó tu media anterior. ¡Sigue así!",
    totalPractices: "Prácticas totales",
    startFirst: "Empieza la primera",
    keepItUp: "Sigue así",
    averageScore: "Puntuación media",
    noSessionsYet: "Aún sin sesiones",
    currentStreak: "Racha actual",
    day: "día",
    days: "días",
    practiceToday: "Practica hoy para empezar una",
    dontBreakChain: "No rompas la cadena",
    progress: "Progreso",
    progressEmpty:
      "Completa al menos dos prácticas para ver tu curva de progreso.",
    recentSessions: "Sesiones recientes",
    viewAll: "Ver todas",
    emptyTitle: "Aún no hay sesiones",
    emptyDescription:
      "Graba tu primera presentación y recibe feedback de IA al instante.",
  },
  practice: {
    // Paso 1: configuración
    setupTitle: "Nueva práctica",
    setupSubtitle: "Prepara el escenario antes de pulsar grabar.",
    modeLabel: "Elige un modo",
    titleLabel: "Título",
    titlePlaceholder: "p. ej. Resultados Q3, defensa de tesis, pitch semilla…",
    topicLabel: "Tema",
    topicPlaceholder: "¿De qué trata? (opcional, afina el feedback)",
    durationLabel: "Duración objetivo",
    durationMinutes: "min",
    languageLabel: "Idioma",
    continueToRecording: "Continuar",
    titleRequired: "Ponle un título a tu práctica para continuar.",
    // Paso 2: grabación
    backToSetup: "Atrás",
    pressStartToBegin: "Pulsa empezar cuando estés listo",
    requestingMic: "Solicitando acceso al micrófono…",
    recording: "Grabando",
    paused: "En pausa",
    start: "Empezar",
    pause: "Pausar",
    resume: "Reanudar",
    stop: "Detener",
    liveTranscript: "Transcripción en vivo",
    liveTranscriptEmpty: "Tus palabras aparecerán aquí mientras hablas.",
    targetReached: "Has alcanzado tu duración objetivo.",
    notSupportedTitle: "El reconocimiento de voz no está disponible",
    notSupportedBody:
      "Tu navegador no admite transcripción en vivo. Prueba con la última versión de Chrome o Edge, en escritorio o Android.",
    micDenied:
      "Se denegó el acceso al micrófono. Permítelo en los ajustes del navegador e inténtalo de nuevo.",
    micUnavailable:
      "No se pudo iniciar la grabación. Comprueba que hay un micrófono conectado.",
    networkError:
      "Se perdió la conexión con el servicio de reconocimiento de voz. Comprueba tu conexión a internet e inténtalo de nuevo.",
    stillListening:
      "Sigo escuchando… si esto no cambia, comprueba que el micrófono correcto esté seleccionado y sin silenciar.",
    tooShort: "Habla un poco más para tener suficiente contenido que analizar.",
    // Overlay de análisis
    analyzing: "Analizando tu discurso…",
    analyzingSteps: [
      "Leyendo tu transcripción…",
      "Puntuando claridad, confianza y estructura…",
      "Contando muletillas y ritmo…",
      "Redactando tu informe de coaching personalizado…",
    ],
  },
  results: {
    overall: "Puntuación global",
    practiceAgain: "Practicar de nuevo",
    backToDashboard: "Volver al panel",
    notFoundTitle: "Informe no encontrado",
    notFoundDescription: "Esta sesión de práctica no existe o fue eliminada.",
    wordsPerMin: "palabras / min",
    words: "palabras",
    paceSlow: "Demasiado lento",
    paceIdeal: "Ritmo ideal",
    paceFast: "Demasiado rápido",
    tabOverview: "Resumen",
    tabMetrics: "Métricas",
    tabTranscript: "Transcripción",
    tabImproved: "Versión mejorada",
    tabQuestions: "Preguntas",
    metricsTitle: "Las 13 dimensiones",
    fillerWordsTitle: "Muletillas",
    noFillers: "No se detectaron muletillas — una entrega impecable.",
    fillerTotal: "total",
    fillerPerMinute: "por minuto",
    structureTitle: "Estructura",
    structureIntro: "Introducción",
    structureBody: "Desarrollo",
    structureConclusion: "Conclusión",
    present: "Presente",
    missing: "Falta",
    summaryTitle: "Resumen ejecutivo",
    highlightsTitle: "Lo que funciona",
    weaknessesTitle: "Dónde pierde fuerza",
    recommendationsTitle: "5 acciones concretas",
    transcriptTitle: "Lo que dijiste realmente",
    transcriptCopy: "Copiar",
    transcriptCopied: "Copiado",
    improvedTitle: "Reescrito por tu coach",
    improvedSubtitle:
      "Misma idea, mejor ejecución — estudia las diferencias y vuelve a grabar.",
    improvedCopy: "Copiar",
    questionsTitle: "Preguntas para las que deberías estar preparado",
    questionsSubtitle: {
      presentation: "Lo que probablemente preguntaría tu audiencia",
      "startup-pitch": "Lo que probablemente preguntarían los inversores",
      interview: "Lo que probablemente preguntaría el entrevistador",
      "oral-exam": "Lo que probablemente preguntaría el tribunal",
      "project-defense": "Lo que probablemente preguntaría el comité",
    },
    poweredByAi: "Analizado por el coach de IA",
    poweredByHeuristic: "Analizado por el motor de coaching integrado",
  },
  history: {
    title: "Historial",
    subtitle: "Cada práctica, cada puntuación — tu camino hasta hoy.",
    searchPlaceholder: "Buscar por título…",
    all: "Todos",
    emptyTitle: "Aún no hay prácticas",
    emptyDescription:
      "Tus informes aparecerán aquí después de tu primera sesión.",
    noResultsTitle: "Sin resultados",
    noResultsDescription:
      "Ninguna sesión coincide con tu búsqueda o filtros.",
    deleteAria: "Eliminar",
    openReport: "Abrir informe",
  },
  profile: {
    title: "Perfil",
    subtitle: "Tu cuenta y tu trayectoria como orador, de un vistazo.",
    guestName: "Invitado",
    guestBadge: "Sin iniciar sesión",
    guestExplainer:
      "Tus prácticas se guardan en este dispositivo. Inicia sesión para sincronizarlas entre dispositivos.",
    freePlan: "Plan gratis",
    totalPractices: "Prácticas totales",
    averageScore: "Puntuación media",
    currentStreak: "Racha actual",
    achievements: "Logros",
    achievementsList: [
      { name: "Primeras palabras", description: "Completa tu primera práctica" },
      { name: "En racha", description: "Practica 7 días seguidos" },
      { name: "Pico de oro", description: "Consigue 90+ en claridad" },
      { name: "Orador de maratón", description: "Completa 50 prácticas" },
    ],
  },
  modes: {
    presentation: "Presentación",
    "startup-pitch": "Pitch de startup",
    interview: "Entrevista de trabajo",
    "oral-exam": "Examen oral",
    "project-defense": "Defensa de proyecto",
  },
  modeDescriptions: {
    presentation: "Cualquier tema, cualquier audiencia",
    "startup-pitch": "Convence a los inversores",
    interview: "Consigue el puesto",
    "oral-exam": "Defiende tus conocimientos",
    "project-defense": "Presenta tu trabajo",
  },
  metrics: {
    clarity: "Claridad",
    confidence: "Confianza",
    structure: "Estructura",
    pace: "Ritmo",
    fluency: "Fluidez",
    fillerUsage: "Control de muletillas",
    sentenceLength: "Longitud de frases",
    organization: "Organización",
    persuasion: "Persuasión",
    naturalness: "Naturalidad",
    precision: "Precisión del lenguaje",
    openingStrength: "Fuerza de apertura",
    closingQuality: "Calidad del cierre",
  },
  scoreLabels: {
    excellent: "Excelente",
    great: "Muy bien",
    good: "Bien",
    fair: "Regular",
    needsWork: "A mejorar",
  },
};
