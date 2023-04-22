/* eslint-disable deprecation/deprecation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatabaseServiceMock } from '@app/services/database-service-mock/database.service.mock';
import { LAST_GAME_ID_FILE, PERSISTENT_DATA_FOLDER_PATH } from '@app/utils/env';
import { GameData } from '@common/interfaces/game.data';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fs from 'fs';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import * as sinon from 'sinon';
import { GameStorageService } from './game-storage.service';
chai.use(chaiAsPromised);
describe('Game storage service', () => {
    let gameStorageService: GameStorageService;
    let databaseServiceTest: DatabaseServiceMock;
    let client: MongoClient;
    let gamePrototype: GameData;

    beforeEach(async () => {
        databaseServiceTest = new DatabaseServiceMock();
        client = (await databaseServiceTest.start()) as MongoClient;
        gameStorageService = new GameStorageService(databaseServiceTest as any);

        gamePrototype = {
            id: 5,
            name: 'Glouton',
            isEasy: true,
            nbrDifferences: 5,
            differences: [[]],
            oneVersusOneRanking: [
                { name: 'Player 1', score: 10 },
                { name: 'Player 2', score: 10 },
                { name: 'Player 3', score: 10 },
            ],
            soloRanking: [
                { name: 'Player 1', score: 10 },
                { name: 'Player 2', score: 10 },
                { name: 'Player 3', score: 10 },
            ],
        };
        await gameStorageService.collection.insertOne(gamePrototype);
    });
    afterEach(async () => {
        await databaseServiceTest.closeConnection();
    });
    it('should return all the games from the database', async () => {
        const gamesDatabase = await gameStorageService.getAllGames();
        expect(gamesDatabase.length).to.equal(1);
        expect(gamePrototype).to.deep.equals(gamesDatabase[0].gameData);
    });
    it('should return the number of games', async () => {
        const numberOfGames = await gameStorageService.getNumberOfSavedGames();
        expect(numberOfGames).to.equal(1);
    });
    it('should get specific game with valid id', async () => {
        const id = '5';
        const gameById = await gameStorageService.getGameById(id);
        expect(gameById.gameData).to.deep.equals(gamePrototype);
    });
    it('should get specific game with invalid id', async () => {
        const id = '2';
        const gameById = await gameStorageService.getGameById(id);
        expect(gameById.gameData).to.deep.equals(null);
    });
    it('should delete a game with the specific id ', async () => {
        const id = '5';
        await gameStorageService.deleteById(id);
        const allGames = await gameStorageService.getAllGames();
        expect(allGames.length).to.equal(0);
    });

    it('deleteStoredData should delete the folder with the given gameId', async () => {
        const gameId = '123';
        const files = [{ name: '456' }, { name: '789' }, { name: gameId }];
        const readdirStub = sinon.stub(fs, 'readdir').yields(null, files);
        const rmStub = sinon.stub(fs, 'rm').yields(null);

        await gameStorageService.deleteStoredData(gameId);

        sinon.assert.calledOnce(readdirStub);
        sinon.assert.calledOnce(rmStub);

        readdirStub.restore();
        rmStub.restore();
    });

    it('should delete all the games in the database', async () => {
        const deletedAllGames = await gameStorageService.deleteAll();
        expect(deletedAllGames).to.equals(undefined);
    });

    it('should get the games in the pages', async () => {
        const gamesPage = await gameStorageService.getGamesInPage(0);
        expect(gamesPage.length).to.equal(1);
    });
    it('should store the game result', async () => {
        gameStorageService.storeGameResult(gamePrototype);
        const allGames = await gameStorageService.getAllGames();
        expect(allGames.length).to.equal(1);
    });
    it('should store defaultGame in the database', async () => {
        await gameStorageService.deleteAll();
        await gameStorageService.storeDefaultGames();
        const allGames = await gameStorageService.getAllGames();
        expect(allGames.length).to.equal(1);
    });
    it('should return the next available game id', () => {
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const readFileStub = sandbox.stub(fs, 'readFileSync');
        const writeFileStub = sinon.spy(fs, 'writeFileSync');
        readFileStub.returns('14');
        const result = gameStorageService.getNextAvailableGameId();
        expect(result).to.equal(15);
        sinon.assert.calledWith(writeFileStub, PERSISTENT_DATA_FOLDER_PATH + LAST_GAME_ID_FILE, '15');
        sandbox.restore();
        sinon.restore();
    });

    it('should throw an error if the deleted file is not good', () => {
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const readdirStub: sinon.SinonStub = sandbox.stub(fs, 'readdir');
        const consoleStub = sandbox.stub(console, 'error');
        const errorMessage = 'Error';
        readdirStub.callsFake((path: any, options: any, callback: (arg0: Error) => void) => {
            callback(new Error(errorMessage));
        });
        gameStorageService.deleteStoredData('gameId');
        sinon.assert.called(consoleStub);
        sandbox.restore();
        sinon.restore();
    });

    it('should throw an error if delete data for all game has wrong file', () => {
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const readdirStub: sinon.SinonStub = sandbox.stub(fs, 'readdir');
        const consoleStub = sandbox.stub(console, 'error');
        const errorMessage = 'Error';
        readdirStub.callsFake((path: any, options: any, callback: (arg0: Error) => void) => {
            callback(new Error(errorMessage));
        });
        gameStorageService.deleteStoredDataForAllTheGame();
        sinon.assert.called(consoleStub);
        sandbox.restore();
        sinon.restore();
    });

    it('should delete the stored data', () => {
        const pathTest = PERSISTENT_DATA_FOLDER_PATH;
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const readdirStub: sinon.SinonStub = sandbox.stub(fs, 'readdir');
        gameStorageService.deleteStoredData('5');
        sinon.assert.calledWith(readdirStub, pathTest, { withFileTypes: true });
        sandbox.restore();
        sinon.restore();
    });

    it('should throw an error if the path is not good when return the next available game id', () => {
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const readFileStub = sandbox.stub(fs, 'readFileSync');
        const writeFileStub = sandbox.spy(fs, 'writeFileSync');
        readFileStub.throws(Error);
        const result = gameStorageService.getNextAvailableGameId();
        expect(result).to.equal(0);
        sinon.assert.calledWith(writeFileStub, PERSISTENT_DATA_FOLDER_PATH + LAST_GAME_ID_FILE, '0');
        sandbox.restore();
        sinon.restore();
    });

    it('should create a new folder', () => {
        const pathTest = './app/data';
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const mkdirStub = sandbox.spy(fs, 'mkdir');
        gameStorageService.createFolder(pathTest);
        sinon.assert.calledWith(mkdirStub, pathTest, { recursive: true });
        sandbox.restore();
        sinon.restore();
    });

    it('should update the solo record', async () => {
        const gameId = '1';
        const record = { name: '123', score: 100 };
        const getGameByIdStub = sinon.stub(gameStorageService, 'getGameById');

        sinon.stub(gameStorageService.collection, 'findOneAndUpdate').yields(null);
        sinon.stub(gameStorageService.collection, 'updateOne').yields(null);

        const originalImage = Buffer.from('originalImage');
        const modifiedImage = Buffer.from('modifiedImage');
        const mockReturnValue = {
            gameData: gamePrototype,
            originalImage,
            modifiedImage,
        };
        getGameByIdStub.resolves(mockReturnValue);
        const result = await gameStorageService.updateGameSoloNewBreakingRecord(gameId, record);
        expect(result).to.be.equal(-1);
    });

    it('updateGameSoloNewBreakingRecord should throw an error when game data not found', async () => {
        try {
            sinon
                .stub(gameStorageService, 'getGameById')
                .resolves({ gameData: null, originalImage: Buffer.alloc(3), modifiedImage: Buffer.alloc(3) });
            await gameStorageService.updateGameSoloNewBreakingRecord('-1', gamePrototype.oneVersusOneRanking[0]);
        } catch (err) {
            expect(err.message).equal(`Game data not found for game with id${-1}`);
        }
    });

    it('should update the 1v1 record', async () => {
        const gameId = '1';
        const record = { name: '123', score: 100 };
        const getGameByIdStub = sinon.stub(gameStorageService, 'getGameById');

        sinon.stub(gameStorageService.collection, 'findOneAndUpdate').yields(null);
        sinon.stub(gameStorageService.collection, 'updateOne').yields(null);

        const originalImage = Buffer.from('originalImage');
        const modifiedImage = Buffer.from('modifiedImage');
        const mockReturnValue = {
            gameData: gamePrototype,
            originalImage,
            modifiedImage,
        };
        getGameByIdStub.resolves(mockReturnValue);
        const result = await gameStorageService.updateGameOneVersusOneNewBreakingRecord(gameId, record);
        expect(result).to.be.equal(-1);
    });

    it('should throw an error when updateGameOneVersusOneNewBreakingRecord data not found', async () => {
        try {
            sinon
                .stub(gameStorageService, 'getGameById')
                .resolves({ gameData: null, originalImage: Buffer.alloc(3), modifiedImage: Buffer.alloc(3) });
            await gameStorageService.updateGameOneVersusOneNewBreakingRecord('-1', gamePrototype.oneVersusOneRanking[0]);
        } catch (err) {
            expect(err.message).to.deep.equals(`Game data not found for game with id${-1}`);
        }
    });
    it('should throw an error when creating the folder', () => {
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const pathTest = './app/data';
        const mkdirStub: sinon.SinonStub = sandbox.stub(fs, 'mkdir');
        const consoleStub = sandbox.stub(console, 'error');
        const errorMessage = 'Error: folder already exists';
        mkdirStub.callsFake((path: any, options: any, callback: (arg0: Error) => void) => {
            callback(new Error(errorMessage));
        });
        gameStorageService.createFolder(pathTest);
        sinon.assert.calledWith(mkdirStub, pathTest, { recursive: true });
        sinon.assert.called(consoleStub);
        sandbox.restore();
        sinon.restore();
    });

    it('should reset scores for a specific game', async () => {
        sinon.stub(gameStorageService.collection, 'findOneAndUpdate').resolves(null);
        expect(await gameStorageService.resetScoresById('1')).to.be.equal(undefined);
    });

    it('should reset scores for all games', async () => {
        sinon.stub(gameStorageService.collection, 'findOneAndUpdate').resolves(null);

        expect(await gameStorageService.resetAllScores()).to.be.equal(undefined);
    });

    it('should store the game images in the folder', async () => {
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const writeFileSpy = sandbox.spy(fs, 'writeFile');
        const id = 5;
        const bufferImage1 = Buffer.from([0]);
        const bufferImage2 = Buffer.from([0]);
        await gameStorageService.storeGameImages(id, bufferImage1, bufferImage2);
        sinon.assert.calledTwice(writeFileSpy);
        sandbox.restore();
        sinon.restore();
    });
    it('should show the error if any error appear in the writing', () => {
        const myError = new Error('error in the writing');
        const sandbox: sinon.SinonSandbox = sinon.createSandbox();
        const consoleStub = sandbox.stub(console, 'error');
        gameStorageService.writeFileErrorManagement(myError);
        sinon.assert.called(consoleStub);
        sandbox.restore();
        sinon.restore();
    });
    describe('Error Handling', async () => {
        it('should throw an error if we try to get all the games  on a closed connection', async () => {
            await client.close();
            expect(gameStorageService.getAllGames()).to.eventually.be.rejectedWith(Error);
        });
        it('should throw an error if we try to get a specific game on a closed connection', async () => {
            await client.close();
            expect(gameStorageService.getGameById('5')).to.eventually.be.rejectedWith(Error);
        });
    });
});
