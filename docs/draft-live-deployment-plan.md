# Prod Deployment Plan – Johnny5 Migration

## Context

The existing `cca.integration.services` project will **remain in place**. Its Service Bus namespace and topics will not be modified at this stage.

The new `dbc-johnny5` project will have:

- Its **own GitHub repository**
- Its **own Storage Account**
- Its **own Service Bus namespace & topics**

All other resources (ACR, Key Vault, databases, etc.) remain **shared**.

Since `dbc-johnny5` is deployed under the same Azure landing zone, it will continue to run in the existing **hub/spoke network** alongside `cca.integration.services`.
 
--- 

## Scope

Migrate and rename the following containers into `dbc-johnny5`:

- `J5-Services` → **APIs**  
  - Public endpoint:  
    `https://ctap-prod-dbc-j5-apis-01.wonderfulflower-7d148065.australiaeast.azurecontainerapps.io`
- `J5-Handlers` → **Jobs** *(internal only)*
- `J5-Tasks` → **Tasks** *(internal only)*
- `J5-Quotes` → **Quotes**  
  - Public endpoint:  
    `https://ctap-prod-dbc-j5-quotes-01.wonderfulflower-7d148065.australiaeast.azurecontainerapps.io`

Azure Functions (`webhook-processing-function`, `input-function`) remain in `cca.integration.services` and will continue using Service Bus + API calls to integrate with the new containers.

---

## Pre-Deployment Checklist ✅

- [ ] Confirm `dbc-johnny5` resource group, Storage Account, and Service Bus exist.
- [ ] Container images for all four containers (`APIs`, `Jobs`, `Tasks`, `Quotes`) pushed to ACR.
- [ ] Key Vault secrets created (API keys, connection strings, service bus credentials).
- [ ] Dapr component configuration and subscriptions ready.
- [ ] Application Insights monitoring configured.
- [ ] Networking (Ingress endpoints + hub/spoke connectivity) validated.

---

## Deployment Steps

1. Deploy `APIs`, `Jobs`, `Tasks`, `Quotes` containers to `dbc-johnny5`.
2. Configure env vars + secret references from Key Vault.
3. Expose APIs and Quotes via Ingress (using the endpoints above).
4. Keep Jobs and Tasks ingress-disabled (internal only).
5. Wire up Dapr subscriptions for Jobs and Tasks.
6. Connect CCA and BTR Functions and Service Bus topics.

---

## Cutover Strategy

- Keep `cca.integration.services` containers live during migration.
- Route test traffic to `dbc-johnny5` and validate:
  - APIs via `https://ctap-prod-dbc-j5-apis-01.wonderfulflower-7d148065.australiaeast.azurecontainerapps.io`
  - Quotes via `https://ctap-prod-dbc-j5-quotes-01.wonderfulflower-7d148065.australiaeast.azurecontainerapps.io`
- Gradually shift production traffic (messages and API calls) to `dbc-johnny5`.
- Rollback is straightforward by setting the serviceBaseUrl back to `api.conveyancing.com.au`.

## Applications, Endpoints & Owners for Cutover

_All applications and functions below are affected only by the `serviceBaseUrl` change to point from `cca.integration.services`(https://api.conveyancing.com.au) → `dbc-johnny5` (https://ctap-prod-dbc-j5-apis-01.wonderfulflower-7d148065.australiaeast.azurecontainerapps.io)._

| Application / Service       | Owner Responsible | Tested ✅ |
|-----------------------------|-------------------|-----------|
| **CCA Website**             | Alex              | [ ] |
| **BTR SDS Website** (bytherules.au) | Alex              | [ ] |
| **Cloudflare Workers**      | Neil              | [ ] |
| **FAST**                    | Mack              | [ ] |
| **Data Lake**               | Nitzchel          | [ ] |
| **CCA Azure Functions**     | Neil, Phillip, Nitzchel, Mack | [ ] |
| └─ `webhook-processing-function` | Neil, Phillip, Nitzchel, Mack | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ Actionstep Drafting Matter Activations | Neil, Phillip, Nitzchel, Mack | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ Actionstep Matter Trustpilot Link      | Neil, Phillip, Nitzchel, Mack | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ Actionstep Matter Name Refresh         | Neil, Phillip, Nitzchel, Mack | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ Bark Deal Create                       | Neil, Phillip, Nitzchel, Mack | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ Bespoke Tasks                          | Neil, Phillip, Nitzchel, Mack | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ BTR Pexa Audit                         | Neil, Phillip, Nitzchel, Mack | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ CCA Email Unsubscribe                  | Neil, Phillip, Nitzchel, Mack | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ CCA Typeform Bespoke Tasks             | Neil, Phillip, Nitzchel, Mack | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ Deal Matter Create                     | Neil, Phillip, Nitzchel, Mack | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ Pipedrive V2 Lost Unsubscribe          | Neil, Phillip, Nitzchel, Mack | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;└─ Pipedrive V2 Marketing Status          | Neil, Phillip, Nitzchel, Mack | [ ] |
| **BTR Azure Functions**     |  | [ ] |
| └─ `webhook-processing-function` | Neil, Phillip, Nitzchel, Mack | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ BTR Typeform Bespoke Tasks | Phillip | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ PEXA Audit      | Phillip | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ SDS Agent Register Send Email         | Neil, Nitzchel | [ ] |
| &nbsp;&nbsp;&nbsp;&nbsp;├─ SDS Client Matter Create              | Neil, Mack | [ ] |

---

## Validation & Verification Checklist (Post-Cutover) 

- [ ] Send a test message through `input-function` and confirm:
  - It reaches `webhook-processing-function`.
  - It invokes the `APIs` container via Ingress (`https://ctap-prod-dbc-j5-apis-01.wonderfulflower-7d148065.australiaeast.azurecontainerapps.io`).
  - Dapr delivers the event to `Jobs` and `Tasks`.
- [ ] Verify `Quotes` API responds successfully (`https://ctap-prod-dbc-j5-quotes-01.wonderfulflower-7d148065.australiaeast.azurecontainerapps.io`).
- [ ] Monitor Service Bus queues/topics for message delivery, no duplicates/drops.
- [ ] Confirm Key Vault references resolve correctly inside all containers.

---

## Rollback Plan

- Rollback is straightforward by reverting the `serviceBaseUrl` from the new `dbc-johnny5` endpoints back to the original `cca.integration.services` domain (`api.conveyancing.com.au`).
- No container image re-deployment is required, as only configuration (`serviceBaseUrl`) needs to be updated.


---

## Success Criteria

- `APIs` and `Quotes` containers respond via their public Ingress endpoints.
- `Jobs` and `Tasks` containers run internally with Dapr subscriptions working.
- Full end-to-end message flow works (`webhook-functions-processing` → Service Bus → `APIs` → Dapr → `Jobs`/`Tasks`).
- APIs (`APIs`, `Quotes`) return valid responses.
- No dropped or duplicate messages observed.