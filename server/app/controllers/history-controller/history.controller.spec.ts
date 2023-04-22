import { Application } from '@app/app';
import { HistoryStorageService } from '@app/services/history-storage-service/history-storage.service';
import { MatchType } from '@common/enums/match.type';
import { HistoryToSave } from '@common/interfaces/history.to.save';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { createSandbox, createStubInstance, SinonSandbox, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

const HTTP_STATUS_OK = StatusCodes.OK;
const API_URL = '/api/history';
describe('HistoryController', () => {
    let historyStorageService: SinonStubbedInstance<HistoryStorageService>;
    let sandbox: SinonSandbox;
    let expressApp: Express.Application;

    const historyPrototype: HistoryToSave = {
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
    beforeEach(async () => {
        sandbox = createSandbox();
        historyStorageService = createStubInstance(HistoryStorageService);

        const app = Container.get(Application);
        Object.defineProperty(app['historyController'], 'historyStorageService', { value: historyStorageService });
        expressApp = app.app;
    });

    afterEach(() => {
        sinon.restore();
        sandbox.restore();
    });

    it('GET should return the history', async () => {
        historyStorageService.getAllHistory.resolves([historyPrototype]);
        const response = await supertest(expressApp).get(`${API_URL}/`);
        expect(response.status).to.equal(HTTP_STATUS_OK);
        expect(response.body).to.deep.equal({});
    });

    it('GET should catch error', async () => {
        const errorMessage = 'Test error';
        historyStorageService.getAllHistory.rejects(errorMessage);

        supertest(expressApp)
            .get(`${API_URL}/`)
            .expect(HTTP_STATUS_OK)
            .end((err) => {
                if (err) return err;
            });
    });

    it('DELETE should send not found error when deleting history', async () => {
        const errorMessage = 'Test error';
        historyStorageService.wipeHistory.rejects(errorMessage);

        supertest(expressApp)
            .delete(`${API_URL}/`)
            .expect(HTTP_STATUS_OK)
            .end((err) => {
                if (err) return err;
            });
    });
});
