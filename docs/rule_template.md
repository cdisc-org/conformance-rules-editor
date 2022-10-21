# Rule Template

```yml
Authority:
  Organization: ""
Check:
  ^all|any$:
    - ...
    - comparator: ""
      context: ""
      date_component: year | month | day | hour | minute | second | microsecond
      name: ""
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
Citations:
  - Cited Guidance: ""
    Document: ""
    Item: ""
    Section: ""
Core:
  Id: ""
  Version: "1"
Description: ""
Match Datasets:
  - Name: ""
    Is Relationship: true
    Keys:
      - ""
Operations:
  - domain: ""
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
    - ""
References:
  - Origin: ""
    Rule Identifier:
      Id: ""
      Version: ""
    Version: ""
  - Origin: ADaM Conformance Rules
    Rule Identifier:
      Id: ""
    Version: "4.0"
  - Origin: SDTM and SDTMIG Conformance Rules
    Rule Identifier:
      Id: ""
      Version: 1 | 2 | 3
    Version: "2.0"
  - Origin: SEND Conformance Rules
    Rule Identifier:
      Id: ""
    Version: "4.0"
Rule Type: >-
  Consistency | Data Domain Aggregation | Data Pattern and Format | Dataset
  Contents Check against Define XML and Library Metadata | Dataset Contents
  Check against Library Metadata | Dataset Metadata Check | Dataset Metadata
  Check against Define XML | Date Arithmetic | Define-XML | Domain Presence
  Check | ...
Scopes:
  Classes:
    Include:
      - All
      - Events
      - Findings
      - Findings About
      - Interventions
      - Relationship
      - Special-Purpose
      - Study Reference
      - Trial Design
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
  Datasets:
    Exclude:
      - ""
    Include:
      - ""
  Domains:
    Exclude:
      - ""
    Include:
      - ""
    include_split_datasets: true | false
  Standards:
    - Name: ""
      Version: ""
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
Severity: Error | Notice | Reject | Warning
```
