import { readFileSync } from 'fs';
import YAML from 'yaml';
import { config } from '../config/environment';
import { DEFAULT_PAGE_SIZE } from '../constants';

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

export function getTtl(ttl: number | undefined): number {
  return typeof ttl === 'number'
    ? ttl
    : config.getCacheOptions().defaultTTLInSecs;
}
