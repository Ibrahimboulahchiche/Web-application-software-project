import { ElementRef, Injectable, ViewChild } from '@angular/core';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { GameData } from '@common/interfaces/game.data';
import { Buffer } from 'buffer';
@Injectable({
    providedIn: 'root',
})
export class CanvasHandlingService {
    @ViewChild('cheatElement') cheat: ElementRef | undefined;
    backgroundColor: string;
    blinkDelayedMethodLeft: DelayedMethod;
    blinkDelayedMethodRight: DelayedMethod;
    isCheating: boolean = false;
    foundDifferences: boolean[];
    currentGameId: string | null;
    originalImage: Buffer;
    modifiedImage: Buffer;
    currentModifiedImage: Buffer;
    constructor(
        private leftCanvas: ElementRef<HTMLCanvasElement>,
        private rightCanvas: ElementRef<HTMLCanvasElement>,
        private imageManipulationService: ImageManipulationService,
    ) {}

    get leftCanvasContext() {
        return this.leftCanvas.nativeElement.getContext('2d');
    }

    get rightCanvasContext() {
        return this.rightCanvas.nativeElement.getContext('2d');
    }

    async updateCanvas(originalImage: Buffer, modifiedImage: Buffer) {
        const img1Source = this.imageManipulationService.getImageSourceFromBuffer(originalImage);
        const img2Source = this.imageManipulationService.getImageSourceFromBuffer(modifiedImage);
        await this.loadImagesToCanvas(img1Source, img2Source);
        this.originalImage = originalImage;
        this.modifiedImage = modifiedImage;
    }

    async loadImagesToCanvas(imgSource1: string, imgSource2: string) {
        const leftCanvasContext = this.leftCanvasContext;
        const rightCanvasContext = this.rightCanvasContext;
        if (leftCanvasContext && rightCanvasContext) {
            this.imageManipulationService.loadCanvasImages(imgSource1, leftCanvasContext);
            this.imageManipulationService.loadCanvasImages(imgSource2, rightCanvasContext);
        }
    }

    async refreshModifiedImage(gameData: GameData, foundDifferences: boolean[]) {
        const newImage = this.imageManipulationService.getModifiedImageWithoutDifferences(
            gameData,
            { originalImage: this.originalImage, modifiedImage: this.modifiedImage },
            foundDifferences,
        );

        if (this.rightCanvasContext) {
            await this.imageManipulationService.blinkDifference(
                this.currentModifiedImage ? this.currentModifiedImage : this.modifiedImage,
                newImage,
                this.rightCanvasContext,
            );
            this.currentModifiedImage = newImage;
        }
    }

    focusKeyEvent(cheat: ElementRef | undefined) {
        if (cheat) {
            cheat.nativeElement.focus();
        }
    }

    initializeCheatMode(gameData: GameData, images: { originalImage: Buffer; modifiedImage: Buffer }, foundDifferences: boolean[]) {
        this.backgroundColor = '#66FF99';
        const newImage = this.imageManipulationService.getModifiedImageWithoutDifferences(gameData, images, foundDifferences);
        this.originalImage = images.originalImage;
        this.blinkDelayedMethodLeft = this.startDelayedMethod(
            { originalImage: images.originalImage, newImage },
            this.leftCanvasContext as CanvasRenderingContext2D,
        );
        this.blinkDelayedMethodRight = this.startDelayedMethod(
            { originalImage: images.originalImage, newImage },
            this.rightCanvasContext as CanvasRenderingContext2D,
        );
        if (this.currentGameId !== '-1') {
            this.currentModifiedImage = newImage;
        }

        if (this.blinkDelayedMethodLeft) this.blinkDelayedMethodLeft.start();
        if (this.blinkDelayedMethodRight) this.blinkDelayedMethodRight.start();
        this.isCheating = true;
    }

    putCanvasIntoInitialState(
        images: { originalImage: Buffer; currentModifiedImage: Buffer },
        canvas: { leftContext: CanvasRenderingContext2D; rightContext: CanvasRenderingContext2D },
    ) {
        if (images.currentModifiedImage && images.originalImage) {
            this.imageManipulationService.loadCurrentImage(images.currentModifiedImage, canvas.rightContext as CanvasRenderingContext2D);
            this.imageManipulationService.loadCurrentImage(images.originalImage, canvas.leftContext as CanvasRenderingContext2D);
        }
    }

    stopCheating() {
        this.backgroundColor = '';
        if (this.blinkDelayedMethodLeft) this.blinkDelayedMethodLeft.stop();
        if (this.blinkDelayedMethodRight) this.blinkDelayedMethodRight.stop();
        this.isCheating = false;
        this.putCanvasIntoInitialState(
            { originalImage: this.originalImage, currentModifiedImage: this.currentModifiedImage },
            { leftContext: this.leftCanvasContext as CanvasRenderingContext2D, rightContext: this.rightCanvasContext as CanvasRenderingContext2D },
        );
    }

    startDelayedMethod(images: { originalImage: Buffer; newImage: Buffer }, leftContext: CanvasRenderingContext2D) {
        return this.imageManipulationService.alternateOldNewImage(images.originalImage, images.newImage, leftContext as CanvasRenderingContext2D);
    }
}
