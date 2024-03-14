# Match Datasets (Merge)

## Non pivoted relationship - unique check variable names

> Matching on MH.USUBJID = DM.USUBJID: MH.MHENDTC >= DM.RFSTDTC

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

## Non pivoted relationship - shared check variable names

> Matching on --.VISITNUM = TV.VISITNUM: --.VISITDY != TV.VISITDY

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

## Non pivoted relationship - non-matching key variable names

Allows for joining datasets with parent datasets using non-matching key variable names. The `Left` key is the name of the variable in the parent dataset and the `Right` key is the name of the variable in the dataset whose name is specified in `Name`.

> Condition: If specimen type is specified in RELSPEC and BS, the values should be the same in both datasets.

> Rule: Matching on RELSPEC.USUBJID = BS.USUBJID and RELSPEC.REFID = BS.BSREFID: RELSPEC.SPEC != BS.BSSPEC

```yaml
Check:
  all:
    - name: SPEC
      operator: not_equal_to
      value: BSSPEC
Match Datasets:
  - Name: BS
    Keys:
      - USUBJID
      - Left: REFID
        Right: BSREFID
Scope:
  Domains:
    Include:
      - RELSPEC
```

## Non pivoted relationship - left join

Allows for joining datasets with parent datasets, keeping all records from the parent dataset and only records with matching key values from the dataset whose name is specified in `Name`. `Join Type` may be `inner` or `left`. If `Join Type` is not specified, an inner join is performed (i.e., only records with matching key values in both datasets are kept).

> Condition: Extracted or aliquoted specimens should have a parent specimen identified in the RELSPEC dataset.

> Rule: Matching on BE.USUBJID = RELSPEC.USUBJID and BE.BEREFID = RELSPEC.REFID: BEDECOD in ("EXTRACTING", "ALIQUOTING") AND RELSPEC.PARENT is empty

Reports extracting/aliquoting records from BE where:

- There is a matching record in RELSPEC, but PARENT is empty
- There is no matching record in RELSPEC.

```yaml
Check:
  all:
    - any:
        - name: BEDECOD
          operator: equal_to
          value: EXTRACTING
        - name: BEDECOD
          operator: equal_to
          value: ALIQUOTING
    - name: PARENT
      operator: empty
Match Datasets:
  - Name: RELSPEC
    Keys:
      - USUBJID
      - Left: BEREFID
        Right: REFID
    Join Type: left
Scope:
  Domains:
    Include:
      - BE
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
