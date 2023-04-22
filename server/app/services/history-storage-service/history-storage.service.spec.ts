/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatabaseServiceMock } from '@app/services/database-service-mock/database.service.mock';
import { HistoryStorageService } from '@app/services/history-storage-service/history-storage.service';
import { MatchType } from '@common/enums/match.type';
import { HistoryToSave } from '@common/interfaces/history.to.save';
import { expect } from 'chai';
import { MongoClient } from 'mongodb';

describe('History storage service', () => {
    let historyStorageService: HistoryStorageService;
    let databaseServiceTest: DatabaseServiceMock;
    let client: MongoClient;
    let historyPrototype: HistoryToSave;
    beforeEach(async () => {
        databaseServiceTest = new DatabaseServiceMock();
        client = (await databaseServiceTest.start()) as MongoClient;
        historyStorageService = new HistoryStorageService(databaseServiceTest as any);

        historyPrototype = {
            startingTime: new Date(),
            gameMode: MatchType.Solo,
            duration: '10',
            player1: 'player1',
            player2: undefined,
            isWinByDefault: false,
            isPlayer1Victory: true,
            isGameLoose: false,
            lastPlayerStanding: undefined,
        };
        await historyStorageService.collection.insertOne(historyPrototype);
    });

    afterEach(async () => {
        await databaseServiceTest.closeConnection();
    });

    it('should return all the games from the database', async () => {
        const history = await historyStorageService.getAllHistory();
        expect(history.length).to.equal(1);
        expect(historyPrototype.player1).to.deep.equals(history[0].player1);
    });

    it('should delete/wipe history from the database', async () => {
        await historyStorageService.wipeHistory();
        const history = await historyStorageService.getAllHistory();
        expect(history.length).to.equal(0);
    });

    it('should store the new history the database', async () => {
        await historyStorageService.wipeHistory();
        await historyStorageService.storeHistory(historyPrototype);
        const history = await historyStorageService.getAllHistory();
        expect(history.length).to.equal(1);
    });

    describe('Error Handling', async () => {
        it('should throw an error if we try to get all the games  on a closed connection', async () => {
            await client.close();
            expect(historyStorageService.getAllHistory()).to.eventually.be.rejectedWith(Error);
        });
    });
});
