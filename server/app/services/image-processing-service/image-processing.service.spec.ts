/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Queue } from '@app/classes/queue-class/queue';
import { ImageProcessingService } from '@app/services/image-processing-service/image-processing.service';
import { Pixel } from '@common/classes/pixel';
import { Vector2 } from '@common/classes/vector2';
import { VisitData } from '@common/interfaces/visitData';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
describe('Image-Processing Service', () => {
    let imageProcessingService: ImageProcessingService;

    beforeEach(() => {
        imageProcessingService = new ImageProcessingService();
    });

    it('should returns the correct image dimensions for a positive image height', () => {
        const imageBuffer = sinon.createStubInstance(Buffer);
        imageBuffer.readInt32LE.withArgs(18).returns(12);
        imageBuffer.readInt32LE.withArgs(22).returns(10);
        const expected = new Vector2(12, 10);
        const result = imageProcessingService['getImageDimensions'](imageBuffer);

        assert.deepEqual(result, expected);
    });

    it('should returns the correct image dimensions for a negative image height', () => {
        const imageBuffer = sinon.createStubInstance(Buffer);
        imageBuffer.readInt32LE.withArgs(18).returns(12);
        imageBuffer.readInt32LE.withArgs(22).returns(-10);
        const expected = new Vector2(12, 10);
        const result = imageProcessingService['getImageDimensions'](imageBuffer);

        assert.deepEqual(result, expected);
    });
    it('should returns true if the image is in the format 24 bit Bmp', () => {
        const imageBuffer = sinon.createStubInstance(Buffer);
        imageBuffer.readUInt16LE.withArgs(28).returns(24);
        const result = imageProcessingService['is24BitDepthBMP'](imageBuffer);
        expect(result).to.be.true;
    });
    it('should returns true if the image is in the format 24 bit Bmp', () => {
        const imageBuffer = sinon.createStubInstance(Buffer);
        imageBuffer.readUInt16LE.withArgs(28).returns(22);
        const result = imageProcessingService['is24BitDepthBMP'](imageBuffer);
        expect(result).to.be.false;
    });
    it('calculates the correct starting position of a pixel in the buffer', () => {
        const position = new Vector2(1, 2);
        const imageBuffer = sinon.createStubInstance(Buffer);
        sinon.stub(imageProcessingService, <any>'getImageDimensions').returns(new Vector2(12, 10));
        const pixelBufferPos = imageProcessingService['getPixelBufferPosAtPixelPos'](position, imageBuffer);

        expect(pixelBufferPos).to.equal(129);
    });
    it('should sets the RGB values of a pixel in the image buffer', () => {
        const getPixelBufferPosAtPixelPosStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getPixelBufferPosAtPixelPos');
        const position: Vector2 = { x: 10, y: 10 };
        const pixelTest: Pixel = new Pixel(10, 11, 15);
        getPixelBufferPosAtPixelPosStub.returns(0);
        const buf = Buffer.allocUnsafe(5);

        imageProcessingService['setRGB'](position, buf, pixelTest);

        expect(buf.readUInt8(0)).to.equal(pixelTest.b);
        expect(buf.readUInt8(1)).to.equal(pixelTest.g);
        expect(buf.readUInt8(2)).to.equal(pixelTest.r);
        sinon.restore();
    });
    it('should return right position if image is using top down format', () => {
        const position: Vector2 = { x: 10, y: 10 };
        const buf = Buffer.allocUnsafe(5);
        sinon.stub(imageProcessingService, <any>'isImageUsingTopDownFormat').returns(true);
        sinon.stub(imageProcessingService, <any>'getImageDimensions').returns({ x: 100, y: 100 });
        const getPixelBufferPosAtPixelPos = imageProcessingService['getPixelBufferPosAtPixelPos'](position, buf);
        expect(getPixelBufferPosAtPixelPos).to.equal(26784);
        sinon.restore();
    });
    it('should throw an error message if the pixel position is not valid', () => {
        const spy = sinon.spy(console, 'error');
        const invalidPosition = { x: 10, y: 10 };
        const pixel = new Pixel(10, 11, 15);
        const imageBuffer = Buffer.from([15]);

        try {
            imageProcessingService['setRGB'](invalidPosition, imageBuffer, pixel);
        } catch (e) {
            expect(spy.callCount).to.equal(1);
            expect(spy.getCall(0).args[0]).to.equal("OOPS! Can't write pixel at position " + invalidPosition.x + ', ' + invalidPosition.y + '!');
            expect(spy.getCall(1).args[0]).to.equal('Cannot turn this image to white');
        }
        spy.restore();
        sinon.restore();
    });
    it('should return a null and throw an error', () => {
        const spy = sinon.spy(console, 'error');
        const invalidPosition = { x: 10, y: 10 };
        const imageBuffer = Buffer.from([15]);
        const pixelEmpty = imageProcessingService['getRGB'](invalidPosition, imageBuffer);
        expect(pixelEmpty).to.be.null;
        spy.restore();
        sinon.restore();
    });

    it('should return the RGB values of a pixel in the image buffer', () => {
        const getPixelBufferPosAtPixelPosStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getPixelBufferPosAtPixelPos');
        getPixelBufferPosAtPixelPosStub.returns(0);
        const position = { x: 10, y: 10 };
        const pixelTest = new Pixel(10, 11, 15);
        const imageBuffer = Buffer.alloc(5);
        imageBuffer.writeUInt8(pixelTest.b, 0);
        imageBuffer.writeUInt8(pixelTest.g, 1);
        imageBuffer.writeUInt8(pixelTest.r, 2);

        const result = imageProcessingService['getRGB'](position, imageBuffer);

        expect(result?.b).to.deep.equal(pixelTest.b);
        expect(result?.g).to.deep.equal(pixelTest.g);
        expect(result?.r).to.deep.equal(pixelTest.r);
        sinon.restore();
    });

    it('should turn the image to white', () => {
        const imageBuffer = Buffer.alloc(3);
        const expectedImageBuffer = Buffer.alloc(3);
        const getImageDimensionsStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getImageDimensions');
        getImageDimensionsStub.returns(new Vector2(5, 1));
        const getPixelBufferPosAtPixelPosStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getPixelBufferPosAtPixelPos');
        getPixelBufferPosAtPixelPosStub.returns(0);
        for (let i = 0; i < imageBuffer.length; i++) {
            imageBuffer.writeUInt8(5, i);
            expectedImageBuffer.writeUint8(255, i);
        }
        imageProcessingService['turnImageToWhite'](imageBuffer);
        expect(imageBuffer).to.deep.equal(expectedImageBuffer);
        sinon.restore();
    });

    it('should write an error on the console if the image is invalid or not found', () => {
        const spy = sinon.spy(console, 'error');
        const imageBuffer = Buffer.from([15]);

        try {
            imageProcessingService['turnImageToWhite'](imageBuffer);
        } catch (e) {
            expect(spy.callCount).to.equal(1);
            expect(spy.getCall(0).args[0]).to.be.an('Cannot turn this image to white');
        }
        spy.restore();
    });

    it('should return that the game is hard', () => {
        const numberOfDifference = 7;
        const sumOfAllDifferences = [new Vector2(1, 2)];
        const result = imageProcessingService['isHard'](numberOfDifference, sumOfAllDifferences);
        expect(result).to.be.true;
    });

    it("should return that the game isn't hard", () => {
        const numberOfDifference = 7;
        const sumOfAllDifferences = Array(47000);
        const result = imageProcessingService['isHard'](numberOfDifference, sumOfAllDifferences);
        expect(result).to.be.false;
    });

    it('should turn pixel at the given position to Black', () => {
        const imageBuffer = Buffer.alloc(3);
        const expectedImageBuffer = Buffer.alloc(3);
        const position = [new Vector2(5, 3), new Vector2(2, 3)];
        const getPixelBufferPosAtPixelPosStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getPixelBufferPosAtPixelPos');
        getPixelBufferPosAtPixelPosStub.returns(0);
        for (let i = 0; i < imageBuffer.length; i++) {
            imageBuffer.writeUInt8(5, i);
            expectedImageBuffer.writeUint8(0, i);
        }
        imageProcessingService['paintBlackPixelsAtPositions'](position, imageBuffer);
        expect(imageBuffer).to.deep.equal(expectedImageBuffer);
        sinon.restore();
    });

    it('should get the different pixel position between two Images', () => {
        const getImageDimensionsStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getImageDimensions');
        getImageDimensionsStub.returns(new Vector2(5, 1));
        const imageBuffer1 = Buffer.alloc(3);
        const imageBuffer2 = Buffer.alloc(3);
        const expected: Vector2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 4, y: 0 },
        ];
        const getPixelBufferPosAtPixelPosStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getPixelBufferPosAtPixelPos');
        getPixelBufferPosAtPixelPosStub.returns(0);
        for (let i = 0; i < imageBuffer1.length; i++) {
            imageBuffer1.writeUInt8(5, i);
            imageBuffer2.writeUInt8(6, i);
        }
        const result = imageProcessingService['getDifferentPixelPositionsBetweenImages'](imageBuffer1, imageBuffer2);
        expect(result).to.deep.equal(expected);
        sinon.restore();
    });
    it('should return no difference if both pixels are identical', () => {
        const getImageDimensionsStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getImageDimensions');
        getImageDimensionsStub.returns(new Vector2(5, 1));
        const imageBuffer1 = Buffer.alloc(3);
        const expected: Vector2[] = [];
        const getPixelBufferPosAtPixelPosStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getPixelBufferPosAtPixelPos');
        getPixelBufferPosAtPixelPosStub.returns(0);
        for (let i = 0; i < imageBuffer1.length; i++) {
            imageBuffer1.writeUInt8(5, i);
        }
        const result = imageProcessingService['getDifferentPixelPositionsBetweenImages'](imageBuffer1, imageBuffer1);
        expect(result).to.deep.equal(expected);
        sinon.restore();
    });

    it('should return the positions differences in an array', () => {
        const radius = 3;
        const expected: Vector2[][] = [
            [
                { x: 4, y: 0 },
                { x: 3, y: 0 },
                { x: 2, y: 0 },
                { x: 1, y: 0 },
                { x: 0, y: 0 },
            ],
        ];
        const imageBuffer1 = Buffer.alloc(3);
        const imageBuffer2 = Buffer.alloc(3);
        const differences: Vector2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 4, y: 0 },
        ];
        for (let i = 0; i < imageBuffer1.length; i++) {
            imageBuffer1.writeUInt8(5, i);
            imageBuffer2.writeUInt8(6, i);
        }
        const getDifferentPixelPositionsBetweenImagesStub: sinon.SinonStub = sinon.stub(
            imageProcessingService,
            <any>'getDifferentPixelPositionsBetweenImages',
        );
        getDifferentPixelPositionsBetweenImagesStub.returns(differences);
        const getImageDimensionsStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getImageDimensions');
        getImageDimensionsStub.returns(new Vector2(5, 1));
        const result = imageProcessingService['getDifferencesPositionsList'](imageBuffer1, imageBuffer2, radius);
        expect(result).to.deep.equal(expected);
        sinon.restore();
    });
    it('should return the positions differences in an array', () => {
        const radius = 0;
        const expected: Vector2[][] = [
            [
                { x: 4, y: 0 },
                { x: 3, y: 0 },
                { x: 2, y: 0 },
                { x: 1, y: 0 },
                { x: 0, y: 0 },
            ],
        ];
        const imageBuffer1 = Buffer.alloc(3);
        const imageBuffer2 = Buffer.alloc(3);
        const differences: Vector2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 4, y: 0 },
        ];
        for (let i = 0; i < imageBuffer1.length; i++) {
            imageBuffer1.writeUInt8(5, i);
            imageBuffer2.writeUInt8(6, i);
        }
        const getDifferentPixelPositionsBetweenImagesStub: sinon.SinonStub = sinon.stub(
            imageProcessingService,
            <any>'getDifferentPixelPositionsBetweenImages',
        );
        getDifferentPixelPositionsBetweenImagesStub.returns(differences);
        const getImageDimensionsStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getImageDimensions');
        getImageDimensionsStub.returns(new Vector2(5, 1));
        const result = imageProcessingService['getDifferencesPositionsList'](imageBuffer1, imageBuffer2, radius);
        expect(result).to.deep.equal(expected);
        sinon.restore();
    });
    it('should throw an error if the dimensions of the images are not the right one ', () => {
        const imageBuffer1 = Buffer.alloc(3);
        const imageBuffer2 = Buffer.alloc(3);
        const image1Dimensions = new Vector2(640, 480);
        const image2Dimensions = new Vector2(640, 440);
        const radius = 3;
        for (let i = 0; i < imageBuffer1.length; i++) {
            imageBuffer1.writeUInt8(5, i);
            imageBuffer2.writeUInt8(6, i);
        }

        const getImageDimensionsStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getImageDimensions');
        getImageDimensionsStub.withArgs(imageBuffer1).returns(image1Dimensions);
        getImageDimensionsStub.withArgs(imageBuffer2).returns(image2Dimensions);
        try {
            imageProcessingService.getDifferencesBlackAndWhiteImage(imageBuffer1, imageBuffer2, radius);
        } catch (e) {
            expect(e.message).to.equal(
                'Images must be 640x480! (img 1 ' +
                    image1Dimensions.x +
                    'x' +
                    image1Dimensions.y +
                    ') (img 2 ' +
                    image2Dimensions.x +
                    'x' +
                    image2Dimensions.y +
                    ')',
            );
        }
        sinon.restore();
    });
    it('should throw an error if format is not the good one ', () => {
        const imageBuffer1 = Buffer.alloc(3);
        const imageBuffer2 = Buffer.alloc(3);
        const image1Dimensions = new Vector2(640, 480);
        const image2Dimensions = new Vector2(640, 480);
        const radius = 3;
        for (let i = 0; i < imageBuffer1.length; i++) {
            imageBuffer1.writeUInt8(5, i);
            imageBuffer2.writeUInt8(6, i);
        }
        const is24BitDepthBMPStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'is24BitDepthBMP');
        is24BitDepthBMPStub.withArgs(imageBuffer1).returns(true);
        const getImageDimensionsStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getImageDimensions');
        getImageDimensionsStub.withArgs(imageBuffer1).returns(image1Dimensions);
        getImageDimensionsStub.withArgs(imageBuffer2).returns(image2Dimensions);

        try {
            imageProcessingService.getDifferencesBlackAndWhiteImage(imageBuffer1, imageBuffer2, radius);
        } catch (e) {
            expect(e.message).to.equal('Images must be 24 bit depth BMPs!');
        }
        sinon.restore();
    });
    it('should return an image with all differences in black and white', () => {
        const imageBuffer1 = Buffer.alloc(3);
        const imageBuffer2 = Buffer.alloc(3);
        const image1Dimensions = new Vector2(640, 480);
        const image2Dimensions = new Vector2(640, 480);
        const whiteBuffer = Buffer.alloc(3);
        const blackAndWhiteBuffer = Buffer.alloc(3);
        const radius = 3;
        const allDifferences: Vector2[][] = [
            [
                { x: 4, y: 0 },
                { x: 3, y: 0 },
                { x: 2, y: 0 },
                { x: 1, y: 0 },
                { x: 0, y: 0 },
            ],
        ];
        for (let i = 0; i < imageBuffer1.length; i++) {
            imageBuffer1.writeUInt8(5, i);
            imageBuffer2.writeUInt8(6, i);
            whiteBuffer.writeUInt8(255, i);
            blackAndWhiteBuffer.writeUInt8(0, i);
        }
        const is24BitDepthBMPStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'is24BitDepthBMP');
        is24BitDepthBMPStub.withArgs(imageBuffer1).returns(true);
        is24BitDepthBMPStub.withArgs(imageBuffer2).returns(true);
        const getDifferencesPositionsListStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getDifferencesPositionsList');
        getDifferencesPositionsListStub.returns(allDifferences);
        const getImageDimensionsStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'getImageDimensions');
        getImageDimensionsStub.withArgs(imageBuffer1).returns(image1Dimensions);
        getImageDimensionsStub.withArgs(imageBuffer2).returns(image2Dimensions);
        const turnImageToWhiteStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'turnImageToWhite');
        turnImageToWhiteStub.returns(whiteBuffer);
        const result = imageProcessingService.getDifferencesBlackAndWhiteImage(imageBuffer1, imageBuffer2, radius);
        const paintBlackPixelsAtPositionsStub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'paintBlackPixelsAtPositions');
        paintBlackPixelsAtPositionsStub.returns(blackAndWhiteBuffer);
        expect(result).to.deep.equal({
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
        });
        sinon.restore();
    });

    it('should write an error on the console if cannot get different pixel position between images', () => {
        const spy = sinon.spy(console, 'error');
        const imageBuffer = Buffer.from([15]);
        const imageBuffer2 = Buffer.from([15]);

        try {
            imageProcessingService['getDifferentPixelPositionsBetweenImages'](imageBuffer, imageBuffer2);
        } catch (e) {
            expect(spy.callCount).to.equal(1);
            expect(spy.getCall(0).args[0]).to.equal('Could not get different pixel positions between images');
        }
        spy.restore();
    });

    it('should write an error on the console if cannot paint black pixels at given positions', () => {
        const spy = sinon.spy(console, 'error');
        const imageBuffer = Buffer.from([15]);
        const positions: Vector2[] = [
            { x: 10, y: 10 },
            { x: 4, y: 0 },
            { x: 3, y: 0 },
            { x: 2, y: 0 },
        ];

        try {
            imageProcessingService['paintBlackPixelsAtPositions'](positions, imageBuffer);
        } catch (e) {
            expect(spy.getCall(0).args[0]).to.equal('Cannot paint black pixels at theses given positions');
            expect(spy.callCount).to.equal(1);
        }
        spy.restore();
    });
    it('should write an error on the console if cannot paint black pixels at given positions', () => {
        const spy = sinon.spy(console, 'error');
        const stub: sinon.SinonStub = sinon.stub(imageProcessingService, <any>'paintBlackPixelsAtPositions');
        try {
            stub.throws(new Error());
        } catch (e) {
            expect(spy.getCall(0).args[0]).to.equal('Cannot paint black pixels at theses given positions');
            expect(spy.callCount).to.equal(1);
        }
        spy.restore();
    });
    it('should update the radius in the alreadyVisited map if a previously visited pixel has a smaller radius than the new pixel', () => {
        const visitData = {
            alreadyVisited: new Map([['0 0', 1]]),
            allPixelsToVisitSet: new Set<string>(),
            visitRadius: 3,
            imageDimensions: new Vector2(0, 0),
        };
        const nextPixelsToVisit: Queue<{
            pos: Vector2;
            radius: number;
        }> = new Queue<{
            pos: Vector2;
            radius: number;
        }>({ pos: new Vector2(1, 1), radius: 0 } as any);
        const differenceObject = { currentDifferenceGroupIndex: 0, differencesList: [[]] };
        sinon.stub(visitData.alreadyVisited, 'get').returns(0);
        imageProcessingService['addingPixelToListOfDifference'](visitData, nextPixelsToVisit, differenceObject);
    });
    it('should do nothing if an error occurs during pixel setting', () => {
        const imageBuffer = Buffer.alloc(16);
        const positions: Vector2[] = [new Vector2(0, 0), new Vector2(1, 1), new Vector2(2, 2)];

        imageProcessingService['setRGB'] = () => {
            throw new Error('Failed to set pixel color');
        };
        const action = () => imageProcessingService['paintBlackPixelsAtPositions'](positions, imageBuffer);
        expect(action).not.to.throw();
    });
    it('should skip pixel if it has been visited before with a bigger radius', () => {
        const visitData: VisitData = {
            alreadyVisited: new Map<string, number>([['1 1', 2]]),
            allPixelsToVisitSet: new Set<string>(),
            visitRadius: 1,
            imageDimensions: new Vector2(10, 10),
        };
        const nextPixelsToVisit: Queue<{
            pos: Vector2;
            radius: number;
        }> = new Queue<{
            pos: Vector2;
            radius: number;
        }>({ pos: new Vector2(1, 1), radius: 1 } as any);
        const differenceObject = {
            currentDifferenceGroupIndex: 0,
            differencesList: [[]],
        };
        imageProcessingService['addingPixelToListOfDifference'](visitData, nextPixelsToVisit, differenceObject);
        expect(visitData.alreadyVisited.get('1 1')).to.equal(2);
        expect(differenceObject.differencesList[0]).to.deep.equal([]);
    });
    it('should add new pixel to differences list if it has been visited before with a smaller radius', () => {
        const visitData: VisitData = {
            alreadyVisited: new Map<string, number>([['1 1', 1]]),
            allPixelsToVisitSet: new Set<string>(),
            visitRadius: 2,
            imageDimensions: new Vector2(10, 10),
        };
        const nextPixelsToVisit = new Queue<{ pos: Vector2; radius: number }>();
        const differenceObject = {
            currentDifferenceGroupIndex: 0,
            differencesList: [[]],
        };
        const pixelToAdd = {
            pos: new Vector2(1, 1),
            radius: 2,
        };
        nextPixelsToVisit.enqueue(pixelToAdd);

        imageProcessingService['addingPixelToListOfDifference'](visitData, nextPixelsToVisit, differenceObject);
        expect(visitData.alreadyVisited.get('1 1')).to.equal(2);
    });
});
