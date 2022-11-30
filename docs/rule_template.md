# Rule Template

```yml
Authority:
  - Organization: CDISC
    Standards:
      - Name: ADaMIG
        References:
          - Citations:
              - Cited Guidance: ""
                Document: ""
                Item: ""
                Section: ""
            Criteria:
              Logical Expression:
                Condition: ""
                Rule: ""
              Plain Language Expression: ""
              Type: Failure | Success
            Origin: ADaM Conformance Rules
            Related Rules:
              Id: ""
              Relationship: Predecessor | Related | Successor
            Release Notes: ""
            Rule Identifier:
              Id: ""
              Version: ""
            Severity: ""
            Validator Rule Message: ""
            Version: "4.0"
        Version: 1.0 | 1.1 | 1.2 | 1.3
      - Name: SDTMIG
        References:
          - Citations:
              - Cited Guidance: ""
                Document: ""
                Item: ""
                Section: ""
            Criteria:
              Logical Expression:
                Condition: ""
                Rule: ""
              Plain Language Expression: ""
              Type: Failure | Success
            Origin: SDTM and SDTMIG Conformance Rules
            Related Rules:
              Id: ""
              Relationship: Predecessor | Related | Successor
            Release Notes: ""
            Rule Identifier:
              Id: ""
              Version: 1 | 2 | 3
            Severity: ""
            Validator Rule Message: ""
            Version: "2.0"
        Version: 3.2 | 3.3 | 3.4
      - Name: SENDIG
        References:
          - Citations:
              - Cited Guidance: ""
                Document: ""
                Item: ""
                Section: ""
            Criteria:
              Logical Expression:
                Condition: ""
                Rule: ""
              Plain Language Expression: ""
              Type: Failure | Success
            Origin: SEND Conformance Rules
            Related Rules:
              Id: ""
              Relationship: Predecessor | Related | Successor
            Release Notes: ""
            Rule Identifier:
              Id: ""
              Version: ""
            Severity: ""
            Validator Rule Message: ""
            Version: "5.0"
        Version: 3.0 | 3.1 | 3.1.1
      - Name: SENDIG-DART
        References:
          - Citations:
              - Cited Guidance: ""
                Document: ""
                Item: ""
                Section: ""
            Criteria:
              Logical Expression:
                Condition: ""
                Rule: ""
              Plain Language Expression: ""
              Type: Failure | Success
            Origin: SEND Conformance Rules
            Related Rules:
              Id: ""
              Relationship: Predecessor | Related | Successor
            Release Notes: ""
            Rule Identifier:
              Id: ""
              Version: ""
            Severity: ""
            Validator Rule Message: ""
            Version: "5.0"
        Version: "1.1"
  - Organization: FDA
    Standards:
      - Name: SDTMIG
        References:
          - Citations:
              - Cited Guidance: ""
                Document: ""
                Item: ""
                Section: ""
            Criteria:
              Logical Expression:
                Condition: ""
                Rule: ""
              Plain Language Expression: ""
              Type: Failure | Success
            Origin: FDA Validator Rules
            Related Rules:
              Id: ""
              Relationship: Predecessor | Related | Successor
            Release Notes: ""
            Rule Identifier:
              Id: ""
              Version: ""
            Severity: ""
            Validator Rule Message: ""
            Version: 1.5 March 2021
        Version: 3.1.2 | 3.1.3 | 3.2 | 3.3
      - Name: SENDIG
        References:
          - Citations:
              - Cited Guidance: ""
                Document: ""
                Item: ""
                Section: ""
            Criteria:
              Logical Expression:
                Condition: ""
                Rule: ""
              Plain Language Expression: ""
              Type: Failure | Success
            Origin: FDA Validator Rules
            Related Rules:
              Id: ""
              Relationship: Predecessor | Related | Successor
            Release Notes: ""
            Rule Identifier:
              Id: ""
              Version: ""
            Severity: ""
            Validator Rule Message: ""
            Version: 1.5 March 2021
        Version: 3.0 | 3.1
Check:
  all:
    - comparator: ""
      context: ""
      date_component: year | month | day | hour | minute | second | microsecond
      name: >-
        dataset_class | dataset_is_non_standard | dataset_label |
        dataset_location | dataset_name | dataset_size | dataset_structure |
        define_variable_allowed_terms | define_variable_ccode |
        define_variable_data_type | ...
      operator: >-
        additional_columns_empty | additional_columns_not_empty |
        conformant_value_data_type | conformant_value_length | contains |
        contains_all | contains_case_insensitive | date_equal_to |
        date_greater_than | date_greater_than_or_equal_to | ...
      order: asc | dsc
      ordering: ""
      prefix: 12345
      suffix: 12345
      target: ""
      value: ""
      value_is_literal: true
      within: ""
    - ...: ""
  any:
    - comparator: ""
      context: ""
      date_component: year | month | day | hour | minute | second | microsecond
      name: >-
        dataset_class | dataset_is_non_standard | dataset_label |
        dataset_location | dataset_name | dataset_size | dataset_structure |
        define_variable_allowed_terms | define_variable_ccode |
        define_variable_data_type | ...
      operator: >-
        additional_columns_empty | additional_columns_not_empty |
        conformant_value_data_type | conformant_value_length | contains |
        contains_all | contains_case_insensitive | date_equal_to |
        date_greater_than | date_greater_than_or_equal_to | ...
      order: asc | dsc
      ordering: ""
      prefix: 12345
      suffix: 12345
      target: ""
      value: ""
      value_is_literal: true
      within: ""
    - ...: ""
  not:
    comparator: ""
    context: ""
    date_component: year | month | day | hour | minute | second | microsecond
    name: >-
      dataset_class | dataset_is_non_standard | dataset_label | dataset_location
      | dataset_name | dataset_size | dataset_structure |
      define_variable_allowed_terms | define_variable_ccode |
      define_variable_data_type | ...
    operator: >-
      additional_columns_empty | additional_columns_not_empty |
      conformant_value_data_type | conformant_value_length | contains |
      contains_all | contains_case_insensitive | date_equal_to |
      date_greater_than | date_greater_than_or_equal_to | ...
    order: asc | dsc
    ordering: ""
    prefix: 12345
    suffix: 12345
    target: ""
    value: ""
    value_is_literal: true
    within: ""
Core:
  Id: ""
  Version: "1"
  Status: Draft | Published
Description: ""
Executability: >-
  Fully Executable | Partially Executable - Possible Overreporting | Partially
  Executable - Possible Underreporting
Match Datasets:
  - Name: >-
      All | AP-- | APRELSUB | POOLDEF | RELREC | RELSPEC | RELSUB | SUPP-- |
      ADAM OTHER | ALL | ...
    Is Relationship: true
    Keys:
      - ""
Operations:
  - domain: >-
      All | AP-- | APRELSUB | POOLDEF | RELREC | RELSPEC | RELSUB | SUPP-- |
      ADAM OTHER | ALL | ...
    group:
      - ""
    id: ""
    name: ""
    operator: >-
      distinct | dy | extract_metadata | max | max_date | mean | min | min_date
      | variable_exists | variable_names | ...
Outcome:
  Message: ""
  Output Variables:
    - ""
Rule Type: >-
  Dataset Contents Check against Define XML and Library Metadata | Dataset
  Contents Check against Library Metadata | Dataset Metadata Check | Dataset
  Metadata Check against Define XML | Define-XML | Domain Presence Check |
  Record Data | Value Level Metadata Check against Define XML | Variable
  Metadata Check | Variable Metadata Check against Define XML
Scope:
  Classes:
    Include:
      - ALL
      - EVENTS
      - FINDINGS
      - FINDINGS ABOUT
      - INTERVENTIONS
      - RELATIONSHIP
      - SPECIAL PURPOSE
      - STUDY REFERENCE
      - TRIAL DESIGN
    Exclude:
      - ALL
      - EVENTS
      - FINDINGS
      - FINDINGS ABOUT
      - INTERVENTIONS
      - RELATIONSHIP
      - SPECIAL PURPOSE
      - STUDY REFERENCE
      - TRIAL DESIGN
  Data Structures:
    Include:
      - ADAM OTHER
      - ALL
      - BASIC DATA STRUCTURE
      - DEVICE LEVEL ANALYSIS DATASET
      - MEDICAL DEVICE BASIC DATA STRUCTURE
      - MEDICAL DEVICE OCCURRENCE DATA STRUCTURE
      - OCCURRENCE DATA STRUCTURE
      - SUBJECT LEVEL ANALYSIS DATASET
    Exclude:
      - ADAM OTHER
      - ALL
      - BASIC DATA STRUCTURE
      - DEVICE LEVEL ANALYSIS DATASET
      - MEDICAL DEVICE BASIC DATA STRUCTURE
      - MEDICAL DEVICE OCCURRENCE DATA STRUCTURE
      - OCCURRENCE DATA STRUCTURE
      - SUBJECT LEVEL ANALYSIS DATASET
  Datasets:
    Exclude:
      - All
      - AP--
      - APRELSUB
      - POOLDEF
      - RELREC
      - RELSPEC
      - RELSUB
      - SUPP--
    Include:
      - All
      - AP--
      - APRELSUB
      - POOLDEF
      - RELREC
      - RELSPEC
      - RELSUB
      - SUPP--
  Domains:
    Exclude:
      - All
      - AP--
      - APRELSUB
      - POOLDEF
      - RELREC
      - RELSPEC
      - RELSUB
      - SUPP--
    Include:
      - All
      - AP--
      - APRELSUB
      - POOLDEF
      - RELREC
      - RELSPEC
      - RELSUB
      - SUPP--
    include_split_datasets: true | false
  Subclasses:
    Exclude:
      - ADVERSE EVENT
      - ALL
      - MEDICAL DEVICE TIME-TO-EVENT
      - NON-COMPARTMENTAL ANALYSIS
      - TIME-TO-EVENT
    Include:
      - ADVERSE EVENT
      - ALL
      - MEDICAL DEVICE TIME-TO-EVENT
      - NON-COMPARTMENTAL ANALYSIS
      - TIME-TO-EVENT
Sensitivity: Dataset | Record
```
