# Boolean Logic

## Boolean Set Operators

### all

Meaning: "and"

> ECDOSE = null and ECSTAT is null

```yaml
all:
  - name: "EXDOSE"
    operator: "empty"
  - name: "ECSTAT"
    operator: "empty"
```

### any

Meaning: "or"

> --DOSE ^= null or --DOSTOT ^= null or --DOSTXT ^= null

```yaml
any:
  - name: "--DOSE"
    operator: "non_empty"
  - name: "--DOSTOT"
    operator: "non_empty"
  - name: "--DOSTXT"
    operator: "non_empty"
```

### not

Meaning: "not" (complement)

## Boolean Algebra

For SDTM-CR, merge Conditions and Rule. They should be processed together as "and" Boolean operations. For assistance with the Boolean logic when converting SDTM-CR to a CORE rule, keep in mind [De Morgan's Laws](https://en.wikipedia.org/wiki/De_Morgan's_laws), which say

- > not (A or B) = (not A) and (not B)
- > not (A and B) = (not A) or (not B)

## Truth Values

In general, these are considered false:

- An empty string
- An empty set or array
- Zero of any numeric type
- False

## Truth Tables

- Rule ID: CG0008
- Condition:
  > --TPTREF = null
- Rule
  > --ELTM = null
- Citation:
  > The interval of time between a planned time point and a fixed reference point, represented in a standardized character format. The fixed reference point is in --TPTREF.

### empty, non_empty

CORE rule logic:

```yaml
Check:
  all:
    - name: --TPTREF
      operator: empty
    - name: --ELTM
      operator: non_empty
```

| --TPTREF               | --ELTM                 | Outcome |
| ---------------------- | ---------------------- | ------- |
| Not Present in Dataset | Not Present in Dataset | Skip    |
| Empty                  | Not Present in Dataset | Skip    |
| Not Empty              | Not Present in Dataset | Skip    |
| Not Present in Dataset | Empty                  | Skip    |
| Not Present in Dataset | Not Empty              | Skip    |
| Empty                  | Empty                  | Pass    |
| Not Empty              | Empty                  | Pass    |
| Not Empty              | Not Empty              | Pass    |
| Empty                  | Not Empty              | Fail    |

Note that another rule exists to check for the presence of --ELTM and --TPTREF:

- Rule ID: CG0092
- Condition
  > --ELTM present in dataset
- Rule
  > --TPTREF present in dataset
- Citation:
  > The description of a time point that acts as a fixed reference for a series of planned time points, used for study data tabulation. Description of the fixed reference point referred to by --ELTM, --TPTNUM, --TPT, --STINT, and --ENINT.

### exists, not_exists

CORE rule logic:

```yaml
Check:
  all:
    - name: --ELTM
      operator: exists
    - name: --TPTREF
      operator: not_exists
```

| --TPTREF               | --ELTM                 | Outcome |
| ---------------------- | ---------------------- | ------- |
| Not Present in Dataset | Not Present in Dataset | Pass    |
| Empty                  | Not Present in Dataset | Pass    |
| Not Empty              | Not Present in Dataset | Pass    |
| Not Present in Dataset | Empty                  | Fail    |
| Not Present in Dataset | Not Empty              | Fail    |
| Empty                  | Empty                  | Pass    |
| Not Empty              | Empty                  | Pass    |
| Not Empty              | Not Empty              | Pass    |
| Empty                  | Not Empty              | Pass    |

### equal_to, not_equal_to

| Operator     | --A        | --B        | Outcome      |
| ------------ | ---------- | ---------- | ------------ |
| equal_to     | "" or null | "" or null | False (Pass) |
| equal_to     | "" or null | Populated  | False (Pass) |
| equal_to     | Populated  | "" or null | False (Pass) |
| not_equal_to | "" or null | "" or null | False (Pass) |
| not_equal_to | "" or null | Populated  | True (Fail)  |
| not_equal_to | Populated  | "" or null | True (Fail)  |
