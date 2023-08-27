import { IUser } from "./IUser";

export interface IHistory {
  changed: string;
  content?: string;
  creator: IUser;
}
