import { readFileSync } from 'fs';
import YAML from 'yaml';

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
