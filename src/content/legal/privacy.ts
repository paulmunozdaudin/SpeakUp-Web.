import type { LegalContent } from "./types";

/**
 * Privacy policy content. This is not legal advice — have it reviewed by a
 * lawyer before relying on it in production, especially given the
 * voice-data processing involved.
 */
export const privacyContent: LegalContent = {
  es: {
    title: "Política de Privacidad",
    updated: "Última actualización: 23 de julio de 2026",
    intro:
      "Esta política explica qué datos recoge Eloq AI, para qué los usa, con quién los comparte y qué derechos tienes sobre ellos. La hemos escrito intentando reflejar exactamente cómo funciona el producto hoy — sin florituras legales innecesarias.",
    sections: [
      {
        heading: "1. Quién es el responsable de tus datos",
        paragraphs: [
          "Paul Daudin Muñoz es el responsable del tratamiento de tus datos en Eloq AI.",
          "Para cualquier duda sobre esta política o tus datos, puedes escribir a paulmunozdaudin@gmail.com.",
        ],
      },
      {
        heading: "2. Qué datos recogemos",
        paragraphs: [
          "Datos de cuenta (solo si te registras): nombre, email y contraseña. La contraseña nunca la vemos en texto plano — la gestiona Supabase, nuestro proveedor de autenticación, de forma cifrada.",
          "Contenido de tus prácticas: el título y tema que escribes, el modo elegido, la duración, la transcripción de texto de lo que dices, y el informe que genera la IA (puntuaciones, resumen, recomendaciones). No almacenamos el audio de tu voz — se procesa para convertirlo en texto y se descarta.",
          "Si practicas sin haber iniciado sesión, tu historial se guarda únicamente en el almacenamiento local de tu propio navegador. No llega a nuestros servidores de forma permanente.",
          "Datos de facturación (solo si contratas el plan Pro): tu email y el estado de la suscripción. Los datos de pago en sí (número de tarjeta, etc.) los recoge y almacena Stripe directamente, no nosotros.",
          "Datos técnicos básicos: dirección IP y registros de acceso estándar generados por nuestro proveedor de alojamiento (Vercel) al servir la web, con fines de seguridad y disponibilidad.",
        ],
      },
      {
        heading: "3. Cómo se transcribe tu voz",
        paragraphs: [
          "La transcripción en vivo la realiza el propio navegador (la API de reconocimiento de voz de Chrome/Edge), no nuestros servidores. Dependiendo del navegador, esto puede implicar que el audio se envíe al servicio de reconocimiento de voz del fabricante del navegador (por ejemplo, Google en el caso de Chrome) para convertirlo en texto. Ese procesamiento se rige por la política de privacidad de dicho fabricante, no por la nuestra.",
          "Nosotros nunca recibimos ni almacenamos el audio en bruto: solo el texto resultante, que tú puedes revisar antes de que se analice.",
        ],
      },
      {
        heading: "4. Con quién compartimos datos",
        paragraphs: [
          "Supabase (alojamiento de base de datos y autenticación): si tienes cuenta, almacena tu perfil y el historial de tus prácticas.",
          "Stripe: si contratas el plan Pro, procesa el pago. Stripe recibe tu email y los datos de tu tarjeta directamente — nosotros nunca vemos ni almacenamos el número completo de tu tarjeta. De Stripe solo recibimos un identificador de cliente y el estado de tu suscripción (activa, cancelada, etc.).",
          "OpenAI: solo si el operador de esta web ha activado esta opción, el texto de tu transcripción se envía a la API de OpenAI para generar el feedback. Según la política de OpenAI para su API, estos datos no se usan para entrenar sus modelos. Si esta opción no está activa, el análisis lo realiza un motor propio sin salir de nuestra infraestructura.",
          "Vercel: nuestro proveedor de alojamiento, que procesa las peticiones técnicas necesarias para servir la web.",
          "No vendemos tus datos a terceros. No compartimos tu contenido con fines publicitarios.",
        ],
      },
      {
        heading: "5. Por qué tratamos tus datos",
        paragraphs: [
          "Para prestarte el servicio que has solicitado (base legal: ejecución de un contrato/relación de uso).",
          "Para mejorar el producto y corregir errores (base legal: interés legítimo).",
          "Para cumplir obligaciones legales cuando corresponda.",
        ],
      },
      {
        heading: "6. Cuánto tiempo conservamos tus datos",
        paragraphs: [
          "Los datos de tu cuenta y tus sesiones guardadas se conservan mientras la cuenta esté activa. Puedes borrar cualquier práctica individual en cualquier momento desde el historial.",
          "Para eliminar tu cuenta por completo, escríbenos a paulmunozdaudin@gmail.com — hoy no existe un botón de autoservicio para ello, pero atenderemos la solicitud en un plazo razonable.",
        ],
      },
      {
        heading: "7. Tus derechos",
        paragraphs: [
          "Si resides en el Espacio Económico Europeo, tienes derecho a acceder, rectificar, eliminar, limitar el tratamiento, oponerte y solicitar la portabilidad de tus datos. También puedes presentar una reclamación ante tu autoridad de protección de datos (en España, la AEPD).",
          "Para ejercer cualquiera de estos derechos, escribe a paulmunozdaudin@gmail.com.",
        ],
      },
      {
        heading: "8. Menores de edad",
        paragraphs: [
          "Este servicio no está dirigido a menores de 16 años. Si eres menor de esa edad, necesitas el consentimiento de tu tutor legal para crear una cuenta.",
        ],
      },
      {
        heading: "9. Cookies y almacenamiento local",
        paragraphs: [
          "Usamos almacenamiento local del navegador para recordar tu idioma, tu tema (claro/oscuro) y, si practicas sin cuenta, tu historial de sesiones. Si inicias sesión, Supabase utiliza cookies técnicas necesarias para mantener tu sesión iniciada. No usamos cookies de publicidad ni de seguimiento de terceros.",
        ],
      },
      {
        heading: "10. Seguridad",
        paragraphs: [
          "Aplicamos medidas técnicas razonables para proteger tus datos, pero ningún sistema es 100% seguro. Si detectamos una brecha que te afecte, te lo notificaremos conforme a la normativa aplicable.",
        ],
      },
      {
        heading: "11. Cambios en esta política",
        paragraphs: [
          "Si actualizamos esta política de forma relevante, cambiaremos la fecha indicada arriba y, cuando corresponda, te avisaremos por otros medios.",
        ],
      },
    ],
  },
  fr: {
    title: "Politique de Confidentialité",
    updated: "Dernière mise à jour : 23 juillet 2026",
    intro:
      "Cette politique explique quelles données Eloq AI collecte, à quoi elles servent, avec qui elles sont partagées et quels droits tu as sur elles. Nous avons essayé de décrire exactement comment le produit fonctionne aujourd'hui, sans fioritures juridiques inutiles.",
    sections: [
      {
        heading: "1. Qui est responsable de tes données",
        paragraphs: [
          "Paul Daudin Muñoz est le responsable du traitement de tes données sur Eloq AI.",
          "Pour toute question sur cette politique ou sur tes données, tu peux écrire à paulmunozdaudin@gmail.com.",
        ],
      },
      {
        heading: "2. Quelles données nous collectons",
        paragraphs: [
          "Données de compte (seulement si tu t'inscris) : nom, email et mot de passe. Nous ne voyons jamais ton mot de passe en clair — il est géré de façon chiffrée par Supabase, notre fournisseur d'authentification.",
          "Contenu de tes entraînements : le titre et le sujet que tu saisis, le mode choisi, la durée, la transcription textuelle de ce que tu dis, et le rapport généré par l'IA (notes, résumé, recommandations). Nous ne stockons pas l'audio de ta voix — il est converti en texte puis supprimé.",
          "Si tu t'entraînes sans être connecté, ton historique est stocké uniquement dans le stockage local de ton propre navigateur. Il n'atteint jamais nos serveurs de façon permanente.",
          "Données de facturation (seulement si tu souscris au plan Pro) : ton email et le statut de ton abonnement. Les données de paiement elles-mêmes (numéro de carte, etc.) sont collectées et stockées directement par Stripe, pas par nous.",
          "Données techniques de base : adresse IP et journaux d'accès standard générés par notre hébergeur (Vercel) lors de la mise à disposition du site, à des fins de sécurité et de disponibilité.",
        ],
      },
      {
        heading: "3. Comment ta voix est transcrite",
        paragraphs: [
          "La transcription en direct est réalisée par ton navigateur lui-même (l'API de reconnaissance vocale de Chrome/Edge), pas par nos serveurs. Selon le navigateur, cela peut signifier que ton audio est envoyé au service de reconnaissance vocale de l'éditeur du navigateur (par exemple Google pour Chrome) pour le convertir en texte. Ce traitement est régi par la politique de confidentialité de cet éditeur, pas par la nôtre.",
          "Nous ne recevons ni ne stockons jamais l'audio brut : seulement le texte obtenu, que tu peux relire avant qu'il ne soit analysé.",
        ],
      },
      {
        heading: "4. Avec qui nous partageons des données",
        paragraphs: [
          "Supabase (hébergement de la base de données et authentification) : si tu as un compte, il stocke ton profil et l'historique de tes entraînements.",
          "Stripe : si tu souscris au plan Pro, il traite ton paiement. Stripe reçoit directement ton email et les détails de ta carte — nous ne voyons ni ne stockons jamais ton numéro de carte complet. De Stripe, nous ne recevons qu'un identifiant client et le statut de ton abonnement (actif, annulé, etc.).",
          "OpenAI : uniquement si l'exploitant de ce site a activé cette option, le texte de ta transcription est envoyé à l'API d'OpenAI pour générer le retour. Selon la politique d'OpenAI pour son API, ces données ne sont pas utilisées pour entraîner ses modèles. Si cette option n'est pas activée, l'analyse est réalisée par un moteur propre, sans quitter notre infrastructure.",
          "Vercel : notre hébergeur, qui traite les requêtes techniques nécessaires pour servir le site.",
          "Nous ne vendons pas tes données à des tiers. Nous ne partageons pas ton contenu à des fins publicitaires.",
        ],
      },
      {
        heading: "5. Pourquoi nous traitons tes données",
        paragraphs: [
          "Pour te fournir le service que tu as demandé (base légale : exécution d'un contrat/relation d'usage).",
          "Pour améliorer le produit et corriger des bugs (base légale : intérêt légitime).",
          "Pour respecter des obligations légales le cas échéant.",
        ],
      },
      {
        heading: "6. Combien de temps nous conservons tes données",
        paragraphs: [
          "Les données de ton compte et tes sessions enregistrées sont conservées tant que ton compte est actif. Tu peux supprimer n'importe quel entraînement individuel à tout moment depuis ton historique.",
          "Pour supprimer ton compte entièrement, écris-nous à paulmunozdaudin@gmail.com — il n'existe pas encore de bouton en libre-service pour cela, mais nous traiterons ta demande dans un délai raisonnable.",
        ],
      },
      {
        heading: "7. Tes droits",
        paragraphs: [
          "Si tu résides dans l'Espace économique européen, tu as le droit d'accéder à tes données, de les rectifier, de les supprimer, d'en limiter le traitement, de t'y opposer et d'en demander la portabilité. Tu peux aussi déposer une réclamation auprès de ton autorité de protection des données (par exemple la CNIL en France, ou l'AEPD en Espagne, où est basé le responsable du traitement).",
          "Pour exercer l'un de ces droits, écris à paulmunozdaudin@gmail.com.",
        ],
      },
      {
        heading: "8. Mineurs",
        paragraphs: [
          "Ce service ne s'adresse pas aux mineurs de moins de 16 ans. Si tu as moins de cet âge, tu as besoin du consentement de ton représentant légal pour créer un compte.",
        ],
      },
      {
        heading: "9. Cookies et stockage local",
        paragraphs: [
          "Nous utilisons le stockage local du navigateur pour mémoriser ta langue, ton thème (clair/sombre) et, si tu t'entraînes sans compte, ton historique de sessions. Si tu es connecté, Supabase utilise des cookies techniques nécessaires pour maintenir ta session. Nous n'utilisons pas de cookies publicitaires ni de suivi tiers.",
        ],
      },
      {
        heading: "10. Sécurité",
        paragraphs: [
          "Nous appliquons des mesures techniques raisonnables pour protéger tes données, mais aucun système n'est sécurisé à 100 %. Si nous détectons une violation qui te concerne, nous te la notifierons conformément à la réglementation applicable.",
        ],
      },
      {
        heading: "11. Modifications de cette politique",
        paragraphs: [
          "Si nous mettons à jour cette politique de façon significative, nous changerons la date indiquée ci-dessus et, le cas échéant, nous te préviendrons par d'autres moyens.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: July 23, 2026",
    intro:
      "This policy explains what data Eloq AI collects, what we use it for, who we share it with, and what rights you have over it. We've tried to describe exactly how the product works today, without unnecessary legal padding.",
    sections: [
      {
        heading: "1. Who is responsible for your data",
        paragraphs: [
          "Paul Daudin Muñoz is the data controller for Eloq AI.",
          "For any question about this policy or your data, write to paulmunozdaudin@gmail.com.",
        ],
      },
      {
        heading: "2. What data we collect",
        paragraphs: [
          "Account data (only if you sign up): name, email and password. We never see your password in plain text — it's handled encrypted by Supabase, our authentication provider.",
          "Practice content: the title and topic you enter, the mode you choose, duration, the text transcript of what you said, and the AI-generated report (scores, summary, recommendations). We do not store your voice audio — it's processed into text and discarded.",
          "If you practice without logging in, your history is stored only in your own browser's local storage. It never reaches our servers permanently.",
          "Billing data (only if you subscribe to Pro): your email and subscription status. Payment data itself (card number, etc.) is collected and stored directly by Stripe, not by us.",
          "Basic technical data: IP address and standard access logs generated by our hosting provider (Vercel) while serving the site, for security and availability purposes.",
        ],
      },
      {
        heading: "3. How your voice gets transcribed",
        paragraphs: [
          "Live transcription is performed by your browser itself (Chrome/Edge's speech recognition API), not our servers. Depending on the browser, this may mean your audio is sent to that browser vendor's own speech-recognition service (for example, Google in Chrome's case) to convert it to text. That processing is governed by that vendor's own privacy policy, not ours.",
          "We never receive or store the raw audio — only the resulting text, which you can review before it's analyzed.",
        ],
      },
      {
        heading: "4. Who we share data with",
        paragraphs: [
          "Supabase (database and authentication hosting): if you have an account, it stores your profile and practice history.",
          "Stripe: if you subscribe to the Pro plan, it processes your payment. Stripe receives your email and card details directly — we never see or store your full card number. From Stripe we only receive a customer identifier and your subscription status (active, cancelled, etc.).",
          "OpenAI: only if the operator of this site has enabled this option, your transcript text is sent to the OpenAI API to generate feedback. Under OpenAI's API data policy, this data is not used to train their models. When this option isn't enabled, analysis runs on our own engine without leaving our infrastructure.",
          "Vercel: our hosting provider, which processes the technical requests needed to serve the site.",
          "We do not sell your data to third parties. We do not share your content for advertising purposes.",
        ],
      },
      {
        heading: "5. Why we process your data",
        paragraphs: [
          "To provide the service you requested (legal basis: performance of a contract/usage relationship).",
          "To improve the product and fix bugs (legal basis: legitimate interest).",
          "To comply with legal obligations where applicable.",
        ],
      },
      {
        heading: "6. How long we keep your data",
        paragraphs: [
          "Your account data and saved sessions are kept while your account is active. You can delete any individual practice at any time from your history.",
          "To delete your account entirely, email us at paulmunozdaudin@gmail.com — there is no self-service button for this today, but we'll handle the request within a reasonable time.",
        ],
      },
      {
        heading: "7. Your rights",
        paragraphs: [
          "If you're in the European Economic Area, you have the right to access, rectify, erase, restrict processing of, object to, and request portability of your data. You may also lodge a complaint with your local data protection authority.",
          "To exercise any of these rights, write to paulmunozdaudin@gmail.com.",
        ],
      },
      {
        heading: "8. Minors",
        paragraphs: [
          "This service is not directed at children under 16. If you are under that age, you need your legal guardian's consent to create an account.",
        ],
      },
      {
        heading: "9. Cookies and local storage",
        paragraphs: [
          "We use browser local storage to remember your language, your theme (light/dark) and, if you practice without an account, your session history. If you're logged in, Supabase uses necessary technical cookies to keep you signed in. We don't use advertising or third-party tracking cookies.",
        ],
      },
      {
        heading: "10. Security",
        paragraphs: [
          "We apply reasonable technical measures to protect your data, but no system is 100% secure. If we detect a breach affecting you, we'll notify you as required by applicable law.",
        ],
      },
      {
        heading: "11. Changes to this policy",
        paragraphs: [
          "If we make material updates to this policy, we'll change the date above and, where appropriate, notify you through other means.",
        ],
      },
    ],
  },
};
