import { Logger } from '../logger';
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
      expiresAt: { $gt: new Date() },
    })
      .limit(pageSize)
      .lean();

    return buildPaginationObject<'_id', ICacheEntry>(data, '_id');
  }

  static async count(): Promise<number> {
    return CacheEntryModel.countDocuments();
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

    return existingCacheEntry.toJSON();
  }

  static async get(key: string): Promise<ICacheEntry | null> {
    const existingEntry = await CacheEntryModel.findOne({
      key,
      expiresAt: { $gt: new Date() },
    }).lean();

    return existingEntry;
  }

  static async dropOldestEntries(numberOfEntriesToDrop: number): Promise<void> {
    const oldestEntriesKeys = await CacheEntryModel.find({})
      .sort({ expiresAt: 1 })
      .limit(numberOfEntriesToDrop)
      .distinct('key');

    if (oldestEntriesKeys.length === 0) {
      Logger.debug('[CacheEntryService] - dropOldestEntry::No entries to drop');
      return;
    }

    Logger.debug(
      '[CacheEntryService] - dropOldestEntry::Dropping entries with keys',
      oldestEntriesKeys
    );

    await CacheEntryModel.deleteMany({ key: { $in: oldestEntriesKeys } });
  }

  static async dropByKey(key: string): Promise<void> {
    await CacheEntryModel.deleteOne({ key });
  }

  static async dropAll(): Promise<void> {
    await CacheEntryModel.deleteMany({});
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
