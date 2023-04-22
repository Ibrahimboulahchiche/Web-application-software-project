import { Queue } from '@app/classes/queue-class/queue';
import { Pixel } from '@common/classes/pixel';
import { Vector2 } from '@common/classes/vector2';
import { ImageUploadResult } from '@common/interfaces/image.upload.result';
import { VisitData } from '@common/interfaces/visitData';
import { CANVAS_HEIGHT, CANVAS_WIDTH, MIN_HARD_DIFFERENCES, REQUIRED_SURFACE_PERCENTAGE } from '@common/utils/constants';
import { Service } from 'typedi';

@Service()
export class ImageProcessingService {
    private static readonly requiredImageWidth = CANVAS_WIDTH;
    private static readonly requiredImageHeight = CANVAS_HEIGHT;
    private static readonly minDifferencesForHardMode = MIN_HARD_DIFFERENCES;
    private static readonly hardModeImageSurfaceRequiredPercentage = REQUIRED_SURFACE_PERCENTAGE;

    getDifferencesBlackAndWhiteImage = (imageBuffer1: Buffer, imageBuffer2: Buffer, radius: number): ImageUploadResult => {
        const imageOutput: Buffer = Buffer.from(imageBuffer1);

        const image1Dimensions: Vector2 = this.getImageDimensions(imageBuffer1);
        const image2Dimensions: Vector2 = this.getImageDimensions(imageBuffer2);

        if (
            image1Dimensions.x !== ImageProcessingService.requiredImageWidth ||
            image1Dimensions.y !== ImageProcessingService.requiredImageHeight ||
            image2Dimensions.x !== ImageProcessingService.requiredImageWidth ||
            image2Dimensions.y !== ImageProcessingService.requiredImageHeight
        )
            throw new Error(
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

        if (!this.is24BitDepthBMP(imageBuffer1) || !this.is24BitDepthBMP(imageBuffer2)) throw new Error('Images must be 24 bit depth BMPs!');

        const allDifferences: Vector2[][] = this.getDifferencesPositionsList(imageBuffer1, imageBuffer2, radius);
        this.turnImageToWhite(imageOutput);
        let sumOfAllDifferences: Vector2[] = [];

        for (const differences of allDifferences) {
            sumOfAllDifferences = sumOfAllDifferences.concat(differences);
        }

        this.paintBlackPixelsAtPositions(sumOfAllDifferences, imageOutput);

        return {
            resultImageByteArray: Array.from(new Uint8Array(imageOutput)),
            numberOfDifferences: allDifferences.length,
            message: 'Success!',
            generatedGameId: -1,
            differences: allDifferences,
            isEasy: !this.isHard(allDifferences.length, sumOfAllDifferences),
        };
    };

    private isHard = (numberOfDifferences: number, sumOfAllDifferences: Vector2[]): boolean => {
        return (
            numberOfDifferences >= ImageProcessingService.minDifferencesForHardMode &&
            sumOfAllDifferences.length <=
                ImageProcessingService.requiredImageHeight *
                    ImageProcessingService.requiredImageWidth *
                    ImageProcessingService.hardModeImageSurfaceRequiredPercentage
        );
    };

    private getDifferentPixelPositionsBetweenImages = (imageBuffer1: Buffer, imageBuffer2: Buffer): Vector2[] => {
        try {
            const imageDimensions: Vector2 = this.getImageDimensions(imageBuffer1);
            const differences: Vector2[] = [];

            for (let y = 0; y < imageDimensions.y; y++) {
                for (let x = 0; x < imageDimensions.x; x++) {
                    const pixel1 = this.getRGB({ x, y }, imageBuffer1);
                    const pixel2 = this.getRGB({ x, y }, imageBuffer2);
                    if (pixel1 && pixel2 && !pixel1.equals(pixel2)) {
                        differences.push({ x, y });
                    }
                }
            }

            return differences;
        } catch (e) {
            return [];
        }
    };

    private paintBlackPixelsAtPositions = (positions: Vector2[], imageBuffer: Buffer): void => {
        try {
            positions.forEach((position) => {
                this.setRGB(position, imageBuffer, Pixel.black);
            });
        } catch (e) {
            return;
        }
    };
    private getDifferencesPositionsList = (imageBuffer1: Buffer, imageBuffer2: Buffer, radius: number): Vector2[][] => {
        const visitRadius = radius;
        const differencesList: Vector2[][] = [[]];
        const currentDifferenceGroupIndex = 0;
        const allPixelsToVisit: Vector2[] = this.getDifferentPixelPositionsBetweenImages(imageBuffer1, imageBuffer2);
        const allPixelsToVisitSet: Set<string> = new Set();
        allPixelsToVisit.forEach((pixel) => {
            allPixelsToVisitSet.add(pixel.x + ' ' + pixel.y);
        });

        const alreadyVisited: Map<string, number> = new Map();
        const nextPixelsToVisit: Queue<{ pos: Vector2; radius: number }> = new Queue();
        const imageDimensions: Vector2 = this.getImageDimensions(imageBuffer1);
        const visitData: VisitData = { alreadyVisited, allPixelsToVisitSet, visitRadius, imageDimensions };
        const differenceObject = { currentDifferenceGroupIndex, differencesList };
        while (allPixelsToVisit.length > 0) {
            const nextPixel = allPixelsToVisit.pop();
            nextPixelsToVisit.enqueue({ pos: nextPixel as Vector2, radius: visitData.visitRadius });

            this.addingPixelToListOfDifference(visitData, nextPixelsToVisit, differenceObject);
            if (differenceObject.differencesList[differenceObject.currentDifferenceGroupIndex].length > 0 && allPixelsToVisit.length > 0) {
                differenceObject.differencesList.push([]);
                differenceObject.currentDifferenceGroupIndex++;
            }
        }
        if (differenceObject.differencesList[differenceObject.differencesList.length - 1].length === 0) differenceObject.differencesList.pop();
        return differenceObject.differencesList;
    };
    private addingPixelToListOfDifference = (
        visitData: VisitData,
        nextPixelsToVisit: Queue<{
            pos: Vector2;
            radius: number;
        }>,
        differenceObject: {
            currentDifferenceGroupIndex: number;
            differencesList: Vector2[][];
        },
    ) => {
        while (nextPixelsToVisit.length > 0) {
            const currentPixel = nextPixelsToVisit.dequeue() as { pos: Vector2; radius: number };

            // if this pixel hasn't been visited, add it to the list of differences
            if (!visitData.alreadyVisited.has(currentPixel.pos.x + ' ' + currentPixel.pos.y)) {
                differenceObject.differencesList[differenceObject.currentDifferenceGroupIndex].push(currentPixel.pos);
                visitData.alreadyVisited.set(currentPixel.pos.x + ' ' + currentPixel.pos.y, currentPixel.radius);
            } else {
                // if the pixel was already visited, check if the radius was bigger at the time of the visit
                const radiusOfTheVisitedPixelAtThatTime = visitData.alreadyVisited.get(currentPixel.pos.x + ' ' + currentPixel.pos.y);

                if (radiusOfTheVisitedPixelAtThatTime !== undefined && currentPixel.radius > radiusOfTheVisitedPixelAtThatTime) {
                    visitData.alreadyVisited.set(currentPixel.pos.x + ' ' + currentPixel.pos.y, currentPixel.radius);
                } else {
                    // if the radius was bigger, skip this pixel because visiting it again with a smaller radius would not change anything
                    continue;
                }
            }
            this.visitingPixel(currentPixel, visitData, nextPixelsToVisit);
        }
    };
    private visitingPixel = (
        currentPixel: { pos: Vector2; radius: number },
        visitData: VisitData,
        nextPixelsToVisit: Queue<{
            pos: Vector2;
            radius: number;
        }>,
    ) => {
        for (let y = currentPixel.pos.y - 1; y <= currentPixel.pos.y + 1; y++) {
            if (y < 0 || y >= visitData.imageDimensions.y) continue;
            for (let x = currentPixel.pos.x - 1; x <= currentPixel.pos.x + 1; x++) {
                if (x < 0 || x >= visitData.imageDimensions.x) continue;
                const nextPixel = { x, y };
                if (
                    !visitData.alreadyVisited.has(nextPixel.x + ' ' + nextPixel.y) &&
                    (currentPixel.radius > 0 || visitData.allPixelsToVisitSet.has(nextPixel.x + ' ' + nextPixel.y))
                ) {
                    // if our pixel has a radius bigger than 0, we visit the neighbor
                    // we also visit the neighbor if they are in the list of pixels to visit (allPixelsToVisitSet)
                    // if this pixel is already in the list of pixels to visit, add it but with the maximum radius
                    nextPixelsToVisit.enqueue({
                        pos: nextPixel,
                        radius: visitData.allPixelsToVisitSet.has(nextPixel.x + ' ' + nextPixel.y) ? visitData.visitRadius : currentPixel.radius - 1,
                    });
                }
            }
        }
    };

    private getRGB = (position: Vector2, imageBuffer: Buffer): Pixel | null => {
        try {
            const pixelPosition = this.getPixelBufferPosAtPixelPos(position, imageBuffer);

            // Extract the R, G, and B values
            const b = imageBuffer.readUInt8(pixelPosition);
            const g = imageBuffer.readUInt8(pixelPosition + 1);
            const r = imageBuffer.readUInt8(pixelPosition + 2);

            return new Pixel(r, g, b);
        } catch (e) {
            return null;
        }
    };

    private setRGB = (position: Vector2, imageBuffer: Buffer, pixel: Pixel): void => {
        try {
            const pixelPosition = this.getPixelBufferPosAtPixelPos(position, imageBuffer);
            imageBuffer.writeUInt8(pixel.b, pixelPosition);
            imageBuffer.writeUInt8(pixel.g, pixelPosition + 1);
            imageBuffer.writeUInt8(pixel.r, pixelPosition + 2);
        } catch (e) {
            return;
        }
    };

    private getPixelBufferPosAtPixelPos = (position: Vector2, imageBuffer: Buffer): number => {
        // BMP file header is 54 bytes long, so the pixel data starts at byte 54
        const pixelStart = 54;

        // Each pixel is 3 bytes (BGR)
        const pixelLength = 3;

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
        // Calculate the starting position of the pixel
        return (position.x + yPosition * imageWidth) * pixelLength + pixelStart;
    };

    private getImageDimensions = (imageBuffer: Buffer): Vector2 => {
        const imageWidthOffset = 18;
        const imageHeightOffset = 22;

        const imageWidth = imageBuffer.readInt32LE(imageWidthOffset);
        let imageHeight = imageBuffer.readInt32LE(imageHeightOffset);

        if (imageHeight < 0) {
            imageHeight = -imageHeight;
        }

        return new Vector2(imageWidth, imageHeight);
    };

    private isImageUsingTopDownFormat = (imageBuffer: Buffer): boolean => {
        const imageHeightOffset = 22;
        const imageHeight = imageBuffer.readInt32LE(imageHeightOffset);

        return imageHeight < 0;
    };

    private is24BitDepthBMP = (imageBuffer: Buffer): boolean => {
        const BITMAP_TYPE_OFFSET = 28;
        const BIT_COUNT_24 = 24;
        return imageBuffer.readUInt16LE(BITMAP_TYPE_OFFSET) === BIT_COUNT_24;
    };

    private turnImageToWhite = (imageBuffer: Buffer): void => {
        try {
            const imageDimensions: Vector2 = this.getImageDimensions(imageBuffer);

            for (let y = 0; y < imageDimensions.y; y++) {
                for (let x = 0; x < imageDimensions.x; x++) {
                    this.setRGB({ x, y }, imageBuffer, Pixel.white);
                }
            }
        } catch (e) {
            return;
        }
    };
}
