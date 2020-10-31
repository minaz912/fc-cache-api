import dotenv from 'dotenv';

dotenv.config();

interface CacheOptions {
  defaultTTLInSecs: number;
  limitCount: number;
}

class AppConfig {
  constructor(private env: { [k: string]: string | undefined }) {
    this.env = env;
  }

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];

    if (!value && throwOnMissing) {
      throw new Error(`Config error - missing env.${key}`);
    }

    return value as string;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);

    return mode !== 'DEV';
  }

  public getDBURI(): string {
    return this.getValue('MONGODB_URI');
  }

  public getCacheOptions(): CacheOptions {
    return {
      defaultTTLInSecs:
        Number.parseInt(
          this.getValue('DEFAULT_CACHE_ENTRY_TTL_IN_SECS', false),
          10
        ) || 500,
      limitCount:
        Number.parseInt(this.getValue('CACHE_LIMIT_COUNT', false), 10) || 10,
    };
  }
}

export const config = new AppConfig(process.env).ensureValues([
  'MONGODB_URI',
  'PORT',
  'NODE_ENV',
]);
