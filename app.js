import { enableTranslations, setLanguage, locale, translate } from "./i18n.js";
import {
  COLOR_SCHEMES,
  motivation,
  randomMotivationIndex,
} from "./preferences.js";
import { WALLPAPERS, PIXABAY_LICENSE } from "./wallpapers.js";
import { mountDashboard } from "./dashboard.js";
import { toggleWidget } from "./layout.js";
import {
  GROUPS,
  addLink,
  editLink,
  moveLink,
  saveNotes,
  searchUrl,
  validateState,
} from "./core.js";
import { load, update, extensionMode } from "./storage.js";
import {
  $,
  el,
  button,
  notify,
  showDialog,
  download,
  readBackup,
  wireDialogs,
} from "./ui.js";
let state,
  group = "everyday",
  editing = false,
  editingId = null,
  incoming,
  dirty = false,
  noteBase = "",
  timer,
  notePending,
  unavailable = false;
let settingsWallpaper, settingsBackground;
const motivationIndex = randomMotivationIndex();
const dashboardController = mountDashboard({
  getState: () => state,
  mutate,
  flushNotes,
});
const systemDark = matchMedia("(prefers-color-scheme: dark)");
function theme() {
  document.body.dataset.theme =
    state.theme === "auto"
      ? systemDark.matches
        ? "night"
        : "sand"
      : state.theme;
}
systemDark.addEventListener("change", () => state && render());
function tick() {
  $("#date").textContent = new Date().toLocaleDateString(locale(), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
function openLink(link = null) {
  if (unavailable) return;
  editingId = link?.id ?? null;
  $("#link-heading").textContent = link ? "Link bearbeiten" : "Link hinzufügen";
  $("#link-form").reset();
  $("#link-form").elements.title.value = link?.title ?? "";
  $("#link-form").elements.url.value = link?.url ?? "";
  $("#link-form").elements.group.value = link?.group ?? group;
  $("#link-error").textContent = "";
  showDialog("#link-dialog");
}
function render() {
  const focusId = document.activeElement?.id;
  theme();
  setLanguage(state.dashboard.language);
  const palette = COLOR_SCHEMES[state.dashboard.colorScheme],
    dark = document.body.dataset.theme === "night";
  for (const target of [document.body, $("#board")]) {
    target.style.setProperty("--accent", palette.accent[dark ? 1 : 0]);
    target.style.setProperty("--on-accent", dark ? "#08162b" : "#fff");
    target.style.setProperty(
      "--glass-rgb",
      dark ? palette.glass : "255 255 255",
    );
  }
  document.body.dataset.scheme = state.dashboard.colorScheme;
  palette.aurora.forEach((color, i) =>
    document.body.style.setProperty(`--aurora-${i}`, color),
  );
  $("#header-motivation").textContent = motivation(
    motivationIndex,
    state.dashboard.language,
  );

  $("#engine").value = state.engine;
  $("#groups").replaceChildren();
  for (const [key, title] of Object.entries(GROUPS)) {
    const node = button(
      title,
      () => {
        group = key;
        render();
      },
      "",
    );
    node.id = `group-${key}`;
    node.setAttribute("aria-pressed", group === key);
    $("#groups").append(node);
  }
  $("#links").replaceChildren();
  const visible = state.links.filter((link) => link.group === group);
  $("#links-empty").hidden = visible.length > 0;
  for (const link of visible) {
    const card = el("div", "", "shortcut"),
      anchor = el("a");
    anchor.href = link.url;
    anchor.title = new URL(link.url).hostname;
    anchor.id = `link-${link.id}`;
    const icon = el("span", "", "shortcut-icon");
    icon.append(el("span", link.title[0].toLocaleUpperCase()));
    anchor.append(icon, el("span", link.title, "shortcut-title"));
    card.append(anchor);
    if (editing) {
      const actions = el("div", "", "edit-actions");
      actions.append(
        button("Bearbeiten", () => openLink(link), "text-button"),
        button("Entfernen", () => removeLink(link), "text-button"),
      );
      for (const [title, dir] of [
        ["←", -1],
        ["→", 1],
      ]) {
        const move = button(
          title,
          () => mutate((current) => moveLink(current, link.id, dir)),
          "icon-button",
        );
        move.setAttribute(
          "aria-label",
          state.dashboard.language === "en"
            ? `Move ${link.title} ${dir < 0 ? "earlier" : "later"}`
            : `${link.title} ${dir < 0 ? "nach vorne" : "nach hinten"} verschieben`,
        );
        actions.append(move);
      }
      card.append(actions);
    }
    $("#links").append(card);
  }
  const add = button("", () => openLink(), "add-link");
  const icon = el("span", "", "shortcut-icon");
  icon.append(el("span", "+"));
  add.append(icon, el("span", "Link hinzufügen"));
  $("#links").append(add);
  $("#edit-links").textContent = editing
    ? "Bearbeitung beenden"
    : "Links bearbeiten";
  $("#edit-links").setAttribute("aria-pressed", editing);
  $("#tasks-widget").hidden = !state.widgets.tasks;
  $("#notes-widget").hidden = !state.widgets.notes;
  $("#tasks").replaceChildren();
  $("#task-count").textContent =
    state.dashboard.language === "en"
      ? `${state.tasks.filter((task) => task.done).length} of ${state.tasks.length} done`
      : `${state.tasks.filter((task) => task.done).length} von ${state.tasks.length} erledigt`;
  for (const task of state.tasks) {
    const item = el("li"),
      label = el("label", "", task.done ? "done" : ""),
      check = el("input");
    check.type = "checkbox";
    check.checked = task.done;
    check.id = `task-${task.id}`;
    check.addEventListener("change", () =>
      mutate((current) => ({
        ...current,
        tasks: current.tasks.map((t) =>
          t.id === task.id ? { ...t, done: check.checked } : t,
        ),
      })),
    );
    label.append(check, el("span", task.title));
    const remove = button("×", () => removeTask(task), "icon-button");
    remove.setAttribute(
      "aria-label",
      state.dashboard.language === "en"
        ? `Remove task ${task.title}`
        : `Aufgabe ${task.title} entfernen`,
    );
    item.append(label, remove);
    $("#tasks").append(item);
  }
  if (!dirty) {
    $("#notes").value = state.notes;
    noteBase = state.notes;
  }
  dashboardController.paint();
  if (focusId && document.activeElement?.id !== focusId)
    document.getElementById(focusId)?.focus({ preventScroll: true });
}
async function mutate(change, message = "") {
  if (unavailable) return false;
  try {
    state = await update(change);
    render();
    if (message) notify(message);
    return true;
  } catch (error) {
    notify(`Speichern fehlgeschlagen: ${error.message}`, true);
    render();
    return false;
  }
}
async function removeLink(link) {
  const index = state.links.findIndex((item) => item.id === link.id);
  if (
    await mutate((current) => ({
      ...current,
      links: current.links.filter((item) => item.id !== link.id),
    }))
  )
    notify("Link entfernt.", false, async () => {
      if (
        await mutate((current) => {
          if (current.links.some((item) => item.id === link.id)) return current;
          const links = [...current.links];
          links.splice(index, 0, link);
          return { ...current, links };
        }, "Link wiederhergestellt.")
      ) {
      }
    });
}
async function removeTask(task) {
  if (
    await mutate((current) => ({
      ...current,
      tasks: current.tasks.filter((t) => t.id !== task.id),
    }))
  )
    notify("Aufgabe entfernt.", false, () =>
      mutate(
        (current) => ({
          ...current,
          tasks: current.tasks.some((t) => t.id === task.id)
            ? current.tasks
            : [...current.tasks, task],
        }),
        "Aufgabe wiederhergestellt.",
      ),
    );
}
async function flushNotes(force = false) {
  clearTimeout(timer);
  if (unavailable) return false;
  if (notePending) {
    const ok = await notePending;
    return ok && dirty ? flushNotes(force) : ok;
  }
  if (!dirty) return true;
  const notes = $("#notes").value,
    expected = noteBase;
  $("#note-state").textContent = "Wird gespeichert …";
  notePending = (async () => {
    try {
      state = await update((current) =>
        saveNotes(current, notes, expected, force),
      );
      noteBase = notes;
      dirty = $("#notes").value !== notes;
      $("#note-state").textContent = dirty
        ? "Ungespeichert"
        : "Lokal gespeichert";
      $("#note-conflict").hidden = true;
      render();
      return true;
    } catch (error) {
      $("#note-state").textContent = "Nicht gespeichert";
      $("#note-conflict").hidden = error.name !== "NoteConflictError";
      notify(error.message, true);
      return false;
    }
  })();
  const ok = await notePending;
  notePending = null;
  if (ok && dirty) return flushNotes();
  return ok;
}
function openSettings(section = "appearance") {
  if (unavailable) return;
  closeSettingsMenu();
  $("#settings-dialog").dataset.section = section;
  $("#settings-heading").textContent =
    section === "general"
      ? "Sonstige Einstellungen"
      : "Hintergrund & Darstellung";
  $("#theme").value = state.theme;
  $("#language").value = state.dashboard.language;
  $("#color-scheme").value = state.dashboard.colorScheme;
  $("#show-tasks").checked = state.widgets.tasks;
  $("#show-notes").checked = state.widgets.notes;
  $("#settings-error").textContent = "";
  $("#personal-name").value = state.dashboard.name;
  $("#card-transparency").value = 100 - state.dashboard.opacity;
  $("#transparency-value").textContent = `${100 - state.dashboard.opacity}%`;
  settingsWallpaper = state.dashboard.wallpaper;
  settingsBackground = state.dashboard.customBackground;
  $("#background-state").textContent = settingsBackground
    ? "Dein eigenes Foto ist gespeichert."
    : "Dein Foto bleibt auf diesem Gerät.";
  document
    .querySelectorAll("#wallpaper-gallery [data-wallpaper]")
    .forEach((node) =>
      node.setAttribute(
        "aria-pressed",
        node.dataset.wallpaper === settingsWallpaper,
      ),
    );
  showDialog("#settings-dialog");
}
wireDialogs();
$("#demo").hidden = extensionMode;
tick();
setInterval(tick, 60000);
$("#search").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const destination = searchUrl($("#query").value, $("#engine").value);
    if (await flushNotes()) location.assign(destination);
  } catch (error) {
    notify(error.message, true);
  }
});
document.addEventListener("click", async (event) => {
  const link = event.target.closest?.("a[href]");
  if (
    !link ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey ||
    link.target === "_blank" ||
    link.hasAttribute("download") ||
    (!dirty && !notePending)
  )
    return;
  event.preventDefault();
  const destination = link.href;
  if (await flushNotes()) location.assign(destination);
});
window.addEventListener("beforeunload", (event) => {
  if (!dirty && !notePending) return;
  event.preventDefault();
  event.returnValue = "";
});
$("#engine").addEventListener("change", () => {
  const engine = $("#engine").value;
  mutate((current) => ({ ...current, engine }));
});
$("#edit-links").addEventListener("click", () => {
  editing = !editing;
  render();
});
$("#link-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(event.target)),
    targetId = editingId;
  const submit = event.target.querySelector("[type=submit], .primary");
  submit.disabled = true;
  try {
    state = await update((current) =>
      targetId
        ? editLink(current, input, targetId)
        : addLink(current, input, crypto.randomUUID()),
    );
    group = input.group;
    render();
    $("#link-dialog").close();
    notify("Link gespeichert.");
  } catch (error) {
    $("#link-error").textContent = error.message;
  } finally {
    submit.disabled = false;
  }
});
$("#task-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = $("#task-title").value.trim();
  if (
    await mutate(
      (current) => ({
        ...current,
        tasks: [
          ...current.tasks,
          { id: crypto.randomUUID(), title, done: false },
        ],
      }),
      "Aufgabe hinzugefügt.",
    )
  )
    event.target.reset();
});
$("#notes").addEventListener("input", () => {
  dirty = true;
  $("#note-state").textContent = "Ungespeichert";
  clearTimeout(timer);
  timer = setTimeout(() => flushNotes(), 350);
});
$("#notes").addEventListener("blur", () => flushNotes());
for (const selector of ["#customize"])
  $(selector).addEventListener("click", () => openSettings("appearance"));
$("#settings-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const theme = $("#theme").value,
    widgets = {
      tasks: $("#show-tasks").checked,
      notes: $("#show-notes").checked,
    };
  if (!widgets.notes && !(await flushNotes())) {
    $("#settings-error").textContent =
      "Deine Notiz ist noch nicht gespeichert. Bitte zuerst den Fehler beheben.";
    return;
  }
  if (
    await mutate(
      (current) => ({
        ...current,
        theme,
        widgets,
        dashboard: {
          ...current.dashboard,
          wallpaper: settingsWallpaper,
          customBackground: settingsBackground,
          name: $("#personal-name").value,
          opacity: 100 - Number($("#card-transparency").value),
          language: $("#language").value,
          colorScheme: $("#color-scheme").value,
          layout: toggleWidget(
            toggleWidget(current.dashboard.layout, "tasks", widgets.tasks),
            "notes",
            widgets.notes,
          ),
        },
      }),
      "Einstellungen gespeichert.",
    )
  )
    $("#settings-dialog").close();
  else
    $("#settings-error").textContent =
      "Einstellungen konnten nicht gespeichert werden.";
});
$("#export").addEventListener("click", async () => {
  if (!(await flushNotes())) return;
  try {
    download(await load(), "kelvani-tab-backup.json");
    notify("Backup exportiert.");
  } catch (error) {
    notify(error.message, true);
  }
});
$("#import-trigger").addEventListener("click", () => $("#import").click());
$("#import").addEventListener("change", async (event) => {
  try {
    const file = event.target.files[0];
    if (!file) return;
    incoming = await readBackup(file, validateState);
    $("#import-preview").textContent =
      state.dashboard.language === "en"
        ? `${file.name}: ${incoming.links.length} links, ${incoming.tasks.length} tasks and ${incoming.notes.length} note characters.`
        : `${file.name}: ${incoming.links.length} Links, ${incoming.tasks.length} Aufgaben und ${incoming.notes.length} Notizzeichen.`;
    $("#import-error").textContent = "";
    showDialog("#import-dialog");
  } catch (error) {
    $("#settings-error").textContent =
      `Import fehlgeschlagen: ${error.message}`;
  } finally {
    event.target.value = "";
  }
});
$("#import-confirm").addEventListener("click", async () => {
  const node = $("#import-confirm");
  node.disabled = true;
  try {
    clearTimeout(timer);
    if (notePending) await notePending;
    state = await update(() => incoming);
    dirty = false;
    noteBase = state.notes;
    render();
    $("#note-state").textContent = "Lokal gespeichert";
    $("#note-conflict").hidden = true;
    $("#import-dialog").close();
    $("#settings-dialog").close();
    notify("Backup wiederhergestellt.");
  } catch (error) {
    $("#import-error").textContent = error.message;
  } finally {
    node.disabled = false;
  }
});
$("#note-conflict").addEventListener("click", async () => {
  try {
    $("#other-note").value = (await load()).notes;
    $("#conflict-error").textContent = "";
    showDialog("#conflict-dialog");
  } catch (error) {
    notify(error.message, true);
  }
});
$("#overwrite-note").addEventListener("click", async () => {
  if (await flushNotes(true)) $("#conflict-dialog").close();
  else
    $("#conflict-error").textContent =
      "Speichern fehlgeschlagen. Dein Text bleibt erhalten.";
});
async function refresh() {
  if (unavailable) return;
  try {
    state = await load();
    render();
  } catch (error) {
    notify(error.message, true);
  }
}
if (extensionMode)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes["kelvani-tab.v1"]) refresh();
  });
else
  window.addEventListener("storage", (event) => {
    if (event.key === "kelvani-tab.v1") refresh();
  });
try {
  state = await load();
  render();
} catch (error) {
  unavailable = true;
  notify(
    `Vorhandene Daten konnten nicht geladen werden: ${error.message}. Sie werden nicht überschrieben.`,
    true,
  );
  document
    .querySelectorAll("input, textarea, select, button")
    .forEach((node) => (node.disabled = true));
}

for (const [key, photo] of Object.entries(WALLPAPERS)) {
  const tile = el("div", "", "wallpaper-tile"),
    preview = button(photo.title, null, "wallpaper-preview photo");
  preview.dataset.wallpaper = key;
  preview.style.backgroundImage = `linear-gradient(#06182d22,#06182d66),url("assets/wallpapers/${photo.file}")`;
  preview.setAttribute("aria-pressed", "false");
  const credit = el("a", `${photo.author} · Pixabay`, "photo-source");
  credit.href = photo.source;
  credit.target = "_blank";
  credit.rel = "noopener noreferrer";
  tile.append(preview, credit);
  $("#wallpaper-gallery").append(tile);
}
$("#pixabay-license").href = PIXABAY_LICENSE;
document
  .querySelectorAll("#wallpaper-gallery [data-wallpaper]")
  .forEach((node) =>
    node.addEventListener("click", () => {
      settingsWallpaper = node.dataset.wallpaper;
      document
        .querySelectorAll("#wallpaper-gallery [data-wallpaper]")
        .forEach((item) => item.setAttribute("aria-pressed", item === node));
    }),
  );
$("#background-file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 15e6
    )
      throw new Error("Wähle ein JPG-, PNG- oder WebP-Bild unter 15 MB.");
    const bitmap = await createImageBitmap(file),
      scale = Math.min(1, 1600 / bitmap.width, 1200 / bitmap.height),
      canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext("2d")
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const image = canvas.toDataURL("image/jpeg", 0.78);
    if (image.length > 1500000)
      throw new Error(
        "Das Foto ist noch zu groß. Bitte ein kleineres Bild wählen.",
      );
    settingsBackground = image;
    settingsWallpaper = "custom";
    $("#background-state").textContent =
      "Foto bereit. Mit Übernehmen lokal speichern.";
    document
      .querySelectorAll("#wallpaper-gallery [data-wallpaper]")
      .forEach((item) => item.setAttribute("aria-pressed", "false"));
  } catch (error) {
    $("#settings-error").textContent = error.message;
  } finally {
    event.target.value = "";
  }
});

function closeSettingsMenu(restoreFocus = false) {
  $("#settings-menu").hidden = true;
  $("#settings").setAttribute("aria-expanded", "false");
  if (restoreFocus) $("#settings").focus();
}
$("#settings").addEventListener("click", () => {
  const opening = $("#settings-menu").hidden;
  $("#settings-menu").hidden = !opening;
  $("#settings").setAttribute("aria-expanded", String(opening));
  if (opening) $("#settings-menu button").focus();
});
$("#settings-menu").addEventListener("click", (event) => {
  const action = event.target.closest("[data-setting]")?.dataset.setting;
  if (!action) return;
  closeSettingsMenu();
  if (action === "widgets") $("#widgets-button").click();
  else if (action === "layout") $("#edit-layout").click();
  else openSettings(action);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".settings-anchor")) closeSettingsMenu();
});
document.addEventListener("keydown", (event) => {
  if ($("#settings-menu").hidden) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeSettingsMenu(true);
  }
  const items = [...$("#settings-menu").querySelectorAll("button")],
    index = items.indexOf(document.activeElement);
  if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    items[
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) %
            items.length
    ].focus();
  }
});
$("#card-transparency").addEventListener(
  "input",
  () =>
    ($("#transparency-value").textContent =
      `${$("#card-transparency").value}%`),
);
enableTranslations();
