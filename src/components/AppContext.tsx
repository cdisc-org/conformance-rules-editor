import React from "react";
import { DataService } from "../services/DataService";
import { AlertState } from "./GeneralAlert/GeneralAlert";

export interface IAppError {
  title: string;
  message: string;
  isUncaught: boolean;
}

export type Order = "asc" | "desc";

export interface IAppContext {
  appError: IAppError;
  setError: (title: string, message: string) => void;
  dataService: DataService;
  selectedRule: string;
  setSelectedRule: (selectedRule: string) => void;
  isRuleSelected: () => boolean;
  unmodifiedRule: string;
  setUnmodifiedRule: (unmodifiedRule: string) => void;
  autoModifiedRule: string;
  setAutoModifiedRule: (autoModifiedRule: string) => void;
  userModifiedRule: string;
  setUserModifiedRule: (userModifiedRule: string) => void;
  dirtyExplorerList: boolean;
  setDirtyExplorerList: (dirtyExplorerList: boolean) => void;
  isRuleDirty: () => boolean;
  isNewRuleSelected: boolean;
  setIsNewRuleSelected: (isNewRuleSelected: boolean) => void;
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
  autoModifiedRule: null,
  setAutoModifiedRule: () => {
    /* Placeholder */
  },
  userModifiedRule: null,
  setUserModifiedRule: () => {
    /* Placeholder */
  },
  /* False, because it will be set to true by the initial filter and sort values */
  dirtyExplorerList: false,
  setDirtyExplorerList: () => {
    /* Placeholder */
  },
  isRuleDirty: () => false,
  isNewRuleSelected: true,
  setIsNewRuleSelected: () => {
    /* Placeholder */
  },
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
};

const AppContext = React.createContext<IAppContext>(defaultAppContext);

export default AppContext;
