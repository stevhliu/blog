const LOAD_TIMES: Record<number, number> = {
  1: 30.02,
  4: 20.98,
  8: 27.58,
  16: 51.07,
};

export const LOAD_TIME_DATA = Object.entries(LOAD_TIMES).map(([n, t]) => ({
  n: Number(n),
  t,
}));

export const LOAD_TIME_AXIS_MAX = 60;
export const LOAD_TIME_TICKS = [0, 15, 30, 45, 60];
