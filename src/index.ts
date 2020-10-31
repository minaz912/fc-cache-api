import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createConnection as createDBConnection } from './config/db';

export const app = express();

const port: number = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

createDBConnection();

app.get('/', (_req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`🚀 Express server listening on http://127.0.0.1:${port}`);
});
