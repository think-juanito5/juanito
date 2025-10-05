btr pexa audit  

BTR have a process they run called a PEXA Audit<br />
This is a compliance audit performed by the Settlement Audit Team (SAT).<br />
The SAT is an admin team in CCA<br /><br />
The data flow goes like this:  
1. An auto-generated task _Ready for PEXA Audit (See Description for Requirements)_ in Actionstep is completed by the conveyancer
2. Actionstep emits a webhook
3. Webhook picked up by btr.integration.services, processed and put on Azure Service Bus (SB) **queue** _btr-pexa-audit_
4. SB queue is picked up in cca.integration.services webhook-processing which calls a J5 service endpoint /johnny5/v1/matters/{id}/tasks/{id}/pexa-audit to create a job
5. The job is picked up in j5 handlers and started
6. Start creates an audit record in dataverse and a task in actionstep assigned to the Settlement Audit Team (SAT) with a deep link to the audit record in a Power Apps UI.
7. On submission of the UI, a signal is sent to J5 services to change the job status /johnny5/v1/jobs/{id}/btr-pexa-audit-validate
8. The service tests if the audit passed or not and sends to the approprate stage of the job
9. If success, handler writes file note -> **END**
10. If fail, handler writes file note and creates task for conveyancer _PEXA AUDIT check failed items_
11. When task completed, a webhook is emmitted
12. Webhook picked up in btr.integration.services and pushed to service bus _queue_ btr-pexa-audit
13. SB queue is picked up in cca.integration.services webhook-processing function which makes an api call to j5 services
14. J5 services determines whether the audit passed or failed and calls the appropriate handler. -> **GOTO 9**