import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CreationResultModalComponent } from '@app/components/pop-ups/creation-result-modal/creation-result-modal.component';
import { GameOverPopUpComponent } from '@app/components/pop-ups/game-over-pop-up/game-over-pop-up.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { DrawingService } from '@app/services/drawing-service/drawing.service';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { Vector2 } from '@common/classes/vector2';
import { DifferenceImage } from '@common/interfaces/difference.image';
import { EntireGameUploadForm } from '@common/interfaces/entire.game.upload.form';
import { ImageUploadForm } from '@common/interfaces/image.upload.form';
import { ImageUploadResult } from '@common/interfaces/image.upload.result';
import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_ENLARGEMENT_RADIUS, PEN_WIDTH, ROUTE_TO_SENDING_IMAGE } from '@common/utils/constants';
import { Buffer } from 'buffer';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit, AfterViewInit {
    @ViewChild('originalImage') leftCanvas!: ElementRef;
    @ViewChild('modifiedImage') rightCanvas!: ElementRef;
    @ViewChild('input1') input1!: ElementRef;
    @ViewChild('input2') input2!: ElementRef;
    @ViewChild('resultModal') resultModal!: CreationResultModalComponent;
    @ViewChild('drawingCanvasOne') drawingCanvasOne!: ElementRef;
    @ViewChild('drawingCanvasTwo') drawingCanvasTwo!: ElementRef;
    @ViewChild('colorPicker') colorPicker!: ElementRef;
    @ViewChild('pen') pen!: ElementRef;
    @ViewChild('eraser') eraser!: ElementRef;
    @ViewChild('rectangle') rectangle!: ElementRef;
    @ViewChild('popUpElement') popUpElement: GameOverPopUpComponent;

    @ViewChild('combine') combine!: ElementRef;

    isEasy: boolean;
    enlargementRadius: number = DEFAULT_ENLARGEMENT_RADIUS;
    penWidth: number = PEN_WIDTH;
    totalDifferences = 0;

    private originalImage: File | null;
    private modifiedImage: File | null;
    private defaultImagePath: string = './assets/img/image_empty.bmp';
    private defaultImageFile: File;

    private formToSendAfterServerConfirmation: EntireGameUploadForm;

    constructor(
        private readonly communicationService: CommunicationService,
        private readonly imageManipulationService: ImageManipulationService,
        public drawingService: DrawingService,
    ) {}

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
            this.drawingService.redo();
        } else if (event.ctrlKey && event.key === 'z') {
            this.drawingService.undo();
        }
    }

    async ngOnInit() {
        await this.loadDefaultImages();
    }

    ngAfterViewInit() {
        this.drawingService.initialize(this.drawingCanvasOne, this.drawingCanvasTwo, [this.pen, this.eraser, this.rectangle]);
    }

    refreshSelectedColor() {
        this.drawingService.refreshSelectedColor(this.colorPicker.nativeElement.value);
    }

    submitRadius(radius: number) {
        this.enlargementRadius = radius;
    }

    async processImage(event: Event, isModified: boolean) {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement.files === null || inputElement.files.length === 0) return;
        const image: HTMLImageElement = new Image();
        const imageBuffer: ArrayBuffer = await inputElement.files[0].arrayBuffer();
        image.src = URL.createObjectURL(inputElement.files[0]);
        const canvas: HTMLCanvasElement = this.rightCanvas.nativeElement;
        const imageDimensions: Vector2 = this.imageManipulationService.getImageDimensions(Buffer.from(imageBuffer));

        image.onload = () => {
            if (!this.is24BitDepthBMP(imageBuffer)) {
                alert("L'image doit être en 24-bits");
                return;
            }

            if (imageDimensions.y !== CANVAS_HEIGHT || imageDimensions.x !== CANVAS_WIDTH) {
                alert('Taille invalide (' + image.width + 'x' + image.height + '), la taille doit être de : 640x480 pixels');
                return;
            }

            const context = this.getCanvasContext(isModified);
            context?.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

            if (inputElement.files) {
                if (isModified) {
                    this.modifiedImage = inputElement.files[0];
                } else {
                    this.originalImage = inputElement.files[0];
                }
            }
        };
    }

    resetBackgroundCanvas(rightImage: boolean) {
        const canvasSize: HTMLCanvasElement = this.rightCanvas.nativeElement;

        const context = this.getCanvasContext(rightImage);
        context?.clearRect(0, 0, canvasSize.width, canvasSize.height);

        if (rightImage) {
            this.input2.nativeElement.value = '';
        } else {
            this.input1.nativeElement.value = '';
        }
    }

    onQuitGame() {
        this.popUpElement.displayConfirmation();
    }

    async sendImageToServer(): Promise<void> {
        this.resultModal.resetBackgroundCanvas();
        this.resultModal.display();

        if (this.originalImage && this.modifiedImage) {
            const [buffer1, buffer2] = await Promise.all([this.originalImage.arrayBuffer(), this.modifiedImage.arrayBuffer()]);

            this.imageManipulationService.combineImages(Buffer.from(buffer1), this.drawingCanvasOne.nativeElement);
            this.imageManipulationService.combineImages(Buffer.from(buffer2), this.drawingCanvasTwo.nativeElement);

            // convert buffer to int array
            const byteArray1: number[] = Array.from(new Uint8Array(buffer1));
            const byteArray2: number[] = Array.from(new Uint8Array(buffer2));

            this.resultModal.updateImageDisplay(new ArrayBuffer(0));

            const firstImage: DifferenceImage = { background: byteArray1 };
            const secondImage: DifferenceImage = { background: byteArray2 };
            const radius = this.enlargementRadius;

            const imageUploadForm: ImageUploadForm = { firstImage, secondImage, radius };
            this.communicationService.post<ImageUploadForm>(imageUploadForm, ROUTE_TO_SENDING_IMAGE).subscribe({
                next: (response) => {
                    this.handleImageUploadResult(response, firstImage, secondImage);
                },
                error: (err: HttpErrorResponse) => {
                    window.alert(JSON.stringify(err));
                },
            });
        }
    }

    private handleImageUploadResult(response: HttpResponse<string>, firstImage: DifferenceImage, secondImage: DifferenceImage) {
        if (response.body) {
            const serverResult: ImageUploadResult = JSON.parse(response.body);
            this.resultModal.updateImageDisplay(this.convertToBuffer(serverResult.resultImageByteArray));
            this.formToSendAfterServerConfirmation = {
                differences: serverResult.differences,
                firstImage,
                secondImage,
                gameId: serverResult.generatedGameId,
                gameName: '',
                isEasy: serverResult.isEasy,
            };
            this.totalDifferences = serverResult.numberOfDifferences;
            this.isEasy = serverResult.isEasy;
            this.resultModal.showGameNameForm(this.totalDifferences, this.formToSendAfterServerConfirmation);
        }
    }

    private getCanvasContext(isModified: boolean) {
        const canvasToGet: HTMLCanvasElement = isModified ? this.rightCanvas.nativeElement : this.leftCanvas.nativeElement;
        return canvasToGet.getContext('2d');
    }

    private is24BitDepthBMP = (imageBuffer: ArrayBuffer): boolean => {
        const BITMAP_TYPE_OFFSET = 28;
        const BIT_COUNT_24 = 24;
        const dataView = new DataView(imageBuffer);
        return dataView.getUint16(BITMAP_TYPE_OFFSET, true) === BIT_COUNT_24;
    };

    private async loadDefaultImages() {
        if (!this.defaultImageFile)
            this.defaultImageFile = await this.createFileObjectFromFilePath(this.defaultImagePath, 'defaultImage.bmp', 'image/bmp');
        this.originalImage = this.defaultImageFile;
        this.modifiedImage = this.defaultImageFile;
    }

    private async createFileObjectFromFilePath(path: string, name: string, type: string): Promise<File> {
        const response = await fetch(path);
        const data = await response.blob();
        const metadata = {
            type,
        };
        return new File([data], name, metadata);
    }

    // Convert number[] to ArrayBuffer
    private convertToBuffer(byteArray: number[]): ArrayBuffer {
        const buffer = new ArrayBuffer(byteArray.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < byteArray.length; i++) {
            view[i] = byteArray[i];
        }
        return buffer;
    }
}
