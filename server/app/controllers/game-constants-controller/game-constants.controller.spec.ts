import { Application } from '@app/app';
import { GameConstantsService } from '@app/services/game-constants-service/game-constant.service';
import { ConstantsData } from '@common/interfaces/constants.data';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { createSandbox, createStubInstance, SinonSandbox, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

const HTTP_STATUS_NOT_FOUND = StatusCodes.NOT_FOUND;
const HTTP_STATUS_OK = StatusCodes.OK;

const API_URL = '/api/game_constants';

describe('GameConstantsController', () => {
    let gameConstantsServiceStub: SinonStubbedInstance<GameConstantsService>;
    let sandbox: SinonSandbox;
    let expressApp: Express.Application;

    beforeEach(async () => {
        sandbox = createSandbox();
        gameConstantsServiceStub = createStubInstance(GameConstantsService);

        const app = Container.get(Application);
        Object.defineProperty(app['gameConstantsController'], 'gameConstantsService', { value: gameConstantsServiceStub });
        expressApp = app.app;
    });

    afterEach(() => {
        sinon.restore();
        sandbox.restore();
    });

    describe('GET /', () => {
        it('should return the constants', async () => {
            gameConstantsServiceStub.getConstants.returns({ countdownValue: 120, penaltyValue: 5, bonusValue: 5 } as ConstantsData);
            const response = await supertest(expressApp).get(`${API_URL}/`);
            expect(response.status).to.equal(HTTP_STATUS_OK);
            expect(response.body).to.deep.equal({});
        });

        it('should return a not found status when error is thrown', async () => {
            const errorMessage = 'Erreur de requête';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let response: any;
            gameConstantsServiceStub.getConstants.throwsException(new Error(errorMessage));
            try {
                response = await supertest(expressApp).get(`${API_URL}/`);
            } catch (error) {
                expect(response.status).to.equal(HTTP_STATUS_NOT_FOUND);
                expect(response.body).to.deep.equal(errorMessage);
            }
        });
    });

    describe('POST /', () => {
        it('should update the constants', async () => {
            const newConstants = {};
            gameConstantsServiceStub.updateConstants.resolves(newConstants);
            const response = await supertest(expressApp).post(`${API_URL}/`).send(newConstants);
            expect(response.status).to.equal(HTTP_STATUS_OK);
            expect(response.body).to.deep.equal(newConstants);
        });

        it('should return a not found status when error is thrown', async () => {
            const errorMessage = 'Erreur de requête';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let response: any;
            gameConstantsServiceStub.updateConstants.throwsException(new Error(errorMessage));
            try {
                response = await supertest(expressApp).post(`${API_URL}/`);
            } catch (error) {
                expect(response.status).to.equal(HTTP_STATUS_NOT_FOUND);
                expect(response.body).to.deep.equal(errorMessage);
            }
        });
    });
});
