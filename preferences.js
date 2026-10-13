import { NOTICE_DURATIONS } from './assets/ui/feedback.js?v=1';
export const COLOR_SCHEMES = {
  blue: {
    label: "Blau",
    accent: ["#155eef", "#8ec4ff"],
    glass: "9 28 52",
    aurora: ["#3b75b3", "#24518b", "#071b36"],
  },
  violet: {
    label: "Violett",
    accent: ["#6d28d9", "#c4a7ff"],
    glass: "35 20 58",
    aurora: ["#8462bf", "#513385", "#20112f"],
  },
  emerald: {
    label: "Grün",
    accent: ["#047857", "#7ee0bb"],
    glass: "10 40 33",
    aurora: ["#398e79", "#1c6351", "#071f1a"],
  },
  rose: {
    label: "Rosa",
    accent: ["#be185d", "#f9a8d4"],
    glass: "50 22 38",
    aurora: ["#b76591", "#763951", "#29121f"],
  },
  amber: {
    label: "Bernstein",
    accent: ["#92400e", "#fcd28d"],
    glass: "45 31 17",
    aurora: ["#a27d45", "#705227", "#241b10"],
  },
  slate: {
    label: "Graphit",
    accent: ["#334155", "#cbd5e1"],
    glass: "25 31 40",
    aurora: ["#718096", "#465265", "#171f29"],
  },
};
export function noticeDuration(error = false, undo = false) {
  return error ? NOTICE_DURATIONS.error : undo ? NOTICE_DURATIONS.undo : NOTICE_DURATIONS.success;
}
export const MOTIVATIONS = [
  [
    "Ein kleiner Schritt ist auch ein Anfang.",
    "A small step is a beginning, too.",
  ],
  ["Beginne dort, wo du gerade bist.", "Start where you are."],
  [
    "Gib einer Sache heute deine volle Aufmerksamkeit.",
    "Give one thing your full attention today.",
  ],
  [
    "Eine gute Idee braucht Platz, nicht Eile.",
    "A good idea needs space, not haste.",
  ],
  ["Du bestimmst das Tempo deines Tages.", "You set the pace of your day."],
  [
    "Mach den nächsten Schritt überschaubar.",
    "Make your next step manageable.",
  ],
  ["Fortschritt darf leise sein.", "Progress can be quiet."],
  [
    "Deine Neugier ist ein guter Anfang.",
    "Your curiosity is a good beginning.",
  ],
  [
    "Heute ist Platz für etwas Neues.",
    "There is room for something new today.",
  ],
  ["Ein Versuch bringt dich weiter.", "One attempt moves you forward."],
  ["Baue etwas, das dir Freude macht.", "Build something that brings you joy."],
  ["Lerne beim Machen.", "Learn by doing."],
  ["Auch Pausen gehören zum Fortschritt.", "Rest is part of progress."],
  ["Konzentriere dich auf den nächsten Schritt.", "Focus on the next step."],
  [
    "Du musst nicht alles auf einmal schaffen.",
    "You do not have to do everything at once.",
  ],
  ["Halte eine gute Idee fest.", "Write down a good idea."],
  ["Jeder Entwurf kann besser werden.", "Every draft can get better."],
  ["Probier es aus und lerne daraus.", "Try it and learn from it."],
  ["Ein klarer Plan schafft Freiraum.", "A clear plan creates breathing room."],
  ["Kleine Schritte ergeben einen Weg.", "Small steps make a path."],
  ["Gib dir Zeit zum Denken.", "Give yourself time to think."],
  ["Heute reicht ein guter Anfang.", "A good beginning is enough for today."],
  ["Mach das Wichtige leicht erreichbar.", "Keep what matters within reach."],
  ["Eine Frage kann Türen öffnen.", "A question can open doors."],
  ["Dein Weg darf sich verändern.", "Your path is allowed to change."],
  ["Bleib neugierig auf das Ergebnis.", "Stay curious about the result."],
  ["Erst ausprobieren, dann verbessern.", "Try first, then improve."],
  [
    "Weniger Ablenkung schafft mehr Raum.",
    "Fewer distractions create more space.",
  ],
  ["Du darfst neu anfangen.", "You can begin again."],
  ["Feiere auch kleine Fortschritte.", "Celebrate small wins, too."],
  ["Eine Pause bringt oft Klarheit.", "A break often brings clarity."],
  ["Wähle heute einen Schwerpunkt.", "Choose one focus for today."],
  ["Gute Arbeit wächst Schritt für Schritt.", "Good work grows step by step."],
  ["Aus Neugier entsteht Können.", "Curiosity grows into skill."],
  ["Zeig deiner Idee eine erste Form.", "Give your idea its first shape."],
  ["Du kannst unterwegs dazulernen.", "You can learn along the way."],
  ["Ein ehrlicher Versuch zählt.", "An honest attempt counts."],
  ["Nimm dir Raum für Kreativität.", "Make room for creativity."],
  [
    "Der nächste Schritt muss nicht perfekt sein.",
    "The next step does not have to be perfect.",
  ],
  [
    "Ein aufgeräumter Start hilft beim Denken.",
    "A tidy start helps you think.",
  ],
  [
    "Heute kannst du etwas besser verstehen.",
    "Today you can understand something better.",
  ],
  ["Bleib geduldig mit deinem Fortschritt.", "Be patient with your progress."],
  ["Teile etwas, das anderen hilft.", "Share something that helps others."],
  ["Deine Ideen verdienen einen Versuch.", "Your ideas deserve a try."],
  [
    "Ein Problem ist auch eine Lernchance.",
    "A problem is also a chance to learn.",
  ],
  [
    "Finde einen Rhythmus, der dir guttut.",
    "Find a rhythm that works for you.",
  ],
  [
    "Du kannst aus kleinen Dingen Großes bauen.",
    "You can build great things from small beginnings.",
  ],
  ["Lass Raum für unerwartete Ideen.", "Leave room for unexpected ideas."],
  [
    "Mach weiter mit dem, was dir wichtig ist.",
    "Keep going with what matters to you.",
  ],
  [
    "Ein bewusster Anfang verändert den Tag.",
    "An intentional start can change your day.",
  ],
];
export function motivation(index, language = "de") {
  return MOTIVATIONS[((index % 50) + 50) % 50][language === "en" ? 1 : 0];
}
export function randomMotivationIndex(random = Math.random) {
  return Math.min(49, Math.max(0, Math.floor(random() * 50)));
}
