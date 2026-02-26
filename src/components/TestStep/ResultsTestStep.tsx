import { useEffect, useContext } from "react";
import AppContext, { DetailsType, Status, Steps } from "../AppContext";
import TestStep from "./TestStep";

export default function ResultsTestStep() {
  const {
    dataService,
    loadDatasetsCheck,
    loadDefineXMLCheck,
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
      (currentRecordResult["executionStatus"] ?? "execution error") ===
        "execution error" &&
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
                (
                  aggregateRecordResult: number,
                  currentRecordResult: { errors: [] }
                ) =>
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
                (
                  aggregateRecordResult: number,
                  currentRecordResult: { errors: [] }
                ) =>
                  aggregateRecordResult +
                  (currentRecordResult["executionStatus"] ===
                    "issue reported" && "errors" in currentRecordResult
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

    const executionPayload = () => ({
      /* rule */
      rule: jsonCheck.details[0].details,
      /* datasets, standard, codelists */
      ...loadDatasetsCheck.details[1].details,
      /* define_xml */
      ...(loadDefineXMLCheck.status === Status.Pass
        ? { define_xml: loadDefineXMLCheck.details[1].details }
        : {}),
    });

    let isSubscribed = true;
    if (
      jsonCheck.status === Status.Pass &&
      loadDatasetsCheck.status === Status.Pass
    ) {
      dataService
        .execute_rule(executionPayload())
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
                {
                  detailsType: DetailsType.text,
                  details: "Request",
                },
                {
                  detailsType: DetailsType.json,
                  details: executionPayload(),
                },
                {
                  detailsType: DetailsType.text,
                  details: "Results",
                },
                {
                  detailsType:
                    typeof response === "string"
                      ? DetailsType.text
                      : DetailsType.json,
                  details: response,
                },
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
                {
                  detailsType: DetailsType.text,
                  details: "Request",
                },
                {
                  detailsType: DetailsType.json,
                  details: executionPayload(),
                },
                {
                  detailsType: DetailsType.text,
                  details: exception.message,
                },
                {
                  detailsType: exception.detailsType,
                  details: exception.details,
                },
              ],
            });
          }
        });
    } else {
      setTestCheck({
        status: Status.Pending,
        details: [
          {
            detailsType: DetailsType.text,
            details:
              "Waiting for a valid JSON executable rule and/or loaded test data.",
          },
        ],
      });
    }
    return () => {
      isSubscribed = false;
    };
  }, [
    jsonCheck,
    loadDatasetsCheck,
    loadDefineXMLCheck,
    dataService,
    setTestCheck,
  ]);

  return <TestStep title={"Results"} step={Steps.Test} results={testCheck} />;
}
