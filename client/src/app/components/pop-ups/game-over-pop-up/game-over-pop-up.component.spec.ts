import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchType } from '@common/enums/match.type';
import { GameOverPopUpData } from '@common/interfaces/game.over.pop.up.data';
import { EXCELLENT_GAME_TEXT, MAIN_MENU_TEXT, NO_TEXT, QUITTING_CONFIRMATION_TEXT, REPLAY_MODE_TEXT, YES_TEXT } from '@common/utils/constants';
import { GameOverPopUpComponent } from './game-over-pop-up.component';

describe('GameOverPopUpComponent', () => {
    let component: GameOverPopUpComponent;
    let fixture: ComponentFixture<GameOverPopUpComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameOverPopUpComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameOverPopUpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should show confirmation pop-up correctly', () => {
        component.displayConfirmation();
        expect(component.popUpInfo.length).toEqual(1);
        expect(component.popUpInfo[0].title).toEqual(QUITTING_CONFIRMATION_TEXT);
        expect(component.popUpInfo[0].option1).toEqual(YES_TEXT);
        expect(component.popUpInfo[0].option2).toEqual(NO_TEXT);
        expect(component.popUpInfo[0].isConfirmation).toBeTruthy();
        expect(component.popUpInfo[0].isGameOver).toBeFalsy();
        expect(component.modal.nativeElement.style.display).toEqual('flex');
    });

    it('should show game over pop-up according to isWinByDefault and isSoloMode values (pt.1)', () => {
        const popUpDataPrototype = {
            isWinByDefault: true,
            isTimerDepleted: true,
            matchType: MatchType.Solo,
            startReplayAction: null,
            username1: 'hello',
            username2: 'world',
        } as GameOverPopUpData;
        component.displayGameOver(popUpDataPrototype);
        expect(component.popUpInfo.length).toEqual(1);
        expect(component.popUpInfo[0].title).toContain('Félicitations vous avez remporté la partie !');
        expect(component.popUpInfo[0].option1).toEqual(MAIN_MENU_TEXT);
        expect(component.popUpInfo[0].option2).toEqual(REPLAY_MODE_TEXT);
        expect(component.popUpInfo[0].isConfirmation).toBeFalsy();
        expect(component.popUpInfo[0].isGameOver).toBeTruthy();
        expect(component.modal.nativeElement.style.display).toEqual('flex');
    });

    it('should close pop-up correctly', () => {
        component.closePopUp();
        expect(component.modal.nativeElement.style.display).toEqual('none');
    });

    it('should set popUpInfo and call showPopUp', () => {
        const username1 = 'player1';
        const username2 = 'player2';
        const isWinByDefault = false;
        const isSoloMode = false;
        spyOn(component, 'display');

        component.displayLimitedGameOver({ username1, username2 }, isWinByDefault, isSoloMode);

        expect(component.popUpInfo).toEqual([
            {
                title: `Félicitations ${username1 + ' ' + username2} vous avez remporté !`,
                message: EXCELLENT_GAME_TEXT,
                option1: MAIN_MENU_TEXT,
                option2: '',
                isConfirmation: false,
                isGameOver: true,
                option2Action: null,
            },
        ]);
        expect(component.display).toHaveBeenCalled();
    });

    it('should set popUpInfo and call showPopUp when isWinByDefault', () => {
        const username1 = 'player1';
        const username2 = 'player2';
        const isWinByDefault = true;
        const isSoloMode = false;
        spyOn(component, 'display');

        component.displayLimitedGameOver({ username1, username2 }, isWinByDefault, isSoloMode);

        expect(component.popUpInfo).toEqual([
            {
                title: `Félicitations ${username1} vous avez remporté !`,
                message: 'Votre partenaire a quitté la partie...',
                option1: 'Menu Principal',
                option2: '',
                isConfirmation: false,
                isGameOver: true,
                option2Action: null,
            },
        ]);
        expect(component.display).toHaveBeenCalled();
    });

    it('should set popUpInfo and call display when !isWinByDefault', () => {
        const username1 = 'player1';
        const username2 = 'player2';
        const isWinByDefault = false;
        const isSoloMode = true;
        spyOn(component, 'display');

        component.displayLimitedGameOver({ username1, username2 }, isWinByDefault, isSoloMode);

        expect(component.popUpInfo).toEqual([
            {
                title: `Félicitations ${username1} vous avez remporté !`,
                message: EXCELLENT_GAME_TEXT,
                option1: MAIN_MENU_TEXT,
                option2: '',
                isConfirmation: false,
                isGameOver: true,
                option2Action: null,
            },
        ]);
        expect(component.display).toHaveBeenCalled();
    });

    it('should set up the game over popup with the correct messages and options', () => {
        const popUpDataPrototype = {
            isWinByDefault: true,
            isTimerDepleted: false,
            matchType: MatchType.LimitedCoop,
            startReplayAction: null,
            username1: 'John',
            username2: 'Doe',
        } as GameOverPopUpData;

        component.displayGameOver(popUpDataPrototype);
        expect(component.popUpInfo.length).toBe(1);

        const popUp = component.popUpInfo[0];
        expect(popUp.title).toBe('Félicitations John et Doe vous avez remporté la partie !');
        expect(popUp.message).toBe('Votre adversaire a quitté la partie...');
        expect(popUp.option1).toBe(MAIN_MENU_TEXT);
        expect(popUp.option2).toBe('');
        expect(popUp.isConfirmation).toBe(false);
        expect(popUp.isGameOver).toBe(true);
        expect(popUp.option2Action).toBe(null);
    });

    it('should set pop-up solo infos and call display', () => {
        const popUpDataPrototype = {
            isWinByDefault: false,
            isTimerDepleted: true,
            matchType: MatchType.LimitedSolo,
            startReplayAction: null,
            username1: 'player1',
            username2: '',
        } as GameOverPopUpData;
        spyOn(component, 'display');
        component.displayGameOver(popUpDataPrototype);
        expect(component.popUpInfo).toEqual([
            {
                title: 'Le temps est écoulé!',
                message: 'Dommage...',
                option1: MAIN_MENU_TEXT,
                option2: '',
                isConfirmation: false,
                isGameOver: true,
                option2Action: null,
            },
        ]);
        expect(component.display).toHaveBeenCalled();
    });

    it('should set multi players pop-up and call display', () => {
        spyOn(component, 'display');
        const popUpDataPrototype = {
            isWinByDefault: false,
            isTimerDepleted: true,
            matchType: MatchType.OneVersusOne,
            startReplayAction: null,
            username1: 'player1',
            username2: 'player2',
        } as GameOverPopUpData;

        component.displayGameOver(popUpDataPrototype);

        expect(component.popUpInfo).toEqual([
            {
                title: `${popUpDataPrototype.username1} a remporté la partie !`,
                message: EXCELLENT_GAME_TEXT,
                option1: MAIN_MENU_TEXT,
                option2: REPLAY_MODE_TEXT,
                isConfirmation: false,
                isGameOver: true,
                option2Action: null,
            },
        ]);
        expect(component.display).toHaveBeenCalled();
    });
});
