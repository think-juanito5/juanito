# Data Lake Schema

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
pg_restore -C -d datalake -h localhost -U postgres --no-owner < ./datalake_2024-04-18_120932.backup
```

Run `introspect` to create schema files

```bash
bun run introspect
```

Fix up schema issues in `./schema-files` and copy to `./schema`
