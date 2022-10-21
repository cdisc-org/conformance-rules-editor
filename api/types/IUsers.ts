import { IUser } from "./IUser";

export interface IUsers {
  getUsersByIds: (ids: string[]) => Promise<{ [id: string]: IUser }>;
  getUsersByName: (name: string) => Promise<IUser[]>;
}
