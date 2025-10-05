import mongoose from 'mongoose'

export interface Meta {
  // The key
  key: string
  // The value
  value: string
}

export const metaSchema = new mongoose.Schema<Meta>(
  {
    // The meta key
    key: {
      type: String,
      required: true,
      unique: false,
      index: false,
    },
    // The meta value
    value: {
      type: String,
      required: true,
      unique: false,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)
