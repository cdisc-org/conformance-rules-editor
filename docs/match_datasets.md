# Match Datasets (Merge)

## Non pivoted relationship - unique variable names

> MH.MHENDTC >= DM.RFSTDTC

```yaml
Rule Type: Date Arithmetic
Check:
  all:
    - name: MHENDTC
      operator: date_greater_than_or_equal_to
      value: RFSTDTC
Match Datasets:
  - Name: DM
    Keys:
      - USUBJID
```

## Non pivoted relationship - shared variable names

> --.VISITDY != TV.VISITDY

```yaml
Check:
  all:
    - name: VISITDY
      operator: not_equal_to
      value: TV.VISITDY
Match Datasets:
  - Name: TV
    Keys:
      - VISITNUM
```

## Pivoted (Supp/VL) relationship

> Record present in SUPPAE where SUPPAE.QNAM=AESOSP and AESMIE != 'Y'

```yaml
Check:
  all:
    - name: QNAM
      operator: equal_to
      value: AESOSP
    - any:
        - name: AESMIE
          operator: not_exists
        - name: AESMIE
          operator: not_equal_to
          value: Y
Match Datasets:
  - Name: SUPPAE
    Keys:
      - USUBJID
    Is Relationship: Y
```

## RELREC Relationship

Allows for joining datasets with parent datasets using conditions specified in RELREC dataset

> Condition: Related record present in parent domain dataset

> Rule: FAOBJ in (--TERM, --TRT, --DECOD)

```yaml
Check:
  all:
    - name: FAOBJ
      operator: not_equal_to
      value: RELREC.__TERM
    - name: FAOBJ
      operator: not_equal_to
      value: RELREC.__TRT
    - name: FAOBJ
      operator: not_equal_to
      value: RELREC.__DECOD
Match Datasets:
  - Name: RELREC
    Wildcard: __
Outcome:
  Message:
    Related record is present in the parent domain dataset and FAOBJ is not
    in (--TERM, --TRT, --DECOD)
  Output Variables:
    - FAOBJ
    - RELREC.__TERM
    - RELREC.__TRT
    - RELREC.__DECOD
Rule Type: Record Data
Scope:
  Classes:
    Include:
      - FINDINGS
  Domains:
    Include:
      - FA
```
