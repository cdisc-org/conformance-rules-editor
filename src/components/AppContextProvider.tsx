import React, { useState, useEffect, useCallback } from "react";
import { DataService, ISchema } from "../services/DataService";
import AppContext, {
  IAppError,
  Order,
  Status,
  IResults,
  Steps,
} from "./AppContext";
import { AlertState } from "./GeneralAlert/GeneralAlert";
import { SchemasSettings, setDiagnosticsOptions } from "monaco-yaml";

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
  const [syntaxCheck, setSyntaxCheck] = useState<IResults>({
    status: Status.Pending,
    details: [],
  });
  const [schemaCheck, setSchemaCheck] = useState<IResults>({
    status: Status.Pending,
    details: [],
  });
  const [jsonCheck, setJsonCheck] = useState<IResults>({
    status: Status.Pending,
    details: [],
  });
  const [loadCheck, setLoadCheck] = useState<IResults>({
    status: Status.Pending,
    details: [],
  });
  const [testCheck, setTestCheck] = useState<IResults>({
    status: Status.Pending,
    details: [
      "Waiting for a valid JSON executable rule and/or loaded test data.",
    ],
  });
  const [testStepExpanded, setTestStepExpanded] = useState<Steps | false>(
    false
  );
  const [creator, setCreator] = useState<string>(null);
  const [published, setPublished] = useState<boolean>(null);

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

  const isMyRule = useCallback(() => username === creator, [username, creator]);

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
    syntaxCheck,
    setSyntaxCheck,
    schemaCheck,
    setSchemaCheck,
    jsonCheck,
    setJsonCheck,
    loadCheck,
    setLoadCheck,
    testCheck,
    setTestCheck,
    testStepExpanded,
    setTestStepExpanded,
    creator,
    setCreator,
    published,
    setPublished,
    isMyRule,
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
    dataService.get_rules_schema().then(function (schemas: ISchema[]) {
      setDiagnosticsOptions({
        validate: true,
        enableSchemaRequest: true,
        format: true,
        hover: true,
        completion: true,
        schemas: schemas.map(
          (schema: ISchema): SchemasSettings => ({
            uri: schema.uri,
            schema: schema.json,
            fileMatch: schema.standard === "sdtm" ? ["*"] : [],
          })
        ),
      });
    });
  }, [dataService]);

  return (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;
