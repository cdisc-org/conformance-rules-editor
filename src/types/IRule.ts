import { IUser } from "./IUser";

export interface IRule {
  content?: string;
  created?: string;
  creator?: IUser;
  history?: IRule[];
  id?: string;
  json?: {
    Core?: {
      Id?: string;
      Status?: string;
      Version?: string;
    };
    [key: string]: any;
  };
}