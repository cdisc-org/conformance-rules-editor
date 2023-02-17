import { IUser } from "./IUser";

export interface IRule {
  changed?: string;
  content?: string;
  created?: string;
  creator?: IUser;
  id?: string;
  json?: object;
}
