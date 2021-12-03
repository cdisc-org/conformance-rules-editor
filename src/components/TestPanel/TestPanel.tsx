import { useState, useEffect, useContext } from "react";
import AppContext, { Status, IResults, Steps } from "../AppContext";
import yaml from "js-yaml";
import Ajv from "ajv";
import { excelToJsonDatasets, IDataset } from "../../utils/ExcelDataset";
import TestStep from "../TestStep/TestStep";
import FileInput from "../FileInput/FileInput";

export default function TestPanel() {
  const {
    modifiedRule,
    dataService,
    loadCheck,
    setLoadCheck,
    selectedRule,
  } = useContext(AppContext);
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

  const [testCheck, setTestCheck] = useState<IResults>({
    status: Status.Pending,
    details: [
      "Waiting for a valid JSON executable rule and/or loaded test data.",
    ],
  });

  const handleFileSelected = async (event) => {
    if (event.target.files.length) {
      const file: File = event.target.files[0];
      const data: IDataset[] = await excelToJsonDatasets(file);
      setLoadCheck({
        status: Status.Pass,
        details: [file, data],
      });
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    setSyntaxCheck({
      status: Status.Pending,
      details: [],
    });
    setSchemaCheck({
      status: Status.Pending,
      details: [],
    });
    setJsonCheck({
      status: Status.Pending,
      details: [],
    });
    setTestCheck({
      status: Status.Pending,
      details: [
        "Waiting for a valid JSON executable rule and/or loaded test data.",
      ],
    });

    /* Syntax Check */
    try {
      const yamlDoc = yaml.load(modifiedRule);
      if (yamlDoc) {
        setSyntaxCheck({ status: Status.Pass, details: ["Pass"] });

        /* Schema Check */
        const ajv = new Ajv({ allErrors: true });
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
        setSyntaxCheck({
          status: Status.Fail,
          details: ["Fail for unknown reason"],
        });
        setSchemaCheck({
          status: Status.Fail,
          details: ["Fail Syntax Check"],
        });
      }
    } catch (e) {
      if (isSubscribed) {
        setSyntaxCheck({ status: Status.Fail, details: [e.message] });
        setSchemaCheck({
          status: Status.Fail,
          details: ["Fail Syntax Check"],
        });
      }
    }

    /* Convert YAML to JSON Executable */
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
      .catch((exception) => {
        if (isSubscribed) {
          setJsonCheck({
            status: Status.Fail,
            details: [`Fail: ${exception}`],
          });
        }
      });
    return () => {
      isSubscribed = false;
    };
  }, [modifiedRule, dataService]);

  useEffect(() => {
    let isSubscribed = true;
    if (jsonCheck.status === Status.Pass && loadCheck.status === Status.Pass) {
      dataService
        .execute_rule(jsonCheck.details[0], loadCheck.details[1])
        .then((response) => {
          if (isSubscribed) {
            const hasUnexpectedErrors = Object.values(response).reduce(
              (aggregateDomainResult: boolean, currentDomainResult: {}[]) =>
                aggregateDomainResult ||
                (currentDomainResult &&
                  currentDomainResult.reduce(
                    (aggregateRecordResult: Boolean, currentRecordResult: {}) =>
                      aggregateRecordResult ||
                      !("rule_id" in currentRecordResult),
                    false
                  )),
              false
            );
            setTestCheck({
              status: hasUnexpectedErrors ? Status.Fail : Status.Pass,
              details: [
                "Request",
                {
                  rule: jsonCheck.details[0],
                  datasets: loadCheck.details[1],
                },
                "Results",
                response,
              ],
            });
          }
        })
        .catch((exception) => {
          if (isSubscribed) {
            setTestCheck({
              status: Status.Fail,
              details: [
                "Request",
                {
                  rule: jsonCheck.details[0],
                  datasets: loadCheck.details[1],
                },
                `Results - Fail: ${exception}`,
              ],
            });
          }
        });
    } else {
      setTestCheck({
        status: Status.Pending,
        details: [
          "Waiting for a valid JSON executable rule and/or loaded test data.",
        ],
      });
    }
    return () => {
      isSubscribed = false;
    };
  }, [jsonCheck, loadCheck, dataService]);

  return (
    <>
      <TestStep
        title="Validate YAML Syntax"
        step={Steps.Syntax}
        results={syntaxCheck}
      />
      <TestStep
        title="Validate YAML against Schema"
        step={Steps.Schema}
        results={schemaCheck}
      />
      <TestStep
        title="Convert YAML to JSON Executable Rule"
        step={Steps.JSON}
        results={jsonCheck}
      />
      <TestStep title="Load Test Data" step={Steps.Load} results={loadCheck}>
        <FileInput
          id={selectedRule}
          label="Test Datasets File..."
          onChange={handleFileSelected}
        />
      </TestStep>
      <TestStep title="Test Results" step={Steps.Test} results={testCheck} />
    </>
  );
}
