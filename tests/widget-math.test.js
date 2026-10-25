import test from "node:test";
import assert from "node:assert/strict";
import {
  calculate,
  calendarMonth,
  timerSeconds,
  localDayKey,
  calendarAfterRollover,
  changeFocusMinutes,
} from "../widget-math.js";
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
test("calendar follows midnight and month/year rollover without resetting a browsed month", () => {
  const before = new Date(2026, 11, 31, 23, 59),
    after = new Date(2027, 0, 1, 0, 1);
  assert.notEqual(localDayKey(before), localDayKey(after));
  assert.deepEqual(
    calendarAfterRollover({ year: 2026, month: 11 }, before, after),
    { year: 2027, month: 0 },
  );
  assert.deepEqual(
    calendarAfterRollover({ year: 2026, month: 9 }, before, after),
    { year: 2026, month: 9 },
  );
  assert.deepEqual(
    calendarAfterRollover(
      { year: 2026, month: 11 },
      before,
      new Date(2026, 11, 31, 23, 59, 59),
    ),
    { year: 2026, month: 11 },
  );
});
test("duration edits update idle/completed timers but do not overwrite running or paused sessions", () => {
  const settings = { focusMinutes: 25, focus: null, language: "de" };
  assert.deepEqual(changeFocusMinutes(settings, 10), {
    ...settings,
    focusMinutes: 10,
  });
  assert.equal(settings.focusMinutes, 25);
  for (const n of [0, 181, NaN, 1.5])
    assert.throws(() => changeFocusMinutes(settings, n));
  assert.throws(() =>
    changeFocusMinutes(
      { ...settings, focus: { mode: "paused", remaining: 30 } },
      10,
    ),
  );
  assert.throws(() =>
    changeFocusMinutes(
      { ...settings, focus: { mode: "running", endAt: 10000 } },
      10,
      0,
    ),
  );
  assert.equal(
    changeFocusMinutes(
      { ...settings, focus: { mode: "running", endAt: 10000 } },
      10,
      11000,
    ).focus,
    null,
  );
});

test("calculator rejects separated numbers and unconsumed decimal points", () => {
  for (const input of ["1 2 + 3", "2 .5", "1. 5", "1\t2", "1\n2", "1..", "2 + 3..", "."])
    assert.throws(() => calculate(input), Error, input);
});
test("calculator preserves whitespace around operators and unary signs", () => {
  assert.equal(calculate("  1,5  +  .5  "), 2);
  assert.equal(calculate("12 × ( 8 + 4 )"), 144);
  assert.equal(calculate("- 5 + + 2"), -3);
});
