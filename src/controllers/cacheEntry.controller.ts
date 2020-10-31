import { Request, Response } from 'express';
import { CacheEntryService } from '../services/cacheEntry.service';
import {
  generateCacheExpiryTimestamp,
  getCursor,
  getPageSize,
  getTtl,
  mapCacheEntryToDto,
} from '../utils';

export async function listCacheEntries(req: Request, res: Response) {
  const { limit, after } = req.query;

  const pageSize = getPageSize(limit as number | undefined);
  const cursor = getCursor(after as string | undefined);

  const entryList = await CacheEntryService.list(pageSize, cursor);

  return res.json({
    data: {
      entries: entryList.entries.map(mapCacheEntryToDto),
      cursor: entryList.cursor,
    },
  });
}

export async function addOrUpdateCacheEntry(req: Request, res: Response) {
  const { key, value, ttl } = req.body;

  const entryTtlInSecs = getTtl(ttl as number | undefined);
  const now = new Date();
  const newExpiryDateTime = generateCacheExpiryTimestamp(now, entryTtlInSecs);

  const newEntry = await CacheEntryService.set(key, value, newExpiryDateTime);

  return res.status(201).json({ data: mapCacheEntryToDto(newEntry).value });
}
