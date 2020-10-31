import { readFileSync } from 'fs';
import YAML from 'yaml';
import { config } from '../config/environment';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { ICacheEntryDto } from '../dtos/cacheEntry.dto';
import { ICacheEntry } from '../models/cacheEntry.model';

interface PaginationObject<T> {
  entries: T[];
  cursor: string | null;
}

export function buildPaginationObject<
  K extends keyof any,
  T extends Record<K, any>
>(entries: T[], paginationKey: K): PaginationObject<T> {
  const nextCursor =
    entries.length > 0
      ? String(entries[entries.length - 1][paginationKey])
      : null;

  return {
    entries,
    cursor: nextCursor,
  };
}

export function loadDocumentSync(file: string): any {
  return YAML.parseDocument(readFileSync(file, 'utf8'));
}

export function getPageSize(limit: number | undefined): number {
  return typeof limit === 'number' ? limit : DEFAULT_PAGE_SIZE;
}

export function getCursor(after: string | undefined): string | null {
  return typeof after === 'string' ? after : null;
}

export function getTTL(ttlInSecs?: number | undefined): number {
  return typeof ttlInSecs === 'number'
    ? ttlInSecs
    : config.getCacheOptions().defaultTTLInSecs;
}

export function mapCacheEntryToDto(cacheEntry: ICacheEntry): ICacheEntryDto {
  return {
    id: String(cacheEntry._id),
    key: cacheEntry.key,
    value: cacheEntry.value,
    expiresAt: cacheEntry.expiresAt.toISOString(),
  };
}

export function generateCacheExpiryTimestamp(
  now: Date,
  ttlInSecs: number
): Date {
  // we should not mutate the input, so we clone it
  const clonedDate = new Date(now.getTime());
  const newTimestamp = clonedDate.setSeconds(
    clonedDate.getSeconds() + ttlInSecs
  );
  return new Date(newTimestamp);
}

export function generateRandomString(length?: number): string {
  const defaultStringLength = 10;
  const charPool =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let strLength = length || defaultStringLength;

  const rv: string[] = [];
  while (strLength > 0) {
    rv.push(charPool.charAt(Math.floor(Math.random() * charPool.length)));
    strLength -= 1;
  }

  return rv.join('');
}

export function getDateDifferenceInSecs(
  firstOccurrence: Date,
  secondOccurrence: Date
): number {
  return (secondOccurrence.getTime() - firstOccurrence.getTime()) / 1000;
}
