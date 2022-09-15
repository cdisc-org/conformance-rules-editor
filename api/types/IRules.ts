import { IQuery } from "./IQuery";
import { IRule } from "./IRule";

export interface IRules {
  next?: IQuery;
  rules: IRule[];
}
