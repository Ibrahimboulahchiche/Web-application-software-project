export interface HistoryData {
    startingTime: string | null | Date;
    duration: string;
    gameMode: string;
    player1: string | undefined;
    player2: string | undefined;
    isWinByDefault: boolean;
    isGameLoose: boolean;
}
