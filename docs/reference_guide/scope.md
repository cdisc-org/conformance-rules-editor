# Scope

Typically:

- the YAML Scope's Class/Domain should match the Spreadsheet Condition (G) variables' Class and Domain.
- the Spreadsheet's Class (D) / Domain (E) should match the Spreadsheet Rule (H) variables' Class and Domain.

If you think about this conceptually, when you look at the rule, which datasets do you want to iterate through in order to check the condition? It should be the datasets in the Condition column. Then, given a record in the condition column, you will crosscheck (merge) the other datasets / columns to verify the Rule column.
