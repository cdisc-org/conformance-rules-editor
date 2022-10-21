export interface IFilter {
  name: string;
  operator: "contains" | "in";
  value: string | number | string[] | number[];
}
