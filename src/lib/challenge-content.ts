/**
 * Content for the 1-minute communication challenges, per speech language.
 * "noFillers" reuses the improvise topics — the difficulty there is the
 * delivery (no "um"), not the subject.
 */

import type { SpeechLanguage } from "@/types";

export interface ReadingText {
  title: string;
  text: string;
}

export interface ChallengeContent {
  improvise: string[];
  explain: string[];
  story: string[];
  reading: ReadingText[];
}

export const CHALLENGE_CONTENT: Record<SpeechLanguage, ChallengeContent> = {
  es: {
    improvise: [
      "¿Es mejor ser especialista o saber un poco de todo?",
      "El mejor consejo que te han dado",
      "¿Deberían prohibirse los móviles en clase?",
      "¿Por qué unas personas triunfan y otras no?",
      "Convénceme de que las mañanas son mejores que las noches (o al revés)",
      "¿Debería todo el mundo aprender a programar?",
      "Qué cambiarías de tu ciudad",
      "¿Las redes sociales nos hacen más o menos sociables?",
      "La habilidad que todos deberían aprender antes de los 25",
      "¿Teletrabajo u oficina?",
      "¿Es necesario fracasar para tener éxito?",
      "Qué hace a un buen líder",
      "¿Debería ser gratis la universidad?",
      "El invento que más ha cambiado el mundo",
      "Dinero o tiempo libre: ¿qué vale más?",
      "Qué harías con una hora extra cada día",
      "¿Mejor viajar solo o con amigos?",
      "¿Podemos confiar en la inteligencia artificial?",
      "El hábito más infravalorado",
      "Qué significa para ti tener éxito",
    ],
    explain: [
      "Cómo funciona la inflación",
      "Qué es la inteligencia artificial",
      "Por qué el cielo es azul",
      "Cómo funciona una vacuna",
      "Qué es el blockchain",
      "Cómo funciona internet",
      "Qué es el interés compuesto",
      "Por qué existen las estaciones del año",
      "Cómo funciona una tarjeta de crédito",
      "Qué es el cambio climático",
      "Cómo consigue dinero una startup",
      "Qué es un agujero negro",
    ],
    story: [
      "El día que aprendiste algo por las malas",
      "Un momento de muchos nervios",
      "El mejor viaje que has hecho",
      "Una vez que cambiaste de opinión sobre algo",
      "Lo más gracioso que te ha pasado en clase o en el trabajo",
      "Una persona que te inspira",
      "Una vez que tuviste que decidir algo en segundos",
      "Tu primer día en algo nuevo",
      "Una pequeña victoria que te enorgullece",
      "Un día en que todo salió fatal",
      "Una conversación que te cambió la forma de ver algo",
      "Un riesgo que te atreviste a correr",
    ],
    reading: [
      {
        title: "El primer paso",
        text: "Hay un momento, justo antes de hablar en público, en el que el corazón se acelera y la mente se queda en blanco. Todos lo hemos sentido. La buena noticia es que ese miedo no desaparece con el tiempo: se transforma. Los grandes oradores no son personas sin nervios, sino personas que han aprendido a usar esa energía a su favor. Respiran hondo, miran al público y empiezan despacio. Saben que la primera frase marca el tono de todo lo demás. Por eso, la próxima vez que sientas ese nudo en el estómago, no intentes hacerlo desaparecer. Acéptalo, sonríe y da el primer paso. El público no espera perfección; espera a alguien auténtico.",
      },
      {
        title: "La ciudad despierta",
        text: "A las seis de la mañana, la ciudad todavía bosteza. Los primeros autobuses recorren avenidas casi vacías, las persianas de las panaderías suben con un chirrido y el olor a pan recién hecho se mezcla con el del café. Un repartidor en bicicleta esquiva a un barrendero que silba una canción antigua. En una esquina, una mujer espera el semáforo mientras repasa en voz baja lo que dirá en su entrevista de trabajo. Nadie la mira, pero ella siente que todo el mundo lo hace. Cuando la luz cambia a verde, cruza con paso firme. Dentro de una hora, su vida puede ser distinta. La ciudad, indiferente, sigue despertando a su alrededor.",
      },
      {
        title: "El pitch",
        text: "Cada año, millones de personas pierden horas buscando aparcamiento en el centro de su ciudad. Ese tiempo perdido se traduce en estrés, contaminación y dinero. Nuestra solución es sencilla: una aplicación que conecta a conductores con plazas privadas que están vacías durante el día. Los propietarios ganan un ingreso extra sin hacer nada y los conductores encuentran sitio en menos de dos minutos. En seis meses hemos conseguido más de diez mil usuarios en tres ciudades, sin gastar un euro en publicidad. Hoy buscamos un socio que nos ayude a llegar a toda Europa. No vendemos plazas de aparcamiento. Vendemos tiempo, y el tiempo es lo único que nadie puede recuperar.",
      },
      {
        title: "El cerebro y el sueño",
        text: "Mientras dormimos, el cerebro no se apaga. Al contrario: trabaja intensamente para ordenar todo lo que hemos vivido durante el día. Durante las fases de sueño profundo, refuerza los recuerdos importantes y elimina los que no necesita. Además, activa un sistema de limpieza que retira sustancias de desecho acumuladas en las horas de actividad. Por eso, después de una mala noche, nos cuesta concentrarnos, recordar nombres o tomar decisiones. Los científicos recomiendan dormir entre siete y nueve horas, acostarse siempre a la misma hora y evitar las pantallas antes de dormir. Dormir bien no es perder el tiempo. Es, probablemente, una de las mejores inversiones que podemos hacer en nuestra salud.",
      },
      {
        title: "Discurso de graduación",
        text: "Queridos compañeros: hoy cerramos una etapa que, en muchos momentos, pensamos que nunca terminaría. Recordamos los exámenes a última hora, las noches sin dormir y los cafés que nos mantuvieron en pie. Pero también recordamos las risas en el pasillo, los amigos que encontramos por el camino y los profesores que creyeron en nosotros cuando ni siquiera nosotros lo hacíamos. A partir de mañana, cada uno tomará un camino distinto. Algunos sabrán exactamente adónde van; otros, todavía no. Y está bien. Lo importante no es tener todas las respuestas, sino no dejar nunca de hacer preguntas. Gracias por estos años. Ha sido un honor aprender a vuestro lado.",
      },
      {
        title: "La noticia",
        text: "Un grupo de estudiantes de secundaria ha desarrollado un sistema capaz de detectar fugas de agua en edificios antiguos utilizando sensores de bajo coste. El proyecto, que comenzó como un trabajo de clase, ha llamado la atención de varios ayuntamientos interesados en aplicarlo en colegios y bibliotecas públicas. Según sus creadores, el dispositivo cuesta menos de veinte euros y puede reducir el consumo de agua hasta un treinta por ciento. «Queríamos demostrar que no hace falta ser una gran empresa para resolver un problema real», explica una de las alumnas. El equipo presentará su invento el próximo mes en una feria internacional de ciencia, donde competirá con proyectos de más de cuarenta países.",
      },
      {
        title: "La carta",
        text: "Querida abuela: hace tiempo que quería escribirte, pero nunca encontraba las palabras. Hoy, ordenando unas cajas, encontré la receta de tus galletas con tu letra inclinada y una mancha de chocolate en la esquina. Me senté en el suelo y no pude evitar reírme, recordando las tardes de domingo en tu cocina. Tú me enseñaste que las cosas importantes se hacen despacio, que siempre hay sitio para uno más en la mesa y que una buena historia mejora cualquier día. Ahora soy yo quien cuenta tus historias. Cada vez que alguien se ríe con ellas, siento que sigues aquí. Gracias por todo lo que me diste sin pedir nada a cambio.",
      },
      {
        title: "El liderazgo",
        text: "Durante mucho tiempo creímos que un líder era la persona que más hablaba, la que daba órdenes y nunca mostraba dudas. Hoy sabemos que el liderazgo funciona de otra manera. Los mejores líderes escuchan más de lo que hablan. Hacen preguntas, admiten sus errores y reconocen el mérito de los demás. No necesitan levantar la voz para que los sigan, porque la gente confía en ellos. Liderar no es un cargo que aparece en una tarjeta de visita; es una forma de comportarse cada día. Cualquiera puede ser líder en su clase, en su equipo o en su familia. Solo hace falta dar ejemplo, incluso cuando nadie está mirando.",
      },
    ],
  },
  en: {
    improvise: [
      "Is it better to be a specialist or a generalist?",
      "The best piece of advice you've ever received",
      "Should phones be banned in classrooms?",
      "Why do some people succeed and others don't?",
      "Convince us that mornings beat nights (or the opposite)",
      "Should everyone learn to code?",
      "What you would change about your city",
      "Is social media making us more or less social?",
      "The skill everyone should learn before 25",
      "Working from home or from the office?",
      "Do you need to fail to succeed?",
      "What makes a good leader",
      "Should university be free?",
      "The invention that changed the world the most",
      "Money or free time: which is worth more?",
      "What you would do with one extra hour every day",
      "Is it better to travel alone or with friends?",
      "Can we trust artificial intelligence?",
      "The most underrated habit",
      "What success means to you",
    ],
    explain: [
      "How inflation works",
      "What artificial intelligence is",
      "Why the sky is blue",
      "How a vaccine works",
      "What blockchain is",
      "How the internet works",
      "What compound interest is",
      "Why we have seasons",
      "How a credit card works",
      "What climate change is",
      "How a startup raises money",
      "What a black hole is",
    ],
    story: [
      "The day you learned something the hard way",
      "A moment when your nerves were through the roof",
      "The best trip you've ever taken",
      "A time you changed your mind about something",
      "The funniest thing that happened to you at school or work",
      "A person who inspires you",
      "A time you had to decide in seconds",
      "Your first day at something new",
      "A small win that matters to you",
      "A day when everything went wrong",
      "A conversation that changed how you see something",
      "A risk you dared to take",
    ],
    reading: [
      {
        title: "The first step",
        text: "There is a moment, just before speaking in public, when your heart races and your mind goes blank. We have all felt it. The good news is that this fear doesn't disappear with time: it transforms. Great speakers are not people without nerves, but people who have learned to use that energy in their favor. They breathe deeply, look at the audience and start slowly. They know the first sentence sets the tone for everything else. So the next time you feel that knot in your stomach, don't try to make it go away. Accept it, smile and take the first step. The audience doesn't expect perfection; it expects someone authentic.",
      },
      {
        title: "The city wakes up",
        text: "At six in the morning, the city is still yawning. The first buses roll down almost empty avenues, bakery shutters rise with a squeak, and the smell of fresh bread mixes with that of coffee. A delivery rider on a bike swerves around a street sweeper whistling an old song. On a corner, a woman waits at the lights, quietly rehearsing what she will say in her job interview. Nobody is looking at her, but she feels as if everyone is. When the light turns green, she crosses with a firm step. In an hour, her life could be different. The city, indifferent, keeps waking up around her.",
      },
      {
        title: "The pitch",
        text: "Every year, millions of people waste hours looking for parking in their city center. That lost time turns into stress, pollution and money. Our solution is simple: an app that connects drivers with private parking spaces that sit empty during the day. Owners earn extra income without lifting a finger, and drivers find a spot in under two minutes. In six months we have reached more than ten thousand users in three cities, without spending a single euro on advertising. Today we are looking for a partner to help us reach all of Europe. We don't sell parking spaces. We sell time, and time is the one thing no one can get back.",
      },
      {
        title: "The brain and sleep",
        text: "While we sleep, the brain doesn't switch off. On the contrary: it works hard to sort out everything we experienced during the day. During deep sleep, it strengthens important memories and discards the ones it doesn't need. It also activates a cleaning system that removes waste built up during our waking hours. That's why, after a bad night, we struggle to concentrate, remember names or make decisions. Scientists recommend sleeping between seven and nine hours, going to bed at the same time every day and avoiding screens before sleep. Sleeping well is not a waste of time. It is probably one of the best investments we can make in our health.",
      },
      {
        title: "Graduation speech",
        text: "Dear classmates: today we close a chapter that, at many points, we thought would never end. We remember last-minute exams, sleepless nights and the coffees that kept us going. But we also remember the laughter in the hallways, the friends we found along the way and the teachers who believed in us when we didn't even believe in ourselves. From tomorrow, each of us will take a different path. Some will know exactly where they are going; others, not yet. And that's fine. What matters is not having all the answers, but never stopping asking questions. Thank you for these years. It has been an honor to learn by your side.",
      },
      {
        title: "The news",
        text: "A group of high school students has developed a system that can detect water leaks in old buildings using low-cost sensors. The project, which started as a class assignment, has caught the attention of several city councils interested in using it in schools and public libraries. According to its creators, the device costs less than twenty euros and can cut water consumption by up to thirty percent. \"We wanted to show that you don't need to be a big company to solve a real problem,\" explains one of the students. The team will present its invention next month at an international science fair, where it will compete with projects from more than forty countries.",
      },
      {
        title: "The letter",
        text: "Dear Grandma: I've wanted to write to you for a long time, but I could never find the words. Today, sorting through some boxes, I found your cookie recipe in your slanted handwriting, with a chocolate stain in the corner. I sat on the floor and couldn't help laughing, remembering Sunday afternoons in your kitchen. You taught me that important things are done slowly, that there is always room for one more at the table, and that a good story makes any day better. Now I'm the one telling your stories. Every time someone laughs at them, I feel you are still here. Thank you for everything you gave me without ever asking for anything in return.",
      },
      {
        title: "Leadership",
        text: "For a long time we believed a leader was the person who talked the most, gave orders and never showed doubt. Today we know leadership works differently. The best leaders listen more than they speak. They ask questions, admit their mistakes and give credit to others. They don't need to raise their voice for people to follow them, because people trust them. Leading is not a title printed on a business card; it is a way of behaving every day. Anyone can be a leader in their class, their team or their family. All it takes is setting an example, even when no one is watching.",
      },
    ],
  },
  fr: {
    improvise: [
      "Vaut-il mieux être spécialiste ou généraliste ?",
      "Le meilleur conseil qu'on t'ait donné",
      "Faut-il interdire les téléphones en classe ?",
      "Pourquoi certaines personnes réussissent et d'autres non ?",
      "Convaincs-nous que le matin vaut mieux que le soir (ou l'inverse)",
      "Tout le monde devrait-il apprendre à coder ?",
      "Ce que tu changerais dans ta ville",
      "Les réseaux sociaux nous rendent-ils plus ou moins sociables ?",
      "La compétence que tout le monde devrait apprendre avant 25 ans",
      "Télétravail ou bureau ?",
      "Faut-il échouer pour réussir ?",
      "Ce qui fait un bon leader",
      "L'université devrait-elle être gratuite ?",
      "L'invention qui a le plus changé le monde",
      "Argent ou temps libre : qu'est-ce qui vaut le plus ?",
      "Ce que tu ferais d'une heure de plus chaque jour",
      "Mieux vaut voyager seul ou entre amis ?",
      "Peut-on faire confiance à l'intelligence artificielle ?",
      "L'habitude la plus sous-estimée",
      "Ce que réussir veut dire pour toi",
    ],
    explain: [
      "Comment fonctionne l'inflation",
      "Ce qu'est l'intelligence artificielle",
      "Pourquoi le ciel est bleu",
      "Comment fonctionne un vaccin",
      "Ce qu'est la blockchain",
      "Comment fonctionne internet",
      "Ce que sont les intérêts composés",
      "Pourquoi il y a des saisons",
      "Comment fonctionne une carte de crédit",
      "Ce qu'est le changement climatique",
      "Comment une startup lève des fonds",
      "Ce qu'est un trou noir",
    ],
    story: [
      "Le jour où tu as appris quelque chose à tes dépens",
      "Un moment où tu avais vraiment le trac",
      "Le plus beau voyage que tu aies fait",
      "Une fois où tu as changé d'avis sur quelque chose",
      "Le truc le plus drôle qui te soit arrivé en cours ou au travail",
      "Une personne qui t'inspire",
      "Une fois où tu as dû décider en quelques secondes",
      "Ton premier jour dans quelque chose de nouveau",
      "Une petite victoire qui compte pour toi",
      "Un jour où tout a mal tourné",
      "Une conversation qui a changé ton regard sur quelque chose",
      "Un risque que tu as osé prendre",
    ],
    reading: [
      {
        title: "Le premier pas",
        text: "Il y a un moment, juste avant de parler en public, où le cœur s'accélère et l'esprit se vide. Nous l'avons tous ressenti. La bonne nouvelle, c'est que cette peur ne disparaît pas avec le temps : elle se transforme. Les grands orateurs ne sont pas des personnes sans trac, mais des personnes qui ont appris à utiliser cette énergie à leur avantage. Ils respirent profondément, regardent le public et commencent lentement. Ils savent que la première phrase donne le ton de tout le reste. Alors, la prochaine fois que tu sentiras ce nœud dans l'estomac, n'essaie pas de le faire disparaître. Accepte-le, souris et fais le premier pas. Le public n'attend pas la perfection ; il attend quelqu'un d'authentique.",
      },
      {
        title: "La ville se réveille",
        text: "À six heures du matin, la ville bâille encore. Les premiers bus parcourent des avenues presque vides, les rideaux des boulangeries se lèvent en grinçant et l'odeur du pain chaud se mêle à celle du café. Un livreur à vélo évite un balayeur qui siffle une vieille chanson. À un coin de rue, une femme attend au feu en répétant à voix basse ce qu'elle dira à son entretien d'embauche. Personne ne la regarde, mais elle a l'impression que tout le monde le fait. Quand le feu passe au vert, elle traverse d'un pas décidé. Dans une heure, sa vie pourrait être différente. La ville, indifférente, continue de se réveiller autour d'elle.",
      },
      {
        title: "Le pitch",
        text: "Chaque année, des millions de personnes perdent des heures à chercher une place de parking en centre-ville. Ce temps perdu se transforme en stress, en pollution et en argent. Notre solution est simple : une application qui met en relation les conducteurs avec des places privées vides pendant la journée. Les propriétaires gagnent un revenu supplémentaire sans rien faire, et les conducteurs trouvent une place en moins de deux minutes. En six mois, nous avons dépassé les dix mille utilisateurs dans trois villes, sans dépenser un euro en publicité. Aujourd'hui, nous cherchons un partenaire pour nous aider à conquérir toute l'Europe. Nous ne vendons pas des places de parking. Nous vendons du temps, et le temps est la seule chose que personne ne peut récupérer.",
      },
      {
        title: "Le cerveau et le sommeil",
        text: "Pendant que nous dormons, le cerveau ne s'éteint pas. Au contraire : il travaille intensément pour trier tout ce que nous avons vécu dans la journée. Pendant le sommeil profond, il renforce les souvenirs importants et élimine ceux dont il n'a pas besoin. Il active aussi un système de nettoyage qui évacue les déchets accumulés pendant les heures d'activité. C'est pour cela qu'après une mauvaise nuit, nous avons du mal à nous concentrer, à retenir des noms ou à prendre des décisions. Les scientifiques recommandent de dormir entre sept et neuf heures, de se coucher toujours à la même heure et d'éviter les écrans avant de dormir. Bien dormir n'est pas une perte de temps. C'est sans doute l'un des meilleurs investissements pour notre santé.",
      },
      {
        title: "Discours de remise des diplômes",
        text: "Chers camarades : aujourd'hui, nous refermons un chapitre dont nous avons souvent cru qu'il ne finirait jamais. Nous nous souvenons des révisions de dernière minute, des nuits blanches et des cafés qui nous ont tenus debout. Mais nous nous souvenons aussi des fous rires dans les couloirs, des amis rencontrés en chemin et des professeurs qui ont cru en nous quand nous-mêmes n'y croyions plus. Dès demain, chacun prendra un chemin différent. Certains sauront exactement où ils vont ; d'autres, pas encore. Et c'est très bien ainsi. L'important n'est pas d'avoir toutes les réponses, mais de ne jamais cesser de poser des questions. Merci pour ces années. Ce fut un honneur d'apprendre à vos côtés.",
      },
      {
        title: "La nouvelle",
        text: "Un groupe de lycéens a mis au point un système capable de détecter les fuites d'eau dans les bâtiments anciens grâce à des capteurs bon marché. Le projet, qui a commencé comme un simple devoir en classe, a attiré l'attention de plusieurs mairies intéressées par son installation dans des écoles et des bibliothèques publiques. Selon ses créateurs, l'appareil coûte moins de vingt euros et peut réduire la consommation d'eau jusqu'à trente pour cent. « Nous voulions montrer qu'il n'est pas nécessaire d'être une grande entreprise pour résoudre un vrai problème », explique l'une des élèves. L'équipe présentera son invention le mois prochain lors d'un salon scientifique international, face à des projets venus de plus de quarante pays.",
      },
      {
        title: "La lettre",
        text: "Chère mamie, cela fait longtemps que je voulais t'écrire, mais je ne trouvais jamais les mots. Aujourd'hui, en rangeant des cartons, j'ai retrouvé ta recette de biscuits, avec ton écriture penchée et une tache de chocolat dans le coin. Impossible de ne pas rire en repensant aux dimanches après-midi dans ta cuisine. Tu m'as appris que les choses importantes se font lentement, qu'il y a toujours de la place pour un de plus à table et qu'une bonne histoire rend n'importe quelle journée meilleure. Maintenant, c'est moi qui raconte tes histoires. Chaque fois que quelqu'un en rit, j'ai l'impression que tu es encore là. Merci pour tout ce que tu m'as donné sans jamais rien demander en retour.",
      },
      {
        title: "Le leadership",
        text: "Pendant longtemps, nous avons cru qu'un leader était la personne qui parlait le plus, donnait des ordres et ne montrait jamais de doute. Aujourd'hui, nous savons que le leadership fonctionne autrement. Les meilleurs leaders écoutent plus qu'ils ne parlent. Ils posent des questions, reconnaissent leurs erreurs et valorisent le mérite des autres. Ils n'ont pas besoin d'élever la voix pour être suivis, parce que les gens leur font confiance. Diriger n'est pas un titre imprimé sur une carte de visite ; c'est une manière de se comporter chaque jour. N'importe qui peut être un leader dans sa classe, son équipe ou sa famille. Il suffit de montrer l'exemple, même quand personne ne regarde.",
      },
    ],
  },
};
