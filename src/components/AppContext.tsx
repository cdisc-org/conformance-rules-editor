import React from "react";
import { DataService } from "../services/DataService";
import { AlertState } from "./GeneralAlert/GeneralAlert";

export interface IAppError {
  title: string;
  message: string;
  isUncaught: boolean;
}

export type Order = "asc" | "desc";

export enum Status {
  Pending,
  Pass,
  Fail,
}

export interface IResults {
  status: Status;
  errorCount?: number;
  negativeCount?: number;
  positiveCount?: number;
  scopeSkipCount?: number;
  varSkipCount?: number;
  details: any[];
}

export enum Steps {
  Syntax,
  Schema,
  JSON,
  Load,
  Test,
}

export interface IAppContext {
  appError: IAppError;
  setError: (title: string, message: string) => void;
  dataService: DataService;
  selectedRule: string;
  setSelectedRule: (selectedRule: string) => void;
  isRuleSelected: () => boolean;
  unmodifiedRule: string;
  setUnmodifiedRule: (unmodifiedRule: string) => void;
  modifiedRule: string;
  setModifiedRule: (modifiedRule: string) => void;
  dirtyExplorerList: boolean;
  setDirtyExplorerList: (dirtyExplorerList: boolean) => void;
  isRuleDirty: () => boolean;
  alertState: AlertState;
  setAlertState: (alertState: AlertState) => void;
  username: string;
  setUsername: (username: string) => void;
  order: Order;
  setOrder: (order: Order) => void;
  orderBy: string;
  setOrderBy: (orderBy: string) => void;
  searchText: { [key: string]: string };
  setSearchText: (searchText: { [key: string]: string }) => void;
  syntaxCheck: IResults;
  setSyntaxCheck: (syntaxCheck: IResults) => void;
  schemaCheck: IResults;
  setSchemaCheck: (schemaCheck: IResults) => void;
  jsonCheck: IResults;
  setJsonCheck: (jsonCheck: IResults) => void;
  loadCheck: IResults;
  setLoadCheck: (loadCheck: IResults) => void;
  testCheck: IResults;
  setTestCheck: (testCheck: IResults) => void;
  testStepExpanded: Steps | false;
  setTestStepExpanded: (testStepExpanded: Steps | false) => void;
  creator: string;
  setCreator: (creator: string) => void;
  published: boolean;
  setPublished: (published: boolean) => void;
  isMyRule: () => boolean;
}

export const defaultAppContext: IAppContext = {
  appError: null,
  setError: () => {
    /* Placeholder */
  },
  dataService: null,
  selectedRule: null,
  setSelectedRule: () => {
    /* Placeholder */
  },
  isRuleSelected: () => false,
  unmodifiedRule: null,
  setUnmodifiedRule: () => {
    /* Placeholder */
  },
  modifiedRule: null,
  setModifiedRule: () => {
    /* Placeholder */
  },
  /* False, because it will be set to true by the initial filter and sort values */
  dirtyExplorerList: false,
  setDirtyExplorerList: () => {
    /* Placeholder */
  },
  isRuleDirty: () => false,
  alertState: null,
  setAlertState: () => {
    /* Placeholder */
  },
  username: null,
  setUsername: () => {
    /* Placeholder */
  },
  order: "desc",
  setOrder: () => {
    /* Placeholder */
  },
  orderBy: "changed",
  setOrderBy: () => {
    /* Placeholder */
  },
  searchText: {},
  setSearchText: () => {
    /* Placeholder */
  },
  loadCheck: {
    status: Status.Pending,
    details: [],
  },
  setLoadCheck: () => {
    /* Placeholder */
  },
  syntaxCheck: {
    status: Status.Pending,
    details: [],
  },
  setSyntaxCheck: () => {
    /* Placeholder */
  },
  schemaCheck: {
    status: Status.Pending,
    details: [],
  },
  setSchemaCheck: () => {
    /* Placeholder */
  },
  jsonCheck: {
    status: Status.Pending,
    details: [],
  },
  setJsonCheck: () => {
    /* Placeholder */
  },
  testCheck: {
    status: Status.Pending,
    details: [],
  },
  setTestCheck: () => {
    /* Placeholder */
  },
  testStepExpanded: false,
  setTestStepExpanded: () => {
    /* Placeholder */
  },
  creator: null,
  setCreator: () => {
    /* Placeholder */
  },
  published: null,
  setPublished: () => {
    /* Placeholder */
  },
  isMyRule: () => false,
};

const AppContext = React.createContext<IAppContext>(defaultAppContext);

export default AppContext;
