const rule1 = `
CoreId: Rule271828
Version: "1"
Authority:
    Organization: CDISC
Reference:
    Origin: SDTM Conformance Rules
    Version: "1.1"
    Id: CG0082
Description: Verify...
Sensitivity: Record
Scopes:
    Standards:
    - Name: SDTMIG
      Version: "3.3"
    - Name: SDTMIG
      Version: "3.4"
    Classes:
        Include:
        - Events
        - Findings
    Domains:
        Include:
        - All
Rule Type:
    Value Presence:
        Conditions: --BODSYS IS NULL
        Check: --BDSYCD IS NOT NULL
Outcome:
    Message: --BDSYCD is populated when --BODSYS is null
Citations:
    - Document: SDTM v1.4
      Section: 2.2.2
      Cited Guidance: Variable Qualifier of --BODSYS
`;

const rule2 = `
CoreId: Rule2
Version: 1
Authority:
    Organization: CDISC
Reference:
    Origin: SDTM Conformance Rules
    Version: 1.1
    Id: CG0082
Description: Verify...
Sensitivity: Record
Scopes:
    Standards:
    - Name: SDTMIG
        Version: 3.3
    - Name: SDTMIG
        Version: 3.4
    Classes:
    Include:
        - Events
        - Findings
    Domains:
Rule Type:
    Value Presence:
    Conditions: --BODSYS IS NULL
    Check: --BDSYCD IS NOT NULL
Outcome:
    Message: --BDSYCD is populated when --BODSYS is null
Citations:
    - Document: SDTM v1.4
    Section: 2.2.2
    Cited Guidance: Variable Qualifier of --BODSYS
`;

const rule3 = `
CoreId: Rule3
Version: 1
Authority:
    Organization: CDISC
Reference:
    Origin: SDTM Conformance Rules
    Version: 1.1
    Id: CG0082
Description: Verify...
Sensitivity: Record
Scopes:
    Standards:
    - Name: SDTMIG
        Version: 3.3
    - Name: SDTMIG
        Version: 3.4
    Classes:
    Include:
        - Events
        - Findings
    Domains:
Rule Type:
    Value Presence:
    Conditions: --BODSYS IS NULL
    Check: --BDSYCD IS NOT NULL
Outcome:
    Message: --BDSYCD is populated when --BODSYS is null
Citations:
    - Document: SDTM v1.4
    Section: 2.2.2
    Cited Guidance: Variable Qualifier of --BODSYS
`;

const testRules = {
    "rule1.yaml": {
        name: "rule1.yaml",
        value: rule1
    },
    "rule2.yaml": {
        name: "rule2.yaml",
        value: rule2
    },
    "rule3.yaml": {
        name: "rule3.yaml",
        value: rule3
    },
};

export default testRules;
