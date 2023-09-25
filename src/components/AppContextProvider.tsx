import React, { useState, useEffect, useCallback } from "react";
import { DataService, ISchema } from "../services/DataService";
import AppContext, {
  IAppError,
  Status,
  IResults,
  Steps,
  DetailsType,
} from "./AppContext";
import { TOrder } from "../types/TOrder";
import { AlertState } from "./GeneralAlert/GeneralAlert";
import { SchemasSettings, setDiagnosticsOptions } from "monaco-yaml";
import { IUser } from "../types/IUser";
import { IRule } from "../types/IRule";

const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [dataService] = useState<DataService>(() => new DataService());
  const [ruleTemplate, setRuleTemplate] = useState<string>("");
  const [appError, setAppError] = useState<IAppError>();
  const [selectedRule, setSelectedRule] = useState<string>(null);
  const [unmodifiedRule, setUnmodifiedRule] = useState<IRule>({
    content: "",
    history: [],
  });
  const [modifiedRule, setModifiedRule] = useState<string>("");
  /* False, because it will be set to true by the initial filter and sort values */
  const [dirtyExplorerList, setDirtyExplorerList] = useState<boolean>(false);
  const [alertState, setAlertState] = useState<AlertState>(null);
  const [user, setUser] = useState<IUser>(null);
  const [order, setOrder] = useState<TOrder>("desc");
  const [orderBy, setOrderBy] = useState<string>("created");
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
  const [loadDatasetsCheck, setLoadDatasetsCheck] = useState<IResults>({
    status: Status.Pending,
    details: [],
  });
  const [loadDefineXMLCheck, setLoadDefineXMLCheck] = useState<IResults>({
    status: Status.Pending,
    details: [],
  });
  const [testCheck, setTestCheck] = useState<IResults>({
    status: Status.Pending,
    details: [
      {
        detailsType: DetailsType.text,
        details:
          "Waiting for a valid JSON executable rule and/or loaded test data.",
      },
    ],
  });
  const [testStepExpanded, setTestStepExpanded] = useState<Steps | false>(
    false
  );
  const [creator, setCreator] = useState<IUser>(null);

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

  const isRuleDirty = useCallback(
    () =>
      unmodifiedRule.content.replaceAll("\r\n", "\n") !==
      modifiedRule.replaceAll("\r\n", "\n"),
    [unmodifiedRule, modifiedRule]
  );

  const isRuleModifiable = useCallback(
    () =>
      (user && user.write_allowed) ||
      (user && user.company && user.company.toUpperCase() === "CDISC"),
    [user]
  );

  const appContext = {
    appError,
    clearError,
    setError,
    dataService,
    ruleTemplate,
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
    user,
    setUser,
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
    loadDatasetsCheck,
    setLoadDatasetsCheck,
    loadDefineXMLCheck,
    setLoadDefineXMLCheck,
    testCheck,
    setTestCheck,
    testStepExpanded,
    setTestStepExpanded,
    creator,
    setCreator,
    isRuleModifiable,
  };

  useEffect(() => {
    if (dataService) {
      dataService.get_user().then(function (response) {
        setUser(response);
      });
    }
  }, [dataService, setUser]);

  useEffect(() => {
    setLoadDatasetsCheck({
      status: Status.Pending,
      details: [],
    });
  }, [selectedRule]);

  useEffect(() => {
    setLoadDefineXMLCheck({
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
            fileMatch: schema.standard === "base" ? ["*"] : [],
          })
        ),
      });
    });
  }, [dataService]);

  useEffect(() => {
    dataService.get_rule_template().then((template) => {
      setRuleTemplate(template);
      setUnmodifiedRule({ content: template, history: [] });
      setModifiedRule(template);
    });
  }, [dataService]);

  return (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;
