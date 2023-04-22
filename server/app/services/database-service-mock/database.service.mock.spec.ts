/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { OptionalId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as sinon from 'sinon';
import { DatabaseServiceMock } from './database.service.mock';
describe('DatabaseServiceMock', () => {
    let mongoServer: MongoMemoryServer;

    let databaseServiceTest: DatabaseServiceMock;
    beforeEach(async () => {
        databaseServiceTest = new DatabaseServiceMock();
        mongoServer = await MongoMemoryServer.create();
    });
    afterEach(async () => {
        await databaseServiceTest.closeConnection();
    });

    it('should connect to the database when start is called', async () => {
        const mongoUri = mongoServer.getUri();
        await databaseServiceTest.start(mongoUri);
        expect(databaseServiceTest['client']).to.not.be.undefined;
        expect(databaseServiceTest['db'].databaseName).to.equal('testDatabase');
    });
    it('should not create a new client', async () => {
        const mongoUri = mongoServer.getUri();
        await databaseServiceTest.start(mongoUri);
        await databaseServiceTest.start(mongoUri);
        expect(databaseServiceTest['client']).to.not.be.undefined;
    });
    it('should connect to the database when start is called', async () => {
        await databaseServiceTest.closeConnection();
        expect(databaseServiceTest['client']).to.be.undefined;
    });
    it('should not populate the database', async () => {
        const DATABASE_NAME = 'testDatabase';
        const mongoUri = mongoServer.getUri();
        await databaseServiceTest.start(mongoUri);
        await databaseServiceTest.database.collection(DATABASE_NAME).insertOne({ id: 5 });
        const database: OptionalId<Document> = (await databaseServiceTest.database.collection(DATABASE_NAME).find({})) as any;
        const insertManySpy: sinon.SinonSpy = sinon.spy(databaseServiceTest.database.collection(DATABASE_NAME), 'insertMany');
        await databaseServiceTest.populateDb(DATABASE_NAME, [database]);
        sinon.assert.notCalled(insertManySpy);
    });
});
