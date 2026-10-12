export const COLUMNS = 12;
export const CATALOG = {
  clock: {
    title: "Uhr & Begrüßung",
    description: "Analoge Uhr, Datum und dein Name.",
    w: 4,
    h: 3,
  },
  search: {
    title: "Websuche",
    description: "Deine Suchmaschine, direkt erreichbar.",
    w: 8,
    h: 1,
  },
  links: {
    title: "Schnellzugriffe",
    description: "Deine Links, nach Gruppen sortiert.",
    w: 8,
    h: 2,
  },
  calendar: {
    title: "Kalender",
    description: "Monatsübersicht mit markiertem Heute.",
    w: 4,
    h: 3,
  },
  tasks: {
    title: "Aufgaben",
    description: "Deine nächsten Schritte abhaken.",
    w: 4,
    h: 3,
  },
  notes: { title: "Notiz", description: "Ideen lokal festhalten.", w: 4, h: 3 },
  focus: {
    title: "Fokus-Timer",
    description: "Eine konzentrierte Pause vom Tab-Chaos.",
    w: 4,
    h: 2,
  },
  weather: {
    title: "Wetter",
    description: "Optional: echtes Wetter von Open-Meteo.",
    w: 4,
    h: 3,
  },
  worldclock: {
    title: "Weltuhr",
    description: "Eine zweite Zeitzone im Blick.",
    w: 4,
    h: 2,
  },
  calculator: {
    title: "Rechner",
    description: "Rechnen, ohne die Seite zu verlassen.",
    w: 4,
    h: 3,
  },
  countdown: {
    title: "Countdown",
    description: "Zeit bis zu deinem nächsten Termin.",
    w: 4,
    h: 2,
  },
  inspiration: {
    title: "Tagesimpuls",
    description: "Ein ruhiger, täglich wechselnder Gedanke.",
    w: 4,
    h: 2,
  },
};
export const DEFAULT_LAYOUT = [
  { type: "clock", x: 0, y: 0, w: 4, h: 3 },
  { type: "search", x: 4, y: 0, w: 8, h: 1 },
  { type: "links", x: 4, y: 1, w: 8, h: 2 },
  { type: "calendar", x: 0, y: 3, w: 4, h: 3 },
  { type: "tasks", x: 4, y: 3, w: 4, h: 3 },
  { type: "notes", x: 8, y: 3, w: 4, h: 3 },
  { type: "focus", x: 0, y: 6, w: 4, h: 2 },
];
export const DEFAULT_DASHBOARD = {
  layout: DEFAULT_LAYOUT,
  wallpaper: "aurora",
  customBackground: "",
  opacity: 76,
  name: "",
  focusMinutes: 25,
  focus: null,
  timezone: "Europe/Berlin",
  countdown: null,
  weather: null,
};
export const intersects = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export function validateLayout(layout) {
  if (!Array.isArray(layout) || layout.length > Object.keys(CATALOG).length)
    throw new Error("Ungültiges Widget-Raster.");
  const types = new Set();
  const clean = layout.map((item) => {
    if (
      !item ||
      !Object.hasOwn(CATALOG, item.type) ||
      types.has(item.type) ||
      ![item.x, item.y, item.w, item.h].every(Number.isInteger) ||
      item.x < 0 ||
      item.y < 0 ||
      item.y > 60 ||
      item.w < 3 ||
      item.w > 12 ||
      item.x + item.w > 12 ||
      item.h < CATALOG[item.type].h ||
      item.h > 8
    )
      throw new Error("Ungültige Widget-Position oder Größe.");
    types.add(item.type);
    return { type: item.type, x: item.x, y: item.y, w: item.w, h: item.h };
  });
  for (let i = 0; i < clean.length; i++)
    for (let j = i + 1; j < clean.length; j++)
      if (intersects(clean[i], clean[j]))
        throw new Error("Widgets dürfen sich nicht überlappen.");
  return clean;
}
export function moveWidget(layout, type, x, y, size = null) {
  const clean = validateLayout(layout),
    item = clean.find((item) => item.type === type);
  if (!item) throw new Error("Widget nicht gefunden.");
  const next = { ...item, ...(size ?? {}), x, y };
  return validateLayout(
    clean.map((item) => (item.type === type ? next : item)),
  );
}
export function toggleWidget(layout, type, enabled) {
  const clean = validateLayout(layout);
  if (!Object.hasOwn(CATALOG, type)) throw new Error("Unbekanntes Widget.");
  if (!enabled) return clean.filter((item) => item.type !== type);
  if (clean.some((item) => item.type === type)) return clean;
  const { w, h } = CATALOG[type];
  for (let y = 0; y <= 60; y++)
    for (let x = 0; x <= 12 - w; x++) {
      const next = { type, x, y, w, h };
      if (!clean.some((item) => intersects(next, item)))
        return [...clean, next];
    }
  throw new Error("Das Raster ist voll. Entferne zunächst ein Widget.");
}
export function validateDashboard(
  value,
  widgets = { tasks: true, notes: true },
) {
  const data = value === undefined ? structuredClone(DEFAULT_DASHBOARD) : value;
  if (
    !data ||
    !["aurora", "mountains", "clean", "custom"].includes(data.wallpaper) ||
    typeof data.customBackground !== "string" ||
    data.customBackground.length > 1500000 ||
    (data.customBackground &&
      !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(
        data.customBackground,
      )) ||
    !Number.isInteger(data.opacity) ||
    data.opacity < 35 ||
    data.opacity > 95 ||
    typeof data.name !== "string" ||
    data.name.length > 40 ||
    !Number.isInteger(data.focusMinutes) ||
    data.focusMinutes < 1 ||
    data.focusMinutes > 180 ||
    typeof data.timezone !== "string"
  )
    throw new Error("Ungültige Dashboard-Einstellungen.");
  try {
    new Intl.DateTimeFormat("de-DE", { timeZone: data.timezone });
  } catch {
    throw new Error("Ungültige Zeitzone.");
  }
  const focus = data.focus;
  if (
    focus !== null &&
    (!focus ||
      !["running", "paused"].includes(focus.mode) ||
      !Number.isFinite(focus.endAt) ||
      !Number.isInteger(focus.remaining) ||
      focus.remaining < 0 ||
      focus.remaining > 10800)
  )
    throw new Error("Ungültiger Timer.");
  const countdown = data.countdown;
  if (
    countdown !== null &&
    (!countdown ||
      typeof countdown.title !== "string" ||
      !countdown.title.trim() ||
      countdown.title.length > 80 ||
      typeof countdown.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(countdown.date) ||
      !Number.isFinite(Date.parse(countdown.date)))
  )
    throw new Error("Ungültiger Countdown.");
  const weather = data.weather;
  if (
    weather !== null &&
    (!weather ||
      typeof weather.name !== "string" ||
      weather.name.length > 120 ||
      !Number.isFinite(weather.latitude) ||
      Math.abs(weather.latitude) > 90 ||
      !Number.isFinite(weather.longitude) ||
      Math.abs(weather.longitude) > 180)
  )
    throw new Error("Ungültiger Wetterort.");
  if (
    weather?.current &&
    (!Number.isFinite(weather.current.temperature) ||
      weather.current.temperature < -100 ||
      weather.current.temperature > 70 ||
      !Number.isFinite(weather.current.humidity) ||
      weather.current.humidity < 0 ||
      weather.current.humidity > 100 ||
      !Number.isFinite(weather.current.fetchedAt) ||
      weather.current.fetchedAt < 0)
  )
    throw new Error("Ungültige Wetterdaten.");
  let layout = validateLayout(data.layout);
  for (const type of ["tasks", "notes"])
    layout = toggleWidget(layout, type, widgets[type]);
  return {
    layout,
    wallpaper: data.wallpaper,
    customBackground: data.customBackground,
    opacity: data.opacity,
    name: data.name,
    focusMinutes: data.focusMinutes,
    focus:
      focus === null
        ? null
        : { mode: focus.mode, endAt: focus.endAt, remaining: focus.remaining },
    timezone: data.timezone,
    countdown:
      countdown === null
        ? null
        : { title: countdown.title.trim(), date: countdown.date },
    weather:
      weather === null
        ? null
        : {
            name: weather.name,
            latitude: weather.latitude,
            longitude: weather.longitude,
            current: weather.current
              ? {
                  temperature: weather.current.temperature,
                  humidity: weather.current.humidity,
                  fetchedAt: weather.current.fetchedAt,
                }
              : null,
          },
  };
}
