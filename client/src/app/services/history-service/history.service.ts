import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { MatchType } from '@common/enums/match.type';
import { HistoryData } from '@common/interfaces/history.data';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    gameHistories: HistoryData[] = [];
    constructor(private readonly communicationService: CommunicationService) {}

    get history(): HistoryData[] {
        return this.gameHistories;
    }

    get isHistoryEmpty(): boolean {
        return this.gameHistories.length === 0;
    }

    fetchHistoryFromServer() {
        const routeToSend = '/history/';
        this.communicationService.get(routeToSend).subscribe({
            next: (response) => {
                if (response.body) {
                    const serverResult = JSON.parse(response.body).reverse();
                    this.formatHistoryData(serverResult);
                }
            },
        });
    }

    formatHistoryData(serverResult: unknown[]) {
        const datePipe = new DatePipe('en-US');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.gameHistories = serverResult.map((result: any) => {
            const gameHistory: HistoryData = {
                startingTime: result.startingTime,
                duration: result.duration,
                gameMode: this.convertGameModeToString(result.gameMode),
                player1:
                    result.gameMode === (MatchType.Solo || MatchType.LimitedSolo)
                        ? result.player1
                        : result.isPlayer1Victory
                        ? result.player1
                        : result.player2,
                player2:
                    result.gameMode === MatchType.Solo && !MatchType.LimitedSolo ? '' : result.isPlayer1Victory ? result.player2 : result.player1,
                isWinByDefault: result.isWinByDefault,
                isGameLoose: result.isGameLoose,
            };
            gameHistory.startingTime = datePipe.transform(gameHistory.startingTime, 'dd.MM.yyyy - HH:mm');
            if (gameHistory.gameMode === 'Temps Limité - Solo' && !result.isPlayer1Victory && result.player2) {
                gameHistory.player1 = result.lastPlayerStanding === result.player2 ? result.player2 : result.player1;
                gameHistory.player2 = result.lastPlayerStanding === result.player2 ? result.player1 : result.player2;
            }
            return gameHistory;
        });
    }

    convertGameModeToString(gameMode: number): string {
        switch (gameMode) {
            case MatchType.Solo:
                return 'Classique - Solo';
            case MatchType.OneVersusOne:
                return 'Classique - 1vs1';
            case MatchType.LimitedSolo:
                return 'Temps Limité - Solo';
            case MatchType.LimitedCoop:
                return 'Temps Limité - Coop';
            default:
                return 'Loading ...';
        }
    }

    deleteHistory() {
        const routeToSend = '/history/';
        this.communicationService.delete(routeToSend).subscribe({});
        this.reloadPage();
    }

    reloadPage() {
        window.location.reload();
    }
}
