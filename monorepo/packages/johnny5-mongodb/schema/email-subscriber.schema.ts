import mongoose from 'mongoose'

export interface EmailSubscriber {
  email: string
  name: string
  events: string[]
}

export const emailSubscriberSchema = new mongoose.Schema<EmailSubscriber>(
  {
    email: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    name: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    events: {
      type: [String],
      unique: false,
      required: false,
      index: false,
    },
  },
  {
    versionKey: false,
  },
)
