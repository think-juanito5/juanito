# @dbc-tech/sandbox

Install monorepo dependencies first.

```bash
cd monorepo
bun install
```

Install sandbox dependencies

```bash
cd sandbox
bun install
```

To run, see `package.json` scripts. For example:

```bash
bun run actionstep
```

## CSV Pricing

Convert pricing sheet `Searches and Fees Mapping(Simplified_Fee Mapping).xlsx` to `csv` format and place in `monorepo/sandbox/csv` folder

Run the following to convert csv to json

```bash
bun install
bun run csv
```

Check output `Searches and Fees Mapping(Simplified_Fee Mapping).json` equates to prices in sheet

