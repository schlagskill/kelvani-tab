import test from "node:test";
import assert from "node:assert/strict";
import { calculate, calendarMonth, timerSeconds } from "../widget-math.js";
test("calculator accepts the mathematical signs displayed by the interface", () => {
  assert.equal(calculate("12 × (8 + 4)"), 144);
  assert.equal(calculate("8 − 2"), 6);
  assert.equal(calculate("8 ÷ 2"), 4);
});
test("calculator respects precedence, parentheses and decimal comma", () => {
  assert.equal(calculate("12 * (8 + 4)"), 144);
  assert.equal(calculate("1,5 + 2.5 * 2"), 6.5);
  assert.equal(calculate("-5 + 2"), -3);
  assert.equal(calculate("8 % 3"), 2);
});
test("calculator rejects code, malformed input, division by zero and concatenated values", () => {
  for (const input of ["alert(1)", "1/0", "2..3", "()", "2(3)", "1+", "1;2"])
    assert.throws(() => calculate(input));
});
test("calendar accounts for leap February and Monday-first alignment", () => {
  assert.equal(calendarMonth(2024, 1).cells.filter(Boolean).length, 29);
  assert.equal(calendarMonth(2025, 1).cells.filter(Boolean).length, 28);
  assert.equal(calendarMonth(2026, 9).cells[3], 1);
});
test("running timer restores from wall-clock deadline after tab closure", () => {
  assert.equal(
    timerSeconds({ mode: "running", endAt: 61000, remaining: 60 }, 25, 1000),
    60,
  );
  assert.equal(
    timerSeconds({ mode: "running", endAt: 61000, remaining: 60 }, 25, 70000),
    0,
  );
  assert.equal(
    timerSeconds({ mode: "paused", endAt: 0, remaining: 31 }, 25, 70000),
    31,
  );
});
