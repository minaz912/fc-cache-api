import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../index';
import { CacheEntryModel } from '../models/cacheEntry.model';
import { generateRandomString } from '../utils';

async function clearDatabase() {
  await mongoose.connection.db.dropDatabase();
}

afterEach(clearDatabase);

describe('CacheEntry Endpoints', () => {
  const createEntries = async (numberOfEntries: number = 1) => {
    const createdEntries = [];
    for (let i = 0; i < numberOfEntries; i++) {
      // eslint-disable-next-line no-await-in-loop
      const newEntry = await new CacheEntryModel({
        key: generateRandomString(),
        value: generateRandomString(),
        expiresAt: new Date().getTime() + 500 * 1000,
      }).save();
      createdEntries.push(newEntry.toJSON());
    }

    return createdEntries;
  };

  describe('[GET] - /cache', () => {
    it('Should return paginated entries when no cursor is specified', async () => {
      await createEntries();

      const res = await request(app).get('/api/cache');

      expect(res.body.data.entries).toHaveLength(1);
    });

    it('Should follow requested limit', async () => {
      await createEntries(2);

      const res = await request(app).get('/api/cache').query({ limit: 1 });

      expect(res.body.data.entries).toHaveLength(1);
    });
  });

  describe('[POST] - /cache', () => {
    it('Should create entry based on key/value and return the new entry with status code 201', async () => {
      const key = '1';
      const value = '2';

      const res = await request(app).post('/api/cache').send({
        key,
        value,
      });

      expect(res.status).toEqual(201);
      expect(res.body.data.key).toEqual(key);
      expect(res.body.data.value).toEqual(value);
    });
  });

  describe('[GET] - /cache/{key}', () => {
    it('Should return the value if a key if it exists with 200 status', async () => {
      const key = 'somerandomkey';
      const res = await request(app).get(`/api/cache/${key}`);

      expect(res.status).toEqual(200);
      expect(typeof res.body.data === 'string').toBe(true);
    });

    it('Should generate a random value, save the entry and return the value with 200 status', async () => {
      const [entry] = await createEntries();

      const res = await request(app).get(`/api/cache/${entry.key}`);

      expect(res.status).toEqual(200);
      expect(res.body.data).toEqual(entry.value);
    });
  });

  describe('[DELETE] - /cache/{key}', () => {
    it('Should return a 204 status if the entry exists', async () => {
      const [entry] = await createEntries();

      const res = await request(app).delete(`/api/cache/${entry.key}`);

      expect(res.status).toEqual(204);
    });

    it('Should return a 404 status and null data if the entry does not exist', async () => {
      const key = 'somerandomkey';
      const res = await request(app).delete(`/api/cache/${key}`);

      expect(res.status).toEqual(404);
      expect(res.body.data).toEqual(null);
    });
  });

  describe('[DELETE] - /cache', () => {
    it('Should return a 204 status and drop all entries', async () => {
      const [entry] = await createEntries();

      const res = await request(app).delete(`/api/cache`);

      expect(res.status).toEqual(204);
    });
  });
});
