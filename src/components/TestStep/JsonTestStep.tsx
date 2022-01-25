import { useEffect, useContext } from "react";
import AppContext, { Status, Steps } from "../AppContext";
import TestStep from "./TestStep";

export default function JsonTestStep() {
  const { modifiedRule, dataService, jsonCheck, setJsonCheck } = useContext(
    AppContext
  );

  useEffect(() => {
    let isSubscribed = true;

    setJsonCheck({
      status: Status.Pending,
      details: [],
    });

    dataService
      .generate_rule_json(modifiedRule)
      .then((response) => {
        if (isSubscribed) {
          setJsonCheck(
            "error" in response
              ? {
                  status: Status.Fail,
                  details: [`${response.error}: ${response.message}`],
                }
              : {
                  status: Status.Pass,
                  details: [response],
                }
          );
        }
      })
      .catch(async (exception) => {
        if (isSubscribed) {
          setJsonCheck({
            status: Status.Fail,
            details: [exception.message, await exception.details],
          });
        }
      });
    return () => {
      isSubscribed = false;
    };
  }, [modifiedRule, dataService, setJsonCheck]);

  return (
    <TestStep
      title="Convert YAML to JSON Executable Rule"
      step={Steps.JSON}
      results={jsonCheck}
    />
  );
}
