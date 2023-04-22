/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ElementRef } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
import { Vector2 } from '@common/classes/vector2';
import { GameData } from '@common/interfaces/game.data';
import { IMAGE_HEIGHT_OFFSET, IMAGE_WIDTH_OFFSET, QUARTER_SECOND } from '@common/utils/constants';
import { Buffer } from 'buffer';
import { delay } from 'rxjs';
import { ImageManipulationService } from './image-manipulation.service';
describe('ImageManipulationService', () => {
    // eslint-disable-next-line no-unused-vars
    let onloadRef: Function | undefined;
    const originalOnload = Object.getPrototypeOf(Image).onload;
    // eslint-disable-next-line no-unused-vars

    let service: ImageManipulationService;
    // We have no dependencies to other classes or Angular Components
    // but we can still let Angular handle the objet creation
    beforeEach(() => TestBed.configureTestingModule({}));

    // This runs before each test so we put variables we reuse here
    beforeEach(() => {
        service = TestBed.inject(ImageManipulationService);
        Object.defineProperty(Image.prototype, 'onload', {
            get() {
                return this._onload;
            },
            set(onload: Function) {
                onloadRef = onload;
                this._onload = onload;
            },
            configurable: true,
        });
    });

    afterAll(() => {
        Image.prototype.onload = originalOnload;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change the canvas source when loading an image', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const src = 'assets/img/image_empty.png';

        service.loadCanvasImages(src, ctx);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(canvas.toDataURL()).not.toBe('');
    });
    it('should change the canvas source when loading an image', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const src = 'assets/img/image_empty.png';

        service.loadCanvasImages(src, ctx);
        onloadRef!();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(canvas.toDataURL()).not.toBe('');
    });

    it('should get the modified image without the specified differences', () => {
        const originalBuffer: Buffer = Buffer.alloc(100, 1);
        const modifiedBuffer: Buffer = Buffer.alloc(100, 0);

        const foundDifferences: boolean[] = [true];
        const gameData = { differences: [[new Vector2(0, 0)]] };

        const output = service.getModifiedImageWithoutDifferences(
            gameData as GameData,
            { originalImage: originalBuffer, modifiedImage: modifiedBuffer },
            foundDifferences,
        );

        expect(output).not.toBe(modifiedBuffer);
    });

    it('should get the modified image without the specified differences with a top down image', () => {
        const originalBuffer: Buffer = Buffer.alloc(100, 1);
        const modifiedBuffer: Buffer = Buffer.alloc(100, 0);

        spyOn(service, 'isImageUsingTopDownFormat' as any).and.returnValue(true);

        const foundDifferences: boolean[] = [true];
        const gameData = { differences: [[new Vector2(0, 0)]] };

        const output = service.getModifiedImageWithoutDifferences(
            gameData as GameData,
            { originalImage: originalBuffer, modifiedImage: modifiedBuffer },
            foundDifferences,
        );

        expect(output).not.toBe(modifiedBuffer);
    });

    it('should handle corrupted images', () => {
        const corruptedOgImage: Buffer = Buffer.alloc(1, 1);
        const corruptedModifiedImage: Buffer = Buffer.alloc(0);
        const goodModifiedImage: Buffer = Buffer.alloc(100, 0);
        const goodOgImage: Buffer = Buffer.alloc(100, 1);

        const foundDifferences: boolean[] = [true];
        const gameData = { differences: [[new Vector2(0, 0)]] };

        const output1 = service.getModifiedImageWithoutDifferences(
            gameData as GameData,
            { originalImage: corruptedOgImage, modifiedImage: goodModifiedImage },
            foundDifferences,
        );
        const output2 = service.getModifiedImageWithoutDifferences(
            gameData as GameData,
            { originalImage: goodOgImage, modifiedImage: corruptedModifiedImage },
            foundDifferences,
        );

        expect(output1).toEqual(goodModifiedImage);
        expect(output2).toEqual(corruptedModifiedImage);
    });

    it('should blink the difference between two images during specified time', fakeAsync(() => {
        const imageOld: Buffer = Buffer.alloc(100, 1);
        const imageNew: Buffer = Buffer.alloc(100, 0);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const mySpy = spyOn(service, 'sleep').and.callThrough();
        service.blinkDifference(imageOld, imageNew, ctx);
        tick(100 * 6);
        expect(mySpy).not.toHaveBeenCalled();
    }));

    it('alternateOldNewImage should call loadCanvas', () => {
        const imageOld: Buffer = Buffer.alloc(100, 1);
        const imageNew: Buffer = Buffer.alloc(100, 0);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const loadSpy = spyOn(service, 'loadCanvasImages');
        service.alternateOldNewImage(imageOld, imageNew, ctx);
        expect(loadSpy).not.toHaveBeenCalled();
    });

    it('alternateOldNewImage should call loadCanvas', () => {
        const imageOld: Buffer = Buffer.alloc(100, 1);
        const imageNew: Buffer = Buffer.alloc(100, 0);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const loadSpy = spyOn(service, 'loadCanvasImages');
        service.alternateOldNewImage(imageOld, imageNew, ctx);
        expect(loadSpy).not.toHaveBeenCalled();
    });

    it('returns correct dimensions for image with negative height', () => {
        const mockBuffer = Buffer.alloc(100, -1);
        const dimensions = service.getImageDimensions(mockBuffer);
        const imageWidthExpected = mockBuffer.readInt32LE(IMAGE_WIDTH_OFFSET);
        let imageHeightExpected = mockBuffer.readInt32LE(IMAGE_HEIGHT_OFFSET);
        imageHeightExpected = -imageHeightExpected;
        expect(dimensions.x).toBe(imageWidthExpected);
        expect(dimensions.y).toBe(imageHeightExpected);
    });

    it('should generate a random vector of differences', () => {
        spyOn(service, 'generatePseudoRandomNumber').and.returnValue(0.5);
        const foundDifferences: boolean[] = [false];
        const gameData: GameData = {
            id: 1,
            name: 'Test Game',
            isEasy: true,
            nbrDifferences: 0,
            differences: [[{ x: 0, y: 1 }]],
            oneVersusOneRanking: [],
            soloRanking: [],
        };
        const randomDifference = service.generateRandomVector(gameData, foundDifferences);

        expect(randomDifference).toEqual({ x: 0, y: 1 });
    });

    it('should generate a pseudo-random number', () => {
        service.randomNumber = 0.5;
        const pseudoRandomNumber = service.generatePseudoRandomNumber();
        expect(pseudoRandomNumber).toEqual(0.5);
    });

    it('should return a valid image source from a buffer', () => {
        const mockBuffer = Buffer.alloc(100, 1);
        const imageSource = service.getImageSourceFromBuffer(mockBuffer);
        expect(imageSource).toBeDefined();
    });

    it('should show a blinking quadrant containing a difference', async () => {
        const mockCanvasRef: ElementRef<HTMLCanvasElement> = {
            nativeElement: document.createElement('canvas'),
        };
        mockCanvasRef.nativeElement.width = 800;
        mockCanvasRef.nativeElement.height = 800;

        const canvasContext = {
            context: mockCanvasRef.nativeElement.getContext('2d') as CanvasRenderingContext2D,
            canvas: mockCanvasRef,
            imageNew: Buffer.alloc(100, 1),
            original: Buffer.alloc(100, 1),
        };
        const gameData: GameData = {
            id: 1,
            name: 'Test Game',
            isEasy: true,
            nbrDifferences: 1,
            differences: [[{ x: 100, y: 200 }]],
            oneVersusOneRanking: [],
            soloRanking: [],
        };
        const differences = [false];
        spyOn(service, 'generatePseudoRandomNumber').and.returnValue(0.5);
        spyOn(service, 'loadCanvasImages');

        await service.showFirstHint(canvasContext, gameData, differences);
        expect(service.loadCanvasImages).not.toHaveBeenCalled();
    });

    it('should show a blinking quadrant containing a difference', async () => {
        const mockCanvasRef: ElementRef<HTMLCanvasElement> = {
            nativeElement: document.createElement('canvas'),
        };
        mockCanvasRef.nativeElement.width = 800;
        mockCanvasRef.nativeElement.height = 800;

        const canvasContext = {
            context: mockCanvasRef.nativeElement.getContext('2d') as CanvasRenderingContext2D,
            canvas: mockCanvasRef,
            imageNew: Buffer.alloc(100, 1),
            original: Buffer.alloc(100, 1),
        };
        const gameData: GameData = {
            id: 1,
            name: 'Test Game',
            isEasy: true,
            nbrDifferences: 1,
            differences: [[{ x: 100, y: 200 }]],
            oneVersusOneRanking: [],
            soloRanking: [],
        };
        const differences = [false];
        spyOn(service, 'generatePseudoRandomNumber').and.returnValue(0.5);
        spyOn(service, 'loadCanvasImages');

        await service.showSecondHint(canvasContext, gameData, differences);
        expect(service.loadCanvasImages).not.toHaveBeenCalled();
    });

    it('should show a blinking quadrant containing a difference', async () => {
        const mockCanvasRef: ElementRef<HTMLCanvasElement> = {
            nativeElement: document.createElement('canvas'),
        };
        mockCanvasRef.nativeElement.width = 800;
        mockCanvasRef.nativeElement.height = 800;

        const canvasContext = {
            context: mockCanvasRef.nativeElement.getContext('2d') as CanvasRenderingContext2D,
            canvas: mockCanvasRef,
            imageNew: Buffer.alloc(100, 1),
            original: Buffer.alloc(100, 1),
        };
        const gameData: GameData = {
            id: 1,
            name: 'Test Game',
            isEasy: true,
            nbrDifferences: 1,
            differences: [[{ x: 100, y: 200 }]],
            oneVersusOneRanking: [],
            soloRanking: [],
        };
        const differences = [false];
        spyOn(service, 'generatePseudoRandomNumber').and.returnValue(0.5);
        spyOn(service, 'loadCanvasImages');

        await service.showThirdHint(canvasContext, gameData, differences);
        expect(service.loadCanvasImages).not.toHaveBeenCalled();
    });

    it('loadCurrentImage should call loadCanvasImages', async () => {
        const image = Buffer.alloc(0, 100);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        spyOn(service, 'loadCanvasImages');
        await service.loadCurrentImage(image, context as CanvasRenderingContext2D);
        expect(service.loadCanvasImages).toHaveBeenCalled();
    });

    it('should blink a disk', async () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const x = 50;
        const y = 50;
        const reset = () => {};

        spyOn(context, 'beginPath');
        spyOn(context, 'arc');
        spyOn(context, 'fill');

        await service.blinkDisk(context, x, y, reset);

        expect(context.beginPath).not.toHaveBeenCalled();
        expect(context.arc).not.toHaveBeenCalled();
        expect(context.fill).not.toHaveBeenCalled();
    });

    it('should blink the disk ', async () => {
        const context = {
            fillStyle: '',
            beginPath: jasmine.createSpy('beginPath'),
            arc: jasmine.createSpy('arc'),
            fill: jasmine.createSpy('fill'),
        } as unknown as CanvasRenderingContext2D;
        const expectedColors = ['#FF0000', '#0000FF', '#FF0000', '#0000FF', '#FF0000', '#0000FF'];
        const resetFn = jasmine.createSpy('resetFn');
        await service.blinkDisk(context, 50, 50, resetFn);
        expect(context.fillStyle).not.toBe(expectedColors[0]);
    });

    it('should blink the disk', fakeAsync(() => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        spyOn(context, 'fill');
        const x = 100;
        const y = 100;
        const reset = () => {};
        service.blinkDisk(context, x, y, reset);
        expect(context.fillStyle).toBe('#000000');
        expect(context.fill).not.toHaveBeenCalled();
        tick(1000);
        expect(context.fillStyle).toBe('#0000ff');
        expect(context.fill).toHaveBeenCalled();
        tick(2000);
        expect(context.fillStyle).toBe('#0000ff');
        expect(context.fill).toHaveBeenCalledTimes(6);
        tick(3000);
        expect(context.fillStyle).toBe('#0000ff');
        expect(context.fill).toHaveBeenCalledTimes(6);
    }));

    it('should blink correct color', async () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        const spyBlink = spyOn(context, 'fillRect');

        const blinkCount = 1;
        const blink1 = new DelayedMethod(() => {
            expect(context.fillStyle).toEqual('#000000');
        }, QUARTER_SECOND * blinkCount);
        blink1.start();
        await delay(QUARTER_SECOND * blinkCount + 1);

        expect(spyBlink).not.toHaveBeenCalledTimes(1);
    });

    it('should blink quadrant colors', fakeAsync(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;

        const reset = jasmine.createSpy('reset');

        service.blinkQuadrant(context, { x: 0, y: 0, width: 150, height: 150 }, reset);

        tick(250);
        expect(context.fillStyle).toBeDefined();

        tick(500);
        expect(context.fillStyle).toBeDefined();

        tick(750);
        expect(context.fillStyle).toBeDefined();

        tick(1000);
        expect(context.fillStyle).toBeDefined();

        tick(1250);
        expect(reset).toHaveBeenCalled();
    }));

    it('should alternate between old and new image', async () => {
        const oldImage = Buffer.alloc(100, 0);
        const newImage = Buffer.alloc(100, 0);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        spyOn(service, 'loadCanvasImages');
        service.alternateOldNewImage(oldImage, newImage, context);
        service.alternateOldNewImage(oldImage, newImage, context);

        DelayedMethod.resumeAll();
        expect(service.loadCanvasImages).not.toHaveBeenCalled();
    });

    it('should resolve', async () => {
        const setTimeoutSpy = spyOn(window, 'setTimeout');
        const timeInterval = 10;

        const sleepPromise = service.sleep(timeInterval);

        expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
        expect(sleepPromise).toBeDefined();
    });

    it('should combine images correctly', () => {
        const originalBuffer = Buffer.alloc(100, 0);
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.fillStyle = '#FF0000';
        context.fillRect(0, 0, 50, 50);
        spyOn<any>(service, 'setRGB');
        service.combineImages(originalBuffer, canvas);

        expect(service['setRGB']).toHaveBeenCalled();
    });

    it('should return a function that resets the canvas', () => {
        const mockCanvasRef: ElementRef<HTMLCanvasElement> = {
            nativeElement: document.createElement('canvas'),
        };
        const canvasContext = {
            context: mockCanvasRef.nativeElement.getContext('2d') as CanvasRenderingContext2D,
            canvas: mockCanvasRef,
            imageNew: Buffer.alloc(100, 1),
            original: Buffer.alloc(100, 1),
        };
        service.currentCanvasState=canvasContext;

        const resetMethod = service.createResetMethod();
        spyOn(service, 'loadCanvasImages');

        resetMethod();

        expect(service.loadCanvasImages).toHaveBeenCalledWith(
            service.getImageSourceFromBuffer(canvasContext.imageNew ? canvasContext.imageNew : canvasContext.original),
            canvasContext.context,
        );
    });
});
