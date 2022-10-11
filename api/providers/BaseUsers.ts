import { IUsers } from "../types/IUsers";
import MSGraphUsers from "./MSGraphUsers";

const USERS_PROVIDERS: { [provider: string]: IUsers } = {
  MSGraph: MSGraphUsers,
};

export const USERS_PROVIDER = USERS_PROVIDERS["MSGraph"];
