import mongoose from 'mongoose';

export interface ICacheEntry {
  _id: any;
  key: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
}

interface ICacheEntryDocument extends ICacheEntry, mongoose.Document {}

type ICacheEntryModel = mongoose.Model<ICacheEntryDocument>;

const CacheEntrySchema = new mongoose.Schema(
  {
    /**
     * Accessor for cache entry, must be unique
     */
    key: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },

    /**
     * Stringified value for cache entry
     */
    value: {
      type: String,
      required: true,
    },

    /**
     * Expiry timestamp
     */
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
    },
  }
);

export const CacheEntryModel = mongoose.model<
  ICacheEntryDocument,
  ICacheEntryModel
>('CacheEntry', CacheEntrySchema);
