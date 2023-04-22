import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DeleteGamesPopUpComponent } from '@app/components/pop-ups/delete-games-pop-up/delete-games-pop-up.component';
import { GamesService } from '@app/services/games-service/games.service';
import { MatchmakingService } from '@app/services/matchmaking-service/matchmaking.service';
import { SocketClientService } from '@app/services/socket-client-service/socket-client.service';
@Component({
    selector: 'app-games-display',
    templateUrl: './games-display.component.html',
    styleUrls: ['./games-display.component.scss'],
})
export class GamesDisplayComponent implements OnInit, OnDestroy {
    @Input() isSelection: boolean;
    @ViewChild('deletePopUpElement') deletePopUpElement: DeleteGamesPopUpComponent;
    @ViewChild('resetPopUpElement') resetPopUpElement: DeleteGamesPopUpComponent;
    title: string;

    constructor(
        private readonly gamesService: GamesService,
        private readonly matchmakingService: MatchmakingService,
        private readonly socketService: SocketClientService,
    ) {}

    get theGamesService(): GamesService {
        return this.gamesService;
    }

    ngOnInit() {
        this.title = this.isSelection ? 'Page de configuration' : 'Page de selection';
        this.gamesService.fetchGameDataFromServer(this.gamesService.currentPageNumber);
        this.matchmakingService.connectSocket();
        this.addServerSocketMessagesListeners();
    }

    ngOnDestroy() {
        this.gamesService.currentPageNumber = 0;
        this.gamesService.showNextButton = false;
        this.gamesService.showPreviousButton = false;
    }

    addServerSocketMessagesListeners() {
        this.socketService.on('gameProgressUpdate', (data: { gameId: number; matchToJoinIfAvailable: string | null }) => {
            this.updateGameAvailability(data.gameId, data.matchToJoinIfAvailable);
        });

        this.socketService.on('actionOnGameReloadingThePage', () => {
            const pathSegments = window.location.href.split('/');
            const pageName = pathSegments[pathSegments.length - 1];

            if (pageName === 'selections' || pageName === 'config') {
                this.reloadPage();
            }
        });
    }

    updateGameAvailability(gameId: number, matchToJoinIfAvailable: string | null) {
        for (const game of this.gamesService.games) {
            if (game.gameData.id.toString() === gameId.toString()) {
                game.matchToJoinIfAvailable = matchToJoinIfAvailable;
                break;
            }
        }
    }
    reloadPage() {
        window.location.reload();
    }
}
