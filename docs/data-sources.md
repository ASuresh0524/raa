# Credentialing Data Sources

This document catalogs the primary data sources and APIs used for credentialing verification and enrollment.

## NPPES/NPI Data Sources

### NPPES Downloadable Files
- **URL**: [https://download.cms.gov/nppes/NPI_Files.html](https://download.cms.gov/nppes/NPI_Files.html)
- **Description**: NPPES NPI downloadable file with provider identity, names, addresses, taxonomy, endpoints, deactivation dates
- **Format**: CSV, XML
- **Update Frequency**: Weekly
- **Use Case**: Bulk provider data, identity verification, taxonomy mapping

### NPPES Public API
- **URL**: [https://npiregistry.cms.hhs.gov/api-page](https://npiregistry.cms.hhs.gov/api-page)
- **Description**: Real-time API for NPPES public NPI data
- **Format**: JSON
- **Rate Limits**: Public API with reasonable limits
- **Use Case**: Real-time NPI lookup and verification

### NPPES Public Registry
- **URL**: [https://npiregistry.cms.hhs.gov/](https://npiregistry.cms.hhs.gov/)
- **Description**: Public NPI registry search interface
- **Use Case**: Manual verification and testing

## Provider Taxonomy

### NUCC Taxonomy CSV
- **URL**: [https://www.nucc.org/index.php/code-sets-mainmenu-41/provider-taxonomy-mainmenu-40/csv-mainmenu-57](https://www.nucc.org/index.php/code-sets-mainmenu-41/provider-taxonomy-mainmenu-40/csv-mainmenu-57)
- **Description**: Official NUCC provider taxonomy code set as CSV with definitions
- **Format**: CSV
- **Update Frequency**: Quarterly
- **Use Case**: Taxonomy code validation and mapping

### Direct NUCC Taxonomy Link
- **URL**: [https://nucc.org/images/stories/CSV/nucc_taxonomy_231.csv](https://nucc.org/images/stories/CSV/nucc_taxonomy_231.csv)
- **Description**: Direct link to current NUCC taxonomy CSV file
- **Use Case**: Automated taxonomy updates

## Medicare Enrollment Data

### Medicare Fee-for-Service Enrollment
- **URL**: [https://data.cms.gov/provider-characteristics/medicare-provider-supplier-enrollment/medicare-fee-for-service-public-provider-enrollment](https://data.cms.gov/provider-characteristics/medicare-provider-supplier-enrollment/medicare-fee-for-service-public-provider-enrollment)
- **Description**: Medicare approval status to bill Medicare plus enrollment characteristics
- **Format**: CSV, JSON
- **Use Case**: Medicare enrollment verification, billing eligibility

### Ordering and Referring Eligibility
- **URL**: [https://data.cms.gov/provider-characteristics/medicare-provider-supplier-enrollment/order-and-referring](https://data.cms.gov/provider-characteristics/medicare-provider-supplier-enrollment/order-and-referring)
- **Description**: Medicare ordering and referring eligibility by NPI
- **Use Case**: Ordering/referring provider verification

### Opt-Out Affidavits
- **URL**: [https://data.cms.gov/provider-characteristics/medicare-provider-supplier-enrollment/opt-out-affidavits](https://data.cms.gov/provider-characteristics/medicare-provider-supplier-enrollment/opt-out-affidavits)
- **Description**: Medicare opt-out affidavits with effective dates and addresses
- **Use Case**: Opt-out status verification

### Taxonomy Crosswalk
- **URL**: [https://data.cms.gov/provider-characteristics/medicare-provider-supplier-enrollment/medicare-provider-and-supplier-taxonomy-crosswalk](https://data.cms.gov/provider-characteristics/medicare-provider-supplier-enrollment/medicare-provider-and-supplier-taxonomy-crosswalk)
- **Description**: CMS crosswalk from Medicare enrollment types to taxonomy codes
- **Use Case**: Enrollment type to taxonomy mapping

### Doctors and Clinicians Dataset
- **URL**: [https://data.cms.gov/provider-data/dataset/mj5m-pzi6](https://data.cms.gov/provider-data/dataset/mj5m-pzi6)
- **Description**: Doctors and Clinicians national downloadable file used in Medicare Care Compare with enrollment records and practice locations
- **Use Case**: Comprehensive provider enrollment and practice location data

### Historical CMS Snapshots
- **URL**: [https://www.openicpsr.org/openicpsr/project/149961](https://www.openicpsr.org/openicpsr/project/149961)
- **Description**: Archived historical CMS Doctors and Clinicians snapshots for longitudinal testing
- **Use Case**: Historical enrollment analysis and testing

## Exclusions and Sanctions

### OIG LEIE Downloadable List
- **URL**: [https://oig.hhs.gov/exclusions/exclusions_list.asp](https://oig.hhs.gov/exclusions/exclusions_list.asp)
- **Description**: OIG LEIE downloadable exclusions list for federal health care program exclusions
- **Format**: CSV, Excel
- **Update Frequency**: Monthly
- **Use Case**: Federal exclusion verification

### OIG Exclusions Search
- **URL**: [https://exclusions.oig.hhs.gov/](https://exclusions.oig.hhs.gov/)
- **Description**: OIG exclusions search interface
- **Use Case**: Manual exclusion verification

### SAM Exclusions API
- **URL**: [https://open.gsa.gov/api/exclusions-api/](https://open.gsa.gov/api/exclusions-api/)
- **Description**: SAM exclusions API for federal debarment and exclusions data
- **Format**: JSON
- **Use Case**: Federal debarment verification

### SAM Entity Extracts API
- **URL**: [https://open.gsa.gov/api/sam-entity-extracts-api/](https://open.gsa.gov/api/sam-entity-extracts-api/)
- **Description**: Bulk public exclusions extracts and related entity extracts download API
- **Use Case**: Bulk exclusion verification

## NPDB (National Practitioner Data Bank)

### NPDB Public Use Data
- **URL**: [https://www.npdb.hrsa.gov/resources/publicData.jsp](https://www.npdb.hrsa.gov/resources/publicData.jsp)
- **Description**: NPDB public use data file with deidentified malpractice payments and adverse actions including licensure and clinical privileges actions
- **Format**: CSV
- **Use Case**: Malpractice and adverse action research (deidentified)

### NPDB Analysis Tool
- **URL**: [https://www.npdb.hrsa.gov/analysistool/](https://www.npdb.hrsa.gov/analysistool/)
- **Description**: NPDB data analysis tool for exploring NPDB public use data without full downloads
- **Use Case**: NPDB data exploration

**Note**: Full NPDB queries require authorized access through the NPDB system.

## Open Payments

### Open Payments Datasets
- **URL**: [https://openpaymentsdata.cms.gov/datasets](https://openpaymentsdata.cms.gov/datasets)
- **Description**: Open Payments downloadable datasets for financial relationships between industry and clinicians
- **Format**: CSV, JSON
- **Use Case**: Financial relationship disclosure verification

### Open Payments API
- **URL**: [https://openpaymentsdata.cms.gov/about/api](https://openpaymentsdata.cms.gov/about/api)
- **Description**: Open Payments API documentation
- **Use Case**: Programmatic access to Open Payments data

## Facility Data

### Provider of Services File
- **URL**: [https://data.cms.gov/provider-characteristics/hospitals-and-other-facilities/provider-of-services-file-internet-quality-improvement-and-evaluation-system](https://data.cms.gov/provider-characteristics/hospitals-and-other-facilities/provider-of-services-file-internet-quality-improvement-and-evaluation-system)
- **Description**: Provider of Services file for facility certification and demographics for several provider types
- **Use Case**: Facility certification verification

### CLIA Clinical Laboratories
- **URL**: [https://data.cms.gov/provider-characteristics/hospitals-and-other-facilities/provider-of-services-file-clinical-laboratories](https://data.cms.gov/provider-characteristics/hospitals-and-other-facilities/provider-of-services-file-clinical-laboratories)
- **Description**: Provider of Services file for CLIA clinical laboratories
- **Use Case**: CLIA laboratory certification verification

## State Licensing Boards

### Florida DOH MQA
- **Bulk Download**: [https://data-download.mqa.flhealthsource.gov/](https://data-download.mqa.flhealthsource.gov/)
- **Data Portal**: [https://flhealthsource.gov/data-portal/](https://flhealthsource.gov/data-portal/)
- **Description**: Florida Department of Health Medical Quality Assurance bulk licensure data download portal
- **Use Case**: Florida license verification

### Washington State Provider Credentials
- **Dataset**: [https://data.wa.gov/Health/Health-Care-Provider-Credential-Data/qxh8-f4bd](https://data.wa.gov/Health/Health-Care-Provider-Credential-Data/qxh8-f4bd)
- **Search**: [https://doh.wa.gov/licenses-permits-and-certificates/provider-credential-or-facility-search](https://doh.wa.gov/licenses-permits-and-certificates/provider-credential-or-facility-search)
- **Description**: Washington state bulk provider credential dataset including status and credential details
- **Use Case**: Washington license verification

### California DCA
- **API Catalog**: [https://iservices.dca.ca.gov/docs](https://iservices.dca.ca.gov/docs)
- **Search API**: [https://iservices.dca.ca.gov/docs/search](https://iservices.dca.ca.gov/docs/search)
- **Search Site**: [https://search.dca.ca.gov/](https://search.dca.ca.gov/)
- **Description**: California Department of Consumer Affairs iServices API and search interface
- **Use Case**: California license verification

### State License Directory
- **URL**: [https://projects.propublica.org/graphics/investigating-doctors](https://projects.propublica.org/graphics/investigating-doctors)
- **Description**: Directory of how to find physician license and discipline info across states
- **Use Case**: Reference guide for state-specific verification processes

## Research and Crosswalks

### NBER NPPES Data
- **URL**: [https://www.nber.org/research/data/national-plan-and-provider-enumeration-system-nppesnpi](https://www.nber.org/research/data/national-plan-and-provider-enumeration-system-nppesnpi)
- **Description**: NBER cleaned NPPES plus multiple crosswalks and reshaped files for modeling
- **Use Case**: Research and data analysis

### NPI to State License Crosswalk
- **URL**: [https://www.nber.org/research/data/national-provider-identifier-npi-state-license-crosswalk](https://www.nber.org/research/data/national-provider-identifier-npi-state-license-crosswalk)
- **Description**: NBER NPI to state license crosswalk derived from NPPES license fields
- **Use Case**: NPI to license number mapping

### NPI to UPIN Crosswalk
- **URL**: [https://www.nber.org/research/data/national-provider-identifier-npi-unique-physician-identification-number-upin-crosswalk](https://www.nber.org/research/data/national-provider-identifier-npi-unique-physician-identification-number-upin-crosswalk)
- **Description**: NBER NPI to UPIN crosswalk for older Medicare linkage
- **Use Case**: Historical Medicare provider identification

## Medicare Utilization Data

### Medicare Physician Utilization
- **URL**: [https://data.cms.gov/provider-summary-by-type-of-service/medicare-physician-other-practitioners](https://data.cms.gov/provider-summary-by-type-of-service/medicare-physician-other-practitioners)
- **Description**: Medicare utilization and payment datasets by provider and service
- **Use Case**: Provider activity verification

### Medicare Part D Prescribers
- **URL**: [https://data.cms.gov/resources/medicare-part-d-prescribers-by-provider-and-drug-data-dictionary](https://data.cms.gov/resources/medicare-part-d-prescribers-by-provider-and-drug-data-dictionary)
- **Description**: Medicare Part D prescriber dataset documentation for prescribing activity signals
- **Use Case**: Prescribing activity verification

## CMS Enrollment Forms

### Enrollment Applications Hub
- **URL**: [https://www.cms.gov/medicare/enrollment-renewal/providers-suppliers/chain-ownership-system-pecos/enrollment-applications](https://www.cms.gov/medicare/enrollment-renewal/providers-suppliers/chain-ownership-system-pecos/enrollment-applications)
- **Description**: CMS enrollment applications hub with required companion forms
- **Use Case**: Enrollment form reference

### CMS Forms
- **CMS 855I**: [https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms855i.pdf](https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms855i.pdf) - Individual practitioners
- **CMS 855O**: [https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms855o.pdf](https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms855o.pdf) - Ordering and certifying only
- **CMS 855A**: [https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms855a.pdf](https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms855a.pdf) - Institutional providers
- **CMS 855B**: [https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms855b.pdf](https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms855b.pdf) - Clinics and group practices
- **CMS 855S**: [https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms855s.pdf](https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms855s.pdf) - DMEPOS suppliers
- **CMS 588**: [https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms588.pdf](https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms588.pdf) - EFT authorization agreement
- **CMS 460**: [https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms460.pdf](https://www.cms.gov/medicare/cms-forms/cms-forms/downloads/cms460.pdf) - Medicare participation agreement

## Integration Notes

### API Authentication
- Most CMS data sources are publicly available without authentication
- Some APIs may require registration for higher rate limits
- State licensing board APIs may require API keys or special access

### Rate Limits
- Public APIs typically have rate limits (check documentation)
- Bulk downloads are preferred for large-scale operations
- Implement caching strategies for frequently accessed data

### Data Updates
- NPPES: Weekly updates
- OIG LEIE: Monthly updates
- State licensing: Varies by state (daily to monthly)
- CMS enrollment: Real-time to daily depending on source

### Compliance
- Ensure HIPAA compliance when handling provider data
- Follow data use agreements for each source
- Maintain audit trails for all data access

