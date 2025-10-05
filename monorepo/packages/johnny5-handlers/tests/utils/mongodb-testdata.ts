import {
  type ContractData,
  ContractDataModel,
  type ContractDataValidation,
  ContractDataValidationModel,
  type DbFile,
  type DbJob,
  FileModel,
  JobModel,
  type RefdataContractData,
  RefdataContractDataModel,
} from '@dbc-tech/johnny5-mongodb'
import type { HydratedDocument } from 'mongoose'

export type MongoDbTestData = typeof mongodbTestData
export const mongodbTestData = {
  johnny5: {
    file: (cb?: (m: Partial<DbFile>) => void): Partial<DbFile> => {
      const model: Partial<DbFile> = {
        tenant: 'CCA',
        serviceType: 'conveyancing-buy',
        createdOn: new Date(),
      }
      if (cb) cb(model)
      return model
    },
    job: (cb?: (m: Partial<DbJob>) => void): Partial<DbJob> => {
      const model: Partial<DbJob> = {
        tenant: 'CCA',
        serviceType: 'conveyancing-buy',
        type: 'file-opening',
        status: 'created',
        createdOn: new Date(),
      }
      if (cb) cb(model)
      return model
    },
    contractData: (
      cb?: (m: Partial<ContractData>) => void,
    ): Partial<ContractData> => {
      const model: Partial<ContractData> = {
        tenant: 'CCA',
        contractDocumentBlobName: 'blob.pdf',
        operationStatus: 'good',
        createdOn: new Date(),
        contractDataItems: [
          {
            fieldName: 'field1',
            value: 'value1',
            text: 'value1',
            displayName: 'Field 1',
            fieldType: 'string',
            confidence: 1,
            pageNumber: 1,
            location_left: 0,
            location_top: 0,
            location_width: 0,
            location_height: 0,
          },
        ],
      }
      if (cb) cb(model)
      return model
    },
    contractDataValidation: (
      cb?: (m: Partial<ContractDataValidation>) => void,
    ): Partial<ContractDataValidation> => {
      const model: Partial<ContractDataValidation> = {
        tenant: 'CCA',
        createdOn: new Date(),
        correctionDataItems: [
          {
            fieldName: 'field1',
            value: 'value1.1',
          },
        ],
        createdBy: 'system',
      }
      if (cb) cb(model)
      return model
    },
    refdataContractData: (
      cb?: (m: Partial<RefdataContractData>) => void,
    ): Partial<RefdataContractData> => {
      const model: RefdataContractData = {
        tenant: 'CCA',
        name: 'field1',
        location: 'location',
        sub_section: 'sub',
        threshold: 0,
        category: 'cat',
        data_type: 'Text',
        required_for_matter_creation: true,
        friendly_name: 'Field 1',
        field_name: 'field1',
        section: 'sec',
        order: 0,
        tags: ['buy'],
      }
      if (cb) cb(model)
      return model
    },
  },
}

export type MongoDbSeeder = ReturnType<typeof mongoDbSeeder>
export const mongoDbSeeder = (data: MongoDbTestData) => {
  return {
    data,
    johnny5: {
      file: {
        create: async (
          cb?: (m: Partial<DbFile>) => void,
        ): Promise<HydratedDocument<DbFile>> => {
          const model = data.johnny5.file(cb)
          const doc = await FileModel.create(model)
          return doc
        },
      },
      job: {
        create: async (
          cb?: (m: Partial<DbJob>) => void,
        ): Promise<HydratedDocument<DbJob>> => {
          const model = data.johnny5.job(cb)
          const doc = await JobModel.create(model)
          return doc
        },
      },
      contractData: {
        create: async (
          cb?: (m: Partial<ContractData>) => void,
        ): Promise<HydratedDocument<ContractData>> => {
          const model = data.johnny5.contractData(cb)
          const doc = await ContractDataModel.create(model)
          return doc
        },
      },
      contractDataValidation: {
        create: async (
          cb?: (m: Partial<ContractDataValidation>) => void,
        ): Promise<HydratedDocument<ContractDataValidation>> => {
          const model = data.johnny5.contractDataValidation(cb)
          const doc = await ContractDataValidationModel.create(model)
          return doc
        },
      },
      refdataContractData: {
        create: async (
          cb?: (m: Partial<RefdataContractData>) => void,
        ): Promise<HydratedDocument<RefdataContractData>> => {
          const model = data.johnny5.refdataContractData(cb)
          const doc = await RefdataContractDataModel.create(model)
          return doc
        },
      },
    },
  }
}

export type TestMongoDb = ReturnType<typeof testMongoDb>
export const testMongoDb = () => {
  const data = mongodbTestData
  const seeder = mongoDbSeeder(data)
  return {
    clear: async () => {
      await JobModel.deleteMany({})
      await FileModel.deleteMany({})
      await ContractDataModel.deleteMany({})
      await ContractDataValidationModel.deleteMany({})
      await RefdataContractDataModel.deleteMany({})
    },
    data,
    seeder,
  }
}
