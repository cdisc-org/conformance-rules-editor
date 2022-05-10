import { useEffect, useContext } from "react";
import AppContext, { Status, Steps } from "../AppContext";
import yaml from "js-yaml";
import Ajv from "ajv";
import TestStep from "./TestStep";
import { ISchema } from "../../services/DataService";

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
        dataService.get_rules_schema().then((schemas: ISchema[]) => {
          if (isSubscribed) {
            const ajv = new Ajv({
              allErrors: true,
              allowUnionTypes: true,
              schemas: schemas.map((schema: ISchema): {} => schema.json),
            });
            const validate = ajv.getSchema(
              schemas.filter(
                (schema: ISchema): boolean => schema.standard === "sdtm"
              )[0].id
            );
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
