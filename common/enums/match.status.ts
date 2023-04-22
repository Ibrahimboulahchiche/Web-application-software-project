export enum MatchStatus {
    WaitingForPlayer1,
    WaitingForPlayer2,
    InProgress,
    Player1Win,
    Player2Win,
    Aborted,
    PlayersLose, // When timer reaches 0
}
