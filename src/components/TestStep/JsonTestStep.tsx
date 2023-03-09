import { useEffect, useContext } from "react";
import { spacesToUnderscores, yamlToJSON } from "../../utils/json_yaml";
import AppContext, { DetailsType, Status, Steps } from "../AppContext";
import TestStep from "./TestStep";

export default function JsonTestStep() {
  const { modifiedRule, dataService, jsonCheck, setJsonCheck } = useContext(
    AppContext
  );

  useEffect(() => {
    const json = spacesToUnderscores(yamlToJSON(modifiedRule));
    setJsonCheck({
      status: Status.Pass,
      details: [{ detailsType: DetailsType.json, details: json }],
    });
  }, [modifiedRule, dataService, setJsonCheck]);

  return (
    <TestStep
      title="Convert YAML to JSON Rule"
      step={Steps.JSON}
      results={jsonCheck}
    />
  );
}
