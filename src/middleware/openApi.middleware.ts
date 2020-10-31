import { Express } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';

export function initOpenApiValidatorMiddleware(
  app: Express,
  basePath: string,
  swaggerDoc: any
) {
  app.use(
    OpenApiValidator.middleware({
      apiSpec: swaggerDoc,
      operationHandlers: `${basePath}/controllers`,
      validateRequests: true,
      validateFormats: 'full',
    })
  );
}
