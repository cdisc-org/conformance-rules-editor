# Rule Template

```yml
Authority:
  Organization: CDISC
Check:
  all|any|not:
    - comparator:
      context:
      date_component: year|month|day|hour|minute|second|microsecond
      name:
      operator:
      order: asc|dsc
      ordering:
      prefix:
      suffix:
      target:
      value:
      value_is_literal: true
      within:
Citations:
  - Cited Guidance:
    Document: SDTM v2.0
    Item:
    Section:
Core:
  Id: CDISC.SDTMIG.CG0000
  Version: "1"
Description:
Match Datasets:
  - Keys:
      -
    Name:
    Is Relationship: true
Operations:
  - domain:
    group:
      -
    id: $
    name:
    operator: distinct|dy|extract_metadata|max|max_date|mean|min|min_date|variable_exists|variable_names|variable_value_count
Outcome:
  Message:
  Output Variables:
    -
References:
  - Origin: SDTM and SDTMIG Conformance Rules
    Rule Identifier:
      Id: CG0000
      Version: "1"
    Version: "2.0"
Rule Type:
Scopes:
  Classes:
    Exclude|Include:
      - All|Events|Findings|Findings About|Interventions|Relationship|Special-Purpose|Study Reference|Trial Design
  Domains:
    Exclude|Include|include_split_datasets:
      -
  Standards:
    - Name: SDTMIG
      Version: "3.4"
Sensitivity: Dataset|Record
Severity: Error|Notice|Reject|Warning
```
