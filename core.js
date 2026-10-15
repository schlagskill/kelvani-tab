import { DEFAULT_DASHBOARD, validateDashboard } from "./layout.js";
export const GROUPS = {
  everyday: "Alltag",
  development: "Entwicklung",
  creative: "Kreativ",
};
export const EMPTY = {
  version: 1,
  theme: "auto",
  engine: "duckduckgo",
  links: [],
  notes: "",
  tasks: [],
  widgets: { tasks: true, notes: true },
  dashboard: structuredClone(DEFAULT_DASHBOARD),
};
export function safeUrl(input) {
  if(typeof input!=="string"||!input.trim())throw new Error("Bitte eine Webadresse eingeben.");
  let address=input.trim();
  const hasScheme=/^[a-z][a-z\d+.-]*:/i.test(address);
  const hostWithPort=/^[^/?#:\s]+:\d+(?:[/?#]|$)/.test(address);
  if(address.startsWith('//'))address='https:'+address;
  else if(!hasScheme||hostWithPort)address='https://'+address;
  const url = new URL(address);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Bitte eine http(s)-Adresse ohne Zugangsdaten verwenden.");
  return url.href;
}
function idValid(id, ids) {
  if (typeof id !== "string" || !id || id.length > 100 || ids.has(id))
    throw new Error("Ungültige oder doppelte ID.");
  ids.add(id);
}
export function validateState(value) {
  if (
    !value ||
    value.version !== 1 ||
    !["sand", "night", "auto"].includes(value.theme) ||
    !["duckduckgo", "google", "bing"].includes(value.engine) ||
    !Array.isArray(value.links) ||
    value.links.length > 100 ||
    typeof value.notes !== "string" ||
    value.notes.length > 20000
  )
    throw new Error("Ungültige KelvaniTab-Daten.");
  const ids = new Set();
  const links = value.links.map((link) => {
    if (
      !link ||
      typeof link.title !== "string" ||
      !link.title.trim() ||
      link.title.length > 80 ||
      typeof link.url !== "string" ||
      link.url.length > 4096
    )
      throw new Error("Ungültiger Schnellzugriff.");
    idValid(link.id, ids);
    const group = link.group ?? "everyday";
    if (!Object.hasOwn(GROUPS, group))
      throw new Error("Unbekannte Link-Gruppe.");
    const url = safeUrl(link.url);
    if (url.length > 4096)
      throw new Error("Die normalisierte Webadresse ist zu lang.");
    return {
      id: link.id,
      title: link.title.trim(),
      url,
      group,
    };
  });
  const tasks = value.tasks ?? [];
  if (!Array.isArray(tasks) || tasks.length > 100)
    throw new Error("Ungültige Aufgabenliste.");
  const taskIds = new Set();
  const cleanTasks = tasks.map((task) => {
    if (
      !task ||
      typeof task.title !== "string" ||
      !task.title.trim() ||
      task.title.length > 200 ||
      typeof task.done !== "boolean"
    )
      throw new Error("Ungültige Aufgabe.");
    idValid(task.id, taskIds);
    return { id: task.id, title: task.title.trim(), done: task.done };
  });
  const widgets = value.widgets ?? { tasks: true, notes: true };
  if (
    !widgets ||
    typeof widgets.tasks !== "boolean" ||
    typeof widgets.notes !== "boolean"
  )
    throw new Error("Ungültige Widget-Einstellungen.");
  return {
    version: 1,
    theme: value.theme,
    engine: value.engine,
    links,
    notes: value.notes,
    tasks: cleanTasks,
    widgets: { tasks: widgets.tasks, notes: widgets.notes },
    dashboard: validateDashboard(value.dashboard, widgets),
  };
}
export function editLink(state, input, id) {
  const clean = validateState(state),
    url = safeUrl(input.url),
    group = input.group ?? "everyday";
  if (
    clean.links.some(
      (link) => link.id !== id && link.url === url && link.group === group,
    )
  )
    throw new Error("Diese Adresse ist in der Gruppe bereits vorhanden.");
  if (!clean.links.some((link) => link.id === id))
    throw new Error("Der Link wurde zwischenzeitlich entfernt.");
  return validateState({
    ...clean,
    links: clean.links.map((link) =>
      link.id === id ? { ...link, ...input, id, url } : link,
    ),
  });
}
export function addLink(state, input, id) {
  const clean = validateState(state),
    url = safeUrl(input.url),
    group = input.group ?? "everyday";
  if (clean.links.some((link) => link.url === url && link.group === group))
    throw new Error("Diese Adresse ist in der Gruppe bereits vorhanden.");
  return validateState({
    ...clean,
    links: [...clean.links, { id, title: input.title, url, group }],
  });
}
export function moveLink(state, id, direction) {
  const clean = validateState(state),
    links = [...clean.links],
    index = links.findIndex((link) => link.id === id);
  if (index < 0 || ![-1, 1].includes(direction))
    throw new Error("Ungültige Link-Reihenfolge.");
  let other = index + direction;
  while (
    other >= 0 &&
    other < links.length &&
    links[other].group !== links[index].group
  )
    other += direction;
  if (other >= 0 && other < links.length)
    [links[index], links[other]] = [links[other], links[index]];
  return { ...clean, links };
}
export function saveNotes(state, notes, expected, force = false) {
  if (!force && state.notes !== expected) {
    const error = new Error(
      "Die Notiz wurde in einem anderen Tab geändert. Dein Text bleibt erhalten.",
    );
    error.name = "NoteConflictError";
    throw error;
  }
  return validateState({ ...state, notes });
}
export function searchUrl(query, engine) {
  if (typeof query !== "string" || !query.trim())
    throw new Error("Bitte einen Suchbegriff eingeben.");
  const endpoints = {
    duckduckgo: "https://duckduckgo.com/?q=",
    google: "https://www.google.com/search?q=",
    bing: "https://www.bing.com/search?q=",
  };
  if (!endpoints[engine]) throw new Error("Unbekannte Suchmaschine.");
  return endpoints[engine] + encodeURIComponent(query.trim());
}
