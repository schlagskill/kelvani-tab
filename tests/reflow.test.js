import test from "node:test";
import assert from "node:assert/strict";
import {
  arrangeWidget,
  reorderWidget,
  validateLayout,
  validateDashboard,
  DEFAULT_LAYOUT,
  DEFAULT_DASHBOARD,
} from "../layout.js";
import { WALLPAPERS } from "../wallpapers.js";
test("dragging onto equally sized occupied card swaps grid positions", () => {
  const next = arrangeWidget(DEFAULT_LAYOUT, "tasks", 8, 3);
  assert.deepEqual(
    next.find((i) => i.type === "tasks"),
    { type: "tasks", x: 8, y: 3, w: 4, h: 3 },
  );
  assert.deepEqual(
    next.find((i) => i.type === "notes"),
    { type: "notes", x: 4, y: 3, w: 4, h: 3 },
  );
  assert.deepEqual(
    next.find((i) => i.type === "clock"),
    DEFAULT_LAYOUT[0],
  );
});
test("enlarging pushes overlapping neighbours down without losing cards", () => {
  const next = arrangeWidget(DEFAULT_LAYOUT, "clock", 0, 0, { w: 8, h: 4 });
  assert.equal(next.length, DEFAULT_LAYOUT.length);
  assert.deepEqual(
    next.find((i) => i.type === "clock"),
    { type: "clock", x: 0, y: 0, w: 8, h: 4 },
  );
  assert.equal(next.find((i) => i.type === "search").y, 4);
  assert.equal(next.find((i) => i.type === "links").y, 5);
  assert.equal(next.find((i) => i.type === "notes").y, 7);
  assert.doesNotThrow(() => validateLayout(next));
});
test("occupied space with different sizes reflows instead of rejecting", () => {
  const next = arrangeWidget(DEFAULT_LAYOUT, "search", 0, 0);
  assert.equal(next.find((i) => i.type === "clock").y, 1);
  assert.doesNotThrow(() => validateLayout(next));
});
test("invalid sizes and overflowing reflow reject atomically", () => {
  const original = structuredClone(DEFAULT_LAYOUT);
  assert.throws(() =>
    arrangeWidget(DEFAULT_LAYOUT, "clock", 0, 0, { w: 13, h: 4 }),
  );
  const bottom = [
    { type: "clock", x: 0, y: 60, w: 4, h: 3 },
    { type: "tasks", x: 4, y: 60, w: 4, h: 3 },
  ];
  assert.throws(() => arrangeWidget(bottom, "clock", 4, 60, { w: 4, h: 4 }));
  assert.deepEqual(DEFAULT_LAYOUT, original);
});
test("compact ordering repacks different sizes into a valid grid", () => {
  const next = reorderWidget(DEFAULT_LAYOUT, "notes", "clock");
  assert.equal(next[0].type, "notes");
  assert.equal(next[1].type, "clock");
  assert.equal(next.length, 7);
  assert.doesNotThrow(() => validateLayout(next));
  const after = reorderWidget(DEFAULT_LAYOUT, "clock", "notes", true);
  assert.equal(
    after.findIndex((i) => i.type === "clock"),
    after.findIndex((i) => i.type === "notes") + 1,
  );
});
test("five bundled wallpapers roundtrip with local assets and sources", () => {
  assert.equal(Object.keys(WALLPAPERS).length, 5);
  for (const [wallpaper, photo] of Object.entries(WALLPAPERS)) {
    assert.equal(
      validateDashboard({ ...structuredClone(DEFAULT_DASHBOARD), wallpaper })
        .wallpaper,
      wallpaper,
    );
    assert.match(photo.file, /^[a-z]+\.jpg$/);
    assert.match(photo.source, /^https:\/\/pixabay\.com\/photos\//);
    assert.ok(photo.author);
  }
  assert.throws(() =>
    validateDashboard({
      ...structuredClone(DEFAULT_DASHBOARD),
      wallpaper: "https://tracker.invalid",
    }),
  );
});
