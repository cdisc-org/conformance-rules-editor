import { IStorage, IStorageImpl } from "../types/IStorage";
import { addUsernamesToRule } from "./BaseUsers";
import CosmosSQLStorage from "./CosmosSQLStorage";

const STORAGE_PROVIDERS: { [provider: string]: IStorageImpl } = {
  CosmosSQL: CosmosSQLStorage,
};

const storageImpl = STORAGE_PROVIDERS[process.env["STORAGE_PROVIDER"]];

export const STORAGE_PROVIDER: IStorage = {
  ...storageImpl,
  async getRule(id: string, version?: string) {
    const rule = await storageImpl._getRule(id, version);
    await addUsernamesToRule(rule);
    return rule;
  },
};
