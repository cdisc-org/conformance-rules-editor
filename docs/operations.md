# Operations (Aggregate)

Note: id is a variable assignment. Its value can be used for subsequent equality checks, for example.

## distinct

> Dataset's USUBJID is not in DM.USUBJID

```yaml
Rule Type: Range & Limit
Check:
  all:
    - name: "USUBJID"
      operator: "is_not_contained_by"
      value: "$dm_usubjid"
Operations:
  - operator: "distinct"
    domain: "DM"
    name: "USUBJID"
    id: "$dm_usubjid"
```

## dy

Calculates the number of days between the DTC and RFSTDTC. Logic: https://github.com/cdisc-org/cdisc-rules-engine/blob/main/cdisc_rules_engine/operations/day_data_validator.py

## extract_metadata

## get_column_order_from_dataset

> Returns list of dataset columns

## get_column_order_from_library

> Fetches column order for a given domain from the CDISC library. The lists with column names are sorted in accordance to "ordinal" key of library metadata.

```yaml
Rule Type: Variable Metadata Check
Check:
  all:
    - name: variable_name
      operator: is_not_contained_by
      value: $model_variables
Operations:
  - id: $model_variables
    operator: get_column_order_from_library
```

## max

## max_date

## mean

> AAGE > mean(DM.AGE), where AAGE is a fictitious NSV

```yaml
Check:
  all:
    - name: "AAGE"
      operator: "greater_than"
      value: "$average_age"
Operations:
  - operator: "mean"
    domain: "DM"
    name: "AGE"
    id: "$average_age" # average of all AGE values
```

Notes: CDISC conformance rule use case is TBD for this operator.

## min

## min_date

> RFSTDTC is greater than min AE.AESTDTC for the current USUBJID

```yaml
Check:
  all:
    - name: "RFSTDTC"
      operator: "date_greater_than"
      value: "$ae_aestdtc"
Operations:
  - operator: "min_date"
    domain: "AE"
    name: "AESTDTC"
    id: "$ae_aestdtc"
    group:
      - USUBJID
```

## record_count

## valid_meddra_code_references

## valid_meddra_code_term_pairs

## valid_meddra_term_references

## valid_whodrug_references

## variable_count

## variable_exists

> Flag an error if MIDS is in the dataset currently being evaluated and the TM domain is not present in the study

```yaml
Rule Type: Domain Presence Check
Check:
  all:
    - name: $MIDS_EXISTS
      operator: equal_to
      value: true
    - name: TM
      operator: not_exists
Operations:
  - id: $MIDS_EXISTS
    name: MIDS
    operator: variable_exists
```

## variable_names

## variable_permissibilities

## variable_value_count

## whodrug_code_hierarchy
