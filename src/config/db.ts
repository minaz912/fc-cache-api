import mongoose, { Connection } from 'mongoose';

export async function createConnection(
  DBConnectionURI: string
): Promise<Connection> {
  const dbConnectionResult = await mongoose.connect(DBConnectionURI, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  return dbConnectionResult.connection;
}
