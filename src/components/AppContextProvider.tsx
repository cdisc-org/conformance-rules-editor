import React, { useState, useEffect, useCallback } from "react";
import { DataService } from "../services/DataService";
import AppContext, {
  IAppError,
  Order,
  Status,
  IResults,
  Steps,
} from "./AppContext";
import { AlertState } from "./GeneralAlert/GeneralAlert";
import { setDiagnosticsOptions } from "monaco-yaml/lib/esm/monaco.contribution";

const AppContextProvider: React.FC = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [dataService] = useState<DataService>(() => new DataService());
  const [appError, setAppError] = useState<IAppError>();
  const [selectedRule, setSelectedRule] = useState<string>(null);
  const [unmodifiedRule, setUnmodifiedRule] = useState<string>("");
  const [modifiedRule, setModifiedRule] = useState<string>("");
  /* False, because it will be set to true by the initial filter and sort values */
  const [dirtyExplorerList, setDirtyExplorerList] = useState<boolean>(false);
  const [alertState, setAlertState] = useState<AlertState>(null);
  const [username, setUsername] = useState<string>(null);
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<string>("changed");
  const [searchText, setSearchText] = useState<{ [key: string]: string }>({});
  const [loadCheck, setLoadCheck] = useState<IResults>({
    status: Status.Pending,
    details: [],
  });
  const [testStepExpanded, setTestStepExpanded] = useState<Steps | false>(
    false
  );

  const clearError = () => (appError ? setAppError(null) : undefined);

  const setError = (title: string, message: string, isUncaught = false) => {
    if (
      !appError ||
      (appError && (title !== appError.title || message !== appError.message))
    ) {
      setAppError({
        title,
        message,
        isUncaught,
      });
    }
  };

  const isRuleSelected = useCallback(() => selectedRule !== null, [
    selectedRule,
  ]);
  const isRuleDirty = useCallback(() => unmodifiedRule !== modifiedRule, [
    unmodifiedRule,
    modifiedRule,
  ]);

  const appContext = {
    appError,
    clearError,
    setError,
    dataService,
    selectedRule,
    setSelectedRule,
    isRuleSelected,
    unmodifiedRule,
    setUnmodifiedRule,
    modifiedRule,
    setModifiedRule,
    dirtyExplorerList,
    setDirtyExplorerList,
    isRuleDirty,
    alertState,
    setAlertState,
    username,
    setUsername,
    order,
    setOrder,
    orderBy,
    setOrderBy,
    searchText,
    setSearchText,
    loadCheck,
    setLoadCheck,
    testStepExpanded,
    setTestStepExpanded,
  };

  useEffect(() => {
    if (dataService) {
      dataService.get_username().then(function (response) {
        setUsername(response);
      });
    }
  }, [dataService, setUsername]);

  useEffect(() => {
    setLoadCheck({
      status: Status.Pending,
      details: [],
    });
  }, [selectedRule]);

  /* Load yaml schema for editor validation */
  useEffect(() => {
    dataService.get_rules_schema().then(function (rulesSchema) {
      setDiagnosticsOptions({
        validate: true,
        enableSchemaRequest: true,
        format: true,
        hover: true,
        completion: true,
        schemas: [
          {
            uri: "https://cdisc.org/rules/1-0",
            fileMatch: ["*"],
            schema: rulesSchema,
          },
        ],
      });
    });
  }, [dataService]);

  return (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;
