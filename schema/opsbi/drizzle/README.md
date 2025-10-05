# OPS BI Reporting Schema

Install dependencies:

```bash
bun install
```

Copy environment file:

```bash
cp .env.example .env
```

Restore database:

```bash
docker compose up
pg_restore -C -d opsbi_reporting -h localhost -U postgres --no-owner < ./opsbi_reporting_2024-04-17_112655.backup
```

Run `introspect` to create schema files

```bash
bun run introspect
```

Fix up schema issues in `./schema-files` and copy to `./schema`
