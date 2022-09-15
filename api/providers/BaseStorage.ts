import { IStorage } from "../types/IStorage";
import CosmosSQLStorage from "./CosmosSQLStorage";
import DrupalStorage from "./DrupalStorage";

const STORAGE_PROVIDERS = new Map<String, IStorage>([
  ["CosmosSQL", CosmosSQLStorage],
  ["Drupal", DrupalStorage],
]);

export const STORAGE_PROVIDER = STORAGE_PROVIDERS.get(
  process.env["STORAGE_PROVIDER"]
);
