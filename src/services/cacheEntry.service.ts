import { CacheEntryModel, ICacheEntry } from '../models/cacheEntry.model';
import { buildPaginationObject } from '../utils';

export class CacheEntryService {
  /**
   * Returns paginated entries from cache
   * pass a cursor to get the next entries
   *
   * @static
   * @param {number} pageSize
   * @param {(string | null)} cursor
   * @returns {(Promise<{ entries: ICacheEntry[]; cursor: string | null }>)}
   * @memberof CacheEntryService
   */
  static async list(
    pageSize: number,
    cursor: string | null
  ): Promise<{ entries: ICacheEntry[]; cursor: string | null }> {
    const data = await CacheEntryModel.find({
      // QUESTION: should we use a timestamp as the cursor?
      ...(cursor && { _id: { $gt: cursor } }),
      // only consider non-expired entries
      expiresAt: { $lt: new Date() },
    })
      .limit(pageSize)
      .lean();

    return buildPaginationObject<'_id', ICacheEntry>(data, '_id');
  }

  static async set(
    key: string,
    value: string,
    expiryDateTime: Date
  ): Promise<ICacheEntry> {
    const existingCacheEntry = await CacheEntryModel.findOne({ key });

    if (!existingCacheEntry) {
      const newCacheEntry = await new CacheEntryModel({
        key,
        value,
        expiresAt: expiryDateTime,
      }).save();

      return newCacheEntry.toJSON();
    }

    existingCacheEntry.value = value;
    existingCacheEntry.expiresAt = expiryDateTime;
    await existingCacheEntry.save();

    return existingCacheEntry;
  }

  static async get(key: string): Promise<ICacheEntry | null> {
    const existingEntry = await CacheEntryModel.findOne({
      key,
      expiresAt: { $gt: new Date() },
    }).lean();

    return existingEntry;
  }

  static async resetTTLByKey(
    key: string,
    newExpiryDateTime: Date
  ): Promise<void> {
    await CacheEntryModel.updateOne(
      { key },
      { $set: { expiresAt: newExpiryDateTime } }
    );
  }
}
