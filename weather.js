export function parseWeather(data, now = Date.now()) {
  const current = data?.current;
  if (
    !current ||
    !Number.isFinite(current.temperature_2m) ||
    current.temperature_2m < -100 ||
    current.temperature_2m > 70 ||
    !Number.isFinite(current.relative_humidity_2m) ||
    current.relative_humidity_2m < 0 ||
    current.relative_humidity_2m > 100
  )
    throw new Error("Keine gültigen Wetterdaten.");
  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    fetchedAt: now,
  };
}
