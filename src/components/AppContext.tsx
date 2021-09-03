import React from "react";
import { DataService } from "../services/DataService";


export interface IAppError {
  title: string;
  message: string;
  isUncaught: boolean;
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
  autoModifiedRule: string;
  setAutoModifiedRule: (autoModifiedRule: string) => void;
  userModifiedRule: string;
  setUserModifiedRule: (userModifiedRule: string) => void;
  dirtyExplorerList: boolean;
  setDirtyExplorerList: (dirtyExplorerList: boolean) => void;
  isRuleDirty: () => boolean;
}

export const defaultAppContext: IAppContext = {
  appError: null,
  setError: () => { /* Placeholder */ },
  dataService: null,
  selectedRule: null,
  setSelectedRule: () => { /* Placeholder */ },
  isRuleSelected: () => false,
  unmodifiedRule: null,
  setUnmodifiedRule: () => { /* Placeholder */ },
  autoModifiedRule: null,
  setAutoModifiedRule: () => { /* Placeholder */ },
  userModifiedRule: null,
  setUserModifiedRule: () => { /* Placeholder */ },
  dirtyExplorerList: true,
  setDirtyExplorerList: () => { /* Placeholder */ },
  isRuleDirty: () => false,
};


const AppContext = React.createContext<IAppContext>(defaultAppContext);

export default AppContext;
