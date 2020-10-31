import { resolve } from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import { createConnection as createDBConnection } from './config/db';
import { config } from './config/environment';
import { initOpenApiValidatorMiddleware } from './middleware/openApi.middleware';
import { loadDocumentSync } from './utils';
import { Logger } from './logger';

process.on('unhandledRejection', (reason) => {
  Logger.log(`[App] - Unhandled Rejection at: ${reason}`);
});

export const app = express();

const port = config.getPort();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

createDBConnection(config.getDBURI());

const basePath = resolve(__dirname);
const swaggerDoc = loadDocumentSync(`${basePath}/openapi.yaml`);

initOpenApiValidatorMiddleware(app, basePath, swaggerDoc);

// Serve API Docs in non-production mode
if (!config.isProduction()) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
}

app.get('/', (_req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  Logger.log(`[App] - 🚀 Express server listening on http://127.0.0.1:${port}`);
});
