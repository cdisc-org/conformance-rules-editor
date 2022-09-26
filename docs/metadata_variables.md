# Metadata Variables

## Valid Values

- dataset_name
- dataset_label
- dataset_location
- dataset_size
- variable_name
- variable_data_type
- variable_role
- variable_size
- variable_label

## Example

> Check dataset metadata matches those in the Define.

The following verifies variable name in the datasets and those in study Define

```yaml
Rule Type: Variable Metadata Check against Define XML
Check:
    all:
    - name: "variable_name"
        operator: "not_equal_to"
        value: "define_variable_name"
```

Note: For the value key, value gets populated by the rule engine, so it can be omitted.
