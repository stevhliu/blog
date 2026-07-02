export const CHART_FONT_SIZE = {
  tick: "12px",
  label: "13px",
  inline: "11.5px",
  control: "14px",
} as const;

export const chartTickStyle = {
  fontSize: CHART_FONT_SIZE.tick,
  fontWeight: 400,
} as const;

export const chartTickTabularStyle = {
  ...chartTickStyle,
  fontVariantNumeric: "tabular-nums" as const,
};

export const chartLabelStyle = {
  fontSize: CHART_FONT_SIZE.label,
  fontWeight: 500,
} as const;

export const chartAnnotationStyle = {
  fontSize: CHART_FONT_SIZE.tick,
  fontWeight: 600,
} as const;

export const chartInlineStyle = {
  fontSize: CHART_FONT_SIZE.inline,
  fontWeight: 500,
  letterSpacing: "0.02em",
} as const;

export const chartTextClassName = "fill-[#555354] dark:fill-[#a8a59d]";
export const chartInlineTextClassName = "fill-[#7c7a72] dark:fill-[#8a8780]";
