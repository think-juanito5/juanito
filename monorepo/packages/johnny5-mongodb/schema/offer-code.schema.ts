import mongoose from 'mongoose'

export interface OfferCode {
  id: number
  offercode?: string
  offerdescription?: string
  brandid?: number
  pipedriveofferid?: number
  isenabled?: boolean
  createdOn: Date
}

export interface DbOfferCode extends OfferCode {}

export const offerCodeSchema = new mongoose.Schema<OfferCode>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    offercode: {
      type: String,
      maxlength: 150,
      required: false,
    },
    offerdescription: {
      type: String,
      maxlength: 255,
      required: false,
    },
    brandid: {
      type: Number,
      required: false,
    },
    pipedriveofferid: {
      type: Number,
      required: false,
    },
    isenabled: {
      type: Boolean,
      required: false,
    },
    createdOn: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    versionKey: false,
  },
)

export const OfferCodeModel = mongoose.model(
  'OfferCode',
  offerCodeSchema,
  'offercodes',
)
