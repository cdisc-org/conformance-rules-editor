---
layout: default
title: Home
nav_order: 1
---

# Reference Guide

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## Rules of Thumb

1. Rules are written to flag violations, i.e., triggered on a negative case.
1. A conformance rule can be either a data rule or a business rule. A data rule is computable with elements to be checked for conformance are anchored to data, CORE-2 OPEN metadata, as well as elements and attributes in an ODM document. When a data rule is outside of the rule engine's capability, then it is not executable.

## Rule Editor

URL: https://rule-editor.cdisc.org

Access to CDISC Library account is required.

### Schema for Rule Schematic

Intellisense is informed by a schema in JSON format. The editor also uses it to provide suggestions.

Links to the schema:

- Base Schema: https://rule-editor.cdisc.org/schema/CORE-base.json

Reference: JSON schema as a standard: https://json-schema.org

### Useful Key Bindings

| Keystroke on PC | Functionality                                       |
| --------------- | --------------------------------------------------- |
| Ctrl-Space      | Trigger suggestions<br/>Plop node & attributes<br/> |
| Shift-Alt-F     | Format document                                     |

## Variable-to-Variable Check

It is similar to checking value, the variable to check against will go in to the value key. The rule engine will first check if it is a variable, if not, then the rule engine will treat it as a string. This apples to all operators. For example, to flag when --CAT is equal to --DECOD:

```yaml
all:
  - name: "--CAT"
    operator: "equal_to"
    value: "--DECOD"
```

## Integrated Examples

### Conditions & rule together as a single rule logic

```yaml
Rule Type:
  Range & Limit:
    Check:
      all:
        - name: "EXOCCUR"
          operator: "not_equal_to"
          value: "N"
        - name: "ECSTAT"
          operator: "exists"
        - name: "ECDOSTEXT"
          operator: "not_exists"
        - name: "ECDOSE"
          operator: "less_than_or_equal_to"
          value: 0
```

- Conditions: ECOCCUR ^= 'N' and ECSTAT is null and ECDOSTXT is null
- Rule: ECDOSE <= 0

### Nested Boolean logic #1

```yaml
any:
  - all:
      - name: "--PRESP"
        operator: "not_equal_to"
        value: "Y"
      - name: "--OCCUR"
        operator: "exists"
  - all:
      - name: "--STAT"
        operator: "equal_to"
        value: "NOT DONE"
```

- (--PRESP ^= 'Y' and --OCCUR is present in dataset) or (--STAT=NOT DONE)

### Nested Boolean logic #2

```yaml
any:
  - all:
      - all:
          - name: "AESER"
            operator: "not_equal_to"
            value: "Y"
      - any:
          - name: "AESCAN"
            operator: "equal_to"
            value: "Y"
          - name: "AESCONG"
            operator: "equal_to"
            value: "Y"
  - all:
      - name: "AESER"
        operator: "equal_to"
        value: "Y"
      - name: "AESCAN"
        operator: "not_equal_to"
        value: "Y"
      - name: "AESCONG"
        operator: "not_equal_to"
        value: "Y"
```

- (AESER = 'Y' and (AESCAN = 'Y' or AESCONG = 'Y')
  or # line #1 to the right represents this or operator
  (AESER = 'Y' and AESCAN ^= 'Y' and AESCONG ^= 'Y')

## Business Rule Examples

To provide a contrast to data rules, the following are some examples of business rule:

| Source            | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Remarks                                                                                                                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sdtm-cr-1-1       | Rule ID: CG0076<br/>Scope: Domain DV<br/>Rule: Event is not derived                                                                                                                                                                                                                                                                                                                                                                                                     | The focus of this conformance rule is about separation of tabulation data and analysis data. Derived protocol deviation does not belong to SDTM datasets.  Therefore, it is not a data rule.                                     |
| sdtm-cr-1-1       | Rule ID: CG0167<br/>Scope: Domain CO<br/>Rule: Comments are unsolicited, free-text and voluntary                                                                                                                                                                                                                                                                                                                                                                        | It describes the intention for the type of comments appropriate for this special purpose domain. This needs to be managed outside of the conduct of creating an SDTM study.                                                      |
| send-cr-4-0-draft | CDISC SEND Rule ID: 49<br/>Condition: CDISC published Controlled Terminology Codelist applies to a variable.<br/>Rule: The Define-XML document should properly reference the Controlled Terminology Codelist used. <br/> Plain Text Explanation: For a variable identified in the SENDIG as being subject to CDISC published Controlled Terminology, the Codelist listed in the Define-XML document should properly reference the Controlled Terminology Codelist used. | It describes a best practice to ensure the study's Define is complete and accurate. This is a typical task by data managers and EDC programmers, Business tools such as SOP can be used to train and enforce this best practice. |
| send-cr-4-0-draft | CDISC SEND Rule ID: 270.1<br/>Condition: Variable is present in a domain.<br/>Rule: Variable Name matches SDTM v1.2 AND use is consistent with SDTM v1.2 definition.<br/>Plain Text Explanation: Naming and use of variables must be consistent with the definition of the variable in the SDTM.                                                                                                                                                                        | Ensuring semantic equivalence between the source and the target SEND variable is beyond the scope of data rules.                                                                                                                 |

## YAML

### Resources

https://en.wikipedia.org/wiki/YAML
https://yaml.org/spec/1.2/spec.html

### Y/N

Y or N strings must be enclosed by quotes. If they aren't, the Schema validation will give an error. This is because YAML treats Y and N as a Boolean datatype instead of a string datatype. More details: https://yaml.org/type/bool.html
