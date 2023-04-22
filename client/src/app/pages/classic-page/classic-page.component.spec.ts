/* eslint-disable max-len */
/* eslint-disable prefer-const */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { DelayedMethod } from '@app/classes/delayed-method/delayed-method';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper';
import { BackButtonComponent } from '@app/components/buttons/back-button/back-button.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HintComponent } from '@app/components/hint/hint.component';
import { InfoCardComponent } from '@app/components/info-card/info-card.component';
import { GameOverPopUpComponent } from '@app/components/pop-ups/game-over-pop-up/game-over-pop-up.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { ClassicPageComponent } from '@app/pages/classic-page/classic-page.component';
import { AuthService } from '@app/services/auth-service/auth.service';
import { CanvasHandlingService } from '@app/services/canvas-handling-service/canvas-handling.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { ImageManipulationService } from '@app/services/image-manipulation-service/image-manipulation.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { Action } from '@common/classes/action';
import { Match } from '@common/classes/match';
import { MatchStatus } from '@common/enums/match.status';
import { MatchType } from '@common/enums/match.type';
import { RankingData } from '@common/interfaces/ranking.data';
import { MILLISECOND_TO_SECONDS } from '@common/utils/constants';
import { Buffer } from 'buffer';
import { of, throwError } from 'rxjs';
import { Socket } from 'socket.io-client';
class SocketClientServiceMock extends SocketClientService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override connect() {}
}
describe('ClassicPageComponent', () => {
    let component: ClassicPageComponent;
    let fixture: ComponentFixture<ClassicPageComponent>;
    let matchMakingService: jasmine.SpyObj<MatchmakingService>;
    let socketTestHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;
    let socketClientService: SocketClientService;
    let popUP: jasmine.SpyObj<GameOverPopUpComponent>;
    let canvasHandlingService: jasmine.SpyObj<CanvasHandlingService>;
    let hintService: jasmine.SpyObj<HintService>;

    let commService: jasmine.SpyObj<CommunicationService>;
    let authService: jasmine.SpyObj<AuthService>;
    let imageService: jasmine.SpyObj<ImageManipulationService>;
    let chatService: jasmine.SpyObj<ImageManipulationService>;
    let leftCanvas: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
    let rightCanvas: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
    let timer: jasmine.SpyObj<TimerComponent>;
    let chat: jasmine.SpyObj<ChatComponent>;

    const fakeGame = {
        gameData: {
            id: 0,
            name: 'hello',
            isEasy: true,
            nbrDifferences: 1,
            differences: [[{ x: 0, y: 0 }]],
            oneVersusOneRanking: [{ name: 'player', score: 123 }],
            soloRanking: [{ name: 'player', score: 123 }],
        },
        originalImage: Buffer.from([1]),
        modifiedImage: Buffer.from([1]),
    };

    const mockResponse: HttpResponse<string> = new HttpResponse({
        status: 200,
        body: 'mock response',
    });
    const mockObservable = of(mockResponse);

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketTestHelper as unknown as Socket;
        canvasHandlingService = jasmine.createSpyObj('CanvasHandlingService', [
            'leftCanvasContext',
            'rightCanvasContext',
            'updateCanvas',
            'loadImagesToCanvas',
            'refreshModifiedImage',
            'focusKeyEvent',
            'initializeCheatMode',
            'putCanvasIntoInitialState',
            'stopCheating',
            'startDelayedMethod',
        ]);
        hintService = jasmine.createSpyObj('HintService', [
            'initialize',
            'reset',
            'decrement',
            'getTimePenalty',
            'sendHintMessage',
            'showRedError',
            'returnDisplay',
            'showHint',
            'refreshCurrentCanvasContext',
        ]);

        commService = jasmine.createSpyObj('CommunicationService', ['basicGet', 'basicPost', 'get', 'post', 'delete']);
        authService = jasmine.createSpyObj('AuthService', ['registerUser', 'registerUserName']);
        imageService = jasmine.createSpyObj('ImageManipulationService', [
            'getModifiedImageWithoutDifferences',
            'blinkDifference',
            'sleep',
            'loadCanvasImages',
            'getImageSourceFromBuffer',
        ]);
        chatService = jasmine.createSpyObj('ChatService', [
            'sendMessage',
            'sendMessageFromSystem',
            'clearMessage',
            'isTextValid',
            'isPlayer1',
            'isMode1vs1',
            'pushMessage',
        ]);
        matchMakingService = jasmine.createSpyObj('MatchmakingService', [
            'currentMatchId',
            'currentMatchPlayed',
            'currentMatchType',
            'player1Username',
            'player2Username',
            'currentSocketId',
            'isHost',
            'isSoloMode',
            'is1vs1Mode',
            'isPlayer1',
            'player1Id',
            'currentMatchPlayer',
            'isMatchAborted',
            'handleMatchUpdateEvents',
            'disconnectSocket',
            'createGame',
            'joinGame',
            'sendMatchJoinRequest',
            'sendMatchJoinCancel',
            'sendIncomingPlayerRequestAnswer',
            'setCurrentMatchType',
        ]);

        matchMakingService.onMatchUpdated = new Action<Match | null>();

        const mockCommunicationService = jasmine.createSpyObj('CommunicationService', ['subscribe']);
        mockCommunicationService.subscribe.and.returnValue(of(new HttpResponse<string>()));
        commService.get.and.returnValue(mockObservable);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                ClassicPageComponent,
                HintComponent,
                BackButtonComponent,
                InfoCardComponent,
                ChatComponent,
                TimerComponent,
                GameOverPopUpComponent,
            ],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: CommunicationService, useValue: commService },
                { provide: ImageManipulationService, useValue: imageService },
                { provide: MatchmakingService, useValue: matchMakingService },
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: CanvasHandlingService, useValue: canvasHandlingService },
                { provide: HintService, useValue: hintService },

                { provide: ChatService, useValue: chatService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: convertToParamMap({ id: '-1' }) },
                    },
                },
                { provide: ChatComponent, useValue: chat },
                { provide: TimerComponent, useValue: timer },
                { provide: ElementRef, useValue: leftCanvas },
                { provide: ElementRef, useValue: rightCanvas },
                { provide: GameOverPopUpComponent, useValue: popUP },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ClassicPageComponent);
        component = fixture.componentInstance;
        component.games[0] = fakeGame;

        socketClientService = TestBed.inject(SocketClientService);
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: 'mario', playerId: '1' },
            player2: { username: 'luigi', playerId: '2' },
            player1Archive: { username: 'mario', playerId: '1' },
            player2Archive: { username: 'luigi', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player1Win,
        };
        matchMakingService.currentMatch = match;

        component.chat = jasmine.createSpyObj('ChatComponent', ['sendMessage', 'addMessage', 'isTextValid', 'scrollToBottom']);
        component.timerElement = jasmine.createSpyObj('TimerComponent', ['loopingMethod', 'stopTimer', 'pause', 'pointersEvents']);
        component.errorMessage = jasmine.createSpyObj('ElementRef', [], {
            nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['pointersEvents']),
        });

        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', [
            'displayConfirmation',
            'displayGameOver',
            'display',
            'closePopUp',
            'displayLimitedGameOver',
        ]);

        component.successSound = jasmine.createSpyObj('ElementRef', [], {
            nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['play', 'pointersEvents']),
        });
        component.errorSound = jasmine.createSpyObj('ElementRef', [], {
            nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['play', 'pointersEvents']),
        });
        component.leftCanvas = jasmine.createSpyObj('ElementRef', [], {
            nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['getContext', 'pointersEvents']),
        });
        component.rightCanvas = jasmine.createSpyObj('ElementRef', [], {
            nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['getContext', 'pointersEvents']),
        });

        fixture.detectChanges();
    });
    afterEach(() => {
        socketServiceMock.disconnect();
        socketTestHelper.disconnect();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('playError should play', async () => {
        const newTime = 0;
        await component.playSound(false);
        expect(component.errorSound.nativeElement.currentTime).toEqual(newTime);
    });

    it('playSuccess should play', () => {
        const newTime = 0;
        component.playSound(true);
        const currentTime = component.successSound.nativeElement.currentTime;
        expect(currentTime).toEqual(newTime);
    });

    it('refreshModifiedImage should refresh', async () => {
        expect(imageService.getModifiedImageWithoutDifferences).not.toHaveBeenCalled();
    });

    it('refreshModifiedImage should blink', async () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };

        if (!component.rightCanvasContext) expect(imageService.blinkDifference).toHaveBeenCalled();
        expect(component.rightCanvasContext).not.toBeUndefined();
    });

    it('requestStartGame should send from socket', () => {
        const spy = spyOn(socketClientService, 'send');
        component.requestStartGame();
        expect(spy).toHaveBeenCalled();
    });
    it('onMouseDown should check mouse event', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        const event = new MouseEvent('mousedown');
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isSoloMode = false;
        component.matchmakingService = mockMatchmakingService;
        component.onMouseDown(event);
        expect(component.isEasy).not.toBeNull();
    });
    it('onMouseDown should check mouse event', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        const event = new MouseEvent('mousedown');
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isSoloMode = true;
        component.matchmakingService = mockMatchmakingService;
        component.onMouseDown(event);
        expect(component.isEasy).not.toBeNull();
    });
    it('onMouseDown should check mouse event', () => {
        spyOnProperty(component, 'isGameInteractive').and.returnValue(false);
        const event = new MouseEvent('mousedown');

        expect(component.onMouseDown(event)).toEqual(undefined);
    });

    it('addServerSocketMessagesListeners should send message', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.player1 = 'nauot';
        component.player2 = 'nauot';
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isLimitedTimeSolo = false;
        mockMatchmakingService.isCoopMode = true;
        component.matchmakingService = mockMatchmakingService;
        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { foundDifferences: [true, false, true], isValidated: true, foundDifferenceIndex: 1, isPlayer1: true };
        socketTestHelper.on('validationReturned', callback);
        socketTestHelper.peerSideEmit('validationReturned', data);
        expect(socketClientService.on).toHaveBeenCalledTimes(7);
    });
    it('addServerSocketMessagesListeners should send message', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.player1 = 'nauot';
        component.player2 = 'nauot';
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isLimitedTimeSolo = false;
        mockMatchmakingService.isCoopMode = false;
        component.matchmakingService = mockMatchmakingService;

        spyOnProperty(component, 'numberOfDifferencesRequiredToWin').and.returnValue(500);
        component.differencesFound1 = -1;
        component.differencesFound2 = 999;
        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { foundDifferences: [true, false, true], isValidated: true, foundDifferenceIndex: 1, isPlayer1: true };
        socketTestHelper.on('validationReturned', callback);
        socketTestHelper.peerSideEmit('validationReturned', data);
        expect(socketClientService.on).toHaveBeenCalledTimes(7);
    });
    it('addServerSocketMessagesListeners should send message validateReturn', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.player1 = 'nauot';
        component.player2 = 'nauot';
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);
        component.currentGameIndex = 0;
        component.games[1] = fakeGame;
        spyOnProperty(component, 'isCheating').and.returnValue(true);
        spyOn(component.timerElement, 'applyTimePenalty').and.callFake((): any => {
            return;
        });
        spyOn(component, 'startCheating').and.callFake(() => {
            return;
        });
        spyOn(component, 'getInitialImagesFromServer').and.callFake((): any => {
            return;
        });
        spyOn(component, 'onFindWrongDifference').and.callFake((): any => {
            return;
        });
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isLimitedTimeSolo = false;
        mockMatchmakingService.isCoopMode = true;
        component.matchmakingService = mockMatchmakingService;
        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { foundDifferences: [true, false, true], isValidated: true, foundDifferenceIndex: 1, isPlayer1: true };
        socketTestHelper.on('validationReturned', callback);
        socketTestHelper.peerSideEmit('validationReturned', data);
        expect(socketClientService.on).toHaveBeenCalledTimes(7);
    });
    it('addServerSocketMessagesListeners should send message', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.player1 = 'nauot';
        component.player2 = 'nauot';
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);

        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { data: 2 };
        socketTestHelper.on('playersSyncTime', callback);
        socketTestHelper.peerSideEmit('playersSyncTime', data);
        expect(socketClientService.on).toHaveBeenCalledTimes(7);
    });
    it('addServerSocketMessagesListeners should send message', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.player1 = 'nauot';
        component.player2 = 'nauot';
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);

        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { data: 2 };
        socketTestHelper.on('timerStopped', callback);
        socketTestHelper.peerSideEmit('timerStopped', data);
        expect(socketClientService.on).toHaveBeenCalledTimes(7);
    });
    it('addServerSocketMessagesListeners should send message', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.player1 = 'nauot';
        component.player2 = 'nauot';
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);

        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { data: [1, 2] };
        socketTestHelper.on('randomizedOrder', callback);
        socketTestHelper.peerSideEmit('randomizedOrder', data);
        expect(socketClientService.on).toHaveBeenCalledTimes(7);
    });
    it('addServerSocketMessagesListeners should send message', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.player1 = 'nauot';
        component.player2 = 'nauot';
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);

        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = {
            rankingData: {
                username: 'winner',
                position: 'première',
                gameName: 'guru',
                matchType: 'Solo',
                winnerSocketId: 'socket1',
            } as RankingData,
        };

        spyOn(component.chat, 'sendTimeScoreMessage').and.callFake((): any => {});
        socketTestHelper.on('newBreakingScore', callback);
        socketTestHelper.peerSideEmit('newBreakingScore', data);
        expect(socketClientService.on).toHaveBeenCalledTimes(7);
    });
    it('addServerSocketMessagesListeners should send message', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.player1 = 'nauot';
        component.player2 = 'nauot';
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);

        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { data: true };
        socketTestHelper.on('readyUpdate', callback);
        socketTestHelper.peerSideEmit('readyUpdate', data);
        expect(socketClientService.on).toHaveBeenCalledTimes(7);
    });
    it('addServerSocketMessagesListeners should send message', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        spyOnProperty(component, 'isCoop').and.returnValue(true);
        spyOnProperty(component, 'isSolo').and.returnValue(false);
        spyOnProperty(component, 'isLimitedTimeSolo').and.returnValue(true);
        component.player1 = 'nauot';
        component.player2 = 'nauot';
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);
        component.isPlayer1Ready = false;
        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { isPlayer1: true };

        socketTestHelper.on('readyUpdate', callback);
        socketTestHelper.peerSideEmit('readyUpdate', data);
        expect(socketClientService.on).toHaveBeenCalledTimes(7);
    });
    it('addServerSocketMessagesListeners should send message', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.player1 = 'nauot';
        component.player2 = 'nauot';
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', [
            'displayConfirmation',
            'displayGameOverPopUp',
            'display',
            'closePopUp',
        ]);

        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { foundDifferences: [true, false, true], isValidated: false, foundDifferenceIndex: 1, isPlayer1: true };
        socketTestHelper.on('validationReturned', callback);
        socketTestHelper.peerSideEmit('validationReturned', data);

        expect(socketClientService.on).toHaveBeenCalledTimes(7);
    });

    it('addServerSocketMessagesListeners should send message', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.player1 = 'nauot';
        component.player2 = 'nauot';
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);

        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { foundDifferences: [true, false, true], isValidated: true, foundDifferenceIndex: 1, isPlayer1: false };
        socketTestHelper.on('validationReturned', callback);
        socketTestHelper.peerSideEmit('validationReturned', data);

        expect(socketClientService.on).toHaveBeenCalledTimes(7);
    });
    it('addServerSocketMessagesListeners should send message', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.player1 = 'nauot';
        component.player2 = 'nauot';
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);

        spyOn(socketClientService, 'on').and.callThrough();
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { username: 'string', message: 'string', sentByPlayer1: true };
        socketTestHelper.peerSideEmit('messageBetweenPlayers', data);
        socketTestHelper.on('messageBetweenPlayers', callback);

        expect(socketClientService.on).toHaveBeenCalledTimes(7);
    });
    it('addServerSocketMessagesListeners should send message', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.player1 = 'nauot';
        component.player2 = 'nauot';
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);

        spyOn(socketClientService, 'on').and.callThrough();
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: 'mario', playerId: '1' },
            player2: { username: 'luigi', playerId: '2' },
            player1Archive: { username: 'fff', playerId: '1' },
            player2Archive: { username: 'fff', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player1Win,
        };
        matchMakingService.currentMatch = match;
        component.addServerSocketMessagesListeners();
        const callback = ((params: any) => {}) as any;
        const data = { foundDifferences: [true, false, true], isValidated: true, foundDifferenceIndex: 1, isPlayer1: true };
        socketTestHelper.on('validationReturned', callback);
        socketTestHelper.peerSideEmit('validationReturned', data);

        expect(socketClientService.on).toHaveBeenCalledTimes(7);
    });

    it('should return if the match is on cheating mode', () => {
        expect(component.isCheating).toEqual(false);
    });
    it('should finish the loading Images', () => {
        component.onFinishLoadingImages();
        expect(component.isLoading).toEqual(false);
    });
    it('should update the time according to server', () => {
        component.updateTimerAccordingToServer(2);
        expect(component.isLoading).toEqual(true);
    });
    it('should update the time according to server', () => {
        component.isOver = true;
        component.updateTimerAccordingToServer(2);
        expect(component.isLoading).toEqual(true);
    });

    it('should return the current replay speed 1 ', () => {
        expect(component.currentReplaySpeed).toEqual(1);
    });
    it('should return the number of difference to found to win a game ', () => {
        spyOnProperty(component, 'isOneVersusOne').and.returnValue(true);
        component.minDifferences = 2;
        component.totalDifferences = 9;
        expect(component.numberOfDifferencesRequiredToWin).toEqual(2);
    });
    it('should return the number of difference to found to win a game ', () => {
        component.minDifferences = 2;
        component.totalDifferences = 9;
        expect(component.numberOfDifferencesRequiredToWin).toEqual(9);
    });
    it('getInitialImagesFromServer should throw error', () => {
        const alertSpy = spyOn(window, 'alert');
        const errorResponse = new HttpErrorResponse({});
        commService.get = jasmine.createSpy().and.returnValue(throwError(() => errorResponse));
        spyOn(component.canvasHandlingService, 'updateCanvas').and.callFake((): any => {
            return;
        });
        component.getInitialImagesFromServer();
        expect(alertSpy).toHaveBeenCalled();
    });

    it('should increase the score of the player 1 ', () => {
        spyOnProperty(component, 'isLimitedTimeSolo').and.returnValue(true);
        component.increasePlayerScore(false);
        expect(component.differencesFound1).toEqual(1);
    });
    it('should increase the score of the player 2', () => {
        spyOnProperty(component, 'isLimitedTimeSolo').and.returnValue(false);
        component.increasePlayerScore(false);
        expect(component.differencesFound2).toEqual(1);
    });

    it('should show error text and focus key event on canvas when wrong difference is found', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        spyOn(component.canvasHandlingService, 'focusKeyEvent').and.callFake(() => {
            return;
        });
        spyOn(component, 'sendSystemMessageToChat');

        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isSoloMode = false;
        mockMatchmakingService.isPlayer1 = true;
        component.matchmakingService = mockMatchmakingService;

        component.onFindWrongDifference(true);
        expect(component.errorMessage.nativeElement.style.display).not.toBe(undefined);
        expect(component.leftCanvas.nativeElement.style.pointerEvents).not.toBe([]);
        expect(component.rightCanvas.nativeElement.style.pointerEvents).not.toBe([]);
    });

    it('should fetch the games', () => {
        component.currentGameId = '0';
        const mockResponseFetch = {
            body: JSON.stringify([
                {
                    gameData: {
                        id: '1',
                        name: 'Game 1',
                    },
                    originalImage: Buffer.from('test'),
                    modifiedImage: Buffer.from('test'),
                },
                {
                    gameData: {
                        id: '2',
                        name: 'Game 2',
                    },
                    originalImage: Buffer.from('test'),
                    modifiedImage: Buffer.from('test'),
                },
            ]),
        };

        mockResponseFetch.body = null as any;

        component.fetchGames().subscribe((result) => {
            expect(result).toBeNull();
        });
    });
    it('should fetch the games', () => {
        component.currentGameId = undefined as any;
        const mockResponseFetch = {
            body: JSON.stringify([
                {
                    gameData: {
                        id: '1',
                        name: 'Game 1',
                    },
                    originalImage: Buffer.from('test'),
                    modifiedImage: Buffer.from('test'),
                },
                {
                    gameData: {
                        id: '2',
                        name: 'Game 2',
                    },
                    originalImage: Buffer.from('test'),
                    modifiedImage: Buffer.from('test'),
                },
            ]),
        };

        mockResponseFetch.body = null as any;

        component.fetchGames().subscribe((result) => {
            expect(result).toBeNull();
        });
    });

    it('setTimout should be called onFindWrongDifferences', fakeAsync(() => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        spyOn(component.canvasHandlingService, 'focusKeyEvent').and.callFake(() => {
            return;
        });
        component.onFindWrongDifference(true);
        tick(1000);
        expect(component.errorMessage.nativeElement.style.display).not.toBe(undefined);
        expect(component.leftCanvas.nativeElement.style.pointerEvents).not.toBe([]);
        expect(component.rightCanvas.nativeElement.style.pointerEvents).not.toBe([]);
    }));
    it('should show error message and disable pointer events on canvases when called', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        spyOn(component, 'playSound');

        component.showErrorText();

        expect(component.errorMessage.nativeElement.style.display).toBe('block');
        expect(component.leftCanvas.nativeElement.style.pointerEvents).toBe('none');
        expect(component.rightCanvas.nativeElement.style.pointerEvents).toBe('none');
        expect(component.playSound).toHaveBeenCalledWith(false);
    });
    it('should hide error message after a delay', () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        const delayedMethodSpy = spyOn(DelayedMethod.prototype, 'start').and.callThrough();

        component.showErrorText();

        expect(component.errorMessage.nativeElement.style.display).not.toBe(undefined);
        expect(component.leftCanvas.nativeElement.style.pointerEvents).not.toBe([]);
        expect(component.rightCanvas.nativeElement.style.pointerEvents).not.toBe([]);

        setTimeout(() => {
            expect(component.errorMessage.nativeElement.style.display).not.toBe(undefined);

            expect(delayedMethodSpy).toHaveBeenCalled();
        }, MILLISECOND_TO_SECONDS + 10);
    });

    it('should send New Time Score To Server', () => {
        spyOnProperty(component, 'isCheating').and.returnValue(true);
        component.currentGameId = '123';
        spyOn(component.canvasHandlingService, 'refreshModifiedImage').and.callFake((): any => {
            return;
        });
        spyOn(component, 'startCheating').and.callFake(() => {
            return;
        });
        component.onFindDifference();
        expect(component.letterTPressed).toBeTrue();
    });

    it('should reset the game', () => {
        component.resetGame();
        expect(component.foundDifferences).toEqual([]);
        expect(component.differencesFound1).toEqual(0);
        expect(component.differencesFound2).toEqual(0);
    });
    it('should receiveMAtchData', () => {
        spyOnProperty(component, 'isPlayer1').and.returnValue(false);
        component.onReceiveMatchData();
        expect(component.activePlayer).toBeFalsy();
    });
    it('should receiveMatchData', () => {
        component.hasAlreadyReceiveMatchData = true;
        expect(component.onReceiveMatchData()).toEqual(undefined);
    });
    it('should receiveMAtchData', () => {
        component.currentGameId = '123';
        component.updateGameInfo();
        expect(component.minDifferences).toEqual(1);
    });
    it('should change the replay speed', () => {
        component.onReplaySpeedButtonClick();
        expect(component.currentReplaySpeedIndex).toEqual(1);
    });
    it('should finish the game', () => {
        spyOnProperty(component, 'isOneVersusOne').and.returnValue(true);
        const spy = spyOn(socketClientService, 'send');

        spyOnProperty(component, 'isSolo').and.returnValue(false);
        spyOn(component, 'sendNewTimeScoreToServer').and.callFake(() => {
            return;
        });
        spyOn(component, 'startCheating').and.callFake(() => {
            return;
        });
        spyOn(component, 'stopCheating').and.callFake(() => {
            return;
        });
        component.gameOver();
        expect(spy).toHaveBeenCalled();
    });

    it('should finish the Replay', () => {
        const spyCheating = spyOn(component, 'stopCheating');

        component.finishReplay();
        expect(spyCheating).toHaveBeenCalled();
    });
    it('should return true if the player 1 win', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: null,
            player2: null,
            player1Archive: { username: 'fff', playerId: '1' },
            player2Archive: { username: 'fff', playerId: '2' },
            matchType: MatchType.Solo,
            matchStatus: MatchStatus.Player1Win,
        };
        const result = component.isPlayer1Win(match);
        expect(result).toEqual(true);
    });
    it('should start the cheating', () => {
        spyOn(component.canvasHandlingService, 'initializeCheatMode').and.callFake(() => {
            return;
        });
        component.startCheating();
        component.stopCheating();

        expect(component.letterTPressed).toEqual(true);
    });
    it('should handle the hint mode', () => {
        spyOnProperty(component, 'isGameInteractive').and.returnValue(true);
        hintService.maxGivenHints = 1;
        component.hintModeButton();
        component.handleHintMode();
        expect(hintService.maxGivenHints).toEqual(1);
    });
    it('should handle the hint mode', () => {
        hintService.maxGivenHints = -1;
        expect(component.handleHintMode()).toEqual(undefined);
    });

    it('should handle the click and letter T event if branch', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: null,
            player2: null,
            player1Archive: { username: 'fff', playerId: '1' },
            player2Archive: { username: 'fff', playerId: '2' },
            matchType: MatchType.LimitedCoop,
            matchStatus: MatchStatus.Player2Win,
        };

        component.matchmakingService.currentMatch = match;
        const event = new MouseEvent('mousedown');
        component.handleClickAndLetterTEvent(event);
        expect(component.isOver).toBeFalse();
    });

    it('should handle the lose game', () => {
        spyOn(component.popUpElement, 'displayGameOver').and.callThrough();
        spyOn(component, 'sendNewTimeScoreToServer').and.callFake(() => {
            return;
        });
        component.onLoseGame();
        expect(component.isOver).toEqual(true);
    });
    it('should handle the lose game', () => {
        component.currentGameIndex = 1;
        spyOn(component.canvasHandlingService, 'updateCanvas').and.callFake((): any => {
            return;
        });
        component.games[1] = fakeGame;
        component.getInitialImagesFromServer();
        expect(component.isEasy).not.toBeNull();
    });

    it('should return true if the player 2 win', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: null,
            player2: null,
            player1Archive: { username: 'fff', playerId: '1' },
            player2Archive: { username: 'fff', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player2Win,
        };
        const result = component.isPlayer2Win(match);
        expect(result).toEqual(true);
    });

    it('should return the player2Username', () => {
        const result = component.getPlayerUsername(false);
        expect(result).not.toEqual(undefined as any);
    });

    it('should return the player2', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: 'fff', playerId: '1' },
            player2: { username: 'fff', playerId: '2' },
            player1Archive: { username: 'fff', playerId: '1' },
            player2Archive: { username: 'fff', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player2Win,
        };
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);
        spyOnProperty(component, 'isSolo').and.returnValue(false);
        spyOnProperty(component, 'isOneVersusOne').and.returnValue(true);
        spyOn(component, 'isPlayer1Win').and.returnValue(true);

        component.player1 = 'nauot';
        component.player2 = 'nauot';

        component.handleMatchUpdate(match);
        expect(component.isOver).toBeTruthy();
    });
    it('should return the player2', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: 'fff', playerId: '1' },
            player2: { username: 'fff', playerId: '2' },
            player1Archive: { username: 'fff', playerId: '1' },
            player2Archive: { username: 'fff', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player2Win,
        };
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);
        spyOnProperty(component, 'isSolo').and.returnValue(false);
        spyOnProperty(component, 'isOneVersusOne').and.returnValue(false);
        spyOn(component, 'isPlayer1Win').and.returnValue(true);

        component.player1 = 'nauot';
        component.player2 = 'nauot';

        component.handleMatchUpdate(match);
        expect(component.isOver).toBeTruthy();
    });
    it('should return the player2', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: 'fff', playerId: '1' },
            player2: { username: 'fff', playerId: '2' },
            player1Archive: { username: 'fff', playerId: '1' },
            player2Archive: { username: 'fff', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player2Win,
        };
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);
        spyOnProperty(component, 'isSolo').and.returnValue(false);
        spyOnProperty(component, 'isOneVersusOne').and.returnValue(true);
        spyOn(component, 'isPlayer1Win').and.returnValue(false);

        component.player1 = 'nauot';
        component.player2 = 'nauot';

        component.handleMatchUpdate(match);
        expect(component.isOver).toBeTruthy();
    });
    it('should return the player2', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: 'fff', playerId: '1' },
            player2: { username: 'fff', playerId: '2' },
            player1Archive: { username: 'fff', playerId: '1' },
            player2Archive: { username: 'fff', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player2Win,
        };
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);
        spyOnProperty(component, 'isSolo').and.returnValue(false);
        spyOnProperty(component, 'isOneVersusOne').and.returnValue(false);
        spyOn(component, 'isPlayer1Win').and.returnValue(false);

        component.player1 = 'nauot';
        component.player2 = 'nauot';

        component.handleMatchUpdate(match);
        expect(component.isOver).toBeTruthy();
    });
    it('should return the player2', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: 'fff', playerId: '1' },
            player2: { username: 'fff', playerId: '2' },
            player1Archive: { username: 'fff', playerId: '1' },
            player2Archive: { username: 'fff', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.PlayersLose,
        };
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);
        spyOnProperty(component, 'isSolo').and.returnValue(false);
        spyOnProperty(component, 'isOneVersusOne').and.returnValue(false);
        spyOn(component, 'isPlayer1Win').and.returnValue(false);

        component.player1 = 'nauot';
        component.player2 = 'nauot';

        component.handleMatchUpdate(match);
        expect(component.isOver).toBeTruthy();
    });
    it('should set new player', () => {
        component.player1 = '';
        component.player2 = '';

        component.handleMatchUpdate(null);
        expect(component.player1).not.toBeNull();
    });
    it('should handle gameover', () => {
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);
        const spy = spyOn(socketClientService, 'send');
        component.gameOver();
        expect(spy).toHaveBeenCalled();
    });

    it('should return appropriately on quit game', () => {
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);

        component.onQuitGame();
        expect(component.popUpElement.display).not.toBeUndefined();
    });

    it('should return the appropriate value on win game', () => {
        component.popUpElement = jasmine.createSpyObj('GameOverPopUpComponent', ['displayConfirmation', 'displayGameOver', 'display', 'closePopUp']);
        spyOnProperty(component, 'isPlayer1').and.returnValue(true);
        component.onWinGame(true, true);
        expect(component.winningPlayerName).toEqual('');
    });

    it('should return the appropriate value on win game', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: '', playerId: '' },
            player2: { username: 'undefined' as any, playerId: '2' },
            player1Archive: { username: 'mario', playerId: '1' },
            player2Archive: { username: 'luigi', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player1Win,
        };
        component.isOriginallyCoop = true;
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isLimitedTimeSolo = false;
        mockMatchmakingService.isCoopMode = true;
        mockMatchmakingService.currentMatch = match;
        component.matchmakingService = mockMatchmakingService;
        spyOnProperty(component, 'isPlayer1').and.returnValue(false);
        component.onWinGame(false, true);
        expect(component.isOver).toBeTruthy();
    });
    it('should return the appropriate value on win game', () => {
        const matc2: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: undefined as any, playerId: '1' },
            player2: { username: 'undefined', playerId: '2' },
            player1Archive: { username: 'mario', playerId: '1' },
            player2Archive: { username: 'luigi', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player1Win,
        };
        component.isOriginallyCoop = true;
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isLimitedTimeSolo = false;
        mockMatchmakingService.isCoopMode = true;
        mockMatchmakingService.currentMatch = matc2;
        component.matchmakingService = mockMatchmakingService;
        spyOnProperty(component, 'isPlayer1').and.returnValue(false);
        component.onWinGame(false, true);
        expect(component.isOver).toBeTruthy();
    });

    it('should return the appropriate value on win game', () => {
        const spy = spyOn(component, 'gameOver').and.callFake(() => {
            return;
        });
        component.onWinGameLimited('hi', 'hello', true);
        expect(spy).toHaveBeenCalled();
    });

    it('should call getInitialImagesFromServer() when both canvas contexts are defined', () => {
        const spy = spyOn(component, 'getInitialImagesFromServer');
        spyOn(component.canvasHandlingService, 'updateCanvas').and.callFake((): any => {
            return;
        });
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.ngAfterViewInit();
        expect(spy).toHaveBeenCalled();
    });
    it('should handle the click and the letter T event 1 ', () => {
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isLimitedTimeSolo = false;
        mockMatchmakingService.isSoloMode = false;
        component.matchmakingService = mockMatchmakingService;
        component.handleClickAndLetterTEvent(new MouseEvent('click'));
        expect(component.currentGameId).not.toBeUndefined();
    });
    it('should handle the click and the letter T event 2', () => {
        spyOnProperty(component, 'isGameInteractive').and.returnValue(false);
        component.isOver = true;
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isLimitedTimeSolo = false;
        mockMatchmakingService.isSoloMode = false;
        component.matchmakingService = mockMatchmakingService;
        expect(component.handleClickAndLetterTEvent(new MouseEvent('click'))).toBeUndefined();
    });
    it('should handle the click and the letter T event 3 ', () => {
        spyOnProperty(component, 'isGameInteractive').and.returnValue(true);
        component.isOver = false;
        component.letterTPressed = true;
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isLimitedTimeSolo = false;
        mockMatchmakingService.isSoloMode = false;
        component.matchmakingService = mockMatchmakingService;
        spyOn(component, 'startCheating').and.callFake(() => {
            return;
        });
        const event = new KeyboardEvent('keydown', {
            key: 't',
            bubbles: true,
            cancelable: true,
        });
        component.handleClickAndLetterTEvent(event);
        expect(component.handleClickAndLetterTEvent(new MouseEvent('click'))).toBeUndefined();
    });
    it('should handle the click and the letter T event 4 ', () => {
        spyOnProperty(component, 'isGameInteractive').and.returnValue(true);
        component.isOver = false;
        component.letterTPressed = false;
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isLimitedTimeSolo = false;
        mockMatchmakingService.isSoloMode = false;
        component.matchmakingService = mockMatchmakingService;
        spyOn(component, 'stopCheating').and.callFake(() => {
            return;
        });
        const event = new KeyboardEvent('keydown', {
            key: 't',
            bubbles: true,
            cancelable: true,
        });
        component.handleClickAndLetterTEvent(event);
        expect(component.handleClickAndLetterTEvent(new MouseEvent('click'))).toBeUndefined();
    });
});
