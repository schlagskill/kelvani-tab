import test from "node:test";
import assert from "node:assert/strict";
import { parseWeather } from "../weather.js";
import { DEFAULT_DASHBOARD, validateDashboard } from "../layout.js";
test("weather validates real provider shape and adds honest fetch timestamp", () =>
  assert.deepEqual(
    parseWeather(
      { current: { temperature_2m: 14.5, relative_humidity_2m: 78 } },
      1000,
    ),
    { temperature: 14.5, humidity: 78, fetchedAt: 1000 },
  ));
test("weather does not fabricate missing, malformed or out-of-range values", () => {
  for (const data of [
    {},
    { current: {} },
    { current: { temperature_2m: "14", relative_humidity_2m: 50 } },
    { current: { temperature_2m: 14, relative_humidity_2m: 110 } },
  ])
    assert.throws(() => parseWeather(data));
});
test("last weather result and its timestamp survive a backup", () => {
  const weather = {
    name: "Test city",
    latitude: 52,
    longitude: 13,
    current: { temperature: 14, humidity: 78, fetchedAt: 1000 },
  };
  assert.deepEqual(
    validateDashboard({ ...DEFAULT_DASHBOARD, weather }).weather,
    weather,
  );
});
