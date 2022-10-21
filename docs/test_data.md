# Test Data

## Preparation

### Assumptions

- CORE MVP 1.0 must support SAS V5 XPT data sets. Other formats such as CSV, Dataset-XML, etc. are a nice-to-haves.
- Many volunteer contributors do not have the ability to create SAS V5 XPT files, easily and quickly.
- An Excel approach is very similar to creating data examples in the wiki.
- A well-templated Excel adds consistency and reduces fatigue.
- Volunteer contributors could also use unit testing for debugging rule logic.
- Unit test includes both positive and negative tests.
- Unit test will be conducted per CORE rule. Test data will be relatively small, just enough data points to assert correctness.
- Existing mock studies in SDTM format are a valuable resource.
- Volunteer contributors will receive a report for each run of unit test.

### Not Covered

This proposal does not cover these topics:

- Define-XML generation.
- Unit test execution.

### Proposal

- Volunteer contributors will use Excel to create test data, such that:
  - There will be at least one set for positive test.
  - At least another for negative test will be created.
  - One Excel workbook will be created per set.
- Because we want to simulate SAS V5 XPT, the Excel workbook will contain:
  - A worksheet for dataset metadata.
  - One worksheet for each dataset, with both variable metadata and data.
- To ensure consistency and reduce fatigue, volunteer contributors will have access to a well-templated Excel workbook to jumpstart:
  - The Dataset worksheet will contain all domains modeled in SDTMIG v3.4, with:
    - Dataset filename (e.g., ae.xpt)
    - Dataset label (e.g., Adverse Events)
  - There will be one worksheet per SDTMIG v3.4 domain, fitted with:
    - Variable name (e.g., AETERM)
    - Variable label (e.g., Reported Term for the Adverse Event)
    - Data type (i.e., Char or Num)
    - Default variable length (i.e., 50 for Char, 8 for Num)
  - These will also be included to maximize customization:
    - A list of Identifiers and Timing variables from SDTM v2.0.
    - A list of Events, Interventions, and Findings class variables from SDTM v2.0.
- Volunteer contributors will use the information available to instantiate test data, such that:
  - A test dataset can be a copied from a templated worksheet.
  - Worksheet can be renamed to match the dataset metadata.
  - Test data can be inserted as data rows to the copied worksheet.
  - Unused variables can be removed.
  - Variable metadata can be modified in accordance to test purpose of the associated rule logic.
  - Dataset metadata can be modified in accordance to test purpose of the associated rule logic.
  - Mock study data will be available to volunteer contributors to easily borrow (i.e., copy and paste) as test data.

### Templates

With the information given above, attached here is a mock of the well-templated Excel workbook. It contains all class variables and domains and, such that:

- The Dataset worksheet contains a list of datasets can be used for unit testing.
- The Identifier, Events, Interventions, Findings, Timing, and Associated Persons worksheets are variables from SDTM v2.0.
- The \*.xpt worksheets contain domain metadata from SDTMIG v3.4, as well as AC, APRELSUB, DI, and TX from SDTM v2.0.

[unit-test-sdtmig-3-4-template.xlsx](files/unit-test-sdtmig-3-4-template.xlsx ":ignore")

Also, here is a mock Excel workbook for positive testing against a fictitious CORE rule Id 12345, using:

- dm.xpt and ae.xpt.
- Both with variable metadata adjusted, unused columns removed, data rows added.

[unit-test-coreid-12345-positive.xlsx](files/unit-test-coreid-12345-positive.xlsx ":ignore")

CDISC has 2 sets of mock study in SDTM format. They have been converted into Excel format, which can be tailored for unit test data.

- [CDISCTestData-sdtm-xpt-xlsx.zip](files/CDISCTestData-sdtm-xpt-xlsx.zip ":ignore") A set of test data files transformed from the CDISCTestData Github repo, sourced from /SDTM/XPT. Per Read Me, this mock study implements "SDTM IG Version 3.2."
- [sdtm-msg-2-0-m5-datasets-xlsx.zip](files/sdtm-msg-2-0-m5-datasets-xlsx.zip ":ignore") A set of test data files transformed from the example submission bundled in the SDTM MSG v2.0, sourced from /m5/datasets/cdiscpilot01/tabulations/sdtm, as well as the split subdirectory. Per documentation, this example submission implements "SDTM v1.7/SDTMIG v3.3, and SDTM Terminology 2020-03-27."

## Storage

### Assumptions

- 1000 is an estimate of # of rules volunteer contributors will create.
- Each rule will have file artifacts, such as SAS, Excel, and XML files.
- Main purpose for these file artifacts is to support unit testing. Secondary purpose is to support regression test.
- Unit testing will need both data for positive test & negative test, which each volunteer contributors is responsible to create & maintain.
- Each test may require 1:n files.
- Each rule may require 1:n positive & negative tests.
- Each test run will have a validate report as a result, which each rule author is responsible to save.
- Conceptually, this requires some deep folder structure, e.g., [Rule Id] > Unit Test > Positive > [#] > files

### Proposal

CDISC SharePoint will be used for storage:

- Has precedent use case, e.g., CDISC Interchange speakers from different organizations to add & update presentation materials.
- Supports drag-and-drops.
- File versioning is a built-in functionality, behind the scene, without user interventions.
- For occasional permissioning issues when SharePoint is confused due to crossing organizations, volunteer contributors can receive support from either CDISC I.T. or Jira project for CORE.

Other platforms considered:

- CDISC Confluence wiki: Could be unwieldy given the anticipating volume of test artifacts; folder structure not supported.
- Github or Azure DevOps: Could be very intimating for volunteer contributors who are not familiar with git repos; yet another tool to learn.

### Sharepoint Site

[CORE Rules test data (permission required)](https://cdisc.sharepoint.com/sites/CORERules/Shared%20Documents/Forms/AllItems.aspx)

### Local OneDrive Access

It is recommended that you use OneDrive for the CORE Rules test data. This will allow you the ability to:

- edit test files on your local desktop without the need to upload or edit within the browser
- load test files in the CORE Editor by browsing to the Excel files without the need to download files from Sharepoint

There are two options for accessing the Sharepoint files from OneDrive. The choice is personal preference, but Sharepoint allows you to only do one or the other.

- [Sync Sharepoint site](https://support.microsoft.com/en-us/office/sync-sharepoint-files-and-folders-87a96948-4dd7-43e4-aca1-53f3e18bea9b)
- [Add shortcut to OneDrive](https://support.microsoft.com/en-us/office/add-shortcuts-to-shared-folders-in-onedrive-for-work-or-school-d66b1347-99b7-4470-9360-ffc048d35a33)
