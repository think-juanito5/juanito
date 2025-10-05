#!/bin/bash

TARGET_BTR_RESPONSE=/tmp/modified-btr-contract-additional-questions.json
mkdir -p /tmp > /dev/null
RANDOM_EVENT_ID=$(cat /dev/urandom | tr -dc 'A-Z0-9' | head -c 26)
jq --arg event_id "$RANDOM_EVENT_ID" '.event_id = $event_id' ../samples/typeform/webhooks/btr-contract-additional-questions.json > ${TARGET_BTR_RESPONSE}

if [ -f "${TARGET_BTR_RESPONSE}" ]; then
    curl -X POST -H "Content-Type: application/json" -d @${TARGET_BTR_RESPONSE} https://api-dev.conveyancing.com.au/integrations/v1/typeform/webhook
    test -f ${TARGET_BTR_RESPONSE} && rm ${TARGET_BTR_RESPONSE} > /dev/null
else  
    curl -X POST -H "Content-Type: application/json" -d @./samples/typeform/webhooks/btr-contract-additional-questions.json https://api-dev.conveyancing.com.au/integrations/v1/typeform/webhook
fi
