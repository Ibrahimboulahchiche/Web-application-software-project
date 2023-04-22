/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from '@app/app';
import { GameStorageService } from '@app/services/game-storage-service/game-storage.service';
import { PERSISTENT_DATA_FOLDER_PATH } from '@app/utils/env';
import { Vector2 } from '@common/classes/vector2';
import { GameData } from '@common/interfaces/game.data';
import { expect } from 'chai';
import * as fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { SinonSandbox, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { ImageProviderController } from './image-provider.controller';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import assert = require('assert');
import path = require('path');

const API_URL = '/api/images';

const game: GameData = {
    id: 1,
    name: 'Glutton',
    isEasy: true,
    nbrDifferences: 7,
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    differences: [[new Vector2(1, 2), new Vector2(5, 6)], [new Vector2(4, 3)]],
    oneVersusOneRanking: [],
    soloRanking: [],
};
const images = { originalImage: Buffer.from(''), modifiedImage: Buffer.from('') };
const gameInfo = {
    gameData: game as any,
    originalImage: images.originalImage as any,
    matchToJoinIfAvailable: 'abcde' as any,
};

describe('ImageProviderController', () => {
    let gameStorageServiceStub: SinonStubbedInstance<GameStorageService>;
    let sandbox: SinonSandbox;
    let expressApp: Express.Application;
    let imageProviderController: ImageProviderController;

    beforeEach(async () => {
        sandbox = sinon.createSandbox();
        gameStorageServiceStub = sinon.createStubInstance(GameStorageService);
        gameStorageServiceStub.getGameById.returns(
            Promise.resolve({
                gameData: game,
                originalImage: images.originalImage,
                modifiedImage: images.modifiedImage,
                matchToJoinIfAvailable: gameInfo.matchToJoinIfAvailable,
            }),
        );
        imageProviderController = new ImageProviderController();
        const app = Container.get(Application);
        expressApp = app.app;
    });

    afterEach(() => {
        sinon.restore();
        sandbox.restore();
    });

    it('GET should retrieve the appropriate image', async () => {
        assert(imageProviderController.router);
        const imgPath = path.join(PERSISTENT_DATA_FOLDER_PATH, '1');
        fs.mkdirSync(imgPath, { recursive: true });
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        fs.writeFileSync(path.join(imgPath, '1.bmp'), Buffer.from([0x42, 0x4d]));
        await supertest(expressApp).get(`${API_URL}/1/1`).expect(StatusCodes.OK);
    });

    it('GET should send a 500 error for an invalid image', async () => {
        assert(imageProviderController.router);
        const imgPath = path.join(PERSISTENT_DATA_FOLDER_PATH, '1');
        fs.mkdirSync(imgPath, { recursive: true });
        const readFileStub = sinon.stub(fs, 'readFile').callsArgWith(1, new Error('Test error'));

        await supertest(expressApp).get(`${API_URL}/1/1`);
        sinon.assert.calledOnce(readFileStub);
    });

    it('GET should send a 404 error when game is non existent', async () => {
        const wrongGamePath = 'testPath';
        supertest(expressApp)
            .get(`${API_URL}/${wrongGamePath}/2`)
            .then((res) => {
                expect(res.status).to.deep.equal(StatusCodes.NOT_FOUND);
            });
    });
});
