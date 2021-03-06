import { Request, Response } from 'express';
import { Logger } from '../logger';
import { CacheEntryService } from '../services/cacheEntry.service';
import {
  generateCacheExpiryTimestamp,
  generateRandomString,
  getCursor,
  getDateDifferenceInSecs,
  getPageSize,
  getTTL,
  mapCacheEntryToDto,
} from '../utils';
import { config } from '../config/environment';
import { ICacheEntryDto } from '../dtos/cacheEntry.dto';

export async function listCacheEntries(
  req: Request,
  res: Response<{
    data: {
      entries: ICacheEntryDto[];
      cursor: string | null;
    };
  }>
) {
  const { limit, after } = req.query;

  const pageSize = getPageSize(limit as number | undefined);
  const cursor = getCursor(after as string | undefined);

  // TODO: reset TTL of each hit
  const entryList = await CacheEntryService.list(pageSize, cursor);

  Logger.debug(
    `[CacheController] - listCacheEntries::Returning ${entryList.entries.length} entries`
  );

  return res.json({
    data: {
      entries: entryList.entries.map(mapCacheEntryToDto),
      cursor: entryList.cursor,
    },
  });
}

export async function addOrUpdateCacheEntry(
  req: Request,
  res: Response<{ data: ICacheEntryDto }>
) {
  const { key, value, ttl } = req.body;

  const entryTTLInSecs = getTTL(ttl as number | undefined);
  const now = new Date();
  const newExpiryDateTime = generateCacheExpiryTimestamp(now, entryTTLInSecs);

  const newEntry = await CacheEntryService.set(key, value, newExpiryDateTime);

  return res.status(201).json({ data: mapCacheEntryToDto(newEntry) });
}

export async function getCacheEntryByKey(
  req: Request,
  res: Response<{
    data: string;
  }>
) {
  const { key } = req.params;

  const existingEntry = await CacheEntryService.get(key);

  const now = new Date();

  if (!existingEntry) {
    Logger.info('[CacheController] - getCacheEntryByKey::Cache miss');

    const randomValue = generateRandomString();

    const entryTTLInSecs = getTTL();
    const newExpiryDateTime = generateCacheExpiryTimestamp(now, entryTTLInSecs);

    const totalEntryCount = await CacheEntryService.count();
    const cacheLimitCount = config.getCacheOptions().limitCount;
    /**
     * Check if we're at or above the limit
     * Here we're checking if we're at or "above" because the limit can
     * change between process runs
     */
    const differenceAboveLimit = totalEntryCount - cacheLimitCount;
    if (differenceAboveLimit >= 0) {
      await CacheEntryService.dropOldestEntries(differenceAboveLimit + 1);
    }

    const newEntry = await CacheEntryService.set(
      key,
      randomValue,
      newExpiryDateTime
    );

    Logger.debug(
      `[CacheController] - listCacheEntries::Returning newly created entry with key ${newEntry.key} and value ${newEntry.value}`
    );

    return res.json({
      data: newEntry.value,
    });
  }

  Logger.info('[CacheController] - getCacheEntryByKey::Cache hit');

  const entryTTLInSecs = getDateDifferenceInSecs(
    existingEntry.createdAt,
    existingEntry.expiresAt
  );
  const newExpiryDateTime = generateCacheExpiryTimestamp(now, entryTTLInSecs);
  await CacheEntryService.resetTTLByKey(existingEntry.key, newExpiryDateTime);

  Logger.debug(
    `[CacheController] - listCacheEntries::Returning existing entry with key ${existingEntry.key} and value ${existingEntry.value}`
  );

  return res.json({
    data: existingEntry.value,
  });
}

export async function dropCacheEntryByKey(
  req: Request,
  res: Response<void | { data: null }>
) {
  const { key } = req.params;

  const existingEntry = await CacheEntryService.get(key);

  if (!existingEntry) {
    return res.status(404).json({ data: null });
  }

  return res.sendStatus(204);
}

export async function dropAllCacheEntries(req: Request, res: Response) {
  await CacheEntryService.dropAll();

  return res.sendStatus(204);
}
