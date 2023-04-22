/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/member-ordering */
import { Db, MongoClient, OptionalId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

const DATABASE_NAME = 'testDatabase';

export class DatabaseServiceMock {
    private db: Db;
    private client: MongoClient;
    mongoServer: MongoMemoryServer;

    async start(url?: string): Promise<MongoClient | null> {
        if (!this.client) {
            this.mongoServer = await MongoMemoryServer.create();
            const mongoUri = this.mongoServer.getUri();
            this.client = new MongoClient(mongoUri);
            await this.client.connect();
            this.db = this.client.db(DATABASE_NAME);
        }

        return this.client;
    }

    async closeConnection(): Promise<void> {
        if (this.client) {
            return this.client.close();
        } else {
            return Promise.resolve();
        }
    }

    get database(): Db {
        return this.db;
    }
    async populateDb(collectionName: string, data: OptionalId<Document>[]) {
        if ((await this.db.collection(collectionName).find({}).toArray()).length === 0) {
            await this.db.collection(collectionName).insertMany(data);
        }
    }
}
