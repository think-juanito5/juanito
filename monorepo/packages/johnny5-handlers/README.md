# Johnny5 Handlers

An integrated set of APIs used for processing CCA 3rd-party webhooks, and more...

# Setup

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

Run code in dev mode

```bash
bun watch
```

```bash
curl -X POST -H "Content-Type: application/cloudevents+json" -d @./samples/typeform/webhooks/response.json http://localhost:3000/v1/typeform/webhooks/responses
curl -X POST -H "Content-Type: application/cloudevents+json" -d @./samples/pipedrive/webhooks/v2/deal.change-full.json http://localhost:3000/v1/pipedrive-v2/webhooks/deals

curl -X POST -H "Content-Type: application/cloudevents+json" -d @./samples/typeform/webhooks/response.json http://localhost:3000/v1/typeform/webhooks/responses/actionstep-task-completer


curl -X POST -H "Content-Type: application/json" -d @./samples/typeform/webhooks/btr-contract-response.json https://api-dev.conveyancing.com.au/integrations/v1/typeform/webhook

```

```bash
curl -X POST http://localhost:3500/v1.0/publish/asb-long-queues/johnny5 -H "Content-Type: application/cloudevents+json" -d '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "v1.send-email", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
```
```