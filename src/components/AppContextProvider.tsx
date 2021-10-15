import React, { useState, useEffect } from "react";
import { DataService } from "../services/DataService";
import AppContext, { IAppError, Order } from "./AppContext";
import { AlertState } from "./GeneralAlert/GeneralAlert";

const AppContextProvider: React.FC = ({ children }: { children: React.ReactNode }) => {
  const [dataService] = useState<DataService>(() => new DataService());
  const [appError, setAppError] = useState<IAppError>();
  const [selectedRule, setSelectedRule] = useState<string>(null);
  const [unmodifiedRule, setUnmodifiedRule] = useState<string>("");
  const [autoModifiedRule, setAutoModifiedRule] = useState<string>("");
  const [userModifiedRule, setUserModifiedRule] = useState<string>("");
  /* False, because it will be set to true by the initial filter and sort values */
  const [dirtyExplorerList, setDirtyExplorerList] = useState<boolean>(false);
  const [isNewRuleSelected, setIsNewRuleSelected] = useState<boolean>(false);
  const [alertState, setAlertState] = useState<AlertState>(null);
  const [username, setUsername] = useState<string>(null);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<string>('changed');
  const [searchText, setSearchText] = useState<{ [key: string]: string; }>({});

  const clearError = () => appError ? setAppError(null) : undefined;

  const setError = (title: string, message: string, isUncaught = false) => {
    if (!appError || (appError && (title !== appError.title || message !== appError.message))) {
      setAppError({
        title, message, isUncaught
      });
    }
  }

  const isRuleSelected = () => selectedRule !== null;
  const isRuleDirty = () => unmodifiedRule !== userModifiedRule;

  const appContext = {
    appError, clearError, setError, dataService, selectedRule, setSelectedRule, isRuleSelected, unmodifiedRule, setUnmodifiedRule, autoModifiedRule, setAutoModifiedRule, userModifiedRule, setUserModifiedRule, dirtyExplorerList, setDirtyExplorerList, isRuleDirty, isNewRuleSelected, setIsNewRuleSelected, alertState, setAlertState, username, setUsername, order, setOrder, orderBy, setOrderBy, searchText, setSearchText
  };

  useEffect(() => {
    if (dataService) {
      dataService.get_username()
        .then(function (response) {
          setUsername(response);
        });
    }
  }, [dataService, setUsername]);

  return (
    <AppContext.Provider value={appContext}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContextProvider;
