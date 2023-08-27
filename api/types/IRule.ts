import { IHistory } from "./IHistory";
import { IUser } from "./IUser";

export interface IRule {
  changed?: string;
  content?: string;
  created?: string;
  creator?: IUser;
  history?: IHistory[];
  id?: string;
  json?: object;
}
