# Extending NocoDB with features of relevance for humanitarian use cases

## What is this about? 
This repository is a fork of NocoDB, a phantastic Open Source Airtable clone (please see [NocoDB's repository](https://github.com/nocodb/nocodb) and [website](https://nocodb.com/) for more information). 

In winter 2022/2023 we ([@flisowna](https://github.com/flisowna) and [@spaudanjo](https://github.com/spaudanjo)) had the pleasure to work on prototyping and actual implementing certain features to NocoDB - features that we consider as relevant not only, but especially for the domain of humanitarian aid and NGO work. 

This was possible because of the support of a scholarship called [Prototypefund](https://prototypefund.de/) we got granted from the Federal [Ministry of Education and Research (BMBF)](https://www.bmbf.de), with strong involvement of the [Open Knowledge Foundation](https://okfn.de) and the [DLR (German Aerospace Center)](http://dlr.de/). 
Find more information about the Prototypefund funding program and how to apply [here](https://prototypefund.de/). 

Since our goal was to directly contribute to the official main repository as much as possible instead of maintaining the developed and prototyped features in a permanent fork with the additional features, the  purpose of this forked repository is focused on: 
* very short high-level documentation of our contributions and how it could be used by NGOs and other actors/users
* hosting the branches of those prototyped features that didn't make it yet into NocoDB's main repository (e.g. a PDF export POC)
* acting as our issue board for organizing our work during the project phase, without interfering with the issues of the official repository


## Sponsors

This project was funded by the German Federal Ministry of Education and Research (BMBF). Read more here (German only):

[Erweiterung einer No-Code-Plattform für humanitäre Krisenreaktionen](https://prototypefund.de/project/erweiterung-einer-no-code-plattform-fuer-humanitaere-krisenreaktionen/)

![BMBF logo](docs/bmbf.jpg)

## Motivation and background of the project
A lot of critical humanitarian aid is often provided at the beginning of crises by spontaneous helpers who quickly organize themselves on site. 

However, there is often a lack of effective, digital, and freely accessible tools that are flexible enough to, for example, organize logistical processes or the registration of people in need of help and helpers individually, efficiently, and in compliance with data protection regulations. Classically, most digital solutions require programming services or rely on paid applications. 

This can make it difficult for rapid emergency aid to transition to a sustainable, long-term operating mode for organizations. 

Quick and free access to digital organizational tools can make a significant, positive difference in the speed, effectiveness, and sustainability of humanitarian work. 
Some No Code platforms are already addressing this issue, but there is still a lot of room to grow, also in the open-source area. 
We identified some features that we wanted to add to the already very established platform NocoDB (see feature details below). 

Thus, the main goal of our project was to make Open Source Nocode tools like NocoDB even more interesting for NGOs, as an option to quickly test, deploy, and adapt critical applications without commissioning their own developers - which is especially in crisis situations often a scarce resource. 

## Added features
We were focusing on the following two primary feature clusters: 
* QR code and Barcode support: Implementing a new column type for QR-codes and Barcodes and a scanner that is directly integrated into the application (example use case in the humanitarian domain: logistics of aid supplies, registration of helpers/refugees in reception centers).
* Interactive geographic maps and a dedicated data type for geographic data (example use case: geographic representation of the requests for aid supplies in a crisis region).

Additionally, we also worked on 
* making NocoDB more mobile friendly - which is an important pre-condition for use cases that are related to the QR/Barcode scanner
* a prototype for exporting table rows as PDF (also relevant to the QR Code feature since it would allow the easy printing of paper based labels e.g. for logistic aspects of aid delivery)

## Use Case examples

To make these features more tangible, as well as giving a good impression of what NocoDB in general is already capable of, let's walk through two use cases which are simplified (and only use fake data, including the geographical positions), but are based on actual cases from the humanitarian domain that we encountered in the context of the Russian attack on Ukraine. 

### Scenario 1: Capturing the demand for humanitarian aid supplies and logistical processing.
This concerns the provision of supplies to people in crisis areas who are currently unable to leave their current location, but also temporarily have no access to sometimes vital goods. From the perspective of the assisting actors/organizations, the process can be roughly divided into two phases: 1) capturing the demand 2) logistical processing to fulfill the demand.


#### Phase 1: Capturing the demand through easily fillable order forms.

With NocoDB, a corresponding table structure can be defined within a few minutes, which captures the relevant information for an order (request for aid supplies, for example by a family in the crisis region).

<img src="demo-screenrecordings/AidDelivery_1.gif" alt="..." />

Based on this structure, a corresponding form can also be created within a few minutes, which can then be publicly shared via an URL.

<img src="demo-screenrecordings/AidDelivery_2.gif" alt="..." />

The first of the new functions we implemented is the new column type 'Geodata', which stores geographic positions - in this case the location of the people who need the aid supplies - as latitude and longitude. 

This geoposition can also be easily determined automatically based on the GPS information of the mobile device when filling out the form.

<img src="demo-screenrecordings/AidDelivery_3.gif" alt="..." />

The form data of the orders made by the affected people are immediately stored in the table in NocoDB and can now be edited, sorted, filtered, and displayed in different view types as desired.

To obtain a quick geographical overview, for example, of all previously made and all not yet delivered orders, users can now create a corresponding map view within seconds - this is the second new function (Map Viewtype). This view type also supports filtering of the data points to be displayed. When clicking on one of the markers (each marker represents a record in the table), the corresponding record is displayed in a popup and can be edited there (for example, corrections can be made to the order retrospectively and the order status can be changed).

<img src="demo-screenrecordings/AidDelivery_4.gif" alt="..." />

#### Phase 2: Logistical processing for delivery of orders
Once an order has been validated (for example, by means of an internal column "state"), it is ready for processing and being eventually delivered. From this point on, QR code labels that can be attached to the orders (package boxes or sometimes entire pallets) can be extremely helpful and time-saving for easy tracking and updating in the system: instead of manually searching for an order that needs to change from the status "Packed" to "In delivery" using the order ID, for example, the order can be found and updated with a simple QR scan before it is loaded onto the transporter.

For this to work, it is necessary: 
1. to add a QR column to a record (when configuring the column, the column whose value is to be used for the QR code is selected).
2. that selected records of a table - along with the QR code - can be easily printed using the new prototype feature of PDF data export.

<img src="demo-screenrecordings/AidDelivery_5.gif" alt="..." />

3. the direct integration of a QR scanner in NocoDB, allowing the corresponding record of the shipment to be easily and quickly opened and edited using the QR code label.

<img src="demo-screenrecordings/AidDelivery_6.gif" alt="..." />

 It should be noted that the Geo features still require two essential core functions to enable a real, scalable production deployment: 
 1. setting the position using a movable marker on the map by the user
 2. searching for geopositions based on an address search)
### Scenario 2: Refugee Welcome Center

This scenario concerns the registration of refugees in an initial reception facility and their management, for example, to be able to track at any time which residents have temporarily or permanently left the center and the number of available beds.
For the registration and the check-in, check-out and other status updates (e.g. looking for volunteer drivers that could bring them into a different region) of residents of the center, QR-code wristbands that have pre-printed an encoded unique ID on them are given out to every new resident and attached with their respective data row in NocoDB. 

Again we start with defining the basic table structure, including basic personal information like name, needed medical support level, the status of the resident (like 'Waiting for free spot', 'Left temporarily' or 'Left permanently' etc), as well as the unique QR Code id - both as an actual column for storing the value as well as a QR code column which will later on enable the scanner for finding people by the QR code, as well as showing the QR code as part of the on-screen details view of the person or for printing the QR code via the PDF export feature, in case that's needed. 

<img src="demo-screenrecordings/WelcomeCenter_1.gif" alt="..." />

Then, we create a form view that is used during the registration. The option 'Enable filling by scanner' will be activated for the field 'QR Wristband ID'.

During filling the form for a new center resident, the QR scanner can now bused to quickly fill out the Id of the Wristband. 

<img src="demo-screenrecordings/WelcomeCenter_2.gif" alt="..." />

If then later the persons record should be opened (e.g. to check them out temporarily or permanently), the new QR scanner that is directly integrated in the Grid View if the new Mobile Mode is enabled can be used to quickly open the respective data row. 

<img src="demo-screenrecordings/WelcomeCenter_3.gif" alt="..." />

## How to activate the beta features?
* TODO
## Links to relevant PRs and branches
### Geo Data and Map related
* https://github.com/nocodb/nocodb/pull/4749
* https://github.com/nocodb/nocodb/pull/5248

### QR-Code and Barcode related
* https://github.com/nocodb/nocodb/pull/4468
* https://github.com/nocodb/nocodb/pull/4585
* https://github.com/nocodb/nocodb/pull/4641
* https://github.com/nocodb/nocodb/pull/5114

### Other
* https://github.com/nocodb/nocodb/pull/5035/files
* [PDF export of data rows](https://github.com/nocodb/nocodb/compare/develop...humannocode:nocodb:client-side-pdf-export-poc) - Prototype Branch, not merged
## Need help? 
Are you member of a NGO, social business or non-profit who wants help? 
* Help with an onboarding session? 
* Consultancy? 
* Need a NocoDB feature for a certain use case? 
* Feedback? 

## Wanna help out? 

## Planned next steps

## Additional resources
* Prototpe Fund general page
* NocoDB main page (GH and/or Website)
* 

## Thank you
* OKF
* DLR (e.g. Holger)
* BMBF
* NocoDB team
* Eriol and Superbloom
* Boxtribute and several other actors from the humanitarian domain


