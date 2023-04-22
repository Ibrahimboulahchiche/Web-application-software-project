/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { MongoClient, OptionalId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as sinon from 'sinon';
import { DatabaseService } from './database.service';

chai.use(chaiAsPromised);

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        databaseService = new DatabaseService();
        mongoServer = await MongoMemoryServer.create();
    });

    it('should connect to the database when start is called', async () => {
        const mongoUri = mongoServer.getUri();

        await databaseService.start(mongoUri);
        expect(databaseService['client']).to.not.be.undefined;
        expect(databaseService['db'].databaseName).to.equal('LOG2990');
        await databaseService.closeConnection();
    });
    it('should not crash when environment is not set', async () => {
        await databaseService.start();
        expect(databaseService['client']).to.not.be.undefined;
        expect(databaseService['db'].databaseName).to.equal('LOG2990');
        await databaseService.closeConnection();
    });
    it('should insert data into the collection if the collection is empty', async () => {
        const mongoUri = mongoServer.getUri();
        const client = new MongoClient(mongoUri);
        const objectData: OptionalId<Document>[] = [
            {
                name: 'Object Oriented Programming',
                credits: 3,
                subjectCode: 'INF1010',
                teacher: 'Samuel Kadoury',
            },
        ] as any;

        await client.connect();
        databaseService['db'] = client.db('database');
        await databaseService.populateDb('LOG2990', objectData);
        const dataFromMdb = await databaseService.database.collection('LOG2990').find({}).toArray();
        expect(dataFromMdb.length).to.equal(1);
    });

    it('should not add data to database', async () => {
        const DATABASE_NAME = 'LOG2990';
        const mongoUri = mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.database.collection(DATABASE_NAME).insertOne({ id: 5 });
        const database: OptionalId<Document> = (await databaseService.database.collection(DATABASE_NAME).find({})) as any;
        const insertManySpy: sinon.SinonSpy = sinon.spy(databaseService.database.collection(DATABASE_NAME), 'insertMany');
        await databaseService.populateDb(DATABASE_NAME, [database, database]);
        sinon.assert.notCalled(insertManySpy);
        await databaseService.closeConnection();
    });
});
