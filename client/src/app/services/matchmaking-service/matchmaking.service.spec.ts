/* eslint-disable prettier/prettier */
/* eslint-disable max-lines */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { Action } from '@common/classes/action';
import { Match } from '@common/classes/match';
import { Player } from '@common/classes/player';
import { MatchStatus } from '@common/enums/match.status';
import { MatchType } from '@common/enums/match.type';
import { Socket } from 'socket.io-client';
import { MatchmakingService } from './matchmaking.service';

class SocketClientServiceMock extends SocketClientService {
    override get isSocketAlive() {
        return true;
    }
    override connect() {}
}

describe('MatchmakingService', () => {
    let matchmakingService: MatchmakingService;
    let socketClientService: SocketClientService;
    let socketTestHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;

    const player1: Player = {
        username: 'player1',
        playerId: 'socket1',
    };

    const player2: Player = {
        username: 'player2',
        playerId: 'socket2',
    };

    const matchId = 'socket1';
    const gameId = '1';

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketTestHelper as unknown as Socket;
        socketServiceMock.send = jasmine.createSpy('send');
        socketClientService = jasmine.createSpyObj('SocketClientService', ['isSocketAlive', 'connect', 'on', 'disconnect', 'send', 'socket'], {
            socket: { id: matchId },
            socketId: matchId,
        });

        TestBed.configureTestingModule({
            providers: [MatchmakingService, { provide: SocketClientService, useValue: socketServiceMock }],
        });
        matchmakingService = TestBed.inject(MatchmakingService);
        matchmakingService.connectSocket();
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: 'hallo', playerId: '1' },
            player2: { username: 'hallo', playerId: '1' },
            player1Archive: { username: 'fff', playerId: '1' },
            player2Archive: { username: 'fff', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player2Win,
        };
        matchmakingService.currentMatch = match;
    });

    it('should create matchmaking service', () => {
        expect(matchmakingService).toBeTruthy();
    });

    it('should return create game and set currentMatch', () => {
        const match: Match = new Match(1, '');
        matchmakingService.createGame(gameId);
        expect(matchmakingService.currentMatchPlayed).toEqual(match);
    });

    it('should disconnect socket if socket is alive', () => {
        matchmakingService.connectSocket();
        expect(matchmakingService.socketClientService.socket).toBeDefined();
    });
    it('should return a access to socketService', () => {
        const service = matchmakingService.socketClientService;
        expect(service).not.toBeUndefined();
    });
    it('should return the id of the game', () => {
        const service = matchmakingService.currentGameId;
        expect(service).toEqual('0');
    });
    it('should return null if the gameId is null', () => {
        matchmakingService.currentMatch = null;
        const service = matchmakingService.currentGameId;
        expect(service).toEqual(undefined);
    });
    it('should return if the player is the first player or not', () => {
        const service = matchmakingService.isPlayer1;
        expect(service).toEqual(false);
    });

    it('should set match player', () => {
        const sendSocketSpy = (<jasmine.Spy>socketServiceMock.send).and.returnValue(Promise.resolve());
        matchmakingService.createGame(gameId);
        matchmakingService.setCurrentMatchPlayer(player1.username);
        expect(sendSocketSpy).toHaveBeenCalledTimes(2);
    });

    it('should call handle update match when set match player is called', () => {
        const sendSocketSpy = (<jasmine.Spy>socketServiceMock.send).and.returnValue(Promise.resolve());
        matchmakingService.createGame(gameId);
        spyOn(matchmakingService.onMatchUpdated, 'invoke');
        matchmakingService.setCurrentMatchPlayer(player1.username);
        expect(sendSocketSpy).toHaveBeenCalledTimes(2);
    });

    it('should set the given match to the current match', () => {
        const match: Match = {
            gameId: 1,
            matchId: 'socket1',
            player1,
            player2,
            player1Archive: player1,
            player2Archive: player2,
            matchStatus: MatchStatus.InProgress,
            matchType: MatchType.OneVersusOne,
        };
        matchmakingService.currentMatchGame = match;
        expect(matchmakingService.currentMatch).toEqual(match);
    });

    it('should set current match type', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.setCurrentMatchType(MatchType.OneVersusOne);
        expect(matchmakingService.currentMatchId).toEqual('');
    });

    it('should disconnect socket and reset all the service variables', () => {
        matchmakingService.disconnectSocket();
        expect(matchmakingService.currentMatchPlayed).toEqual(null);
        expect(matchmakingService.onMatchUpdated).toEqual(new Action<Match | null>());
        expect(matchmakingService.onGetJoinRequest).toEqual(new Action<Player>());
        expect(matchmakingService.onGetJoinCancel).toEqual(new Action<string>());
        expect(matchmakingService.onAllGameDeleted).toEqual(new Action<string | null>());
        expect(matchmakingService.onSingleGameDeleted).toEqual(new Action<string | null>());
        expect(matchmakingService.isHost).toBe(true);
    });

    it('should join game when called', () => {
        (<jasmine.Spy>socketServiceMock.send).and.returnValue(Promise.resolve());
        matchmakingService.createGame(gameId);
        expect(<jasmine.Spy>socketServiceMock.send).toHaveBeenCalled();
    });

    it('should connect sockets and handle match update events when called', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.handleMatchUpdateEvents();
        expect(matchmakingService.matchIdThatWeAreTryingToJoin).toBeNull();
    });

    it('should send match join request when request from incoming player', () => {
        matchmakingService.joinGame(matchId, gameId);
        matchmakingService.sendMatchJoinRequest(player2.username);
        expect(matchmakingService.currentMatch).toBeNull();
    });

    it('should return true when is player 1', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.setCurrentMatchPlayer(player1.username);
        expect(matchmakingService.player1Id).toBeUndefined();
    });

    it('should send match join cancel request', () => {
        const callback = ((params: any) => {}) as any;
        const sendSocketSpy = (<jasmine.Spy>socketServiceMock.send).and.returnValue(Promise.resolve());
        socketTestHelper.on('incomingPlayerCancel', callback);
        socketTestHelper.peerSideEmit('incomingPlayerCancel', 'socket2');
        matchmakingService.joinGame(matchId, gameId);
        matchmakingService.sendMatchJoinCancel(player2.username);
        matchmakingService.handleMatchUpdateEvents();
        expect(sendSocketSpy).toHaveBeenCalled();
        expect(socketClientService.send).not.toHaveBeenCalled();
    });

    it('should send incoming player request answer', () => {
        matchmakingService.createGame(gameId);
        const sendSocketSpy = (<jasmine.Spy>socketServiceMock.send).and.returnValue(Promise.resolve());
        matchmakingService.sendIncomingPlayerRequestAnswer(player2, true);
        matchmakingService.handleMatchUpdateEvents();
        expect(sendSocketSpy).toHaveBeenCalled();
    });

    it('should not send incoming player request answer if current match is null', () => {
        const expectedError = new Error('currentMatch is null');
        matchmakingService.joinGame(matchId, gameId);
        matchmakingService.sendMatchJoinRequest(player2.username);
        try {
            matchmakingService.sendIncomingPlayerRequestAnswer(player2, true);
        } catch (e: unknown) {
            expect(e).toEqual(expectedError);
        }
    });

    it('should return the current match as a solo mode', () => {
        matchmakingService.currentMatch = null;

        expect(matchmakingService.isOneVersusOne).toBeFalsy();
    });
    it('should return the current match as a solo mode', () => {
        expect(matchmakingService.isOneVersusOne).toBeTruthy();
    });

    it('should return the current match as a coop mode', () => {
        matchmakingService.currentMatch = null;

        expect(matchmakingService.isCoopMode).toBeFalsy();
    });
    it('should return the current match as a coop mode', () => {
        const match: Match = {
            gameId: 1,
            matchId: 'socket1',
            player1,
            player2,
            player1Archive: player1,
            player2Archive: player2,
            matchStatus: MatchStatus.InProgress,
            matchType: MatchType.LimitedCoop,
        };
        matchmakingService.currentMatchGame = match;
        expect(matchmakingService.isCoopMode).toBeTruthy();
    });
    it('should return the current match as a solo mode L-T', () => {
        matchmakingService.currentMatch = null;

        expect(matchmakingService.isLimitedTimeSolo).toBeFalsy();
    });
    it('should return the current match aa solo mode L-T', () => {
        const match: Match = {
            gameId: 1,
            matchId: 'socket1',
            player1,
            player2,
            player1Archive: player1,
            player2Archive: player2,
            matchStatus: MatchStatus.InProgress,
            matchType: MatchType.LimitedSolo,
        };
        matchmakingService.currentMatchGame = match;
        expect(matchmakingService.isLimitedTimeSolo).toBeTruthy();
    });
    it('should return the current match as a solo mode ', () => {
        matchmakingService.currentMatch = null;

        expect(matchmakingService.isSoloMode).toBeFalsy();
    });

    it('should return the matchId', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.setCurrentMatchPlayer(player1.username);
        expect(matchmakingService.currentMatchId).toEqual('');
    });
    it('should return undefined when currentMatch or player1 are undefined', () => {
        matchmakingService.currentMatch = null;
        const result = matchmakingService.player1Id;
        expect(result).toBeUndefined();
    });
    it('should return undefined when  player1 are undefined', () => {
        matchmakingService.currentMatch = null;
        const result = matchmakingService.player1;
        expect(result).toBeUndefined();
    });
    it('should return undefined when player2 are undefined', () => {
        matchmakingService.currentMatch = null;
        const result = matchmakingService.player2;
        expect(result).toBeUndefined();
    });
    it('should return undefined when player2 are undefined', () => {
        expect(matchmakingService.player2).toEqual({ username: 'hallo', playerId: '1' });
        expect(matchmakingService.player1).toEqual({ username: 'hallo', playerId: '1' });
    });
    it('handleMatchUpdate should send update the currentMatch', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: 'hallo', playerId: '1' },
            player2: { username: 'hallo', playerId: '1' },
            player1Archive: { username: 'fff', playerId: '1' },
            player2Archive: { username: 'fff', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player2Win,
        };

        matchmakingService.handleMatchUpdateEvents();
        const callback = ((params: any) => {}) as any;
        const data = match;
        socketTestHelper.on('matchUpdated', callback);
        socketTestHelper.peerSideEmit('matchUpdated', data);
        expect(matchmakingService.currentMatch).toEqual(match);
    });
    it('handleMatchUpdate should send update the currentMatch', () => {
        const player: Player = {
            username: 'hallo',
            playerId: '1',
        };

        matchmakingService.handleMatchUpdateEvents();
        const callback = ((params: any) => {}) as any;
        const data = player;
        socketTestHelper.on('incomingPlayerRequest', callback);
        socketTestHelper.peerSideEmit('incomingPlayerRequest', data);
        expect(matchmakingService.onGetJoinRequest).toBeDefined();
    });
    it('handleMatchUpdate should send update the currentMatch', () => {
        matchmakingService.handleMatchUpdateEvents();
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('allGamesDeleted', callback);
        socketTestHelper.peerSideEmit('allGamesDeleted');
        expect(matchmakingService.onAllGameDeleted).toBeDefined();
    });
    it('handleMatchUpdate should send update the currentMatch', () => {
        const data = { hasResetGame: true, id: '1' };

        matchmakingService.handleMatchUpdateEvents();
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('gameReset', callback);
        socketTestHelper.peerSideEmit('gameReset', data);
        expect(matchmakingService.onResetSingleGame).toBeDefined();
    });
    it('handleMatchUpdate should send update the currentMatch', () => {
        const data = { hasDeletedGame: true, id: '1' };

        matchmakingService.handleMatchUpdateEvents();
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('gameDeleted', callback);
        socketTestHelper.peerSideEmit('gameDeleted', data);
        expect(matchmakingService.onDeletedSingleGame).toBeDefined();
    });
    it('handleMatchUpdate should send update the currentMatch', () => {
        matchmakingService.handleMatchUpdateEvents();
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('allGamesReset', callback);
        socketTestHelper.peerSideEmit('allGamesReset');
        expect(matchmakingService.onResetAllGames).toBeDefined();
    });
    it('should return username 1 and 2', () => {
        const match: Match = {
            gameId: 0,
            matchId: '',
            player1: { username: null as any, playerId: '1' },
            player2: { username: null as any, playerId: '1' },
            player1Archive: { username: 'fff', playerId: '1' },
            player2Archive: { username: 'fff', playerId: '2' },
            matchType: MatchType.OneVersusOne,
            matchStatus: MatchStatus.Player2Win,
        };
        matchmakingService.currentMatchGame = match;
        expect(matchmakingService.player1Username).toBe(null as any);
        expect(matchmakingService.player2Username).toBe(null as any);
    });
    it('should return empty string if match is null', () => {
        matchmakingService.joinGame(matchId, gameId);
        expect(matchmakingService.currentMatchId).toEqual(undefined as any);
        expect(matchmakingService.player2Username).toEqual(undefined as any);
        expect(matchmakingService.player1Username).toEqual(undefined as any);
    });

    it('should return true when is solo mode', () => {
        matchmakingService.createGame(gameId);
        matchmakingService.setCurrentMatchType(MatchType.Solo);
        expect(matchmakingService.isOneVersusOne).toEqual(false);
    });

    it('should return the player 2 username', () => {
        expect(matchmakingService.isOneVersusOne).toEqual(true);
    });

    it('should handle when all games are deleted ', () => {
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('allGameDeleted', callback);
        socketTestHelper.peerSideEmit('deleteAllGames');
        matchmakingService.handleMatchUpdateEvents();
        expect(matchmakingService.onAllGameDeleted).toBeDefined();

    });

    it('should handle update match ', () => {
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('matchUpdated', callback);
        socketTestHelper.peerSideEmit('matchUpdated', 'socket2');
        matchmakingService.handleMatchUpdateEvents();
        expect(matchmakingService.onMatchUpdated).toBeDefined();
    });

    it('should handle incomingPlayerRequest answer', () => {
        const data = { matchId: 'socket1', player: player1, isAccepted: true };
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('incomingPlayerRequestAnswer', callback);
        socketTestHelper.peerSideEmit('incomingPlayerRequestAnswer', data);
        matchmakingService.handleMatchUpdateEvents();
        expect(matchmakingService.onGetJoinRequestAnswer).toBeDefined();
    });

    it('should handle when a game is deleted', () => {
        const data = { hasDeleteGame: true, id: '1' };
        const callback = ((params: any) => {}) as any;
        socketTestHelper.on('gameDeleted', callback);
        socketTestHelper.peerSideEmit('deletedGame', data);
        matchmakingService.handleMatchUpdateEvents();
        expect(matchmakingService.onDeletedSingleGame).toBeDefined();
    });

    it('should return false if match status is not aborted', () => {
        matchmakingService.createGame(gameId);
        const expectedCurrentMatch: Match = new Match(1, matchId);
        expect(matchmakingService.isMatchAborted(expectedCurrentMatch)).toBe(false);
    });

    it('should return false if match is one versus one', () => {
        matchmakingService.createGame(gameId);
        expect(matchmakingService.isSoloMode).toBe(false);
    });
    it('should not set current player when current match is null', () => {
        const expectedError = new Error('currentMatch is null');
        matchmakingService.joinGame(matchId, gameId);
        try {
            matchmakingService.setCurrentMatchPlayer(player1.username as string);
        } catch (e: unknown) {
            expect(e).toEqual(expectedError);
        }
    });

    it('should not send match join request when current match is null', () => {
        const expectedError = new Error('matchIdThatWeAreTryingToJoin is null');
        matchmakingService.createGame(gameId);
        try {
            matchmakingService.sendMatchJoinRequest('player1');
        } catch (e: unknown) {
            expect(e).toEqual(expectedError);
        }
    });

    it('should not send match join cancel when current match is null', () => {
        const expectedError = new Error('matchIdThatWeAreTryingToJoin is null');
        matchmakingService.createGame(gameId);
        try {
            matchmakingService.sendMatchJoinCancel('player1');
        } catch (e: unknown) {
            expect(e).toEqual(expectedError);
        }
    });
});
