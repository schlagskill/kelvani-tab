import test from "node:test";
import assert from "node:assert/strict";
import {
  COLOR_SCHEMES,
  MOTIVATIONS,
  motivation,
  randomMotivationIndex,
  noticeDuration,
} from "../preferences.js";
import { translate, setLanguage, locale } from "../i18n.js";
import { DEFAULT_DASHBOARD, validateDashboard } from "../layout.js";
import { EMPTY, validateState } from "../core.js";

test("fifty original thoughts have distinct non-empty German and English variants", () => {
  assert.equal(MOTIVATIONS.length, 50);
  for (const pair of MOTIVATIONS) {
    assert.equal(pair.length, 2);
    assert.ok(pair.every((text) => text.length > 5));
    assert.notEqual(pair[0], pair[1]);
  }
  assert.equal(new Set(MOTIVATIONS.map((pair) => pair[0])).size, 50);
  assert.equal(new Set(MOTIVATIONS.map((pair) => pair[1])).size, 50);
  assert.equal(motivation(49, "en"), MOTIVATIONS[49][1]);
  assert.equal(motivation(49, "de"), MOTIVATIONS[49][0]);
});
test("random selection includes both ends and remains stable when only language changes", () => {
  assert.equal(
    randomMotivationIndex(() => 0),
    0,
  );
  assert.equal(
    randomMotivationIndex(() => 0.9999),
    49,
  );
  const index = randomMotivationIndex(() => 0.5);
  assert.equal(motivation(index, "de"), MOTIVATIONS[index][0]);
  assert.equal(motivation(index, "en"), MOTIVATIONS[index][1]);
});
test("old dashboard data acquires language and color defaults without losing contents", () => {
  const old = structuredClone(EMPTY);
  delete old.dashboard.language;
  delete old.dashboard.colorScheme;
  old.notes = "Einstellungen";
  const migrated = validateState(old);
  assert.equal(migrated.dashboard.language, "de");
  assert.equal(migrated.dashboard.colorScheme, "blue");
  assert.equal(migrated.notes, "Einstellungen");
});
test("six schemes and transparency extremes roundtrip in backups", () => {
  assert.equal(Object.keys(COLOR_SCHEMES).length, 6);
  for (const colorScheme of Object.keys(COLOR_SCHEMES))
    for (const opacity of [0, 76, 100]) {
      const state = structuredClone(EMPTY);
      Object.assign(state.dashboard, { colorScheme, language: "en", opacity });
      const restored = validateState(JSON.parse(JSON.stringify(state)));
      assert.equal(restored.dashboard.opacity, opacity);
      assert.equal(restored.dashboard.colorScheme, colorScheme);
      assert.equal(restored.dashboard.language, "en");
    }
});
test("unknown languages, prototype schemes and invalid transparency are rejected", () => {
  for (const fields of [
    { language: "fr" },
    { colorScheme: "__proto__" },
    { colorScheme: "unknown" },
    { opacity: -1 },
    { opacity: 101 },
    { opacity: 1.5 },
  ])
    assert.throws(() => validateDashboard({ ...DEFAULT_DASHBOARD, ...fields }));
});
test("saved notices use two seconds; undo and errors retain useful handling", () => {
  assert.equal(noticeDuration(), 2000);
  assert.equal(noticeDuration(false, true), 8000);
  assert.equal(noticeDuration(true), null);
});
test("UI translations include controls and dynamic labels without translating unknown user text", () => {
  assert.equal(translate("Einstellungen", "en"), "Settings");
  assert.equal(
    translate("Uhr & Begrüßung Größe ändern", "en"),
    "Clock & greeting resize",
  );
  assert.equal(translate("Heute, 12.", "en"), "Today, 12.");
  assert.equal(translate("Fiktiver Entwurf B", "en"), "Fiktiver Entwurf B");
  setLanguage("en");
  assert.equal(locale(), "en-GB");
  setLanguage("de");
  assert.equal(locale(), "de-DE");
});
