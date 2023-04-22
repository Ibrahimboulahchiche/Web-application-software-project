export class Player {
    username: string;
    playerId: string; // this will be equal to the socket Id of the player

    constructor(username: string, playerId: string) {
        this.username = username;
        this.playerId = playerId;
    }
}
