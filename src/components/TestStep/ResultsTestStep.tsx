import { useEffect, useContext } from "react";
import AppContext, { Status, Steps } from "../AppContext";
import TestStep from "./TestStep";

export default function ResultsTestStep() {
  const {
    dataService,
    loadCheck,
    jsonCheck,
    testCheck,
    setTestCheck,
  } = useContext(AppContext);

  useEffect(() => {
    const varSkipCount = (currentRecordResult: object): number =>
      (currentRecordResult["errors"] ?? []).filter(
        (currentError) => currentError["error"] === "Column not found in data"
      ).length;

    const testResultHasErrors = (currentRecordResult: object): boolean =>
      (currentRecordResult["executionStatus"] ?? "execution_error") ===
        "execution_error" &&
      ((currentRecordResult["errors"] ?? []).length === 0 ||
        currentRecordResult["errors"].length -
          varSkipCount(currentRecordResult) >
          0);

    const testResultsHaveErrors = (json: object): boolean =>
      Object.values(json).reduce<boolean>(
        (aggregateDomainResult: boolean, currentDomainResult: {}[]) =>
          aggregateDomainResult ||
          currentDomainResult === null ||
          currentDomainResult.reduce<boolean>(
            (aggregateRecordResult: boolean, currentRecordResult: {}) =>
              aggregateRecordResult || testResultHasErrors(currentRecordResult),
            false
          ),
        false
      );

    const testResultsErrorCount = (json: object): number =>
      Object.values(json).reduce<number>(
        (aggregateDomainResult: number, currentDomainResult: {}[]) =>
          aggregateDomainResult +
          (currentDomainResult === null
            ? 1
            : currentDomainResult.reduce<number>(
                (aggregateRecordResult: number, currentRecordResult: {}) =>
                  aggregateRecordResult +
                  (testResultHasErrors(currentRecordResult)
                    ? "errors" in currentRecordResult
                      ? currentRecordResult["errors"].length
                      : 1
                    : 0),
                0
              )),
        0
      );

    const testResultsNegativeCount = (json: object): number =>
      Object.values(json).reduce<number>(
        (aggregateDomainResult: number, currentDomainResult: {}[]) =>
          aggregateDomainResult +
          (Array.isArray(currentDomainResult)
            ? currentDomainResult.reduce<number>(
                (aggregateRecordResult: number, currentRecordResult: {}) =>
                  aggregateRecordResult +
                  (currentRecordResult["executionStatus"] === "success" &&
                  "errors" in currentRecordResult
                    ? currentRecordResult["errors"].length
                    : 0),
                0
              )
            : 0),
        0
      );

    const testResultsPositiveCount = (json: object): number =>
      Object.values(json).reduce<number>(
        (aggregateDomainResult: number, currentDomainResult: {}[]) =>
          aggregateDomainResult +
          (Array.isArray(currentDomainResult) &&
          (currentDomainResult.length === 0 ||
            (currentDomainResult[0]["executionStatus"] === "success" &&
              currentDomainResult[0]["errors"].length === 0))
            ? 1
            : 0),
        0
      );

    const testResultsScopeSkipCount = (json: object): number =>
      Object.values(json).reduce<number>(
        (aggregateDomainResult: number, currentDomainResult: {}[]) =>
          aggregateDomainResult +
          (currentDomainResult === null
            ? 0
            : currentDomainResult.reduce<number>(
                (aggregateRecordResult: number, currentRecordResult: {}) =>
                  aggregateRecordResult +
                  (currentRecordResult["executionStatus"] === "skipped"
                    ? 1
                    : 0),
                0
              )),
        0
      );

    const testResultsVarSkipCount = (json: object): number =>
      Object.values(json).reduce<number>(
        (aggregateDomainResult: number, currentDomainResult: {}[]) =>
          aggregateDomainResult +
          (currentDomainResult === null
            ? 0
            : currentDomainResult.reduce<number>(
                (aggregateRecordResult: number, currentRecordResult: {}) =>
                  aggregateRecordResult + varSkipCount(currentRecordResult),
                0
              )),
        0
      );

    let isSubscribed = true;
    if (jsonCheck.status === Status.Pass && loadCheck.status === Status.Pass) {
      dataService
        .execute_rule(jsonCheck.details[0], loadCheck.details[1])
        .then((response) => {
          if (isSubscribed) {
            setTestCheck({
              status: testResultsHaveErrors(response)
                ? Status.Fail
                : Status.Pass,
              errorCount: testResultsErrorCount(response),
              negativeCount: testResultsNegativeCount(response),
              positiveCount: testResultsPositiveCount(response),
              scopeSkipCount: testResultsScopeSkipCount(response),
              varSkipCount: testResultsVarSkipCount(response),
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
        .catch(async (exception) => {
          if (isSubscribed) {
            setTestCheck({
              status: Status.Fail,
              errorCount: 1,
              details: [
                "Request",
                {
                  rule: jsonCheck.details[0],
                  datasets: loadCheck.details[1],
                },
                exception.message,
                await exception.details,
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
  }, [jsonCheck, loadCheck, dataService, setTestCheck]);

  return <TestStep title={"Results"} step={Steps.Test} results={testCheck} />;
}
