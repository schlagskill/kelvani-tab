import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_LAYOUT,
  DEFAULT_DASHBOARD,
  CATALOG,
  validateLayout,
  validateDashboard,
  moveWidget,
  toggleWidget,
  intersects,
} from "../layout.js";
import { EMPTY, validateState, saveNotes } from "../core.js";
test("default layout is bounded and collision-free", () => {
  assert.deepEqual(validateLayout(DEFAULT_LAYOUT), DEFAULT_LAYOUT);
});
test("moving snaps to integer coordinates and keeps other cards untouched", () => {
  const next = moveWidget(DEFAULT_LAYOUT, "focus", 4, 8);
  assert.equal(next.find((w) => w.type === "focus").x, 4);
  assert.deepEqual(
    next.find((w) => w.type === "clock"),
    DEFAULT_LAYOUT[0],
  );
  assert.equal(DEFAULT_LAYOUT.find((w) => w.type === "focus").x, 0);
});
test("occupied cells cannot overwrite or cover another widget", () =>
  assert.throws(
    () => moveWidget(DEFAULT_LAYOUT, "calendar", 4, 3),
    /überlappen/,
  ));
test("fractional, negative and out-of-bounds coordinates rejected", () => {
  for (const [x, y] of [
    [0.5, 0],
    [-1, 0],
    [9, 0],
    [0, 61],
  ])
    assert.throws(() => moveWidget(DEFAULT_LAYOUT, "clock", x, y));
});
test("edge touching is allowed; one overlapping cell is not", () => {
  assert.equal(
    intersects({ x: 0, y: 0, w: 4, h: 3 }, { x: 4, y: 0, w: 4, h: 3 }),
    false,
  );
  assert.equal(
    intersects({ x: 0, y: 0, w: 4, h: 3 }, { x: 3, y: 0, w: 4, h: 3 }),
    true,
  );
});
test("all 12 widgets can be placed automatically without collision", () => {
  let layout = [];
  for (const type of Object.keys(CATALOG))
    layout = toggleWidget(layout, type, true);
  assert.equal(layout.length, 12);
  assert.deepEqual(validateLayout(layout), layout);
});
test("hiding and re-adding does not duplicate a widget", () => {
  let layout = toggleWidget(DEFAULT_LAYOUT, "focus", false);
  layout = toggleWidget(layout, "focus", true);
  layout = toggleWidget(layout, "focus", true);
  assert.equal(layout.filter((w) => w.type === "focus").length, 1);
});
test("unknown and duplicate widget types rejected", () => {
  assert.throws(() => toggleWidget(DEFAULT_LAYOUT, "__proto__", true));
  assert.throws(() => validateLayout([...DEFAULT_LAYOUT, DEFAULT_LAYOUT[0]]));
});
test("resize rejected if it collides with existing content", () =>
  assert.throws(() =>
    moveWidget(DEFAULT_LAYOUT, "clock", 0, 0, { w: 8, h: 3 }),
  ));
test("v0.2 state acquires raster while preserving content and visibility", () => {
  const old = {
    version: 1,
    theme: "sand",
    engine: "bing",
    links: [],
    notes: "keep",
    tasks: [],
    widgets: { tasks: false, notes: true },
  };
  const next = validateState(old);
  assert.equal(next.notes, "keep");
  assert.equal(
    next.dashboard.layout.some((w) => w.type === "tasks"),
    false,
  );
  assert.equal(
    next.dashboard.layout.some((w) => w.type === "notes"),
    true,
  );
});
test("dashboard, positions and settings survive note writes and backup roundtrip", () => {
  const state = {
    ...EMPTY,
    dashboard: {
      ...structuredClone(DEFAULT_DASHBOARD),
      name: "Ada",
      layout: moveWidget(DEFAULT_LAYOUT, "focus", 4, 8),
    },
  };
  const next = saveNotes(state, "note", "");
  assert.deepEqual(next.dashboard, state.dashboard);
  assert.deepEqual(validateState(JSON.parse(JSON.stringify(next))), next);
});
test("background permits local raster images but rejects executable SVG and remote trackers", () => {
  for (const customBackground of [
    "https://tracker.example/x.png",
    "data:image/svg+xml;base64,AAAA",
  ])
    assert.throws(() =>
      validateDashboard({ ...DEFAULT_DASHBOARD, customBackground }),
    );
  assert.equal(
    validateDashboard({
      ...DEFAULT_DASHBOARD,
      customBackground: "data:image/png;base64,AAAA",
    }).customBackground,
    "data:image/png;base64,AAAA",
  );
});
test("invalid opacity, timezones and timer fields are rejected", () => {
  for (const fields of [
    { opacity: 101 },
    { timezone: "Invalid/Zone" },
    { focusMinutes: 0 },
    { focus: { mode: "running", endAt: NaN, remaining: 1 } },
  ])
    assert.throws(() => validateDashboard({ ...DEFAULT_DASHBOARD, ...fields }));
});

test('default composition fills both sides and upgrades only the unchanged old preset',async()=>{const {upgradeDefaultLayout}=await import('../layout.js');const legacy=DEFAULT_LAYOUT.map(item=>item.type==='links'?{...item,h:2}:['tasks','notes'].includes(item.type)?{...item,y:3,h:3}:{...item});assert.deepEqual(upgradeDefaultLayout(legacy),DEFAULT_LAYOUT);const custom=legacy.map(item=>item.type==='focus'?{...item,y:9}:item);assert.deepEqual(upgradeDefaultLayout(custom),custom);for(const type of ['tasks','notes','focus']){const card=DEFAULT_LAYOUT.find(item=>item.type===type);assert.equal(card.y+card.h,8);}});
