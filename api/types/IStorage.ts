import { IQuery } from "./IQuery";
import { IRule } from "./IRule";
import { IRules } from "./IRules";

export interface IStorage {
  deleteRule: (
    rule: IRule
  ) => Promise<{
    status: number;
    body?: string;
  }>;
  getHistory: (id: string) => Promise<IRule>;
  getRule: (id: string) => Promise<IRule>;
  getRules: (query: IQuery) => Promise<IRules>;
  maxCoreId: () => Promise<string>;
  patchRule: (rule: IRule) => Promise<IRule>;
  postRule: (content: string, creatorId: string) => Promise<IRule>;
}
