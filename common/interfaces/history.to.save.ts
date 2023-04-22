import { MatchType } from '@common/enums/match.type';

export interface HistoryToSave {
    startingTime: Date;
    gameMode: MatchType | undefined;
    duration: string;
    player1: string | undefined;
    player2: string | undefined;
    isWinByDefault: boolean;
    isPlayer1Victory: boolean;
    isGameLoose: boolean;
    lastPlayerStanding: string | undefined;
}
