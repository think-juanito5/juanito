# @dbc-tech/johnny5-sdk

HTTP client for Johnny5 integration

To install

```bash
bun add @dbc-tech/johnny5-sdk
```

To use:

```ts
const { cca } = johnny5Client({
  authBaseUrl: process.env.AUTH_BASE_URL, // DBC Token service
  authApiKey: process.env.CCA_API_KEY,    // Tenant API key
  baseUrl: process.env.JOHNNY5_BASE_URL,  // API endpoint
})

const job = await cca.deals.createMatter({ dealId: 12345 })
console.log('Job Id:', job.id)
```
