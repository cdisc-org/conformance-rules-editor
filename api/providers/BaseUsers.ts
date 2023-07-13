import { IUsers } from "../types/IUsers";
import DummyUsers from "./DummyUsers";
import MSGraphUsers from "./MSGraphUsers";

const USERS_PROVIDERS: { [provider: string]: IUsers } = {
  Dummy: DummyUsers,
  MSGraph: MSGraphUsers,
};

export const USERS_PROVIDER =
  USERS_PROVIDERS[process.env["USERS_PROVIDER"] ?? "MSGraph"];
