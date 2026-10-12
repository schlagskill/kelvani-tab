import { WALLPAPERS } from "./wallpapers.js";
import { parseWeather } from "./weather.js";
import {
  CATALOG,
  DEFAULT_LAYOUT,
  arrangeWidget,
  reorderWidget,
  toggleWidget,
} from "./layout.js";
import { calculate, calendarMonth, timerSeconds } from "./widget-math.js";
import { $, el, button, notify, showDialog } from "./ui.js";

export function mountDashboard({ getState, mutate, flushNotes }) {
  let editMode = false,
    dragging = null,
    busy = false,
    month = new Date().getMonth(),
    year = new Date().getFullYear();
  const board = $("#board");
  function panel(type, body) {
    const article = el("article", "", `widget widget-${type}`);
    article.dataset.widget = type;
    article.id = `panel-${type}`;
    const tools = el("div", "", "widget-tools"),
      handle = button(`⠿ ${CATALOG[type].title}`, null, "drag-handle");
    handle.setAttribute("aria-label", `${CATALOG[type].title} verschieben`);
    handle.title = "Ziehen oder mit Pfeiltasten verschieben";
    handle.dataset.handle = type;
    const resize = button("↘", null, "resize-grip");
    resize.setAttribute("aria-label", `${CATALOG[type].title} Größe ändern`);
    resize.title = "Ziehen zum Vergrößern; Pfeiltasten ändern die Größe";
    resize.dataset.resize = type;
    resize.addEventListener("pointerdown", startDrag);
    resize.addEventListener("keydown", (event) => keyboardResize(event, type));
    const hide = button("×", () => setVisible(type, false), "icon-button");
    hide.setAttribute("aria-label", `${CATALOG[type].title} ausblenden`);
    tools.append(handle, hide);
    article.append(tools, body, resize);
    board.append(article);
    handle.addEventListener("pointerdown", startDrag);

    handle.addEventListener("keydown", (event) => keyboardMove(event, type));
    return article;
  }
  const body = (title) => {
    const node = el("section", "", "widget-body");
    if (title) node.append(el("h2", title));
    return node;
  };
  for (const type of ["search", "links", "tasks", "notes"]) {
    const node = $(`#content-${type}`);
    panel(type, node);
  }
  const clock = body();
  clock.classList.add("clock-content");
  const face = el("div", "", "clock-face");
  for (const type of ["hour", "minute", "second"])
    face.append(el("span", "", `clock-hand ${type}-hand`));
  face.append(el("i", "", "clock-center"));
  const digital = el("div", "", "digital-time");
  digital.id = "digital-time";
  const date = el("p", "", "clock-date");
  date.id = "date";
  const greeting = el("h1");
  greeting.id = "greeting";
  clock.append(face, digital, date, greeting);
  panel("clock", clock);
  const calendar = body(),
    calendarHead = el("div", "", "calendar-heading");
  calendarHead.append(
    button("‹", () => changeMonth(-1), "icon-button"),
    el("h2", "", "calendar-title"),
    button("›", () => changeMonth(1), "icon-button"),
  );
  calendarHead.firstChild.setAttribute("aria-label", "Vorheriger Monat");
  calendarHead.lastChild.setAttribute("aria-label", "Nächster Monat");
  const days = el("div", "", "calendar-days");
  days.id = "calendar-days";
  calendar.append(
    calendarHead,
    days,
    button(
      "Heute",
      () => {
        const now = new Date();
        month = now.getMonth();
        year = now.getFullYear();
        renderCalendar();
      },
      "text-button",
    ),
  );
  panel("calendar", calendar);
  const focus = body("Fokuszeit"),
    timer = el("div", "25:00", "timer-value");
  timer.id = "focus-time";
  const focusForm = el("div", "", "timer-controls"),
    minutes = el("input");
  minutes.type = "number";
  minutes.min = "1";
  minutes.max = "180";
  minutes.value = "25";
  minutes.setAttribute("aria-label", "Fokusdauer in Minuten");
  minutes.id = "focus-minutes";
  const timerStart = button("Start", toggleTimer, "primary");
  timerStart.id = "focus-start";
  focusForm.append(
    minutes,
    timerStart,
    button(
      "Zurücksetzen",
      () =>
        mutate((s) => ({ ...s, dashboard: { ...s.dashboard, focus: null } })),
      "text-button",
    ),
  );
  focus.append(timer, focusForm);
  panel("focus", focus);
  const world = body("Weltuhr"),
    zone = el("select");
  zone.id = "timezone";
  zone.setAttribute("aria-label", "Zeitzone");
  for (const [value, label] of [
    ["Europe/Berlin", "Berlin"],
    ["Europe/London", "London"],
    ["America/New_York", "New York"],
    ["Asia/Tokyo", "Tokio"],
    ["Australia/Sydney", "Sydney"],
  ]) {
    const option = el("option", label);
    option.value = value;
    zone.append(option);
  }
  zone.addEventListener("change", () =>
    mutate((s) => ({
      ...s,
      dashboard: { ...s.dashboard, timezone: zone.value },
    })),
  );
  const worldTime = el("div", "", "world-time");
  worldTime.id = "world-time";
  world.append(worldTime, zone);
  panel("worldclock", world);
  const calculator = body("Schnell rechnen"),
    calcForm = el("form", "", "calculator-form"),
    input = el("input");
  input.id = "calculation";
  input.placeholder = "12 × (8 + 4)";
  input.maxLength = 120;
  input.setAttribute("aria-label", "Rechnung");
  const submit = el("button", "Berechnen", "primary");
  submit.type = "submit";
  const result = el("output", "0", "calculation-result");
  result.id = "calculation-result";
  result.setAttribute("aria-live", "polite");
  calcForm.append(input, submit);
  calcForm.addEventListener("submit", (event) => {
    event.preventDefault();
    result.classList.remove("error");
    result.setAttribute("role", "status");
    try {
      result.textContent = String(
        calculate(input.value.replace(/×/g, "*").replace(/÷/g, "/")),
      );
    } catch (error) {
      result.textContent = error.message;
      result.classList.add("error");
      result.setAttribute("role", "alert");
    }
  });
  calculator.append(
    result,
    calcForm,
    el("p", "+ − × ÷ % und Klammern.", "widget-hint"),
  );
  panel("calculator", calculator);
  const countdown = body("Countdown"),
    remaining = el("div", "Dein nächster Termin", "countdown-value");
  remaining.id = "countdown-value";
  const caption = el("p", "Lege einen Zeitpunkt fest.", "widget-hint");
  caption.id = "countdown-caption";
  countdown.append(
    remaining,
    caption,
    button(
      "Termin festlegen",
      () => {
        const saved = getState().dashboard.countdown;
        $("#countdown-title").value = saved?.title ?? "";
        $("#countdown-date").value = saved?.date ?? "";
        showDialog("#countdown-dialog");
      },
      "text-button",
    ),
  );
  panel("countdown", countdown);
  const inspiration = body("Ein Gedanke für heute"),
    quote = el("blockquote");
  const thoughts = [
    "Ein kleiner Schritt ist auch ein Anfang.",
    "Gib einer Sache heute deine volle Aufmerksamkeit.",
    "Eine gute Idee braucht Platz, nicht Eile.",
    "Mach es dir leichter, das Wichtige zu finden.",
    "Weniger offene Enden. Mehr Raum zum Denken.",
    "Du bestimmst das Tempo deines Tages.",
    "Beginne dort, wo du gerade bist.",
  ];
  quote.textContent =
    thoughts[Math.floor(Date.now() / 86400000) % thoughts.length];
  inspiration.append(quote, el("p", "Kelvani · Tagesimpuls", "widget-hint"));
  panel("inspiration", inspiration);
  const weather = body("Wetter"),
    weatherValue = el("div", "Dein Ort, dein Wetter", "weather-value");
  weatherValue.id = "weather-value";
  const weatherText = el(
    "p",
    "Wähle einen Ort. Ohne Einrichtung gibt es keine Wetteranfragen.",
    "widget-hint",
  );
  weatherText.id = "weather-text";
  weather.append(
    weatherValue,
    weatherText,
    button("Ort auswählen", () => showDialog("#weather-dialog"), "text-button"),
    button("Aktualisieren", refreshWeather, "text-button"),
  );
  panel("weather", weather);
  $("#countdown-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const countdown = {
      title: $("#countdown-title").value,
      date: $("#countdown-date").value,
    };
    if (
      await mutate((s) => ({ ...s, dashboard: { ...s.dashboard, countdown } }))
    )
      $("#countdown-dialog").close();
  });
  function renderCalendar() {
    $(".calendar-title").textContent = calendarMonth(year, month).label;
    const grid = $("#calendar-days");
    grid.replaceChildren();
    for (const day of ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"])
      grid.append(el("span", day, "weekday"));
    const now = new Date();
    for (const value of calendarMonth(year, month).cells) {
      const cell = el("span", value ?? "", "calendar-day");
      if (
        value === now.getDate() &&
        month === now.getMonth() &&
        year === now.getFullYear()
      ) {
        cell.classList.add("today");
        cell.setAttribute("aria-label", `Heute, ${value}.`);
      }
      grid.append(cell);
    }
  }
  function changeMonth(direction) {
    const date = new Date(year, month + direction, 1);
    month = date.getMonth();
    year = date.getFullYear();
    renderCalendar();
  }
  function tick() {
    const state = getState();
    if (!state) return;
    const now = new Date();
    $("#digital-time").textContent = now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
    $("#date").textContent = now.toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    $(".hour-hand").style.rotate =
      `${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg`;
    $(".minute-hand").style.rotate =
      `${now.getMinutes() * 6 + now.getSeconds() / 10}deg`;
    $(".second-hand").style.rotate = `${now.getSeconds() * 6}deg`;
    const hour = now.getHours();
    $("#greeting").textContent =
      `${hour < 11 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend"}${state.dashboard.name ? ", " + state.dashboard.name : "."}`;
    const seconds = timerSeconds(
      state.dashboard.focus,
      state.dashboard.focusMinutes,
    );
    $("#focus-time").textContent =
      `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    $("#focus-start").textContent =
      state.dashboard.focus?.mode === "running" && seconds > 0
        ? "Pause"
        : state.dashboard.focus?.mode === "paused"
          ? "Fortsetzen"
          : "Start";
    $("#world-time").textContent = now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: state.dashboard.timezone,
    });
    const target = state.dashboard.countdown;
    if (target) {
      const days = Math.ceil(
        (Date.parse(target.date) - now.getTime()) / 86400000,
      );
      $("#countdown-value").textContent =
        days > 0 ? `${days} ${days === 1 ? "Tag" : "Tage"}` : "Termin erreicht";
      $("#countdown-caption").textContent =
        `${target.title} · ${new Date(target.date).toLocaleString("de-DE")}`;
    }
    if (seconds === 0 && state.dashboard.focus?.mode === "running")
      $("#focus-time").textContent = "Geschafft!";
  }
  async function toggleTimer() {
    const state = getState(),
      minutes = Number($("#focus-minutes").value);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
      notify("Wähle zwischen 1 und 180 Minuten.", true);
      return;
    }
    const current = state.dashboard.focus,
      remaining = timerSeconds(current, state.dashboard.focusMinutes);
    const focus =
      current?.mode === "running" && remaining > 0
        ? { mode: "paused", remaining, endAt: 0 }
        : {
            mode: "running",
            remaining: current?.mode === "paused" ? remaining : minutes * 60,
            endAt:
              Date.now() +
              (current?.mode === "paused" ? remaining : minutes * 60) * 1000,
          };
    await mutate((s) => ({
      ...s,
      dashboard: { ...s.dashboard, focusMinutes: minutes, focus },
    }));
  }
  function place(article, item) {
    article.style.gridColumn = `${item.x + 1} / span ${item.w}`;
    article.style.gridRow = `${item.y + 1} / span ${item.h}`;
    article.style.setProperty("--widget-rows", item.h);
  }

  function paint() {
    const state = getState();
    if (!state) return;
    const data = state.dashboard;
    document.body.dataset.wallpaper = data.wallpaper;
    document.body.style.setProperty("--card-opacity", data.opacity / 100);
    const photo = WALLPAPERS[data.wallpaper];
    document.body.style.backgroundImage =
      data.wallpaper === "custom" && data.customBackground
        ? `linear-gradient(#06182d66,#06182d66), url("${data.customBackground}")`
        : photo
          ? `linear-gradient(#06182d55,#06182d77), url("assets/wallpapers/${photo.file}")`
          : "";
    const credit = $("#photo-credit");
    credit.hidden = !photo;
    if (photo) {
      credit.textContent = `Foto: ${photo.author} · Pixabay`;
      credit.href = photo.source;
    }
    for (const article of board.querySelectorAll(".widget")) {
      const item = data.layout.find((i) => i.type === article.dataset.widget);
      article.hidden = !item;
      if (item) {
        place(article, item);
        article.style.order = item.y * 12 + item.x;
      }
    }
    board.style.setProperty(
      "--rows",
      String(
        Math.max(3, ...data.layout.map((i) => i.y + i.h)) + (editMode ? 2 : 0),
      ),
    );
    $("#edit-layout").setAttribute("aria-pressed", editMode);
    $("#edit-layout").textContent = editMode ? "Fertig" : "Layout bearbeiten";
    board.classList.toggle("editing", editMode);
    $("#layout-help").hidden = !editMode;
    if (document.activeElement !== $("#focus-minutes"))
      $("#focus-minutes").value = data.focusMinutes;
    $("#timezone").value = data.timezone;
    renderCalendar();
    paintWeather();
    tick();
  }
  async function setVisible(type, enabled) {
    if (type === "notes" && !enabled && !(await flushNotes())) return;
    await mutate((s) => ({
      ...s,
      widgets: ["tasks", "notes"].includes(type)
        ? { ...s.widgets, [type]: enabled }
        : s.widgets,
      dashboard: {
        ...s.dashboard,
        layout: toggleWidget(s.dashboard.layout, type, enabled),
      },
    }));
    catalog();
  }
  function catalog() {
    const list = $("#widget-catalog");
    list.replaceChildren();
    for (const [type, spec] of Object.entries(CATALOG)) {
      const card = el("div", "", "catalog-card"),
        check = el("input");
      check.type = "checkbox";
      check.checked = getState().dashboard.layout.some((i) => i.type === type);
      check.id = `catalog-${type}`;
      const label = el("label", "", "check-label");
      label.append(check, el("strong", spec.title));
      card.append(label, el("p", spec.description));
      check.addEventListener("change", () => setVisible(type, check.checked));
      list.append(card);
    }
  }
  $("#widgets-button").addEventListener("click", () => {
    catalog();
    showDialog("#widgets-dialog");
  });
  $("#edit-layout").addEventListener("click", () => {
    editMode = !editMode;
    paint();
  });
  $("#reset-layout").addEventListener("click", async () => {
    await mutate(
      (s) => ({
        ...s,
        widgets: { tasks: true, notes: true },
        dashboard: { ...s.dashboard, layout: structuredClone(DEFAULT_LAYOUT) },
      }),
      "Standard-Layout wiederhergestellt.",
    );
    catalog();
  });
  async function commitMove(type, x, y, size = null, expected = null) {
    if (busy) return;
    busy = true;
    try {
      const current = getState().dashboard.layout;
      const next = arrangeWidget(current, type, x, y, size);
      await mutate((s) => {
        if (expected && JSON.stringify(s.dashboard.layout) !== expected)
          throw new Error(
            "Das Layout wurde in einem anderen Tab geändert. Bitte erneut verschieben.",
          );
        return { ...s, dashboard: { ...s.dashboard, layout: next } };
      }, "Position im Raster gespeichert.");
    } catch (error) {
      notify("Das Layout konnte nicht geändert werden. " + error.message, true);
    } finally {
      busy = false;
      paint();
    }
  }
  // Document listeners survive moving the captured card in the CSS grid.
  document.addEventListener("pointermove", drag, { passive: false });
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", cancelDrag);
  function startDrag(event) {
    const resizing = Boolean(event.currentTarget.dataset.resize);
    if ((!editMode && !resizing) || event.button !== 0 || busy) return;
    event.preventDefault();
    if (resizing && !editMode) {
      editMode = true;
      paint();
    }
    const type =
      event.currentTarget.dataset.resize || event.currentTarget.dataset.handle;
    const item = getState().dashboard.layout.find((item) => item.type === type);
    const article = event.currentTarget.closest(".widget");
    const rect = article.getBoundingClientRect(),
      bounds = board.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(board).columnGap);
    dragging = {
      type,
      original: item,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      kind: resizing ? "resize" : "move",
      compact: getComputedStyle(board).display !== "grid",
      valid: false,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      expected: JSON.stringify(getState().dashboard.layout),
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      cell: (bounds.width - gap * 11) / 12 + gap,
      row: 94,
      article,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* Document listeners remain available. */
    }
    article.classList.add("dragging");
  }
  function drag(event) {
    if (!dragging || event.pointerId !== dragging.pointerId) return;
    event.preventDefault();
    const d = dragging;
    if (
      !d.moved &&
      Math.hypot(event.clientX - d.startX, event.clientY - d.startY) < 4
    )
      return;
    d.moved = true;
    d.point = { clientX: event.clientX, clientY: event.clientY };
    positionDrag(d.point);
    if (!d.scrollFrame) d.scrollFrame = requestAnimationFrame(autoScroll);
  }
  function positionDrag(point) {
    if (!dragging) return;
    const d = dragging,
      bounds = board.getBoundingClientRect();
    try {
      let next;
      if (d.kind === "resize") {
        d.w = Math.max(
          3,
          Math.min(
            12 - d.original.x,
            d.original.w + Math.round((point.clientX - d.startX) / d.cell),
          ),
        );
        d.h = Math.max(
          CATALOG[d.type].h,
          Math.min(
            8,
            d.original.h + Math.round((point.clientY - d.startY) / d.row),
          ),
        );
        next = arrangeWidget(
          getState().dashboard.layout,
          d.type,
          d.original.x,
          d.original.y,
          { w: d.w, h: d.h },
        );
      } else if (d.compact) {
        const target = [
          ...board.querySelectorAll(".widget:not([hidden])"),
        ].find((article) => {
          const r = article.getBoundingClientRect();
          return (
            article !== d.article &&
            point.clientX >= r.left &&
            point.clientX <= r.right &&
            point.clientY >= r.top &&
            point.clientY <= r.bottom
          );
        });
        if (!target) return;
        const rect = target.getBoundingClientRect();
        next = reorderWidget(
          getState().dashboard.layout,
          d.type,
          target.dataset.widget,
          point.clientY > rect.top + rect.height / 2,
        );
      } else {
        d.x = Math.max(
          0,
          Math.min(
            12 - d.original.w,
            Math.round((point.clientX - bounds.left - d.offsetX) / d.cell),
          ),
        );
        d.y = Math.max(
          0,
          Math.min(
            60,
            Math.round((point.clientY - bounds.top - d.offsetY) / d.row),
          ),
        );
        next = arrangeWidget(getState().dashboard.layout, d.type, d.x, d.y);
      }
      d.next = next;
      d.valid = true;
      for (const item of next) {
        const article = $(`#panel-${item.type}`);
        place(article, item);
        article.style.order = item.y * 12 + item.x;
      }
      board.style.setProperty(
        "--rows",
        Math.max(3, ...next.map((item) => item.y + item.h)) + 2,
      );
      d.article.classList.remove("blocked");
    } catch {
      d.valid = false;
      d.article.classList.add("blocked");
    }
  }
  function autoScroll() {
    if (!dragging?.point) return;
    const d = dragging;
    d.scrollFrame = null;
    const step =
      d.point.clientY < 65 ? -12 : d.point.clientY > innerHeight - 65 ? 12 : 0;
    if (!step) return;
    const before = scrollY;
    window.scrollBy(0, step);
    if (scrollY === before) return;
    positionDrag(d.point);
    d.scrollFrame = requestAnimationFrame(autoScroll);
  }
  async function endDrag(event) {
    if (!dragging || event.pointerId !== dragging.pointerId) return;
    const d = dragging;
    if (d.scrollFrame) cancelAnimationFrame(d.scrollFrame);
    dragging = null;
    d.article.classList.remove("dragging", "blocked");
    if (d.moved && d.valid && d.next) {
      busy = true;
      try {
        await mutate(
          (s) => {
            if (JSON.stringify(s.dashboard.layout) !== d.expected)
              throw new Error(
                "Layout wurde in einem anderen Tab geändert. Bitte erneut versuchen.",
              );
            return { ...s, dashboard: { ...s.dashboard, layout: d.next } };
          },
          d.kind === "resize"
            ? "Größe gespeichert. Die anderen Widgets machen Platz."
            : "Widget-Position gespeichert.",
        );
      } finally {
        busy = false;
        paint();
      }
    } else {
      paint();
      if (d.moved && !d.valid)
        notify(
          "Nicht genug Platz. Die bisherige Anordnung bleibt erhalten.",
          true,
        );
    }
  }
  function cancelDrag() {
    if (!dragging) return;
    if (dragging.scrollFrame) cancelAnimationFrame(dragging.scrollFrame);
    dragging.article.classList.remove("dragging", "blocked");
    dragging = null;
    paint();
  }
  window.addEventListener("resize", cancelDrag);
  const directions = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  };
  function keyboardMove(event, type) {
    if (!editMode || !directions[event.key] || busy) return;
    event.preventDefault();
    const layout = getState().dashboard.layout,
      item = layout.find((item) => item.type === type);
    if (getComputedStyle(board).display !== "grid") {
      const ordered = [...layout].sort((a, b) => a.y - b.y || a.x - b.x),
        index = ordered.findIndex((item) => item.type === type);
      const backward = ["ArrowLeft", "ArrowUp"].includes(event.key);
      const target = ordered[index + (backward ? -1 : 1)];
      if (target)
        mutate(
          (s) => ({
            ...s,
            dashboard: {
              ...s.dashboard,
              layout: reorderWidget(
                s.dashboard.layout,
                type,
                target.type,
                !backward,
              ),
            },
          }),
          "Reihenfolge gespeichert.",
        );
      return;
    }
    const [dx, dy] = directions[event.key];
    commitMove(type, item.x + dx, item.y + dy, null, JSON.stringify(layout));
  }
  function keyboardResize(event, type) {
    if (!directions[event.key] || busy) return;
    event.preventDefault();
    const layout = getState().dashboard.layout,
      item = layout.find((item) => item.type === type),
      [dx, dy] = directions[event.key];
    const w = Math.max(3, Math.min(12 - item.x, item.w + dx)),
      h = Math.max(CATALOG[type].h, Math.min(8, item.h + dy));
    commitMove(type, item.x, item.y, { w, h }, JSON.stringify(layout));
  }
  function paintWeather() {
    const weather = getState().dashboard.weather;
    if (!weather) {
      $("#weather-value").textContent = "Dein Ort, dein Wetter";
      $("#weather-text").textContent =
        "Wähle einen Ort. Ohne Einrichtung gibt es keine Wetteranfragen.";
      return;
    }
    if (weather.current) {
      $("#weather-value").textContent =
        `${Math.round(weather.current.temperature)}°`;
      $("#weather-text").textContent =
        `${weather.name} · Luftfeuchte ${weather.current.humidity}% · Stand ${new Date(weather.current.fetchedAt).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })} · Open-Meteo`;
    } else {
      $("#weather-value").textContent = "Bereit für dein Wetter";
      $("#weather-text").textContent =
        `${weather.name} · Zum Laden aktualisieren.`;
    }
  }
  async function refreshWeather() {
    const location = getState().dashboard.weather;
    if (!location) {
      showDialog("#weather-dialog");
      return;
    }
    $("#weather-text").textContent = "Wetter wird geladen …";
    try {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.search = new URLSearchParams({
        latitude: location.latitude,
        longitude: location.longitude,
        current: "temperature_2m,relative_humidity_2m",
        timezone: "auto",
      });
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error("Wetterdienst nicht erreichbar.");
      const current = parseWeather(await response.json());
      await mutate((s) => {
        if (
          s.dashboard.weather?.latitude !== location.latitude ||
          s.dashboard.weather?.longitude !== location.longitude
        )
          throw new Error("Der Wetterort wurde zwischenzeitlich geändert.");
        return {
          ...s,
          dashboard: {
            ...s.dashboard,
            weather: { ...s.dashboard.weather, current },
          },
        };
      });
    } catch (error) {
      $("#weather-text").textContent =
        `${error.message} Vorhandene Daten behalten ihren angezeigten Zeitstempel.`;
    }
  }
  $("#weather-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    $("#weather-results").replaceChildren();
    $("#weather-error").textContent = "";
    try {
      if (globalThis.chrome?.runtime?.id) {
        const allowed = await chrome.permissions.request({
          origins: [
            "https://geocoding-api.open-meteo.com/*",
            "https://api.open-meteo.com/*",
          ],
        });
        if (!allowed)
          throw new Error("Ohne Freigabe wird kein Wetter geladen.");
      }
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name: $("#weather-city").value, count: 5, language: "de", format: "json" })}`,
        { signal: AbortSignal.timeout(10000) },
      );
      if (!response.ok) throw new Error("Ortssuche nicht erreichbar.");
      const data = await response.json();
      if (!data.results?.length) throw new Error("Kein Ort gefunden.");
      for (const item of data.results) {
        const name = `${item.name}, ${item.admin1 ?? item.country ?? ""}`;
        $("#weather-results").append(
          button(
            name,
            async () => {
              if (
                await mutate((s) => ({
                  ...s,
                  dashboard: {
                    ...s.dashboard,
                    weather: {
                      name,
                      latitude: item.latitude,
                      longitude: item.longitude,
                    },
                  },
                }))
              ) {
                $("#weather-dialog").close();
                await refreshWeather();
              }
            },
            "secondary",
          ),
        );
      }
    } catch (error) {
      $("#weather-error").textContent = error.message;
    }
  });
  setInterval(tick, 1000);
  return { paint, catalog };
}
