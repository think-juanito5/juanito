import type { Issues, MatterManifest } from '@dbc-tech/johnny5'
export interface ManifestBuilder {
  build(jobId: string): Promise<MatterManifest>
  readonly getIssues: () => Issues[]
}
