import { useEffect, useContext } from "react";
import AppContext, { Status, Steps } from "../AppContext";
import yaml from "js-yaml";
import TestStep from "./TestStep";

export default function SyntaxTestStep() {
  const { modifiedRule, dataService, syntaxCheck, setSyntaxCheck } = useContext(
    AppContext
  );

  useEffect(() => {
    let isSubscribed = true;

    setSyntaxCheck({
      status: Status.Pending,
      details: [],
    });

    try {
      const yamlDoc = yaml.load(modifiedRule);
      if (yamlDoc) {
        setSyntaxCheck({ status: Status.Pass, details: [yamlDoc] });
      } else {
        setSyntaxCheck({
          status: Status.Fail,
          details: ["Fail for unknown reason"],
        });
      }
    } catch (e) {
      if (isSubscribed) {
        setSyntaxCheck({ status: Status.Fail, details: [e.message] });
      }
    }
    return () => {
      isSubscribed = false;
    };
  }, [modifiedRule, dataService, setSyntaxCheck]);

  return (
    <TestStep
      title="Validate YAML Syntax"
      step={Steps.Syntax}
      results={syntaxCheck}
    />
  );
}
