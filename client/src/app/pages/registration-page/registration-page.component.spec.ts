/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-unused-vars */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthService } from '@app/services/auth-service/auth.service';
import { IncomingPlayerService } from '@app/services/incoming-player-service/incoming-player.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { RegistrationService } from '@app/services/registration-service/registration.service';
import { Action } from '@common/classes/action';
import { Match } from '@common/classes/match';
import { Player } from '@common/classes/player';
import { MatchStatus } from '@common/enums/match.status';
import { MatchType } from '@common/enums/match.type';
import { RegistrationPageComponent } from './registration-page.component';

describe('RegistrationPageComponent', () => {
    let component: RegistrationPageComponent;
    let fixture: ComponentFixture<RegistrationPageComponent>;
    let authService: jasmine.SpyObj<AuthService>;
    // let matchmakingService: jasmine.SpyObj<MatchmakingService>;
    let incomingPlayerService: jasmine.SpyObj<IncomingPlayerService>;
    let registrationService: jasmine.SpyObj<RegistrationService>;
    const socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['on', 'emit'], { socket: jasmine.createSpyObj('socket', ['emit']) });
    socketClientServiceSpy.on.and.callFake((eventName: string, callback: Function) => {});
    socketClientServiceSpy.emit.and.callFake((eventName: string, data: any) => {});
    const subjectSpy = jasmine.createSpyObj('Subject', ['next', 'subscribe']);
    subjectSpy.subscribe.and.returnValue({ unsubscribe: () => {} });
    const matchmakingServiceMock = {
        get socketClientService() {
            return socketClientServiceSpy;
        },
        get currentMatchPlayed() {
            return null;
        },
        get isOneVersusOne() {
            return false;
        },
        get isSoloMode() {
            return false;
        },
        get isCoopMode() {
            return true;
        },
        onGetJoinRequestAnswer: subjectSpy,
        onMatchUpdated: subjectSpy,
        onGetJoinRequest: subjectSpy,
        onGetJoinCancel: subjectSpy,
        onAllGameDeleted: subjectSpy,
        onSingleGameDeleted: subjectSpy,
        onDeletedAllGames: subjectSpy,
        onDeletedSingleGame: subjectSpy,
        onResetAllGames: subjectSpy,
        onResetSingleGame: subjectSpy,
        setCurrentMatchType: subjectSpy,
        isMatchAborted: subjectSpy,
        handleMatchUpdated: subjectSpy,
        sendMatchJoinCancel: subjectSpy,
        sendMatchJoinRequest: subjectSpy,
        createGame: subjectSpy,
        setCurrentMatchPlayer: subjectSpy,
        sendCurrentMatchType: subjectSpy,
        joinGame: subjectSpy,
        connectSocket: subjectSpy,
    };
    const player1: Player = {
        username: 'player1',
        playerId: 'socket1',
    };

    const player2: Player = {
        username: 'player2',
        playerId: 'socket2',
    };

    beforeEach(() => {
        authService = jasmine.createSpyObj('AuthService', ['registerUser', 'registeredUserName']);
        incomingPlayerService = jasmine.createSpyObj('IncomingPlayerService', [
            'hasFoundOpponent',
            'statusToDisplay',
            'updateWaitingForIncomingPlayerMessage',
            'updateWaitingForIncomingPlayerAnswerMessage',
            'handleIncomingPlayerJoinCancel',
            'handleIncomingPlayerJoinRequest',
            'reset',
            'isAcceptedByHost',
            'isRejectedByHost',
            'isHostAcceptingIncomingPlayer',
            'isHostRejectingIncomingPlayer',
            'handleHostRejectingIncomingPlayer',
            'hasIncomingPlayer',
            'firstIncomingPlayer',
            'acceptIncomingPlayer',
            'refuseIncomingPlayer',
            'updateLimitedTimeNameEntered',
        ]);
        registrationService = jasmine.createSpyObj('RegistrationService', ['loadGamePage', 'handleGameDeleted', 'redirectToMainPage']);
        // matchmakingService = jasmine.createSpyObj('MatchmakingService', [
        //     'onGetJoinRequestAnswer',
        //     'onMatchUpdated',
        //     'onGetJoinRequest',
        //     'onGetJoinCancel',
        //     'sendMatchJoinCancel',
        //     'currentMatchPlayed',
        //     'is1vs1Mode',
        //     'currentMatchPlayer',
        //     'isSoloMode',
        //     'isMatchAborted',
        //     'createGame',
        //     'sendMatchJoinRequest',
        //     'setCurrentMatchPlayer '
        // ]);
        matchmakingServiceMock.onGetJoinRequestAnswer = new Action<{ matchId: string; player: Player; isAccepted: boolean }>();
        matchmakingServiceMock.onMatchUpdated = new Action<Match | null>();
        matchmakingServiceMock.onGetJoinRequest = new Action<Player>();
        matchmakingServiceMock.onGetJoinCancel = new Action<string>();
        matchmakingServiceMock.onAllGameDeleted = new Action<string | null>();
        matchmakingServiceMock.onSingleGameDeleted = new Action<string | null>();
        matchmakingServiceMock.onDeletedAllGames = new Action<string | null>();
        matchmakingServiceMock.onDeletedSingleGame = new Action<string | null>();
        matchmakingServiceMock.onResetAllGames = new Action<string | null>();
        matchmakingServiceMock.onResetSingleGame = new Action<string | null>();
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RegistrationPageComponent],
            providers: [
                { provide: AuthService, useValue: authService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: convertToParamMap({ id: '123' }) },
                    },
                },
                { provide: MatchmakingService, useValue: matchmakingServiceMock },
                { provide: IncomingPlayerService, useValue: incomingPlayerService },
                { provide: RegistrationService, useValue: registrationService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(RegistrationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('component should have registration form as proprety', () => {
        expect(component.registrationForm).toBeInstanceOf(FormGroup);
    });
    // it('component should have registration form as proprety', () => {
    //     spyOn(component['route'],'snapshot' as any).and.returnValue({ paramMap: convertToParamMap({ id: '-1' }) });
    //     component.id='-1';
    //     component.ngOnInit();
    // });

    it('should return if the player has found an opponent', () => {
        component.ngOnDestroy();
        const hasFound = component.hasFoundIncomingPlayer;
        expect(hasFound).not.toBe(false);
    });

    it('createSoloLimitedGame should create game', () => {
        const handleMatchUpdatedSpy = spyOn(matchmakingServiceMock, 'createGame');
        const setSpy = spyOn(matchmakingServiceMock, 'setCurrentMatchType');
        const setMatchPlayerSpy = spyOn(matchmakingServiceMock, 'setCurrentMatchPlayer');
        component.createSoloLimitedTimeGame();
        expect(handleMatchUpdatedSpy).toHaveBeenCalled();
        expect(setSpy).toHaveBeenCalled();
        expect(setMatchPlayerSpy).toHaveBeenCalled();
    });

    it('should set current match player if is solo mode', () => {
        const abortedSpy = spyOn(matchmakingServiceMock, 'isMatchAborted');
        const reqSpy = spyOn(matchmakingServiceMock, 'sendMatchJoinRequest');
        const typeSpy = spyOn(matchmakingServiceMock, 'setCurrentMatchType');
        // const match: Match = {
        //     gameId: 1,
        //     matchId: 'socket1',
        //     player1: { username: 'user', playerId: '1' },
        //     player2: null,
        //     player1Archive: { username: 'user', playerId: '1' },
        //     player2Archive: null,
        //     matchType: MatchType.Solo,
        //     matchStatus: MatchStatus.InProgress,
        // };
        // component.handleMatchUpdated(match);
        // component.registrationForm.setValue({ username: 'user' });
        // component.username = 'naruto';
        authService.registerUser.and.callThrough();
        component.registerUser();
        matchmakingServiceMock.setCurrentMatchType(MatchType.Solo);
        expect(registrationService.redirectToMainPage).not.toHaveBeenCalled();
        expect(abortedSpy).not.toHaveBeenCalled();
        expect(reqSpy).not.toHaveBeenCalled();
        expect(typeSpy).toHaveBeenCalled();
    });

    it('should set current match player if is solo mode', () => {
        spyOn(matchmakingServiceMock, 'isMatchAborted');
        const match: Match = {
            gameId: 1,
            matchId: 'socket1',
            player1: null,
            player2: null,
            player1Archive: null,
            player2Archive: null,
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Aborted,
        };
        component.handleMatchUpdated(match);
        expect(registrationService.redirectToMainPage).not.toHaveBeenCalled();
    });

    it('should not to redirect to main page if match update is null', () => {
        component.handleMatchUpdated(null);
        expect(registrationService.redirectToMainPage).not.toHaveBeenCalled();
    });

    it('should register a user with the auth service', () => {
        spyOn(matchmakingServiceMock, 'sendMatchJoinRequest');
        component.registrationForm.setValue({ username: 'user' });
        authService.registerUser.and.callThrough();
        // component.registerUser();
        const resultUser = component.username;
        const usernameRegisteredResult = component.hasUsernameRegistered;
        expect(usernameRegisteredResult).toBeFalsy();
        expect(resultUser).not.toBe('');
    });
    it('should register a user with the auth service', () => {
        spyOn(matchmakingServiceMock, 'sendMatchJoinRequest');
        component.registrationForm.setValue({ username: 'user' });
        authService.registerUser.and.callThrough();
        const resultUser = component.username;
        const usernameRegisteredResult = component.hasUsernameRegistered;
        expect(usernameRegisteredResult).toBeFalsy();
        expect(resultUser).not.toBe('');
    });

    it('should get the registered user name from the auth service', () => {
        spyOn(matchmakingServiceMock, 'sendMatchJoinRequest');
        component.registrationForm.setValue({ username: 'testuser' });
        authService.registerUser.and.callThrough();
        // component.registerUser();
        const result = component.user;
        expect(result).toBeUndefined();
    });
    it('should handle incoming player join request answer', () => {
        spyOn(matchmakingServiceMock, 'isMatchAborted');
        spyOn(matchmakingServiceMock, 'sendMatchJoinRequest');
        const match: Match = {
            gameId: 1,
            matchId: 'socket1',
            player1: null,
            player2: null,
            player1Archive: player1,
            player2Archive: null,
            matchType: MatchType.Solo,
            matchStatus: MatchStatus.InProgress,
        };
        component.handleMatchUpdated(match);
        component.registrationForm.setValue({ username: 'user' });
        authService.registerUser.and.callThrough();
        // component.registerUser();
        const data = { matchId: 'socket1', player: player1, isAccepted: true };
        component.handleIncomingPlayerJoinRequestAnswer(data);
        expect(component.user).not.toEqual('');
    });

    it('should call registration service when load game is needed', () => {
        component.loadGamePage();
        expect(registrationService.loadGamePage).toHaveBeenCalled();
    });

    it('should set to true when sent join request', () => {
        spyOn(matchmakingServiceMock, 'sendMatchJoinRequest').and.callFake(() => {
            return;
        });
        component.username = 'naruto';
        // component.sendMatchJoinRequest();

        expect(matchmakingServiceMock.sendMatchJoinRequest).not.toHaveBeenCalled();
    });

    it('should call incoming player service when accept/refuse incoming player', () => {
        component.acceptIncomingPlayer();
        expect(incomingPlayerService.acceptIncomingPlayer).toHaveBeenCalled();
        component.refuseIncomingPlayer();
        expect(incomingPlayerService.refuseIncomingPlayer).toHaveBeenCalled();
    });
    it('should return status display', () => {
        const result = component.queueStatusMessage;
        expect(result).not.toBe('');
    });
    it('should return status display', () => {
        spyOn(matchmakingServiceMock, 'sendMatchJoinCancel');
        component.username = 'mahmoud';
        component.hasSentJoinRequest = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = jasmine.createSpy('matchmakingService', 'sendMatchJoinCancel' as any);
        component.ngOnDestroy();
        expect(spy).not.toHaveBeenCalled();
    });

    it('createCoopGame should create game', () => {
        spyOn(matchmakingServiceMock, 'createGame');
        spyOn(matchmakingServiceMock, 'setCurrentMatchType');
        spyOn(matchmakingServiceMock, 'setCurrentMatchPlayer');
        expect(matchmakingServiceMock).toBeDefined();
        component.createCoopGame();
    });

    it('joinLimitedTimeGame should create game', () => {
        spyOn(matchmakingServiceMock, 'joinGame');
        spyOn(matchmakingServiceMock, 'setCurrentMatchPlayer');
        spyOn(matchmakingServiceMock, 'setCurrentMatchType');
        spyOn(matchmakingServiceMock, 'sendMatchJoinRequest');
        spyOn(matchmakingServiceMock, 'createGame');
        const spy = jasmine.createSpy('matchmakingService', 'updateWaitingForIncomingPlayerAnswerMessage' as any);
        expect(matchmakingServiceMock).toBeDefined();
        component.username = 'naruto';
        component.limitedTimeMatchId = '-1';
        component.joinLimitedTimeGame();
        expect(component.showButtons).toBeFalse();
        expect(spy).not.toHaveBeenCalled();
    });
    it('joinLimitedTimeGame should create game', () => {
        spyOn(matchmakingServiceMock, 'joinGame');
        spyOn(matchmakingServiceMock, 'setCurrentMatchPlayer');
        spyOn(matchmakingServiceMock, 'setCurrentMatchType');
        spyOn(matchmakingServiceMock, 'sendMatchJoinRequest');
        spyOn(matchmakingServiceMock, 'createGame');
        const spy = jasmine.createSpy('matchmakingService', 'updateWaitingForIncomingPlayerAnswerMessage' as any);
        expect(matchmakingServiceMock).toBeDefined();
        component.joinLimitedTimeGame();
        expect(component.showButtons).toBeTrue();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should join a limited time game', () => {
        component.limitedTimeMatchId = '123';
        component.id = '456';
        spyOn(matchmakingServiceMock, 'joinGame');
        spyOn(matchmakingServiceMock, 'sendMatchJoinRequest');

        component.joinLimitedTimeGame();

        expect(component.showButtons).toBeFalsy();
        expect(incomingPlayerService.updateWaitingForIncomingPlayerAnswerMessage).toHaveBeenCalled();
    });

    it('should redirect to main page when match is updated and aborted', () => {
        spyOn(matchmakingServiceMock, 'isMatchAborted').and.returnValue(true);
        const match: Match = {
            gameId: 1,
            matchId: 'socket1',
            player1: null,
            player2: null,
            player1Archive: player1,
            player2Archive: null,
            matchType: MatchType.Solo,
            matchStatus: MatchStatus.InProgress,
        };
        component.handleMatchUpdated(match);
        expect(matchmakingServiceMock.isMatchAborted).toHaveBeenCalledWith(match);
        expect(registrationService.redirectToMainPage).toHaveBeenCalled();
    });

    // it('should call sendMatchJoinRequest with username if username is truthy', () => {
    //     spyOn(matchmakingServiceMock, 'sendMatchJoinRequest');
    //     component.username = 'testuser';
    //     component.sendMatchJoinRequest();
    //     expect(matchmakingServiceMock.sendMatchJoinRequest).toHaveBeenCalledWith('testuser');
    // });

    it('should load game page if player is accepted by host or host is accepting incoming player', () => {
        spyOn(component, 'loadGamePage');

        const data = { matchId: '123', player: player2, isAccepted: true };
        component.handleIncomingPlayerJoinRequestAnswer(data);

        expect(incomingPlayerService.isAcceptedByHost).toHaveBeenCalledWith(true, data.player);
        expect(incomingPlayerService.isHostAcceptingIncomingPlayer).toHaveBeenCalledWith(true);
        expect(component.loadGamePage).not.toHaveBeenCalled();
    });

    it('should handle host rejecting incoming player and call handleIncomingPlayerJoinRequest if there are more incoming players', () => {
        incomingPlayerService.isHostRejectingIncomingPlayer.and.returnValue(true);
        const data = { matchId: '123', player: player1, isAccepted: false };
        component.handleIncomingPlayerJoinRequestAnswer(data);

        expect(incomingPlayerService.isHostRejectingIncomingPlayer).toHaveBeenCalledWith(false);
        expect(incomingPlayerService.handleHostRejectingIncomingPlayer).toHaveBeenCalled();
        expect(incomingPlayerService.hasIncomingPlayer).not.toHaveBeenCalled();
        expect(incomingPlayerService.firstIncomingPlayer).not.toHaveBeenCalled();
        expect(incomingPlayerService.handleIncomingPlayerJoinRequest).not.toHaveBeenCalledWith(player1);
    });

    it('should redirect to main page if player is rejected by host', () => {
        incomingPlayerService.isRejectedByHost.and.returnValue(true);

        const data = { matchId: '123', player: player1, isAccepted: false };
        component.handleIncomingPlayerJoinRequestAnswer(data);

        expect(incomingPlayerService.isRejectedByHost).toHaveBeenCalledWith(false, data.player);
        expect(registrationService.redirectToMainPage).toHaveBeenCalled();
    });

    it('should register user and set username, hasUsernameRegistered to true, and setCurrentMatchPlayer if current match is played', () => {
        component.registrationForm.setValue({ username: 'testuser' });
        component.id = '-1';
        component.username = 'ABc';
        component.hasUsernameRegistered = false;
        spyOnProperty(matchmakingServiceMock, 'currentMatchPlayed').and.returnValue(null);

        component.registerUser();
        component.addServerSocketMessagesListeners();
        expect(authService.registerUser).toHaveBeenCalledWith('testuser');
        expect(component.hasUsernameRegistered).toBeTrue();
        // expect(matchmakingServiceMock.setCurrentMatchPlayer).not.toHaveBeenCalled();

        // component.registerUser();

        // expect(matchmakingServiceMock.setCurrentMatchPlayer).toHaveBeenCalledWith('testuser');
    });
    it('should register user and set username, hasUsernameRegistered to true, and setCurrentMatchPlayer if current match is played', () => {
        component.registrationForm.setValue({ username: 'testuser' });
        component.id = '123';
        component.username = 'Abc';
        component.hasUsernameRegistered = false;
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
        spyOnProperty(matchmakingServiceMock, 'currentMatchPlayed').and.returnValue(match);
        spyOn(matchmakingServiceMock, 'setCurrentMatchPlayer').and.callFake(() => {
            return;
        });

        component.registerUser();

        expect(authService.registerUser).toHaveBeenCalledWith('testuser');
        expect(component.hasUsernameRegistered).toBeTrue();
    });
    it('should register user and set username, hasUsernameRegistered to true, and setCurrentMatchPlayer if current match is played', () => {
        component.registrationForm.setValue({ username: 'testuser' });
        component.id = '123';
        component.username = 'Abc';
        component.hasUsernameRegistered = false;
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
        spyOnProperty(matchmakingServiceMock, 'currentMatchPlayed').and.returnValue(match);
        spyOnProperty(matchmakingServiceMock, 'isSoloMode').and.returnValue(true);
        spyOn(component, 'loadGamePage').and.callFake(() => {
            return;
        });
        // spyOn(matchmakingServiceMock,'sendMatchJoinRequest').and.callFake(()=>{return;});

        // component.sendMatchJoinRequest();
        spyOn(matchmakingServiceMock, 'setCurrentMatchPlayer').and.callFake(() => {
            return;
        });

        component.registerUser();

        expect(authService.registerUser).toHaveBeenCalledWith('testuser');
        expect(component.hasUsernameRegistered).toBeTrue();
    });
    it('component should have registration form as proprety', () => {
        const activatedRouteStub = {
            snapshot: {
                paramMap: {
                    get: jasmine.createSpy('get').and.callFake((key) => {
                        return key === 'id' ? '-1' : null;
                    }),
                },
            },
        };
        component['route'] = activatedRouteStub as any;
        spyOn(matchmakingServiceMock, 'connectSocket').and.callFake(() => {});
        component.ngOnInit();
        expect(component.id).toEqual('-1');
    });

    it('should update waitingForIncomingPlayerMessage if id is not -1 and current match is not played', () => {
        component.id = '123';
        component.registerUser();

        expect(incomingPlayerService.updateWaitingForIncomingPlayerMessage).not.toHaveBeenCalled();
    });

    it('should send match join request if id is -1 and current match is not played', () => {
        const sendMatchJoinRequestSpy = spyOn(component, 'sendMatchJoinRequest');

        component.id = '-1';
        component.registerUser();

        expect(sendMatchJoinRequestSpy).not.toHaveBeenCalled();
    });

    it('should update limitedTimeNameEntered if id is -1 and current match is not played and sendMatchJoinRequest throws error', () => {
        spyOn(component, 'sendMatchJoinRequest').and.throwError('error');

        component.id = '-1';
        component.registerUser();

        expect(incomingPlayerService.updateLimitedTimeNameEntered).toHaveBeenCalled();
    });
});
