import { DatabaseService } from '@app/services/database-service/database.service';
import { GameRankingService } from '@app/services/game-ranking-service/game-ranking.service';
import { GameStorageService } from '@app/services/game-storage-service/game-storage.service';
import { defaultRanking } from '@common/interfaces/ranking';
import { RankingData } from '@common/interfaces/ranking.data';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('GameRankingService', () => {
    let gameRankingService: GameRankingService;
    let gameStorageService: GameStorageService;

    beforeEach(() => {
        gameStorageService = new GameStorageService(new DatabaseService());
        gameRankingService = new GameRankingService(gameStorageService);
        gameRankingService['newRanking'] = { name: 'testName', score: 1, gameName: 'testGame', socketId: 'socket1' };
        gameRankingService['gameName'] = 'testGame';
        gameRankingService['matchType'] = '1 contre 1';
    });

    it('should return the updated ranking data', async () => {
        stub(gameStorageService, 'getGameById').resolves({
            gameData: {
                id: 1,
                name: 'Test',
                isEasy: false,
                nbrDifferences: 4,
                differences: [
                    [
                        { x: 4, y: 0 },
                        { x: 3, y: 0 },
                        { x: 2, y: 0 },
                        { x: 1, y: 0 },
                        { x: 0, y: 0 },
                    ],
                ],
                soloRanking: defaultRanking,
                oneVersusOneRanking: defaultRanking,
            },
            originalImage: Buffer.from(''),
            modifiedImage: Buffer.from(''),
        });
        const gameId = 'game-id';
        const ranking = { name: 'player1', score: 100, gameName: 'game1', socketId: 'socket1' };
        const expectedRankingData: RankingData = {
            username: 'player1',
            position: 'deuxième',
            gameName: 'game1',
            matchType: '1 contre 1',
            winnerSocketId: 'socket1',
        };
        stub(gameStorageService, 'updateGameOneVersusOneNewBreakingRecord').resolves(1);
        stub(gameStorageService, 'updateGameSoloNewBreakingRecord').resolves(1);
        const actualRankingData = await gameRankingService.handleNewScore(gameId, true, ranking);

        expect(actualRankingData).to.deep.equal(expectedRankingData);
    });

    it('should return the updated ranking data', async () => {
        stub(gameStorageService, 'getGameById').resolves({
            gameData: {
                id: 1,
                name: 'Test',
                isEasy: false,
                nbrDifferences: 4,
                differences: [
                    [
                        { x: 4, y: 0 },
                        { x: 3, y: 0 },
                        { x: 2, y: 0 },
                        { x: 1, y: 0 },
                        { x: 0, y: 0 },
                    ],
                ],
                soloRanking: defaultRanking,
                oneVersusOneRanking: defaultRanking,
            },
            originalImage: Buffer.from(''),
            modifiedImage: Buffer.from(''),
        });
        const gameId = 'game-id';
        const ranking = { name: 'player1', score: 100, gameName: 'game1', socketId: 'socket1' };
        const expectedRankingData: RankingData = {
            username: 'player1',
            position: 'deuxième',
            gameName: 'game1',
            matchType: 'Solo',
            winnerSocketId: 'socket1',
        };
        stub(gameStorageService, 'updateGameOneVersusOneNewBreakingRecord').resolves(1);
        stub(gameStorageService, 'updateGameSoloNewBreakingRecord').resolves(1);
        const actualRankingData = await gameRankingService.handleNewScore(gameId, false, ranking);

        expect(actualRankingData).to.deep.equal(expectedRankingData);
    });

    it('should return the updated ranking data for a one versus one game', async () => {
        stub(gameStorageService, 'getGameById').resolves({
            gameData: {
                id: 1,
                name: 'Test',
                isEasy: false,
                nbrDifferences: 4,
                differences: [
                    [
                        { x: 4, y: 0 },
                        { x: 3, y: 0 },
                        { x: 2, y: 0 },
                        { x: 1, y: 0 },
                        { x: 0, y: 0 },
                    ],
                ],
                soloRanking: defaultRanking,
                oneVersusOneRanking: defaultRanking,
            },
            originalImage: Buffer.from(''),
            modifiedImage: Buffer.from(''),
        });
        gameRankingService['newRanking'] = { name: 'testName', score: 1, gameName: 'testGame', socketId: 'socket1' };
        stub(gameStorageService, 'updateGameOneVersusOneNewBreakingRecord').resolves(1);
        stub(gameStorageService, 'updateGameSoloNewBreakingRecord').resolves(1);

        const expectedRankingData: RankingData = {
            username: gameRankingService['newRanking'].name,
            position: 'deuxième',
            gameName: gameRankingService['newRanking'].gameName,
            matchType: gameRankingService['matchType'],
            winnerSocketId: 'socket1',
        };

        const actualRankingData = await gameRankingService.updateRanking('gameId', true);
        expect(actualRankingData).to.deep.equal(expectedRankingData);
    });

    it('should return the updated ranking data for a solo game', async () => {
        stub(gameStorageService, 'getGameById').resolves({
            gameData: {
                id: 1,
                name: 'Test',
                isEasy: false,
                nbrDifferences: 4,
                differences: [
                    [
                        { x: 4, y: 0 },
                        { x: 3, y: 0 },
                        { x: 2, y: 0 },
                        { x: 1, y: 0 },
                        { x: 0, y: 0 },
                    ],
                ],
                soloRanking: defaultRanking,
                oneVersusOneRanking: defaultRanking,
            },
            originalImage: Buffer.from(''),
            modifiedImage: Buffer.from(''),
        });
        gameRankingService['newRanking'] = { name: 'testName', score: 1, gameName: 'testGame', socketId: 'socket1' };
        stub(gameStorageService, 'updateGameSoloNewBreakingRecord').resolves(1);
        gameRankingService['matchType'] = 'Solo';
        const expectedRankingData: RankingData = {
            username: gameRankingService['newRanking'].name,
            position: 'deuxième',
            gameName: gameRankingService['newRanking'].gameName,
            matchType: gameRankingService['matchType'],
            winnerSocketId: 'socket1',
        };

        const actualRankingData = await gameRankingService.updateRanking('gameId', false);
        expect(actualRankingData).to.deep.equal(expectedRankingData);
    });

    it('should set position to "première" for input 1', () => {
        gameRankingService['positionToString'](1);
        expect(gameRankingService['position']).to.equal('première');
    });

    it('should set position to "deuxième" for input 2', () => {
        gameRankingService['positionToString'](2);
        expect(gameRankingService['position']).to.equal('deuxième');
    });

    it('should set position to "troisième" for input 3', () => {
        gameRankingService['positionToString'](3);
        expect(gameRankingService['position']).to.equal('troisième');
    });

    it('should set position to "" for default', () => {
        gameRankingService['positionToString'](0);
        expect(gameRankingService['position']).to.equal('');
    });
});
