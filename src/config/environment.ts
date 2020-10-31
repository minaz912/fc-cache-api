import dotenv from 'dotenv';

dotenv.config();

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
}

export const config = new AppConfig(process.env).ensureValues([
  'MONGODB_URI',
  'PORT',
  'NODE_ENV',
]);
