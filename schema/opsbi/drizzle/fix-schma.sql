-- WARNING: These scripts should be run offline and not in production
-- Drizzle does not yet support schemas other than public, so the only way to introspect and generate drizzle schemas is to move tables into the public schema
-- The scripts below should be run as schema groups. First, select a schema group and run those scripts to move the tables into the public schema
-- Then run 'drizzle-kit introspect:pg' command to generate schema files from the public schema.
-- Afterwards, move the tables back to their original schema and repeat with the next schema group
ALTER TABLE bronze.budget SET SCHEMA public; 
ALTER TABLE bronze.employees SET SCHEMA public; 
ALTER TABLE bronze.employees_audit  SET SCHEMA public;
ALTER TABLE bronze.employees_history  SET SCHEMA public;
ALTER TABLE bronze.goto_contact_summary  SET SCHEMA public;
ALTER TABLE bronze.goto_queue_caller  SET SCHEMA public;
ALTER TABLE bronze.task_due_dates  SET SCHEMA public;

ALTER TABLE cca.actions_taken  SET SCHEMA public;
ALTER TABLE cca.webform_actions  SET SCHEMA public;

ALTER TABLE gold.kpi_cm  SET SCHEMA public;
ALTER TABLE gold.kpi_ctl  SET SCHEMA public;
ALTER TABLE gold.kpi_drafting_paralegal  SET SCHEMA public;
ALTER TABLE gold.kpi_paralegal  SET SCHEMA public;

ALTER TABLE notif.basecheck_data  SET SCHEMA public;
ALTER TABLE notif.basecheck_timestamp  SET SCHEMA public;
ALTER TABLE notif.cancellation_timestamp  SET SCHEMA public;
ALTER TABLE notif.review_cancellation_data  SET SCHEMA public;
ALTER TABLE notif.review_cancellation_timestamp  SET SCHEMA public;
ALTER TABLE notif.review_data  SET SCHEMA public;
ALTER TABLE notif.review_timestamp  SET SCHEMA public;
ALTER TABLE notif.cancellation_data  SET SCHEMA public;

ALTER TABLE silver.dim_products  SET SCHEMA public;
ALTER TABLE silver.fact_gross_leads  SET SCHEMA public;
ALTER TABLE silver.fact_matters  SET SCHEMA public;
ALTER TABLE silver.dim_employees  SET SCHEMA public;
ALTER TABLE silver.dim_dates  SET SCHEMA public;
ALTER TABLE silver.fact_write_offs_cca  SET SCHEMA public;
ALTER TABLE silver.fact_sales_rbi  SET SCHEMA public;
ALTER TABLE silver.fact_billings  SET SCHEMA public;
ALTER TABLE silver.dim_matters  SET SCHEMA public;
ALTER TABLE silver.dim_discounts  SET SCHEMA public;
ALTER TABLE silver.dim_states  SET SCHEMA public;
ALTER TABLE silver.dim_gross_leads  SET SCHEMA public;
ALTER TABLE silver.dim_properties  SET SCHEMA public;
ALTER TABLE silver.dim_actionstep_id_mapping  SET SCHEMA public;
ALTER TABLE silver.dim_typeform  SET SCHEMA public;
ALTER TABLE silver.dim_brands  SET SCHEMA public;
ALTER TABLE silver.fact_allocation_to_first_call  SET SCHEMA public;
ALTER TABLE silver.fact_basecheck  SET SCHEMA public;
ALTER TABLE silver.fact_active_matters  SET SCHEMA public;
ALTER TABLE silver.fact_budget  SET SCHEMA public;
ALTER TABLE silver.fact_crm_paid_status  SET SCHEMA public;
ALTER TABLE silver.fact_complaints  SET SCHEMA public;
ALTER TABLE silver.fact_drafting_certification_time  SET SCHEMA public;
ALTER TABLE silver.fact_drafting_turnaround_time  SET SCHEMA public;
ALTER TABLE silver.fact_email_sms  SET SCHEMA public;
ALTER TABLE silver.fact_long_nurture  SET SCHEMA public;
ALTER TABLE silver.fact_matter_products  SET SCHEMA public;
ALTER TABLE silver.fact_matter_timeline  SET SCHEMA public;
ALTER TABLE silver.fact_matters_reassigned  SET SCHEMA public;
ALTER TABLE silver.fact_mc_ready  SET SCHEMA public;
ALTER TABLE silver.fact_phones_goto  SET SCHEMA public;
ALTER TABLE silver.fact_phones_nice  SET SCHEMA public;
ALTER TABLE silver.fact_qa_header  SET SCHEMA public;
ALTER TABLE silver.fact_rbi_cancellations  SET SCHEMA public;
ALTER TABLE silver.fact_drafting_progress  SET SCHEMA public;
ALTER TABLE silver.fact_drafting_tasks  SET SCHEMA public;
ALTER TABLE silver.fact_one_dollar_drafting_uptake  SET SCHEMA public;
ALTER TABLE silver.fact_pd_invalid_leads  SET SCHEMA public;
ALTER TABLE silver.fact_settlement_date_changes  SET SCHEMA public;
ALTER TABLE silver.fact_settlement_sign_off  SET SCHEMA public;
ALTER TABLE silver.fact_signoff  SET SCHEMA public;
ALTER TABLE silver.fact_tasks  SET SCHEMA public;
ALTER TABLE silver.fact_sms  SET SCHEMA public;
ALTER TABLE silver.fact_task_changes  SET SCHEMA public;
ALTER TABLE silver.fact_task_ownership  SET SCHEMA public;
ALTER TABLE silver.fact_typeform_insights  SET SCHEMA public;
ALTER TABLE silver.fact_typeform_responses  SET SCHEMA public;
ALTER TABLE silver.fact_write_off_matters  SET SCHEMA public;
ALTER TABLE silver.fact_referrals  SET SCHEMA public;
ALTER TABLE silver.fact_revenue_predictions_cca  SET SCHEMA public;
ALTER TABLE silver.fact_reviews  SET SCHEMA public;
ALTER TABLE silver.fact_basecheck_resubs  SET SCHEMA public;
ALTER TABLE silver.fact_net_invoicing_cca  SET SCHEMA public;
ALTER TABLE silver.fact_pd_invalid_lead_calls  SET SCHEMA public;
ALTER TABLE silver.fact_qa_detail  SET SCHEMA public;

ALTER TABLE wfm.future_leave  SET SCHEMA public;
ALTER TABLE wfm.attendance  SET SCHEMA public;
ALTER TABLE wfm.changes  SET SCHEMA public;
ALTER TABLE wfm.matters  SET SCHEMA public;




