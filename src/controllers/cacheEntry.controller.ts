import { Request, Response } from 'express';
import { CacheEntryService } from '../services/cacheEntry.service';
import { getCursor, getPageSize } from '../utils';

export async function listCacheEntries(req: Request, res: Response) {
  const { limit, after } = req.query;

  const pageSize = getPageSize(limit as number | undefined);
  const cursor = getCursor(after as string | undefined);

  const entryList = await CacheEntryService.list(pageSize, cursor);

  return res.json({
    data: entryList,
  });
}
