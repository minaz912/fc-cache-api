import { Express } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import { loadDocumentSync } from '../utils';

export function initOpenApiValidatorMiddleware(app: Express, basePath: string) {
  const swaggerDoc = loadDocumentSync(`${basePath}/openapi.yaml`);
  app.use(
    OpenApiValidator.middleware({
      apiSpec: swaggerDoc,
      operationHandlers: `${basePath}/controllers`,
      validateRequests: true,
      validateFormats: 'full',
    })
  );
}
