-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE IF NOT EXISTS "time_entry" (
	"time_entry_id" integer NOT NULL,
	"participant_id" integer NOT NULL,
	"timesheet_date" date NOT NULL,
	"description" varchar(8000),
	"notes" varchar(8000),
	"quick_code_id" integer,
	"start_time" "time(6)",
	"timer_status" varchar(8000) NOT NULL,
	"timer_started_client_timestamp" timestamp(6) with time zone,
	"timer_duration_seconds" integer NOT NULL,
	"actual_hours" numeric(18, 2) NOT NULL,
	"billable_hours" numeric(18, 2) NOT NULL,
	"utbms_activity_code" varchar(8000),
	"utbms_task_code" varchar(8000),
	"utbms_timekeeper_code" varchar(8000),
	"linked_task_id" integer,
	"linked_action_id" integer,
	"linked_email_id" integer,
	"linked_appointment_id" integer,
	"linked_alert_id" integer,
	"linked_participant_id" integer,
	"linked_document_log_id" integer,
	"linked_document_template_id" integer,
	"linked_data_collection_id" integer,
	"billing_behavior" varchar(8000) NOT NULL,
	"billing_fixed_fee_action_behavior" varchar(8000) NOT NULL,
	"rate_id" integer,
	"rate_unit_price" numeric(18, 2),
	"rate_source" varchar(8000),
	"rate_timestamp" timestamp(6) with time zone,
	"billable_amount_type" varchar(8000) NOT NULL,
	"billable_amount" numeric(18, 2) NOT NULL,
	"billing_income_account_id" integer,
	"billing_income_gst_code_id" integer,
	"created_timestamp" timestamp(6) with time zone NOT NULL,
	"created_by_participant_id" integer NOT NULL,
	"import_external_reference" varchar(8000),
	"sale_purchase_id" integer,
	"record_version" integer NOT NULL,
	"tag_id" integer,
	"is_billable" char(1) NOT NULL,
	"deprecated_confirmed_non_billable" char(1) NOT NULL,
	"data_importer_id" integer,
	"linked_phone_call_id" integer,
	"deprecated_is_on_billing_hold" char(1) NOT NULL,
	"qbo_product_service_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "file_note_tag" (
	"note_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "action_type" (
	"action_type_id" integer NOT NULL,
	"action_type_name" varchar(8000) NOT NULL,
	"description" varchar(255),
	"base_directory" varchar(255) NOT NULL,
	"copyright_holder" text,
	"copyright_contact" text,
	"copyright_email_address" text,
	"track_task_time_actual" char(1) NOT NULL,
	"track_task_time_billable" char(1) NOT NULL,
	"enable_gantt_chart" char(1) NOT NULL,
	"use_for_marketing_campaigns" char(1) NOT NULL,
	"use_for_marketing_events" char(1) NOT NULL,
	"use_for_employees" char(1) NOT NULL,
	"use_for_crm" char(1) NOT NULL,
	"disabled" char(1) NOT NULL,
	"enable_action_image" char(1) NOT NULL,
	"default_email_subject" varchar(8000),
	"use_for_debt_collection" char(1) NOT NULL,
	"is_billable" char(1) NOT NULL,
	"billing_preference_id" integer,
	"allow_close_with_open_invoice" char(1),
	"logo_filename" varchar(8000),
	"custom_logo_filename" varchar(8000),
	"custom_logo_directory" varchar(8000),
	"custom_logo_file_size" integer,
	"custom_logo_modified_timestamp" timestamp(6) with time zone,
	"template_identifier" varchar(8000),
	"application_identifier" varchar(8000),
	"allow_inline_customizing" char(1) NOT NULL,
	"utbms_enabled" char(1) NOT NULL,
	"default_time_record_activity_mode" varchar(8000) NOT NULL,
	"utbms_task_category_code" varchar(8000),
	"allow_close_with_unbilled_time" char(1) NOT NULL,
	"is_file_reference_mandatory" char(1) NOT NULL,
	"is_file_reference_unique" char(1) NOT NULL,
	"limit_edits_to_email_addresses" varchar(8000),
	"allow_close_with_unbilled_disbursement" char(1) NOT NULL,
	"show_aml_review_status" char(1) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "participant_note" (
	"note_id" integer NOT NULL,
	"entered_time_stamp" timestamp(6) with time zone NOT NULL,
	"note_text" varchar(8000) NOT NULL,
	"entered_by" varchar(8000) NOT NULL,
	"participant_id" integer NOT NULL,
	"note_time_stamp" timestamp(6) with time zone NOT NULL,
	"security_object_id" integer,
	"source" varchar(8000) NOT NULL,
	"entered_by_participant_id" integer,
	"data_importer_id" integer,
	"import_external_reference" varchar(8000)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_collection" (
	"data_collection_id" integer NOT NULL,
	"data_collection_name" varchar(8000) NOT NULL,
	"action_type_id" integer NOT NULL,
	"multiple_records" char(1) NOT NULL,
	"description" varchar(8000),
	"icon" text,
	"navbar_order" integer,
	"navbar_label" varchar(8000) NOT NULL,
	"plugin_url" varchar(8000),
	"always_show_descriptions" char(1),
	"enable_sharing_between_related_actions" char(1) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "columns" (
	"table_catalog" "name",
	"table_schema" "name",
	"table_name" "name",
	"column_name" "name",
	"ordinal_position" integer,
	"column_default" varchar,
	"is_nullable" varchar(3),
	"data_type" varchar,
	"character_maximum_length" integer,
	"character_octet_length" integer,
	"numeric_precision" integer,
	"numeric_precision_radix" integer,
	"numeric_scale" integer,
	"datetime_precision" integer,
	"interval_type" varchar,
	"interval_precision" integer,
	"character_set_catalog" "name",
	"character_set_schema" "name",
	"character_set_name" "name",
	"collation_catalog" "name",
	"collation_schema" "name",
	"collation_name" "name",
	"domain_catalog" "name",
	"domain_schema" "name",
	"domain_name" "name",
	"udt_catalog" "name",
	"udt_schema" "name",
	"udt_name" "name",
	"scope_catalog" "name",
	"scope_schema" "name",
	"scope_name" "name",
	"maximum_cardinality" integer,
	"dtd_identifier" "name",
	"is_self_referencing" varchar(3),
	"is_identity" varchar(3),
	"identity_generation" varchar,
	"identity_start" varchar,
	"identity_increment" varchar,
	"identity_maximum" varchar,
	"identity_minimum" varchar,
	"identity_cycle" varchar(3),
	"is_generated" varchar,
	"generation_expression" varchar,
	"is_updatable" varchar(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task" (
	"task_id" integer NOT NULL,
	"action_id" integer,
	"task_name" varchar(8000) NOT NULL,
	"current_status" varchar(20),
	"priority" varchar(20) NOT NULL,
	"due_date" timestamp(6) with time zone NOT NULL,
	"created_time_stamp" timestamp(6) with time zone,
	"started_time_stamp" timestamp(6) with time zone,
	"completed_time_stamp" timestamp(6) with time zone,
	"assigned_to_participant_id" integer NOT NULL,
	"complete_before_end_of_step_number" integer,
	"complete_before_start_of_step_number" integer,
	"assigned_by" varchar(8000),
	"zz_rate_id" integer,
	"zz_actual_hours" numeric(10, 2),
	"zz_billable_hours" numeric(10, 2),
	"linked_document_template_id" integer,
	"linked_data_collection_id" integer,
	"default_task_id" integer,
	"zz_expected_duration_value" integer,
	"zz_expected_duration_units" varchar(25),
	"zz_percent_complete" integer,
	"zz_show_on_gantt_chart" char(1),
	"zz_cannot_start_before_time_stamp" timestamp(6) with time zone,
	"description" varchar(8000),
	"zz_activity_id" integer,
	"tag_id" integer,
	"zz_is_part_billed" char(1),
	"zz_confirmed_non_billable" char(1),
	"zz_confirmed_non_billable_by_participant_id" integer,
	"zz_confirmed_non_billable_timestamp" timestamp(6) with time zone,
	"is_on_billing_hold" char(1),
	"due_date_trigger" char(1) NOT NULL,
	"trigger_data_collection_id" integer,
	"trigger_data_collection_field_name" varchar(8000),
	"trigger_days_offset" integer,
	"trigger_weekdays_only" char(1) NOT NULL,
	"import_external_reference" varchar(8000),
	"zz_utbms_activity_code" varchar(8000),
	"zz_utbms_task_code" varchar(8000),
	"zz_utbms_timekeeper_code" varchar(8000),
	"zz_units_quantity" numeric(18, 6),
	"zz_units_minutes_per_unit" numeric(18, 6),
	"task_list_id" integer NOT NULL,
	"notes" varchar(8000),
	"assigned_timestamp" timestamp(6) with time zone NOT NULL,
	"deleted_timestamp" timestamp(6) with time zone,
	"hidden_timestamp" timestamp(6) with time zone,
	"create_time_entry_when_complete" char(1) NOT NULL,
	"quick_code_id" integer,
	"plugin_reference" varchar(8000),
	"plugin_data" varchar(8000),
	"plugin_sync_timestamp" varchar(8000),
	"data_importer_id" integer,
	"last_modified_time_stamp" timestamp(6) with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_tag" (
	"email_id" integer NOT NULL,
	"tag_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "participant_default_type" (
	"participant_id" integer NOT NULL,
	"participant_type_id" integer NOT NULL,
	"data_importer_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "participant_default_type_data_field_value" (
	"participant_id" integer NOT NULL,
	"participant_type_id" integer NOT NULL,
	"participant_type_data_field_id" integer NOT NULL,
	"string_value" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_field_value" (
	"data_collection_id" integer NOT NULL,
	"data_field_name" varchar(50) NOT NULL,
	"record_id" integer NOT NULL,
	"string_value" text,
	"action_id" integer NOT NULL,
	"timestamp_value" timestamp(6),
	"decimal_value" numeric(18, 6),
	"last_modified_time_stamp" timestamp(6) with time zone,
	"last_modified_by_user_id" integer,
	"split_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "step_tree_jump" (
	"node_id" integer NOT NULL,
	"jump_to_node_id" integer NOT NULL,
	"weight" integer,
	"alternate_step_number" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ac_receipt" (
	"receipt_id" integer NOT NULL,
	"transaction_id" integer,
	"template_id" integer,
	"receipt_number" varchar(255) NOT NULL,
	"receipt_issued_by" text NOT NULL,
	"receipt_date" timestamp(6) with time zone NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"received_from" text NOT NULL,
	"beneficiary" text NOT NULL,
	"description" text,
	"first_printed_timestamp" timestamp(6) with time zone,
	"last_printed_timestamp" timestamp(6) with time zone,
	"directory" text,
	"file_name" text,
	"payment_method" text NOT NULL,
	"division_id" integer NOT NULL,
	"auto_number" integer NOT NULL,
	"receipt_type" varchar(8000) NOT NULL,
	"deleted_by_participant_id" integer,
	"deleted_timestamp" timestamp(6) with time zone,
	"deleted_reason" varchar(8000),
	"deleted_transaction_id" integer,
	"payment_date" timestamp(6) with time zone NOT NULL,
	"receipt_accounting_document_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag_location_tag" (
	"tag_id" integer NOT NULL,
	"location_name" varchar(8000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_collection_record" (
	"record_id" integer NOT NULL,
	"data_collection_id" integer NOT NULL,
	"action_id" integer NOT NULL,
	"import_external_reference" varchar(8000),
	"data_importer_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_association" (
	"association_id" integer NOT NULL,
	"email_id" integer NOT NULL,
	"participant_id" integer,
	"sale_purchase_id" integer,
	"action_id" integer,
	"employee_id" integer,
	"payroll_id" integer,
	"alert_id" integer,
	"appointment_id" integer,
	"prospect_id" integer,
	"event_id" integer,
	"campaign_id" integer,
	"file_reference" varchar(8000)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ac_action_disbursement" (
	"disbursement_id" integer NOT NULL,
	"disbursement_template_id" integer,
	"action_id" integer NOT NULL,
	"disbursement_date" date NOT NULL,
	"description" varchar(8000),
	"quantity" numeric(16, 6) NOT NULL,
	"uom_id" integer NOT NULL,
	"unit_price" numeric(18, 4) NOT NULL,
	"unit_price_includes_tax" char(1) NOT NULL,
	"gst_code_id" integer,
	"default_income_account_id" integer,
	"sale_invoice_line_item_id" integer,
	"entered_by_participant_id" integer NOT NULL,
	"entered_timestamp" timestamp(6) with time zone NOT NULL,
	"is_part_billed" char(1),
	"is_on_billing_hold" char(1),
	"record_version_number" integer NOT NULL,
	"utbms_expense_code" varchar(8000),
	"deposit_withdrawal_line_item_id" integer,
	"import_external_reference" varchar(8000),
	"import_batch_id" varchar(8000),
	"data_importer_id" integer,
	"is_from_purchase" char(1) NOT NULL,
	"vendor_reference" varchar(8000),
	"qbo_product_service_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "action_participant" (
	"action_id" integer NOT NULL,
	"participant_type_id" integer NOT NULL,
	"participant_id" integer NOT NULL,
	"participant_number" integer NOT NULL,
	"has_portal_access" char(1),
	"data_importer_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "awsdms_apply_exceptions" (
	"TASK_NAME" varchar(128) NOT NULL,
	"TABLE_OWNER" varchar(128) NOT NULL,
	"TABLE_NAME" varchar(128) NOT NULL,
	"ERROR_TIME" timestamp NOT NULL,
	"STATEMENT" text NOT NULL,
	"ERROR" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag_location" (
	"location_name" varchar(8000) NOT NULL,
	"description" varchar(8000)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "participant" (
	"participant_id" integer NOT NULL,
	"company_flag" char(1) NOT NULL,
	"company_name" varchar(8000),
	"salutation" varchar(8000),
	"first_name" varchar(8000),
	"middle_name" varchar(8000),
	"last_name" varchar(8000),
	"address_line_1" varchar(8000),
	"address_line_2" varchar(8000),
	"city" varchar(8000),
	"state_province" varchar(8000),
	"post_code" varchar(8000),
	"country_id" char(2) NOT NULL,
	"mailing_address_line_1" varchar(8000),
	"mailing_address_line_2" varchar(8000),
	"mailing_city" varchar(8000),
	"mailing_state_province" varchar(8000),
	"mailing_post_code" varchar(8000),
	"mailing_country_id" char(2) NOT NULL,
	"phone1" varchar(8000),
	"phone1_description" varchar(8000),
	"phone2" varchar(8000),
	"phone2_description" varchar(8000),
	"phone3" varchar(8000),
	"phone3_description" varchar(8000),
	"phone4" varchar(8000),
	"phone4_description" varchar(8000),
	"fax" varchar(8000),
	"text_sms" varchar(8000),
	"e_mail" varchar(8000),
	"website" text,
	"occupation" varchar(8000),
	"tax_number" varchar(8000),
	"date_of_birth" date,
	"marital_status" varchar(8000),
	"gender" char(1),
	"e_mail_format" varchar(20),
	"notification_method" varchar(20),
	"preferred_name" varchar(8000),
	"division_id" integer,
	"display_name" varchar(8000) NOT NULL,
	"import_external_reference" varchar(8000),
	"private_to_participant_id" integer,
	"image_directory" varchar(8000),
	"image_filename" varchar(8000),
	"thumbnail_directory" varchar(8000),
	"thumbnail_filename" varchar(8000),
	"newsletter_subscriber" char(1) NOT NULL,
	"suffix" varchar(8000),
	"phone1_country_code" integer,
	"phone2_country_code" integer,
	"phone3_country_code" integer,
	"phone4_country_code" integer,
	"phone1_area_code" integer,
	"phone2_area_code" integer,
	"phone3_area_code" integer,
	"phone4_area_code" integer,
	"phone1_notes" varchar(8000),
	"phone2_notes" varchar(8000),
	"phone3_notes" varchar(8000),
	"phone4_notes" varchar(8000),
	"billing_preference_id" integer,
	"last_modified_timestamp" timestamp(6) with time zone NOT NULL,
	"image_size_total" integer,
	"created_timestamp" timestamp(6) with time zone NOT NULL,
	"date_of_death" date,
	"county" varchar(8000),
	"mailing_county" varchar(8000),
	"citizen_of_country_id" char(2),
	"rate_sheet_price_group_id" integer,
	"display_initials" varchar(8000),
	"timekeeper_income_account_id" integer,
	"data_importer_id" integer,
	"signature_directory" varchar(8000),
	"signature_filename" varchar(8000),
	"signature_hash" varchar(8000),
	"is_deceased" char(1) NOT NULL,
	"aml_verification_status" varchar(8000) NOT NULL,
	"aml_verification_progress" integer NOT NULL,
	"aml_risk" varchar(8000) NOT NULL,
	"aml_note" varchar(8000),
	"gender_type_name" varchar(8000),
	"aliases" varchar(8000),
	"date_of_birth_status" varchar(8000) NOT NULL,
	"country_id_of_birth" char(2),
	"class_aboriginal_status" varchar(8000),
	"class_primary_language" varchar(8000),
	"class_disability_status" varchar(8000),
	"class_year_of_arrival" integer,
	"mailing_country_subdivision_id" char(3),
	"country_subdivision_id" char(3),
	"country_subdivision_id_of_birth" char(3),
	"qbo_product_service_id" integer,
	"debtor_statement_email" varchar(8000),
	"debtor_statement_send_email" char(1),
	"debtor_statement_use_primary_email" char(1)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ac_transaction" (
	"transaction_id" integer NOT NULL,
	"division_id" integer NOT NULL,
	"system_user_participant_id" integer NOT NULL,
	"journal_id" integer NOT NULL,
	"entry_timestamp" timestamp(6) with time zone NOT NULL,
	"transaction_date" date NOT NULL,
	"journal_memo" text NOT NULL,
	"associated_participant_id" integer,
	"associated_participant_other" varchar(255),
	"template_id" integer,
	"source_editor" varchar(8000),
	"source_editor_data" varchar(8000),
	"gst_direction" char(1) NOT NULL,
	"session_id" varchar(8000),
	"reversal_transaction_id" integer,
	"reversal_reason" varchar(8000),
	"reversal_of_transaction_id" integer,
	"post_for_sale_purchase_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "file_note" (
	"note_id" integer NOT NULL,
	"action_id" integer NOT NULL,
	"entered_time_stamp" timestamp(6) with time zone NOT NULL,
	"note_text" text NOT NULL,
	"participant_id" integer NOT NULL,
	"entered_by" varchar(100),
	"source" varchar(25),
	"note_time_stamp" timestamp(6) with time zone,
	"security_object_id" integer,
	"tag_id" integer,
	"document_log_id" integer,
	"system_change_type" varchar(8000),
	"import_external_reference" varchar(8000),
	"data_importer_id" integer,
	"note_rich_text" text,
	"is_draft" char(1) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "step_sale_status" (
	"action_type_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"sale_status" varchar(25) NOT NULL,
	"start_end" char(1) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "step_trust_bank_account" (
	"step_trust_bank_account_id" integer NOT NULL,
	"action_type_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"trust_account_type" varchar(8000) NOT NULL,
	"required_status" varchar(8000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "participant_type" (
	"participant_type_id" integer NOT NULL,
	"participant_type_name" varchar(8000) NOT NULL,
	"description" varchar(8000),
	"is_base_participant_type" char(1) NOT NULL,
	"company_flag_value" char(1),
	"tax_number_alias" varchar(8000)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "step_action_type" (
	"step_action_type_id" integer NOT NULL,
	"action_type_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"related_action_type_id" integer NOT NULL,
	"is_mandatory" char(1) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "step_data_field" (
	"step_data_field_id" integer NOT NULL,
	"action_type_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"data_collection_id" integer NOT NULL,
	"data_field_name" varchar(8000) NOT NULL,
	"is_required" char(1) NOT NULL,
	"display_order" integer NOT NULL,
	"override_data_collection_name" varchar(8000),
	"override_label" varchar(8000),
	"override_description" varchar(8000),
	"default_value" varchar(8000),
	"force_default_value" char(1)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "action" (
	"action_id" integer NOT NULL,
	"action_type_id" integer NOT NULL,
	"action_name" text NOT NULL,
	"file_reference" text,
	"date_created" date NOT NULL,
	"assigned_to_participant_id" integer NOT NULL,
	"node_id" integer NOT NULL,
	"step_number" integer,
	"action_status" varchar(25),
	"division_id" integer NOT NULL,
	"priority" integer NOT NULL,
	"import_external_reference" varchar(8000),
	"security_object_id" integer,
	"is_deleted" char(1) NOT NULL,
	"deleted_by_participant_id" integer,
	"deleted_by_name" varchar(8000),
	"deleted_timestamp" timestamp(6) with time zone,
	"tag_id" integer,
	"image_modified_identifier" varchar(8000),
	"last_activity_timestamp" timestamp(6) with time zone NOT NULL,
	"override_is_billable" char(1),
	"billing_preference_id" integer,
	"image_size_total" integer,
	"status_timestamp" timestamp(6) with time zone NOT NULL,
	"time_record_activity_mode" varchar(8000),
	"rate_sheet_price_group_id" integer,
	"is_restricted_access_enabled" char(1) NOT NULL,
	"warning_message_text" varchar(8000),
	"trust_bypass_invoice_pay_hold" char(1) NOT NULL,
	"ebm_billing_status" varchar(8000),
	"data_importer_id" integer,
	"mass_billing_responsible_lawyer_display_name" varchar(8000),
	"mass_billing_ebm_billing_status" varchar(8000),
	"mass_billing_additional_customer_display_name" varchar(8000),
	"aml_review_status" varchar(8000) NOT NULL,
	"mass_billing_responsible_lawyer_participant_id" varchar(8000)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag" (
	"tag_id" integer NOT NULL,
	"tag_name" varchar(8000) NOT NULL,
	"description" varchar(8000),
	"default_colour" varchar(8000) NOT NULL,
	"icon_image_16x16" varchar(8000),
	"icon_image_24x24" varchar(8000),
	"icon_image_32x32" varchar(8000),
	"parent_tag_id" integer,
	"custom_css_style" varchar(8000)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "action_participant_data_field_value" (
	"action_id" integer NOT NULL,
	"participant_type_id" integer NOT NULL,
	"participant_id" integer NOT NULL,
	"participant_type_data_field_id" integer NOT NULL,
	"string_value" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "step" (
	"action_type_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"step_name" varchar(50) NOT NULL,
	"description" varchar(255),
	"default_file_note" varchar(255),
	"list_order" integer,
	"default_assigned_to_participant_type_id" integer,
	"default_assigned_to_participant_type_mandatory" char(1),
	"default_action_status" varchar(25),
	"pre_step_form_id" integer,
	"post_step_form_id" integer,
	"can_create_sale_quote" char(1) NOT NULL,
	"can_create_sale_order" char(1) NOT NULL,
	"can_create_sale_invoice" char(1) NOT NULL,
	"can_create_purchase_quote" char(1) NOT NULL,
	"can_create_purchase_order" char(1) NOT NULL,
	"can_create_purchase_invoice" char(1) NOT NULL,
	"min_action_sale_probability" integer,
	"max_action_sale_probability" integer,
	"file_note_minimum_length" integer NOT NULL,
	"show_action_sale_probability" char(1) NOT NULL,
	"show_action_sale_expected_sale_amount" char(1) NOT NULL,
	"show_action_sale_expected_sale_date" char(1) NOT NULL,
	"show_action_sale_sales_lead_source_notes" char(1) NOT NULL,
	"allow_auto_step_change" char(1) NOT NULL,
	"show_action_sale_marketing_medium" char(1) NOT NULL,
	"show_action_sale_payment_schedule" char(1),
	"default_action_sale_expected_amount" numeric(18, 2),
	"force_action_sale_status" varchar(8000),
	"show_action_sale_linked_quote" char(1),
	"show_action_sale_linked_order" char(1),
	"show_action_billing_settings" char(1),
	"show_action_billing_print_settings" char(1),
	"show_action_billing_email_settings" char(1),
	"show_action_aml" char(1)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "step_participant_type" (
	"step_participant_type_id" integer NOT NULL,
	"action_type_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"participant_type_id" integer NOT NULL,
	"is_required" char(1) NOT NULL,
	"display_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "step_tree" (
	"node_id" integer NOT NULL,
	"action_type_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"parent_node_id" integer,
	"is_active" char(1) NOT NULL,
	"weight" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_field" (
	"data_collection_id" integer NOT NULL,
	"data_field_name" varchar(8000) NOT NULL,
	"data_type" varchar(8000) NOT NULL,
	"label" varchar(8000) NOT NULL,
	"form_order" integer,
	"list_order" integer,
	"required_field" char(1),
	"width" integer,
	"height" integer,
	"class" text,
	"style" text,
	"description" varchar(8000),
	"tag_id" integer,
	"custom_html_below_element" varchar(8000),
	"custom_html_above_element" varchar(8000),
	"show_total_in_list_view" char(1),
	"limit_to_participant_type_id" integer,
	"parent_dropdown_field_name" varchar(8000)
);

*/