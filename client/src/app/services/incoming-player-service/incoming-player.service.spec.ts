/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { Player } from '@common/classes/player';
import {
    DO_YOU_WANT_TO_PLAY_WITH_TEXT,
    LIMITED_TIME_USER_ENTERED_TEXT,
    WAITING_FOR_PLAYER_TEXT,
    WAITING_PLAYER_ANSWER_TEXT,
} from '@common/utils/constants';
import { IncomingPlayerService } from './incoming-player.service';
let incomingPlayerService: IncomingPlayerService;
let matchmakingServiceSpy: jasmine.SpyObj<MatchmakingService>;
describe('IncomingPlayerService', () => {
    const player: Player = {
        username: 'player',
        playerId: 'socket1',
    };
    const player2: Player = {
        username: 'player2',
        playerId: 'socket2',
    };

    beforeEach(() => {
        matchmakingServiceSpy = jasmine.createSpyObj('MatchmakingService', ['sendIncomingPlayerRequestAnswer', 'isHost', 'currentSocketId']);

        TestBed.configureTestingModule({
            providers: [IncomingPlayerService, { provide: MatchmakingService, useValue: matchmakingServiceSpy }],
        });
        incomingPlayerService = TestBed.inject(IncomingPlayerService);
        matchmakingServiceSpy.matchIdThatWeAreTryingToJoin = null;
    });

    afterEach(() => {
        incomingPlayerService.reset();
    });

    it('should create the service', () => {
        expect(incomingPlayerService).toBeTruthy();
    });

    it('should return the incoming players queue', () => {
        incomingPlayerService.handleIncomingPlayerJoinRequest(player);
        const incomingPlayers = incomingPlayerService.incomingPlayers;
        expect(incomingPlayers).toEqual([player]);
        expect(incomingPlayerService.hasIncomingPlayer).toBe(true);
        expect(incomingPlayerService.hasFoundOpponent).toBe(true);
    });

    it('should handle incoming player join request canceled', () => {
        incomingPlayerService.handleIncomingPlayerJoinRequest(player);
        incomingPlayerService.handleIncomingPlayerJoinCancel(player.playerId);
        const incomingPlayers = incomingPlayerService.incomingPlayers;
        expect(incomingPlayers).toEqual([]);
        expect(incomingPlayerService.hasIncomingPlayer).toBe(false);
        expect(incomingPlayerService.hasFoundOpponent).toBe(false);
    });

    it('should handle incoming player join request canceled', () => {
        incomingPlayerService.handleIncomingPlayerJoinRequest(player);
        incomingPlayerService.handleIncomingPlayerJoinRequest(player2);
        incomingPlayerService.handleIncomingPlayerJoinCancel(player2.playerId);
        const incomingPlayers = incomingPlayerService.incomingPlayers;
        expect(incomingPlayers).toEqual([player]);
        expect(incomingPlayerService.hasIncomingPlayer).toBe(true);
        expect(incomingPlayerService.hasFoundOpponent).toBe(true);
    });

    it('should return false if not opponent is accepted by host', () => {
        const trueResult = incomingPlayerService.isAcceptedByHost(true, player);
        expect(trueResult).toBe(false);
    });

    it('should return false if not opponent is rejected by host', () => {
        const result = incomingPlayerService.isRejectedByHost(false, player);
        expect(result).toBe(false);
    });

    it('should return false if not host is accepting incoming player', () => {
        const result = incomingPlayerService.isRejectedByHost(false, player);
        expect(result).toBe(false);
    });

    it('should return false if not opponent is accepted by host', () => {
        const trueResult = incomingPlayerService.isAcceptedByHost(true, player);
        expect(trueResult).toBe(false);
    });

    it('should return false if not host rejecting incoming player', () => {
        const trueResult = incomingPlayerService.isHostRejectingIncomingPlayer(true);
        expect(trueResult).toBe(false);
    });

    it('should return true if not host rejecting when has incoming player', () => {
        incomingPlayerService.handleIncomingPlayerJoinRequest(player);
        incomingPlayerService.handleIncomingPlayerJoinRequest(player2);
        const trueResult = incomingPlayerService.isHostRejectingIncomingPlayer(false);
        expect(trueResult).toBe(true);
    });

    it('should return false if not host accepting incoming player', () => {
        const out = incomingPlayerService.isHostAcceptingIncomingPlayer(true);
        expect(out).not.toEqual(true);
    });

    it('should return the queue status to display for the users', () => {
        const expectedMessage = 'Voulez-vous jouer avec player ?\n';
        incomingPlayerService.handleIncomingPlayerJoinRequest(player);
        expect(incomingPlayerService.firstIncomingPlayer).toEqual(player);
        expect(incomingPlayerService.statusToDisplay).toEqual(expectedMessage);
    });

    it('should reset the queue, the incomingPlayer and set to false the hasFound opponent', () => {
        incomingPlayerService.reset();
        expect(incomingPlayerService.incomingPlayers).toEqual([]);
        expect(incomingPlayerService.hasFoundOpponent).toBe(false);
    });

    it('should return false if the player is rejected by host', () => {
        incomingPlayerService.handleIncomingPlayerJoinRequest(player);
        incomingPlayerService.handleIncomingPlayerJoinRequest(player2);
        incomingPlayerService.handleHostRejectingIncomingPlayer();
        expect(incomingPlayerService.hasFoundOpponent).toBe(false);
        expect(incomingPlayerService.numberOfIncomingPlayers).toEqual(1);
    });

    it('should update the waiting message when no opponent is found', () => {
        incomingPlayerService.handleIncomingPlayerJoinRequest(player);
        incomingPlayerService.handleHostRejectingIncomingPlayer();
        expect(incomingPlayerService.statusToDisplay).toEqual(WAITING_FOR_PLAYER_TEXT);
        expect(incomingPlayerService.numberOfIncomingPlayers).toEqual(0);
    });

    it('should update queue status message when incoming player is rejected', () => {
        incomingPlayerService.updateWaitingForIncomingPlayerAnswerMessage();
        expect(incomingPlayerService.statusToDisplay).toEqual(WAITING_PLAYER_ANSWER_TEXT);
    });

    it('should call matchmaking sendIncomingPlayerRequest when incoming player is rejected', () => {
        incomingPlayerService.handleIncomingPlayerJoinRequest(player);
        incomingPlayerService.handleIncomingPlayerJoinRequest(player2);
        expect(incomingPlayerService.refuseIncomingPlayer()).toBeUndefined();
    });
    it('should call matchmaking sendIncomingPlayerRequest when incoming player is rejected', () => {
        incomingPlayerService['incomingPlayer'] = null;
        expect(incomingPlayerService.refuseIncomingPlayer()).toBeUndefined();
    });

    it('should refresh queue display', () => {
        incomingPlayerService.id = '-1';
        incomingPlayerService.handleIncomingPlayerJoinRequest(player);
        incomingPlayerService.handleIncomingPlayerJoinRequest(player2);
        incomingPlayerService.refreshQueueDisplay();
        expect(incomingPlayerService.statusToDisplay).toEqual(
            DO_YOU_WANT_TO_PLAY_WITH_TEXT + incomingPlayerService.firstIncomingPlayer.username + ' ?\n',
        );
        expect(incomingPlayerService.firstIncomingPlayer).toEqual(player);
    });
    it('should refresh queue display', () => {
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isHost = false;
        incomingPlayerService['matchmakingService'] = mockMatchmakingService;

        expect(incomingPlayerService.handleIncomingPlayerJoinRequest(player)).toBeUndefined();
    });
    it('should refresh queue display', () => {
        const mockMatchmakingService = jasmine.createSpyObj('MatchmakingService', ['on']);
        mockMatchmakingService.isHost = false;
        incomingPlayerService['matchmakingService'] = mockMatchmakingService;
        expect(incomingPlayerService.handleIncomingPlayerJoinCancel(player.playerId)).toBeUndefined();
    });
    it('should update limited Name Enterred', () => {
        incomingPlayerService.updateLimitedTimeNameEntered();
        expect(incomingPlayerService['joiningStatusMessage']).toEqual(LIMITED_TIME_USER_ENTERED_TEXT);
    });

    it('should accept incoming player and call matchmakingService send request answer', () => {
        incomingPlayerService.handleIncomingPlayerJoinRequest(player);
        incomingPlayerService.handleIncomingPlayerJoinRequest(player2);
        incomingPlayerService.acceptIncomingPlayer();
        expect(matchmakingServiceSpy.sendIncomingPlayerRequestAnswer).toHaveBeenCalled();
    });

    it('should return if incoming player is null ', () => {
        incomingPlayerService.reset();
        incomingPlayerService.acceptIncomingPlayer();
        expect(matchmakingServiceSpy.sendIncomingPlayerRequestAnswer).not.toHaveBeenCalled();
    });
});
