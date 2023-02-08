import { IQuery } from "./IQuery";
import { IRule } from "./IRule";
import { IRules } from "./IRules";

export interface IStorage {
    deleteRule: (id: string) => Promise<{
        status: number,
        body?: string
    }>;
    getRule: (id: string) => Promise<IRule>;
    getRules: (query: IQuery) => Promise<IRules>;
    maxCoreId: () => Promise<string>;
    patchRule: (id: string, rule: IRule) => Promise<IRule>;
    postRule: (content: string, creatorId: string) => Promise<IRule>;
}
