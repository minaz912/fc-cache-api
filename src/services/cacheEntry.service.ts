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
      ...(cursor && { _id: { $gt: cursor } }),
      // only consider non-expired entries
      expiresAt: { $lt: new Date() },
    })
      .limit(pageSize)
      .lean();

    return buildPaginationObject<'_id', ICacheEntry>(data, '_id');
  }
}
