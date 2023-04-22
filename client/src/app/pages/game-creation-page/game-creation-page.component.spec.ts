/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-lines */
// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// /* eslint-disable prettier/prettier */
// /* eslint-disable max-len */
// /* eslint-disable max-lines */
// /* eslint-disable no-underscore-dangle */
// /* eslint-disable @typescript-eslint/ban-types */
// /* eslint-disable max-lines */
// /* eslint-disable @typescript-eslint/no-magic-numbers */
// /* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { DrawingService } from '@app/services/drawing-service/drawing.service';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { Vector2 } from '@common/classes/vector2';
import { DifferenceImage } from '@common/interfaces/difference.image';
import { ImageUploadForm } from '@common/interfaces/image.upload.form';
import { of } from 'rxjs';
import { GameCreationPageComponent } from './game-creation-page.component';
describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let communicationService: jasmine.SpyObj<CommunicationService>;
    let imageManipulationService: ImageManipulationService;
    let leftCanvas: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
    let rightCanvas: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
    let drawingService: jasmine.SpyObj<DrawingService>;
    let onloadRef: Function | undefined;
    const originalOnload = Object.getPrototypeOf(Image).onload;
    // eslint-disable-next-line no-unused-vars

    const mockResponse: HttpResponse<string> = new HttpResponse({
        status: 200,
        body: 'mock response',
    });
    const routerMock = {
        navigate: jasmine.createSpy('navigate'),
    };
    const mockObservable = of(mockResponse);
    beforeEach(() => {
        communicationService = jasmine.createSpyObj('CommunicationService', ['get', 'post', 'delete']);
        communicationService.get.and.returnValue(mockObservable);
        imageManipulationService = new ImageManipulationService();
        drawingService = jasmine.createSpyObj('DrawingService', [
            'initialize',
            'undo',
            'redo',
            'swapForegrounds',
            'duplicateCanvas',
            'refreshSelectedColor',
            'setPenWidth',
            'deactivateTools',
            'selectTool',
            'resetForegroundCanvas',
        ]);
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
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCreationPageComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: convertToParamMap({ id: '123' }) },
                    },
                },
                { provide: ElementRef, useValue: leftCanvas },
                { provide: ElementRef, useValue: rightCanvas },
                { provide: Router, useValue: routerMock },
                { provide: ImageManipulationService, useValue: imageManipulationService },
                { provide: DrawingService, useValue: drawingService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        component.leftCanvas = jasmine.createSpyObj('ElementRef', [], { nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['getContext']) });
        component.rightCanvas = jasmine.createSpyObj('ElementRef', [], { nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['getContext']) });
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation']);
        component.resultModal = jasmine.createSpyObj('CreationResultModalComponent', ['updateImageDisplay', 'showGameNameForm', 'display']);
        component['originalImage'] = jasmine.createSpyObj('File', ['name', 'type', 'size', 'slice']);
        component['modifiedImage'] = jasmine.createSpyObj('File', ['name', 'type', 'size', 'slice']);
        component.isEasy = true;

        fixture.detectChanges();
    });

    afterAll(() => {
        Image.prototype.onload = originalOnload;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('handleKeyboardEvent should should call drawingService.redo()', () => {
        const event = new KeyboardEvent('keydown', {
            ctrlKey: true,
            shiftKey: true,
            key: 'Z',
        });
        document.dispatchEvent(event);

        expect(drawingService.redo).toHaveBeenCalled();
        expect(drawingService.undo).not.toHaveBeenCalled();
    });

    it('handleKeyboardEvent should should call drawingService.redo()', () => {
        const event = new KeyboardEvent('keydown', {
            ctrlKey: true,
            shiftKey: true,
            key: 'z',
        });
        document.dispatchEvent(event);
        expect(drawingService.undo).toHaveBeenCalled();
    });

    it('should sets enlargementRadius to the given radius', () => {
        component.submitRadius(5);
        expect(component.enlargementRadius).toEqual(5);
    });

    it('refreshSelectedColor should call from the service', () => {
        component.refreshSelectedColor();
        expect(drawingService.refreshSelectedColor).toHaveBeenCalled();
    });

    it('onQuitGame should call popup confirmation', () => {
        const popUpComponentSpy = jasmine.createSpyObj('GameOverPopUp', ['displayConfirmation']);
        component.popUpElement = popUpComponentSpy;
        component.onQuitGame();
        expect(popUpComponentSpy.displayConfirmation).toHaveBeenCalled();
    });

    it('should return a canvas context object if true', () => {
        const isModified = true;
        const canvasContext = component['getCanvasContext'](isModified);
        expect(canvasContext).toBeDefined();
        expect(canvasContext?.constructor.name).toEqual('CanvasRenderingContext2D');
    });

    it('should return a canvas context object if false', () => {
        const isModified = false;
        const canvasContext = component['getCanvasContext'](isModified);
        expect(canvasContext).toBeDefined();
        expect(canvasContext?.constructor.name).toEqual('CanvasRenderingContext2D');
    });

    it('should convert an array of numbers to an ArrayBuffer object', () => {
        const byteArray = [1, 2, 3, 4];
        const buffer = component['convertToBuffer'](byteArray);
        expect(buffer).toBeDefined();
        expect(buffer instanceof ArrayBuffer).toBeTrue();
        const view = new Uint8Array(buffer);
        expect(view.length).toEqual(byteArray.length);
        for (let i = 0; i < byteArray.length; i++) {
            expect(view[i]).toEqual(byteArray[i]);
        }
    });

    it('should return true for a 24-bit depth BMP image', () => {
        const bmpBuffer = new ArrayBuffer(54);
        const dataView = new DataView(bmpBuffer);
        dataView.setUint16(28, 24, true);
        const is24BitDepthBMP = component['is24BitDepthBMP'](bmpBuffer);
        expect(is24BitDepthBMP).toBeTrue();
    });

    it('should clear canvas context and reset input value', () => {
        const rightImage = true;
        const canvasSize = { width: 100, height: 100 } as HTMLCanvasElement;
        spyOn(component.rightCanvas, 'nativeElement').and.returnValue(canvasSize);
        spyOn<any>(component, 'getCanvasContext').and.returnValue({
            clearRect: jasmine.createSpy('clearRect'),
        });
        component.resetBackgroundCanvas(rightImage);
        expect(component['getCanvasContext']).toHaveBeenCalledWith(rightImage);
        expect(component.input2.nativeElement.value).toBe('');
    });

    it('resetBackgroundCanvas called with false', () => {
        const rightImage = false;
        const canvasSize = { width: 100, height: 100 } as HTMLCanvasElement;
        const context = component['getCanvasContext'](rightImage);
        spyOn(component.rightCanvas, 'nativeElement').and.returnValue(canvasSize);
        spyOn<any>(component, 'getCanvasContext').and.returnValue({
            clearRect: jasmine.createSpy('clearRect'),
        });
        component.resetBackgroundCanvas(rightImage);
        expect(component['getCanvasContext']).toHaveBeenCalledWith(rightImage);
        expect(component.input1.nativeElement.value).toBe('');
        expect(context).not.toBeUndefined();
    });

    it('processImage should create url object', async () => {
        const inputElement = document.createElement('input');
        const mockEvent = new Event('input');
        Object.defineProperty(mockEvent, 'target', { value: inputElement });
        const isModified = true;
        const urlSpy = spyOn(URL, 'createObjectURL');
        await component['processImage'](mockEvent, isModified);
        expect(urlSpy).not.toHaveBeenCalled();
    });

    it('handleImageUploadResult should send server result to form', () => {
        const modalSpy = jasmine.createSpyObj('CreationResultModalComponent', ['updateImageDisplay', 'showGameNameForm']);
        component.resultModal = modalSpy;
        const response = new HttpResponse({
            body: JSON.stringify({
                resultImageByteArray: [0, 1, 2, 3],
                differences: [],
                generatedGameId: '123',
                isEasy: true,
                numberOfDifferences: 0,
            }),
        });

        const diffOne: DifferenceImage = { background: [1] };
        const diffTwo: DifferenceImage = { background: [3] };

        spyOn<any>(component, 'convertToBuffer').and.returnValue(new ArrayBuffer(0));

        component['handleImageUploadResult'](response, diffOne, diffTwo);

        expect(component['formToSendAfterServerConfirmation']).toBeDefined();
        expect(component.totalDifferences).toBe(0);
        expect(component.isEasy).toBe(true);
        expect(component.resultModal.showGameNameForm).toHaveBeenCalledWith(0, component['formToSendAfterServerConfirmation']);
    });

    it('send an image to the server with hidden element ', async () => {
        const modalSpy = jasmine.createSpyObj('CreationResultModalComponent', [
            'display',
            'updateImageDisplay',
            'showGameNameForm',
            'resetBackgroundCanvas',
        ]);
        component.resultModal = modalSpy;
        const myArrayBuffer = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
        const myBlob = new Blob([myArrayBuffer]);
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component['originalImage'] = new File([myBlob], 'myFileTest');
        component['modifiedImage'] = new File([myBlob], 'myileTest');

        const buffer1 = await component['originalImage'].arrayBuffer();
        const buffer2 = await component['originalImage'].arrayBuffer();
        const byteArray1: number[] = Array.from(new Uint8Array(buffer1));
        const byteArray2: number[] = Array.from(new Uint8Array(buffer2));
        const image: ImageUploadForm = {
            firstImage: { background: byteArray1 },
            secondImage: { background: byteArray2 },
            radius: 3,
        };

        spyOn<any>(component, 'convertToBuffer').and.returnValue(myArrayBuffer);
        communicationService.post.and.returnValue(
            of({
                headers: new HttpHeaders(),
                status: 201,
                statusText: 'CREATED',
                url: '',
                body: JSON.stringify({ image }),
                type: 4,
                ok: true,
                clone: (): HttpResponse<string> => new HttpResponse<string>(undefined),
            }),
        );
        await component.sendImageToServer();
        expect(modalSpy).not.toBeUndefined();
    });

    it('should process the image to the server', async () => {
        const byteArray = [1, 2, 3, 4];
        const buffer = component['convertToBuffer'](byteArray);
        const imgData = new Uint8Array(buffer);

        const myBlob = new Blob([imgData]);
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        spyOn<any>(component, 'is24BitDepthBMP').and.returnValue(true);
        spyOn(window, 'alert');
        spyOn(imageManipulationService, 'getImageDimensions').and.returnValue(new Vector2(640, 480));
        const event: any = {
            target: {
                files: [myBlob],
                length: 1,
            },
        };
        spyOn(URL, 'createObjectURL').and.returnValue('client/src/assets/img/testImage.bmp');
        await component.processImage(event, false);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onloadRef!();
        expect(window.alert).not.toHaveBeenCalled();
    });

    it('should not process the image to the server with the wrong type of file', async () => {
        const byteArray = [1, 2, 3, 4];
        const buffer = component['convertToBuffer'](byteArray);
        const imgData = new Uint8Array(buffer);

        const myBlob = new Blob([imgData]);
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        spyOn<any>(component, 'is24BitDepthBMP').and.returnValue(false);
        spyOn(window, 'alert');
        spyOn(imageManipulationService, 'getImageDimensions').and.returnValue(new Vector2(640, 480));
        const event: any = {
            target: {
                files: [myBlob],
                length: 1,
            },
        };
        spyOn(URL, 'createObjectURL').and.returnValue('client/src/assets/img/testImage.bmp');
        const returnValue = await component.processImage(event, true);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onloadRef!();
        expect(returnValue).toEqual(undefined);
    });

    it('should not process the image to the server with the wrong size of file', async () => {
        const byteArray = [1, 2, 3, 4];
        const buffer = component['convertToBuffer'](byteArray);
        const imgData = new Uint8Array(buffer);

        const myBlob = new Blob([imgData]);
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        spyOn<any>(component, 'is24BitDepthBMP').and.returnValue(true);
        spyOn(window, 'alert');
        spyOn(imageManipulationService, 'getImageDimensions').and.returnValue(new Vector2(240, 580));
        const event: any = {
            target: {
                files: [myBlob],
                length: 1,
            },
        };
        spyOn(URL, 'createObjectURL').and.returnValue('client/src/assets/img/testImage.bmp');
        const returnValue = await component.processImage(event, true);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onloadRef!();
        expect(returnValue).toEqual(undefined);
    });

    it('should not draw the Image if the context is null in the processImage function', async () => {
        const byteArray = [1, 2, 3, 4];
        const buffer = component['convertToBuffer'](byteArray);
        const imgData = new Uint8Array(buffer);
        const myBlob = new Blob([imgData]);
        spyOn<any>(component, 'is24BitDepthBMP').and.returnValue(true);
        spyOn(window, 'alert');
        spyOn(imageManipulationService, 'getImageDimensions').and.returnValue(new Vector2(640, 480));
        const event: any = {
            target: {
                files: [myBlob],
                length: 1,
            },
        };
        spyOn(URL, 'createObjectURL').and.returnValue('client/src/assets/img/testImage.bmp');
        const returnValue = await component.processImage(event, true);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        onloadRef!();
        expect(returnValue).toEqual(undefined);
    });
});
