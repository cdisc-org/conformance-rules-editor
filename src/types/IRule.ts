import { IUser } from "./IUser";

export interface IRule {
  content?: string;
  created?: string;
  creator?: IUser;
  history?: IRule[];
  id?: string;
  json?: object;
  latestId?: string;
}
