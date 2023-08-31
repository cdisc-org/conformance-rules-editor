import { IStorage } from "../types/IStorage";
import CosmosSQLStorage from "./CosmosSQLStorage";

const STORAGE_PROVIDERS: { [provider: string]: IStorage } = {
  CosmosSQL: CosmosSQLStorage,
};

export const STORAGE_PROVIDER =
  STORAGE_PROVIDERS[process.env["STORAGE_PROVIDER"]];
