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

  const testResultsHaveUnexpectedErrors = (json: object): boolean =>
    Object.values(json).reduce(
      (aggregateDomainResult: boolean, currentDomainResult: {}[]) =>
        aggregateDomainResult ||
        (currentDomainResult &&
          currentDomainResult.reduce(
            (aggregateRecordResult: boolean, currentRecordResult: {}) =>
              aggregateRecordResult || !("domain" in currentRecordResult),
            false
          )),
      false
    );

  const testResultsErrorCount = (json: object): number =>
    Object.values(json).reduce(
      (aggregateDomainResult: number, currentDomainResult: {}[]) =>
        aggregateDomainResult +
        currentDomainResult.filter(
          (currentRecordResult: {}) => "error" in currentRecordResult
        ).length,
      0
    );

  useEffect(() => {
    let isSubscribed = true;
    if (jsonCheck.status === Status.Pass && loadCheck.status === Status.Pass) {
      dataService
        .execute_rule(jsonCheck.details[0], loadCheck.details[1])
        .then((response) => {
          if (isSubscribed) {
            setTestCheck({
              status: testResultsHaveUnexpectedErrors(response)
                ? Status.Fail
                : Status.Pass,
              badgeCount: testResultsErrorCount(response),
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
  }, [jsonCheck, loadCheck, dataService, setTestCheck]);

  return (
    <TestStep title="Test Results" step={Steps.Test} results={testCheck} />
  );
}
