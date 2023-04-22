/* eslint-disable max-params */
import { ElementRef, Injectable } from '@angular/core';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameConstantsService } from '@app/services/game-constants-service/game-constants.service';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { GameData } from '@common/interfaces/game.data';
import { MILLISECOND_TO_SECONDS, NUMBER_HINTS } from '@common/utils/constants';
import { Buffer } from 'buffer';

@Injectable({
    providedIn: 'root',
})
export class HintService {
    maxGivenHints = NUMBER_HINTS;

    constructor(private imageManipulationService: ImageManipulationService, public gameConstantsService: GameConstantsService) {
        this.gameConstantsService.initGameConstants();
    }

    initialize() {
        this.imageManipulationService.randomNumber = Math.random();
    }

    reset() {
        this.maxGivenHints = NUMBER_HINTS;
    }

    decrement() {
        this.maxGivenHints--;
    }

    getTimePenalty(isLimited: boolean) {
        return isLimited ? this.gameConstantsService.penaltyValue : -this.gameConstantsService.penaltyValue;
    }

    sendHintMessage(chat: ChatComponent) {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', { hour12: false }) + ' - Indice utilisé';
        chat.sendSystemMessage(formattedTime);
    }

    showRedError(penaltyMessage: ElementRef) {
        penaltyMessage.nativeElement.style.display = this.returnDisplay('block');
        setTimeout(() => {
            if (penaltyMessage.nativeElement.style.display !== 'none') {
                penaltyMessage.nativeElement.style.display = this.returnDisplay('none');
            }
        }, MILLISECOND_TO_SECONDS);
    }

    returnDisplay(display: string) {
        return display;
    }

    refreshCurrentCanvasContext(canvas: ElementRef<HTMLCanvasElement>, context: CanvasRenderingContext2D, image: Buffer, otherImage: Buffer) {
        this.imageManipulationService.currentCanvasState = { canvas, context, imageNew: image, original: otherImage };
    }

    showHint(
        canvas: ElementRef<HTMLCanvasElement>,
        context: CanvasRenderingContext2D,
        image: Buffer,
        otherImage: Buffer,
        gameInfo: { gameData: GameData; hints: number; diffs: boolean[] },
    ) {
        if (gameInfo.hints === 3) {
            this.imageManipulationService.showFirstHint(
                { canvas, context, imageNew: image, original: otherImage },
                gameInfo.gameData,
                gameInfo.diffs,
            );
        } else if (gameInfo.hints === 2) {
            this.imageManipulationService.showSecondHint(
                { canvas, context, imageNew: image, original: otherImage },
                gameInfo.gameData,
                gameInfo.diffs,
            );
        } else {
            this.imageManipulationService.showThirdHint(
                { canvas, context, imageNew: image, original: otherImage },
                gameInfo.gameData,
                gameInfo.diffs,
            );
        }
    }
}
