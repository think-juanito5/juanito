CREATE SCHEMA "bronze";
--> statement-breakpoint
CREATE SCHEMA "cca";
--> statement-breakpoint
CREATE SCHEMA "gold";
--> statement-breakpoint
CREATE SCHEMA "notif";
--> statement-breakpoint
CREATE SCHEMA "silver";
--> statement-breakpoint
CREATE SCHEMA "wfm";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bronze"."budget" (
	"brand_id" integer NOT NULL,
	"month_ending_id" date NOT NULL,
	"revenue" numeric(10, 2) NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"leads" integer,
	"sales" integer,
	CONSTRAINT "budget_cca_pkey" PRIMARY KEY("brand_id","month_ending_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bronze"."employees" (
	"extracted" timestamp with time zone PRIMARY KEY NOT NULL,
	"data" text NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bronze"."employees_audit" (
	"associate_id" text NOT NULL,
	"field" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"modified" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bronze"."employees_history" (
	"associate_id" text NOT NULL,
	"title" text,
	"name" text,
	"status" text,
	"position" text,
	"team" text,
	"department" text,
	"manager" text,
	"immediate_leader" text,
	"working_arrangement" text,
	"employment_status" text,
	"start_date" date,
	"effective_end_date" date,
	"last_working_day" date,
	"change_date" date,
	"country" text,
	"state_key" smallint,
	"entity" text,
	"legal_name" text,
	"first_name_work" text,
	"last_name_work" text,
	"first_name_legal" text,
	"last_name_legal" text,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"modified" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bronze"."goto_contact_summary" (
	"contact_id" text,
	"queue_name" text NOT NULL,
	"contact_creation_time" timestamp with time zone NOT NULL,
	"contact_resolution_time" timestamp with time zone,
	"time_in_queue_millis" integer,
	"time_in_queue_hhmmss" text,
	"talk_time_millis" integer,
	"talk_time_hhmmss" text,
	"wrap_time_millis" integer,
	"wrap_time_hhmmss" text,
	"handle_time_millis" integer,
	"handle_time_hhmmss" text,
	"contact_resolution" text,
	"contact_type" text,
	"contact_participant_type" text,
	"contact_participant_name" text,
	"contact_participant_value" text NOT NULL,
	"agent_name" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "goto_contact_summary_pkey" PRIMARY KEY("queue_name","contact_creation_time","contact_participant_value")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bronze"."goto_queue_caller" (
	"start_time" timestamp with time zone NOT NULL,
	"time_in_queue_s" integer,
	"talk_duration_s" integer,
	"call_duration_s" integer,
	"queue" text,
	"caller_name__number" text NOT NULL,
	"outcome" text,
	"agent_name" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"sms_sent" boolean,
	CONSTRAINT "goto_queue_caller_pkey" PRIMARY KEY("start_time","caller_name__number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bronze"."task_due_dates" (
	"time_extracted_id" timestamp with time zone NOT NULL,
	"task_id" integer NOT NULL,
	"due_date" text,
	"assigned_to_participant_id" integer,
	CONSTRAINT "task_due_dates_pkey" PRIMARY KEY("time_extracted_id","task_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cca"."actions_taken" (
	"action_id" integer NOT NULL,
	"form_id" text NOT NULL,
	"form_response_id" text NOT NULL,
	"field_ref_id" text NOT NULL,
	"response_id" text NOT NULL,
	"action_taken_id" text NOT NULL,
	"details" jsonb,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "actions_taken_pkey" PRIMARY KEY("action_id","form_id","form_response_id","field_ref_id","response_id","action_taken_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cca"."webform_actions" (
	"form_id" text NOT NULL,
	"field_ref_id" text NOT NULL,
	"response_id" text NOT NULL,
	"action_required_id" text NOT NULL,
	"details" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "webform_actions_pkey" PRIMARY KEY("form_id","field_ref_id","response_id","action_required_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gold"."kpi_cm" (
	"quarter_ended" date NOT NULL,
	"month_ended" date NOT NULL,
	"associate_key" text NOT NULL,
	"position" text,
	"team" text,
	"manager" text,
	"date_from" date,
	"date_to" date,
	"active_percent_of_quarter" numeric,
	"eligible" boolean NOT NULL,
	"qa_metric" boolean NOT NULL,
	"reviews_metric" boolean NOT NULL,
	"tasks_metric" boolean NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kpi_cm_pkey" PRIMARY KEY("month_ended","associate_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gold"."kpi_ctl" (
	"quarter_ended" date NOT NULL,
	"month_ended" date NOT NULL,
	"associate_key" text NOT NULL,
	"position" text,
	"team" text,
	"manager" text,
	"date_from" date,
	"date_to" date,
	"active_percent_of_quarter" numeric,
	"eligible" boolean NOT NULL,
	"month_hurdle" boolean,
	"files_reallocated" integer,
	"base_check" numeric,
	"draft_settlement_statement" numeric,
	"first_call" numeric,
	"first_letter" numeric,
	"order_searches" numeric,
	"complaints" integer,
	"active_matters" integer,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kpi_ctl_pkey" PRIMARY KEY("month_ended","associate_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gold"."kpi_drafting_paralegal" (
	"month_ended" date NOT NULL,
	"associate_key" text NOT NULL,
	"position" text,
	"team" text,
	"manager" text,
	"date_from" date,
	"date_to" date,
	"active_percent_of_quarter" numeric,
	"eligible" boolean NOT NULL,
	"turnaround_metric" boolean,
	"resub_rate" numeric,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kpi_drafting_paralegal_pkey" PRIMARY KEY("month_ended","associate_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gold"."kpi_paralegal" (
	"quarter_ended" date NOT NULL,
	"associate_key" text NOT NULL,
	"position" text,
	"team" text,
	"manager" text,
	"date_from" date,
	"date_to" date,
	"active_percent_of_quarter" numeric,
	"eligible" boolean NOT NULL,
	"qa_metric" numeric,
	"phone_metric" numeric,
	"reviews_count" integer,
	"complaints" integer,
	"active_matters" integer,
	"task_metric" numeric,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now() NOT NULL,
	"unplanned_leave" integer,
	CONSTRAINT "kpi_paralegal_pkey" PRIMARY KEY("quarter_ended","associate_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notif"."basecheck_data" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"action_type_name" text NOT NULL,
	"matterowneremail" text,
	"matterownerfirstname" text,
	"actiontype" text NOT NULL,
	"matterownerid" integer,
	"cmid" integer,
	"email_address_to_notify" text NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"time_task_completed" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notif"."basecheck_timestamp" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"email_sent_by_power_automate" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notif"."cancellation_data" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"deal_id" integer,
	"salesperson_email" text,
	"time_cancelled" timestamp with time zone,
	"step_prior_to_cancellation" text,
	"cancellation_reason" text,
	"note_1" text,
	"note_2" text,
	"note_3" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notif"."cancellation_timestamp" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"email_sent_by_power_automate" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notif"."review_cancellation_data" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"deal_key" integer,
	"date_created" date,
	"date_of_contract_review" date,
	"date_of_cancellation" date,
	"matter_type" text,
	"conveyancing_type" text,
	"cancellation_reason" text,
	"cancellation_work" text,
	"client" text,
	"sales_person" text,
	"assigned_to" text,
	"last_file_note" text,
	"current_step" text,
	"status" text,
	"warning_message_text" text,
	"email_address_to_notify" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notif"."review_cancellation_timestamp" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"email_sent_by_power_automate" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notif"."review_data" (
	"id" integer PRIMARY KEY NOT NULL,
	"date" date,
	"title" text,
	"description" text,
	"source" text,
	"action_id" integer,
	"deal_id" integer,
	"salesperson_email" text,
	"property_address" text,
	"settlement_date" text,
	"rea_name" text,
	"rea_company_name" text,
	"rea_email" text,
	"rea_phone" text,
	"broker_name" text,
	"broker_company_name" text,
	"broker_email" text,
	"broker_phone" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notif"."review_timestamp" (
	"id" integer PRIMARY KEY NOT NULL,
	"email_sent_by_power_automate" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."dim_actionstep_id_mapping" (
	"participant_id" integer PRIMARY KEY NOT NULL,
	"associate_id" text,
	"email" text,
	"display_name" text,
	"modified" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."dim_brands" (
	"brand_id" integer PRIMARY KEY NOT NULL,
	"brand" text NOT NULL,
	"brand_name" text NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"deleted" timestamp with time zone,
	CONSTRAINT "dim_brands_brand_key" UNIQUE("brand"),
	CONSTRAINT "dim_brands_brand_name_key" UNIQUE("brand_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."dim_dates" (
	"date_id" integer NOT NULL,
	"date" date PRIMARY KEY NOT NULL,
	"epoch" bigint NOT NULL,
	"day_suffix" varchar(4) NOT NULL,
	"day_name" varchar(9) NOT NULL,
	"day_of_week" integer NOT NULL,
	"day_of_month" integer NOT NULL,
	"day_of_quarter" integer NOT NULL,
	"day_of_year" integer NOT NULL,
	"week_of_month" integer NOT NULL,
	"week_of_year" integer NOT NULL,
	"week_of_year_iso" char(10) NOT NULL,
	"month_actual" integer NOT NULL,
	"month_name" varchar(9) NOT NULL,
	"month_name_abbreviated" char(3) NOT NULL,
	"quarter_actual" integer NOT NULL,
	"quarter_name" varchar(9) NOT NULL,
	"year_actual" integer NOT NULL,
	"first_day_of_week" date NOT NULL,
	"last_day_of_week" date NOT NULL,
	"first_day_of_month" date NOT NULL,
	"last_day_of_month" date NOT NULL,
	"first_day_of_quarter" date NOT NULL,
	"last_day_of_quarter" date NOT NULL,
	"first_day_of_year" date NOT NULL,
	"last_day_of_year" date NOT NULL,
	"mmyyyy" char(6) NOT NULL,
	"mmddyyyy" char(10) NOT NULL,
	"weekend_indr" boolean NOT NULL,
	CONSTRAINT "dim_dates_date_id_key" UNIQUE("date_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."dim_discounts" (
	"discount_id" text PRIMARY KEY NOT NULL,
	"discount_type" text NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"deleted" timestamp with time zone,
	"brand_key" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."dim_employees" (
	"associate_id" text PRIMARY KEY NOT NULL,
	"title" text,
	"name" text,
	"status" text,
	"position" text,
	"team" text,
	"department" text,
	"manager" text,
	"immediate_leader" text,
	"working_arrangement" text,
	"employment_status" text,
	"start_date" date,
	"effective_end_date" date,
	"last_working_day" date,
	"change_date" date,
	"country" text,
	"state_key" smallint,
	"entity" text,
	"legal_name" text,
	"first_name_work" text,
	"last_name_work" text,
	"first_name_legal" text,
	"last_name_legal" text,
	"modified" timestamp with time zone DEFAULT now() NOT NULL,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dim_employees_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."dim_gross_leads" (
	"id" integer PRIMARY KEY NOT NULL,
	"transaction_status" text,
	"deal_status" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"channel" text,
	"lost_reason" text,
	"time_to_transact" text,
	"referral_page" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"deal_key" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."dim_matters" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"action_name" text,
	"step_name" text,
	"action_type_name" text,
	"action_status" text,
	"reason_for_cancellation" text,
	"reason_for_termination" text,
	"reason_for_write_off" text,
	"cancellation_work" text,
	"action_url" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"pexa_workspace_url" text,
	"banner" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."dim_products" (
	"brand_id" integer NOT NULL,
	"product_id" text NOT NULL,
	"product" text,
	"product_subcategory" text,
	"product_category" text,
	"product_type" text,
	"product_group" text,
	"active" boolean,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "dim_products_pkey" PRIMARY KEY("brand_id","product_id"),
	CONSTRAINT "product_id_unq" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."dim_properties" (
	"brand_id" integer NOT NULL,
	"property_id" integer NOT NULL,
	"property_type" text,
	"address" text,
	"state" text,
	"postcode" integer,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "dim_properties_pkey" PRIMARY KEY("brand_id","property_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."dim_states" (
	"state_id" smallint PRIMARY KEY NOT NULL,
	"state" text,
	"state_name" text,
	"timezone" text,
	"windows_timezone" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."dim_typeform" (
	"form_id" text NOT NULL,
	"field_ref_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"workspace_name" text,
	"form_type" text,
	"form_title" text,
	"field_type" text,
	"field_title" text,
	"field_description" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "dim_typeform_pkey" PRIMARY KEY("form_id","field_ref_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_active_matters" (
	"action_id" integer NOT NULL,
	"participant_id" integer NOT NULL,
	"instance_id" integer NOT NULL,
	"associate_key" text,
	"date_start" date,
	"date_end" date,
	"end_condition" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_active_matters_pkey" PRIMARY KEY("action_id","participant_id","instance_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_allocation_to_first_call" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"associate_key" text,
	"brand_key" integer,
	"product_key" text,
	"state_key" integer,
	"convey_type" text,
	"drafting_alloc" timestamp with time zone,
	"drafting_fc" timestamp with time zone,
	"conveyance_alloc" timestamp with time zone,
	"conveyance_fc" timestamp with time zone,
	"business_hours_alloc_to_fc_drafting" numeric,
	"business_hours_alloc_to_fc_conveyance" numeric,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_basecheck" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"date_of_settlement" date NOT NULL,
	"state_key" integer,
	"product_key" text,
	"associate_key" text,
	"time_completed" timestamp,
	"total_resubs" integer,
	"business_days_to_complete" integer,
	"business_days_completed_before_settlement" integer,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"modified" timestamp with time zone DEFAULT now() NOT NULL,
	"base_check_status" text,
	"business_days_ready_before_settlement" integer,
	"base_check2_status" text,
	"file_status_task_completion_timing" text,
	"file_status_task_tag" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_basecheck_resubs" (
	"action_id" integer NOT NULL,
	"resub_instance_id" integer NOT NULL,
	"failed_item_id" integer NOT NULL,
	"date" date NOT NULL,
	"state_key" integer,
	"product_key" text,
	"associate_key" text,
	"time_created" timestamp NOT NULL,
	"time_completed" timestamp,
	"preamble" text,
	"commentary" text,
	"failed_items" integer,
	"failed_item" text NOT NULL,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"modified" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fact_basecheck_resubs_pkey" PRIMARY KEY("action_id","resub_instance_id","failed_item_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_billings" (
	"month_ended" date NOT NULL,
	"associate_key" text NOT NULL,
	"amount_billed" numeric(10, 2) NOT NULL,
	"amount_billed_credit" numeric(10, 2) NOT NULL,
	"net_billings" numeric(10, 2) NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_billings_pkey" PRIMARY KEY("month_ended","associate_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_budget" (
	"brand_id" integer NOT NULL,
	"date_id" date NOT NULL,
	"revenue" numeric(10, 2) NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"revenue_extrapolation" numeric(10, 2),
	"leads" integer,
	"sales" integer,
	CONSTRAINT "fact_budget_pkey" PRIMARY KEY("brand_id","date_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_complaints" (
	"id" integer NOT NULL,
	"source_id" integer NOT NULL,
	"associate_key" text,
	"state_key" integer,
	"our_ref" text NOT NULL,
	"date_of_complaint" date NOT NULL,
	"date_of_acknowledgement" date,
	"date_of_resolution" date,
	"date_of_response" date,
	"title" text,
	"who_for" text,
	"complainer" text,
	"is_kpi_excluded" boolean NOT NULL,
	"amount_of_financial_impact" numeric(10, 2),
	"findings" text,
	"resolution" text,
	"description" text,
	"owner" text,
	"source" text,
	"rating" text,
	"service" text,
	"client_type" text,
	"complaint_type" text,
	"status" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_complaints_pkey" PRIMARY KEY("id","source_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_crm_paid_status" (
	"deal_id" integer PRIMARY KEY NOT NULL,
	"updated_to_paid_status" timestamp,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_drafting_certification_time" (
	"task_id" integer NOT NULL,
	"instance_id" smallint NOT NULL,
	"action_key" integer,
	"assigner_key" integer,
	"assignee_key" integer,
	"date_assigned" date NOT NULL,
	"date_completed" date,
	"business_hours_to_completion" numeric(10, 2),
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_drafting_certification_time_pkey" PRIMARY KEY("task_id","instance_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_drafting_progress" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"associate_key" text,
	"state_key" integer NOT NULL,
	"date_matter_created" date NOT NULL,
	"file_note" text,
	"time_since" timestamp with time zone,
	"file_status" text,
	"traffic_light" text,
	"days_to_turnaround" integer,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"agreements" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_drafting_tasks" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"state_key" integer,
	"date_matter_created" date NOT NULL,
	"is_on_hold" boolean NOT NULL,
	"file_completed" boolean NOT NULL,
	"is_with_sales" boolean,
	"webform_complete_status" text,
	"first_call_status" text,
	"searches_status" text,
	"invoice_status" text,
	"documents_status" text,
	"certification_status" text,
	"negotiations_status" text,
	"webform_complete_colour" text,
	"first_call_colour" text,
	"searches_colour" text,
	"invoice_colour" text,
	"documents_colour" text,
	"certification_colour" text,
	"negotiations_colour" text,
	"file_note" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_drafting_turnaround_time" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"associate_key" text,
	"state_key" integer NOT NULL,
	"time_allocated" timestamp with time zone NOT NULL,
	"time_webform_completed" timestamp with time zone,
	"time_contract_sent" timestamp with time zone NOT NULL,
	"business_days_in_progress" integer NOT NULL,
	"resubs" integer NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_email_sms" (
	"email_id" bigint PRIMARY KEY NOT NULL,
	"date" date,
	"action_key" integer,
	"message" text,
	"template_name" text,
	"template_type" text,
	"associate_key" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_gross_leads" (
	"id" integer PRIMARY KEY NOT NULL,
	"date_created" date,
	"brand_key" integer,
	"state_key" integer,
	"action_key" integer,
	"lead_type" text,
	"product_key" text,
	"discount_key" text,
	"amount_of_discount" numeric(10, 2),
	"associate_key" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_long_nurture" (
	"deal_id" integer PRIMARY KEY NOT NULL,
	"date_created" date,
	"brand_key" integer,
	"state_key" integer,
	"action_key" integer,
	"lead_type" text,
	"product_key" text,
	"associate_key" text,
	"date_of_sale" date,
	"sale" integer,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_matter_products" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"first_associate_key" text,
	"has_review" boolean NOT NULL,
	"has_been_in_presettlement_step" boolean NOT NULL,
	"has_prior_review" boolean NOT NULL,
	"has_future_matters" boolean NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_matter_timeline" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"associate_key" text,
	"product_key" text,
	"date_matter_created" date NOT NULL,
	"date_matter_allocated" date,
	"date_into_pre_settle_step" date,
	"date_of_first_call" date,
	"date_of_first_letter" date,
	"date_searches_ordered" date,
	"date_of_discharge" date,
	"date_of_draft_settlement_statement" date,
	"date_of_base_check" date,
	"date_end" date,
	"end_condition" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_matters" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"brand_key" integer,
	"associate_key" text,
	"state_key" integer,
	"property_key" integer,
	"product_key" text,
	"lead_key" integer,
	"discount_key" text,
	"date_matter_created" date NOT NULL,
	"date_of_contract_draft" date,
	"date_of_contract_review" date,
	"date_of_settlement" date,
	"date_of_cancellation" date,
	"date_of_termination" date,
	"is_oto" boolean NOT NULL,
	"is_test_matter" boolean NOT NULL,
	"is_migrated_matter" boolean NOT NULL,
	"is_restricted_matter" boolean NOT NULL,
	"has_draft" boolean NOT NULL,
	"has_review" boolean NOT NULL,
	"has_settled" boolean NOT NULL,
	"has_cancelled" boolean NOT NULL,
	"has_terminated" boolean NOT NULL,
	"is_repeat" boolean NOT NULL,
	"last_activity_timestamp" timestamp with time zone,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"date_first_closed" date,
	"legalisms_agreed_to" integer,
	"sale" integer NOT NULL,
	"date_of_sale" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_matters_reassigned" (
	"action_id" integer NOT NULL,
	"instance_id" integer NOT NULL,
	"reassigned_time" timestamp with time zone NOT NULL,
	"settlement_date" timestamp with time zone,
	"earliest_archive_after_settlement" timestamp with time zone,
	"participant_key_from" integer,
	"associate_key_from" text,
	"participant_key_to" integer,
	"associate_key_to" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_matters_reassigned_pkey" PRIMARY KEY("action_id","instance_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_mc_ready" (
	"data_input_id" integer PRIMARY KEY NOT NULL,
	"deal_key" integer NOT NULL,
	"brand_key" integer,
	"action_key" integer,
	"lead_timestamp" timestamp,
	"mc_timestamp" timestamp,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_net_invoicing_cca" (
	"sale_purchase_id" integer PRIMARY KEY NOT NULL,
	"sale_purchase_date" date NOT NULL,
	"sale_purchase_status" text,
	"action_key" integer NOT NULL,
	"amount_line" numeric(10, 2),
	"amount_billed" numeric(10, 2),
	"amount_credited" numeric(10, 2),
	"amount_paid" numeric(10, 2),
	"amount_invoiced_net" numeric(10, 2),
	"amount_assumed_gst" numeric(10, 2),
	"amount_outstanding" numeric(10, 2),
	"has_draft" boolean,
	"has_review" boolean,
	"has_settlement" boolean,
	"has_cancellation" boolean,
	"has_termination" boolean,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_one_dollar_drafting_uptake" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"date_webform_completed" date,
	"one_dollar_offer_uptake" boolean,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_pd_invalid_lead_calls" (
	"deal_id" integer NOT NULL,
	"call_id" integer NOT NULL,
	"time_changed" timestamp with time zone,
	"number" bigint,
	"start_time" timestamp with time zone,
	"agent_time" interval,
	"total_time" interval,
	"disposition" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_pd_invalid_lead_calls_pkey" PRIMARY KEY("deal_id","call_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_pd_invalid_leads" (
	"deal_id" integer PRIMARY KEY NOT NULL,
	"lost_reason" text,
	"time_changed" timestamp with time zone,
	"associate_key" text,
	"product_key" text,
	"state_key" integer,
	"utm_campaign" text,
	"full_name" text,
	"phone" text,
	"phone_home" text,
	"phone_work" text,
	"phone_mobile" text,
	"contact_attempts" integer,
	"agent_time" interval,
	"notes" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_phones_goto" (
	"queue" text NOT NULL,
	"associate_key" text,
	"date" date NOT NULL,
	"direction" text NOT NULL,
	"other_party_name" text,
	"other_party_number" text NOT NULL,
	"time_started" text NOT NULL,
	"hour_of_day" integer,
	"seconds_in_queue" integer,
	"seconds_talking" integer,
	"seconds_for_call" integer,
	"outcome" text,
	"disposition" text,
	"agent_name" text,
	"tribe_call_from" text,
	"proportion_of_day_on_leave" numeric,
	"is_call" boolean,
	"is_tribe_call" boolean,
	"has_future_contact" boolean,
	"is_in_work_hours" boolean,
	"is_already_on_phone" boolean,
	"is_answerable" boolean,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_phones_goto_pkey" PRIMARY KEY("queue","other_party_number","time_started")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_phones_nice" (
	"contact_id" bigint PRIMARY KEY NOT NULL,
	"associate_key" text,
	"is_call" boolean,
	"seconds_in_queue" integer,
	"seconds_to_answer" integer,
	"seconds_talking" integer,
	"seconds_to_abandon" integer,
	"seconds_in_post_queue" integer,
	"seconds_acw" integer,
	"time_start" timestamp with time zone,
	"time_answer" timestamp with time zone,
	"time_end" timestamp with time zone,
	"agent_name" text,
	"skill_name" text,
	"disposition" text,
	"direction" text,
	"other_party_name" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"seconds_hold" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_qa_detail" (
	"qa_header_id" text NOT NULL,
	"question_id" text NOT NULL,
	"answer" text NOT NULL,
	"category" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_qa_detail_pkey" PRIMARY KEY("qa_header_id","question_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_qa_header" (
	"id" text PRIMARY KEY NOT NULL,
	"state_key" integer,
	"associate_key_owner" text,
	"associate_key_creator" text,
	"action_key" integer,
	"date_created" date NOT NULL,
	"date_of_settlement" date,
	"is_matter_escalated" boolean NOT NULL,
	"is_matter_reallocated_to_paralegal" boolean NOT NULL,
	"is_contravention" boolean NOT NULL,
	"qa_evaluation" text NOT NULL,
	"transaction_type" text,
	"source" text NOT NULL,
	"result" text,
	"score" numeric(10, 4),
	"commentary_provided_by_reviewer" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_rbi_cancellations" (
	"data_input_id" integer PRIMARY KEY NOT NULL,
	"deal_key" integer,
	"date_of_cancellation" date,
	"date_booking_made" date,
	"job_number" integer NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_rbi_cancellations_job_number_key" UNIQUE("job_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_referrals" (
	"id" integer PRIMARY KEY NOT NULL,
	"product_key" text,
	"state_key" integer,
	"action_key" integer,
	"property_key" integer,
	"associate_key_sales" text,
	"associate_key_referer" text,
	"brand_key" integer,
	"job_number" integer,
	"utm_source" text,
	"deal_url" text,
	"referer" text,
	"referral_ref" text,
	"crm_deal_status" text,
	"transaction_status" text,
	"lost_reason" text,
	"referer_company" text,
	"referer_suburb" text,
	"referer_name" text,
	"cancellation_reason" text,
	"date_lead_created" date,
	"date_of_sale" date,
	"date_service_delivered" date,
	"date_most_recent_credit_applied" date,
	"date_cancelled" date,
	"date_matter_done_and_paid" date,
	"date_inspection_done_and_paid" date,
	"date_commissionable" date,
	"lost_time" timestamp,
	"amount_invoiced_gst_inclusive" numeric(10, 2),
	"amount_paid" numeric(10, 2),
	"amount_credited" numeric(10, 2),
	"amount_of_fixed_fee" numeric(10, 2),
	"is_cancelled" boolean,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_revenue_predictions_cca" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"fixed_fee" numeric(10, 2) NOT NULL,
	"discount_offered" numeric(10, 2),
	"has_cancelled" boolean,
	"predicted_revenue" numeric(10, 2) NOT NULL,
	"date_of_predicted_revenue" date,
	"amount_invoiced_net" numeric(10, 2) NOT NULL,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_reviews" (
	"id" integer NOT NULL,
	"employee_type_id" text NOT NULL,
	"state_key" integer,
	"associate_key" text,
	"our_ref" text,
	"date" date,
	"star" integer,
	"sentiment" integer,
	"review_site" text,
	"title" text,
	"description" text,
	"source" text,
	"country" text,
	"email" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_reviews_pkey" PRIMARY KEY("id","employee_type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_sales_rbi" (
	"job_id" integer PRIMARY KEY NOT NULL,
	"deal_key" integer,
	"brand_key" integer NOT NULL,
	"state_key" integer,
	"product_key" text,
	"property_key" integer,
	"discount_key" text,
	"associate_key" text,
	"lead_key" integer,
	"date_of_sale" date,
	"date_of_inspection" date,
	"date_of_cancellation" date,
	"has_cancelled" boolean,
	"has_webform_agreement" boolean,
	"time_of_inspection" time,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"sale" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_settlement_date_changes" (
	"action_id" integer NOT NULL,
	"change_id" integer NOT NULL,
	"date" date NOT NULL,
	"associate_key" text,
	"entered_time_stamp" timestamp with time zone NOT NULL,
	"change_from" date,
	"change_to" date,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"modified" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fact_settlement_date_changes_pkey" PRIMARY KEY("action_id","change_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_settlement_sign_off" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"brand_key" integer,
	"state_key" integer,
	"product_key" text,
	"associate_key" text,
	"associate_key_lawyer" text,
	"date_of_settlement" date,
	"time_ready_for_sign_off" timestamp with time zone,
	"is_restricted_matter" boolean,
	"is_stamp_duty_done" boolean,
	"is_trust" boolean,
	"is_ready_for_sign_off" boolean,
	"base_check" text,
	"signoff" text,
	"status_of_matter" text,
	"progression" text,
	"notes_lawyer" text,
	"notes_paralegal" text,
	"dual_auth" text,
	"manner_status" text,
	"docs_signed" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"base_check_2" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_signoff" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"brand_key" integer,
	"state_key" integer,
	"product_key" text,
	"associate_key" text,
	"date_of_settlement" date,
	"VOI Approved" text,
	"Stamp Duty" text,
	"Base Check" text,
	"SOA Checked" text,
	"Documents Signed" text,
	"Sign Off Status" text,
	"voi_colour" text,
	"stamp_colour" text,
	"base_colour" text,
	"soa_colour" text,
	"docs_colour" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"hypercare" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_sms" (
	"time_sent_id" timestamp NOT NULL,
	"to_id" bigint NOT NULL,
	"para" text,
	"type" text,
	"template" text,
	"message" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_sms_pkey" PRIMARY KEY("time_sent_id","to_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_task_changes" (
	"time_extracted_id" timestamp with time zone NOT NULL,
	"task_id" integer NOT NULL,
	"change_type_id" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"action_key" integer,
	"task" text,
	"date" date,
	"time_task_completed" timestamp with time zone,
	"is_overdue_change" boolean,
	"is_no_change" boolean,
	"is_deleted" boolean,
	"is_key_date_change" boolean,
	"is_moved_earlier" boolean,
	"is_prev_key_date_moved_to_past" boolean,
	"is_weekend" boolean,
	"is_bad_data_day" boolean,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"modified" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fact_task_changes_pkey" PRIMARY KEY("time_extracted_id","task_id","change_type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_task_ownership" (
	"task_id" integer NOT NULL,
	"time_changed_id" timestamp with time zone NOT NULL,
	"old_participant" integer,
	"new_participant" integer,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_task_ownership_pkey" PRIMARY KEY("task_id","time_changed_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_tasks" (
	"task_id" integer PRIMARY KEY NOT NULL,
	"action_key" integer,
	"associate_key" text,
	"state_key" integer,
	"date" date,
	"task_name" text,
	"tag_name" text,
	"traffic_light_type" text,
	"top_ten_task" text,
	"current_status" text,
	"completed_by_due_date" text,
	"due_date" text,
	"created_time_stamp" text,
	"completed_time_stamp" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_typeform_insights" (
	"extracted" timestamp with time zone NOT NULL,
	"form_id" text NOT NULL,
	"field_ref_id" text NOT NULL,
	"field_views" integer,
	"field_dropoffs" integer,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"field_label" text,
	CONSTRAINT "typeform_insights_pkey" PRIMARY KEY("extracted","form_id","field_ref_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_typeform_responses" (
	"form_id" text NOT NULL,
	"field_ref_id" text NOT NULL,
	"response_id" text NOT NULL,
	"action_key" integer,
	"landed_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"referer" text,
	"field_type" text,
	"response" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fact_typeform_responses_pkey" PRIMARY KEY("form_id","field_ref_id","response_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_write_off_matters" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"reason_for_write_off" text,
	"amount_of_write_off" numeric(10, 2),
	"date_write_off_approved" date,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "silver"."fact_write_offs_cca" (
	"sale_purchase_id" integer PRIMARY KEY NOT NULL,
	"sale_purchase_date" date NOT NULL,
	"action_key" integer NOT NULL,
	"associate_key" text,
	"fees" numeric(10, 2),
	"disbursements" numeric(10, 2),
	"amount_billed" numeric(10, 2),
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wfm"."attendance" (
	"message_id" bigint PRIMARY KEY NOT NULL,
	"string" text,
	"created" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wfm"."changes" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"date_created" date,
	"engaged_product" text,
	"state" text,
	"action_status" text,
	"step_name" text,
	"date_of_settlement" date,
	"date_of_contract_review" date,
	"is_otp" boolean,
	"is_buy" boolean,
	"is_sell" boolean,
	"is_transfer" boolean,
	"is_test_matter" boolean,
	"is_restricted_matter" boolean,
	"has_cancelled" boolean,
	"has_terminated" boolean,
	"matter_assignee" text,
	"conveyancer" text,
	"assigned_lawyer" text,
	"conveyancing_manager" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"deleted" timestamp with time zone,
	"review_draft_ready_for_conveyance" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wfm"."future_leave" (
	"associate_id" text NOT NULL,
	"date_id" date NOT NULL,
	"proportion_of_day_on_leave" numeric,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	CONSTRAINT "future_leave_pkey" PRIMARY KEY("associate_id","date_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wfm"."matters" (
	"action_id" integer PRIMARY KEY NOT NULL,
	"date_created" date,
	"engaged_product" text,
	"state" text,
	"action_status" text,
	"step_name" text,
	"date_of_settlement" date,
	"date_of_contract_review" date,
	"is_otp" boolean,
	"is_buy" boolean,
	"is_sell" boolean,
	"is_transfer" boolean,
	"is_test_matter" boolean,
	"is_restricted_matter" boolean,
	"has_cancelled" boolean,
	"has_terminated" boolean,
	"matter_assignee" text,
	"conveyancer" text,
	"assigned_lawyer" text,
	"conveyancing_manager" text,
	"created" timestamp with time zone DEFAULT now(),
	"modified" timestamp with time zone DEFAULT now(),
	"deleted" timestamp with time zone,
	"review_draft_ready_for_conveyance" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deal_id_idx" ON "notif"."cancellation_data" ("deal_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "associate_id_idx" ON "silver"."dim_actionstep_id_mapping" ("associate_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_id_idx" ON "silver"."dim_products" ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fact_active_matters_action_id_idx" ON "silver"."fact_active_matters" ("action_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "id_idx" ON "silver"."fact_complaints" ("id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "action_id_idx" ON "silver"."fact_matters_reassigned" ("action_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "deal_key_idx" ON "silver"."fact_mc_ready" ("deal_key");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bronze"."budget" ADD CONSTRAINT "budget_brand_id_dim_brands_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "silver"."dim_brands"("brand_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bronze"."budget" ADD CONSTRAINT "budget_month_ending_id_dim_dates_date_fk" FOREIGN KEY ("month_ending_id") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bronze"."employees_history" ADD CONSTRAINT "employees_history_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notif"."cancellation_data" ADD CONSTRAINT "cancellation_data_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."dim_actionstep_id_mapping" ADD CONSTRAINT "dim_actionstep_id_mapping_associate_id_dim_employees_associate_id_fk" FOREIGN KEY ("associate_id") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."dim_discounts" ADD CONSTRAINT "dim_discounts_brand_key_dim_brands_brand_id_fk" FOREIGN KEY ("brand_key") REFERENCES "silver"."dim_brands"("brand_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."dim_employees" ADD CONSTRAINT "dim_employees_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."dim_products" ADD CONSTRAINT "dim_products_brand_id_dim_brands_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "silver"."dim_brands"("brand_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_active_matters" ADD CONSTRAINT "fact_active_matters_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_active_matters" ADD CONSTRAINT "fact_active_matters_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_allocation_to_first_call" ADD CONSTRAINT "fact_allocation_to_first_call_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_allocation_to_first_call" ADD CONSTRAINT "fact_allocation_to_first_call_product_key_dim_products_product_id_fk" FOREIGN KEY ("product_key") REFERENCES "silver"."dim_products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_allocation_to_first_call" ADD CONSTRAINT "fact_allocation_to_first_call_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_basecheck" ADD CONSTRAINT "fact_basecheck_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_basecheck" ADD CONSTRAINT "fact_basecheck_date_dim_dates_date_fk" FOREIGN KEY ("date") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_basecheck" ADD CONSTRAINT "fact_basecheck_date_of_settlement_dim_dates_date_fk" FOREIGN KEY ("date_of_settlement") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_basecheck" ADD CONSTRAINT "fact_basecheck_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_basecheck" ADD CONSTRAINT "fact_basecheck_product_key_dim_products_product_id_fk" FOREIGN KEY ("product_key") REFERENCES "silver"."dim_products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_basecheck" ADD CONSTRAINT "fact_basecheck_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_basecheck_resubs" ADD CONSTRAINT "fact_basecheck_resubs_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_basecheck_resubs" ADD CONSTRAINT "fact_basecheck_resubs_date_dim_dates_date_fk" FOREIGN KEY ("date") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_basecheck_resubs" ADD CONSTRAINT "fact_basecheck_resubs_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_basecheck_resubs" ADD CONSTRAINT "fact_basecheck_resubs_product_key_dim_products_product_id_fk" FOREIGN KEY ("product_key") REFERENCES "silver"."dim_products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_basecheck_resubs" ADD CONSTRAINT "fact_basecheck_resubs_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_billings" ADD CONSTRAINT "fact_billings_month_ended_dim_dates_date_fk" FOREIGN KEY ("month_ended") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_billings" ADD CONSTRAINT "fact_billings_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_budget" ADD CONSTRAINT "fact_budget_brand_id_dim_brands_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "silver"."dim_brands"("brand_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_budget" ADD CONSTRAINT "fact_budget_date_id_dim_dates_date_fk" FOREIGN KEY ("date_id") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_complaints" ADD CONSTRAINT "fact_complaints_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_complaints" ADD CONSTRAINT "fact_complaints_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_complaints" ADD CONSTRAINT "fact_complaints_date_of_complaint_dim_dates_date_fk" FOREIGN KEY ("date_of_complaint") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_drafting_certification_time" ADD CONSTRAINT "fact_drafting_certification_time_action_key_dim_matters_action_id_fk" FOREIGN KEY ("action_key") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_drafting_certification_time" ADD CONSTRAINT "fact_drafting_certification_time_date_assigned_dim_dates_date_fk" FOREIGN KEY ("date_assigned") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_drafting_progress" ADD CONSTRAINT "fact_drafting_progress_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_drafting_progress" ADD CONSTRAINT "fact_drafting_progress_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_drafting_progress" ADD CONSTRAINT "fact_drafting_progress_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_drafting_progress" ADD CONSTRAINT "fact_drafting_progress_date_matter_created_dim_dates_date_fk" FOREIGN KEY ("date_matter_created") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_drafting_tasks" ADD CONSTRAINT "fact_drafting_tasks_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_drafting_tasks" ADD CONSTRAINT "fact_drafting_tasks_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_drafting_turnaround_time" ADD CONSTRAINT "fact_drafting_turnaround_time_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_drafting_turnaround_time" ADD CONSTRAINT "fact_drafting_turnaround_time_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_drafting_turnaround_time" ADD CONSTRAINT "fact_drafting_turnaround_time_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_email_sms" ADD CONSTRAINT "fact_email_sms_date_dim_dates_date_fk" FOREIGN KEY ("date") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_email_sms" ADD CONSTRAINT "fact_email_sms_action_key_dim_matters_action_id_fk" FOREIGN KEY ("action_key") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_email_sms" ADD CONSTRAINT "fact_email_sms_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_gross_leads" ADD CONSTRAINT "fact_gross_leads_id_dim_gross_leads_id_fk" FOREIGN KEY ("id") REFERENCES "silver"."dim_gross_leads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_gross_leads" ADD CONSTRAINT "fact_gross_leads_date_created_dim_dates_date_fk" FOREIGN KEY ("date_created") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_gross_leads" ADD CONSTRAINT "fact_gross_leads_brand_key_dim_brands_brand_id_fk" FOREIGN KEY ("brand_key") REFERENCES "silver"."dim_brands"("brand_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_gross_leads" ADD CONSTRAINT "fact_gross_leads_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_gross_leads" ADD CONSTRAINT "fact_gross_leads_action_key_dim_matters_action_id_fk" FOREIGN KEY ("action_key") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_gross_leads" ADD CONSTRAINT "fact_gross_leads_product_key_dim_products_product_id_fk" FOREIGN KEY ("product_key") REFERENCES "silver"."dim_products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_gross_leads" ADD CONSTRAINT "fact_gross_leads_discount_key_dim_discounts_discount_id_fk" FOREIGN KEY ("discount_key") REFERENCES "silver"."dim_discounts"("discount_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_gross_leads" ADD CONSTRAINT "fact_gross_leads_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_long_nurture" ADD CONSTRAINT "fact_long_nurture_date_created_dim_dates_date_fk" FOREIGN KEY ("date_created") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_long_nurture" ADD CONSTRAINT "fact_long_nurture_brand_key_dim_brands_brand_id_fk" FOREIGN KEY ("brand_key") REFERENCES "silver"."dim_brands"("brand_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_long_nurture" ADD CONSTRAINT "fact_long_nurture_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_long_nurture" ADD CONSTRAINT "fact_long_nurture_action_key_dim_matters_action_id_fk" FOREIGN KEY ("action_key") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_long_nurture" ADD CONSTRAINT "fact_long_nurture_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_long_nurture" ADD CONSTRAINT "fact_long_nurture_date_of_sale_dim_dates_date_fk" FOREIGN KEY ("date_of_sale") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matter_products" ADD CONSTRAINT "fact_matter_products_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matter_products" ADD CONSTRAINT "fact_matter_products_first_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("first_associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matter_timeline" ADD CONSTRAINT "fact_matter_timeline_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matter_timeline" ADD CONSTRAINT "fact_matter_timeline_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matter_timeline" ADD CONSTRAINT "fact_matter_timeline_product_key_dim_products_product_id_fk" FOREIGN KEY ("product_key") REFERENCES "silver"."dim_products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matter_timeline" ADD CONSTRAINT "fact_matter_timeline_date_matter_created_dim_dates_date_fk" FOREIGN KEY ("date_matter_created") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matters" ADD CONSTRAINT "fact_matters_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matters" ADD CONSTRAINT "fact_matters_brand_key_dim_brands_brand_id_fk" FOREIGN KEY ("brand_key") REFERENCES "silver"."dim_brands"("brand_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matters" ADD CONSTRAINT "fact_matters_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matters" ADD CONSTRAINT "fact_matters_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matters" ADD CONSTRAINT "fact_matters_product_key_dim_products_product_id_fk" FOREIGN KEY ("product_key") REFERENCES "silver"."dim_products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matters" ADD CONSTRAINT "fact_matters_lead_key_dim_gross_leads_id_fk" FOREIGN KEY ("lead_key") REFERENCES "silver"."dim_gross_leads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matters" ADD CONSTRAINT "fact_matters_discount_key_dim_discounts_discount_id_fk" FOREIGN KEY ("discount_key") REFERENCES "silver"."dim_discounts"("discount_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matters" ADD CONSTRAINT "fact_matters_date_matter_created_dim_dates_date_fk" FOREIGN KEY ("date_matter_created") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matters" ADD CONSTRAINT "fact_matters_date_of_sale_dim_dates_date_fk" FOREIGN KEY ("date_of_sale") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matters" ADD CONSTRAINT "fact_matters_brand_key_property_key_fkey" FOREIGN KEY ("brand_key","property_key") REFERENCES "silver"."dim_properties"("brand_id","property_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_matters_reassigned" ADD CONSTRAINT "fact_matters_reassigned_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_mc_ready" ADD CONSTRAINT "fact_mc_ready_brand_key_dim_brands_brand_id_fk" FOREIGN KEY ("brand_key") REFERENCES "silver"."dim_brands"("brand_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_mc_ready" ADD CONSTRAINT "fact_mc_ready_action_key_dim_matters_action_id_fk" FOREIGN KEY ("action_key") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_net_invoicing_cca" ADD CONSTRAINT "fact_net_invoicing_cca_sale_purchase_date_dim_dates_date_fk" FOREIGN KEY ("sale_purchase_date") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_net_invoicing_cca" ADD CONSTRAINT "fact_net_invoicing_cca_action_key_dim_matters_action_id_fk" FOREIGN KEY ("action_key") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_one_dollar_drafting_uptake" ADD CONSTRAINT "fact_one_dollar_drafting_uptake_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_one_dollar_drafting_uptake" ADD CONSTRAINT "fact_one_dollar_drafting_uptake_date_webform_completed_dim_dates_date_fk" FOREIGN KEY ("date_webform_completed") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_pd_invalid_lead_calls" ADD CONSTRAINT "fact_pd_invalid_lead_calls_deal_id_fact_pd_invalid_leads_deal_id_fk" FOREIGN KEY ("deal_id") REFERENCES "silver"."fact_pd_invalid_leads"("deal_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_phones_goto" ADD CONSTRAINT "fact_phones_goto_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_phones_goto" ADD CONSTRAINT "fact_phones_goto_date_dim_dates_date_fk" FOREIGN KEY ("date") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_phones_nice" ADD CONSTRAINT "fact_phones_nice_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_qa_detail" ADD CONSTRAINT "fact_qa_detail_qa_header_id_fact_qa_header_id_fk" FOREIGN KEY ("qa_header_id") REFERENCES "silver"."fact_qa_header"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_qa_header" ADD CONSTRAINT "fact_qa_header_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_qa_header" ADD CONSTRAINT "fact_qa_header_associate_key_owner_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key_owner") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_qa_header" ADD CONSTRAINT "fact_qa_header_associate_key_creator_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key_creator") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_qa_header" ADD CONSTRAINT "fact_qa_header_action_key_dim_matters_action_id_fk" FOREIGN KEY ("action_key") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_qa_header" ADD CONSTRAINT "fact_qa_header_date_created_dim_dates_date_fk" FOREIGN KEY ("date_created") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_referrals" ADD CONSTRAINT "fact_referrals_product_key_dim_products_product_id_fk" FOREIGN KEY ("product_key") REFERENCES "silver"."dim_products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_referrals" ADD CONSTRAINT "fact_referrals_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_referrals" ADD CONSTRAINT "fact_referrals_action_key_dim_matters_action_id_fk" FOREIGN KEY ("action_key") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_referrals" ADD CONSTRAINT "fact_referrals_associate_key_sales_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key_sales") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_referrals" ADD CONSTRAINT "fact_referrals_associate_key_referer_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key_referer") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_referrals" ADD CONSTRAINT "fact_referrals_brand_key_dim_brands_brand_id_fk" FOREIGN KEY ("brand_key") REFERENCES "silver"."dim_brands"("brand_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_referrals" ADD CONSTRAINT "fact_referrals_brand_key_property_key_fkey" FOREIGN KEY ("brand_key","property_key") REFERENCES "silver"."dim_properties"("brand_id","property_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_revenue_predictions_cca" ADD CONSTRAINT "fact_revenue_predictions_cca_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_revenue_predictions_cca" ADD CONSTRAINT "fact_revenue_predictions_cca_date_of_predicted_revenue_dim_dates_date_fk" FOREIGN KEY ("date_of_predicted_revenue") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_reviews" ADD CONSTRAINT "fact_reviews_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_reviews" ADD CONSTRAINT "fact_reviews_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_reviews" ADD CONSTRAINT "fact_reviews_date_dim_dates_date_fk" FOREIGN KEY ("date") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_sales_rbi" ADD CONSTRAINT "fact_sales_rbi_brand_key_dim_brands_brand_id_fk" FOREIGN KEY ("brand_key") REFERENCES "silver"."dim_brands"("brand_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_sales_rbi" ADD CONSTRAINT "fact_sales_rbi_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_sales_rbi" ADD CONSTRAINT "fact_sales_rbi_product_key_dim_products_product_id_fk" FOREIGN KEY ("product_key") REFERENCES "silver"."dim_products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_sales_rbi" ADD CONSTRAINT "fact_sales_rbi_discount_key_dim_discounts_discount_id_fk" FOREIGN KEY ("discount_key") REFERENCES "silver"."dim_discounts"("discount_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_sales_rbi" ADD CONSTRAINT "fact_sales_rbi_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_sales_rbi" ADD CONSTRAINT "fact_sales_rbi_lead_key_dim_gross_leads_id_fk" FOREIGN KEY ("lead_key") REFERENCES "silver"."dim_gross_leads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_sales_rbi" ADD CONSTRAINT "fact_sales_rbi_date_of_sale_dim_dates_date_fk" FOREIGN KEY ("date_of_sale") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_sales_rbi" ADD CONSTRAINT "fact_sales_rbi_brand_key_property_key_fkey" FOREIGN KEY ("brand_key","property_key") REFERENCES "silver"."dim_properties"("brand_id","property_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_settlement_date_changes" ADD CONSTRAINT "fact_settlement_date_changes_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_settlement_date_changes" ADD CONSTRAINT "fact_settlement_date_changes_date_dim_dates_date_fk" FOREIGN KEY ("date") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_settlement_date_changes" ADD CONSTRAINT "fact_settlement_date_changes_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_settlement_sign_off" ADD CONSTRAINT "fact_settlement_sign_off_action_id_dim_matters_action_id_fk" FOREIGN KEY ("action_id") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_settlement_sign_off" ADD CONSTRAINT "fact_settlement_sign_off_brand_key_dim_brands_brand_id_fk" FOREIGN KEY ("brand_key") REFERENCES "silver"."dim_brands"("brand_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_settlement_sign_off" ADD CONSTRAINT "fact_settlement_sign_off_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_settlement_sign_off" ADD CONSTRAINT "fact_settlement_sign_off_product_key_dim_products_product_id_fk" FOREIGN KEY ("product_key") REFERENCES "silver"."dim_products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_settlement_sign_off" ADD CONSTRAINT "fact_settlement_sign_off_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_settlement_sign_off" ADD CONSTRAINT "fact_settlement_sign_off_associate_key_lawyer_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key_lawyer") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_settlement_sign_off" ADD CONSTRAINT "fact_settlement_sign_off_date_of_settlement_dim_dates_date_fk" FOREIGN KEY ("date_of_settlement") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_signoff" ADD CONSTRAINT "fact_signoff_brand_key_dim_brands_brand_id_fk" FOREIGN KEY ("brand_key") REFERENCES "silver"."dim_brands"("brand_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_signoff" ADD CONSTRAINT "fact_signoff_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_signoff" ADD CONSTRAINT "fact_signoff_product_key_dim_products_product_id_fk" FOREIGN KEY ("product_key") REFERENCES "silver"."dim_products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_signoff" ADD CONSTRAINT "fact_signoff_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_signoff" ADD CONSTRAINT "fact_signoff_date_of_settlement_dim_dates_date_fk" FOREIGN KEY ("date_of_settlement") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_tasks" ADD CONSTRAINT "fact_tasks_action_key_dim_matters_action_id_fk" FOREIGN KEY ("action_key") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_tasks" ADD CONSTRAINT "fact_tasks_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_tasks" ADD CONSTRAINT "fact_tasks_state_key_dim_states_state_id_fk" FOREIGN KEY ("state_key") REFERENCES "silver"."dim_states"("state_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_tasks" ADD CONSTRAINT "fact_tasks_date_dim_dates_date_fk" FOREIGN KEY ("date") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_write_offs_cca" ADD CONSTRAINT "fact_write_offs_cca_sale_purchase_date_dim_dates_date_fk" FOREIGN KEY ("sale_purchase_date") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_write_offs_cca" ADD CONSTRAINT "fact_write_offs_cca_action_key_dim_matters_action_id_fk" FOREIGN KEY ("action_key") REFERENCES "silver"."dim_matters"("action_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "silver"."fact_write_offs_cca" ADD CONSTRAINT "fact_write_offs_cca_associate_key_dim_employees_associate_id_fk" FOREIGN KEY ("associate_key") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wfm"."future_leave" ADD CONSTRAINT "future_leave_associate_id_dim_employees_associate_id_fk" FOREIGN KEY ("associate_id") REFERENCES "silver"."dim_employees"("associate_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wfm"."future_leave" ADD CONSTRAINT "future_leave_date_id_dim_dates_date_fk" FOREIGN KEY ("date_id") REFERENCES "silver"."dim_dates"("date") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
