import type { LegalContent } from "./types";

/**
 * Cookie policy content. This is not legal advice — have it reviewed by a
 * lawyer before relying on it in production.
 */
export const cookiesContent: LegalContent = {
  es: {
    title: "Política de Cookies",
    updated: "Última actualización: 5 de octubre de 2026",
    intro:
      "Esta página explica qué cookies y tecnologías similares usa Eloq AI, y por qué. La resumimos aquí de forma clara porque creemos que no deberías tener que leer la política de privacidad entera solo para saber esto.",
    sections: [
      {
        heading: "1. Qué usamos",
        paragraphs: [
          "Una única cookie técnica, de sesión: si inicias sesión, Supabase (nuestro proveedor de autenticación) coloca una cookie necesaria para mantenerte conectado entre páginas. Sin ella no podríamos saber que has iniciado sesión.",
          "Almacenamiento local del navegador (no es técnicamente una cookie, pero cumple una función parecida): lo usamos para recordar tu idioma, tu tema (claro/oscuro) y, si practicas sin cuenta, tu historial de sesiones en ese navegador. Esto no sale nunca de tu dispositivo.",
        ],
      },
      {
        heading: "2. Qué NO usamos",
        paragraphs: [
          "No usamos cookies de publicidad, de seguimiento entre webs, ni de perfilado. No vendemos ni compartimos datos de navegación con terceros con fines publicitarios.",
          "Usamos Vercel Analytics para ver estadísticas agregadas y anónimas de visitas (qué páginas se visitan, desde qué país, etc.). No utiliza cookies ni identifica a usuarios individuales.",
        ],
      },
      {
        heading: "3. Por qué no hay un banner de aceptar/rechazar cookies",
        paragraphs: [
          "Según la normativa europea (y las guías de la CNIL en Francia), las cookies estrictamente necesarias para el funcionamiento del servicio — como la de sesión que usamos para mantenerte conectado — no requieren tu consentimiento previo, solo que te informemos de que existen. Como no usamos ninguna cookie de seguimiento o publicidad que sí lo requiera, no hace falta pedirte que aceptes nada: solo contártelo, que es lo que hace esta página.",
        ],
      },
      {
        heading: "4. Cómo controlar o borrar esto",
        paragraphs: [
          "Puedes borrar la cookie de sesión y el almacenamiento local en cualquier momento desde la configuración de tu navegador (normalmente en «Privacidad» o «Datos de sitios»). Si lo haces, simplemente se cerrará tu sesión y se olvidarán tus preferencias de idioma/tema.",
        ],
      },
      {
        heading: "5. Más información",
        paragraphs: [
          "Para más detalle sobre qué datos recogemos en general, consulta nuestra Política de Privacidad. Si tienes dudas, escribe a paulmunozdaudin@gmail.com.",
        ],
      },
    ],
  },
  fr: {
    title: "Politique de Cookies",
    updated: "Dernière mise à jour : 5 octobre 2026",
    intro:
      "Cette page explique quels cookies et technologies similaires Eloq AI utilise, et pourquoi. Nous le résumons ici clairement, car nous pensons que tu ne devrais pas avoir à lire toute la politique de confidentialité juste pour le savoir.",
    sections: [
      {
        heading: "1. Ce que nous utilisons",
        paragraphs: [
          "Un seul cookie technique, de session : si tu te connectes, Supabase (notre fournisseur d'authentification) dépose un cookie nécessaire pour te maintenir connecté entre les pages. Sans lui, nous ne pourrions pas savoir que tu es connecté.",
          "Le stockage local du navigateur (ce n'est pas techniquement un cookie, mais ça remplit une fonction similaire) : nous l'utilisons pour mémoriser ta langue, ton thème (clair/sombre) et, si tu t'entraînes sans compte, ton historique de sessions sur ce navigateur. Cela ne quitte jamais ton appareil.",
        ],
      },
      {
        heading: "2. Ce que nous N'utilisons PAS",
        paragraphs: [
          "Nous n'utilisons pas de cookies publicitaires, de suivi entre sites, ni de profilage. Nous ne vendons ni ne partageons de données de navigation avec des tiers à des fins publicitaires.",
          "Nous utilisons Vercel Analytics pour des statistiques de visite agrégées et anonymes (quelles pages sont visitées, depuis quel pays, etc.). Il n'utilise pas de cookies et n'identifie pas les utilisateurs individuels.",
        ],
      },
      {
        heading: "3. Pourquoi il n'y a pas de bandeau d'acceptation des cookies",
        paragraphs: [
          "Selon la réglementation européenne (et les lignes directrices de la CNIL en France), les cookies strictement nécessaires au fonctionnement du service — comme celui de session que nous utilisons pour te maintenir connecté — ne nécessitent pas ton consentement préalable, seulement que nous t'informions de leur existence. Comme nous n'utilisons aucun cookie de suivi ou publicitaire qui le nécessiterait, il n'y a pas besoin de te demander d'accepter quoi que ce soit : il suffit de te l'expliquer, ce que fait cette page.",
        ],
      },
      {
        heading: "4. Comment contrôler ou supprimer cela",
        paragraphs: [
          "Tu peux supprimer le cookie de session et le stockage local à tout moment depuis les paramètres de ton navigateur (généralement sous « Confidentialité » ou « Données des sites »). Si tu le fais, ta session sera simplement fermée et tes préférences de langue/thème oubliées.",
        ],
      },
      {
        heading: "5. Plus d'informations",
        paragraphs: [
          "Pour plus de détails sur les données que nous collectons en général, consulte notre Politique de Confidentialité. Pour toute question, écris à paulmunozdaudin@gmail.com.",
        ],
      },
    ],
  },
  en: {
    title: "Cookie Policy",
    updated: "Last updated: October 5, 2026",
    intro:
      "This page explains which cookies and similar technologies Eloq AI uses, and why. We've kept it short and separate because you shouldn't have to read the whole privacy policy just to find this out.",
    sections: [
      {
        heading: "1. What we use",
        paragraphs: [
          "A single technical, session cookie: if you log in, Supabase (our authentication provider) sets a cookie needed to keep you signed in across pages. Without it we couldn't tell you're logged in.",
          "Browser local storage (not technically a cookie, but a similar role): we use it to remember your language, your theme (light/dark), and, if you practice without an account, your session history on that browser. This never leaves your device.",
        ],
      },
      {
        heading: "2. What we do NOT use",
        paragraphs: [
          "We don't use advertising cookies, cross-site tracking, or profiling. We don't sell or share browsing data with third parties for advertising purposes.",
          "We use Vercel Analytics for aggregated, anonymous visit statistics (which pages get visited, from which country, etc.). It doesn't use cookies and doesn't identify individual users.",
        ],
      },
      {
        heading: "3. Why there's no accept/reject cookie banner",
        paragraphs: [
          "Under EU regulation (and CNIL guidance in France), cookies strictly necessary for the service to function — like the session cookie we use to keep you logged in — don't require your prior consent, only that we tell you they exist. Since we don't use any tracking or advertising cookies that would require that consent, there's nothing to ask you to accept — just to explain, which is what this page does.",
        ],
      },
      {
        heading: "4. How to control or clear this",
        paragraphs: [
          "You can delete the session cookie and local storage at any time from your browser's settings (usually under \"Privacy\" or \"Site data\"). Doing so will simply log you out and forget your language/theme preferences.",
        ],
      },
      {
        heading: "5. More information",
        paragraphs: [
          "For more detail on what data we collect overall, see our Privacy Policy. If you have questions, write to paulmunozdaudin@gmail.com.",
        ],
      },
    ],
  },
};
