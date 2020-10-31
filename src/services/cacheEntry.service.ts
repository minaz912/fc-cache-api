import { Logger } from '../logger';
import { CacheEntryModel, ICacheEntry } from '../models/cacheEntry.model';
import { buildPaginationObject } from '../utils';

export class CacheEntryService {
  /**
   * Returns paginated entries from cache
   * pass a cursor to get the next entries
   *
   * @param pageSize
   * @param cursor
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

  /**
   * Returns the total count of the cache entries
   */
  static async count(): Promise<number> {
    // FIXME: should we consider expired entries?
    return CacheEntryModel.countDocuments();
  }

  /**
   * Creates a new cache entry or updates an existing one by key
   *
   * @param key
   * @param value
   * @param expiryDateTime
   */
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

  /**
   * Gets an existing cache entry from the datastore by key
   * @param key
   */
  static async get(key: string): Promise<ICacheEntry | null> {
    const existingEntry = await CacheEntryModel.findOne({
      key,
      expiresAt: { $gt: new Date() },
    }).lean();

    return existingEntry;
  }

  /**
   * Drops the oldest N cache entries (LRU style) from the datastore
   * N is determined by numberOfEntriesToDrop
   * If there are no entries to drop, does nothing
   * @param numberOfEntriesToDrop
   */
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

  /**
   * Drops a cache entry by key
   * @param key
   */
  static async dropByKey(key: string): Promise<void> {
    await CacheEntryModel.deleteOne({ key });
  }

  /**
   * Drops all cache entries from the datastore
   */
  static async dropAll(): Promise<void> {
    await CacheEntryModel.deleteMany({});
  }

  /**
   * Updates the expiry time of a cache entry to a new dateTime
   * @param key
   * @param newExpiryDateTime
   */
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
