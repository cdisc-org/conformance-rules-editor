import { IFilter } from "./IFilter";
import { TOrder } from "./TOrder";
export interface IQuery {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: TOrder;
  select: string[];
  filters: IFilter[];
}
