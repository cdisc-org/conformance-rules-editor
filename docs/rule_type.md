# Rule Type

## Dataset Contents Check against Define XML and Library Metadata

Dependency: Define-XML

## Dataset Contents Check against Library Metadata

> Check var populated according to Permissibility.

> Permissible variable that should be dropped

> Check variable existence according to permissibility

## Dataset Metadata Check

> No records in data source

> File size too large >5GB

## Dataset Metadata Check against Define XML

Dependency: Define-XML

## Define-XML

Dependency: Define-XML

> No more than one //Study/GlobalVariables must be provided.

## Domain Presence Check

Check domain existence

## Record Data

> RACE = 'OTHER' or RACE = 'MULTIPLE' when Sponsor collects Other, specify and chooses to map the value to SUPPDM

> Coded value and its decode correlate, e.g., ARMCD and ARM, TSPARMCD and TSPARM, etc.

> On a given record, ONTRTFL is populated and ONTRTFN is not populated

> RFXSTDTC value = earliest EXSTDTC value for that subject

> The value of SEENDTC for the last Element must immediately precede or be the same as the value of DS.DSSTDTC for the subject

> ISO 8601 date/time

> ISO 8601 duration

> AGETXT's <\<number\>>-<\<number\>>

> MHENDTC < DM.RFSTDTC

> External Code Systems - MedDRA, ISO 3166, GENC

> Pregnancy test results exist only when subject’s sex not male

> No study treatment exposure records after subject timestamp's in death details

> --STAT should be NOT DONE when –REASND populated

> TSVAL between 0 and 1 where TSPARM EQ 'Randomization Quotient'

> USUBJID must exists in DM.USUBJID

> IDVAR is variable in domain = RDOMAIN

> VISIT in datasets corresponds to SV.VISIT

> Unique –SEQ

> Consistent --TEST. --TESTCD values

> Order of variables within dataset

## Value Level Metadata Check against Define XML

Dependency: Define-XML

## Variable Metadata Check

> The length of a variable name exceeds 8 characters

> A variable name does not start with a letter (A-Z)

> The length of a variable label is greater than 40 characters

> A variable name contains a character other than letters (A-Z), underscores (\_), or numerals (0-9)

> Trimming variable length

> BTOXGR is present and ABLFL is not present

> SHIFTy is present and all of the following variable pairs (BASECATy, AVALCATy), (BNRIND, ANRIND), (ByIND, AyIND), (BTOXGR, ATOXGR), (BTOXGRL, ATOXGRL), (BTOXGRH, ATOXGRH), (BASE, AVAL) and (BASEC, AVALC) are not present.

> ONTRTFN is present and ONTRTFL is not present

## Variable Metadata Check against Define XML

Dependency: Define-XML
