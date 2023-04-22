/* eslint-disable no-unused-vars */
import 'dotenv/config';
import { Db, MongoClient, OptionalId } from 'mongodb';
import { Service } from 'typedi';
@Service()
export class DatabaseService {
    private db: Db;
    private client: MongoClient;
    get database(): Db {
        return this.db;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    async start(url: string = process.env.DATABASE_URL!): Promise<void> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.client = new MongoClient(process.env.DATABASE_URL!);
            await this.client.connect();
            this.db = this.client.db(process.env.DATABASE_NAME);
        } catch {
            throw new Error('Database connection error');
        }
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    async populateDb(collectionName: string, data: OptionalId<Document>[]) {
        if ((await this.db.collection(collectionName).find({}).toArray()).length === 0) {
            await this.db.collection(collectionName).insertMany(data);
        }
    }
}
