import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
import { GameData } from '@common/interfaces/game.data';
import { MAX_GAMES_PER_PAGE } from '@common/utils/constants';

@Injectable({
    providedIn: 'root',
})
export class GamesService {
    currentPageNumber: number = 0;
    games: {
        gameData: GameData;
        originalImage: string;
        matchToJoinIfAvailable: string | null;
    }[];
    title: string;
    gamesNumber: number = 0;
    showNextButton = false;
    isLoading = true;

    showPreviousButton = false;

    constructor(private readonly communicationService: CommunicationService, private readonly socketService: SocketClientService) {}

    fetchGameDataFromServer(pageId: number): void {
        this.showNextButton = false;
        this.isLoading = true;
        const routeToSend = '/games/' + pageId.toString();
        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                if (response.body) {
                    this.isLoading = false;
                    const serverResult = JSON.parse(response.body);
                    this.games = serverResult.gameContent;
                    this.gamesNumber = serverResult.nbrOfGame;
                    this.showNextButton = this.gamesNumber - (this.currentPageNumber + 1) * MAX_GAMES_PER_PAGE > 0;
                }
            },
        });
    }

    deleteAll(isDeleteRequest: boolean): void {
        if (isDeleteRequest) {
            const routeToSend = '/games/allGames';
            this.communicationService.delete(routeToSend).subscribe({
                next: (response) => {
                    if (response.body) {
                        this.gamesNumber = 0;
                        this.reloadPage();
                    }
                },
            });
            this.socketService.socket.emit('deleteAllGames');
        }
    }

    deleteById(isDeleteRequest: boolean, id: string): void {
        if (isDeleteRequest) {
            const routeToSend = '/games/' + id;

            this.communicationService.delete(routeToSend).subscribe({
                next: (response) => {
                    if (response.body) {
                        this.reloadPage();
                    }
                },
            });
            this.socketService.socket.emit('deletedGame', { hasDeletedGame: true, id });
        }
    }

    resetById(isResetRequest: boolean, id: string): void {
        if (isResetRequest) {
            this.socketService.socket.emit('resetGame', { id });
            this.reloadPage();
        }
    }

    resetAll(isResetRequest: boolean): void {
        if (isResetRequest) {
            this.socketService.socket.emit('resetAllGames');
            this.reloadPage();
        }
    }

    changeGamePages(isNext: boolean): void {
        this.currentPageNumber = isNext ? this.currentPageNumber + 1 : this.currentPageNumber - 1;
        if (this.currentPageNumber > 0) {
            this.showPreviousButton = true;
        } else {
            this.showPreviousButton = false;
        }
        this.fetchGameDataFromServer(this.currentPageNumber);
    }

    reloadPage() {
        window.location.reload();
    }
}
