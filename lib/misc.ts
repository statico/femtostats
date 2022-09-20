export const singleParam = (
  value: string | string[] | number | undefined | null
): string => {
  if (value == null) return "";
  if (Array.isArray(value)) return value[0] || "";
  if (typeof value === "number") return String(value);
  return value || "";
};

export const multiParam = (
  value: string | string[] | undefined | null
): string[] => {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  return value.split(",");
};

export type QueryParams = Record<
  string,
  string | string[] | number | undefined
>;

export const toURL = (base: string, queryParams?: QueryParams): string => {
  const obj: Record<string, string> = {};
  if (queryParams) {
    for (const key of Object.keys(queryParams).sort()) {
      const value = queryParams[key];
      if (typeof value === "undefined") continue;
      if (Array.isArray(value) && value.length === 0) continue;
      obj[key] = Array.isArray(value)
        ? multiParam(value).join(",")
        : singleParam(value);
    }
  }
  if (Object.keys(obj).length > 0) {
    return base + "?" + new URLSearchParams(obj).toString();
  } else {
    return base;
  }
};

export const formatNumber = (value: any) => Number(value).toLocaleString();

export const statType = (a: number, b: number) =>
  a > b ? "decrease" : "increase";

export const statPercent = (a: number, b: number) =>
  Math.round((b / a - 1) * 100) + "%";
