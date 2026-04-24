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
