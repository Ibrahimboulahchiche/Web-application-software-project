import { ElementRef, Injectable } from '@angular/core';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
import { Action } from '@common/classes/action';
import { Pixel } from '@common/classes/pixel';
import { Vector2 } from '@common/classes/vector2';
import { GameData } from '@common/interfaces/game.data';
import {
    BLINK_TIME,
    BMP_FILE_HEADER_BYTES_LENGTH,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    IMAGE_HEIGHT_OFFSET,
    IMAGE_WIDTH_OFFSET,
    NOT_FOUND,
    NUMBER_OF_BLINKS,
    PIXEL_BYTES_LENGTH,
    QUARTER,
    QUARTER_SECOND,
} from '@common/utils/constants';
import { Buffer } from 'buffer';

@Injectable({
    providedIn: 'root',
})
export class ImageManipulationService {
    randomNumber: number = NOT_FOUND;

    currentCanvasState: {
        context: CanvasRenderingContext2D;
        canvas: ElementRef<HTMLCanvasElement>;
        imageNew: Buffer;
        original: Buffer;
    };

    // can be used on a canvas from a buffer
    getImageSourceFromBuffer(buffer: Buffer): string {
        return `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
    }
    getImageDimensions = (imageBuffer: Buffer): Vector2 => {
        const imageWidth = imageBuffer.readInt32LE(IMAGE_WIDTH_OFFSET);
        let imageHeight = imageBuffer.readInt32LE(IMAGE_HEIGHT_OFFSET);

        imageHeight = imageHeight < 0 ? -imageHeight : imageHeight;

        return new Vector2(imageWidth, imageHeight);
    };
    getModifiedImageWithoutDifferences(
        gameData: GameData,
        images: { originalImage: Buffer; modifiedImage: Buffer },
        foundDifferences: boolean[],
    ): Buffer {
        const modifiedImageBuffer = Buffer.from(images.modifiedImage);
        const originalImageBuffer = Buffer.from(images.originalImage);

        for (let i = 0; i < foundDifferences.length; i++) {
            if (foundDifferences[i]) {
                // if the difference was found, we need to remove it
                const positionInDifference = gameData.differences[i];
                for (const pos of positionInDifference) {
                    const pixelFromTheOriginalImage = this.getRGB(pos, originalImageBuffer);
                    if (pixelFromTheOriginalImage) {
                        this.setRGB(pos, modifiedImageBuffer, pixelFromTheOriginalImage);
                    }
                }
            }
        }
        return modifiedImageBuffer;
    }
    generateRandomVector(game: GameData, foundDifferences: boolean[]) {
        const unfoundDifferences = game.differences.filter((difference, index) => !foundDifferences[index]);
        const randomDifference = unfoundDifferences[Math.floor(this.generatePseudoRandomNumber() * unfoundDifferences.length)];
        return randomDifference[Math.floor(this.generatePseudoRandomNumber() * randomDifference.length)];
    }
    async showFirstHint(
        canvasContext: { context: CanvasRenderingContext2D; canvas: ElementRef<HTMLCanvasElement>; imageNew: Buffer; original: Buffer },
        game: GameData,
        differences: boolean[],
    ) {
        const width = canvasContext.canvas.nativeElement.width;
        const height = canvasContext.canvas.nativeElement.height;
        const quarterWidth = width / 2;
        const quarterHeight = height / 2;
        const quadrants = [
            { x: 0, y: 0, width: quarterWidth, height: quarterHeight },
            { x: quarterWidth, y: 0, width: quarterWidth, height: quarterHeight },
            { x: 0, y: quarterHeight, width: quarterWidth, height: quarterHeight },
            { x: quarterWidth, y: quarterHeight, width: quarterWidth, height: quarterHeight },
        ];
        const randomVector = this.generateRandomVector(game, differences);
        const quadrantsThatContainTheRandomVector: { x: number; y: number; width: number; height: number }[] = [];
        for (const quadrant of quadrants) {
            if (
                randomVector.x >= quadrant.x &&
                randomVector.x < quadrant.x + quadrant.width &&
                height - randomVector.y >= quadrant.y &&
                height - randomVector.y < quadrant.y + quadrant.height
            ) {
                quadrantsThatContainTheRandomVector.push(quadrant);
            }
        }
        const randomRect =
            quadrantsThatContainTheRandomVector[Math.floor(this.generatePseudoRandomNumber() * quadrantsThatContainTheRandomVector.length)];

        this.currentCanvasState = canvasContext;
        const resetMethod = this.createResetMethod();

        await this.blinkQuadrant(canvasContext.context, randomRect, resetMethod);
    }
    async showSecondHint(
        canvasContext: { context: CanvasRenderingContext2D; canvas: ElementRef<HTMLCanvasElement>; imageNew: Buffer; original: Buffer },
        game: GameData,
        differences: boolean[],
    ) {
        const width = canvasContext.canvas.nativeElement.width;
        const height = canvasContext.canvas.nativeElement.height;
        const quarterWidth = width / QUARTER;
        const quarterHeight = height / QUARTER;
        const subQuadrants = [];
        for (let i = 0; i < QUARTER; i++) {
            for (let j = 0; j < QUARTER; j++) {
                const quadrant = {
                    x: i * quarterWidth,
                    y: j * quarterHeight,
                    width: quarterWidth,
                    height: quarterHeight,
                };
                subQuadrants.push(quadrant);
            }
        }
        const randomVector = this.generateRandomVector(game, differences);
        const quadrantsThatContainTheRandomVector: { x: number; y: number; width: number; height: number }[] = [];
        for (const quadrant of subQuadrants) {
            if (
                randomVector.x >= quadrant.x &&
                randomVector.x < quadrant.x + quadrant.width &&
                height - randomVector.y >= quadrant.y &&
                height - randomVector.y < quadrant.y + quadrant.height
            ) {
                quadrantsThatContainTheRandomVector.push(quadrant);
            }
        }
        const randomRect =
            quadrantsThatContainTheRandomVector[Math.floor(this.generatePseudoRandomNumber() * quadrantsThatContainTheRandomVector.length)];

        this.currentCanvasState = canvasContext;
        const resetMethod = this.createResetMethod();
        await this.blinkQuadrant(canvasContext.context, randomRect, resetMethod);
    }
    async showThirdHint(
        canvasState: { context: CanvasRenderingContext2D; canvas: ElementRef<HTMLCanvasElement>; imageNew: Buffer; original: Buffer },
        game: GameData,
        differences: boolean[],
    ): Promise<void> {
        const height = canvasState.canvas.nativeElement.height;
        const randomVector = this.generateRandomVector(game, differences);

        this.currentCanvasState = canvasState;
        const resetMethod = this.createResetMethod();
        await this.blinkDisk(canvasState.context, randomVector.x, height - randomVector.y, resetMethod);
    }
    createResetMethod(): () => void {
        return () => {
            const canvasState = this.currentCanvasState;
            const imageSource = this.getImageSourceFromBuffer(canvasState.imageNew ? canvasState.imageNew : canvasState.original);
            this.loadCanvasImages(imageSource, canvasState.context);
        };
    }

    // eslint-disable-next-line max-params
    async blinkDisk(context: CanvasRenderingContext2D, x: number, y: number, reset: () => void) {
        const radius = 70;
        const startAngle = 0;
        const endAngle = Math.PI * 2;
        const anticlockwise = false;

        const wholeBlink = new Action<void>();
        let blinkCount = 0;
        for (let i = 0; i < NUMBER_OF_BLINKS; i++) {
            blinkCount++;
            const blink1 = new DelayedMethod(() => {
                context.fillStyle = '#FF0000';
                context.beginPath();
                context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
                context.fill();
            }, QUARTER_SECOND * blinkCount);
            blinkCount++;
            const blink2 = new DelayedMethod(() => {
                context.fillStyle = '#0000FF';
                context.beginPath();
                context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
                context.fill();
            }, QUARTER_SECOND * blinkCount);
            wholeBlink.add(async () => blink1.start());
            wholeBlink.add(async () => blink2.start());
        }
        const resetDelayedMethod = new DelayedMethod(reset, QUARTER_SECOND * (blinkCount + 1));
        wholeBlink.add(async () => resetDelayedMethod.start());
        wholeBlink.invoke();
    }
    async blinkQuadrant(context: CanvasRenderingContext2D, rect: { x: number; y: number; width: number; height: number }, reset: () => void) {
        const wholeBlink = new Action<void>();
        let blinkCount = 0;
        for (let i = 0; i < NUMBER_OF_BLINKS; i++) {
            blinkCount++;
            const blink1 = new DelayedMethod(() => {
                context.fillStyle = '#FF0000';
                context.fillRect(rect.x as number, rect.y as number, rect.width as number, rect.height as number);
            }, QUARTER_SECOND * blinkCount);
            blinkCount++;
            const blink2 = new DelayedMethod(() => {
                context.fillStyle = '#0000FF';
                context.fillRect(rect.x as number, rect.y as number, rect.width as number, rect.height as number);
            }, QUARTER_SECOND * blinkCount);
            wholeBlink.add(async () => blink1.start());
            wholeBlink.add(async () => blink2.start());
        }
        const resetDelayedMethod = new DelayedMethod(reset, QUARTER_SECOND * (blinkCount + 1));
        wholeBlink.add(async () => resetDelayedMethod.start());
        wholeBlink.invoke();
    }
    generatePseudoRandomNumber() {
        return this.randomNumber;
    }
    async blinkDifference(imageOld: Buffer, imageNew: Buffer, context: CanvasRenderingContext2D) {
        this.loadCanvasImages(this.getImageSourceFromBuffer(imageNew), context);
        const wholeBlink = new Action<void>();
        let blinkCount = 0;
        for (let i = 0; i < NUMBER_OF_BLINKS; i++) {
            blinkCount++;
            const blink1 = new DelayedMethod(() => {
                this.loadCanvasImages(this.getImageSourceFromBuffer(imageOld), context);
            }, BLINK_TIME * blinkCount);
            blinkCount++;
            const blink2 = new DelayedMethod(() => {
                this.loadCanvasImages(this.getImageSourceFromBuffer(imageNew), context);
            }, BLINK_TIME * blinkCount);
            wholeBlink.add(async () => blink1.start());
            wholeBlink.add(async () => blink2.start());
        }

        wholeBlink.invoke();
    }
    alternateOldNewImage(oldImage: Buffer, newImage: Buffer, context: CanvasRenderingContext2D) {
        let showOldImage = false;
        const loopBlink = new DelayedMethod(
            () => {
                if (showOldImage) {
                    this.loadCanvasImages(this.getImageSourceFromBuffer(oldImage), context);
                } else {
                    this.loadCanvasImages(this.getImageSourceFromBuffer(newImage), context);
                }
                showOldImage = !showOldImage;
            },
            QUARTER_SECOND / 2,
            true,
        );

        return loopBlink;
    }
    loadCurrentImage(image: Buffer, context: CanvasRenderingContext2D) {
        this.loadCanvasImages(this.getImageSourceFromBuffer(image), context);
    }
    async sleep(time: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    }
    loadCanvasImages(srcImg: string, context: CanvasRenderingContext2D) {
        const img = new Image();
        img.src = srcImg;
        img.onload = () => {
            context.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        };
    }
    combineImages(originalBuffer: Buffer, drawingCanvas: HTMLCanvasElement) {
        const context = drawingCanvas.getContext('2d') as CanvasRenderingContext2D;
        const imageData = context.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
        const pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += QUARTER) {
            const alpha = pixels[i + 3];
            if (alpha !== 0) {
                const x = (i / QUARTER) % drawingCanvas.width;
                let y = Math.floor(i / QUARTER / drawingCanvas.width);
                y = drawingCanvas.height - y - 1;
                this.setRGB(new Vector2(x, y), originalBuffer, new Pixel(pixels[i], pixels[i + 1], pixels[i + 2]));
            }
        }
    }
    private getRGB = (position: Vector2, imageBuffer: Buffer): Pixel | null => {
        try {
            const pixelPosition = this.getPixelBufferPosAtPixelPos(position, imageBuffer);
            const b = imageBuffer.readUInt8(pixelPosition);
            const g = imageBuffer.readUInt8(pixelPosition + 1);
            const r = imageBuffer.readUInt8(pixelPosition + 2);

            return new Pixel(r, g, b);
        } catch (e) {
            alert(e);
            alert("OOPS! Couldn't get the RGB values for the pixel at position " + position.x + ', ' + position.y + '!');
            return null;
        }
    };
    private setRGB = (position: Vector2, imageBuffer: Buffer, pixel: Pixel): void => {
        try {
            const pixelPosition = this.getPixelBufferPosAtPixelPos(position, imageBuffer);
            // Set the R, G, and B values
            imageBuffer.writeUInt8(pixel.b, pixelPosition);
            imageBuffer.writeUInt8(pixel.g, pixelPosition + 1);
            imageBuffer.writeUInt8(pixel.r, pixelPosition + 2);
        } catch (e) {
            alert(e);
            alert("OOPS! Can't write pixel at position " + position.x + ', ' + position.y + '!');
        }
    };
    private getPixelBufferPosAtPixelPos = (position: Vector2, imageBuffer: Buffer): number => {
        const pixelStart = BMP_FILE_HEADER_BYTES_LENGTH;
        const dimensions = this.getImageDimensions(imageBuffer);
        const imageWidth = dimensions.x;
        let yPosition: number;
        if (!this.isImageUsingTopDownFormat(imageBuffer)) {
            // Bottom Up BMP
            yPosition = position.y;
        } else {
            // Top Down BMP
            yPosition = dimensions.y - position.y - 1;
        }

        return (position.x + yPosition * imageWidth) * PIXEL_BYTES_LENGTH + pixelStart;
    };
    private isImageUsingTopDownFormat = (imageBuffer: Buffer): boolean => {
        const imageHeight = imageBuffer.readInt32LE(IMAGE_HEIGHT_OFFSET);
        return imageHeight < 0;
    };
}
