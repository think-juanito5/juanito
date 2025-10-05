# CCA Integration Services

## Overview
CCA Integration Services is an Azure Functions project written in TypeScript. Its primary purpose is to provide centralized Actionstep authentication and facilitate notifications in the Teams channel whenever a deal is received from the conveyancing Pipedrive. Specifically, it notifies when a deal is received at the Mcready stage.

## Features
- Centralized Actionstep authentication
- Notification in Teams channel for received deals from conveyancing Pipedrive
- Specific notification for deals received at the Mcready stage

## Setup
### 1. Clone the repository
```bash
git clone https://github.com/dbc-tech/cca.integration.services.git
cd cca.integration.services
````
### 2. Install dependencies
```bash
npm install
````
### 3. Configure Actionstep authentication credentials
Actionstep API client key and secret must be provided and add in the keyvault

### 4. Set up integration with Pipedrive
Add this function URL in pipedrive webhook

### 5. Configure Teams channel for notifications
Configure teams channel (mcready) and retrieve the channel id

## Usage
- Run the Azure Functions application to start listening for deals.
- When a deal is received from the conveyancing Pipedrive, the application will send a notification to the configured Teams channel.
- If the deal is at the Mcready stage, a specific notification will be sent.


## How to create webhooks v2 in Pipedrive
At the moment, you can **only create webhooks v2 via API**. To do this, please **ensure** you add the `version` parameter to the webhook request body.

Please note of the following supported event actions in webhook v2:

 - `create`
 - `change`
 - `delete`

Supported object types:

-   `activity`
-   `deal`
-   `lead`
-   `note`
-   `organization`
-   `person`
-   `product`
-   `use`

Below is an example of the payload, in JSON format, for registering a webhook v2:

````
curl --location 'https://api.pipedrive.com/v1/webhooks?api_token=pd_token' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data-raw '{
  "subscription_url": "https://api.conveyancing.com.au/integrations/v1/pipedrive/v2-webhook",
  "event_action": "change",
  "event_object": "deal",
  "user_id": "2901792",
  "http_auth_user": "it@conveyancing.com.au",
  "http_auth_password": "*****",
  "version": "2.0"
}'
````

In this example, you are subscribing to receive notifications for any changes in Pipedrive Deals. The data payload of those changes will be posted to the **subscription_url**, which is https://api.conveyancing.com.au/integrations/v1/pipedrive/v2-webhook

*Please note that the **user_id** must match the account used in **http_auth_user**. You may reach out to the Tech Support team for more information regarding the user_id and http_auth_user.*

# SQL Permissions

```sql
GRANT SELECT ON ALL TABLES IN SCHEMA bronze TO opsbi_reporting;
GRANT SELECT ON ALL TABLES IN SCHEMA cca TO opsbi_reporting;
GRANT SELECT ON ALL TABLES IN SCHEMA etl TO opsbi_reporting;
GRANT SELECT ON ALL TABLES IN SCHEMA gold TO opsbi_reporting;
GRANT SELECT ON ALL TABLES IN SCHEMA notif TO opsbi_reporting;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO opsbi_reporting;
GRANT SELECT ON ALL TABLES IN SCHEMA silver TO opsbi_reporting;
GRANT SELECT ON ALL TABLES IN SCHEMA wfm TO opsbi_reporting;
 
GRANT USAGE ON SCHEMA bronze TO opsbi_reporting;
GRANT USAGE ON SCHEMA cca TO opsbi_reporting;
GRANT USAGE ON SCHEMA etl TO opsbi_reporting;
GRANT USAGE ON SCHEMA gold TO opsbi_reporting;
GRANT USAGE ON SCHEMA notif TO opsbi_reporting;
GRANT USAGE ON SCHEMA public TO opsbi_reporting;
GRANT USAGE ON SCHEMA silver TO opsbi_reporting;
GRANT USAGE ON SCHEMA wfm TO opsbi_reporting;

```

## Developer set-up

Most apps and services are built with [Bun](https://bun.sh/) as an alternative to Node, due to the performance and native TypeScript support. However, Azure Functions continue to be developed on Node, currently at version 20.

For Node, we recommend to use [nvm](https://github.com/nvm-sh/nvm) to easily manage and switch node versions.

Aside from Bun and Node, the supported editor is [vscode](https://code.visualstudio.com/) along with appropriate extensions for developing TypeScript applications and Bicep infrastructure files.


### Bun

Follow the instructions at https://bun.sh/ to install Bun.

To update bun version to latest:

```sh
bun upgrade
```

### Node

Use [nvm](https://github.com/nvm-sh/nvm) to install Node Version Manager and from the folder where node apps are developed eg. `apps/functions` run the following to switch to the target version

```
nvm use
```

### vscode

Follow the instructions at https://code.visualstudio.com/ to install vscode and also add the following extensions

- Azure Tools
- Azurite
- Bicep
- Biome
- Github Copilot

### Biome

[Biome](https://biomejs.dev/) is used as a modern alternative to ESLint and Prettier for linting and formatting. This is integrated into vscode using the [extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) which interacts with Biome and displays linting errors and suggestions in the editor and applies formatting on save.

Due to how vscode is used in the monorepo, the biome configuration is always found in the vscode workspace root, which is typically the repository root. Therefore you should find a `biome.json` configuration file in the repository root along with `package.json`. To get started with biome navigate to repository root and run the following:

```
bun install
```

This will install the single `@biomejs/biome` dependency which vscode uses when performing linting and formatting operations. You may need to restart vscode.

### Linting & formatting

From the editor, when working in common files supported in Biome, you should see suggestions when linting or formatting issues arise. You can use the editor quick-fix to apply suggested fixes, and formatting can be applied on save if this is set-up in your vscode settings:

```json
{
    "editor.defaultFormatter": "biomejs.biome",
    "editor.codeActionsOnSave": {
      "quickfix.biome": "explicit",
      "source.organizeImports.biome": "explicit"
    }
}
```

### Using CLI

Aside from editor support, you can perform fixes using the Biome CLI. You may need to add biome as a developer dependency in the specific app project. From there you can run CLI commands through node scripts in package.json

```sh
# Lint code
bun biome lint --write

# Format code
bun biome format --write
```

### Type Checking

Linting picks up common code quality issues but does not do type checking. For this, `tsc` is required.

To type check your project,

```sh
bun tsc --noEmit
```

### Convenience scripts

The following scripts are available in most projects

```sh
bun lint # perform linting and write fixes
bun format # perform formatting and write fixes
bun check # perform type checking
```

## BTR File Opening

### Matter Creation / Contract Drop Power App
Dev: \
https://apps.powerapps.com/play/e/default-20662f19-dcf5-43db-861d-23acdd8eeb44/a/91470d05-e890-431a-a562-ae6c3dd5785d?tenantId=20662f19-dcf5-43db-861d-23acdd8eeb44&sourcetime=1733696756365

Stage: \
https://apps.powerapps.com/play/e/892e7aa2-610e-e521-a8af-6470aaa606c4/a/98d10c1f-1afa-4ef5-a8da-505ed0a7f928?tenantId=20662f19-dcf5-43db-861d-23acdd8eeb44&hint=d8348013-2ef4-440f-a81c-d425803a978b&sourcetime=1733696793269

Prod: \
https://apps.powerapps.com/play/e/863b1bd9-ac73-4c4b-84e3-1ba95c0daf73/a/f219cbbc-a755-4cf7-a114-57f5b55530bd?tenantId=20662f19-dcf5-43db-861d-23acdd8eeb44&hint=68ff19c7-88d0-492a-9739-c1d0d92ee556&sourcetime=1733696805672


### Human in the loop (HITL) - Contract Validation Power App

Dev: \
https://apps.powerapps.com/play/e/default-20662f19-dcf5-43db-861d-23acdd8eeb44/a/a9cd338a-5129-448a-9f30-e12d1ac67c74?tenantId=20662f19-dcf5-43db-861d-23acdd8eeb44&hint=351facf6-ae6c-4abc-8a2c-f3fc300d008b&sourcetime=1733696839138

Stage: \
https://apps.powerapps.com/play/e/892e7aa2-610e-e521-a8af-6470aaa606c4/a/42467178-d5e6-4b24-ad3b-261a02413f32?tenantId=20662f19-dcf5-43db-861d-23acdd8eeb44&hint=0491f025-cd9f-4be2-8ca4-b4d1060e6bcf&sourcetime=1733696854734

Prod: \
https://apps.powerapps.com/play/e/863b1bd9-ac73-4c4b-84e3-1ba95c0daf73/a/974c6f0c-9018-4e97-9b3b-05a6aeed4bd7?tenantId=20662f19-dcf5-43db-861d-23acdd8eeb44&hint=200e6187-3491-4737-9909-5c1bb9854dac&sourcetime=1733696871257


## Power Apps user management / security roles
Entra ID assigned role: Power Platform Administrator \
https://admin.powerplatform.microsoft.com/manage/environments

All Power Apps users are required to have the roles in each of the environments they need access to:
* Basic User
* min priv apps use

Additionally, HITL app users also require:
* Johnny 5 User

Note that Power Platform users are supposed to sync with Entra ID, but often don't. 
So you can expect to need to Add User.
When adding users/security roles in production, please check that the user is in 
the correct 'Business Unit' (CCA|BTR|FCL) _before_ assigning the role.

## Setting Log level

```sh
# dev
az containerapp update \
  -n ctap-dev-cca-j5-handlers-01 \
  -g rg-dev-cca-integration-01 \
  --subscription 2e88680f-3b2e-45ba-aa63-ffdb2383dbc1 \
  --set-env-vars LOG_LEVEL=debug

# stage
az containerapp update \
  -n ctap-stage-cca-j5-handlers-01 \
  -g rg-stage-cca-integration-01 \
  --subscription 7def1dda-42c0-4b8b-961a-ba4bef55c4d2 \
  --set-env-vars LOG_LEVEL=debug

# prod
az containerapp update \
  -n ctap-prod-cca-int-handlers-01 \
  -g rg-prod-cca-integration-01 \
  --subscription d7455dd1-41a1-4e80-ad4f-567bae76961c \
  --set-env-vars LOG_LEVEL=debug
```    
