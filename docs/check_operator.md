# Check Operator

## Relational

- ### equal_to
- ### not_equal_to
- ### equal_to_case_insensitive
- ### not_equal_to_case_insensitive
- ### does_not_equal_string_part
- ### equals_string_part

Value comparison. Works for both string and number.

> --OCCUR = N

```yaml
- name: "--OCCUR"
  operator: "equal_to"
  value: "N"
```

> EXDOSE EQ 0

```yaml
- name: "EXDOSE"
  operator: "equal_to"
  value: 0
```

> --OCCUR ^= Y

```yaml
- name: "--OCCUR"
  operator: "not_equal_to"
  value: "Y"
```

> DSTERM is "Informed consent obtained"

```yaml
- name: "DSTERM"
  operator: "equal_to_case_insensitive"
  value: "Informed consent obtained"
```

- ### greater_than
- ### greater_than_or_equal_to
- ### less_than
- ### less_than_or_equal_to

Value comparison

> TSVAL < 1

```yaml
- name: "TSVAL"
  operator: "less_than"
  value: 1
```

> TSVAL <= 1

```yaml
- name: "TSVAL"
  operator: "less_than_or_equal_to"
  value: 1
```

> TSVAL > 0

```yaml
- name: "TSVAL"
  operator: "greater_than"
  value: 0
```

> TSVAL >= 0

```yaml
- name: "TSVAL"
  operator: "greater_than_or_equal_to"
  value: 1
```

> RDOMAIN equals characters 5 and 6 of the dataset name

```yaml
- name: "--OCCUR"
  operator: "equals_string_part"
  value: "dataset_name"
  regex: ".{4}(..).*" 
```

- ### empty
- ### non_empty

Value presence

> --OCCUR = null

```yaml
- name: "--OCCUR"
  operator: "empty"
```

> --OCCUR ^= null

```yaml
- name: "--OCCUR"
  operator: "non_empty"
```

## String

- ### matches_regex
- ### not_matches_regex
- ### prefix_matches_regex
- ### not_prefix_matches_regex
- ### suffix_matches_regex
- ### not_suffix_matches_regex

Regular Expression value matching

- Determine if each string starts with a match of a regular expression. Refer to this pandas documentation: https://pandas.pydata.org/docs/reference/api/pandas.Series.str.match.html
- To "search" for a regex within the entire text, prefix the regex with `.*` and do not use anchors `^` , `$`
- To do a "fullmatch" of a regex with the entire text, suffix the regex with an anchor `$` and do not prefix the regex with `.*`
- For syntax guide, refer to this Python documentation: [Regular Expression HOWTO](https://docs.python.org/3.7/howto/regex.html).
- Suggestion for an on-line regular expression logic. tester: https://regex101.com, choose the Python dialect.
- For regex token visualization, try https://www.debuggex.com.

> --TESTCD <= 8 chars and contains only letters, numbers, and underscores and can not start with a number

```yaml
- name: "--TESTCD"
  operator: "matches_regex"
  value: "[A-Z_][A-Z0-9_]{0,7}$"
```

> RDOMAIN begins with "AP" or "ap"

```yaml
- name: "RDOMAIN"
  operator: "prefix_matches_regex"
  prefix: 2
  value: "(ap|AP)"
```

> RDOMAIN does not begin with "AP" or "ap"

```yaml
- name: "RDOMAIN"
  operator: "not_prefix_matches_regex"
  prefix: 2
  value: "(ap|AP)"
```

> QNAM ends with numbers

```yaml
- name: "QNAM"
  operator: "suffix_matches_regex"
  suffix: 2
  value: "\d\d"
```

> QNAM does not end with numbers

```yaml
- name: "QNAM"
  operator: "not_suffix_matches_regex"
  suffix: 2
  value: "\d\d"
```

- ### starts_with
- ### ends_with
- ### prefix_equal_to
- ### prefix_not_equal_to
- ### suffix_equal_to
- ### suffix_not_equal_to
- ### prefix_is_contained_by
- ### prefix_is_not_contained_by
- ### suffix_is_contained_by
- ### suffix_is_not_contained_by

Substring matching

> DOMAIN beginning with 'AP'

```yaml
- name: "DOMAIN"
  operator: "starts_with"
  value: "AP"
```

> DOMAIN ending with 'FOOBAR'

```yaml
- name: "DOMAIN"
  operator: "ends_with"
  value: "FOOBAR"
```

- ### contains
- ### does_not_contain
- ### contains_case_insensitive
- ### does_not_contain_case_insensitive

Substring matching

> --TOXGR contains 'GRADE'

```yaml
- name: "--TOXGR"
  operator: "contains"
  value: "GRADE"
```

> --TOXGR contains 'GRADE', regardless of text case

```yaml
- name: "--TOXGR"
  operator: "contains_case_insentisitve"
  value: "grade"
```

> --TOXGR does not contain 'GRADE', regardless of text case

```yaml
- name: "--TOXGR"
  operator: "does_not_contain_case_insensitive"
  value: "grade"
```

- ### longer_than
- ### longer_than_or_equal_to
- ### shorter_than
- ### shorter_than_or_equal_to

Length

> SETCD value length > 8

```yaml
- name: "SETCD"
  operator: "longer_than"
  value: 8
```

> TSVAL value length >= 201

```yaml
- name: "TSVAL"
  operator: "longer_than_or_equal_to"
  value: 201
```

> SETCD value length < 9

```yaml
- name: "SETCD"
  operator: "shorter_than"
  value: 9
```

> TSVAL value length <= 200

```yaml
- name: "TSVAL"
  operator: "shorter_than_or_equal_to"
  value: 201
```

- ### has_equal_length
- ### has_not_equal_length

Length

> Check whether variable values has equal length of another variable.

```yaml
- name: SEENDTC
  operator: has_equal_length
  value: SESTDTC
```

## Date

- ### date_equal_to
- ### date_not_equal_to

Date arithmetic

- ### date_greater_than
- ### date_greater_than_or_equal_to
- ### date_less_than
- ### date_less_than_or_equal_to

Date arithmetic

> AEENDTC < AESTDTC

```yaml
- name: "AEENDTC"
  operator: "date_less_than"
  value: "AESTDTC"
```

> SSDTC < all DS.DSSTDTC when SSSTRESC = "DEAD"

```yaml
Check:
  all:
    - name: "SSSTRESC"
      operator: "equal_to"
      value: "DEAD"
    - name: "SSDTC"
      operator: "date_less_than"
      value: "$max_ds_dsstdtc"
# Note this representation for operations is for provisional use
Operations:
  - operator: "max_date"
    domain: "DS"
    name: "DSSTDTC"
    id: "$max_ds_dsstdtc"
```

> Year part of BRTHDTC > 2021

```yaml
- name: "BRTHDTC"
  operator: "date_greater_than"
  date_component: "year"
  value: "2021"
```

> AEENDTC <= AESTDTC

```yaml
- name: "AEENDTC"
  operator: "date_less_than_or_equal_to"
  value: "AESTDTC"
```

> Year part of BRTHDTC >= 2021

```yaml
- name: "BRTHDTC"
  operator: "date_greater_than_or_equal_to"
  date_component: "year"
  value: "2021"
```

- ### is_complete_date
- ### is_incomplete_date

Date check

> DM.RFSTDTC ^= complete date

```yaml
- name: "RFSTDTC"
  operator: "is_incomplete_date"
```

- ### invalid_date

Date check

> BRTHDTC is invalid

```yaml
- name: "BRTHDTC"
  operator: "invalid_date"
```

## Metadata

- ### exists
- ### not_exists

Works for Datasets and Variables

> --OCCUR is present in dataset

```yaml
- name: "--OCCUR"
  operator: "exists"
```

> Domain SJ exists

```yaml
Rule Type: Domain Existence Check
Check:
  all:
    - name: "SJ"
      operator: "exists"
```

> AEOCCUR not present in dataset

```yaml
- name: "AEOCCUR"
  operator: "not_exists"
```

> Domain SJ does not exist

```yaml
Rule Type: Domain Existence Check
Check:
  all:
    - name: "SJ"
      operator: "not_exists"
```

- ### additional_columns_empty
- ### additional_columns_not_empty

- ID: CG0262
- Class: TDM
- Domain: TS
- Variable: TSVALn
- Condition: TSVAL(n+1) ^= null
- Rule: TSVALn ^= null

```yaml
Scopes:
  Domains:
    - TS
Rule Type: Value Presence
Check:
  all:
    - operator: additional_columns_empty
      target: --VAL
```

This operator is technically compatible with COVALn. There is no similar rule for it.

- ### variable_metadata_equal_to
- ### variable_metadata_not_equal_to

Could be useful, for example, in checking variable permissibility in conjunction with the variable_permissibilities operator:

```yaml
Check:
  all:
    - operator: variable_metadata_equal_to
      value: Exp
      metadata: $permissibility
    - operator: not_exists
Operations:
  - id: $permissibility
    operator: variable_permissibilities
```

## Relationship & Set

- ### is_contained_by
- ### is_not_contained_by
- ### is_contained_by_case_insensitive
- ### is_not_contained_by_case_insensitive

Value comparison against a static value list

> ACTARM in ('Screen Failure', 'Not Assigned', 'Not Treated', 'Unplanned Treatment')

```yaml
- name: "ACTARM"
  operator: "is_contained_by"
  value:
    - "Screen Failure"
    - "Not Assigned"
    - "Not Treated"
    - "Unplanned Treatment"
```

> ARM not in ('Screen Failure', 'Not Assigned')

```yaml
- name: "ARM"
  operator: "is_not_contained_by"
  value:
    - "Screen Failure"
    - "Not Assigned"
```

> ACTARM in ('Screen Failure', 'Not Assigned', 'Not Treated', 'Unplanned Treatment')

```yaml
- name: "ACTARM"
  operator: "is_contained_by_case_insensitive"
  value:
    - "Screen Failure"
    - "Not Assigned"
    - "Not Treated"
    - "Unplanned Treatment"
```

> ARM not in ('Screen Failure', 'Not Assigned')

```yaml
- name: "ARM"
  operator: "is_not_contained_by_case_insensitive"
  value:
    - "Screen Failure"
    - "Not Assigned"
```

- ### contains
- ### does_not_contain
- ### contains_case_insensitive
- ### does_not_contain_case_insensitive

Value comparison against a static value list

- ### contains_all
- ### not_contains_all

> All of ('Screen Failure', 'Not Assigned', 'Not Treated', 'Unplanned Treatment') in ACTARM

```yaml
- name: "ACTARM"
  operator: "contains_all"
  value:
    - "Screen Failure"
    - "Not Assigned"
    - "Not Treated"
    - "Unplanned Treatment"
```

> All of ('Screen Failure', 'Not Assigned', 'Not Treated', 'Unplanned Treatment') not in ACTARM

```yaml
- name: "ACTARM"
  operator: "not_contains_all"
  value:
    - "Screen Failure"
    - "Not Assigned"
    - "Not Treated"
    - "Unplanned Treatment"
```

- ### is_unique_set
- ### is_not_unique_set

Relationship Integrity Check

> --SEQ is unique within DOMAIN, USUBJID, and --TESTCD

```yaml
- name: "--SEQ"
  operator: is_unique_set
  value:
    - "DOMAIN"
    - "USUBJID"
    - "--TESTCD"
```

> --SEQ is not unique within DOMAIN, USUBJID, and --TESTCD

```yaml
- name: "--SEQ"
  operator: is_not_unique_set
  value:
    - "DOMAIN"
    - "USUBJID"
    - "--TESTCD"
```

- ### is_unique_relationship
- ### is_not_unique_relationship

Relationship Integrity Check

> AETERM and AEDECOD has a 1-to-1 relationship

```yaml
- name: AETERM
  operator: is_unique_relationship
  value: AEDECOD
```

- ### is_valid_relationship
- ### is_not_valid_relationship

Relationship Integrity Check

> Records found in the domain referenced by RDOMAIN, where variable in IDVAR = value in IDVARVAL

```yaml
Scopes:
  Domains:
    - RELREC
Check:
  all:
    - name: "IDVAR"
      operator: is_valid_relationship
      context: "RDOMAIN"
      value: "IDVARVAL"
```

> No records found in the domain referenced by RDOMAIN, where variable in IDVAR = value in IDVARVAL

```yaml
Scopes:
  Domains:
    - RELREC
Check:
  all:
    - name: "IDVAR"
      operator: is_not_valid_relationship
      context: "RDOMAIN"
      value: "IDVARVAL"
```

- ### is_valid_reference
- ### is_not_valid_reference

Reference

> IDVAR is a valid reference as specified, given the domain context in RDOMAIN

```yaml
Scopes:
  Domains:
    - RELREC
Check:
  all:
    - name: "IDVAR"
      operator: is_valid_reference
      context: "RDOMAIN"
```

> IDVAR is an invalid reference as specified, given the domain context in RDOMAIN

```yaml
Scopes:
  Domains:
    - RELREC
Check:
  all:
    - name: "IDVAR"
      operator: is_valid_reference
      context: "RDOMAIN"
```

- ### empty_within_except_last_row
- ### non_empty_within_except_last_row

> SEENDTC is not empty when it is not the last record, grouped by USUBJID

```yaml
- name: SEENDTC
  operator: empty_within_except_last_row
  value: USUBJID
```

- ### has_next_corresponding_record
- ### does_not_have_next_corresponding_record

Ensures that a value of a variable in one record is equal to the value of another variable in the next corresponding record.

> SEENDTC is equal to the SESTDTC of the next record within a USUBJID. Ordered by SESEQ

```yaml
- name: SEENDTC
  operator: has_next_corresponding_record
  value: SESTDTC
  within: USUBJID
  ordering: SESEQ
```

- ### is_ordered_set
- ### is_not_ordered_set
- ### is_ordered_by
- ### is_not_ordered_by
- ### target_is_not_sorted_by
- ### target_is_sorted_by

This can be used to check that --SEQ variables are ordered.

- ### present_on_multiple_rows_within
- ### not_present_on_multiple_rows_within

```yaml
- operator: "present_on_multiple_rows_within"
  target: "RELID"
  comparator: 4 (optional)
  within: "USUBJID"
```

```yaml
- operator: "not_present_on_multiple_rows_within"
  target: "RELID"
  comparator: 4 (optional)
  within: "USUBJID"
```

- ### shares_at_least_one_element_with
- ### shares_exactly_one_element_with
- ### shares_no_elements_with

- ### has_same_values
- ### has_different_values

- ### value_has_multiple_references
- ### value_does_not_have_multiple_references

## Codelist

- ### references_correct_codelist
- ### does_not_reference_correct_codelist

- ### uses_valid_codelist_terms
- ### does_not_use_valid_codelist_terms

## Define.XML

- ### conformant_value_data_type
- ### non_conformant_value_data_type

Value Level Metadata Check against Define XML

- ### conformant_value_length
- ### non_conformant_value_length

Value Level Metadata Check against Define XML
