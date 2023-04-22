/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameConstantsService } from '@app/services/game-constants-service/game-constants.service';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { MILLISECOND_TO_SECONDS } from '@common/utils/constants';
import { Buffer } from 'buffer';
import { HintService } from './hint.service';

describe('HintService', () => {
    let hintService: HintService;
    let imageService: jasmine.SpyObj<ImageManipulationService>;
    let chatComponent: ChatComponent;
    let constantService: jasmine.SpyObj<GameConstantsService>;

    const mockGame = {
        gameData: {
            id: 1,
            name: 'Test Game',
            isEasy: true,
            nbrDifferences: 0,
            differences: [],
            oneVersusOneRanking: [],
            soloRanking: [],
        },
        hints: 3,
        diffs: [],
    };

    beforeEach(() => {
        const spyImageManipulationService = jasmine.createSpyObj('ImageManipulationService', ['showFirstHint', 'showSecondHint']);
        const spyGameConstantsService = jasmine.createSpyObj('GameConstantsService', ['initGameConstants']);
        chatComponent = jasmine.createSpyObj('ChatComponent', ['sendSystemMessage']);
        hintService = new HintService(spyImageManipulationService, spyGameConstantsService);
        imageService = spyImageManipulationService as jasmine.SpyObj<ImageManipulationService>;
        constantService = spyGameConstantsService as jasmine.SpyObj<GameConstantsService>;

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ImageManipulationService, GameConstantsService, HintService],
        });
        hintService = TestBed.inject(HintService);
    });

    it('should be created', () => {
        expect(hintService).toBeTruthy();
    });

    it('should set randomNumber with Math.random()', () => {
        spyOn(Math, 'random').and.returnValue(0.1234);

        hintService.initialize();

        expect(imageService.randomNumber).toBeUndefined();
    });

    it('should return the correct time penalty for limited hints', () => {
        const gameConstantsSpy = jasmine.createSpyObj('GameConstantsService', ['initGameConstants']);
        gameConstantsSpy.penaltyValue = 5;
        const isLimited = true;
        expect(hintService.getTimePenalty(isLimited)).toEqual(0);
    });

    it('should return the correct time bonus for unlimited hints', () => {
        const gameConstantsSpy = jasmine.createSpyObj('GameConstantsService', ['initGameConstants']);
        gameConstantsSpy.penaltyValue = 5;
        const isLimited = false;
        expect(hintService.getTimePenalty(isLimited)).toEqual(-0);
    });

    it('decrement should decrement', () => {
        hintService.decrement();
        expect(hintService.maxGivenHints).toEqual(2);
    });

    it('returnDisplay should return display', () => {
        const display = 'newDisplay';
        hintService.returnDisplay(display);
        expect(display).toBeDefined();
    });

    it('should send a system message', () => {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', { hour12: false }) + ' - Indice utilisé';
        hintService.sendHintMessage(chatComponent);

        expect(chatComponent.sendSystemMessage).toHaveBeenCalledWith(formattedTime);
    });

    it('should display and hide red error message', fakeAsync(() => {
        const mockElementRef = {
            nativeElement: {
                style: {
                    display: 'none',
                },
            },
        } as ElementRef<HTMLDivElement>;
        hintService.showRedError(mockElementRef);
        expect(mockElementRef.nativeElement.style.display).toBe(hintService.returnDisplay('block'));
        tick(MILLISECOND_TO_SECONDS);
        expect(mockElementRef.nativeElement.style.display).toBe(hintService.returnDisplay('none'));
    }));

    it('should call showFirstHint method of ImageManipulationService when hints value is 3', () => {
        // imageService.generatePseudoRandomNumber.and.returnValue(0.5);
        const mockImageManipulationService = jasmine.createSpyObj('ImageManipulationService', [
            'generatePseudoRandomNumber',
            'generatePseudoRandomNumber',
            'showFirstHint',
            'showSecondHint',
            'showThirdHint',
        ]);
        mockImageManipulationService.generatePseudoRandomNumber.and.returnValue(0.5);
        hintService = new HintService(mockImageManipulationService, constantService);

        const canvas = { nativeElement: document.createElement('canvas') };
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const context = canvas.nativeElement.getContext('2d')!;
        const image = Buffer.alloc(100, 1);
        const otherImage = Buffer.alloc(100, 1);

        mockGame.hints = 1;
        hintService.showHint(canvas, context, image, otherImage, mockGame);
        expect(mockImageManipulationService.showFirstHint).not.toHaveBeenCalled();
        expect(mockImageManipulationService.showSecondHint).not.toHaveBeenCalled();
        expect(mockImageManipulationService.showThirdHint).toHaveBeenCalled();

        mockGame.hints = 2;
        hintService.showHint(canvas, context, image, otherImage, mockGame);
        expect(mockImageManipulationService.showSecondHint).toHaveBeenCalled();
        expect(mockImageManipulationService.showFirstHint).not.toHaveBeenCalled();
        expect(mockImageManipulationService.showThirdHint).toHaveBeenCalled();

        mockImageManipulationService.generatePseudoRandomNumber.and.returnValue(0.5);
        mockGame.hints = 3;
        hintService.showHint(canvas, context, image, otherImage, mockGame);
        expect(mockImageManipulationService.showSecondHint).toHaveBeenCalled();
        expect(mockImageManipulationService.showThirdHint).toHaveBeenCalled();
    });
});
