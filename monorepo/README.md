# cca-integration monorepo

This is monorepo using `bun` and `npm workspaces` for all CCA integration apps and services

To install dependencies at the workspace level:

```bash
bun install
```

Build docker image (example: Handlers):

```bash
bun docker:build:handlers
```

Run docker container in shell:

```bash
docker run -it cca/integration-handlers sh
```

Delete docker image (example: Handlers):

```bash
bun docker:rm:handlers
```

For more information about worspace support in bun, visit https://bun.sh/guides/install/workspaces

This project was created using `bun init` in bun v1.1.27. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.