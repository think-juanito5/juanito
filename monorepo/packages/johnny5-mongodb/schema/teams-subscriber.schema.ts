import mongoose from 'mongoose'

export interface TeamsSubscriber {
  teamsUrl: string
  teamsId?: string
  channelId?: string
  events: string[]
}

export const teamsSubscriberSchema = new mongoose.Schema<TeamsSubscriber>(
  {
    teamsUrl: {
      type: String,
      unique: false,
      required: true,
      index: false,
    },
    teamsId: {
      type: String,
      unique: false,
      required: false,
      index: false,
    },
    channelId: {
      type: String,
      unique: false,
      required: false,
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
