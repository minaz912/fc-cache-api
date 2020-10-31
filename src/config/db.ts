import mongoose from 'mongoose';

export async function createConnection() {
  const dbConnectionResult = await mongoose.connect(
    'mongodb://localhost:27017/cache',
    {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  );

  return dbConnectionResult.connection;
}
