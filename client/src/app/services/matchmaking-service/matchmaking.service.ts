import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { Action } from '@common/classes/action';
import { Match } from '@common/classes/match';
import { Player } from '@common/classes/player';
import { MatchStatus } from '@common/enums/match.status';
import { MatchType } from '@common/enums/match.type';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MatchmakingService {
    sequence = new Observable<{ gameId: number; isGameInProgress: boolean }>();
    onMatchUpdated = new Action<Match | null>();
    onGetJoinRequest = new Action<Player>();
    onGetJoinCancel = new Action<string>();
    onGetJoinRequestAnswer = new Action<{ matchId: string; player: Player; isAccepted: boolean }>();
    onDeletedAllGames = new Action<string | null>();
    onDeletedSingleGame = new Action<string | null>();
    onResetAllGames = new Action<string | null>();
    onResetSingleGame = new Action<string | null>();
    matchIdThatWeAreTryingToJoin: string | null = null;
    gameIdThatWeAreTryingToJoin: string | null = null;
    currentMatch: Match | null;
    onSingleGameDeleted: Action<string | null>;
    onAllGameDeleted: Action<string | null>;
    currentSeeds: number[] = [];

    constructor(private readonly socketService: SocketClientService) {}

    get socketClientService() {
        return this.socketService;
    }
    get currentMatchPlayed() {
        return this.currentMatch;
    }

    get currentMatchId(): string {
        return this.currentMatch?.matchId as string;
    }

    get currentGameId(): string | undefined {
        return this.currentMatch?.gameId.toString();
    }

    get currentSocketId(): string {
        return this.socketService.socketId;
    }

    get isHost(): boolean {
        return !this.matchIdThatWeAreTryingToJoin;
    }

    get isPlayer1(): boolean {
        return this.socketService.socketId === this.player1Id;
    }

    get isOneVersusOne(): boolean {
        return this.currentMatch?.matchType === MatchType.OneVersusOne;
    }

    get isCoopMode(): boolean {
        return this.currentMatch?.matchType === MatchType.LimitedCoop;
    }
    get isLimitedTimeSolo() {
        return this.currentMatch?.matchType === MatchType.LimitedSolo;
    }

    get isSoloMode(): boolean {
        return this.currentMatch?.matchType === MatchType.Solo;
    }

    get player1Username(): string {
        return this.currentMatch?.player1?.username as string;
    }

    get player2Username(): string {
        return this.currentMatch?.player2?.username as string;
    }

    get player1Id(): string | undefined {
        return this.currentMatch?.player1?.playerId;
    }

    get player1(): Player | null | undefined {
        return this.currentMatch?.player1;
    }

    get player2(): Player | null | undefined {
        return this.currentMatch?.player2;
    }

    set currentMatchGame(match: Match) {
        this.currentMatch = match;
    }

    setCurrentMatchType(matchType: MatchType) {
        const matchId = this.currentSocketId;

        this.socketService.send<{ matchId: string; matchType: MatchType }>('setMatchType', { matchId, matchType });
    }

    setCurrentMatchPlayer(playerName: string) {
        if (!this.currentMatch) throw new Error('currentMatch is null');

        const matchId = this.currentMatch.matchId;
        const player = new Player(playerName, this.currentSocketId);

        this.socketService.send<{ matchId: string; player: Player }>('setMatchPlayer', {
            matchId,
            player,
        });
    }

    isMatchAborted(match: Match): boolean {
        return match.matchStatus === MatchStatus.Aborted;
    }

    connectSocket() {
        if (this.socketService.isSocketAlive) {
            this.disconnectSocket();
        }

        this.socketService.connect();
        this.handleMatchUpdateEvents();
    }

    handleMatchUpdateEvents() {
        this.socketService.on('matchUpdated', (data: Match) => {
            this.currentMatch = data;
            this.onMatchUpdated.invoke(this.currentMatch);
        });

        this.socketService.on('incomingPlayerRequest', (data: Player) => {
            this.onGetJoinRequest.invoke(data);
        });

        this.socketService.on('incomingPlayerCancel', (playerId: string) => {
            this.onGetJoinCancel.invoke(playerId);
        });

        this.socketService.on('incomingPlayerRequestAnswer', (data: { matchId: string; player: Player; isAccepted: boolean }) => {
            this.onGetJoinRequestAnswer.invoke(data);
        });

        this.socketService.on('allGamesDeleted', () => {
            this.onDeletedAllGames.invoke(null);
        });

        this.socketService.on('gameDeleted', (data: { hasDeletedGame: boolean; id: string }) => {
            this.onDeletedSingleGame.invoke(data.id);
        });

        this.socketService.on('allGamesReset', () => {
            this.onResetAllGames.invoke(null);
        });

        this.socketService.on('gameReset', (data: { hasResetGame: boolean; id: string }) => {
            this.onResetSingleGame.invoke(data.id);
        });
    }

    disconnectSocket() {
        this.socketService.disconnect();
        this.currentMatch = null;
        this.onMatchUpdated = new Action<Match | null>();
        this.onGetJoinRequest = new Action<Player>();
        this.onGetJoinCancel = new Action<string>();
        this.onGetJoinRequestAnswer = new Action<{ matchId: string; player: Player; isAccepted: boolean }>();
        this.onDeletedAllGames = new Action<string | null>();
        this.onDeletedSingleGame = new Action<string | null>();
        this.onResetAllGames = new Action<string | null>();
        this.onResetSingleGame = new Action<string | null>();
        this.onAllGameDeleted = new Action<string | null>();
        this.onSingleGameDeleted = new Action<string | null>();
        this.matchIdThatWeAreTryingToJoin = null;
        this.gameIdThatWeAreTryingToJoin = null;
    }

    createGame(gameId: string) {
        this.socketService.send<{ gameId: string }>('createMatch', { gameId });
        this.currentMatch = new Match(parseInt(gameId, 10), this.currentSocketId);
        this.matchIdThatWeAreTryingToJoin = null; // Host doesn't need to join
        this.gameIdThatWeAreTryingToJoin = null;
    }

    joinGame(matchId: string, gameId: string) {
        this.socketService.send<{ matchId: string }>('joinRoom', { matchId });
        this.matchIdThatWeAreTryingToJoin = matchId;
        this.gameIdThatWeAreTryingToJoin = gameId;
        this.currentMatch = null;
    }

    sendMatchJoinRequest(playerName: string) {
        if (!this.matchIdThatWeAreTryingToJoin) throw new Error('matchIdThatWeAreTryingToJoin is null');

        const matchId = this.matchIdThatWeAreTryingToJoin;
        const player = new Player(playerName, this.currentSocketId);

        this.socketService.send<{ matchId: string; player: Player }>('requestToJoinMatch', {
            matchId,
            player,
        });
    }

    sendMatchJoinCancel(playerName: string) {
        if (!this.matchIdThatWeAreTryingToJoin) throw new Error('matchIdThatWeAreTryingToJoin is null');

        const matchId = this.matchIdThatWeAreTryingToJoin;
        const player = new Player(playerName, this.currentSocketId);

        this.socketService.send<{ matchId: string; player: Player }>('cancelJoinMatch', {
            matchId,
            player,
        });
    }

    sendIncomingPlayerRequestAnswer(player: Player, isAccepted: boolean) {
        if (!this.currentMatch) throw new Error('currentMatch is null');

        const matchId = this.currentMatch.matchId;

        this.socketService.send<{ matchId: string; player: Player; isAccepted: boolean }>('sendIncomingPlayerRequestAnswer', {
            matchId,
            player,
            isAccepted,
        });
    }
}
