import { useEffect, useContext } from "react";
import AppContext, { Status, Steps } from "../AppContext";
import yaml from "js-yaml";
import Ajv from "ajv";
import TestStep from "./TestStep";

export default function SchemaTestStep() {
  const { modifiedRule, dataService, schemaCheck, setSchemaCheck } = useContext(
    AppContext
  );

  useEffect(() => {
    let isSubscribed = true;

    setSchemaCheck({
      status: Status.Pending,
      details: [],
    });

    try {
      const yamlDoc = yaml.load(modifiedRule);
      if (yamlDoc) {
        const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
        dataService.get_rules_schema().then((rulesSchema) => {
          if (isSubscribed) {
            const validate = ajv.compile(rulesSchema);
            const valid = validate(yamlDoc);
            setSchemaCheck(
              valid
                ? {
                    status: Status.Pass,
                    details: ["Pass"],
                  }
                : {
                    status: Status.Fail,
                    details: [validate.errors],
                  }
            );
          }
        });
      } else {
        setSchemaCheck({
          status: Status.Fail,
          details: ["Fail Syntax Check"],
        });
      }
    } catch (e) {
      if (isSubscribed) {
        setSchemaCheck({
          status: Status.Fail,
          details: ["Fail Syntax Check"],
        });
      }
    }

    return () => {
      isSubscribed = false;
    };
  }, [modifiedRule, dataService, setSchemaCheck]);

  return (
    <TestStep
      title="Validate YAML against Schema"
      step={Steps.Schema}
      results={schemaCheck}
    />
  );
}
