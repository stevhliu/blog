const integerFormatter = Intl.NumberFormat();

const shortPostDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "2-digit",
  day: "2-digit",
});

export function formatInteger(value: number): string {
  return integerFormatter.format(value);
}

export function getPostYear(date: string): number {
  return new Date(date).getFullYear();
}

export function formatShortPostDate(date: string): string {
  return shortPostDateFormatter.format(new Date(date)).replace("/", "-");
}

/** ISO 8601 calendar date, for the machine-readable <time datetime> value. */
export function formatIsoPostDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}
