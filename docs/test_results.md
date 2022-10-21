# Test Results

There are 4 categories of Test Results. You can use the contents of the "Results" pane to help troubleshoot the Test Results.

## Errors

You will see "Errors" when there is an unexpected problem with the rule, the test data, or the CORE Engine. Viewing the Test Results Pane will help determine the cause of the Error. If it has been determined that the error is caused by the CORE Engine, [a ticket should be raised in the CORE Engine software](ticket_submission.md).

## Positives

There are "Positives" for each _dataset_ where no records or metadata in the dataset trigger the failure criteria. In other words, a dataset with Positive results passes validation.

## Negatives

There are "Negatives" for each _record_ (or dataset) where that record triggers a failure criteria. In other words, a dataset with Negative results fails validation.

## Absent-Variable Skips

These are neutral results that occur when the rule performs tests on variables that do not exist in the dataset being checked. These need to be handled on a case-by-case basis depending on whether they are expected by the tester.
