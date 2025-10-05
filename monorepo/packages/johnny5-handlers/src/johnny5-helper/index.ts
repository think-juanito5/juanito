import type { ContractData, ContractDataItem } from '@dbc-tech/johnny5-mongodb'
import type { Label, PowerappExtractResponse } from './powerapp-workflow.schema'

export const mapPowerappDocument = (
  response: PowerappExtractResponse,
): Partial<ContractData> => {
  const labels = response.responsev2.predictionOutput.labels

  if (
    !labels ||
    (((Object.keys(labels).length === 1 &&
      String(labels['@odata.type']) == '#Microsoft.Dynamics.CRM.expando') ||
      Object.keys(labels).length === 0) &&
      response.responsev2.predictionOutput.layoutConfidenceScore
        .toString()
        .startsWith('0.00'))
  ) {
    throw new Error(
      'No labels found in the Powerapp response - Invalid Contract Document!',
    )
  }

  const mapItem = (currentLabel: string | Label) => {
    if (typeof currentLabel === 'string')
      throw new Error('currentLabel is undefined')

    const item: ContractDataItem = {
      fieldName: currentLabel.displayName,
      value: String(currentLabel.value), //String() is required as the schema expects a string|number|boolean value here
      text: currentLabel.text,
      displayName: currentLabel.displayName,
      fieldType: currentLabel.fieldType,
      confidence: currentLabel.confidence,
      pageNumber: currentLabel.valueLocation.pageNumber,
      location_left: currentLabel.valueLocation.boundingBox.left,
      location_top: currentLabel.valueLocation.boundingBox.top,
      location_width: currentLabel.valueLocation.boundingBox.width,
      location_height: currentLabel.valueLocation.boundingBox.height,
    }
    return item
  }

  const items: ContractDataItem[] = Object.keys(labels)
    .filter((key) => !key.startsWith('@odata'))
    .map((key) => mapItem(labels[key]))

  return {
    operationStatus: response.responsev2.operationStatus,
    layoutName: response.responsev2.predictionOutput.layoutName,
    pageCount: response.responsev2.predictionOutput.pageCount,
    layoutConfidenceScore:
      response.responsev2.predictionOutput.layoutConfidenceScore,
    contractDataItems: items,
  }
}
