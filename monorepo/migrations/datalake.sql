CREATE TABLE IF NOT EXISTS "Address" (
	"ID" integer PRIMARY KEY NOT NULL,
	"FullAddress" varchar,
	"UnitNo" varchar(100),
	"StreetNo" varchar(100),
	"StreetName" varchar(150),
	"StreetType" varchar(20),
	"Suburb" varchar(100),
	"City" varchar(150),
	"StateID" integer,
	"LocalCouncil" varchar(255),
	"Postcode" varchar(10),
	"CountryID" integer,
	"Latitude" numeric,
	"Longitude" numeric,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AddressHistory" (
	"ID" integer,
	"FullAddress" varchar,
	"UnitNo" varchar(10),
	"StreetNo" varchar(10),
	"StreetName" varchar(150),
	"StreetType" varchar(20),
	"Suburb" varchar(100),
	"City" varchar(150),
	"StateID" integer,
	"LocalCouncil" varchar(255),
	"Postcode" varchar(10),
	"CountryID" integer,
	"Latitude" numeric,
	"Longitude" numeric,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AddressType" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Brand" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"IsDbc" boolean,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BtrPropertyHelperApplication" (
	"ID" bigint NOT NULL,
	"FirstName" varchar(100),
	"LastName" varchar(100),
	"Email" varchar(255),
	"Mobile" varchar(20),
	"RequestData" jsonb,
	"ResponseCode" integer,
	"ResponseData" jsonb,
	"MovingHubReferenceCode" varchar(20),
	"MovingHubCustomerID" varchar(20),
	"ApplicationStatus" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"Segment" varchar(100),
	"MatterID" varchar(100),
	"Version" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Business" (
	"ID" integer PRIMARY KEY NOT NULL,
	"ABN" varchar(11),
	"ACN" varchar(9),
	"BusinessTypeID" integer,
	"AddressID" integer,
	"Name" varchar(100),
	"Location" varchar(100),
	"Phone" varchar(20),
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BusinessHistory" (
	"ID" integer,
	"ABN" varchar(11),
	"ACN" varchar(9),
	"BusinessTypeID" integer,
	"AddressID" integer,
	"Name" varchar(100),
	"Location" varchar(100),
	"Phone" varchar(20),
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BusinessType" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BusinessUser" (
	"ID" integer PRIMARY KEY NOT NULL,
	"UserID" integer,
	"BusinessID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "BusinessUserHistory" (
	"ID" integer,
	"UserID" integer,
	"BusinessID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ContactUs" (
	"ID" integer PRIMARY KEY NOT NULL,
	"BrandID" integer,
	"CID" varchar(100),
	"UserID" integer,
	"EnquiryType" varchar(150),
	"FirstName" varchar(100),
	"LastName" varchar(100),
	"Email" varchar(255),
	"Phone" varchar(20),
	"Message" text,
	"EntryID" integer,
	"EntryTime" timestamp,
	"utmID" varchar(20),
	"utmSource" varchar(100),
	"utmMedium" varchar(100),
	"utmCampaign" varchar(100),
	"utmContent" varchar(400),
	"ReferralPage" varchar(2000),
	"UserAgent" text,
	"UserIP" varchar(200),
	"DataID" bigint,
	"Created" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ContractDraft" (
	"ID" integer PRIMARY KEY NOT NULL,
	"TransactionServiceID" integer NOT NULL,
	"ContractData" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ConveyancingParty" (
	"ID" integer PRIMARY KEY NOT NULL,
	"ConveyancingServiceID" integer,
	"UserID" integer,
	"BusinessID" integer,
	"RoleID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer,
	"ActionStepID" integer,
	"FirstName" varchar(100),
	"LastName" varchar(150),
	"DisplayName" varchar(255),
	"Mobile" varchar(20),
	"HomePhone" varchar(20),
	"WorkPhone" varchar(20),
	"IsBusiness" boolean,
	"ClientConsent" boolean,
	"Email" varchar(255),
	"ClientConsentMyConnect" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ConveyancingPartyHistory" (
	"ID" integer,
	"ConveyancingServiceID" integer,
	"UserID" integer,
	"BusinessID" integer,
	"RoleID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ConveyancingPayment" (
	"ID" bigint NOT NULL,
	"MatterID" integer,
	"MatterReference" varchar(50),
	"CustomerToken" varchar(255),
	"PaymentMethodToken" varchar(255),
	"Amount" numeric,
	"Email" varchar(255),
	"InvoiceNumber" varchar(255),
	"PaymentType" varchar(10),
	"DataID" bigint,
	"Version" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"CustomerName" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ConveyancingPaymentHistory" (
	"ID" bigint NOT NULL,
	"MatterID" integer,
	"MatterReference" varchar(50),
	"CustomerToken" varchar(255),
	"PaymentMethodToken" varchar(255),
	"Amount" numeric,
	"Email" varchar(255),
	"InvoiceNumber" varchar(255),
	"PaymentType" varchar(10),
	"DataID" bigint,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"CustomerName" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ConveyancingService" (
	"ID" integer PRIMARY KEY NOT NULL,
	"TransactionServiceID" integer,
	"MatterID" integer,
	"AssignedTo" varchar(255),
	"PropertyID" integer,
	"IsMovingIn" boolean,
	"Mortgage" varchar(255),
	"BuildingPestInspectionDate" date,
	"SettlementDate" date,
	"Created" timestamp,
	"Completed" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer,
	"MatterReference" varchar(50),
	"OfferApplied" varchar(50),
	"OfferDiscount" double precision,
	"Status" varchar,
	"AdditionalInformation" text,
	"ContractDate" timestamp,
	"CurrentStep" varchar,
	"CoolingOffDate" timestamp,
	"MovingDate" date,
	"MatterType" varchar(100),
	"PurchasePrice" real,
	"SettlementPlatform" varchar(100),
	"MatterCreated" date,
	"MatterUpdated" timestamp,
	"UnconditionalDate" date,
	"FinanceDueDate" date,
	"ContractTerminated" boolean,
	"MatterTerminated" boolean,
	"NewSettlementDateAvailable" boolean,
	"DateTimeSmtDelay" timestamp,
	"IsSettlementOverdue" boolean,
	"BookingDate" timestamp,
	"PrivColl" boolean DEFAULT false,
	"PropertyUse" varchar(200),
	"PropertyTenantsRemaining" boolean,
	"IsMatterCancelled" boolean,
	"Cancelled" date,
	"CancellationReason" text,
	"Terminated" date,
	"TerminationReason" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ConveyancingServiceHistory" (
	"ID" integer,
	"TransactionServiceID" integer,
	"MatterID" integer,
	"AssignedTo" varchar(255),
	"PropertyID" integer,
	"IsMovingIn" boolean,
	"Mortgage" varchar(255),
	"BuildingPestInspectionDate" date,
	"SettlementDate" date,
	"Created" timestamp,
	"Completed" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"MatterReference" varchar(50),
	"OfferApplied" varchar(50),
	"OfferDiscount" double precision,
	"Status" varchar,
	"AdditionalInformation" text,
	"ContractDate" timestamp,
	"CurrentStep" varchar,
	"CoolingOffDate" timestamp,
	"MovingDate" timestamp,
	"MatterType" varchar(100),
	"PurchasePrice" real,
	"SettlementPlatform" varchar(100),
	"MatterCreated" timestamp,
	"MatterUpdated" timestamp,
	"UnconditionalDate" date,
	"FinanceDueDate" date,
	"MatterTerminated" boolean,
	"ContractTerminated" boolean,
	"NewSettlementDateAvailable" boolean,
	"DateTimeSmtDelay" timestamp,
	"IsSettlementOverdue" boolean,
	"BookingDate" timestamp,
	"PrivColl" boolean DEFAULT false,
	"PropertyUse" varchar(200),
	"PropertyTenantsRemaining" boolean,
	"IsMatterCancelled" boolean DEFAULT false NOT NULL,
	"Cancelled" date,
	"CancellationReason" text,
	"Terminated" date,
	"TerminationReason" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ConveyancingTask" (
	"ID" integer PRIMARY KEY NOT NULL,
	"ActionStepTaskID" integer,
	"ConveyancingServiceID" integer,
	"AssignedTo" varchar,
	"CompletedOn" timestamp,
	"DueDate" timestamp,
	"Name" varchar(255),
	"Priority" varchar(50),
	"Status" varchar(50),
	"Step" varchar(255),
	"DataID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"ActionStepTaskCreated" timestamp,
	"ActionStepTaskUpdated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ConveyancingTask2" (
	"ID" integer PRIMARY KEY NOT NULL,
	"ActionStepTaskID" integer,
	"ConveyancingServiceID" integer,
	"AssignedTo" varchar,
	"CompletedOn" timestamp,
	"DueDate" timestamp,
	"Name" varchar(255),
	"Priority" varchar(50),
	"Status" varchar(50),
	"Step" varchar(255),
	"DataID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Country" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DataInput" (
	"ID" bigserial PRIMARY KEY NOT NULL,
	"SourceID" integer,
	"Data" jsonb,
	"Status" varchar(1),
	"SourceIPAddress" varchar(40),
	"IsTest" boolean,
	"Created" timestamp,
	"StartedProcessing" timestamp,
	"CompletedProcessing" timestamp,
	"StartedPublishing" timestamp,
	"CompletedPublishing" timestamp,
	"Updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DataPartner" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"DisplayName" varchar(150),
	"IsDataSharingEnabled" boolean DEFAULT false NOT NULL,
	"DataSharingStartDate" timestamp,
	"DataSharingEndDate" timestamp,
	"DestinationURL" varchar(255),
	"FolderPath" varchar(255),
	"ApiKey" varchar(255),
	"AuthToken" varchar(255),
	"RefreshToken" varchar(255),
	"Username" varchar(255),
	"Password" varchar(255),
	"LastRunDate" timestamp,
	"Created" timestamp,
	"Updated" timestamp,
	"DataPartnerCategoryID" integer,
	"LastRunDataLmit" smallint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DataPartnerCategory" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"DisplayName" varchar(150),
	"Created" timestamp DEFAULT now(),
	"Updated" timestamp DEFAULT now(),
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DataPartnerPostcode" (
	"ID" integer PRIMARY KEY NOT NULL,
	"DataPartnerStateID" integer,
	"CanService" boolean,
	"Postcode" varchar(10),
	"Created" timestamp DEFAULT now(),
	"Updated" timestamp DEFAULT now(),
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DataPartnerState" (
	"ID" integer PRIMARY KEY NOT NULL,
	"DataPartnerID" integer,
	"StateID" integer,
	"Created" timestamp DEFAULT now(),
	"Updated" timestamp DEFAULT now(),
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DataSharingAthenaLog" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"DataSharingCCALeadSegmentID" bigint,
	"DataPartnerID" bigint,
	"Date" date,
	"Name" varchar(100),
	"Mobile" varchar(20),
	"HomePhone" varchar(20),
	"WorkPhone" varchar(20),
	"Email" varchar(255),
	"UnitNo" varchar(100),
	"StreetName" varchar(255),
	"StreetType" varchar(200),
	"Suburb" varchar(255),
	"Postcode" varchar(10),
	"State" varchar(100),
	"Segment" varchar(255),
	"AthenaConsent" varchar(1),
	"twentyPercent" varchar(1),
	"Ownership" varchar(100),
	"TransferType" varchar(5),
	"TransferStatus" varchar(20),
	"TransferReason" varchar(255),
	"TransferTime" timestamp,
	"Created" timestamp,
	"Updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DataSharingCCAClientSegments" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"ConveyancingPartyID" integer,
	"UserID" integer,
	"Segment" varchar(100),
	"Created" timestamp DEFAULT now(),
	"Updated" timestamp DEFAULT now(),
	"Deleted" timestamp,
	"DataID" bigint,
	"ConveyancingServiceID" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DataSharingCCALeadSegments" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"LeadID" integer,
	"TransactionServiceID" integer,
	"UserID" integer,
	"Segment" varchar(100),
	"DataID" bigint,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DataSharingMyConnectLog" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"DataSharingCCAClientSegmentID" integer,
	"DataPartnerID" integer,
	"FirstName" varchar(100),
	"LastName" varchar(150),
	"Mobile" varchar(20),
	"HomePhone" varchar(20),
	"WorkPhone" varchar(20),
	"Email" varchar(255),
	"SettlementDate" timestamp,
	"UnitNo" varchar(100),
	"StreetNo" varchar(255),
	"StreetName" varchar(255),
	"StreetType" varchar(200),
	"Suburb" varchar(255),
	"Postcode" varchar(10),
	"State" varchar(5),
	"AssignedTo" varchar(255),
	"Segment" varchar(100),
	"TransferID" varchar(20),
	"TransferType" varchar(20),
	"TransferStatus" varchar(20),
	"TransferReason" varchar(255),
	"TransferTime" timestamp,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"MatterID" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DataSharingTintPaintLog" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"UserProfileID" bigint,
	"TransactionServiceID" bigint,
	"DataSharingCCALeadSegmentID" integer,
	"DataSharingCCAClientSegmentID" integer,
	"MatterID" integer,
	"DataPartnerID" integer,
	"FirstName" varchar(100),
	"Mobile" varchar(20),
	"HomePhone" varchar(20),
	"WorkPhone" varchar(20),
	"Email" varchar(255),
	"TimeToTransact" varchar(100),
	"PropertyType" varchar(100),
	"SettlementDate" timestamp,
	"UnitNo" varchar(100),
	"StreetNo" varchar(255),
	"StreetName" varchar(255),
	"StreetType" varchar(200),
	"Suburb" varchar(255),
	"Postcode" varchar(10),
	"State" varchar(5),
	"AssignedTo" varchar(255),
	"Segment" varchar(100),
	"SegmentDate" timestamp,
	"TransferID" varchar(20),
	"TransferType" varchar(20),
	"TransferStatus" varchar(20),
	"TransferReason" varchar(255),
	"TransferTime" timestamp,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DataSource" (
	"ID" integer PRIMARY KEY NOT NULL,
	"SourceName" varchar(100),
	"SubSource" varchar(100),
	"SourceCategory" varchar(100),
	"IsDBC" boolean,
	"Access" jsonb,
	"DataPriority" jsonb,
	"DataClassification" varchar(1),
	"IsEnabled" boolean,
	"IsProcessingEnabled" boolean,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"Version" integer,
	"DoAutodial" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DataSourceHistory" (
	"ID" integer,
	"SourceName" varchar(100),
	"SubSource" varchar(100),
	"SourceCategory" varchar(100),
	"IsDBC" boolean,
	"Access" jsonb,
	"DataPriority" jsonb,
	"DataClassification" varchar(1),
	"IsEnabled" boolean,
	"IsProcessingEnabled" boolean,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dbc.ccaLeads" (
	"ID" bigint,
	"CID" varchar(100),
	"UserID" integer,
	"FirstName" varchar(100),
	"LastName" varchar(100),
	"Email" varchar(255),
	"Phone" varchar(20),
	"TransactionTypeID" integer,
	"PropertyTypeID" integer,
	"StateID" integer,
	"TimeToTransactID" integer,
	"AcceptTerms" boolean,
	"utmID" varchar(20),
	"utmSource" varchar(100),
	"utmMedium" varchar(100),
	"utmCampaign" varchar(100),
	"Channel" varchar(100),
	"utmContent" varchar(400),
	"ReferralPage" text,
	"SendEmail" boolean,
	"SalesforceEmailLogID" integer,
	"StatusID" integer,
	"DuplicateLeadID" bigint,
	"StatusReasonID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"Email1Only" boolean,
	"TransactionServiceID" integer,
	"PublishToTeams" boolean,
	"OfferCode" varchar(50),
	"Notes" text,
	"BrandID" integer,
	"FullName" varchar(200),
	"PropertyLocation" varchar(200)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dbc.ccaMatterTasks" (
	"Task - ID" integer,
	"Task - Action Step ID" integer,
	"Matter ID" integer,
	"Task - Assigned To" varchar,
	"Task - Completed On" timestamp,
	"Task - Due Date" timestamp,
	"Task - Name" varchar(255),
	"Task - Priority" varchar(50),
	"Task - Status" varchar(50),
	"Task - Step" varchar(255),
	"Task - Data ID" integer,
	"Task - Created" timestamp,
	"Task - Updated" timestamp,
	"Task - Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dbc.ccaMatters" (
	"Transaction ID" integer,
	"Deal Matter Reference" varchar(50),
	"TransactionServiceID" integer,
	"Matter - Matter Reference" varchar(50),
	"Matter - Matter Type" varchar(100),
	"Matter - Property Type" varchar(100),
	"Matter - Date Created" timestamp,
	"Matter - Contract Date" timestamp,
	"Matter - BPI Date" date,
	"Matter - Cooling Off Date" timestamp,
	"Matter - Settlement Date" date,
	"Matter - Status" varchar,
	"Matter - Current Step" varchar,
	"Matter - Assigned To" varchar(255),
	"Matter - Additional Information" text,
	"Matter - Offer Applied" varchar(50),
	"Matter - Offer Discount" double precision,
	"Matter - Purchase Price" real,
	"Matter - Is Moving In" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dbc.ccaOutboundPartnershipLeads" (
	"Date Sent" date,
	"First Name" varchar(100),
	"Last Name" varchar(150),
	"Email" varchar(255),
	"Audience" varchar(100),
	"Property Type" varchar(100),
	"Conveyancing Stage" varchar,
	"Property Journey" text,
	"Settlement Date" timestamp,
	"utm_medium" varchar(100),
	"utm_source" varchar(100),
	"Referral URL" text,
	"Partner" varchar(150),
	"Partner Category" varchar(150),
	"State" varchar(5),
	"MatterID" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dbc.ccaSalesLeads" (
	"Transaction ID" integer,
	"Deal - ID" integer,
	"Deal - Created" timestamp,
	"Deal - Postcode" varchar(20),
	"Deal - Status" varchar(20),
	"Deal - Matter Reference" varchar(50),
	"Deal - Offer Applied" varchar(50),
	"Deal - Offer Discount" numeric,
	"Deal - Offer Currency" varchar(10),
	"Deal - Lost Reason" varchar(100),
	"Deal - Won Time" timestamp,
	"Deal - Lost Time" timestamp,
	"Lead - Referral Page" text,
	"Deal - Closed" timestamp,
	"Deal - Client Services" varchar(100),
	"Deal - Client Services Contact" varchar(100),
	"Deal - Product Type" varchar(100),
	"Deal - State" varchar(3),
	"Deal - Stage" varchar(100),
	"Deal - Property Type" varchar(100),
	"Deal - Time To Transact" varchar(100),
	"Deal – Lead Source" varchar(200),
	"Deal – Lead Source Category" varchar(200),
	"Lead - Source" varchar(100),
	"Lead - Sub Source" varchar(100),
	"Lead - Campaign" varchar(100),
	"Lead - Channel" varchar(100),
	"Lead - Experiment ID" varchar(255),
	"Lead - Experiment Variation" varchar(255),
	"Lead - GCLID" varchar(255),
	"User - Full Name" text,
	"User - Phone" varchar(20),
	"User - Email" varchar(255),
	"User - Marketing Communication" boolean,
	"User - CID" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dbc.ccaSalesLeadsCopy" (
	"Lead - Created" timestamp,
	"Transaction ID" integer,
	"Deal - ID" integer,
	"Deal - Created" timestamp,
	"Deal - Postcode" varchar(20),
	"Deal - Status" varchar(20),
	"Deal - Matter Reference" varchar(50),
	"Deal - Offer Applied" varchar(50),
	"Deal - Offer Discount" numeric,
	"Deal - Offer Currency" varchar(10),
	"Deal - Lost Reason" varchar(100),
	"Deal - Won Time" timestamp,
	"Deal - Lost Time" timestamp,
	"Lead - Referral Page" text,
	"Deal - Closed" timestamp,
	"Deal - Client Services" varchar(100),
	"Deal - Client Services Contact" varchar(100),
	"Deal - Product Type" varchar(100),
	"Deal - State" varchar(3),
	"Deal - Stage" varchar(100),
	"Deal - Property Type" varchar(100),
	"Deal - Time To Transact" varchar(100),
	"Lead - Source" varchar(100),
	"Lead - Sub Source" varchar(100),
	"Lead - Campaign" varchar(100),
	"Lead - Channel" varchar(100),
	"User - Full Name" text,
	"User - Phone" varchar(20),
	"User - Email" varchar(255),
	"User - Marketing Communication" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dbc.ccaSalesPipeDrive" (
	"Lead Date" text,
	"Deal Date" text,
	"State" varchar(3),
	"Product" varchar(100),
	"utm_source" varchar(100),
	"utm_campaign" varchar(100),
	"utm_medium" varchar(100),
	"Channel" varchar(100),
	"TimeToTransact" varchar(100),
	"PropertyType" varchar(100),
	"Lost Reason" varchar(100),
	"Status" varchar(20),
	"PD Deals" bigint,
	"Leads Qualified" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dbc.rLeads" (
	"Date" text,
	"State" varchar(3),
	"Product" varchar(100),
	"UTM
Source" varchar(100),
	"Leads(Total)" bigint,
	"Leads(Qualified)" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dbc.rbiLeads" (
	"ID" bigint,
	"CID" varchar(100),
	"UserID" integer,
	"FirstName" varchar(100),
	"LastName" varchar(100),
	"Email" varchar(255),
	"Phone" varchar(20),
	"TransactionTypeID" integer,
	"PropertyTypeID" integer,
	"StateID" integer,
	"TimeToTransactID" integer,
	"AcceptTerms" boolean,
	"utmID" varchar(20),
	"utmSource" varchar(100),
	"utmMedium" varchar(100),
	"utmCampaign" varchar(100),
	"Channel" varchar(100),
	"utmContent" varchar(400),
	"ReferralPage" text,
	"SendEmail" boolean,
	"SalesforceEmailLogID" integer,
	"StatusID" integer,
	"DuplicateLeadID" bigint,
	"StatusReasonID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"Email1Only" boolean,
	"TransactionServiceID" integer,
	"PublishToTeams" boolean,
	"OfferCode" varchar(50),
	"Notes" text,
	"BrandID" integer,
	"FullName" varchar(200),
	"PropertyLocation" varchar(200)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dbc.rbiTracker" (
	"Address" varchar,
	"Auth By" varchar(100),
	"Booking Date" timestamp,
	"Client Name" varchar(255),
	"Concierge" varchar(100),
	"Confirmed" text,
	"Date of Inspection" date,
	"Email" varchar(255),
	"Inspection Time" time,
	"Inspector" varchar(255),
	"Job #" varchar(255),
	"Lead Date" timestamp,
	"Lead Source" varchar(100),
	"Lead Stage" varchar(100),
	"No. Bath" integer,
	"No. Bdr" integer,
	"Payment" varchar(10),
	"Phone" varchar(20),
	"Postcode" varchar(10),
	"Product Code" varchar(100),
	"Quoted Price" numeric,
	"State" varchar(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DeveloperLog" (
	"ID" integer PRIMARY KEY NOT NULL,
	"DataID" bigint,
	"Attributes" jsonb,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DocumentType" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "failed_jobs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"connection" text NOT NULL,
	"queue" text NOT NULL,
	"payload" text NOT NULL,
	"exception" text NOT NULL,
	"failed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FclPropertyHelperApplication" (
	"ID" bigint NOT NULL,
	"FirstName" varchar(100),
	"LastName" varchar(100),
	"Email" varchar(255),
	"Mobile" varchar(20),
	"RequestData" jsonb,
	"ResponseCode" integer,
	"ResponseData" jsonb,
	"MovingHubReferenceCode" varchar(20),
	"MovingHubCustomerID" varchar(20),
	"ApplicationStatus" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"Segment" varchar(100),
	"MatterID" varchar(100),
	"Version" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FormitizeJobType" (
	"ID" integer PRIMARY KEY NOT NULL,
	"ServiceTypeID" integer,
	"StateID" integer,
	"JobType" varchar(255),
	"Forms" jsonb,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FormitizeLog" (
	"ID" integer NOT NULL,
	"InspectionServiceID" integer,
	"TransactionServiceID" integer,
	"RequestType" varchar(100),
	"RequestStatus" varchar(100),
	"DataID" bigint,
	"Attributes" jsonb,
	"Response" jsonb,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Gender" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GotoAuth" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Token" text,
	"Expire" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GotoCallerActivityDetail" (
	"ID" bigint NOT NULL,
	"PhoneNumber" varchar(20) NOT NULL,
	"OrganisationID" varchar(20),
	"StartTime" timestamp NOT NULL,
	"ImportID" integer NOT NULL,
	"AnswerTime" timestamp,
	"EndTime" timestamp,
	"Direction" varchar(20),
	"Disposition" integer,
	"Duration" integer,
	"CallerName" varchar(50),
	"CallerNumber" varchar(50),
	"CalleeName" varchar(50),
	"CalleeNumber" varchar(50),
	"Created" timestamp,
	CONSTRAINT "GotoCallerActivityDetail_pkey" PRIMARY KEY("ID","PhoneNumber","StartTime","ImportID")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GotoCallerActivitySummary" (
	"ID" bigint NOT NULL,
	"PhoneNumber" varchar(20) NOT NULL,
	"ImportID" integer NOT NULL,
	"PhoneName" varchar(200),
	"InboundVolume" integer,
	"InboundDuration" integer,
	"OutboundVolume" integer,
	"OutboundDuration" integer,
	"AverageDuration" integer,
	"Volume" integer,
	"TotalDuration" integer,
	"Created" timestamp,
	CONSTRAINT "GotoCallerActivitySummary_pkey" PRIMARY KEY("ID","PhoneNumber","ImportID")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GotoDisposition" (
	"ID" integer PRIMARY KEY NOT NULL,
	"CauseCode" integer,
	"Cause" varchar(200),
	"Definition" text,
	"Created" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GotoImportLog" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"OrganisationID" varchar(20),
	"QueryStartTime" timestamp,
	"QueryEndTime" timestamp,
	"RunTime" timestamp,
	"Type" varchar(20),
	"Created" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GotoPhoneActivityDetail" (
	"ID" bigint NOT NULL,
	"PhoneID" uuid NOT NULL,
	"OrganisationID" varchar(20),
	"StartTime" timestamp NOT NULL,
	"ImportID" integer NOT NULL,
	"AnswerTime" timestamp,
	"EndTime" timestamp,
	"Direction" varchar(20),
	"Disposition" integer,
	"Duration" integer,
	"CallerName" varchar(50),
	"CallerNumber" varchar(50),
	"CalleeName" varchar(50),
	"CalleeNumber" varchar(50),
	"Created" timestamp,
	CONSTRAINT "GotoPhoneActivityDetail_pkey" PRIMARY KEY("ID","PhoneID","StartTime","ImportID")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GotoPhoneActivitySummary" (
	"ID" bigint NOT NULL,
	"PhoneID" uuid NOT NULL,
	"ImportID" integer NOT NULL,
	"PhoneNumber" varchar(20),
	"PhoneName" varchar(200),
	"InboundVolume" integer,
	"InboundDuration" integer,
	"OutboundVolume" integer,
	"OutboundDuration" integer,
	"AverageDuration" integer,
	"Volume" integer,
	"TotalDuration" integer,
	"Created" timestamp,
	CONSTRAINT "GotoPhoneActivitySummary_pkey" PRIMARY KEY("ID","PhoneID","ImportID")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GotoUserActivityDetail" (
	"ID" bigint NOT NULL,
	"UserID" uuid NOT NULL,
	"OrganisationID" varchar(20),
	"StartTime" timestamp NOT NULL,
	"ImportID" integer NOT NULL,
	"AnswerTime" timestamp,
	"EndTime" timestamp,
	"Direction" varchar(20),
	"Disposition" integer,
	"Duration" integer,
	"CallerName" varchar(50),
	"CallerNumber" varchar(50),
	"CalleeName" varchar(50),
	"CalleeNumber" varchar(50),
	"Created" timestamp,
	CONSTRAINT "GotoUserActivityDetail_pkey" PRIMARY KEY("ID","UserID","StartTime","ImportID")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GotoUserActivitySummary" (
	"ID" bigint NOT NULL,
	"UserId" uuid NOT NULL,
	"ImportID" integer NOT NULL,
	"UserName" varchar(20),
	"InboundVolume" integer,
	"InboundDuration" integer,
	"OutboundVolume" integer,
	"OutboundDuration" integer,
	"AverageDuration" integer,
	"Volume" integer,
	"TotalDuration" integer,
	"Created" timestamp,
	CONSTRAINT "GotoUserActivitySummary_pkey" PRIMARY KEY("ID","UserId","ImportID")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "InspectionService" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"TransactionServiceID" integer,
	"PropertyID" integer,
	"ServiceTypeID" integer,
	"CrmStaffName" varchar(255),
	"AssignedTo" varchar(255),
	"Consent" varchar(100),
	"Confirmed" boolean,
	"InspectionDate" date,
	"InspectionTime" time,
	"JobNumber" varchar(255),
	"CarParking" boolean,
	"AgentName" varchar(255),
	"AgentPhone" varchar(100),
	"ReportSent" varchar(20),
	"TaxDepreciationFU" boolean,
	"BuildingStageInspection" varchar(255),
	"DataID" bigint,
	"Version" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"ReportPurchase" numeric,
	"ClientInstructions" text,
	"PaymentStatus" varchar(20),
	"DateOfAcceptance" date,
	"MethTest" boolean,
	"IsCommercialAddress" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "InspectionServiceHistory" (
	"ID" bigint NOT NULL,
	"TransactionServiceID" integer,
	"PropertyID" integer,
	"ServiceTypeID" integer,
	"CrmStaffName" varchar(255),
	"AssignedTo" varchar(255),
	"Consent" varchar(100),
	"Confirmed" boolean,
	"InspectionDate" date,
	"InspectionTime" time,
	"JobNumber" varchar(255),
	"CarParking" boolean,
	"AgentName" varchar(255),
	"AgentPhone" varchar(100),
	"ReportSent" varchar(20),
	"TaxDepreciationFU" boolean,
	"BuildingStageInspection" varchar(255),
	"DataID" bigint,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"ReportPurchase" numeric,
	"ClientInstructions" text,
	"PaymentStatus" varchar(20),
	"DateOfAcceptance" date,
	"MethTest" boolean,
	"IsCommercialAddress" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"queue" varchar(255) NOT NULL,
	"payload" text NOT NULL,
	"attempts" smallint NOT NULL,
	"reserved_at" integer,
	"available_at" integer NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LeadCampaignTrigger" (
	"ID" integer PRIMARY KEY NOT NULL,
	"BrandID" integer,
	"Trigger" varchar(30),
	"Campaign" varchar(200),
	"IsEnabled" boolean,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LeadSourceCategory" (
	"ID" integer PRIMARY KEY NOT NULL,
	"BrandID" integer,
	"Category" varchar(200),
	"Source" varchar(200),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "LeadStatus" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Leads" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"CID" varchar(100),
	"UserID" integer,
	"FirstName" varchar(100),
	"LastName" varchar(100),
	"Email" varchar(255),
	"Phone" varchar(20),
	"TransactionTypeID" integer,
	"PropertyTypeID" integer,
	"StateID" integer,
	"TimeToTransactID" integer,
	"AcceptTerms" boolean,
	"utmID" varchar(20),
	"utmSource" varchar(100),
	"utmMedium" varchar(100),
	"utmCampaign" varchar(100),
	"Channel" varchar(100),
	"utmContent" varchar(400),
	"ReferralPage" text,
	"SendEmail" boolean,
	"SalesforceEmailLogID" integer,
	"StatusID" integer,
	"DuplicateLeadID" bigint,
	"StatusReasonID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"Email1Only" boolean DEFAULT false,
	"TransactionServiceID" integer,
	"PublishToTeams" boolean DEFAULT false,
	"OfferCode" varchar(50),
	"Notes" text,
	"BrandID" integer,
	"FullName" varchar(200),
	"PropertyLocation" varchar(200),
	"ExperimentID" varchar(255),
	"ExperimentVariation" varchar(255),
	"gclid" varchar(255),
	"otoBuyerIdHash" varchar(255),
	"otoOfferIdHash" varchar(255),
	"otoListingIdHash" varchar(255),
	"OtoProduct" varchar(20),
	"PreferredContactTime" varchar(100),
	"AgentName" varchar(200),
	"Postcode" varchar(20),
	"PropertySize" varchar(5),
	"ReferralID" varchar(400),
	"ReferralPartnerEmail" varchar(255),
	"ConveyancingFirm" varchar(150),
	"ConveyancingName" varchar(150),
	"ReferralFranchiseeEmail" varchar(255),
	"LeadSourceCat" varchar(200)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Listing" (
	"ID" integer PRIMARY KEY NOT NULL,
	"PropertyID" integer,
	"AgentID" integer,
	"AppearanceDate" timestamp,
	"PublicationDate" timestamp,
	"Description " text,
	"ListingType" varchar,
	"PriceDescription" varchar(150),
	"PriceFrom" numeric,
	"PriceTo" numeric,
	"ListingCategory" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ListingHistory" (
	"ID" integer,
	"PropertyID" integer,
	"AgentID" integer,
	"AppearanceDate" timestamp,
	"PublicationDate" timestamp,
	"Description " text,
	"ListingType" varchar,
	"PriceDescription" varchar(150),
	"PriceFrom" numeric,
	"PriceTo" numeric,
	"ListingCategory" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "MaritalStatus" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "MarketingUserSegments" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"ConveyancingPartyID" integer,
	"ConveyancingServiceID" integer,
	"UserID" integer,
	"Segment" varchar(100),
	"Created" timestamp DEFAULT now(),
	"Updated" timestamp DEFAULT now(),
	"Deleted" timestamp,
	"DataID" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Milestone" (
	"ID" bigserial PRIMARY KEY NOT NULL,
	"TransactionServiceID" bigint,
	"PropertyID" bigint,
	"ConveyancingServiceID" bigint,
	"ConveyancingTaskID" bigint,
	"MilestoneTypeID" bigint NOT NULL,
	"BuildingServiceID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"Delete" timestamp,
	"DataID" integer,
	"IsMilestoneComplete" boolean,
	"KeyDate" timestamp,
	"MilestoneCreated" timestamp,
	"MilestoneUpdated" timestamp,
	"PastKeyDate" timestamp,
	"IsOverdue" boolean,
	"RbiDate" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Milestone2" (
	"ID" bigserial PRIMARY KEY NOT NULL,
	"TransactionServiceID" bigint,
	"PropertyID" bigint,
	"ConveyancingServiceID" bigint NOT NULL,
	"ConveyancingTaskID" bigint,
	"MilestoneTypeID" bigint NOT NULL,
	"BuildingServiceID" integer,
	"IsMilestoneComplete" boolean,
	"KeyDate" timestamp,
	"OtoListingID" integer,
	"OtoBuyerID" integer,
	"OtoOfferID" integer,
	"OtoNotificationRequestTime" timestamp,
	"MilestoneCreated" timestamp,
	"MilestoneUpdated" timestamp,
	"OtoNotificationRequestID" varchar(20),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"DataID" integer NOT NULL,
	"Version" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "MilestoneHistory" (
	"ID" bigint NOT NULL,
	"TransactionServiceID" integer,
	"PropertyID" integer,
	"ConveyancingServiceID" integer,
	"ConveyancingTaskID" integer,
	"MilestoneTypeID" integer NOT NULL,
	"BuildingServiceID" integer,
	"IsMilestoneComplete" boolean,
	"KeyDate" timestamp,
	"OtoListingID" integer,
	"OtoBuyerID" integer,
	"OtoOfferID" integer,
	"OtoNotificationRequestTime" timestamp,
	"MilestoneCreated" timestamp,
	"MilestoneUpdated" timestamp,
	"OtoNotificationRequestID" varchar(20),
	"Created" timestamp,
	"Updated" timestamp,
	"Delete" timestamp,
	"DataID" integer NOT NULL,
	"PastKeyDate" timestamp,
	"IsOverdue" boolean,
	"RbiDate" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "MilestoneType" (
	"ID" bigserial PRIMARY KEY NOT NULL,
	"Code" varchar(10) NOT NULL,
	"Name" varchar(255) NOT NULL,
	"Type" varchar(20) NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	"DateField" varchar,
	"TaskName" varchar,
	"Source" varchar,
	"ServiceBusDelayTime" varchar,
	"MatterSteps" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "MovingHubList" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"MHID" integer,
	"FieldName" varchar(255),
	"Description" varchar(255),
	"IsEnabled" boolean,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "MovingHubLog" (
	"ID" integer PRIMARY KEY NOT NULL,
	"ConveyancingServiceID" integer,
	"DataID" bigint,
	"Attributes" jsonb,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"RequestData" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "NicAuth" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Token" text,
	"Expire" timestamp,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "NicList" (
	"ID" integer PRIMARY KEY NOT NULL,
	"BrandID" integer,
	"StateID" integer,
	"ListID" integer NOT NULL,
	"SkillID" integer NOT NULL,
	"ListName" varchar(100),
	"SkillName" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"NurtureListID" integer,
	"NurtureSkillID" integer,
	"NurtureMinDelay" integer,
	"RedialListID" integer,
	"RedialSkillID" integer,
	"RedialMinDelay" integer,
	"Source" varchar(100),
	"isDefault" boolean,
	"TransactionTypeID" integer,
	"transactiontypeid" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "NurtureStream" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(4),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "OfferCode" (
	"ID" integer PRIMARY KEY NOT NULL,
	"OfferCode" varchar(150),
	"OfferDescription" varchar(255),
	"BrandID" integer,
	"PipedriveOfferID" integer,
	"IsEnabled" boolean,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "OtoLinking" (
	"ID" bigserial PRIMARY KEY NOT NULL,
	"UserID" bigint,
	"CcaLeadID" bigint,
	"CcaTransactionServiceID" bigint,
	"CcaConveyancingServiceID" bigint,
	"RbiLeadID" bigint,
	"RbiTransactionServiceID" bigint,
	"RbiInspectionServiceID" bigint,
	"OtoBuyerIdHash" varchar(20),
	"OtoOfferIdHash" varchar(20),
	"OtoListingIdHash" varchar(20),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"DataID" integer,
	"CcaUserID" bigint,
	"RbiUserID" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "out.ccaRACV" (
	"ID" integer,
	"Deal - ID" integer,
	"Deal - Matter Reference" varchar(50),
	"Matter ID" integer,
	"Deal - Deal created" timestamp,
	"Deal - Won time" timestamp,
	"Deal - Lost time" timestamp,
	"Deal - BST" varchar(100),
	"Deal Details" varchar(100),
	"RACV member number" varchar(10),
	"First Name" varchar(100),
	"Last Name" varchar(150),
	"Contact Number" varchar(20),
	"Person Email" varchar(255),
	"Deal - Referral Page" text,
	"Privacy Consent" boolean,
	"Outbound call consent" boolean,
	"Address Line 1" varchar(100),
	"Address Line 2" text,
	"Suburb" varchar(100),
	"Code" varchar(3),
	"Postcode" varchar(10),
	"Settlement Month" date,
	"Deal - Web Form - Time To Transact" varchar(100),
	"Date created" timestamp,
	"Last updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "OutboundSchedule" (
	"ID" bigint,
	"Name" varchar(100),
	"DataSet" varchar(100),
	"Server" varchar(200),
	"Path" varchar(200),
	"UserName" varchar(100),
	"Password" varchar(100),
	"PublicKey" text,
	"Frequency" integer,
	"Schedule" varchar(20),
	"IsEnabled" boolean,
	"Created" timestamp,
	"Updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PipeDriveLog" (
	"ID" integer PRIMARY KEY NOT NULL,
	"TransactionServiceID" integer,
	"DataID" bigint,
	"Attributes" jsonb,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PipedriveDDLists" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"FieldName" varchar(255),
	"Code" varchar(255),
	"Description" varchar(255),
	"BrandID" integer,
	"PipedriveID" integer,
	"IsEnabled" boolean,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PipedriveUserList" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"BrandID" integer,
	"PDUserName" varchar(255),
	"PDUserID" varchar(255),
	"PDUserToken" varchar(255),
	"IsEnabled" boolean,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Postcode" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Postcode" varchar(150),
	"Suburb" varchar(150),
	"State" varchar(3),
	"Created" timestamp,
	"Updated" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Property" (
	"ID" integer PRIMARY KEY NOT NULL,
	"AddressID" integer,
	"PropertyTypeID" integer,
	"LegalDescription" varchar(255),
	"PrimaryLandUse" varchar(100),
	"SecondaryLandUse" varchar(100),
	"PropertyName" varchar(150),
	"OccupantType" varchar(100),
	"LandArea" integer,
	"EquivBldgArea" integer,
	"FloorArea" integer,
	"Bedrooms" integer,
	"Bathrooms" integer,
	"CarSpaces" integer,
	"CarPort" integer,
	"Garages" integer,
	"YearBuilt" integer,
	"SwimmingPool" boolean,
	"StorageLot" integer,
	"Toilets" integer,
	"SpecialFeatures" text,
	"YearBldgRefurb" integer,
	"Zoning" varchar(100),
	"PropTitleRef" varchar(255),
	"PropTitlePrefix" varchar(100),
	"PropTitleVolumeNo" integer,
	"PropTitleFolioNo" integer,
	"PropTitleSuffix" varchar(100),
	"SaleStatus" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PropertyDocument" (
	"ID" integer PRIMARY KEY NOT NULL,
	"PropertyID" integer,
	"DocumentTypeID" integer,
	"DocumentURL" varchar(255),
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PropertyDocumentHistory" (
	"ID" integer,
	"PropertyID" integer,
	"DocumentTypeID" integer,
	"DocumentURL" varchar(255),
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PropertyHelperApplication" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"UserID" integer,
	"TransactionServiceID" integer,
	"ConveyancingServiceID" integer,
	"MovingHubReferenceCode" varchar(20),
	"MovingHubCustomerId" varchar(20),
	"ApplicationStatus" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"Segment" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PropertyHistory" (
	"ID" integer,
	"AddressID" integer,
	"PropertyType" integer,
	"LegalDescription" varchar(255),
	"PrimaryLandUse" varchar(100),
	"SecondaryLandUse" varchar(100),
	"PropertyName" varchar(150),
	"OccupantType" varchar(100),
	"LandArea" integer,
	"EquivBldgArea" integer,
	"FloorArea" integer,
	"Bedrooms" integer,
	"Bathrooms" integer,
	"CarSpaces" integer,
	"CarPort" integer,
	"Garages" integer,
	"YearBuilt" integer,
	"SwimmingPool" boolean,
	"StorageLot" integer,
	"Toilets" integer,
	"SpecialFeatures" text,
	"YearBldgRefurb" integer,
	"Zoning" varchar(100),
	"PropTitleRef" varchar(255),
	"PropTitlePrefix" varchar(100),
	"PropTitleVolumeNo" integer,
	"PropTitleFolioNo" integer,
	"PropTitleSuffix" varchar(100),
	"SaleStatus" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PropertyOwner" (
	"ID" integer PRIMARY KEY NOT NULL,
	"PropertyID" integer,
	"OwnerID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PropertyOwnerHistory" (
	"ID" integer,
	"PropertyID" integer,
	"OwnerID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PropertyTransaction" (
	"ID" integer PRIMARY KEY NOT NULL,
	"UserID" integer,
	"PropertyID" integer,
	"TransactionTypeID" integer,
	"PropertyTypeID" integer,
	"TransactionStageID" integer,
	"ContactPhone" varchar(20),
	"ContactEmail" varchar(255),
	"ContactTime" varchar(100),
	"StateID" integer,
	"MovingDate" date,
	"IsMovingIn" boolean,
	"ContractDate" date,
	"CoolingOffDate" date,
	"PurchasePrice" double precision,
	"Deposit" double precision,
	"SettlementDate" date,
	"Notes" text,
	"IsCompleted" boolean,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PropertyTransactionHistory" (
	"ID" integer,
	"UserID" integer,
	"PropertyID" integer,
	"TransactionTypeID" integer,
	"PropertyTypeID" integer,
	"TransactionStageID" integer,
	"ContactPhone" varchar(20),
	"ContactEmail" varchar(255),
	"ContactTime" varchar(100),
	"StateID" integer,
	"MovingDate" date,
	"IsMovingIn" boolean,
	"ContractDate" date,
	"CoolingOffDate" date,
	"PurchasePrice" double precision,
	"Deposit" double precision,
	"SettlementDate" date,
	"Notes" text,
	"IsCompleted" boolean,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PropertyType" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RACVMembership" (
	"ID" integer PRIMARY KEY NOT NULL,
	"UserID" integer,
	"LeadID" integer,
	"MembershipNo" varchar(10),
	"DataID" bigint,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"AcceptTerms" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Role" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SalesforceAudiences" (
	"ID" bigint NOT NULL,
	"EntryDate" timestamp NOT NULL,
	"UUID" varchar(40),
	"LongUUID" varchar(50),
	"Category" varchar(100),
	"SubCategory" varchar(100),
	"Name" varchar(120),
	"Description" text,
	"Type" varchar(50),
	"Devices" integer,
	"PageViews" bigint,
	"IsActive" boolean,
	"LastComputed" timestamp,
	"RefreshFrequency" varchar(10),
	"Contains3P" boolean,
	"IsPersistent" boolean,
	"ActivatedPartners" varchar(50),
	"DistributionName" varchar(240),
	"DistributionIndex" numeric,
	"DistributionUniques" integer,
	"Created" timestamp,
	CONSTRAINT "SalesforceAudiences_pkey" PRIMARY KEY("ID","EntryDate"),
	CONSTRAINT "SalesforceAudiences_EntryDate_key" UNIQUE("EntryDate")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SalesforceContactLog" (
	"ID" integer PRIMARY KEY NOT NULL,
	"DataID" bigint,
	"Version" integer,
	"SfExternalKey" uuid,
	"Attributes" jsonb,
	"From" varchar(255),
	"To" varchar(255),
	"Field" varchar(255),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "SalesforceEmailLog" (
	"ID" integer PRIMARY KEY NOT NULL,
	"UserID" integer,
	"DataID" bigint,
	"RequestID" varchar(50),
	"Attributes" jsonb,
	"From" varchar(255),
	"To" varchar(255),
	"Requested" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"JourneyName" varchar(255),
	"EmailName" varchar(255),
	"SendTime" timestamp,
	"BrandID" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Segment" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ServiceStage" (
	"ID" integer PRIMARY KEY NOT NULL,
	"ServiceTypeID" integer,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ServiceType" (
	"ID" integer PRIMARY KEY NOT NULL,
	"BrandID" integer,
	"Code" varchar(15),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"RbiPipedriveID" integer,
	"NetsuiteID" integer,
	"NetsuiteDescription" varchar(150)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ServiceablePostcode" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Postcode" integer NOT NULL,
	"Suburb" varchar(150) NOT NULL,
	"State" varchar(3) NOT NULL,
	"Created" timestamp,
	"Updated" timestamp,
	"Region" varchar(150) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ShowcaseLead" (
	"ID" bigint PRIMARY KEY NOT NULL,
	"UserID" integer,
	"BrandID" integer,
	"DataID" bigint,
	"Offer" varchar(200),
	"ReferralPage" varchar(2000),
	"AcceptDbcTerms" boolean,
	"AcceptPartnerTerms" boolean,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"TransactionTypeID" integer,
	"PropertyTypeID" integer,
	"StateID" integer,
	"TimeToTransactID" integer,
	"Processed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "State" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"PDStateID" integer,
	"Supported" boolean DEFAULT false NOT NULL,
	"PDRbiStateID" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "StatusReason" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TempList" (
	"ID" bigint NOT NULL,
	"MatterID" integer,
	"Status" boolean DEFAULT false,
	"﻿CustomerName" varchar(1024)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TransactionService" (
	"ID" integer PRIMARY KEY NOT NULL,
	"TransactionID" integer,
	"ServiceTypeID" integer,
	"NurtureStreamID" integer,
	"StatusID" integer,
	"TimeToTransactID" integer,
	"CrmConfirmed" boolean,
	"CrmDealID" integer,
	"CrmStaffID" integer,
	"CrmStaffName" varchar(100),
	"CrmCreated" timestamp,
	"CrmEmailBCC" varchar(255),
	"CrmDoMarketing" boolean,
	"MovingDate" timestamp,
	"IsMovingIn" boolean,
	"LostTime" timestamp,
	"LostReason" varchar(100),
	"Referror" varchar(255),
	"Notes" text,
	"Created" timestamp,
	"Closed" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer,
	"CrmDealStatus" varchar(20),
	"CrmStaffTransact" varchar(100),
	"MatterReference" varchar(50),
	"WonTime" timestamp,
	"OfferApplied" varchar(50),
	"OfferDiscount" numeric,
	"OfferCurrency" varchar(10),
	"Postcode" varchar(20),
	"AutodialTime" timestamp,
	"AutodialStatus" varchar(10),
	"Price" numeric,
	"AuthorisedBy" varchar(100),
	"OfferApprovedBy" varchar(100),
	"CrmBookingDate" timestamp,
	"PropertyID" integer,
	"PaymentType" varchar(10),
	"MatterID" integer,
	"AutodialSkillID" integer,
	"AutodialListID" integer,
	"AutodialAction" varchar(20),
	"StageID" integer,
	"CrmLeadSource" varchar(200),
	"CrmLeadSourceCategory" varchar(200),
	"IsInvestor" boolean,
	"OtoProduct" varchar(20),
	"PreferredContactTime" varchar(100),
	"AgentName" varchar(200),
	"AthenaConsent" boolean,
	"Ownership" varchar(100),
	"AthenaLostReason" varchar(255),
	"PropertyLocation" varchar(200),
	"PropertySize" varchar(5),
	"ExternalPropertyID" varchar(100),
	"FirstProperty" boolean,
	"PropertySold" timestamp,
	"BuyerSaleStatus" varchar(10) DEFAULT 'Unknown',
	"ExternalContractUrl" varchar(300),
	"PropertyRptReq" varchar(3),
	"CampaignTrigger" varchar(30)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TransactionServiceHistory" (
	"ID" integer,
	"TransactionID" integer,
	"ServiceTypeID" integer,
	"NurtureStreamID" integer,
	"StatusID" integer,
	"TimeToTransactID" integer,
	"CrmConfirmed" boolean,
	"CrmDealID" integer,
	"CrmStaffID" integer,
	"CrmStaffName" varchar(100),
	"CrmCreated" timestamp,
	"CrmEmailBCC" varchar(255),
	"CrmDoMarketing" boolean,
	"MovingDate" timestamp,
	"IsMovingIn" boolean,
	"LostTime" timestamp,
	"LostReason" varchar(100),
	"Referror" varchar(255),
	"Notes" text,
	"Created" timestamp,
	"Closed" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"CrmDealStatus" varchar(20),
	"CrmStaffTransact" varchar(100),
	"MatterReference" varchar(50),
	"WonTime" timestamp,
	"OfferApplied" varchar(50),
	"OfferDiscount" numeric,
	"OfferCurrency" varchar(10),
	"Postcode" varchar(20),
	"AutodialTime" timestamp,
	"AutodialStatus" varchar(10),
	"Price" numeric,
	"AuthorisedBy" varchar(100),
	"OfferApprovedBy" varchar(100),
	"CrmBookingDate" timestamp,
	"PropertyID" integer,
	"PaymentType" varchar(10),
	"MatterID" integer,
	"AutodialAction" varchar(50),
	"AutodialSkillID" varchar(50),
	"AutodialListID" varchar(50),
	"StageID" integer,
	"CrmLeadSource" varchar(200),
	"CrmLeadSourceCategory" varchar(200),
	"IsInvestor" boolean,
	"OtoProduct" varchar(20),
	"PreferredContactTime" varchar(100),
	"AgentName" varchar(200),
	"AthenaConsent" boolean,
	"Ownership" varchar(100),
	"AthenaLostReason" varchar(255),
	"PropertyLocation" varchar(200),
	"PropertySize" varchar(5),
	"ExternalPropertyID" varchar(100),
	"FirstProperty" boolean,
	"PropertySold" timestamp,
	"BuyerSaleStatus" varchar(10),
	"ExternalContractUrl" varchar(300),
	"PropertyRptReq" varchar(3),
	"CampaignTrigger" varchar(30)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TransactionStage" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"PipedriveStageID" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TransactionStatus" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"CcaPDStageID" integer,
	"RbiPDStageID" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TransactionTime" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"SFMCEventDefinitionKey" varchar(255),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"SFMCEventDefinitionKeyRBI" varchar(255),
	"IsAutodial" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TransactionType" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp,
	"LeadSegment" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "typeorm_metadata" (
	"type" varchar NOT NULL,
	"database" varchar,
	"schema" varchar,
	"table" varchar,
	"name" varchar,
	"value" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UnsubscribeReason" (
	"ID" integer PRIMARY KEY NOT NULL,
	"Code" varchar(3),
	"Name" varchar(100),
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserAddress" (
	"ID" integer PRIMARY KEY NOT NULL,
	"AddressID" integer,
	"PersonID" integer,
	"AddressTypeID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserAddressHistory" (
	"ID" integer,
	"AddressID" integer,
	"PersonID" integer,
	"AddressTypeID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserBrowserMapping" (
	"ID" integer PRIMARY KEY NOT NULL,
	"CID" varchar(100),
	"UserID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserIdentity" (
	"ID" integer PRIMARY KEY NOT NULL,
	"UserID" integer,
	"CrmPersonID" integer,
	"AsContactID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"RbiPersonID" integer,
	"FormitizeClientID" varchar(10),
	"FormitizeContactID" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserProfile" (
	"ID" integer PRIMARY KEY NOT NULL,
	"HashID" varchar(255),
	"FullName" varchar(255),
	"Title" varchar(10),
	"FirstName" varchar(100),
	"MiddleName" varchar(100),
	"LastName" varchar(150),
	"PreferredName" varchar(100),
	"DateOfBirth" date,
	"CountryOfBirthID" integer,
	"MaritalStatusID" integer,
	"GenderID" integer,
	"CitizenCountryID" integer,
	"IsPermanentResident" boolean,
	"IsDeceased" boolean,
	"Email" varchar(255),
	"SecondaryEmail" varchar(255),
	"Phone" varchar(20),
	"HomePhone" varchar(20),
	"WorkPhone" varchar(20),
	"Mobile" varchar(20),
	"SecondaryMobile" varchar(20),
	"Occupation" varchar(255),
	"PreferredMethod" varchar(100),
	"ContactTime" varchar(50),
	"DeviceID" varchar(50),
	"HasSpamComplaint" boolean,
	"DisableDataSharing" boolean,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer,
	"State" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserProfileHistory" (
	"ID" integer,
	"HashID" varchar(255),
	"FullName" varchar(255),
	"Title" varchar(10),
	"FirstName" varchar(100),
	"MiddleName" varchar(100),
	"LastName" varchar(150),
	"PreferredName" varchar(100),
	"DateOfBirth" date,
	"CountryOfBirthID" integer,
	"MaritalStatusID" integer,
	"GenderID" integer,
	"CitizenCountryID" integer,
	"IsPermanentResident" boolean,
	"IsDeceased" boolean,
	"Email" varchar(255),
	"SecondaryEmail" varchar(255),
	"Phone" varchar(20),
	"HomePhone" varchar(20),
	"WorkPhone" varchar(20),
	"Mobile" varchar(20),
	"SecondaryMobile" varchar(20),
	"Occupation" varchar(255),
	"PreferredMethod" varchar(100),
	"ContactTime" varchar(50),
	"DeviceID" varchar(50),
	"HasSpamComplaint" boolean,
	"DisableDataSharing" boolean,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"State" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserSegment" (
	"ID" integer PRIMARY KEY NOT NULL,
	"UserID" integer,
	"SegmentID" integer,
	"PropertyTransactionID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserSegmentHistory" (
	"ID" integer,
	"UserID" integer,
	"SegmentID" integer,
	"PropertyTransactionID" integer,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserSubscription" (
	"ID" integer PRIMARY KEY NOT NULL,
	"UserID" integer,
	"BrandID" integer,
	"IsCustomer" boolean,
	"OptIn" boolean,
	"PreferEmail" boolean,
	"PreferSMS" boolean,
	"PreferPhone" boolean,
	"EmailSubscribed" timestamp,
	"EmailUnsubscribed" timestamp,
	"SmsSubscribed" timestamp,
	"SmsUnsubscribed" timestamp,
	"PhoneSubscribed" timestamp,
	"PhoneUnsubscribed" timestamp,
	"SellingComms" boolean,
	"BuyingComms" boolean,
	"TransferringComms" boolean,
	"UnsubscribeReasonID" integer,
	"Reason" text,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"Version" integer,
	"HasActiveOrder" boolean,
	"LastOrder" date,
	"LastInteraction" timestamp,
	"IsBuyer" boolean DEFAULT false,
	"IsAgent" boolean DEFAULT false,
	"IsAdmin" boolean DEFAULT false,
	"SettlementDate" date,
	"BrandPreferences" text,
	"LastAudience" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserSubscriptionHistory" (
	"ID" integer,
	"UserID" integer,
	"BrandID" integer,
	"IsCustomer" boolean,
	"OptIn" boolean,
	"PreferEmail" boolean,
	"PreferSMS" boolean,
	"PreferPhone" boolean,
	"EmailSubscribed" timestamp,
	"EmailUnsubscribed" timestamp,
	"SmsSubscribed" timestamp,
	"SmsUnsubscribed" timestamp,
	"PhoneSubscribed" timestamp,
	"PhoneUnsubscribed" timestamp,
	"SellingComms" boolean,
	"BuyingComms" boolean,
	"TransferringComms" boolean,
	"HasSpamComplaint" boolean,
	"UnsubscribeReasonID" integer,
	"Reason" text,
	"Created" timestamp,
	"Updated" timestamp,
	"DataID" bigint,
	"Deleted" timestamp,
	"SettlementDate" date,
	"HasActiveOrder" boolean,
	"LastOrder" date,
	"LastInteraction" timestamp,
	"IsBuyer" boolean DEFAULT false,
	"IsAgent" boolean DEFAULT false,
	"IsAdmin" boolean DEFAULT false,
	"BrandPreferences" text,
	"LastAudience" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conveyancingparty_conveyancingserviceid_idx" ON "ConveyancingParty" ("ConveyancingServiceID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jobs_queue_index" ON "jobs" ("queue");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestone_conveyancingserviceid_index" ON "Milestone" ("ConveyancingServiceID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestone_conveyancingtaskid_index" ON "Milestone" ("ConveyancingTaskID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestone_milestonetypeid_index" ON "Milestone" ("MilestoneTypeID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestone_propertyid_index" ON "Milestone" ("PropertyID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestone_transactionserviceid_index" ON "Milestone" ("TransactionServiceID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestone2_conveyancingserviceid_index" ON "Milestone2" ("ConveyancingServiceID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestone2_conveyancingtaskid_index" ON "Milestone2" ("ConveyancingTaskID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestone2_milestonetypeid_index" ON "Milestone2" ("MilestoneTypeID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestone2_propertyid_index" ON "Milestone2" ("PropertyID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestone2_transactionserviceid_index" ON "Milestone2" ("TransactionServiceID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestonehistory_conveyancingserviceid_index" ON "MilestoneHistory" ("ConveyancingServiceID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestonehistory_conveyancingtaskid_index" ON "MilestoneHistory" ("ConveyancingTaskID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestonehistory_milestonetypeid_index" ON "MilestoneHistory" ("MilestoneTypeID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestonehistory_propertyid_index" ON "MilestoneHistory" ("PropertyID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestonehistory_transactionserviceid_index" ON "MilestoneHistory" ("TransactionServiceID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "otolinking_ccaconveyancingserviceid_index" ON "OtoLinking" ("CcaConveyancingServiceID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "otolinking_ccaleadid_index" ON "OtoLinking" ("CcaLeadID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "otolinking_ccatransactionserviceid_index" ON "OtoLinking" ("CcaTransactionServiceID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "otolinking_rbiinspectionserviceid_index" ON "OtoLinking" ("RbiInspectionServiceID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "otolinking_rbileadid_index" ON "OtoLinking" ("RbiLeadID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "otolinking_rbitransactionserviceid_index" ON "OtoLinking" ("RbiTransactionServiceID");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "otolinking_userid_index" ON "OtoLinking" ("UserID");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Address" ADD CONSTRAINT "Address_StateID_State_ID_fk" FOREIGN KEY ("StateID") REFERENCES "State"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Address" ADD CONSTRAINT "Address_CountryID_Country_ID_fk" FOREIGN KEY ("CountryID") REFERENCES "Country"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Business" ADD CONSTRAINT "Business_BusinessTypeID_BusinessType_ID_fk" FOREIGN KEY ("BusinessTypeID") REFERENCES "BusinessType"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Business" ADD CONSTRAINT "Business_AddressID_Address_ID_fk" FOREIGN KEY ("AddressID") REFERENCES "Address"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BusinessUser" ADD CONSTRAINT "BusinessUser_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BusinessUser" ADD CONSTRAINT "BusinessUser_BusinessID_Business_ID_fk" FOREIGN KEY ("BusinessID") REFERENCES "Business"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ContactUs" ADD CONSTRAINT "ContactUs_BrandID_Brand_ID_fk" FOREIGN KEY ("BrandID") REFERENCES "Brand"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ContactUs" ADD CONSTRAINT "ContactUs_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ConveyancingParty" ADD CONSTRAINT "ConveyancingParty_ConveyancingServiceID_ConveyancingService_ID_fk" FOREIGN KEY ("ConveyancingServiceID") REFERENCES "ConveyancingService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ConveyancingParty" ADD CONSTRAINT "ConveyancingParty_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ConveyancingParty" ADD CONSTRAINT "ConveyancingParty_BusinessID_Business_ID_fk" FOREIGN KEY ("BusinessID") REFERENCES "Business"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ConveyancingParty" ADD CONSTRAINT "ConveyancingParty_RoleID_Role_ID_fk" FOREIGN KEY ("RoleID") REFERENCES "Role"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ConveyancingService" ADD CONSTRAINT "ConveyancingService_TransactionServiceID_TransactionService_ID_fk" FOREIGN KEY ("TransactionServiceID") REFERENCES "TransactionService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataInput" ADD CONSTRAINT "DataInput_SourceID_DataSource_ID_fk" FOREIGN KEY ("SourceID") REFERENCES "DataSource"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataPartner" ADD CONSTRAINT "DataPartner_DataPartnerCategoryID_DataPartnerCategory_ID_fk" FOREIGN KEY ("DataPartnerCategoryID") REFERENCES "DataPartnerCategory"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataPartnerPostcode" ADD CONSTRAINT "DataPartnerPostcode_DataPartnerStateID_DataPartnerState_ID_fk" FOREIGN KEY ("DataPartnerStateID") REFERENCES "DataPartnerState"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataPartnerState" ADD CONSTRAINT "DataPartnerState_DataPartnerID_DataPartner_ID_fk" FOREIGN KEY ("DataPartnerID") REFERENCES "DataPartner"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataPartnerState" ADD CONSTRAINT "DataPartnerState_StateID_State_ID_fk" FOREIGN KEY ("StateID") REFERENCES "State"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingAthenaLog" ADD CONSTRAINT "DataSharingAthenaLog_DataSharingCCALeadSegmentID_DataSharingCCALeadSegments_ID_fk" FOREIGN KEY ("DataSharingCCALeadSegmentID") REFERENCES "DataSharingCCALeadSegments"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingAthenaLog" ADD CONSTRAINT "DataSharingAthenaLog_DataPartnerID_DataPartner_ID_fk" FOREIGN KEY ("DataPartnerID") REFERENCES "DataPartner"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingCCAClientSegments" ADD CONSTRAINT "DataSharingCCAClientSegments_ConveyancingPartyID_ConveyancingParty_ID_fk" FOREIGN KEY ("ConveyancingPartyID") REFERENCES "ConveyancingParty"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingCCAClientSegments" ADD CONSTRAINT "DataSharingCCAClientSegments_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingCCAClientSegments" ADD CONSTRAINT "DataSharingCCAClientSegments_ConveyancingServiceID_ConveyancingService_ID_fk" FOREIGN KEY ("ConveyancingServiceID") REFERENCES "ConveyancingService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingCCALeadSegments" ADD CONSTRAINT "DataSharingCCALeadSegments_LeadID_Leads_ID_fk" FOREIGN KEY ("LeadID") REFERENCES "Leads"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingCCALeadSegments" ADD CONSTRAINT "DataSharingCCALeadSegments_TransactionServiceID_TransactionService_ID_fk" FOREIGN KEY ("TransactionServiceID") REFERENCES "TransactionService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingCCALeadSegments" ADD CONSTRAINT "DataSharingCCALeadSegments_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingMyConnectLog" ADD CONSTRAINT "DataSharingMyConnectLog_DataSharingCCAClientSegmentID_DataSharingCCAClientSegments_ID_fk" FOREIGN KEY ("DataSharingCCAClientSegmentID") REFERENCES "DataSharingCCAClientSegments"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingTintPaintLog" ADD CONSTRAINT "DataSharingTintPaintLog_UserProfileID_UserProfile_ID_fk" FOREIGN KEY ("UserProfileID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingTintPaintLog" ADD CONSTRAINT "DataSharingTintPaintLog_TransactionServiceID_TransactionService_ID_fk" FOREIGN KEY ("TransactionServiceID") REFERENCES "TransactionService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingTintPaintLog" ADD CONSTRAINT "DataSharingTintPaintLog_DataSharingCCALeadSegmentID_DataSharingCCAClientSegments_ID_fk" FOREIGN KEY ("DataSharingCCALeadSegmentID") REFERENCES "DataSharingCCAClientSegments"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingTintPaintLog" ADD CONSTRAINT "DataSharingTintPaintLog_DataSharingCCALeadSegmentID_DataSharingCCALeadSegments_ID_fk" FOREIGN KEY ("DataSharingCCALeadSegmentID") REFERENCES "DataSharingCCALeadSegments"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DataSharingTintPaintLog" ADD CONSTRAINT "DataSharingTintPaintLog_DataPartnerID_DataPartner_ID_fk" FOREIGN KEY ("DataPartnerID") REFERENCES "DataPartner"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormitizeJobType" ADD CONSTRAINT "FormitizeJobType_ServiceTypeID_ServiceType_ID_fk" FOREIGN KEY ("ServiceTypeID") REFERENCES "ServiceType"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormitizeJobType" ADD CONSTRAINT "FormitizeJobType_StateID_State_ID_fk" FOREIGN KEY ("StateID") REFERENCES "State"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormitizeLog" ADD CONSTRAINT "FormitizeLog_InspectionServiceID_InspectionService_ID_fk" FOREIGN KEY ("InspectionServiceID") REFERENCES "InspectionService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormitizeLog" ADD CONSTRAINT "FormitizeLog_TransactionServiceID_TransactionService_ID_fk" FOREIGN KEY ("TransactionServiceID") REFERENCES "TransactionService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InspectionService" ADD CONSTRAINT "InspectionService_TransactionServiceID_TransactionService_ID_fk" FOREIGN KEY ("TransactionServiceID") REFERENCES "TransactionService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Leads" ADD CONSTRAINT "Leads_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Leads" ADD CONSTRAINT "Leads_TransactionTypeID_TransactionType_ID_fk" FOREIGN KEY ("TransactionTypeID") REFERENCES "TransactionType"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Leads" ADD CONSTRAINT "Leads_PropertyTypeID_PropertyType_ID_fk" FOREIGN KEY ("PropertyTypeID") REFERENCES "PropertyType"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Leads" ADD CONSTRAINT "Leads_StateID_State_ID_fk" FOREIGN KEY ("StateID") REFERENCES "State"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Leads" ADD CONSTRAINT "Leads_TimeToTransactID_TransactionTime_ID_fk" FOREIGN KEY ("TimeToTransactID") REFERENCES "TransactionTime"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Leads" ADD CONSTRAINT "Leads_StatusID_LeadStatus_ID_fk" FOREIGN KEY ("StatusID") REFERENCES "LeadStatus"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Leads" ADD CONSTRAINT "Leads_StatusReasonID_StatusReason_ID_fk" FOREIGN KEY ("StatusReasonID") REFERENCES "StatusReason"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Leads" ADD CONSTRAINT "Leads_BrandID_Brand_ID_fk" FOREIGN KEY ("BrandID") REFERENCES "Brand"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Listing" ADD CONSTRAINT "Listing_PropertyID_Property_ID_fk" FOREIGN KEY ("PropertyID") REFERENCES "Property"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Listing" ADD CONSTRAINT "Listing_AgentID_UserProfile_ID_fk" FOREIGN KEY ("AgentID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MarketingUserSegments" ADD CONSTRAINT "MarketingUserSegments_ConveyancingPartyID_ConveyancingParty_ID_fk" FOREIGN KEY ("ConveyancingPartyID") REFERENCES "ConveyancingParty"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MarketingUserSegments" ADD CONSTRAINT "MarketingUserSegments_ConveyancingServiceID_ConveyancingService_ID_fk" FOREIGN KEY ("ConveyancingServiceID") REFERENCES "ConveyancingService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MarketingUserSegments" ADD CONSTRAINT "MarketingUserSegments_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_TransactionServiceID_TransactionService_ID_fk" FOREIGN KEY ("TransactionServiceID") REFERENCES "TransactionService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_PropertyID_Property_ID_fk" FOREIGN KEY ("PropertyID") REFERENCES "Property"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_ConveyancingServiceID_ConveyancingService_ID_fk" FOREIGN KEY ("ConveyancingServiceID") REFERENCES "ConveyancingService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_ConveyancingTaskID_ConveyancingTask_ID_fk" FOREIGN KEY ("ConveyancingTaskID") REFERENCES "ConveyancingTask"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_MilestoneTypeID_MilestoneType_ID_fk" FOREIGN KEY ("MilestoneTypeID") REFERENCES "MilestoneType"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Milestone2" ADD CONSTRAINT "Milestone2_TransactionServiceID_TransactionService_ID_fk" FOREIGN KEY ("TransactionServiceID") REFERENCES "TransactionService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Milestone2" ADD CONSTRAINT "Milestone2_PropertyID_Property_ID_fk" FOREIGN KEY ("PropertyID") REFERENCES "Property"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Milestone2" ADD CONSTRAINT "Milestone2_ConveyancingServiceID_ConveyancingService_ID_fk" FOREIGN KEY ("ConveyancingServiceID") REFERENCES "ConveyancingService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Milestone2" ADD CONSTRAINT "Milestone2_ConveyancingTaskID_ConveyancingTask_ID_fk" FOREIGN KEY ("ConveyancingTaskID") REFERENCES "ConveyancingTask"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Milestone2" ADD CONSTRAINT "Milestone2_MilestoneTypeID_MilestoneType_ID_fk" FOREIGN KEY ("MilestoneTypeID") REFERENCES "MilestoneType"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MovingHubLog" ADD CONSTRAINT "MovingHubLog_ConveyancingServiceID_ConveyancingService_ID_fk" FOREIGN KEY ("ConveyancingServiceID") REFERENCES "ConveyancingService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OfferCode" ADD CONSTRAINT "OfferCode_BrandID_Brand_ID_fk" FOREIGN KEY ("BrandID") REFERENCES "Brand"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OtoLinking" ADD CONSTRAINT "OtoLinking_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OtoLinking" ADD CONSTRAINT "OtoLinking_CcaLeadID_Leads_ID_fk" FOREIGN KEY ("CcaLeadID") REFERENCES "Leads"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OtoLinking" ADD CONSTRAINT "OtoLinking_CcaTransactionServiceID_TransactionService_ID_fk" FOREIGN KEY ("CcaTransactionServiceID") REFERENCES "TransactionService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OtoLinking" ADD CONSTRAINT "OtoLinking_CcaConveyancingServiceID_ConveyancingService_ID_fk" FOREIGN KEY ("CcaConveyancingServiceID") REFERENCES "ConveyancingService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OtoLinking" ADD CONSTRAINT "OtoLinking_RbiLeadID_Leads_ID_fk" FOREIGN KEY ("RbiLeadID") REFERENCES "Leads"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OtoLinking" ADD CONSTRAINT "OtoLinking_RbiTransactionServiceID_TransactionService_ID_fk" FOREIGN KEY ("RbiTransactionServiceID") REFERENCES "TransactionService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OtoLinking" ADD CONSTRAINT "OtoLinking_RbiInspectionServiceID_InspectionService_ID_fk" FOREIGN KEY ("RbiInspectionServiceID") REFERENCES "InspectionService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PipeDriveLog" ADD CONSTRAINT "PipeDriveLog_TransactionServiceID_TransactionService_ID_fk" FOREIGN KEY ("TransactionServiceID") REFERENCES "TransactionService"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PipedriveDDLists" ADD CONSTRAINT "PipedriveDDLists_BrandID_Brand_ID_fk" FOREIGN KEY ("BrandID") REFERENCES "Brand"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Property" ADD CONSTRAINT "Property_AddressID_Address_ID_fk" FOREIGN KEY ("AddressID") REFERENCES "Address"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Property" ADD CONSTRAINT "Property_PropertyTypeID_PropertyType_ID_fk" FOREIGN KEY ("PropertyTypeID") REFERENCES "PropertyType"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_PropertyID_Property_ID_fk" FOREIGN KEY ("PropertyID") REFERENCES "Property"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_DocumentTypeID_DocumentType_ID_fk" FOREIGN KEY ("DocumentTypeID") REFERENCES "DocumentType"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PropertyHelperApplication" ADD CONSTRAINT "PropertyHelperApplication_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PropertyOwner" ADD CONSTRAINT "PropertyOwner_PropertyID_Property_ID_fk" FOREIGN KEY ("PropertyID") REFERENCES "Property"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PropertyOwner" ADD CONSTRAINT "PropertyOwner_OwnerID_UserProfile_ID_fk" FOREIGN KEY ("OwnerID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PropertyTransaction" ADD CONSTRAINT "PropertyTransaction_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PropertyTransaction" ADD CONSTRAINT "PropertyTransaction_PropertyID_Property_ID_fk" FOREIGN KEY ("PropertyID") REFERENCES "Property"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PropertyTransaction" ADD CONSTRAINT "PropertyTransaction_TransactionTypeID_TransactionType_ID_fk" FOREIGN KEY ("TransactionTypeID") REFERENCES "TransactionType"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PropertyTransaction" ADD CONSTRAINT "PropertyTransaction_PropertyTypeID_PropertyType_ID_fk" FOREIGN KEY ("PropertyTypeID") REFERENCES "PropertyType"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PropertyTransaction" ADD CONSTRAINT "PropertyTransaction_TransactionStageID_TransactionStage_ID_fk" FOREIGN KEY ("TransactionStageID") REFERENCES "TransactionStage"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PropertyTransaction" ADD CONSTRAINT "PropertyTransaction_StateID_State_ID_fk" FOREIGN KEY ("StateID") REFERENCES "State"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RACVMembership" ADD CONSTRAINT "RACVMembership_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RACVMembership" ADD CONSTRAINT "RACVMembership_LeadID_Leads_ID_fk" FOREIGN KEY ("LeadID") REFERENCES "Leads"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "SalesforceEmailLog" ADD CONSTRAINT "SalesforceEmailLog_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ShowcaseLead" ADD CONSTRAINT "ShowcaseLead_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ShowcaseLead" ADD CONSTRAINT "ShowcaseLead_BrandID_Brand_ID_fk" FOREIGN KEY ("BrandID") REFERENCES "Brand"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TransactionService" ADD CONSTRAINT "TransactionService_TransactionID_PropertyTransaction_ID_fk" FOREIGN KEY ("TransactionID") REFERENCES "PropertyTransaction"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TransactionService" ADD CONSTRAINT "TransactionService_ServiceTypeID_ServiceType_ID_fk" FOREIGN KEY ("ServiceTypeID") REFERENCES "ServiceType"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TransactionService" ADD CONSTRAINT "TransactionService_NurtureStreamID_NurtureStream_ID_fk" FOREIGN KEY ("NurtureStreamID") REFERENCES "NurtureStream"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TransactionService" ADD CONSTRAINT "TransactionService_StatusID_TransactionStatus_ID_fk" FOREIGN KEY ("StatusID") REFERENCES "TransactionStatus"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TransactionService" ADD CONSTRAINT "TransactionService_TimeToTransactID_TransactionTime_ID_fk" FOREIGN KEY ("TimeToTransactID") REFERENCES "TransactionTime"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_AddressID_Address_ID_fk" FOREIGN KEY ("AddressID") REFERENCES "Address"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_PersonID_UserProfile_ID_fk" FOREIGN KEY ("PersonID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_AddressTypeID_AddressType_ID_fk" FOREIGN KEY ("AddressTypeID") REFERENCES "AddressType"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserIdentity" ADD CONSTRAINT "UserIdentity_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSegment" ADD CONSTRAINT "UserSegment_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSegment" ADD CONSTRAINT "UserSegment_SegmentID_Segment_ID_fk" FOREIGN KEY ("SegmentID") REFERENCES "Segment"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_UserID_UserProfile_ID_fk" FOREIGN KEY ("UserID") REFERENCES "UserProfile"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_BrandID_Brand_ID_fk" FOREIGN KEY ("BrandID") REFERENCES "Brand"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_UnsubscribeReasonID_UnsubscribeReason_ID_fk" FOREIGN KEY ("UnsubscribeReasonID") REFERENCES "UnsubscribeReason"("ID") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
