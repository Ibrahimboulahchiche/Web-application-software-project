/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
/* eslint-disable no-restricted-imports */
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { Match } from '@common/classes/match';
import { MatchStatus } from '@common/enums/match.status';
import { MatchType } from '@common/enums/match.type';
import { DeleteGamesPopUpComponent } from '../pop-ups/delete-games-pop-up/delete-games-pop-up.component';
import { ResetPopUpComponent } from '../pop-ups/reset-pop-up/reset-pop-up.component';
import { OverlayComponent } from './overlay.component';
describe('OverlayComponent', () => {
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let component: OverlayComponent;
    let fixture: ComponentFixture<OverlayComponent>;
    let matchmakingServiceSpy: jasmine.SpyObj<MatchmakingService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let popUpElementSpy: jasmine.SpyObj<DeleteGamesPopUpComponent>;
    let resetPopUpElementSpy: jasmine.SpyObj<ResetPopUpComponent>;

    let locationSpy: jasmine.SpyObj<Location>;

    beforeEach(() => {
        matchmakingServiceSpy = jasmine.createSpyObj('MatchmakingService', ['createGame', 'joinGame', 'setCurrentMatchType']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        popUpElementSpy = jasmine.createSpyObj('DeleteGamesPopUpComponent', ['showPopUp', 'displayPopUp']);
        resetPopUpElementSpy = jasmine.createSpyObj('ResetPopUpComponent', ['showPopUp', 'displayPopUp']);

        locationSpy = jasmine.createSpyObj('Location', ['reload']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [OverlayComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatchmakingService, useValue: matchmakingServiceSpy },
                HttpClient,
                { provide: Router, useValue: routerSpy },
                { provide: Location, useValue: locationSpy },
                { provide: DeleteGamesPopUpComponent, useValue: popUpElementSpy },
                { provide: ResetPopUpComponent, useValue: resetPopUpElementSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(OverlayComponent);
        component = fixture.componentInstance;
        component.id = 'game_id_123';
        component.deletePopUpElement = popUpElementSpy;
        component.resetPopUpElement = resetPopUpElementSpy;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create a OneVersusOne game and navigate to the registration page', () => {
        const match1: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: undefined as any, playerId: '1' },
            player2: { username: 'undefined', playerId: '2' },
            player1Archive: { username: 'mario', playerId: '1' },
            player2Archive: { username: 'luigi', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player1Win,
        };
        matchmakingServiceSpy.currentMatch = match1;
        component.createOneVersusOneGame();

        expect(matchmakingServiceSpy.createGame).toHaveBeenCalledWith('game_id_123');
        expect(matchmakingServiceSpy.currentMatch?.matchType).toEqual(MatchType.OneVersusOne);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/registration', 'game_id_123']);
    });

    it('should create a Solo game and navigate to the registration page', () => {
        component.resetPopUpElement = resetPopUpElementSpy;
        component.createSoloGame();
        component.showResetPopUp();
        component.deleteSelectedGame(false);
        component.resetSelectedGame(false);

        component.showResetPopUp();
        expect(matchmakingServiceSpy.createGame).toHaveBeenCalledWith('game_id_123');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/registration', 'game_id_123']);
    });

    it('should not join a game if no match is available', () => {
        component.joinGame();

        expect(matchmakingServiceSpy.joinGame).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should join a game and navigate to the registration page', () => {
        component.matchToJoinIfAvailable = 'match_id_123';

        component.joinGame();

        expect(matchmakingServiceSpy.joinGame).toHaveBeenCalledWith('match_id_123', 'game_id_123');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/registration', 'game_id_123']);
    });

    it('should call showDeleteGamesPopUp function of popUpElement with false argument', () => {
        component.deletePopUpElement = new DeleteGamesPopUpComponent();
        spyOn(component.deletePopUpElement, 'showPopUp');
        component.showDeletePopUp();
        expect(component.deletePopUpElement.showPopUp).toHaveBeenCalled();
    });
});
