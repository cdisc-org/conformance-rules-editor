# Understanding Scope in Rules

The `Scope` section in a rule definition is crucial as it determines which datasets the rule will be applied to. Proper configuration of this section ensures your validation rules run efficiently and accurately.

## Key Principles

### 1. Alignment Principle

The YAML Scope's Class/Domain settings should match the variables used in your Spreadsheet's Condition (G) column. This is because the Condition determines which datasets you'll iterate through initially.

```yaml
"Scope": {
    "Classes": {
        "Include": ["FINDINGS"]  # Should align with classes used in Condition column
    },
    "Domains": {
        "Include": ["LB", "VS"]  # Should align with domains used in Condition column
    }
}
```

### 2. Crosscheck Principle

Your Spreadsheet's Class (D) / Domain (E) should align with the variables found in your Rule (H) column. After finding records that match the Condition, you'll verify them against the Rule.

For example, if your Rule column references variables from the DM domain, your spreadsheet should indicate DM in the Domain column.

### 3. Split Dataset Handling

The `include_split_datasets` flag (when set to `true`) allows split datasets to be processed separately from their parent datasets. This is useful when you need to analyze split datasets independently.

### 4. Use Case Selection

The `Use_Case` field enables targeted dataset selection based on specific implementation scenarios. This is particularly important for TIG (Therapeutic Information Guidelines) v1.0, which is an integrated IG with different Use Case categories.

## Common Scope Configuration

```yaml
"Scope": {
    "Classes": {
        "Include": [
            "ALL"
        ]
    },
    "Domains": {
        "Include": [
            "ALL"
        ],
        "include_split_datasets": true
    },
    "Use_Case": "INDH"
}
```

## Use Case Functionality in TIG

The `Use_Case` field in the Scope section plays a significant role in the TIG (Therapeutic Information Guidelines) implementation. TIG v1.0 is an integrated Implementation Guide with different Use Case categories that help determine which datasets are relevant for specific validation scenarios.

### Use Case Categories

TIG v1.0 defines several key Use Case categories:
- `INDH`: Investigational New Drug Human
- `PROD`: Production/Marketing
- `NONCLIN`: Non-Clinical
- `ANALYSIS`: Analysis datasets

When a `Use_Case` is specified in a rule, the validation engine automatically selects the appropriate datasets within scope for that rule based on the specified Use Case. This functionality works similarly to how Class-based scoping identifies relevant datasets.

```yaml
"Scope": {
    "Classes": {
        "Include": ["ALL"]
    },
    "Domains": {
        "Include": ["ALL"],
        "include_split_datasets": true
    },
    "Use_Case": "INDH"  # Engine will select datasets relevant to INDH
}
```

### Implementation Details

The validation engine consults a reference mapping that defines which datasets belong to each Use Case category. This allows for more targeted validation without having to explicitly list all domains for each rule.

For rule developers:
1. Specify the appropriate `Use_Case` in your rule YAML
2. The engine will automatically filter the datasets to include only those relevant to the specified Use Case
3. This reduces the need for overly complex Scope definitions while ensuring rules apply only to relevant datasets

## Available Options

### Classes
According to the schema, the following classes are available:
- `ALL`
- `EVENTS`
- `FINDINGS`
- `FINDINGS ABOUT`
- `INTERVENTIONS`
- `RELATIONSHIP`
- `SPECIAL PURPOSE`
- `STUDY REFERENCE`
- `TRIAL DESIGN`

### Domains
The following domain options are available:
- Standard domains like `DM`, `AE`, `LB`, etc.
- Special values like `ALL`, `AP--`, `APRELSUB`, `POOLDEF`, etc.
- Split datasets using patterns like `SUPP--`, `SUPP[domain]`

### Data Structures
Alternative to Classes/Domains, you can specify data structures:
- `ALL`
- `BASIC DATA STRUCTURE`
- `DEVICE LEVEL ANALYSIS DATASET`
- `MEDICAL DEVICE BASIC DATA STRUCTURE`
- `MEDICAL DEVICE OCCURRENCE DATA STRUCTURE`
- `OCCURRENCE DATA STRUCTURE`
- `SUBJECT LEVEL ANALYSIS DATASET`
- `ADAM OTHER`

## Example Use Cases

### Example 1: Specific Class and Domain

```yaml
"Scope": {
    "Classes": {
        "Include": ["FINDINGS"]
    },
    "Domains": {
        "Include": ["LB"],
        "include_split_datasets": false
    }
}
```
This rule will only apply to the Laboratory domain (LB) within the FINDINGS class.

### Example 2: Excluding Specific Domains

```yaml
"Scope": {
    "Classes": {
        "Include": ["ALL"]
    },
    "Domains": {
        "Include": ["ALL"],
        "Exclude": ["QS", "CO"],
        "include_split_datasets": true
    }
}
```
This rule will apply to all domains except Questionnaires (QS) and Comments (CO), and will include split datasets.

### Example 3: Using Data Structures

```yaml
"Scope": {
    "Data Structures": {
        "Include": ["SUBJECT LEVEL ANALYSIS DATASET"]
    }
}
```
This rule will apply only to subject-level analysis datasets.

## Best Practices

1. **Be Specific**: Limit your scope to only the necessary datasets to improve performance.
2. **Consider Split Datasets**: Set `include_split_datasets` appropriately based on whether you need to analyze split data separately.
3. **Match Spreadsheet Logic**: Ensure your Scope aligns with the variables used in your Condition and Rule columns.
4. **Review for Completeness**: Ensure all relevant domains are included to avoid missing important validations.
5. **Leverage Use Case**: When working with TIG, specify the appropriate Use Case to automatically include the relevant datasets without having to list them individually.
6. **Understand Use Case Implications**: Be aware of which datasets are included in each Use Case category to ensure your rules will apply to all necessary data.