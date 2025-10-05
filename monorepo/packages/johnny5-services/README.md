# Johnny5 Services

An integrated set of APIs used for processing CCA 3rd-party webhooks, and more

## Setup

Uses [bun](https://bun.sh/) instead of Node

Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

Install Packages

```bash
bun install
```

Run code

```bash
bun start
```

## Eden HTTP Client

Services exports `App` simplifying client connectivity using [Eden](https://elysiajs.com/eden/overview.html)

```ts
export type App = typeof app
```

In order for the exported type definitions to be used in other projects such as Power Apps Connector, a build step must be run to generate the type definitions and copy the file to the Connector project.

Run the following to build and copy the definitions file.

```bash
bun build:declaration
```

### Examples 

```
curl -X POST -H "Content-Type: application/cloudevents+json" -d @./samples/typeform/webhooks/response.json http://localhost:3000/v1/typeform/webhooks/responses
curl -X POST -H "Content-Type: application/cloudevents+json" -d @./samples/pipedrive/webhooks/v2/deal.change-full.json http://localhost:3000/v1/pipedrive-v2/webhooks/deals

curl -X POST -H "Content-Type: application/cloudevents+json" -d @./samples/typeform/webhooks/response.json http://localhost:3000/v1/typeform/webhooks/responses/actionstep-task-completer

curl -X GET http://localhost:3000/sign/neil
curl -X GET -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJuZWlsIn0.UwbKVihjjGPBLYUW-ht7M8FTK1JeNWcfLeKpmFWL-n4" http://localhost:3000/profile

curl --request POST \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s' \
  --url "https://api-stage.conveyancing.com.au/services/v1/pipedrive/mc-ready-deals/123"

curl --request GET \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s' \
  --url https://api-dev.conveyancing.com.au/services/v1/datalake/transactionservices?matterId=134633

curl --request GET \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s' \
  --url https://api-stage.conveyancing.com.au/services/v1/datalake/transactionservices?matterId=134633

curl --request GET \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s' \
  --url https://api-stage.conveyancing.com.au/services/v1/datalake/transactionservices?dealId=412974


curl --request GET \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s' \
  --url https://api-stage.conveyancing.com.au/services/v1/datalake/conveyancingservices?matterId=134633


curl --request GET \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s' \
  --url "https://api-stage.conveyancing.com.au/services/v1/datalake/conveyancingservices?matterId=134668&includes=movingHubLogs"


curl --request GET \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s' \
  --url "https://api-stage.conveyancing.com.au/services/v1/datalake/conveyancingservices/835"

curl --request GET \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s' \
  --url "https://api-stage.conveyancing.com.au/services/v1/datalake/conveyancingservices/835?includes=movingHubLogs"

curl --request GET \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s' \
  --url "http://localhost:3001/services/v1/datalake/conveyancingservices/123?includes=movingHubLogs"

curl --request GET \
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s' \
     --url https://api-stage.conveyancing.com.au/pac/ccaservices/v1/datalake/transactionservices?matterId=134633

curl --request GET \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s' \
  --url "https://api-stage.conveyancing.com.au/services/v1/pipedrive/mc-ready-deals/123"

curl --request GET \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s' \
  --url "https://api-stage.conveyancing.com.au/services/v1/pipedrive/mc-ready-deals/123"

curl --request GET \
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s' \
     --url "http://localhost:3001/services/v1/pipedrive/mc-ready-deals/123"

curl --request GET \
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImNsaWVudCJ9.4DlD5ohbE3iXIWhMvwvOGE5eBcLHuOQN8Z_7l3zy518' \
     --url "http://localhost:3001/services/v1/pipedrive/mc-ready-deals/123"

```

```
CCA
eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImFkbWluIn0.JyA_LNFWiK6LrJ1Ua3fmo-vSDblQpfDI2A9PGxQ9w0s  // CCA Admin
eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJDQ0EiLCJzY29wZSI6ImNsaWVudCJ9.4DlD5ohbE3iXIWhMvwvOGE5eBcLHuOQN8Z_7l3zy518 // CCA Client

BTR
eyJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJCVFIiLCJzY29wZSI6ImNsaWVudCJ9.mBHI97pnGTh4zqyR3lVWi-5ftH8hCvRChJkTUbVEcT0
````
