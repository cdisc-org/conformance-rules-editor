import React from "react";
import { DataService } from "../services/DataService";
import { AlertState } from "./GeneralAlert/GeneralAlert";
import { TOrder } from "../types/TOrder";
import { IUser } from "../types/IUser";

export interface IAppError {
  title: string;
  message: string;
  isUncaught: boolean;
}

export enum Status {
  Pending,
  Pass,
  Fail,
}

export enum DetailsType {
  file,
  json,
  text,
  xml,
}

export interface IResultsDetails {
  detailsType: DetailsType;
  details: any;
}

export interface IResults {
  status: Status;
  errorCount?: number;
  negativeCount?: number;
  positiveCount?: number;
  scopeSkipCount?: number;
  varSkipCount?: number;
  details: IResultsDetails[];
}

export enum Steps {
  Syntax,
  Schema,
  JSON,
  LoadDatasets,
  LoadDefineXML,
  Test,
}

export interface IAppContext {
  appError: IAppError;
  setError: (title: string, message: string) => void;
  dataService: DataService;
  ruleTemplate: string;
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
  user: IUser;
  setUser: (user: IUser) => void;
  order: TOrder;
  setOrder: (order: TOrder) => void;
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
  loadDatasetsCheck: IResults;
  setLoadDatasetsCheck: (loadDatasetsCheck: IResults) => void;
  loadDefineXMLCheck: IResults;
  setLoadDefineXMLCheck: (loadDefineXMLCheck: IResults) => void;
  testCheck: IResults;
  setTestCheck: (testCheck: IResults) => void;
  testStepExpanded: Steps | false;
  setTestStepExpanded: (testStepExpanded: Steps | false) => void;
  creator: IUser;
  setCreator: (creator: IUser) => void;
  isRuleModifiable: () => boolean;
}

export const defaultAppContext: IAppContext = {
  appError: null,
  setError: () => {
    /* Placeholder */
  },
  dataService: null,
  ruleTemplate: null,
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
  user: null,
  setUser: () => {
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
  loadDatasetsCheck: {
    status: Status.Pending,
    details: [],
  },
  setLoadDatasetsCheck: () => {
    /* Placeholder */
  },
  loadDefineXMLCheck: {
    status: Status.Pending,
    details: [],
  },
  setLoadDefineXMLCheck: () => {
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
  isRuleModifiable: () => false,
};

const AppContext = React.createContext<IAppContext>(defaultAppContext);

export default AppContext;
