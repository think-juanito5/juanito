export type CollectionRecordValuePut = {
  datacollectionrecordvalues: {
    stringValue: string
    links: {
      action: string
      dataCollectionField: string
      dataCollectionRecord: string
      dataCollection: string
    }
  }
}

export interface Links {
  action: string | null | undefined
  dataCollectionField: string | null | undefined
  dataCollectionRecord: string | null | undefined
  dataCollection: string | null | undefined
}

export interface RecordData {
  id: string
  stringValue: string | null | undefined
  last_modified_time_stamp: string | null | undefined
  last_modified_by_user_id: number | null | undefined
  links: Links
}
