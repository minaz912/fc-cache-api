import { resolve } from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createConnection as createDBConnection } from './config/db';
import { config } from './config/environment';
import { initOpenApiValidatorMiddleware } from './middleware/openApi.middleware';

export const app = express();

const port = config.getPort();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

createDBConnection(config.getDBURI());

initOpenApiValidatorMiddleware(app, resolve(__dirname));

app.get('/', (_req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`🚀 Express server listening on http://127.0.0.1:${port}`);
});
