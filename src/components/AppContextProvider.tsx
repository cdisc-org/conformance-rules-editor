import React, { useState } from "react";
import { DataService } from "../services/DataService";
import AppContext, { IAppError } from "./AppContext";

const AppContextProvider: React.FC = ({ children }: { children: React.ReactNode }) => {
  const [dataService] = useState<DataService>(() => new DataService());
  const [appError, setAppError] = useState<IAppError>();
  const [selectedRule, setSelectedRule] = useState<string>();
  const [unmodifiedRule, setUnmodifiedRule] = useState<string>();
  const [autoModifiedRule, setAutoModifiedRule] = useState<string>();
  const [userModifiedRule, setUserModifiedRule] = useState<string>();
  const [dirtyExplorerList, setDirtyExplorerList] = useState<boolean>(true);

  const clearError = () => appError ? setAppError(null) : undefined;

  const setError = (title: string, message: string, isUncaught = false) => {
    if (!appError || (appError && (title !== appError.title || message !== appError.message))) {
      setAppError({
        title, message, isUncaught
      });
    }
  }

  const isRuleSelected = () => selectedRule !== undefined && selectedRule !== null;
  const isRuleDirty = () => unmodifiedRule !== userModifiedRule;

  const appContext = {
    appError, clearError, setError, dataService, selectedRule, setSelectedRule, isRuleSelected, unmodifiedRule, setUnmodifiedRule, autoModifiedRule, setAutoModifiedRule, userModifiedRule, setUserModifiedRule, dirtyExplorerList, setDirtyExplorerList, isRuleDirty
  };

  return (
    <AppContext.Provider value={appContext}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContextProvider;
