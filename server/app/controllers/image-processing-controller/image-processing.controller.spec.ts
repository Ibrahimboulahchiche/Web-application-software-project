/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
import { Application } from '@app/app';
import { GameStorageService } from '@app/services/game-storage-service/game-storage.service';
import { ImageProcessingService } from '@app/services/image-processing-service/image-processing.service';
import { Vector2 } from '@common/classes/vector2';
import { DifferenceImage } from '@common/interfaces/difference.image';
import { ImageUploadForm } from '@common/interfaces/image.upload.form';
import { ImageUploadResult } from '@common/interfaces/image.upload.result';
import { assert, expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { ImageProcessingController } from './image-processing.controller';

const API_URL = '/api/image_processing';

describe('ImageProcessingController', () => {
    const radius = 3;

    const image: DifferenceImage = {
        background: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    const image2: DifferenceImage = {
        background: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    const imageBuffer1 = Buffer.alloc(3);
    const imageBuffer2 = Buffer.alloc(3);

    for (let i = 0; i < imageBuffer1.length; i++) {
        imageBuffer1.writeUInt8(5, i);
        imageBuffer2.writeUInt8(6, i);
    }

    const receivedDifferenceImages = {
        firstImage: image,
        secondImage: image2,
        radius,
    } as ImageUploadForm;

    const expectedResult = {
        resultImageByteArray: [5, 5, 5],
        numberOfDifferences: 1,
        message: 'Success!',
        generatedGameId: -1,
        differences: [
            [
                { x: 4, y: 0 },
                { x: 3, y: 0 },
                { x: 2, y: 0 },
                { x: 1, y: 0 },
                { x: 0, y: 0 },
            ],
        ],
        isEasy: true,
    } as ImageUploadResult;

    const image1Dimensions = new Vector2(640, 480);
    const image2Dimensions = new Vector2(640, 440);

    let imageProcessingService: ImageProcessingService;
    let gameStorageService: SinonStubbedInstance<GameStorageService>;
    let controller: ImageProcessingController;
    let imageProcessingServiceStub: sinon.SinonStub;
    let expressApp: Express.Application;

    beforeEach(async () => {
        imageProcessingService = new ImageProcessingService();
        const getImageDimensionsStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getImageDimensions');
        getImageDimensionsStub.withArgs(imageBuffer1).returns(image1Dimensions);
        getImageDimensionsStub.withArgs(imageBuffer2).returns(image2Dimensions);
        imageProcessingServiceStub = sinon.stub(imageProcessingService, 'getDifferencesBlackAndWhiteImage');
        gameStorageService = createStubInstance(GameStorageService);
        imageProcessingServiceStub.returns(expectedResult);
        gameStorageService.getNextAvailableGameId.resolves(-1);
        controller = new ImageProcessingController(imageProcessingService, gameStorageService);

        const app = Container.get(Application);
        expressApp = app.app;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('POST should send a created status', async () => {
        assert(controller.router);
        supertest(expressApp)
            .post(`${API_URL}/send-image`)
            .send(receivedDifferenceImages)
            .set('Accept', 'application/json')
            .expect(StatusCodes.CREATED)
            .then((res) => {
                expect(res).to.deep.equal(expectedResult);
            });
    });

    it('should return a response with status code 400 when getDifferencesBlackAndWhiteImage throws an error', async () => {
        const errorMessage = 'Some error message';
        imageProcessingServiceStub.throws(new Error(errorMessage));

        supertest(expressApp)
            .post(`${API_URL}/send-image`)
            .send(receivedDifferenceImages)
            .expect(StatusCodes.BAD_REQUEST)
            .catch((res) => {
                assert.deepEqual(res.message, errorMessage);
            });
    });

    it('should return a response with status code 400 when getGameId throws an error', async () => {
        const errorMessage = 'Some error message';
        gameStorageService.getGameById.throws(new Error(errorMessage));

        supertest(expressApp)
            .post(`${API_URL}/send-image`)
            .send(receivedDifferenceImages)
            .expect(StatusCodes.BAD_REQUEST)
            .catch((res) => {
                expect(res.message).to.deep.equal('' + errorMessage);
            });
    });
});
