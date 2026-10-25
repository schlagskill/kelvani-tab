export function calculate(input) {
  if (typeof input !== "string" || input.length > 120)
    throw new Error("Bitte eine kurze Rechnung eingeben.");
  const source = input
    .replace(/,/g, ".")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-");
  if (!source.trim() || /[^\d.+*/()%\s-]/.test(source))
    throw new Error("Erlaubt: Zahlen, +, −, *, /, % und Klammern.");
  const tokens = source.match(/(?:\d+(?:\.\d*)?|\.\d+)|[+*/()%-]/g);
  if (!tokens || tokens.join("") !== source.replace(/\s/g, ""))
    throw new Error("Ungültige Rechnung.");
  let index = 0;
  const factor = () => {
    const token = tokens[index++];
    if (token === "+") return factor();
    if (token === "-") return -factor();
    if (token === "(") {
      const value = expression();
      if (tokens[index++] !== ")") throw new Error("Klammer fehlt.");
      return value;
    }
    if (!token || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token))
      throw new Error("Ungültige Rechnung.");
    return Number(token);
  };
  const term = () => {
    let value = factor();
    while (["*", "/", "%"].includes(tokens[index])) {
      const op = tokens[index++],
        right = factor();
      value =
        op === "*" ? value * right : op === "/" ? value / right : value % right;
    }
    return value;
  };
  const expression = () => {
    let value = term();
    while (["+", "-"].includes(tokens[index])) {
      const op = tokens[index++],
        right = term();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  };
  const result = expression();
  if (index !== tokens.length || !Number.isFinite(result))
    throw new Error("Die Rechnung ergibt keinen gültigen Wert.");
  return Number(result.toPrecision(12));
}
export function calendarMonth(year, month) {
  const first = new Date(year, month, 1),
    days = new Date(year, month + 1, 0).getDate(),
    offset = (first.getDay() + 6) % 7;
  return {
    label: first.toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric",
    }),
    cells: [
      ...Array(offset).fill(null),
      ...Array.from({ length: days }, (_, i) => i + 1),
    ],
  };
}
export function timerSeconds(focus, minutes, now = Date.now()) {
  return focus?.mode === "running"
    ? Math.max(0, Math.ceil((focus.endAt - now) / 1000))
    : focus?.mode === "paused"
      ? focus.remaining
      : minutes * 60;
}
export function localDayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
export function calendarAfterRollover(view, previous, now) {
  return localDayKey(previous) !== localDayKey(now) &&
    view.year === previous.getFullYear() &&
    view.month === previous.getMonth()
    ? { year: now.getFullYear(), month: now.getMonth() }
    : { ...view };
}
export function changeFocusMinutes(dashboard, minutes, now = Date.now()) {
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180)
    throw new Error("Wähle zwischen 1 und 180 Minuten.");
  if (
    dashboard.focus &&
    timerSeconds(dashboard.focus, dashboard.focusMinutes, now) > 0
  )
    throw new Error("Setze den laufenden Timer zuerst zurück.");
  return { ...dashboard, focusMinutes: minutes, focus: null };
}
