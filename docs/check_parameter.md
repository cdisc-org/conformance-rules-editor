# Check Parameter

## comparator

## context

## date_component

- year
- month
- day
- hour
- minute
- second
- microsecond

## name

## negative

Boolean. Used with the `invalid_duration` operator to specify whether negative durations should be considered valid (True) or invalid (False).

```yaml
- name: "BRTHDTC"
  operator: "invalid_duration"
  negative: False
```
In this example, the rule will flag any negative durations in the DURVAR variable as invalid. If `negative` were set to `true`, negative durations would be considered valid and not raise issues.

## codelistcheck

- code
- value
Used with the `does_not_use_valid_codelist_terms` and `uses_valid_codelist_terms` operators.  Specifies whether to check against the conceptID ('code') or submission values ('value')
```yaml
  - name: "PPSTRESU"
    operator: does_not_use_valid_codelist_terms
    value: ["PKUDMG"]
    codelistcheck: "value"
    codelistlevel: "term"
```
In this example, the rule will check that the column PPSTRESU does not use submission values for terms in the PKUDMG codelist.

## codelistlevel

- codelist
- term
Used with the `does_not_use_valid_codelist_terms` and `uses_valid_codelist_terms` operators.  Specifies whether to check at the codelist level or individual term level

## operator

## order

- asc
- dsc

## ordering

## prefix

## suffix

## target

## value

## value_is_literal

Boolean. Signifies the string in the value key is to be treated as a literal string. When value_is_literal is not used within the rule logic, the string in the value key will be assumed as a variable in the dataset.

> IDVAR = "VISIT" as a value, not IDVAR = VISIT as a variable in the dataset

```yaml
- "name": "IDVAR"
  "operator": "equal_to"
  "value": "VISIT"
  "value_is_literal": true
```

## within
