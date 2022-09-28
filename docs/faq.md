# FAQ

<details><summary>When must I use quotes? To quote or not to quote...?</summary>

Value (scalar) to the right of the colon character that separates the key-value pair can be string, integer, float, or Boolean.

- If the value looks numeric, the processor will treat it as such. No quotes needed in this case.
- If the value looks numeric and _should be a string_, then add quotes. A good example is Version. Due to variations in version notation, the Version attribute is text. E.g., `Version: "1.0"`; `Version: "1.0.1"`; `Version: "3.1.3 Amendment 1"`.

Some symbols have special meaning, e.g., colon is a separator between key and value. Add single quotes around the entire string so to treat these symbols as literal:

```yaml
single quoted:
  - "& starts with a special character, needs quotes"
  - "to express one single quote, use '' two of them"
  - "colon : has special meaning"
however:
  - this \ backslash also does not need to be escaped or quoted
  - just like the " double quote
```

Certain times double quotes can be more useful than single quotes:

```yaml
double quoted:
  - 'the double quote " needs to be escaped'
  - "just like the \\ backslash"
  - "the single quote ' and other characters must not be escaped"
```

In summary, while most strings should be left unquoted, quotes are required for these cases:

- The string starts with a special character: One of ` !#%@&\*``?|>{[- `
- The string starts or ends with whitespace characters.
- The string contains `:` or `#` character sequences.
- The string contains a colon.
- The value looks like a number or Boolean ( `123`, `1.23`, `true`, `false`, `null`, `Y`, `N` ) but should be a string.

</details>

<details>
<summary>How do I make long string more readable? The string is too long...</summary>

Some strings may overrun the browser display area.

```yaml
Long Text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas fringilla felis eu justo varius, eleifend sodales neque tempor. Praesent ac imperdiet lectus. Vestibulum id aliquet leo, nec molestie lorem. Proin erat elit, ullamcorper in consequat sed, scelerisque quis felis.
```

Use the `>-` (i.e., a greater than symbol, followed by a dash) and manually break a long string into multiple lines. The result is one line, i.e., the processor will not insert line breaks. Each line break will be converted to a whitespace.

```yaml
Long Text: >-
  Lorem ipsum dolor sit amet, consectetur
  adipiscing elit. Maecenas fringilla felis
  eu justo varius, eleifend sodales neque tempor.
  Praesent ac imperdiet lectus. Vestibulum id aliquet
  leo, nec molestie lorem. Proin erat elit, ullamcorper
  in consequat sed, scelerisque quis felis.
```

</details>

<details><summary>
How do I preserve multi-line strings? Desire formatted text...
</summary>

Sometimes strings need to be formatted as-is. For example:

```
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed id sapien placerat, porttitor turpis quis, tristique lorem.
  Morbi sit amet nibh eu lectus dictum accumsan.
  Quisque id diam euismod, tempus enim eu, volutpat sem.

Vivamus eget lorem vel sapien posuere ornare non at mi.
  Nunc quis eros a justo vulputate malesuada vel id leo.
```

Use the `|-` (i.e., a pipe character, followed by a dash) and format the text as desired:

```yaml
Formatted Text: |-
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Sed id sapien placerat, porttitor turpis quis, tristique lorem.
    Morbi sit amet nibh eu lectus dictum accumsan.
    Quisque id diam euismod, tempus enim eu, volutpat sem.

  Vivamus eget lorem vel sapien posuere ornare non at mi.
    Nunc quis eros a justo vulputate malesuada vel id leo.
```

</details>

<details><summary>
 When and why do I indent?
</summary>

Each indent introduces a new block. Each block is a leaf to the node it precedes. This creates a hierarchical data structure.

```yaml
A flat node: Integer eleifend eros id dolor scelerisque congue.

A node with one leaf:
  A leaf: Aenean commodo mi ut felis vehicula, sit amet venenatis risus pretium.

A node with 2 leaves:
  Leaf 1: Curabitur accumsan enim ac lorem imperdiet eleifend.
  Leaf 2: Cras venenatis leo quis pharetra egestas.

A node with multiple generations:
  Generation 1:
    A leaf: Phasellus nec tellus nec odio molestie sagittis.

    Generation 2:
      A deeper leaf: Sed laoreet tellus nec mattis ultrices.
```

Note that, no two nodes or leaves shall have the same name. For example, these are invalid:

```yaml
Same node: Curabitur mollis turpis id venenatis iaculis.
Same node: Ut vitae libero id massa vehicula feugiat vel sed risus.

A node with 2 leaves:
  Same leaf: Curabitur accumsan enim ac lorem imperdiet eleifend.
  Same leaf: Cras venenatis leo quis pharetra egestas.
```

</details>

<details><summary>
How do I include multiple domains? List of domains in scope...
</summary>

Some rules include a list of domains. For example, CG0377's scope focuses on Events domains AE, MH, and CE:

| Rule ID | SDTMIG Version | Rule Version | Class | Domain         |
| ------- | -------------- | ------------ | ----- | -------------- |
| CG0377  | 3.4            | 1            | EVT   | AE, MH, and CE |

Use the `-` (i.e., dash) to enumerate each list member:

```yaml
Scopes:
  Classes:
    Include:
      - Events
  Domains:
    Include:
      - AE
      - MH
      - CE
```

</details>

<details><summary>
 How do I exclude multiple domains? List of domains out of scope...
</summary>

Some rules exclude a list of domains. For example, CG0086's scope focuses on Events and Interventions domains other than AE, DS, DV, and EX:

| Rule ID | SDTMIG Version | Rule Version | Class    | Domain              |
| ------- | -------------- | ------------ | -------- | ------------------- |
| CG0086  | 3.4            | 1            | EVT, INT | NOT(AE, DS, DV, EX) |

Use the `-` (i.e., dash) to enumerate each list member:

```yaml
Scopes:
  Classes:
    Include:
      - Events
      - Interventions
  Domains:
    Exclude:
      - AE
      - DS
      - DV
      - EX
```

</details>

<details><summary>
 How do I cite multiple sources? Citation, citation, citation...
</summary>

Some rules have multiple citations. For example, Excerpt from the SDTM and SDTMIG Conformance Rules Development and Documentation Guide:

> If multiple {documents, sections, items, guidance citations} are identified, each will be listed, separated by "|".

| Rule ID | Document            | Section                        | Item                                                                                                                                                                                                                                                                                              | Cited Guidance                                                                                                |
| ------- | ------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| CG0037  | IG v3.4\|Model v2.0 | Events Specification\|--BDSYCD | IG v3.4[6.2.1][specification][Dictionary derived. Code for the body system or organ class used by the sponsor. When using a multi-axial dictionary such as MedDRA, this should contain the SOC used for the sponsor's analyses and summary tables, which may not necessarily be the primary SOC.] | Model v2.0[Events][--bdsycd][MedDRA System Organ Class code corresponding to --BODSYS assigned for analysis.] |

Use the `-` (i.e., dash) to enumerate each set of key-value pairs:

```yaml
Citations:
  - Document: SDTMIG v3.4
    Section: Events
    Item: Specification 6.2.1
    Cited Guidance: >-
    Dictionary derived. Code for the body system or organ class used by the sponsor.
    When using a multi-axial dictionary such as MedDRA, this should contain the SOC
    used for the sponsor's analyses and summary tables, which may not necessarily be the primary SOC.
  - Document: SDTM v2.0
    Section: Events
    Item: --BDSYCD
    Cited Guidance: MedDRA System Organ Class code corresponding to --BODSYS assigned for analysis.
```

</details>

<details><summary>
Why are my rule test results only showing a failure for the first rule violation per dataset?
</summary>

You may have set the Rule's `Sensitivity` incorrectly. Refer to [Sensitivity](sensitivity.md) for more details.

</details>

<details><summary>
Why are my rule test results only showing a single rule violation per row even though multiple variables have rule violations?
</summary>

When you use an `any` condition, the rule engine will only show a rule violation when the first item in that condition violates a rule. This is normal expected behavior. Even though there is only one violation reported, the error message should still indicate the values for all variables involved in the check.

For example, given the following rule:

```yaml
any:
  - name: --SEV
    operator: is_empty
  - name: --SHOSP
    operator: is_empty
```

If you provide a dataset AE where both AESEV and AESHOSP have empty values in a record, this rule will only flag a single error for that record, but it will display the empty values for both variables.

</details>

<details><summary>
My test data dates are being treated as numbers or the engine is returning errors indicating that my dates cannot be parsed.
</summary>

When using Excel for data, one of the tradeoffs is that it tries to autoformat. If Excel recognizes a date, it will convert it to a numeric representation of the date and display it formatted. When the Rule Editor loads the date cell, it loads the number instead of the original text string date. You can confirm this by viewing the loaded test data section in the “Load Datasets” panel of the Rule Editor and checking if the date values are numbers instead of character strings.

To fix this issue, you can force transparency by [formatting the cells in your spreadsheet as "text"](https://support.microsoft.com/en-us/office/format-numbers-as-text-583160db-936b-4e52-bdff-6f1863518ba4).

</details>
