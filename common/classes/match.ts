import { MatchStatus } from '../enums/match.status';
import { MatchType } from '../enums/match.type';
import { Player } from './player';

export class Match {
    gameId: number;
    matchId: string;
    player1: Player | null;
    player2: Player | null;
    matchType: MatchType;
    matchStatus: MatchStatus;
    player1Archive: Player | null; // Keep the value of the player
    player2Archive: Player | null; // Keep the value of the player

    constructor(gameId: number, matchId: string) {
        this.gameId = gameId;
        this.matchId = matchId;
        this.matchStatus = MatchStatus.WaitingForPlayer1;
    }
}
