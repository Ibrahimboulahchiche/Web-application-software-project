/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from '@app/app';
import { GameStorageService } from '@app/services/game-storage-service/game-storage.service';
import { SocketManager } from '@app/services/socket-manager-service/socket-manager.service';
import { Vector2 } from '@common/classes/vector2';
import { EntireGameUploadForm } from '@common/interfaces/entire.game.upload.form';
import { GameData } from '@common/interfaces/game.data';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { createSandbox, createStubInstance, SinonSandbox, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

const HTTP_STATUS_NOT_FOUND = StatusCodes.NOT_FOUND;
const HTTP_STATUS_OK = StatusCodes.OK;
const HTTP_STATUS_CREATED = StatusCodes.CREATED;

const API_URL = '/api/games';

describe('GamesController', () => {
    let gameStorageServiceStub: SinonStubbedInstance<GameStorageService>;
    let socketManagerServiceStub: SinonStubbedInstance<SocketManager>;
    let sandbox: SinonSandbox;
    let expressApp: Express.Application;
    beforeEach(async () => {
        sandbox = createSandbox();
        gameStorageServiceStub = createStubInstance(GameStorageService);
        socketManagerServiceStub = createStubInstance(SocketManager);

        const app = Container.get(Application);
        Object.defineProperty(app['gamesController'], 'gameStorageService', { value: gameStorageServiceStub });
        Object.defineProperty(app['gamesController'], 'socketManagerService', { value: socketManagerServiceStub, configurable: true });
        expressApp = app.app;
    });

    afterEach(() => {
        sinon.restore();
        sandbox.restore();
    });

    const game: GameData = {
        id: 0,
        name: 'Glutton',
        isEasy: true,
        nbrDifferences: 7,
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        differences: [[new Vector2(1, 2), new Vector2(5, 6)], [new Vector2(4, 3)]], // array of all the pixels in a difference
        oneVersusOneRanking: [],
        soloRanking: [],
    };
    const images = { originalImage: Buffer.from(''), modifiedImage: Buffer.from('') };
    const gameInfo = {
        gameData: game as any,
        originalImage: images.originalImage as any,
        matchToJoinIfAvailable: 'abcde' as any,
    };
    describe('GET /fetchGame/:id', () => {
        it('GET should return game by id', async () => {
            gameStorageServiceStub.getGameById.returns(
                Promise.resolve({
                    gameData: game,
                    originalImage: images.originalImage,
                    modifiedImage: images.modifiedImage,
                    matchToJoinIfAvailable: gameInfo.matchToJoinIfAvailable,
                }),
            );
            supertest(expressApp)
                .get(`${API_URL}/fetchGame/0`)
                .expect(HTTP_STATUS_OK)
                .then((response) => {
                    expect(response.body).to.deep.equal(game);
                });
        });
        it('fetchGame should catch error', async () => {
            const errorMessage = 'Update failed';
            gameStorageServiceStub.getGameById.rejects(errorMessage);

            supertest(expressApp)
                .get(`${API_URL}/fetchGame/${game.id}`)
                .expect(HTTP_STATUS_OK)
                .end((err, res) => {
                    if (err) return err;
                    expect(res.body).to.deep.equal(game);
                });
        });
        it('GET should fetchAllGames', async () => {
            gameStorageServiceStub.getAllGames.returns(
                Promise.resolve([{ gameData: game as GameData, originalImage: images.originalImage, modifiedImage: images.modifiedImage }]),
            );
            supertest(expressApp)
                .get(`${API_URL}/fetchAllGames`)
                .expect(HTTP_STATUS_OK)
                .then((response) => {
                    expect(response.body).to.deep.equal(JSON.stringify([game]));
                });
        });
        it('fetchAllGames should catch error', async () => {
            const errorMessage = 'Update failed';
            gameStorageServiceStub.getAllGames.rejects(errorMessage);

            supertest(expressApp)
                .get(`${API_URL}/fetchAllGames`)
                .expect(HTTP_STATUS_OK)
                .end((err, res) => {
                    if (err) return err;
                    expect(res.body).to.deep.equal(game);
                });
        });
    });

    describe('GET /:id', () => {
        it('GET should return games by page id', async () => {
            gameStorageServiceStub.getGamesInPage.returns(
                Promise.resolve([
                    {
                        gameData: gameInfo.gameData as GameData,
                        originalImage: gameInfo.originalImage.toString(),
                        matchToJoinIfAvailable: gameInfo.matchToJoinIfAvailable as string,
                    },
                ]),
            );
            gameStorageServiceStub.getNumberOfSavedGames.returns(Promise.resolve(1));
            supertest(expressApp)
                .get(`${API_URL}/0`)
                .expect(HTTP_STATUS_OK)
                .then((response) => {
                    expect(response.body).to.deep.equal({
                        gameContent: [{ gameData: gameInfo.gameData, originalImage: gameInfo.originalImage }],
                        nbrOfGames: 1,
                    });
                });
        });

        it('GET should not return games by page id if cannot get games', async () => {
            const errorMessage = 'Update failed';
            gameStorageServiceStub.getGamesInPage.rejects(errorMessage);
            gameStorageServiceStub.getNumberOfSavedGames.returns(Promise.resolve(1));
            supertest(expressApp)
                .get(`${API_URL}/0`)
                .expect(HTTP_STATUS_OK)
                .then((response) => {
                    expect(response.text).to.equal(errorMessage);
                });
        });
    });
    describe('POST /saveGame ', () => {
        it('POST /saveGame should save a new game ', async () => {
            gameStorageServiceStub.storeGameImages.resolves();
            gameStorageServiceStub.storeGameResult.resolves();
            socketManagerServiceStub.sendRefreshAvailableGames.resolves();
            const newGameToAdd: EntireGameUploadForm = {
                gameId: 2,
                firstImage: { background: [] },
                secondImage: { background: [] },
                differences: [[{ x: 100, y: 100 }]],
                gameName: 'saveGame test',
                isEasy: true,
            };
            await supertest(expressApp)
                .post(`${API_URL}/saveGame`)
                .send(newGameToAdd)
                .expect(HTTP_STATUS_CREATED)
                .then((response) => {
                    expect(response.body).to.deep.equal({ body: newGameToAdd.gameName });
                });
            sinon.restore();
        });

        it('POST /saveGame should not save a new game when error occurs ', async () => {
            const errorMessage = 'Store game result failed';
            gameStorageServiceStub.storeGameImages.resolves();
            gameStorageServiceStub.storeGameResult.rejects(errorMessage);
            const newGameToAdd: EntireGameUploadForm = {
                gameId: 2,
                firstImage: { background: [] },
                secondImage: { background: [] },
                differences: [[{ x: 100, y: 100 }]],
                gameName: 'saveGame test',
                isEasy: true,
            };
            await supertest(expressApp)
                .post(`${API_URL}/saveGame`)
                .send(newGameToAdd)
                .expect(HTTP_STATUS_NOT_FOUND)
                .then((response) => {
                    expect(response.text).to.equal('');
                });
            sinon.restore();
        });
    });
    describe('DELETE', async () => {
        it('DELETE request should delete all games from database', async () => {
            gameStorageServiceStub.deleteAll.resolves();
            await supertest(expressApp)
                .delete(`${API_URL}/allGames`)
                .expect(HTTP_STATUS_OK)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                });
        });

        it('DELETE /allGames should not delete when error occurs', async () => {
            const errorMessage = 'Update failed';
            gameStorageServiceStub.deleteAll.rejects(errorMessage);
            supertest(expressApp)
                .delete(`${API_URL}/allGames`)
                .expect(HTTP_STATUS_NOT_FOUND)
                .then((response) => {
                    expect(response.text).to.equal(errorMessage);
                });
        });

        it('DELETE request should delete selected game from database', async () => {
            gameStorageServiceStub.deleteById.resolves();
            await supertest(expressApp)
                .delete(`${API_URL}/0`)
                .expect(HTTP_STATUS_OK)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                });
        });

        it('DELETE /:id should not delete when error occurs', async () => {
            const errorMessage = 'Update failed';
            gameStorageServiceStub.deleteById.rejects(errorMessage);
            supertest(expressApp)
                .delete(`${API_URL}/0`)
                .expect(HTTP_STATUS_NOT_FOUND)
                .then((response) => {
                    expect(response.text).to.equal(errorMessage);
                });
        });
    });
});
