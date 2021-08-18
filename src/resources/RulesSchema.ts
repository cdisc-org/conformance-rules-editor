const rulesSchema =
{
    "id": "https://cdisc.org/rules/1-0",

    "$defs": {
        "Classes": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": ["All", "Events", "Findings", "Findings About", "General Observations", "Interventions", "Relationship", "Special-Purpose", "Study Reference", "Trial Design"]
            }
        },
        "Domains": {
            "type": "array",
            "items": {
                "type": "string",
                "pattern": "^(All|[A-Z]{2})$"
            }
        }
    },

    "type": "object",
    "additionalProperties": false,
    "description": "Validation schema CDISC Rules 1.0",
    "required": ["CoreId", "Version", "Authority", "Reference", "Description", "Sensitivity", "Scopes", "Rule Type", "Outcome", "Citations"],
    "properties": {
        "CoreId": {
            "type": "string"
        },
        "Version": {
            "type": "string",
            "enum": ["1"]
        },
        "Authority": {
            "type": "object",
            "additionalProperties": false,
            "required": ["Organization"],
            "properties": {
                "Organization": {
                    "type": "string",
                    "enum": ["CDISC"]
                }
            }
        },
        "Reference": {
            "type": "object",
            "additionalProperties": false,
            "required": ["Origin", "Version", "Id"],
            "properties": {
                "Origin": { "type": "string" },
                "Version": { "type": "string" },
                "Id": { "type": "string" }
            }
        },
        "Description": {
            "type": "string"
        },
        "Sensitivity": {
            "type": "string",
            "enum": ["Study", "Class", "Domain", "Dataset", "Variable", "Code_list", "Term", "Record", "Value"]
        },
        "Scopes": {
            "type": "object",
            "additionalProperties": false,
            "required": ["Standards", "Classes", "Domains"],
            "properties": {
                "Standards": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": false,
                        "required": ["Name", "Version"],
                        "properties": {
                            "Name": { "type": "string" },
                            "Version": { "type": "string" }
                        }
                    }
                },
                "Classes": {
                    "oneOf": [
                        {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Include"],
                            "properties": {
                                "Include": { "$ref": "#/$defs/Classes" }
                            }
                        },
                        {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Exclude"],
                            "properties": {
                                "Exclude": { "$ref": "#/$defs/Classes" }
                            }
                        }
                    ]
                },
                "Domains": {
                    "oneOf": [
                        {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Include"],
                            "properties": {
                                "Include": { "$ref": "#/$defs/Domains" }
                            }
                        },
                        {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Exclude"],
                            "properties": {
                                "Exclude": { "$ref": "#/$defs/Domains" }
                            }
                        }
                    ]
                },
            }
        },
        "Rule Type": {
            "oneOf": [
                {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["Value Presence"],
                    "properties": {
                        "Value Presence": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Check"],
                            "properties": {
                                "Check": { "type": "string" }
                            }
                        }
                    }
                },
                {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["Variable Presence"],
                    "properties": {
                        "Variable Presence": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Check"],
                            "properties": {
                                "Check": { "type": "string" }
                            }
                        }
                    }
                },
                {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["Data pattern and format"],
                    "properties": {
                        "Data pattern and format": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Check"],
                            "properties": {
                                "Check": { "type": "string" }
                            }
                        }
                    }
                },
                {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["Value domain"],
                    "properties": {
                        "Value domain": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Check"],
                            "properties": {
                                "Check": { "type": "string" }
                            }
                        }
                    }
                },
                {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["External dictionaries"],
                    "properties": {
                        "External dictionaries": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Check"],
                            "properties": {
                                "Check": { "type": "string" }
                            }
                        }
                    }
                },
                {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["Referential integrity"],
                    "properties": {
                        "Referential integrity": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Check"],
                            "properties": {
                                "Check": { "type": "string" }
                            }
                        }
                    }
                },
                {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["Metadata"],
                    "properties": {
                        "Metadata": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Check"],
                            "properties": {
                                "Check": { "type": "string" }
                            }
                        }
                    }
                },
                {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["Consistency"],
                    "properties": {
                        "Consistency": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Check"],
                            "properties": {
                                "Check": { "type": "string" }
                            }
                        }
                    }
                },
                {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["Range and limit"],
                    "properties": {
                        "Range and limit": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Check"],
                            "properties": {
                                "Check": { "type": "string" }
                            }
                        }
                    }
                },
                {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["Date/time arithmetic"],
                    "properties": {
                        "Date/time arithmetic": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Check"],
                            "properties": {
                                "Check": { "type": "string" }
                            }
                        }
                    }
                },
                {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["Data domain aggregation"],
                    "properties": {
                        "Data domain aggregation": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Check", "Aggregation", "Group By"],
                            "properties": {
                                "Check": { "type": "string" },
                                "Aggregation": { "type": "string" },
                                "Group By": { "type": "string" }
                            }
                        }
                    }
                },
                {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["Dataset property"],
                    "properties": {
                        "Dataset property": {
                            "type": "object",
                            "additionalProperties": false,
                            "required": ["Check"],
                            "properties": {
                                "Check": { "type": "string" }
                            }
                        }
                    }
                },
            ]
        },
        "Outcome": {
            "type": "object",
            "additionalProperties": false,
            "required": ["Message"],
            "properties": {
                "Message": { "type": "string" }
            }
        },
        "Citations": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": false,
                "required": ["Document", "Section", "Cited Guidance"],
                "properties": {
                    "Document": { "type": "string" },
                    "Section": { "type": "string" },
                    "Cited Guidance": { "type": "string" }
                }
            }
        }
    }
};

export default rulesSchema;